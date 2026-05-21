/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CoreConst,
  getAppCookie,
  HttpError,
  OrgData,
} from '@ibiz-template/core';
import { mergeDeepRight } from 'ramda';
import { AppHooks } from '@ibiz-template/vue3-util';
import { updateDevToolConfig } from '@ibiz-template/devtool';
import { IApplication, IAppView } from '@ibiz/model-core';
import { AuthGuardHooks } from '../auth-guard-hooks';

export class AuthGuard {
  /**
   * @description 总的入口校验
   * @param {IParams} appContext
   * @param {boolean} [permission=true]
   * @returns {*}  {Promise<boolean>}
   * @memberof AuthGuard
   */
  async verify(
    appContext: IParams,
    permission: boolean = true,
  ): Promise<boolean> {
    if (permission) {
      let result = true;
      try {
        if (ibiz.env.enableAnonymous) {
          await this.anonymousValidate(appContext);
        } else {
          await this.appInit(appContext);
        }
      } catch (error) {
        result = false;
        (error as HttpError).tag = 'APPINIT';
        ibiz.util.error.handle(error);
      }
      return result;
    }
    // 匿名用户登录成功后，再执行应用参数初始化逻辑，登录页能使用当前应用模型
    if (ibiz.env.enableAnonymous) {
      try {
        await this.anonymousValidate(appContext);
      } catch (error) {
        (error as HttpError).tag = 'APPINIT';
        ibiz.util.error.handle(error);
        return false;
      }
    } else {
      await this.initModel(appContext, false);
    }
    return true;
  }

  /**
   * @description 加载应用数据
   * @param {IParams} [context]
   * @returns {*}  {Promise<void>}
   * @memberof AuthGuard
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
      ibiz.appData.context.modeldesigndefaultmode = 'close';
      // 路径查询参数如存在srfignoredevtool=true，则不识别appdata返回的devtool配置
      if (
        window.location.search &&
        window.location.search.indexOf('srfignoredevtool=true') !== -1
      )
        return;
      updateDevToolConfig();
    }
  }

  /**
   * @description 加载组织数据
   * @returns {*}  {Promise<void>}
   * @memberof AuthGuard
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

  /**
   * @description 加载主题插件
   * @returns {*}  {Promise<void>}
   * @memberof AuthGuard
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
   * @description 根据应用自定义参数解析成环境变量
   * @param {IApplication} app
   * @returns {*}  {Promise<void>}
   * @memberof AuthGuard
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

  /**
   * @description 初始化模型
   * @param {IParams} context
   * @param {boolean} [_permission=true]
   * @returns {*}  {Promise<void>}
   * @memberof AuthGuard
   */
  async initModel(
    context: IParams,
    _permission: boolean = true,
  ): Promise<void> {
    // 子类实现
  }

  /**
   * @description 应用参数初始化
   * @param {IParams} context
   * @returns {*}  {Promise<void>}
   * @memberof AuthGuard
   */
  async appInit(context: IParams): Promise<void> {
    await AppHooks.beforeInitApp.call({ context });
    await AuthGuardHooks.beforeAuth.call(null, null);
    if (ibiz.env.isSaaSMode === true) {
      await this.loadOrgData();
    }
    await this.loadAppData(context);
    await AuthGuardHooks.afterAuth.call(null, null);
    await AppHooks.authedApp.call({ context });
    await this.initModel(context);
    await ibiz.auth.extendLogin(context);
    await ibiz.hub.notice.init();
  }

  /**
   * @description 抛401异常
   */
  throw401(): void {
    throw new HttpError({
      response: {
        status: 401,
        statusText: ibiz.i18n.t('mobApp.authGuard.noPermission'),
      },
    } as any);
  }

  /**
   * @description 匿名登录
   * @param {IParams} context
   * @returns {*}  {Promise<void>}
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
            await ibiz.auth.refreshToken();
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
            this.throw401();
            return;
          }
          await this.appInit(context);
        } else {
          throw error;
        }
      }
    }

    // 匿名用户登录成功后，再执行应用参数初始化逻辑，登录页能使用当前应用模型
    if (!authInfo || !authInfo.token) {
      const loginResult = await ibiz.auth.anonymousLogin();
      if (!loginResult) {
        this.throw401();
        return;
      }
      await this.appInit(context);
    }

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
    }
  }

  async initTheme(appModel: IApplication): Promise<void> {
    const module = await import('@ibiz-template/mob-theme');
    const theme = module.default || module;
    AppHooks.useComponent.callSync(null, theme);
    if (ibiz.config.theme) ibiz.util.theme.setTheme(ibiz.config.theme);
    if (appModel.appUIThemes) {
      await this.loadTheme();
    }
  }
}
