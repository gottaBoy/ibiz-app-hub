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
  ConfigService,
  calcDeCodeNameById,
  UIActionUtil,
  SysUIActionTag,
  IApiViewController,
  IControlController,
  ViewController,
} from '@ibiz-template/runtime';
import { createUUID } from 'qx-util';
import {
  IBizContext,
  IChatMessage,
  IPortalAsyncAction,
} from '@ibiz-template/core';
import { AxiosProgressEvent } from 'axios';
import {
  route2routePath,
  routePath2string,
  useUIStore,
} from '@ibiz-template/vue3-util';
import { calcAiToolbarItemsByAc } from '../ai-util/ai-util';

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
    const {
      contentToolbarItems,
      footerToolbarItems,
      questionToolbarItems,
      otherToolbarItems,
    } = calcAiToolbarItemsByAc(deACMode);
    const module = await import('@ibiz-template-plugin/ai-chat');
    const chatInstance = module.chat || module.default.chat;
    const messages: IChatMessage[] = [];
    const appDataEntityName = calcDeCodeNameById(appDataEntityId!);
    let topicId = `${context.srfsystemid}_${context.srfappid}_${appDataEntityId}_${appDEACModeId}_`;
    topicId += context[appDataEntityName]
      ? context[appDataEntityName]
      : createUUID();
    const caption = `[${deACMode.logicName}]${data?.srfmajortext || ''}`;
    const tempParams = { ...params, ...{ srfactag: deACMode.codeName } };
    const { zIndex } = useUIStore();
    const containerZIndex = zIndex.increment();
    return new Promise(resolve => {
      let id: string = '';
      let abortController: AbortController;
      chatInstance.create({
        mode: 'TOPIC',
        containerOptions: {
          zIndex: containerZIndex,
          enableBackFill: false,
        },
        topicOptions: {
          appid: ibiz.env.appId,
          id: topicId,
          caption,
          url: window.location.hash.substring(1),
          type: context.srftopicpath || 'default',
          beforeDelete: async (...args: any[]) => {
            const isBatchRemove = args[4];
            const result = await ibiz.confirm.warning({
              title: ibiz.i18n.t(
                `util.appUtil.${isBatchRemove ? 'clearTopic' : 'aiTitle'}`,
              ),
              desc: ibiz.i18n.t(
                `util.appUtil.${isBatchRemove ? 'clearTopicDesc' : 'aiDesc'}`,
              ),
            });
            return result;
          },
          action: async (
            action: string,
            context: IContext,
            params: IParams,
            data: IData,
            event: MouseEvent,
          ) => {
            if (action === 'LINK') {
              await ibiz.openView.push(data.url);
            }
            return true;
          },
          configService: (
            appid: string,
            storageType: string,
            subType: string,
          ) => {
            return new ConfigService(appid, storageType, subType);
          },
        },
        chatOptions: {
          caption: deACMode.logicName,
          context: { ...context },
          params: tempParams,
          // 界面行为导航上下文参数srfaiappendcurdata，是否传入对象参数，用于历史查询传参
          appendCurData:
            context.srfaiappendcurdata === 'true' ? data : undefined,
          appDataEntityId,
          contentToolbarItems: contentToolbarItems as any,
          footerToolbarItems: footerToolbarItems as any,
          questionToolbarItems: questionToolbarItems as any,
          otherToolbarItems: otherToolbarItems as any,
          question: async (
            aiChat: any,
            ctx: IContext,
            param: IParams,
            other: IParams,
            arr: IChatMessage[],
          ) => {
            id = createUUID();
            abortController = new AbortController();
            const deService = await ibiz.hub
              .getApp(ctx.srfappid)
              .deService.getService(ctx, other.appDataEntityId);
            try {
              await deService.aiChatSse(
                (msg: IPortalAsyncAction) => {
                  // 20: 持续回答中，消息会持续推送。同一个消息 id 会显示在同一个框内
                  if (msg.actionstate === 20 && msg.actionresult) {
                    aiChat.addMessage({
                      messageid: id,
                      state: msg.actionstate,
                      type: 'DEFAULT',
                      role: 'ASSISTANT',
                      content: msg.actionresult as string,
                    });
                  }
                  // 30: 回答完成，包含具体所有消息内容。直接覆盖之前的临时拼接消息
                  else if (msg.actionstate === 30 && msg.actionresult) {
                    const result = JSON.parse(msg.actionresult as string);
                    const choices = result.choices;
                    if (choices && choices.length > 0) {
                      aiChat.replaceMessage({
                        messageid: id,
                        state: msg.actionstate,
                        type: 'DEFAULT',
                        role: 'ASSISTANT',
                        content: choices[0].content || '',
                      });
                    }
                  }
                  // 40: 回答报错，展示错误信息
                  else if (msg.actionstate === 40) {
                    aiChat.replaceMessage({
                      messageid: id,
                      state: msg.actionstate,
                      type: 'ERROR',
                      role: 'ASSISTANT',
                      content: msg.actionresult as string,
                    });
                  }
                },
                abortController,
                ctx,
                param,
                {
                  messages: arr,
                },
              );
            } catch (error) {
              aiChat.replaceMessage({
                messageid: id,
                state: 40,
                type: 'ERROR',
                role: 'ASSISTANT',
                content: (error as IData).message || ibiz.i18n.t('app.aiError'),
              });
              abortController?.abort();
            } finally {
              // 标记当前消息已经交互完成
              aiChat.completeMessage(id, true);
              return true;
            }
          },
          abortQuestion: async (aiChat: any) => {
            abortController?.abort();
            await aiChat.stopMessage({
              messageid: id,
              state: 30,
              type: 'DEFAULT',
              role: 'ASSISTANT',
              content: '',
            });
            // 标记当前消息已经交互完成
            await aiChat.completeMessage(id, true);
          },
          closed: () => {
            resolve(messages);
          },
          history: async (ctx: IContext, param: IParams, other: IParams) => {
            const deService = await ibiz.hub
              .getApp(ctx.srfappid)
              .deService.getService(ctx, other.appDataEntityId);
            const historyData = other.appendCurData ? other.appendCurData : {};
            const result = await deService.aiChatHistory(
              ctx,
              param,
              historyData,
            );
            if (result.data && Array.isArray(result.data)) {
              let preMsg: IData | undefined;
              result.data.forEach(item => {
                if (item.role === 'TOOL') {
                  if (preMsg && item.content) {
                    chatInstance.aiChat!.updateRecommendPrompt(
                      preMsg as any,
                      item.content,
                    );
                  }
                } else {
                  const msg = {
                    messageid: createUUID(),
                    state: 30,
                    type: 'DEFAULT',
                    role: item.role,
                    content: item.content,
                    completed: true,
                  } as const;
                  preMsg = msg;
                  chatInstance.aiChat!.addMessage(msg);
                }
              });
            }
            return true;
          },
          recommendPrompt: async (
            ctx: IContext,
            param: IParams,
            other: IParams,
          ) => {
            const deService = await ibiz.hub
              .getApp(ctx.srfappid)
              .deService.getService(ctx, other.appDataEntityId);
            const result = await deService.aiChatRecommendPrompt(
              ctx,
              param,
              other.message,
            );
            if (result.ok && result.data) {
              const choices = result.data.choices;
              if (choices && choices.length > 0) {
                return choices[0];
              }
              return null;
            }
            return null;
          },
          uploader: {
            onUpload: async (
              file: File,
              reportProgress: (progress: number) => void,
              options?: IData,
            ) => {
              const { uploadUrl } = ibiz.util.file.calcFileUpDownUrl(
                options?.context || context,
                options?.params || params,
                {},
              );
              const headers = ibiz.util.file.getUploadHeaders();
              const formData = new FormData();
              formData.append('file', file);
              const res = await ibiz.net.axios({
                url: uploadUrl,
                method: 'post',
                headers,
                data: formData,
                onUploadProgress: (progressEvent: AxiosProgressEvent) => {
                  const percent =
                    (progressEvent.loaded / progressEvent.total!) * 100;
                  reportProgress(percent);
                },
              });
              return res.data;
            },
          },
          extendToolbarClick: async (
            event: MouseEvent,
            source: IData,
            context: IData,
            params: IData,
            data: IData,
          ) => {
            const result = await UIActionUtil.exec(
              source.id,
              {
                view: view as ViewController,
                ctrl: ctrl as IControlController,
                context: IBizContext.create(context),
                params,
                data: [data],
                event,
              },
              source.appId,
            );
            if (result.closeView) {
              // 修复编辑器失焦后，调整数据后直接点击关闭按钮导致无法触发自动保存
              // params.view.modal.ignoreDismissCheck = true;
              view.closeView({ ok: true });
            } else if (result.refresh) {
              switch (result.refreshMode) {
                case 1:
                  (view as ViewController).callUIAction(SysUIActionTag.REFRESH);
                  break;
                case 2:
                  view.parentView?.callUIAction(SysUIActionTag.REFRESH);
                  break;
                case 3:
                  (view as ViewController)
                    .getTopView()
                    ?.callUIAction(SysUIActionTag.REFRESH);
                  break;
                default:
              }
            }
            return result;
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
  route2routeObject(isRouteModal?: boolean): {
    appContext?: IParams;
    pathNodes: {
      viewName: string;
      context?: IParams;
      params?: IParams;
      srfnav?: string;
    }[];
  } {
    const routePath = route2routePath(this.router.currentRoute.value as any);
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
