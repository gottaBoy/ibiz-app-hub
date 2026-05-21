/* eslint-disable no-case-declarations */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ref, computed, PropType, onMounted, defineComponent } from 'vue';
import { IAppDEACMode } from '@ibiz/model-core';
import { useNamespace } from '@ibiz-template/vue3-util';
import { IInLineAiChatOptions } from '@ibiz-template/runtime';
import {
  useAI,
  useBase,
  computedInLineAIParams,
  useInLineAIContainerClick,
} from './inline-ai-textarea.hook';
import { AIIcon, SendIcon, StopIcon } from './icon';
import { IAnswer, IMessage } from './interface';
import { AIToolCall, AIThink } from './common';
import './inline-ai-textarea.scss';

export const InlineAITextArea = defineComponent({
  props: {
    context: {
      type: Object as PropType<IContext>,
      required: true,
    },
    params: {
      type: Object as PropType<IParams>,
      required: true,
    },
    editorParams: {
      type: Object as PropType<IData>,
      required: true,
    },
    data: {
      type: Object as PropType<IData>,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    deACMode: {
      type: Object as PropType<IAppDEACMode>,
      required: true,
    },
    options: {
      type: Object as PropType<IInLineAiChatOptions>,
      required: true,
    },
    insertText: {
      type: Function,
      required: true,
    },
    replaceSelectionText: {
      type: Function,
      required: true,
    },
    restoreSelection: {
      type: Function,
      required: true,
    },
    unMountAIChat: {
      type: Function,
      required: true,
    },
  },
  setup(props, ctx) {
    const ns = useNamespace('inline-ai-textarea-container');
    /**
     * 容器元素引用
     */
    const containerRef = ref<HTMLDivElement>();

    /**
     * 行为元素引用
     */
    const actionsRef = ref<HTMLDivElement>();

    /**
     * 多行文本框元素引用
     */
    const textareaRef = ref<HTMLTextAreaElement>();

    /**
     * 消息
     */
    const message = ref<IMessage>({
      role: 'USER',
      toolcalls: [],
      error: undefined,
      think: undefined,
      content: props.content,
    });

    /**
     * 问题
     */
    let question: string;

    /**
     * 回答内容
     */
    let answerContent: string | undefined;

    /**
     * 是否在加载状态
     */
    const isLoading = ref<boolean>(false);

    /**
     * 是否折叠
     */
    const isCollapse = ref<boolean>(false);

    /**
     *  内容区是否禁用状态
     */
    const disabled = computed(() => {
      // 助手回答或者加载状态中
      return message.value.role === 'ASSISTANT' || isLoading.value;
    });

    /**
     * 功能区是否显示
     */
    const isShow = computed(() => {
      // 助手回答并且不在加载状态中
      return message.value.role === 'ASSISTANT' && !isLoading.value;
    });

    // 预置参数
    const {
      srfmode,
      srfaiagent,
      autoquestion,
      srfaiappendcurdata,
      inlinecompletionmode,
    } = computedInLineAIParams(props);

    const { theme, actions, actionStyle, containerStyle, contentStyle } =
      useBase(props, { containerRef, actionsRef, textareaRef }, message);

    const { stopAsk, syncAskAI, asyncAskAI, parseContent, loadAiHistory } =
      useAI(props, {
        srfmode,
        srfaiagent,
        srfaiappendcurdata,
      });

    // 处理点击事件
    useInLineAIContainerClick(props, {
      message,
      isLoading,
      stopAsk,
    });

    /**
     * @description 处理回答
     */
    const handleAnswer = (answer: IAnswer): void => {
      switch (answer.state) {
        case 20:
          if (!answerContent) {
            answerContent = '';
          }
          answerContent += answer.content;
          Object.assign(message.value, parseContent(answerContent));
          break;
        case 30:
          answerContent = answer.content;
          const { think, content } = parseContent(answerContent);
          // 完成时只更新思考和内容
          Object.assign(message.value, { think, content });
          break;
        case 40:
          isCollapse.value = true;
          Object.assign(message.value, {
            toolcalls: [],
            think: undefined,
            content: undefined,
            error: answer.content,
          });
          break;
        default:
          break;
      }
      message.value.role = 'ASSISTANT';
    };

    /**
     * @description 发送问题
     * @returns {*}  {Promise<void>}
     */
    const sendQuestion = async (content?: string): Promise<void> => {
      if (!content || isLoading.value) return;
      isLoading.value = true;

      try {
        // 还原焦点
        textareaRef.value?.blur();
        props.restoreSelection();

        // 保存问题
        question = content;
        // 重置数据
        answerContent = undefined;
        Object.assign(message.value, {
          toolcalls: [],
          error: undefined,
          think: undefined,
          content: undefined,
        });
        isCollapse.value = false;
        if (inlinecompletionmode === 'async') {
          await asyncAskAI(question, handleAnswer, () => {
            isLoading.value = false;
          });
        } else {
          const answer = await syncAskAI(question);
          handleAnswer(answer);
        }
      } catch (error) {
        ibiz.log.error(error);
      } finally {
        isLoading.value = false;
      }
    };

    /**
     * @description 回车事件
     * @param {KeyboardEvent} e
     */
    const onKeydown = (e: KeyboardEvent): void => {
      if (e.code === 'Enter' && !e.isComposing) {
        e.stopPropagation();
        if (e.shiftKey === false) sendQuestion(message.value.content);
      }
    };

    /**
     * @description 处理行为
     * @param {MouseEvent} e
     * @param {string} actionName
     */
    const handleAction = (_e: MouseEvent, actionName: string) => {
      const content = message.value.content!;
      switch (actionName) {
        case 'regenerate':
          sendQuestion(question);
          break;
        case 'insertText':
          props.insertText(content);
          props.unMountAIChat();
          break;
        case 'replaceText':
          props.replaceSelectionText(content);
          props.unMountAIChat();
          break;
        case 'copyText':
          ibiz.util.text.copy(content);
          props.unMountAIChat();
          break;
        case 'cancel':
          props.unMountAIChat();
          break;
        default:
          break;
      }
    };

    onMounted(async () => {
      await loadAiHistory();
      if (autoquestion) {
        await sendQuestion(message.value.content);
      } else {
        textareaRef.value?.focus();
      }
    });

    /**
     * @description 绘制loding效果
     * @returns {*}
     */
    const renderLoading = () => {
      const value =
        message.value.error || message.value.content || message.value.think;
      if (!isLoading.value || value) return;
      return (
        <div class={ns.e('loading')}>
          <div class={ns.em('loading', 'dot')}></div>
          <div class={ns.em('loading', 'dot')}></div>
          <div class={ns.em('loading', 'dot')}></div>
        </div>
      );
    };

    /**
     * @description 绘制内容
     * @returns {*}
     */
    const renderError = () => {
      if (message.value.error)
        return <div class={ns.e('error')}>{message.value.error}</div>;
    };

    return {
      ns,
      theme,
      isShow,
      actions,
      message,
      disabled,
      isLoading,
      isCollapse,
      actionsRef,
      textareaRef,
      actionStyle,
      containerRef,
      contentStyle,
      containerStyle,
      stopAsk,
      onKeydown,
      renderError,
      sendQuestion,
      handleAction,
      renderLoading,
    };
  },
  render() {
    return (
      <div
        ref='containerRef'
        style={this.containerStyle}
        class={[
          this.ns.b(),
          this.ns.m(this.theme),
          this.ns.is('show-ai', this.isShow),
        ]}
      >
        <div class={this.ns.e('content')} style={this.contentStyle}>
          {!this.disabled && (
            <div class={this.ns.em('content', 'prefix')}>
              <div class={this.ns.em('content', 'ai-icon')}>{AIIcon}</div>
            </div>
          )}
          <div class={this.ns.em('content', 'textarea')}>
            {this.renderLoading()}
            <AIToolCall
              class={this.ns.e('tool-call')}
              toolCalls={this.message.toolcalls}
            />
            <AIThink
              class={this.ns.e('think')}
              think={this.message.think}
              isLoading={this.isLoading}
              isCollapse={this.isCollapse}
              onCollapseChange={val => {
                this.isCollapse = val;
              }}
            />
            {this.renderError()}
            <textarea
              ref='textareaRef'
              disabled={this.disabled}
              onKeydown={this.onKeydown}
              v-model={this.message.content}
              class={this.ns.is('hidden', !!this.message.error)}
            />
          </div>
          <div class={this.ns.em('content', 'suffix')}>
            {this.isLoading && (
              <div
                class={this.ns.em('content', 'stop-icon')}
                onClick={() => this.stopAsk()}
              >
                {StopIcon}
                <span>{ibiz.i18n.t('util.inlineAiUtil.stopEdit')}</span>
              </div>
            )}
            {!this.disabled && (
              <div
                class={this.ns.em('content', 'sand-icon')}
                onClick={() => this.sendQuestion(this.message.content)}
              >
                {SendIcon}
              </div>
            )}
          </div>
        </div>
        {this.isShow && (
          <div class={this.ns.e('footer')}>
            {ibiz.i18n.t('util.inlineAiUtil.info')}
          </div>
        )}
        {this.isShow && (
          <div
            ref='actionsRef'
            style={this.actionStyle}
            class={this.ns.e('actions')}
          >
            {this.actions.map(action => {
              if (action.itemType === 'divider')
                return (
                  <div class={this.ns.em('actions', action.itemType)}></div>
                );
              return (
                <div
                  class={[
                    this.ns.em('actions', action.itemType),
                    this.ns.is('danger', action.actionName === 'cancel'),
                  ]}
                  onClick={e => this.handleAction(e, action.actionName!)}
                >
                  {action.icon}
                  <span>{action.title}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  },
});
