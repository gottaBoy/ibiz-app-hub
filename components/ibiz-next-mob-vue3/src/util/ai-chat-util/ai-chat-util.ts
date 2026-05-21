/* eslint-disable no-unsafe-finally */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-shadow */
/* eslint-disable no-prototype-builtins */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { h } from 'vue';
import { AxiosProgressEvent } from 'axios';
import { createUUID } from 'qx-util';
import {
  IAppUtil,
  IAppDEACMode,
  IAppDEUIActionGroupDetail,
} from '@ibiz/model-core';
import {
  IModal,
  IModalData,
  UtilService,
  UIActionUtil,
  ConfigService,
  AIUtilService,
  IAIToolbarItem,
  IApiAIChatUtil,
  SysUIActionTag,
  ViewController,
  IViewController,
  IControlController,
} from '@ibiz-template/runtime';
import {
  StringUtil,
  IBizContext,
  IChatMessage,
  IPortalAsyncAction,
} from '@ibiz-template/core';
import { AIFeedback } from './ai-feedback/ai-feedback';

export class AIChatUtil implements IApiAIChatUtil {
  private TOPIC_CHAT_PREFIX: string = 'topic';

  private INLINE_CHAT_SUFFIX: string = 'inline';

  private TEMP_CHAT_SUFFIX: string = 'temp';

  private UNKOWN_CHAT_SUFFIX: string = 'unknow';

  private PRE_ERROR_MESSAGE: string =
    'Expected content-type to be text/event-stream, Actual: application/json;charset=UTF-8';

  /**
   * 获取AI聊天对象
   */
  async getAIChat(): Promise<IData> {
    const module = await import('@ibiz-template-plugin/ibiz-mob-ai-chat');
    const chatInstance = module.chat || module.default.chat;
    return chatInstance;
  }

  /**
   * 获取编辑器扩展AI聊天参数
   * @param editorParams
   * @param context
   * @param params
   * @param data
   */
  async getEditorExAIChatParams(
    editorParams: IData,
    context: IContext,
    params: IParams,
    data: IData,
    deACMode: IAppDEACMode,
    args: {
      chatInstance: IData;
      view: IViewController;
      ctrl?: IControlController;
      [key: string]: any;
    },
  ): Promise<{
    containerOptions: IData;
    topicOptions: IData;
    chatOptions: IData;
  }> {
    // 容器参数
    const containerOptions: IData = {};
    // 容器参数的自动关闭模式({ mode: 'close' | 'closetime', duration?: number })
    if (editorParams.autoclose) {
      try {
        containerOptions.autoClose = JSON.parse(editorParams.autoclose);
      } catch (error) {
        ibiz.log.error(error);
      }
    }
    // 窗口的打开模式('default' | 'top' | 'bottom')
    if (editorParams.openmode)
      containerOptions.openMode = editorParams.openmode;
    // 窗口高度（非'default'模式生效  0到100按照百分比，大于100按照像素处理）
    if (editorParams.containerheight)
      containerOptions.containerHeight = Number(editorParams.containerheight);
    // 会话参数
    const topicOptions: IData = {};

    // 聊天参数
    const chatOptions: IData = {};
    // 编辑器参数srfaiappendcurdata，是否传入对象参数，用于历史查询传参
    if (editorParams.srfaiappendcurdata) {
      chatOptions.appendCurData =
        editorParams.srfaiappendcurdata === 'true' ? data : undefined;
    }
    // 编辑器参数srfaiappendcurcontent，传入编辑内容作为用户消息,获取历史数据后附加
    chatOptions.appendCurContent = editorParams.srfaiappendcurcontent
      ? StringUtil.fill(
          editorParams.srfaiappendcurcontent,
          context,
          params,
          data,
        )
      : undefined;
    // 编辑器参数autoquestion,自动提问
    chatOptions.autoQuestion = editorParams.autoquestion !== 'false';
    // 编辑器参数autofill,自动填充
    chatOptions.autoFill = editorParams.autofill === 'true';
    // 编辑器参数srfaiappendresource，附加资源数据
    chatOptions.appendCurResource = editorParams.srfaiappendresource
      ? StringUtil.fill(editorParams.srfaiappendresource, context, params, data)
      : undefined;
    // 编辑器参数srfmode数据
    if (editorParams.srfmode) {
      chatOptions.srfMode = editorParams.srfmode;
    }
    // 编辑器参数srfenableaiagentchange设置智能体是否可切换
    let enableAIAgentChange = ibiz.config.common.enableAIAgentChange;
    if (editorParams.srfenableaiagentchange) {
      enableAIAgentChange = editorParams.srfenableaiagentchange === 'true';
    }
    chatOptions.enableAIAgentChange = enableAIAgentChange;
    // 编辑器参数srfaiagent设置默认智能体
    if (editorParams.srfaiagent) {
      chatOptions.activeAIAgentID = editorParams.srfaiagent;
    }
    // 智能体选项(由内部获取，优化打开速度)
    chatOptions.fetchAgentList = () => {
      return this.getAIAgentList(context, params, editorParams);
    };
    // 扩展工具栏
    if (deACMode) {
      const {
        contentToolbarItems,
        footerToolbarItems,
        questionToolbarItems,
        otherToolbarItems,
      } = this.calcAiToolbarItemsByAc(deACMode);
      chatOptions.contentToolbarItems = contentToolbarItems;
      chatOptions.footerToolbarItems = footerToolbarItems;
      chatOptions.questionToolbarItems = questionToolbarItems;
      chatOptions.otherToolbarItems = otherToolbarItems;
    }
    // 会话ID
    const sessionid = this.getChatSessionId('TEMP');
    chatOptions.sessionid = sessionid;

    let id: string = '';
    let abortController: AbortController;
    let asyncacitonid: string = '';
    const { chatInstance, view, ctrl } = args;

    // 请求历史
    chatOptions.history = async (
      ctx: IContext,
      param: IParams,
      other: IParams,
    ) => {
      const deService = await ibiz.hub
        .getApp(ctx.srfappid)
        .deService.getService(ctx, other.appDataEntityId);
      const historyRequestData: IData = {};
      if (other.appendCurData) {
        Object.assign(historyRequestData, {
          ...other.appendCurData,
        });
      }
      if (other.sessionid) {
        Object.assign(historyRequestData, {
          sessionid: other.sessionid,
        });
      }
      if (other.srfaiagent) {
        Object.assign(historyRequestData, {
          srfaiagent: other.srfaiagent,
        });
      }
      if (other.srfmode) {
        Object.assign(historyRequestData, {
          mode: other.srfmode,
        });
      }
      const result = await deService.aiChatHistory(
        ctx,
        param,
        historyRequestData,
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
    };
    // 提问
    chatOptions.question = async (
      aiChat: any,
      ctx: IContext,
      param: IParams,
      other: IParams,
      arr: IChatMessage[],
      sessionid: string,
      srfaiagent: string | undefined,
      srfmode: string | undefined,
    ) => {
      id = createUUID();
      abortController = new AbortController();
      const deService = await ibiz.hub
        .getApp(ctx.srfappid)
        .deService.getService(ctx, other.appDataEntityId);
      try {
        const questionRequestData: IData = {
          messages: arr,
          sessionid,
        };
        if (srfaiagent) {
          questionRequestData.srfaiagent = srfaiagent;
        }
        if (srfmode) {
          questionRequestData.mode = srfmode;
        }
        await deService.aiChatSse(
          (msg: IPortalAsyncAction) => {
            // 20: 持续回答中，消息会持续推送。同一个消息 id 会显示在同一个框内
            if (msg.actionstate === 20 && msg.actionresult) {
              asyncacitonid = msg.asyncacitonid;
              aiChat.addMessage({
                messageid: id,
                state: msg.actionstate,
                type: 'DEFAULT',
                role: 'ASSISTANT',
                content: msg.actionresult as string,
                status: 'pending',
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
                  realmessageid: choices[0].messageid,
                  status: 'sent',
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
                status: 'failed',
              });
            }
          },
          abortController,
          ctx,
          param,
          { ...questionRequestData },
        );
      } catch (error) {
        if (error && (error as Error).message !== this.PRE_ERROR_MESSAGE) {
          aiChat.replaceMessage({
            messageid: id,
            state: 40,
            type: 'ERROR',
            role: 'ASSISTANT',
            content: (error as IData).message || ibiz.i18n.t('app.aiError'),
            status: 'failed',
          });
        } else {
          const lastMessage = arr[arr.length - 1];
          aiChat.replaceMessage(
            {
              ...lastMessage,
              state: 40,
            },
            false,
          );
        }
        abortController?.abort();
      } finally {
        // 标记当前消息已经交互完成
        aiChat.completeMessage(id, true);
        return true;
      }
    };
    // 中止提问
    chatOptions.abortQuestion = async (
      aiChat: any,
      ctx: IContext,
      param: IParams,
      other: IParams,
    ) => {
      abortController?.abort();
      if (asyncacitonid) {
        const deService = await ibiz.hub
          .getApp(ctx.srfappid)
          .deService.getService(ctx, other.appDataEntityId);
        const abortRequestData: IData = { asyncacitonid };
        if (other.sessionid) {
          Object.assign(abortRequestData, {
            sessionid: other.sessionid,
          });
        }
        const result = await deService.aiChatCancel(
          ctx,
          param,
          abortRequestData,
        );
        asyncacitonid = '';
      }
      await aiChat.stopMessage({
        messageid: id,
        state: 30,
        type: 'DEFAULT',
        role: 'ASSISTANT',
        content: '',
        status: 'canceled',
      });
      // 标记当前消息已经交互完成
      await aiChat.completeMessage(id, true);
    };
    // 推荐提示词
    chatOptions.recommendPrompt = async (
      ctx: IContext,
      param: IParams,
      other: IParams,
    ) => {
      const deService = await ibiz.hub
        .getApp(ctx.srfappid)
        .deService.getService(ctx, other.appDataEntityId);
      const tempParams = { ...param };
      if (other.srfaiagent) {
        tempParams.srfaiagent = other.srfaiagent;
      }
      const result = await deService.aiChatRecommendPrompt(
        ctx,
        tempParams,
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
    };
    // 会话摘要
    chatOptions.chatDigest = async (
      ctx: IContext,
      param: IParams,
      other: IParams,
    ) => {
      const deService = await ibiz.hub
        .getApp(ctx.srfappid)
        .deService.getService(ctx, other.appDataEntityId);
      const tempParams = { ...param };
      if (other.srfaiagent) {
        tempParams.srfaiagent = other.srfaiagent;
      }
      const result = await deService.aiChatChatDigest(
        ctx,
        tempParams,
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
    };
    // 上传相关
    const app = ibiz.hub.getApp(context.srfappid);
    // 上传目录
    const folder =
      ibiz.env.defaultOSSCat ||
      app.model.defaultOSSCat ||
      app.model.userParam?.DefaultOSSCat;
    // 是否启用全局下载前缀
    let globalDownloadPrifix: boolean = false;
    if (editorParams.globaldownloadprifix) {
      globalDownloadPrifix = editorParams.globaldownloadprifix === 'true';
    } else {
      globalDownloadPrifix = ibiz.config.common.globalDownloadPrifix;
    }
    chatOptions.uploader = {
      folder: `${folder}$`,
      globalDownloadPrifix,
      onUpload: async (
        file: File,
        reportProgress: (progress: number) => void,
        options?: IData,
      ) => {
        const fileMeata = ibiz.util.file.calcFileUpDownUrl(
          options?.context || context,
          options?.params || params,
          {},
          { enableNoAccess: true, osscat: folder },
        );
        const fielUploadHeaders = ibiz.util.file.getUploadHeaders();
        const formData = new FormData();
        formData.append('file', file);
        const res = await ibiz.net.axios({
          url: fileMeata.uploadUrl,
          method: 'post',
          headers: fielUploadHeaders,
          data: formData,
          onUploadProgress: (progressEvent: AxiosProgressEvent) => {
            const percent = (progressEvent.loaded / progressEvent.total!) * 100;
            reportProgress(percent);
          },
        });
        return res.data;
      },
      onDownLoad: async (file: IData, options?: IData) => {
        const { downloadUrl } = ibiz.util.file.calcFileUpDownUrl(
          options?.context || context,
          options?.params || params,
          {},
          { enableNoAccess: true, osscat: folder, globalDownloadPrifix },
        );
        const url = downloadUrl.replace('%fileId%', file.fileid);
        await ibiz.util.file.fileDownload(
          url,
          file.filename,
          {
            context: options?.context || context,
            params: options?.params || params,
            data: {},
            file: { fileId: file.id, ...file },
            extraParams: {
              enableNoAccess: true,
              osscat: folder,
              globalDownloadPrifix,
            },
          },
          undefined,
          true,
        );
      },
    };
    // 扩展工具栏点击
    chatOptions.extendToolbarClick = async (
      event: MouseEvent,
      source: IData,
      context: IData,
      params: IData,
      data: IData,
    ) => {
      const { id, isPluginApp } = source;
      let appId = source.appId;
      const tempContext = IBizContext.create(context);
      // 插件应用界面行为修正上下文种appId
      if (isPluginApp) {
        const mainApp = ibiz.hub.getApp();
        const targetApp = mainApp.model.subAppRefs?.find(subAppRef =>
          subAppRef.appId.endsWith(`__${appId}`),
        );
        if (targetApp) {
          const targetAppId = targetApp.appId;
          tempContext.srfappid = targetAppId;
          appId = targetAppId;
        }
      }
      const result = await UIActionUtil.exec(
        id,
        {
          view,
          ctrl,
          context: tempContext,
          params,
          data: [data],
          event,
        },
        appId,
      );
      if (result.closeView) {
        // 修复编辑器失焦后，调整数据后直接点击关闭按钮导致无法触发自动保存
        // params.view.modal.ignoreDismissCheck = true;
        view.closeView({ ok: true });
      } else if (result.refresh) {
        switch (result.refreshMode) {
          case 1:
            view.callUIAction(SysUIActionTag.REFRESH);
            break;
          case 2:
            view.parentView?.callUIAction(SysUIActionTag.REFRESH);
            break;
          case 3:
            view.getTopView()?.callUIAction(SysUIActionTag.REFRESH);
            break;
          default:
        }
      }
      return result;
    };

    return { containerOptions, topicOptions, chatOptions };
  }

  /**
   * 获取界面行为扩展AI聊天参数
   * @param context
   * @param params
   * @param data
   * @param deACMode
   * @param args
   * @returns
   */
  async getUIActionExAIChatParams(
    context: IContext,
    params: IParams,
    data: IData,
    deACMode: IAppDEACMode,
    args: {
      chatInstance: IData;
      view: IViewController;
      ctrl?: IControlController;
      [key: string]: any;
    },
  ): Promise<{
    containerOptions: IData;
    topicOptions: IData;
    chatOptions: IData;
  }> {
    // 容器参数
    const containerOptions: IData = {};
    // 容器参数的自动关闭模式({ mode: 'close' | 'closetime', duration?: number })
    if (params.hasOwnProperty('autoclose')) {
      try {
        containerOptions.autoClose = JSON.parse(params.autoclose);
        delete params.autoclose;
      } catch (error) {
        ibiz.log.error(error);
      }
    }
    // 窗口的打开模式('default' | 'top' | 'bottom')
    if (params.hasOwnProperty('openmode')) {
      containerOptions.openMode = params.openmode;
      delete params.openmode;
    }
    // 窗口高度（非'default'模式生效  0到100按照百分比，大于100按照像素处理）
    if (params.hasOwnProperty('containerheight')) {
      containerOptions.containerHeight = Number(params.containerheight);
      delete params.containerheight;
    }
    // 会话参数
    const topicOptions: IData = {};
    // 视图参数topiccaptionmode,可选值'default' | 'snippet' | 'summary'，设置会话主题
    if (params.hasOwnProperty('topiccaptionmode')) {
      topicOptions.captionMode = params.topiccaptionmode;
      delete params.topiccaptionmode;
    } else {
      topicOptions.captionMode = ibiz.config.common.aiChatTopicCaptionMode;
    }
    // 视图参数disabletopicstorage,禁用存储
    topicOptions.disableStorage = false;
    if (params.hasOwnProperty('disabletopicstorage')) {
      topicOptions.disableStorage = params.disabletopicstorage === 'true';
      delete params.disabletopicstorage;
    }
    topicOptions.beforeDelete = async (...args: any[]) => {
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
    };
    topicOptions.action = async (
      action: string,
      context: IContext,
      params: IParams,
      data: IData,
      event: MouseEvent,
    ) => {
      if (action === 'LINK') await ibiz.openView.push(data.url);
      return true;
    };
    topicOptions.configService = (
      appid: string,
      storageType: string,
      subType: string,
    ) => {
      return new ConfigService(appid, storageType, subType);
    };

    // 聊天参数
    const chatOptions: IData = {};
    // 是否传入对象参数，用于历史查询传参
    // 上下文参数和视图参数srfaiappendcurdata均识别
    if (context.srfaiappendcurdata === 'true') {
      chatOptions.appendCurData = data;
    } else if (params.hasOwnProperty('srfaiappendcurdata')) {
      chatOptions.appendCurData =
        params.srfaiappendcurdata === 'true' ? data : undefined;
      delete params.srfaiappendcurdata;
    }
    // 传入内容作为用户消息,获取历史数据后附加
    if (params.hasOwnProperty('srfaiappendcurcontent')) {
      chatOptions.appendCurContent = StringUtil.fill(
        params.srfaiappendcurcontent,
        context,
        params,
        data,
      );
      delete params.srfaiappendcurcontent;
    }
    // 自动提问
    if (params.hasOwnProperty('autoquestion')) {
      chatOptions.autoQuestion = params.autoquestion !== 'false';
      delete params.autoquestion;
    }
    // 附加资源数据
    if (params.hasOwnProperty('srfaiappendresource')) {
      chatOptions.appendCurResource = StringUtil.fill(
        params.srfaiappendresource,
        context,
        params,
        data,
      );
      delete params.srfaiappendresource;
    }
    // 附加srfmode数据
    if (params.hasOwnProperty('srfmode')) {
      chatOptions.srfMode = params.srfmode;
      delete params.srfmode;
    }
    // 默认智能体
    if (params.hasOwnProperty('srfaiagent')) {
      chatOptions.activeAIAgentID = params.srfaiagent;
      delete params.srfaiagent;
    }

    // 智能体是否可切换
    let enableAIAgentChange = ibiz.config.common.enableAIAgentChange;
    if (params.hasOwnProperty('srfenableaiagentchange')) {
      enableAIAgentChange = params.srfenableaiagentchange === 'true';
      delete params.srfenableaiagentchange;
    }
    chatOptions.enableAIAgentChange = enableAIAgentChange;

    // 智能体选项(由内部获取，优化打开速度)
    chatOptions.fetchAgentList = () => {
      return this.getAIAgentList(context, params);
    };
    // 扩展工具栏
    if (deACMode) {
      const {
        contentToolbarItems,
        footerToolbarItems,
        questionToolbarItems,
        otherToolbarItems,
      } = this.calcAiToolbarItemsByAc(deACMode);
      chatOptions.contentToolbarItems = contentToolbarItems;
      chatOptions.footerToolbarItems = footerToolbarItems;
      chatOptions.questionToolbarItems = questionToolbarItems;
      chatOptions.otherToolbarItems = otherToolbarItems;
    }

    let id: string = '';
    let abortController: AbortController;
    let asyncacitonid: string = '';
    const { chatInstance, view, ctrl } = args;
    // 查询历史
    chatOptions.history = async (
      ctx: IContext,
      param: IParams,
      other: IParams,
    ) => {
      const deService = await ibiz.hub
        .getApp(ctx.srfappid)
        .deService.getService(ctx, other.appDataEntityId);
      const historyRequestData: IData = {};
      if (other.appendCurData) {
        Object.assign(historyRequestData, {
          ...other.appendCurData,
        });
      }
      if (other.sessionid) {
        Object.assign(historyRequestData, {
          sessionid: other.sessionid,
        });
      }
      if (other.srfaiagent) {
        Object.assign(historyRequestData, {
          srfaiagent: other.srfaiagent,
        });
      }
      if (other.srfmode) {
        Object.assign(historyRequestData, {
          mode: other.srfmode,
        });
      }
      const result = await deService.aiChatHistory(
        ctx,
        param,
        historyRequestData,
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
    };
    // 提问
    chatOptions.question = async (
      aiChat: any,
      ctx: IContext,
      param: IParams,
      other: IParams,
      arr: IChatMessage[],
      sessionid: string,
      srfaiagent: string | undefined,
      srfmode: string | undefined,
    ) => {
      id = createUUID();
      abortController = new AbortController();
      const deService = await ibiz.hub
        .getApp(ctx.srfappid)
        .deService.getService(ctx, other.appDataEntityId);
      try {
        const questionRequestData: IData = {
          messages: arr,
          sessionid,
        };
        if (srfaiagent) {
          questionRequestData.srfaiagent = srfaiagent;
        }
        if (srfmode) {
          questionRequestData.mode = srfmode;
        }
        await deService.aiChatSse(
          (msg: IPortalAsyncAction) => {
            // 20: 持续回答中，消息会持续推送。同一个消息 id 会显示在同一个框内
            if (msg.actionstate === 20 && msg.actionresult) {
              asyncacitonid = msg.asyncacitonid;
              aiChat.addMessage({
                messageid: id,
                state: msg.actionstate,
                type: 'DEFAULT',
                role: 'ASSISTANT',
                content: msg.actionresult as string,
                status: 'pending',
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
                  realmessageid: choices[0].messageid,
                  status: 'sent',
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
                status: 'failed',
              });
            }
          },
          abortController,
          ctx,
          param,
          { ...questionRequestData },
        );
      } catch (error) {
        if (error && (error as Error).message !== this.PRE_ERROR_MESSAGE) {
          aiChat.replaceMessage({
            messageid: id,
            state: 40,
            type: 'ERROR',
            role: 'ASSISTANT',
            content: (error as IData).message || ibiz.i18n.t('app.aiError'),
            status: 'failed',
          });
        } else {
          const lastMessage = arr[arr.length - 1];
          aiChat.replaceMessage(
            {
              ...lastMessage,
              state: 40,
            },
            false,
          );
        }
        abortController?.abort();
      } finally {
        // 标记当前消息已经交互完成
        aiChat.completeMessage(id, true);
        return true;
      }
    };
    // 中止提问
    chatOptions.abortQuestion = async (
      aiChat: any,
      ctx: IContext,
      param: IParams,
      other: IParams,
    ) => {
      abortController?.abort();
      if (asyncacitonid) {
        const deService = await ibiz.hub
          .getApp(ctx.srfappid)
          .deService.getService(ctx, other.appDataEntityId);
        const abortRequestData: IData = { asyncacitonid };
        if (other.sessionid) {
          Object.assign(abortRequestData, {
            sessionid: other.sessionid,
          });
        }
        const result = await deService.aiChatCancel(
          ctx,
          param,
          abortRequestData,
        );
        asyncacitonid = '';
      }
      await aiChat.stopMessage({
        messageid: id,
        state: 30,
        type: 'DEFAULT',
        role: 'ASSISTANT',
        content: '',
        status: 'canceled',
      });
      // 标记当前消息已经交互完成
      await aiChat.completeMessage(id, true);
    };
    // 推荐提示词
    chatOptions.recommendPrompt = async (
      ctx: IContext,
      param: IParams,
      other: IParams,
    ) => {
      const deService = await ibiz.hub
        .getApp(ctx.srfappid)
        .deService.getService(ctx, other.appDataEntityId);
      const tempParams = { ...param };
      if (other.srfaiagent) {
        tempParams.srfaiagent = other.srfaiagent;
      }
      const result = await deService.aiChatRecommendPrompt(
        ctx,
        tempParams,
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
    };
    // 会话摘要
    chatOptions.chatDigest = async (
      ctx: IContext,
      param: IParams,
      other: IParams,
    ) => {
      const deService = await ibiz.hub
        .getApp(ctx.srfappid)
        .deService.getService(ctx, other.appDataEntityId);
      const tempParams = { ...param };
      if (other.srfaiagent) {
        tempParams.srfaiagent = other.srfaiagent;
      }
      const result = await deService.aiChatChatDigest(
        ctx,
        tempParams,
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
    };
    // 上传相关
    const app = ibiz.hub.getApp(context.srfappid);
    // 上传目录
    const folder =
      ibiz.env.defaultOSSCat ||
      app.model.defaultOSSCat ||
      app.model.userParam?.DefaultOSSCat;
    // 是否启用全局下载前缀
    let globalDownloadPrifix: boolean = false;
    if (params.hasOwnProperty('globaldownloadprifix')) {
      globalDownloadPrifix = params.globaldownloadprifix === 'true';
      delete params.globaldownloadprifix;
    } else {
      globalDownloadPrifix = ibiz.config.common.globalDownloadPrifix;
    }
    chatOptions.uploader = {
      folder: `${folder}$`,
      globalDownloadPrifix,
      onUpload: async (
        file: File,
        reportProgress: (progress: number) => void,
        options?: IData,
      ) => {
        const { uploadUrl } = ibiz.util.file.calcFileUpDownUrl(
          options?.context || context,
          options?.params || params,
          {},
          { enableNoAccess: true, osscat: folder },
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
            const percent = (progressEvent.loaded / progressEvent.total!) * 100;
            reportProgress(percent);
          },
        });
        return res.data;
      },
      onDownLoad: async (file: IData, options?: IData) => {
        const { downloadUrl } = ibiz.util.file.calcFileUpDownUrl(
          options?.context || context,
          options?.params || params,
          {},
          { enableNoAccess: true, osscat: folder, globalDownloadPrifix },
        );
        const url = downloadUrl.replace('%fileId%', file.fileid);
        await ibiz.util.file.fileDownload(
          url,
          file.filename,
          {
            context: options?.context || context,
            params: options?.params || params,
            data: {},
            file: { fileId: file.id, ...file },
            extraParams: {
              enableNoAccess: true,
              osscat: folder,
              globalDownloadPrifix,
            },
          },
          undefined,
          true,
        );
      },
    };
    // 扩展工具栏点击
    chatOptions.extendToolbarClick = async (
      event: MouseEvent,
      source: IData,
      context: IData,
      params: IData,
      data: IData,
    ) => {
      const { id, isPluginApp } = source;
      let appId = source.appId;
      const tempContext = IBizContext.create(context);
      // 插件应用界面行为修正上下文种appId
      if (isPluginApp) {
        const mainApp = ibiz.hub.getApp();
        const targetApp = mainApp.model.subAppRefs?.find(subAppRef =>
          subAppRef.appId.endsWith(`__${appId}`),
        );
        if (targetApp) {
          const targetAppId = targetApp.appId;
          tempContext.srfappid = targetAppId;
          appId = targetAppId;
        }
      }
      const result = await UIActionUtil.exec(
        id,
        {
          view: view as ViewController,
          ctrl: ctrl as IControlController,
          context: tempContext,
          params,
          data: [data],
          event,
        },
        appId,
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
    };

    return { containerOptions, topicOptions, chatOptions };
  }

  /**
   * 计算界面行为扩展AI聊天工具栏项
   * @param deACMode 自填模式
   */
  calcAiToolbarItemsByAc(deACMode: IAppDEACMode | undefined): {
    contentToolbarItems: IAIToolbarItem[];
    footerToolbarItems: IAIToolbarItem[];
    questionToolbarItems: IAIToolbarItem[];
    otherToolbarItems: IAIToolbarItem[];
    functionToolbarItems: IAIToolbarItem[];
    inlineToolbarItems: IAIToolbarItem[];
  } {
    const contentToolbarItems: IAIToolbarItem[] = [];
    const footerToolbarItems: IAIToolbarItem[] = [];
    const questionToolbarItems: IAIToolbarItem[] = [];
    const functionToolbarItems: IAIToolbarItem[] = [];
    const inlineToolbarItems: IAIToolbarItem[] = [];
    const otherToolbarItems: IAIToolbarItem[] = [];
    if (!deACMode || !deACMode.deuiactionGroup) {
      return {
        contentToolbarItems,
        footerToolbarItems,
        questionToolbarItems,
        otherToolbarItems,
        functionToolbarItems,
        inlineToolbarItems,
      };
    }
    deACMode.deuiactionGroup.uiactionGroupDetails?.forEach(
      (item: IAppDEUIActionGroupDetail) => {
        const toolbarItem: IAIToolbarItem = {
          appId: item.appId,
          id: item.uiactionId,
          label: item.showCaption ? item.caption : '',
          title: item.tooltip,
          icon: {
            showIcon: item.showIcon,
            cssClass: item.sysImage?.cssClass,
            imagePath: item.sysImage?.imagePath,
          },
        };
        // 修正图片路径
        if (
          item.sysImage &&
          item.sysImage.imagePath &&
          !item.sysImage.imagePath.startsWith('http')
        ) {
          toolbarItem.icon.imagePath = `${ibiz.env.assetsUrl}/images/${item.sysImage.imagePath}`;
        }
        if (item.uiactionId?.startsWith('mob_msg_content_')) {
          contentToolbarItems.push(toolbarItem);
        } else if (item.uiactionId?.startsWith('mob_msg_footer_')) {
          footerToolbarItems.push(toolbarItem);
        } else if (item.uiactionId?.startsWith('mob_question_')) {
          questionToolbarItems.push(toolbarItem);
          // 代码编辑器`/`触发
        } else if (item.uiactionId?.startsWith('mob_function_')) {
          functionToolbarItems.push(toolbarItem);
          // 集成类编辑器悬停ai按钮触发
        } else if (
          item.uiactionId?.startsWith('mob_inline') ||
          (item.refUIActionGroup &&
            item.refUIActionGroup.id?.startsWith('mob_inline'))
        ) {
          inlineToolbarItems.push(toolbarItem);
        } else {
          otherToolbarItems.push(toolbarItem);
        }
      },
    );
    return {
      contentToolbarItems,
      footerToolbarItems,
      questionToolbarItems,
      otherToolbarItems,
      functionToolbarItems,
      inlineToolbarItems,
    };
  }

  /**
   * 获取AI代理列表
   * @param context
   * @param params
   */
  async getAIAgentList(
    context: IContext,
    params: IParams,
    editorParams?: IData,
  ): Promise<IData[]> {
    const emptyList: IData[] = [];
    const app = ibiz.hub.getApp(ibiz.env.appId);
    const aiAgentUtil = app.getAppUtil('DYNAMICAIGENT', 'CUSTOM');
    if (!aiAgentUtil) return emptyList;
    const utilService = new UtilService(aiAgentUtil);
    const resultParams = { ...params, page: 0, size: 1000 };
    // 准备agent查询参数：
    // 1.自定义srfaiagentscope(编辑器参数)  > 视图参数srfaiagentscope（自定义视图参数）
    // 2.全局ai交互（插件实现）：前面都没拿到，直接读取activedata所属实体名称
    if (editorParams && editorParams.srfaiagentscope) {
      Object.assign(resultParams, {
        srfaiagentscope: editorParams.srfaiagentscope,
      });
    }
    const data = await utilService.load('', context, resultParams);
    if (!data || data.length === 0) return emptyList;
    return data as IData[];
  }

  /**
   * 获取会话标识(TOPIC:适用于多话题场景；INLINE：适用于ai行内会话场景；TEMP：适用于传统ai编辑器会话场景)
   * @param sessionID
   */
  getChatSessionId(
    type: 'TOPIC' | 'INLINE' | 'TEMP',
    sessionID?: string,
  ): string {
    let tempSessionID = '';
    switch (type) {
      case 'TOPIC':
        tempSessionID += this.TOPIC_CHAT_PREFIX;
        break;
      case 'INLINE':
        tempSessionID += this.INLINE_CHAT_SUFFIX;
        break;
      case 'TEMP':
        tempSessionID += this.TEMP_CHAT_SUFFIX;
        break;
      default:
        tempSessionID += this.UNKOWN_CHAT_SUFFIX;
        break;
    }
    tempSessionID += `@${sessionID || `mob@${createUUID()}`}@${new Date().getTime()}`;
    return tempSessionID;
  }

  /**
   * 获取AI会话应用功能
   * @returns
   */
  private async getAIResourceUtil(): Promise<IAppUtil | undefined> {
    const app = ibiz.hub.getApp(ibiz.env.appId);
    const aiSessionUtil = app.getAppUtil('DYNAMICAISESSION', 'CUSTOM');
    return aiSessionUtil;
  }

  /**
   * 获取AI资源参数
   * @returns
   */
  async getAIResourceOptions(
    context: IContext,
    params: IParams,
  ): Promise<IData> {
    const resourceOptions: IData = {};
    // 优先读取应用配置
    if (ibiz.config.common.aiResourceMode) {
      resourceOptions.resourceMode = ibiz.config.common.aiResourceMode;
      return resourceOptions;
    }
    // 没有应用配置，则判断当前应用是否存在AI会话应用功能，若存在，则使用远程模式
    const aiSessionUtil = await this.getAIResourceUtil();
    // REMOTE：远程模式，话题存储config和远程session，消息存储消息表；LOCAL：本地模式，话题存储config，消息存储客户端；默认本地模式
    resourceOptions.resourceMode = aiSessionUtil ? 'REMOTE' : 'LOCAL';
    if (!aiSessionUtil) {
      return resourceOptions;
    }
    // 准备参数
    const utilService = new AIUtilService(aiSessionUtil);

    // 获取会话清单
    resourceOptions.getSessionList = async (
      args: IParams = {},
    ): Promise<IData[]> => {
      const tempParams = { ...params, page: 0, size: 1000, ...args };
      const result = await utilService.getSessionList(context, tempParams);
      return result;
    };
    // 更新会话
    resourceOptions.updateSession = async (
      realID: string,
      data: IData,
    ): Promise<IData> => {
      const result = await utilService.updateSession(
        context,
        params,
        realID,
        data,
      );
      return result;
    };
    // 删除会话(多个以逗号分割)
    resourceOptions.deleteSession = async (
      realID: string,
    ): Promise<boolean> => {
      const result = await utilService.deleteSession(context, params, realID);
      return result;
    };
    // 获取指定会话所有消息
    resourceOptions.getMessages = async (
      args: IParams = {},
    ): Promise<IData[]> => {
      const tempParams = { ...params, page: 0, size: 1000, ...args };
      const result = await utilService.getMessageList(context, tempParams);
      return result;
    };
    // 删除指定会话消息(多个以逗号分割)
    resourceOptions.deleteMessage = async (
      messageID: string,
    ): Promise<boolean> => {
      const result = await utilService.deleteMessage(
        context,
        params,
        messageID,
      );
      return result;
    };
    // 点赞指定会话消息
    resourceOptions.likeMessage = async (
      messageID: string,
    ): Promise<boolean> => {
      const result = await utilService.likeMessage(context, params, messageID);
      return result;
    };
    // 点踩指定会话消息
    resourceOptions.dislikeMessage = async (
      messageID: string,
      feedbackContent: string,
    ): Promise<boolean> => {
      const overlay = ibiz.overlay.createDrawer(
        (modal: IModal) => {
          return h(AIFeedback, {
            modal,
            content: feedbackContent,
          });
        },
        undefined,
        {
          height: 'auto',
          placement: 'bottom',
          attrs: {
            closeable: false,
          },
        } as any,
      );
      overlay.present();
      const result: IModalData = await overlay.onWillDismiss();
      if (!result.ok) return false;
      const content = result.data?.[0]?.feedbackContent;
      const _result = await utilService.dislikeMessage(
        context,
        params,
        messageID,
        content,
      );
      return _result;
    };
    // 取消点赞或者点踩
    resourceOptions.cancelFeedback = async (
      messageID: string,
    ): Promise<boolean> => {
      const result = await utilService.cancelFeedback(
        context,
        params,
        messageID,
      );
      return result;
    };
    // 清空所有会话
    resourceOptions.clearAllSession = async (
      excludeSessionID: string,
    ): Promise<boolean> => {
      const result = await utilService.clearAllSession(
        context,
        params,
        excludeSessionID,
      );
      return result;
    };
    // 删除指定会话的所有的消息
    resourceOptions.clearAllMessageBySessionId = async (
      realID: string,
    ): Promise<boolean> => {
      const result = await utilService.clearAllMessageBySessionId(
        context,
        params,
        realID,
      );
      return result;
    };
    return resourceOptions;
  }

  /**
   * @description 获取AI聊天模式
   * @param {('UIACTION' | 'EDITOR')} type 场景类型：UIACTION:界面行为；EDITOR:编辑器
   * @param {IContext} context
   * @param {IParams} params
   * @param {IData} [editorParams]
   * @returns {*}  {('DEFAULT' | 'TOPIC')}
   * @memberof AIChatUtil
   */
  getAIChatMode(
    type: 'UIACTION' | 'EDITOR',
    context: IContext,
    params: IParams,
    editorParams?: IData,
  ): 'DEFAULT' | 'TOPIC' {
    switch (type) {
      case 'UIACTION':
        if (params.srfenabletempmode && params.srfenabletempmode === 'true') {
          delete params.srfenabletempmode;
          return 'DEFAULT';
        }
        return 'TOPIC';

      case 'EDITOR':
        return 'DEFAULT';
      default:
        return 'DEFAULT';
    }
  }
}
