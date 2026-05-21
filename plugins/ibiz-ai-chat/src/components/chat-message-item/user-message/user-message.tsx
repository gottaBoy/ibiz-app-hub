import { VNode } from 'preact';
import { useComputed, useSignal } from '@preact/signals';
import Cherry from 'cherry-markdown';
import { useEffect, useRef } from 'preact/hooks';
import { IChatMessage } from '../../../interface';
import { MaterialResourceParser, Namespace, createUUID } from '../../../utils';
import { AiChatController } from '../../../controller';
import { ChatInputMaterialtem } from '../../chat-input-material-item/chat-input-material-item';
import { RefreshSvg, WarningSvg } from '../../../icons';
import './user-message.scss';

export interface UserMessageProps {
  controller: AiChatController;
  message: IChatMessage;
  /**
   * 内容大小，用于更新绘制
   *
   * @author chitanda
   * @date 2023-10-15 21:10:22
   * @type {number}
   */
  size: number;

  /**
   * 工具栏
   *
   * @type {VNode}
   * @memberof UserMessageProps
   */
  children: VNode;
}

const ns = new Namespace('user-message-question');

export const UserMessage = (props: UserMessageProps) => {
  const uuid = createUUID();

  const cherry = useSignal<Cherry | null>(null);

  // 最大高度
  const maxHeight = useSignal(135);

  // 是否折叠
  const isCollapse = useSignal(true);

  // 是否显示折叠按钮
  const isVisible = useSignal(false);

  // 编辑器元素引用
  const editorRef = useRef<HTMLDivElement | null>(null);

  const content = useComputed(() => props.message.content);

  const materialResult = useComputed(() => {
    return MaterialResourceParser.parseMixedContent(content.value);
  });

  useEffect(() => {
    cherry.value = new Cherry({
      id: uuid,
      value: materialResult.value.remainingText || '',
      editor: {
        defaultModel: 'previewOnly',
      },
      previewer: {
        // 默认禁用
        enablePreviewerBubble: false,
      },
      engine: {
        syntax: {
          table: {
            enableChart: false,
            externals: ['echarts'],
          },
        },
      },
    });
  }, [materialResult.value.remainingText]);

  useEffect(() => {
    if (!editorRef.current || !window.ResizeObserver) {
      return;
    }
    const resizeObserver = new ResizeObserver(() => {
      const previewerDom = cherry.value?.previewer.options.previewerDom;
      if (!previewerDom) {
        return;
      }
      isVisible.value = previewerDom.scrollHeight > maxHeight.value;
    });
    resizeObserver.observe(editorRef.current);
    return () => {
      resizeObserver.disconnect();
    };
  }, [editorRef.current]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  const handWarningClick = (e: MouseEvent) => {
    if (!props.message || !props.controller) return;
    props.controller.refreshMessage(props.message, true);
  };

  return (
    <div className={ns.b()}>
      <div className={ns.e('user-header')}>
        {props.children}
        <div className={ns.e('user')}>我</div>
      </div>
      <div className={ns.e('content')}>
        {props.message.state === 40 && (
          <div
            className={ns.em('content', 'warning-container')}
            onClick={handWarningClick}
          >
            <div className={ns.em('content', 'warning')}>
              <div className='warning-icon' title='未发送成功，请重试'>
                <WarningSvg></WarningSvg>
              </div>
              <div className='refresh-icon' title='未发送成功，请重试'>
                <RefreshSvg></RefreshSvg>
              </div>
            </div>
          </div>
        )}
        <div className={ns.em('content', 'body')}>
          {materialResult.value.hasResources && (
            <div className={ns.em('content', 'material')}>
              {materialResult.value.resources.map(resource => {
                return (
                  <ChatInputMaterialtem
                    material={resource}
                    key={resource.id}
                    disabled={true}
                    controller={props.controller}
                  ></ChatInputMaterialtem>
                );
              })}
            </div>
          )}
          <div className={'pre-wrap-container'}>
            <div
              className={`${ns.e('text-content')} ${ns.is('collapse', isCollapse.value)}`}
              id={uuid}
              ref={editorRef}
              style={{
                maxHeight: isCollapse.value ? `${maxHeight.value}px` : '',
              }}
            />
            <div
              className={`${ns.e('collapse-btn')} ${ns.is('visible', isVisible.value)}`}
              title={isCollapse.value ? '展开' : '收起'}
              onClick={() => {
                isCollapse.value = !isCollapse.value;
              }}
            >
              {isCollapse.value ? (
                <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1024 1024'>
                  <path
                    fill='currentColor'
                    d='M104.704 338.752a64 64 0 0 1 90.496 0l316.8 316.8 316.8-316.8a64 64 0 0 1 90.496 90.496L557.248 791.296a64 64 0 0 1-90.496 0L104.704 429.248a64 64 0 0 1 0-90.496'
                  ></path>
                </svg>
              ) : (
                <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1024 1024'>
                  <path
                    fill='currentColor'
                    d='M104.704 685.248a64 64 0 0 0 90.496 0l316.8-316.8 316.8 316.8a64 64 0 0 0 90.496-90.496L557.248 232.704a64 64 0 0 0-90.496 0L104.704 594.752a64 64 0 0 0 0 90.496'
                  ></path>
                </svg>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
