/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable prefer-regex-literals */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-useless-escape */
import qs from 'qs';
import { notNilEmpty } from 'qx-util';
import { useUIStore } from '@ibiz-template/vue3-util';
import {
  ref,
  Ref,
  watch,
  nextTick,
  onMounted,
  onUnmounted,
  CSSProperties,
} from 'vue';
import { IAppDEACMode, IAppDataEntity } from '@ibiz/model-core';
import { calcResPath, IInLineAiChatOptions } from '@ibiz-template/runtime';
import { IPortalAsyncAction } from '@ibiz-template/core';
import {
  CancelIcon,
  CopyTextIcon,
  insertTextIcon,
  RegenerateIcon,
  ReplaceTextIcon,
} from './icon';
import { IAnswer, IChatToolCall, IMessage } from './interface';

/**
 * @description 计算参数
 * @returns {
 *  srfaiappendcurdata: boolean; // 请求历史是否附加当前数据
 *  srfmode: string | undefined; // mode模式，方便服务区分
 *  srfaiagent: string | undefined; // AI智能体标识
 *  autoquestion: boolean; // 是否自动发送提问请求
 *  inlinecompletionmode: 'sync' | 'async';// 行内补全模式 同步/异步
 * }
 */
export const computedInLineAIParams = (props: {
  params: IParams;
  context: IContext;
  editorParams: IData;
}): {
  srfaiappendcurdata: boolean;
  autoquestion: boolean;
  srfmode: string | undefined;
  srfaiagent: string | undefined;
  inlinecompletionmode: 'sync' | 'async';
} => {
  const { params, context, editorParams } = props;

  const getBooleanValue = (value: any): boolean | null => {
    if (value === 'false') return false;
    if (value === 'true') return true;
    return null; // 表示未设置
  };

  return {
    srfaiappendcurdata:
      getBooleanValue(context.srfaiappendcurdata) ??
      getBooleanValue(params.srfaiappendcurdata) ??
      getBooleanValue(editorParams.srfaiappendcurdata) ??
      true,
    autoquestion:
      getBooleanValue(params.autoquestion) ??
      getBooleanValue(editorParams.autoquestion) ??
      false,
    srfmode: params.srfmode,
    srfaiagent: params.srfaiagent,
    inlinecompletionmode:
      params.inlinecompletionmode ??
      editorParams.inlinecompletionmode ??
      'async',
  };
};

/**
 * @description 监听点击事件
 */
export const useInLineAIContainerClick = (
  props: {
    content: string;
  },
  opts: {
    message: Ref<IMessage>;
    isLoading: Ref<boolean>;
    stopAsk: () => Promise<void>;
  },
): void => {
  const { message, isLoading, stopAsk } = opts;
  const handMousedown = async (evt: MouseEvent): Promise<void> => {
    const target = evt.target as HTMLElement;
    // 检查被点击元素或其父级元素中是否存在具有 ibiz-inline-ai-textarea-container 或 ibiz-inline-ai-alert 类名的元素
    if (
      !target.closest('.ibiz-inline-ai-textarea-container') &&
      !target.closest('.ibiz-inline-ai-alert')
    ) {
      const isChange = props.content !== message.value.content;
      let isClose = true;
      if (isChange || isLoading.value) {
        isClose = await ibiz.confirm.warning({
          title: ibiz.i18n.t('util.inlineAiUtil.warningTitle'),
          desc: ibiz.i18n.t('util.inlineAiUtil.warningDesc'),
          options: {
            modalClass: 'ibiz-inline-ai-alert',
          },
        });
      }
      if (isClose) await stopAsk();
    }
  };

  onMounted(() => {
    document.addEventListener('mousedown', handMousedown, true);
  });

  onUnmounted(() => {
    document.removeEventListener('mousedown', handMousedown, true);
  });
};

/**
 * 使用AI功能
 */
export const useAI = (
  props: {
    data: IData;
    context: IContext;
    deACMode: IAppDEACMode;
    unMountAIChat: Function;
  },
  opts: {
    srfaiappendcurdata: boolean;
    srfmode: string | undefined;
    srfaiagent: string | undefined;
  },
): {
  stopAsk: () => Promise<void>;
  syncAskAI: (question: string) => Promise<IAnswer>;
  asyncAskAI: (
    question: string,
    callBack: (answer: IAnswer) => void,
    errorBack: () => void,
  ) => Promise<void>;
  parseContent: (text?: string) => {
    think: string | undefined;
    content: string | undefined;
    toolcalls: IChatToolCall[];
  };
  loadAiHistory: () => Promise<void>;
} => {
  const { context, data, deACMode } = props;
  const { srfaiappendcurdata, srfmode, srfaiagent } = opts;
  const params = { srfactag: deACMode.codeName };
  const sessionid = ibiz.aiChatUtil.getChatSessionId('INLINE');
  const app = ibiz.hub.getApp(deACMode.appId);

  // AI历史会话数据
  let history: IData[] = [];

  // 应用实体模型
  let appDataEntity: IAppDataEntity | undefined;

  /**
   * @description 计算AI路径
   * @param {boolean} [isHistories=false] 是否为请求历史
   * @param {boolean} [isAsync=false] 是否为异步请求
   * @returns {*}  {string}
   */
  const calcAIPath = (
    isHistories: boolean = false,
    isAsync: boolean = false,
  ): string => {
    if (!appDataEntity) return '';
    const srfkey = context[appDataEntity.codeName!.toLowerCase()];
    const curPath = `/${appDataEntity.deapicodeName2}/${isAsync ? 'sse' : ''}chatcompletion${
      isHistories ? '/histories' : ''
    }${srfkey ? `/${srfkey}` : ''}`;
    const resPath = calcResPath(context, appDataEntity);
    return resPath ? `/${resPath}${curPath}` : `${curPath}`;
  };

  /**
   * @description 加载AI历史数据
   * @returns {*}  {Promise<void>}
   */
  const loadAiHistory = async (): Promise<void> => {
    appDataEntity = await ibiz.hub.getAppDataEntity(
      deACMode.appDataEntityId!,
      deACMode.appId,
    );
    const path = calcAIPath(true);
    const body = {
      sessionid,
    };
    if (srfaiappendcurdata) Object.assign(body, data);
    if (srfmode) Object.assign(body, { mode: srfmode });
    if (srfaiagent) Object.assign(body, { srfaiagent });
    const response = await app.net.post(path, body, params);
    if (response.ok && Array.isArray(response.data)) {
      history = response.data.filter(item =>
        ['USER', 'ASSISTANT'].includes(item.role),
      );
    }
  };

  /**
   * @description 附加路径参数
   * @param {string} url
   */
  const attachUrlParam = (url: string): string => {
    {
      // url 转码
      const urlSplit = url.split('?');
      urlSplit[0] = urlSplit[0]
        .split('/')
        .map(item => encodeURIComponent(item))
        .join('/');
      url = urlSplit.length > 1 ? urlSplit.join('?') : urlSplit[0];
    }
    const strParams: string = qs.stringify(params);
    if (notNilEmpty(strParams)) {
      if (url.endsWith('?')) {
        url = `${url}${strParams}`;
      } else if (url.indexOf('?') !== -1 && url.endsWith('&')) {
        url = `${url}${strParams}`;
      } else if (url.indexOf('?') !== -1 && !url.endsWith('&')) {
        url = `${url}&${strParams}`;
      } else {
        url = `${url}?${strParams}`;
      }
    }
    return url;
  };

  /**
   * @description 准备请求数据
   * @param {string} question 问题
   * @param {boolean} [isAsync=false] 是否为异步提问
   * @returns {*}  {{ body: IData; url: string }}
   */
  const prepareData = (
    question: string,
    isAsync: boolean = false,
  ): { body: IData; url: string } => {
    const body = {
      sessionid,
      messages: [
        ...history,
        {
          role: 'USER',
          content: question,
        },
      ],
    };
    if (srfmode) Object.assign(body, { mode: srfmode });
    if (srfaiagent) Object.assign(body, { srfaiagent });
    let url = calcAIPath(false, isAsync);
    if (!isAsync) url = attachUrlParam(url);
    return { body, url };
  };

  /**
   * @description 解析内容
   * @param {string} [text]
   * @returns {*}
   */
  const parseContent = (text?: string) => {
    let think: string | undefined;
    let content: string | undefined;
    const toolcalls: IChatToolCall[] = [];
    if (!text) return { think, content, toolcalls };
    const openThinkIndex = text.indexOf('<think>');
    const closeThinkIndex = text.indexOf('</think>');
    // 如果存在思考过程则解析思考内容
    if (openThinkIndex !== -1) {
      think =
        closeThinkIndex === -1
          ? text.slice(openThinkIndex + 7)
          : text.slice(openThinkIndex + 7, closeThinkIndex);
      content =
        closeThinkIndex === -1 ? undefined : text.slice(closeThinkIndex + 8);
    } else {
      const toolCallRegex = new RegExp(
        '<tool_call>\\s*({[\\s\\S]*?})\\s*</tool_call>',
        'g',
      );
      const matches = text.matchAll(toolCallRegex);
      for (const match of matches) {
        try {
          const toolCallData = JSON.parse(match[1]);
          const tempToolCall = {
            name: toolCallData.name,
            parameters: toolCallData.parameters,
            error: toolCallData.error || false,
          };
          if (toolCallData.result)
            Object.assign(tempToolCall, {
              result: toolCallData.result,
            });
          toolcalls.push(tempToolCall);
        } catch (e) {
          console.error('解析工具调用失败:', e);
        }
      }
      // 清除文本调用信息
      content = text.replace(/\<tool_call\>[^]*?\<\/tool_call\>/gs, '').trim();
    }
    return { think, content, toolcalls };
  };

  // 异步操作标识
  let asyncacitonid: string | undefined;
  const abortController = ref<AbortController>();

  /**
   * @description 异步询问AI
   * @param {string} question 问题
   * @param {(answer: IAnswer) => void} callBack AI异步回答回调
   * @returns {*}  {Promise<void>}
   */
  const asyncAskAI = (
    question: string,
    callBack: (answer: IAnswer) => void,
    errorBack: () => void,
  ): Promise<void> => {
    return new Promise(resolve => {
      abortController.value = new AbortController();
      const { body, url } = prepareData(question, true);
      app.net.sse(url, params, {
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        onmessage: e => {
          try {
            if (e.data) {
              const msg = JSON.parse(e.data) as IPortalAsyncAction;
              let content = (msg.actionresult as string) || '';
              if (msg.actionstate === 20) asyncacitonid = msg.asyncacitonid;
              if (msg.actionstate === 30 && content)
                content = JSON.parse(content).choices?.[0].content;
              callBack({ state: msg.actionstate, content });
            }
          } catch (error) {
            ibiz.log.error(error);
          }
        },
        onclose: () => resolve(),
        onerror: (error: Error) => {
          callBack({ state: 40, content: error.message });
          errorBack();
          throw error;
        },
        signal: abortController.value.signal,
      });
    });
  };

  /**
   * @description 同步询问AI
   * @param {string} question 问题
   * @returns {*}  {Promise<IAnswer>}
   */
  const syncAskAI = async (question: string): Promise<IAnswer> => {
    abortController.value = new AbortController();
    const { body, url } = prepareData(question);
    const answer: IAnswer = {
      state: 10,
      content: '',
    };
    try {
      const response = await app.net.request(url, {
        method: 'post',
        data: body,
        signal: abortController.value.signal,
      });
      if (response.ok)
        Object.assign(answer, {
          state: 30,
          content: response.data.choices?.[0]?.content,
        });
      return answer;
    } catch (error) {
      Object.assign(answer, {
        state: 40,
        content: (error as Error).message,
      });
      return answer;
    }
  };

  /**
   * @description 终止询问
   */
  const stopAsk = async (): Promise<void> => {
    abortController.value?.abort();
    if (asyncacitonid) {
      const deService = await app.deService.getService(
        context,
        deACMode.appDataEntityId!,
      );
      await deService.aiChatCancel(context, params, {
        asyncacitonid,
        sessionid,
      });
      asyncacitonid = undefined;
    }
    props.unMountAIChat();
  };

  return {
    stopAsk,
    syncAskAI,
    asyncAskAI,
    parseContent,
    loadAiHistory,
  };
};

export interface IActionItem {
  /**
   * @description 图标
   * @type {*}
   * @memberof IActionItem
   */
  icon?: any;
  /**
   * @description 标题
   * @type {string}
   * @memberof IActionItem
   */
  title?: string;
  /**
   * @description 行为名称
   * @type {string}
   * @memberof IActionItem
   */
  actionName?: string;
  /**
   * @description 项类型
   * @type {('action' | 'divider')}（行为项 | 分隔项）
   * @memberof IActionItem
   */
  itemType: 'action' | 'divider';
}

/**
 * 使用基础能力
 * @returns
 */
export const useBase = (
  props: {
    options: IInLineAiChatOptions;
  },
  element: {
    containerRef: Ref<HTMLDivElement | undefined>;
    actionsRef: Ref<HTMLDivElement | undefined>;
    textareaRef: Ref<HTMLTextAreaElement | undefined>;
  },
  message: Ref<IMessage>,
): {
  actions: IActionItem[];
  theme: 'light' | 'dark';
  actionStyle: Ref<CSSProperties>;
  containerStyle: Ref<CSSProperties>;
  contentStyle: Ref<CSSProperties>;
} => {
  const actions: IActionItem[] = [
    {
      title: ibiz.i18n.t('util.inlineAiUtil.regenerate'),
      icon: RegenerateIcon,
      itemType: 'action',
      actionName: 'regenerate',
    },
    {
      title: ibiz.i18n.t('util.inlineAiUtil.insertText'),
      icon: insertTextIcon,
      itemType: 'action',
      actionName: 'insertText',
    },
    {
      title: ibiz.i18n.t('util.inlineAiUtil.replaceText'),
      icon: ReplaceTextIcon,
      itemType: 'action',
      actionName: 'replaceText',
    },
    {
      itemType: 'divider',
    },
    {
      title: ibiz.i18n.t('util.inlineAiUtil.copyText'),
      icon: CopyTextIcon,
      itemType: 'action',
      actionName: 'copyText',
    },
    {
      title: ibiz.i18n.t('app.cancel'),
      icon: CancelIcon,
      itemType: 'action',
      actionName: 'cancel',
    },
  ];

  const { zIndex } = useUIStore();

  const { options } = props;
  const { containerRef, actionsRef, textareaRef } = element;
  const editorRect = options.editorElement.getBoundingClientRect();
  // 获取相对元素的偏移量
  const offsetX = options.left - editorRect.left;
  const offsetY = options.top - editorRect.top;

  /**
   * 主题
   */
  const theme = options.editorTheme || 'light';

  /**
   * 行为组样式
   */
  const actionStyle = ref<CSSProperties>({});

  /**
   * 容器样式
   */
  const containerStyle = ref<CSSProperties>({
    width: `${options.width}px`,
    left: `${options.left}px`,
    top: `${options.top}px`,
    zIndex: zIndex.increment(),
  });

  /**
   *  内容样式
   */
  const contentStyle = ref<CSSProperties>({
    height: options.height ? `${options.height}px` : 'auto',
    'max-height': `${options.maxHeight || (options.height && options.height > 300 ? options.height : 300)}px`,
  });

  watch(
    () => message.value,
    () => {
      nextTick(() => {
        // 根据内容自适应高度
        if (!textareaRef.value) return;
        textareaRef.value.style.height = 'auto';
        textareaRef.value.style.height = `${textareaRef.value.scrollHeight}px`;
        textareaRef.value.parentElement!.scrollTop =
          textareaRef.value.parentElement!.scrollHeight;
      });
    },
    {
      deep: true,
      immediate: true,
    },
  );

  /**
   * @description 更新位置
   * @returns {*}
   */
  const updatePosition = () => {
    if (!containerRef.value || !actionsRef.value) return;
    const rect = options.editorElement.getBoundingClientRect();
    let top = rect.top + offsetY;
    let left = rect.left + offsetX;

    // 获取容器元素的尺寸
    const containerWidth = containerRef.value.offsetWidth;
    const containerHeight = containerRef.value.offsetHeight;

    // 获取窗口尺寸
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // 边界间距
    const margin = 8;

    if (left + containerWidth + margin > windowWidth) {
      // 检查右边界
      left = windowWidth - containerWidth - margin;
    } else if (left < margin) {
      // 检查左边界
      left = margin;
    }
    if (top + containerHeight + margin > windowHeight) {
      // 检查下边界
      top = windowHeight - containerHeight - margin;
    } else if (top < margin) {
      // 检查上边界
      top = margin;
    }

    // 更新容器位置
    containerStyle.value.top = `${top}px`;
    containerStyle.value.left = `${left}px`;

    // 计算行为列表位置
    const position = containerHeight + 4;
    const targetHeight = actionsRef.value.offsetHeight;
    if (windowHeight - (top + containerHeight + targetHeight) > margin) {
      // 下方空间足够，显示在下方
      actionStyle.value.top = `${position}px`;
      actionStyle.value.bottom = 'auto';
    } else {
      // 下方空间不足，显示在上方
      actionStyle.value.bottom = `${position}px`;
      actionStyle.value.top = 'auto';
    }
  };

  let ticking = false;
  const optimizedUpdatePosition = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updatePosition();
        ticking = false;
      });
      ticking = true;
    }
  };

  // 监听容器大小变更
  let observer: ResizeObserver | null;

  onMounted(() => {
    document.addEventListener('scroll', optimizedUpdatePosition, {
      capture: true,
    });
    window.addEventListener('resize', optimizedUpdatePosition);
    if (containerRef.value) {
      observer = new ResizeObserver(optimizedUpdatePosition);
      observer.observe(containerRef.value);
    }
  });

  onUnmounted(() => {
    zIndex.decrement();
    document.removeEventListener('scroll', optimizedUpdatePosition, {
      capture: true,
    });
    window.removeEventListener('resize', optimizedUpdatePosition);
    observer?.disconnect();
    observer = null;
  });

  return { theme, actions, actionStyle, containerStyle, contentStyle };
};
