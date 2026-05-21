/* eslint-disable no-prototype-builtins */
/* eslint-disable no-unsafe-finally */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-shadow */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Router } from 'vue-router';
import {
  IAppUtil,
  IAuthResult,
  getDeACMode,
  IAiChatParam,
  calcDeCodeNameById,
  IApiViewController,
  RouteConst,
} from '@ibiz-template/runtime';
import { IChatMessage } from '@ibiz-template/core';
import {
  route2routePath,
  routePath2string,
  useUIStore,
} from '@ibiz-template/vue3-util';

export class AppUtil implements IAppUtil {
  /**
   * @description 视图缓存中心
   * @type {Map<string, IApiViewController>}
   * @memberof AppUtil
   */
  viewCacheCenter: Map<string, IApiViewController> = new Map();

  /**
   * Creates an instance of AppUtil.
   * @author tony001
   * @date 2024-05-14 17:05:00
   * @param {Router} router
   */
  constructor(public router: Router) {}

  /**
   * @description 注册导航结束事件
   * @param {(form: string, to: string) => void} [callBack]
   * @memberof AppUtil
   */
  registerEventOnNavEnd(callBack: (form: string, to: string) => void): void {
    this.router.afterEach((form, to) => {
      if (callBack) callBack(form.fullPath, to.fullPath);
    });
  }

  /**
   * @description 注册路由导航完成关闭模态类视图
   */
  registerAutoCloseOnNavEnd(): void {
    if (!ibiz.config.common.autoCloseModalView || !this.router) return;
    this.router.afterEach(to => {
      if (this.viewCacheCenter.size === 0) return;
      // 打开目标视图类型是路由模态视图则不做处理
      if (
        to &&
        to.path &&
        to.path.indexOf(`/${RouteConst.ROUTE_MODAL_TAG}`) !== -1
      ) {
        return;
      }
      const cacheViews = [...this.viewCacheCenter.values()];
      const validModalViews = cacheViews.filter((view: IData) => {
        return (
          view &&
          view.state.isDestroyed === false &&
          view.modal &&
          view.modal.viewUsage === 2
        );
      });
      if (validModalViews.length === 0) return;
      setTimeout(() => {
        validModalViews.forEach(
          (view: IApiViewController) =>
            view && view.closeView && view.closeView(),
        );
      }, 0);
    });
  }

  /**
   * @description 路由是否初始化构建完成
   * @returns {*}  {Promise<void>}
   * @memberof AppUtil
   */
  async onRouteIsReady(): Promise<void> {
    return this.router.isReady();
  }

  /**
   * 登录
   *
   * @author tony001
   * @date 2024-05-14 16:05:41
   * @param {string} loginName
   * @param {string} password
   * @param {(boolean | undefined)} [remember]
   * @param {(IData | undefined)} [headers]
   * @param {(IData | undefined)} [opts]
   * @return {*}  {Promise<boolean>}
   */
  async login(
    loginName: string,
    password: string,
    remember?: boolean | undefined,
    headers?: IData | undefined,
    opts?: IData | undefined,
  ): Promise<boolean> {
    const bol = await ibiz.auth.login(loginName, password, remember, headers);
    if (bol === true) {
      window.location.hash =
        (this.router.currentRoute.value.query.ru as string) || '/';
      // 重置会话记录state,防止直接返回到登录页
      window.history.pushState({}, '');
      window.location.reload();
    }
    return bol;
  }

  /**
   * 登出
   *
   * @author tony001
   * @date 2024-05-14 16:05:02
   * @param {(IData | undefined)} [opts]
   * @return {*}  {Promise<boolean>}
   */
  async logout(opts?: IData | undefined): Promise<boolean> {
    const bol = await ibiz.auth.logout();
    if (bol) {
      const path = window.location;
      if (path.search.indexOf('isAnonymous=true') !== -1) {
        const href = `${path.origin}${path.pathname}${path.hash}`;
        window.history.replaceState({}, '', href);
      }
      await this.router.push(
        // `/login?ru=${encodeURIComponent(
        //   window.location.hash.replace('#/', '/'),
        // )}`,
        '/login',
      );
      ibiz.util.showAppLoading();
      window.location.reload();
    }
    return bol;
  }

  /**
   * 变更密码
   *
   * @author tony001
   * @date 2024-05-14 16:05:11
   * @param {string} oldPwd
   * @param {string} newPwd
   * @param {(IData | undefined)} [opts]
   * @return {*}  {Promise<boolean>}
   */
  async changePwd(
    oldPwd: string,
    newPwd: string,
    opts?: IData | undefined,
  ): Promise<IAuthResult> {
    if (this.validatePwd(oldPwd, newPwd, opts)) {
      const result = await ibiz.auth.changePwd(oldPwd, newPwd);
      return result;
    }
    return { ok: false, result: {} };
  }

  /**
   * 切换组织
   *
   * @author tony001
   * @date 2024-05-14 16:05:20
   * @param {string} oldOrgId
   * @param {string} newOrgId
   * @param {(IData | undefined)} [opts]
   * @return {*}  {Promise<boolean>}
   */
  switchOrg(
    oldOrgId: string,
    newOrgId: string,
    opts?: IData | undefined,
  ): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  /**
   * 切换主题
   *
   * @author tony001
   * @date 2024-05-14 16:05:30
   * @param {string} oldTheme
   * @param {string} newTheme
   * @param {(IData | undefined)} [opts]
   * @return {*}  {Promise<boolean>}
   */
  switchTheme(
    oldTheme: string,
    newTheme: string,
    opts?: IData | undefined,
  ): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  /**
   * 切换语言
   *
   * @author tony001
   * @date 2024-05-14 16:05:42
   * @param {string} oldLanguage
   * @param {string} newLanguage
   * @param {(IData | undefined)} [opts]
   * @return {*}  {Promise<boolean>}
   */
  switchLanguage(
    oldLanguage: string,
    newLanguage: string,
    opts?: IData | undefined,
  ): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  /**
   * 获取应用上下文
   *
   * @return {*}  {(IParams | undefined)}
   * @memberof AppUtil
   */
  getAppContext(): IParams | undefined {
    const routePath = route2routePath(this.router.currentRoute.value as any);
    return routePath.appContext;
  }

  /**
   * 校验密码
   *
   * @author tony001
   * @date 2024-05-14 17:05:31
   * @protected
   * @param {string} oldPwd
   * @param {string} newPwd
   * @param {IData} [opts={}]
   * @return {*}  {boolean}
   */
  protected validatePwd(
    oldPwd: string,
    newPwd: string,
    opts: IData = {},
  ): boolean {
    const { surePwd } = opts;
    if (!oldPwd) {
      ibiz.message.error('原密码不能为空');
      return false;
    }
    if (!newPwd) {
      ibiz.message.error('新密码不能为空');
      return false;
    }
    if (!surePwd) {
      ibiz.message.error('确认密码不能为空');
      return false;
    }
    if (oldPwd === newPwd) {
      ibiz.message.error('新密码不能与旧密码一致');
      return false;
    }
    if (newPwd !== surePwd) {
      ibiz.message.error('两次密码不一致');
      return false;
    }
    return true;
  }

  /**
   * 打开AI聊天
   *
   * @param {IAiChatParam} chartParams
   * @return {*}  {Promise<IChatMessage[]>}
   * @memberof AppUtil
   */
  async openAiChat(chartParams: IAiChatParam): Promise<IChatMessage[]> {
    const {
      data,
      view,
      ctrl,
      params,
      context,
      appDEACModeId,
      appDataEntityId,
    } = chartParams;
    const deACMode = await getDeACMode(
      appDEACModeId,
      appDataEntityId,
      context.srfappid,
    );
    if (!deACMode) return Promise.resolve([]);
    const chatInstance = await ibiz.aiChatUtil.getAIChat();
    const appDataEntityName = calcDeCodeNameById(appDataEntityId!);
    let topicId = `${appDataEntityId}@${appDEACModeId}@`;
    topicId += context[appDataEntityName]
      ? context[appDataEntityName]
      : 'default';
    const sessionid = ibiz.aiChatUtil.getChatSessionId('TOPIC', topicId);
    const topicCaption = `[${deACMode.logicName}]${data?.srfmajortext || ''}`;
    const tempParams = { ...params, ...{ srfactag: deACMode.codeName } };
    const { zIndex } = useUIStore();
    const containerZIndex = zIndex.increment();
    const { containerOptions, topicOptions, chatOptions } =
      await ibiz.aiChatUtil.getUIActionExAIChatParams(
        context,
        params,
        data,
        deACMode,
        { chatInstance, view, ctrl },
      );
    const resourceOptions = await ibiz.aiChatUtil.getAIResourceOptions(
      context,
      params,
    );
    return new Promise(resolve => {
      chatInstance.create({
        mode: 'TOPIC',
        resourceOptions,
        containerOptions: {
          zIndex: containerZIndex,
          enableBackFill: false,
          ...containerOptions,
        },
        topicOptions: {
          appid: ibiz.env.appId,
          id: topicId,
          caption: topicCaption,
          url: window.location.hash.substring(1),
          type: context.srftopicpath || 'default',
          ...topicOptions,
        },
        chatOptions: {
          caption: deACMode.logicName,
          context: { ...context },
          params: tempParams,
          appDataEntityId,
          sessionid,
          // 扩展参数
          ...chatOptions,
          // 关闭回调
          closed: (
            context: IContext,
            params: IParams,
            messages: IChatMessage[],
          ) => {
            resolve(messages);
          },
        },
      });
    });
  }

  /**
   * @description 当前路由转换成路由路径对象
   * @param {boolean} [isRouteModal]
   * @returns {*}  {{
   *     appContext?: IParams;
   *     pathNodes: {
   *       viewName: string;
   *       context?: IParams;
   *       params?: IParams;
   *       srfnav?: string;
   *     }[];
   *   }}
   * @memberof AppUtil
   */
  route2routeObject(isRouteModal: boolean = false): {
    appContext?: IParams;
    pathNodes: {
      viewName: string;
      context?: IParams;
      params?: IParams;
      srfnav?: string;
    }[];
  } {
    const routePath = route2routePath(
      this.router.currentRoute.value as any,
      isRouteModal,
    );
    return routePath;
  }

  /**
   * @description 路由路径对象转化为路由路径
   * @param {{
   *     appContext?: IParams;
   *     pathNodes: {
   *       viewName: string;
   *       context?: IParams;
   *       params?: IParams;
   *       srfnav?: string;
   *     }[];
   *   }} routePath
   * @returns {*}  {string}
   * @memberof AppUtil
   */
  routeObject2String(routePath: {
    appContext?: IParams;
    pathNodes: {
      viewName: string;
      context?: IParams;
      params?: IParams;
      srfnav?: string;
    }[];
  }): string {
    return routePath2string(routePath);
  }
}
