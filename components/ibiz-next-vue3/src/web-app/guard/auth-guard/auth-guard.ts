/* eslint-disable no-useless-catch */
import {
  CoreConst,
  getAppCookie,
  HttpError,
  OrgData,
  RuntimeError,
} from '@ibiz-template/core';
import { IAppView, IApplication } from '@ibiz/model-core';
import { mergeDeepRight } from 'ramda';
import { ModelLoaderProvider } from '@ibiz-template/runtime';
import { AppHooks } from '@ibiz-template/vue3-util';
import { updateDevToolConfig } from '@ibiz-template/devtool';

export class AuthGuard {
  /**
   * 是否是全代码模式
   * @author lxm
   * @date 2024-02-21 11:16:08
   * @type {boolean}
   */
  isFullCode: boolean = false;

  /**
   * 自定义模型加载
   * @author lxm
   * @date 2024-02-21 11:16:17
   * @type {ModelLoaderProvider}
   */
  customModelLoader?: ModelLoaderProvider;

  constructor(opts?: {
    isFullCode: boolean;
    customModelLoader: ModelLoaderProvider;
  }) {
    this.isFullCode = opts?.isFullCode || false;
    this.customModelLoader = opts?.customModelLoader || undefined;

    if (this.customModelLoader) {
      ibiz.hub.registerModelLoaderProvider(this.customModelLoader);
    }
  }

  /**
   * 总的入口校验
   *
   * @author tony001
   * @date 2024-11-12 14:11:32
   * @param {IParams} context
   * @param {boolean} [notLogin=true]
   * @return {*}  {Promise<boolean>}
   */
  async verify(context: IParams, notLogin: boolean = true): Promise<boolean> {
    if (notLogin) {
      let result = true;

      try {
        // 开启匿名模式的时候，进行匿名相关的校验和处理
        if (ibiz.env.enableAnonymous) {
          await this.anonymousValidate(context);
        } else {
          await this.appInit(context);
        }
      } catch (error) {
        result = false;
        (error as HttpError).tag = 'APPINIT';
        ibiz.util.error.handle(error);
      }
      return result;
    }
    await this.initModel(context, false);
    return true;
  }

  /**
   * 匿名登录相关校验逻辑，不通过会抛异常
   *
   * @author tony001
   * @date 2024-11-12 14:11:27
   * @param {IParams} context
   * @return {*}  {Promise<void>}
   */
  async anonymousValidate(context: IParams): Promise<void> {
    const authInfo = ibiz.auth.getAuthInfo();
    if (authInfo && !authInfo.isAnonymous) {
      try {
        // 有正常用户已经登录的情况，直接跳过后续逻辑
        await this.appInit(context);
        return;
      } catch (error) {
        const { status } = error as HttpError;
        if (status === 401) {
          // 存在refreshToken时，通过refreshToken换算新的token，反之，则走匿名登录
          const refreshToken = getAppCookie(CoreConst.REFRESH_TOKEN);
          if (refreshToken) {
            // 刷新token失败，若启用匿名登录，则转化为匿名登录，再走后续逻辑
            try {
              await ibiz.auth.refreshToken();
            } catch (refreshTokenError: unknown) {
              if (ibiz.env.enableAnonymous) {
                const loginResult = await ibiz.auth.anonymousLogin();
                if (!loginResult) {
                  throw error;
                }
              } else {
                throw error;
              }
            }
            await this.appInit(context);
            return;
          }
          ibiz.auth.clearAuthData();
        } else {
          throw error;
        }
      }
    }

    // 匿名模式下已经登录过，直接走应用参数初始化逻辑
    if (authInfo?.token) {
      try {
        await this.appInit(context);
      } catch (error) {
        const { status } = error as HttpError;
        if (status === 401) {
          const loginResult = await ibiz.auth.anonymousLogin();
          if (!loginResult) {
            throw new RuntimeError(ibiz.i18n.t('webApp.authGuard.loginFailed'));
          }
          await this.appInit(context);
        } else {
          throw error;
        }
      }
      return;
    }

    // 匿名用户模式的处理
    // 未登录过加载simple模型
    await this.initModel(context, false);

    const urlPaths = window.location.hash.split('/');
    const viewName = urlPaths[urlPaths.length - 2];
    let viewModel: IAppView | undefined;
    try {
      if (['#', 'index'].includes(viewName) && ibiz.hub.defaultPage) {
        // 未指定具体页面，通过应用默认页获取viewName
        viewModel = await ibiz.hub.getAppView(ibiz.hub.defaultPage.id);
      } else {
        // 指定具体页面，通过路由获取viewName
        viewModel = await ibiz.hub.getAppView(viewName);
      }
    } catch (error) {
      ibiz.log.error(error);
    }
    if (!viewModel) {
      // 找不到视图说明没有配置匿名访问的视图
      ibiz.log.error(
        `找不到视图模型${viewName},请确保该视图配置了匿名访问和用户引用`,
      );
      this.throw401();
      return;
    }

    // 非匿名用户能访问的视图直接抛出401
    if (viewModel.accUserMode !== 3) {
      this.throw401();
      return;
    }

    // 匿名用户登录
    if (!authInfo) {
      const loginResult = await ibiz.auth.anonymousLogin();
      if (!loginResult) {
        throw new RuntimeError(ibiz.i18n.t('webApp.authGuard.loginFailed'));
      }
    }
    // 匿名用户登录成功后，再执行应用参数初始化逻辑
    await this.appInit(context);
  }

  /**
   * 应用参数初始化
   *
   * @author tony001
   * @date 2024-11-12 14:11:06
   * @param {IParams} context
   * @return {*}  {Promise<void>}
   */
  async appInit(context: IParams): Promise<void> {
    await AppHooks.beforeInitApp.call({ context });
    try {
      if (ibiz.env.isSaaSMode === true) {
        await this.loadOrgData();
      }
      await this.loadAppData(context);
      await AppHooks.authedApp.call({ context });
    } catch (error: unknown) {
      const responseStatus = (error as HttpError).status;
      const remember = getAppCookie(CoreConst.TOKEN_REMEMBER);
      const refreshToken = getAppCookie(CoreConst.REFRESH_TOKEN);
      // 当记住我为真、refreshToken存在、初始化请求401同时满足，则需要通过refreshToken换算token并重新加载，反之，走标准处理
      if (
        responseStatus === 401 &&
        remember &&
        refreshToken != null &&
        refreshToken !== ''
      ) {
        try {
          // 刷新token失败，若启用匿名登录，则转化为匿名登录，再走后续逻辑
          try {
            await ibiz.auth.refreshToken();
          } catch (refreshTokenError: unknown) {
            if (ibiz.env.enableAnonymous) {
              const loginResult = await ibiz.auth.anonymousLogin();
              if (!loginResult) {
                throw error;
              }
            } else {
              throw error;
            }
          }
          if (ibiz.env.isSaaSMode === true) {
            await this.loadOrgData();
          }
          await this.loadAppData(context);
          await AppHooks.authedApp.call({ context });
        } catch (refreshTokenError: unknown) {
          throw error;
        }
      } else {
        throw error;
      }
    }
    await this.initModel(context);
    // 快到过期时间自动换算token
    await ibiz.auth.extendLogin(context);
    await ibiz.hub.notice.init();
    await ibiz.util.theme.initCustomTheme();
  }

  /**
   * 初始化模型
   *
   * @author tony001
   * @date 2024-11-12 14:11:43
   * @param {IParams} context
   * @param {boolean} [_permission=true]
   * @return {*}  {Promise<void>}
   */
  async initModel(
    context: IParams,
    _permission: boolean = true,
  ): Promise<void> {
    // 子类实现
  }

  /**
   * 加载应用数据
   *
   * @author tony001
   * @date 2024-12-19 20:12:01
   * @param {IParams} [context]
   * @return {*}  {Promise<void>}
   */
  async loadAppData(context?: IParams): Promise<void> {
    let res;
    if (context && Object.keys(context).length > 0) {
      res = await ibiz.net.get('/appdata', context);
    } else {
      res = await ibiz.net.get('/appdata');
    }
    if (res.ok) {
      ibiz.appData = res.data;
      updateDevToolConfig();
    }
  }

  /**
   * 加载组织数据
   *
   * @author chitanda
   * @date 2022-07-20 20:07:44
   * @return {*}  {Promise<void>}
   */
  async loadOrgData(): Promise<void> {
    const res = await ibiz.net.get(`/uaa/getbydcsystem/${ibiz.env.dcSystem}`);
    if (res.ok) {
      const orgDataItems = res.data as OrgData[];
      if (orgDataItems) {
        const [data] = orgDataItems;
        ibiz.orgData = data;
      }
    }
  }

  async initTheme(appModel: IApplication): Promise<void> {
    const module = await import('@ibiz-template/web-theme');
    const theme = module.default || module;
    AppHooks.useComponent.callSync(null, theme);
    if (appModel.appUIThemes) {
      await this.loadTheme();
    }
  }

  /**
   * 加载主题插件
   *
   * @author chitanda
   * @date 2023-12-03 01:12:38
   * @protected
   * @return {*}  {Promise<void>}
   */
  async loadTheme(): Promise<void> {
    const app = ibiz.hub.getApp();
    const uiThemes = app.model.appUIThemes || [];
    if (uiThemes.length > 0) {
      // 加载颜色主题
      const colorThemes = uiThemes.filter(uiTheme => {
        return (
          uiTheme.themeParams && uiTheme.themeParams['icon-theme'] !== 'true'
        );
      });
      if (colorThemes.length > 0) {
        for (let index = 0; index < colorThemes.length; index++) {
          const colorTheme = colorThemes[index];
          // eslint-disable-next-line no-await-in-loop
          await ibiz.util.theme.loadTheme(colorTheme);
        }
      }
      // 加载图标主题
      const iconThemes = uiThemes.filter(uiTheme => {
        return (
          uiTheme.themeParams && uiTheme.themeParams['icon-theme'] === 'true'
        );
      });
      if (iconThemes.length > 0) {
        for (let index = 0; index < iconThemes.length; index++) {
          const iconTheme = iconThemes[index];
          // eslint-disable-next-line no-await-in-loop
          await ibiz.util.theme.loadTheme(iconTheme, 'ICON');
        }
      }
    }
  }

  /**
   * 根据应用自定义参数解析成环境变量
   *
   * @author chitanda
   * @date 2023-11-24 19:11:50
   * @return {*}  {Promise<void>}
   */
  async initEnvironment(app: IApplication): Promise<void> {
    const userParam = app.userParam;
    if (userParam) {
      Object.keys(userParam).forEach(key => {
        const value = ibiz.util.rawValue.format(userParam[key]);
        const keys = key.split('.');
        let currentObj = ibiz.env as IData;
        for (let i = 0; i < keys.length; i++) {
          const k = keys[i];
          if (i === keys.length - 1) {
            currentObj[k] = value;
          } else {
            currentObj[k] = currentObj[k] || {};
            currentObj = currentObj[k];
          }
        }
      });
      if (ibiz.env.globalConfig) {
        ibiz.config = mergeDeepRight(ibiz.config, ibiz.env.globalConfig);
      }
      // 重新设置日志级别
      ibiz.log.setLevel(ibiz.env.logLevel);
    }
  }

  throw401(): void {
    throw new HttpError({
      response: {
        status: 401,
        statusText: ibiz.i18n.t('webApp.authGuard.noPermission'),
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  }
}
