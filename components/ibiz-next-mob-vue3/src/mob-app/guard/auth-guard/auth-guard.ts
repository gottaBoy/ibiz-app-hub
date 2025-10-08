/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CoreConst,
  getAppCookie,
  HttpError,
  OrgData,
} from '@ibiz-template/core';
import { ModelHelper } from '@ibiz-template/model-helper';
import { mergeDeepRight } from 'ramda';
import { AppHooks } from '@ibiz-template/vue3-util';
import { updateDevToolConfig } from '@ibiz-template/devtool';
import { IAppView } from '@ibiz/model-core';
import { i18n } from '../../../locale';
import { AuthGuardHooks } from '../auth-guard-hooks';

/**
 * 加载应用数据
 *
 * @author chitanda
 * @date 2022-07-20 20:07:50
 * @return {*}  {Promise<void>}
 */
async function loadAppData(context?: IParams): Promise<void> {
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
async function loadOrgData(): Promise<void> {
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
 * 加载主题插件
 *
 * @author chitanda
 * @date 2023-12-03 01:12:38
 * @protected
 * @return {*}  {Promise<void>}
 */
async function loadTheme(): Promise<void> {
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
      const colorTheme = colorThemes[0];
      await ibiz.util.theme.loadTheme(colorTheme);
    }
    // 加载图标主题
    const iconThemes = uiThemes.filter(uiTheme => {
      return (
        uiTheme.themeParams && uiTheme.themeParams['icon-theme'] === 'true'
      );
    });
    if (iconThemes.length > 0) {
      const iconTheme = iconThemes[0];
      await ibiz.util.theme.loadTheme(iconTheme, 'ICON');
    }
  }
}

let helper: ModelHelper | undefined;

/**
 * 根据应用自定义参数解析成环境变量
 *
 * @author chitanda
 * @date 2023-11-24 19:11:50
 * @return {*}  {Promise<void>}
 */
async function initEnvironment(): Promise<void> {
  if (helper) {
    const app = await helper.getAppModel();
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
}

/**
 * 初始化模型
 *
 * @author tony001
 * @date 2024-11-12 18:11:26
 * @param {IParams} appContext
 * @param {boolean} [permission=true] 无权限和有权限的模型
 * @return {*}  {Promise<void>}
 */
async function initModel(
  context: IParams,
  permission: boolean = true,
): Promise<void> {
  if (!helper) {
    helper = new ModelHelper(
      async url => {
        if (ibiz.env.isLocalModel) {
          const res = await ibiz.net.getModel(`./model${url}`);
          return res.data;
        }
        const res = await ibiz.net.get(
          `${ibiz.env.remoteModelUrl}${url}`,
          undefined,
          permission ? {} : { srfdcsystem: ibiz.env.dcSystem },
        );
        return res.data;
      },
      ibiz.env.appId,
      context,
      permission,
    );
    const app = await ibiz.hub.getAppAsync(ibiz.env.appId);
    await initEnvironment();
    await AppHooks.initedApp.call({ context, app });
    const appModel = app.model;
    ibiz.env.isMob = appModel.mobileApp === true;
    if (ibiz.env.isEnableMultiLan) {
      const lang = ibiz.i18n.getLang();
      const m = await helper.getPSAppLang(lang.replace('-', '_').toUpperCase());
      const items = m.languageItems || [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: any = {};
      items.forEach(item => {
        data[item.lanResTag!] = item.content;
      });
      i18n.global.mergeLocaleMessage(lang, data);
    }

    const module = await import('@ibiz-template/mob-theme');
    const theme = module.default || module;
    AppHooks.useComponent.callSync(null, theme);
    if (ibiz.config.theme) ibiz.util.theme.setTheme(ibiz.config.theme);
    if (appModel.appUIThemes) {
      await loadTheme();
    }
    // 设置浏览器标题
    if (app.model.title) {
      ibiz.util.setBrowserTitle('');
    }
  }
}

/**
 * 应用参数初始化
 *
 * @author tony001
 * @date 2024-11-12 18:11:00
 * @param {IParams} context
 * @return {*}  {Promise<void>}
 */
async function appInit(context: IParams): Promise<void> {
  await AppHooks.beforeInitApp.call({ context });
  await AuthGuardHooks.beforeAuth.call(null, null);
  if (ibiz.env.isSaaSMode === true) {
    await loadOrgData();
  }
  await loadAppData(context);
  await AuthGuardHooks.afterAuth.call(null, null);
  await AppHooks.authedApp.call({ context });
  await initModel(context);
  await ibiz.auth.extendLogin(context);
  await ibiz.hub.notice.init();
}

/**
 * @description 抛401异常
 */
function throw401(): void {
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
async function anonymousValidate(context: IParams): Promise<void> {
  const authInfo = ibiz.auth.getAuthInfo();
  if (authInfo && !authInfo.isAnonymous) {
    try {
      // 有正常用户已经登录的情况，直接跳过后续逻辑
      await appInit(context);
      return;
    } catch (error) {
      const { status } = error as HttpError;
      if (status === 401) {
        // 存在refreshToken时，通过refreshToken换算新的token，反之，则走匿名登录
        const refreshToken = getAppCookie(CoreConst.REFRESH_TOKEN);
        if (refreshToken) {
          await ibiz.auth.refreshToken();
          await appInit(context);
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
      await appInit(context);
    } catch (error) {
      const { status } = error as HttpError;
      if (status === 401) {
        const loginResult = await ibiz.auth.anonymousLogin();
        if (!loginResult) {
          throw401();
          return;
        }
        await appInit(context);
      } else {
        throw error;
      }
    }
  }

  // 匿名用户登录成功后，再执行应用参数初始化逻辑，登录页能使用当前应用模型
  if (!authInfo || !authInfo.token) {
    const loginResult = await ibiz.auth.anonymousLogin();
    if (!loginResult) {
      throw401();
      return;
    }
    await appInit(context);
  }

  const urlPaths = window.location.hash.split('/');
  const viewName = urlPaths[urlPaths.length - 2];
  let viewModel: IAppView | undefined;
  try {
    if (viewName === '#' && ibiz.hub.defaultPage) {
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
    throw401();
    return;
  }

  // 非匿名用户能访问的视图直接抛出401
  if (viewModel.accUserMode !== 3) {
    throw401();
  }
}

/**
 * 应用权限守卫
 *
 * @author tony001
 * @date 2024-11-12 18:11:07
 * @export
 * @param {IParams} appContext
 * @param {boolean} [permission=true]
 * @return {*}  {Promise<boolean>}
 */
export async function AuthGuard(
  appContext: IParams,
  permission: boolean = true,
): Promise<boolean> {
  if (permission) {
    let result = true;
    try {
      if (ibiz.env.enableAnonymous) {
        await anonymousValidate(appContext);
      } else {
        await appInit(appContext);
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
      await anonymousValidate(appContext);
    } catch (error) {
      (error as HttpError).tag = 'APPINIT';
      ibiz.util.error.handle(error);
      return false;
    }
  } else {
    await initModel(appContext, false);
  }
  return true;
}
