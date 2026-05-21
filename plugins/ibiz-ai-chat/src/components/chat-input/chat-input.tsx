/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useContext, useRef, useState } from 'preact/compat';
import { useComputed, useSignal } from '@preact/signals';
import { Editor } from '@tiptap/core';
import { Namespace } from '../../utils';
import {
  Agent,
  AudioSvg,
  SendSvg,
  FileSvg,
  PaperclipSvg,
  RecordingSvg,
  StopCircleSvg,
  KnowledgeSvg,
} from '../../icons';
import { AiChatController, AIMaterialFactory } from '../../controller';
import { ChatInputMaterial } from '../chat-input-material/chat-input-material';
import { Popup } from '../popup/popup';
import { IChatToolbarItem } from '../../interface';
import { isSvg } from '../../utils/util/util';
import { ContainerContext } from '../chat-container/chat-container';
import { ChatEditor } from '../chat-editor/chat-editor';
import { SingleSelect, MultipleSelect } from '../common';
import { ChatAgentSetting } from '../chat-agent-setting/chat-agent-setting';
import './chat-input.scss';

export interface ChatInputProps {
  /**
   * 单实例聊天总控
   *
   * @author chitanda
   * @date 2023-10-13 17:10:43
   * @type {AiChatController}
   */
  controller: AiChatController;

  /**
   * 提问区交互工具栏
   *
   * @author tony001
   * @date 2025-02-28 16:02:58
   * @type {IChatToolbarItem[]}
   */
  questionToolbarItems?: IChatToolbarItem[];
}

const ns = new Namespace('chat-input');

// 语音识别构造器
const SpeechRecognition =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export const ChatInput = (props: ChatInputProps) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const containerContext = useContext(ContainerContext);

  const input = props.controller.input;

  // 是否正在语音输入
  const recording = useSignal(false);

  // 语音识别实例
  const recognition = useRef<any>();

  // 编辑器引用
  const editorRef = useRef<Editor>(null);

  if (SpeechRecognition && !recognition.current) {
    recognition.current = new SpeechRecognition();

    recognition.current.onstart = () => {
      recording.value = true;
    };

    recognition.current.onend = () => {
      recording.value = false;
    };

    recognition.current.onresult = (e: any) => {
      const transcript = e.results?.[0]?.[0]?.transcript;
      if (transcript) {
        editorRef.current?.commands.insertContent(transcript);
      }
    };
  }

  // 处理语音输入按钮点击事件
  const handleRecordButtonClick = () => {
    if (recognition.current && !recording.value) {
      recognition.current.start();
    }
  };
  // html转md
  const html2md = (html: string): string => {
    const doc = new DOMParser().parseFromString(html, 'text/html');

    function walk(node: Node): string {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent || '';
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return '';
      const el = node as Element;
      const tag = el.tagName.toLowerCase();
      const children = Array.from(el.childNodes)
        .map(childNode => walk(childNode))
        .join('');
      switch (tag) {
        case 'p':
          return `${children}\n`;
        case 'img': {
          const src = el.getAttribute('src') || '';
          const alt = el.getAttribute('alt') || '';
          return src ? `\n![${alt}](${src})\n` : '';
        }
        default:
          return node.textContent || '';
      }
    }
    const md = Array.from(doc.body.childNodes)
      .map(walk)
      .join('')
      .replace(/\n+/g, '\n')
      .replace(/^\n|\n$/g, '');
    return md;
  };

  const isDisableSend = useComputed(() => html2md(input.value).length <= 0);

  const question = useCallback(async () => {
    try {
      const inputTxt = html2md(input.value);
      input.value = '';
      editorRef.current?.chain().clearContent().run();
      await props.controller.question(inputTxt);
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => {
        if (editorRef.current && !editorRef.current.isDestroyed) {
          editorRef.current.chain().focus().run();
        }
      }, 100);
    }
  }, [input]);

  const stopQuestion = useCallback(async () => {
    try {
      props.controller.abortQuestion();
    } catch (error) {
      console.error(error);
    }
  }, [input]);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.code === 'Enter' && !e.isComposing) {
      if (e.shiftKey === false) {
        question();
        return true;
      }
    }
  };

  /**
   * 文件上传
   *
   * @author tony001
   * @date 2025-02-28 17:02:20
   */
  const uploadFile = async (event: MouseEvent) => {
    const materialHelper = AIMaterialFactory.getMaterialHelper(
      'ossfile',
      props.controller,
    );
    await materialHelper.excuteAction(event);
    setIsPopupOpen(false);
  };

  /**
   * 通用问答
   *
   * @author tony001
   * @date 2025-02-28 17:02:41
   * @param {IChatToolbarItem} item
   */
  const commonQuestion = async (event: MouseEvent, item: IChatToolbarItem) => {
    const materialHelper = AIMaterialFactory.getMaterialHelper(
      'common',
      props.controller,
    );
    await materialHelper.excuteAction(event, item);
    setIsPopupOpen(false);
  };

  /**
   * 设置激活AI代理
   * @param agentID
   */
  const setActiveAIAgent = (agentID: string) => {
    props.controller.setActiveAIAgentID(agentID);
  };

  /**
   * 处理知识库数据变更
   * @param value
   */
  const handleKnowledgeChange = (value: string[]) => {
    props.controller.setSelectionKnowledge(value);
  };

  /**
   * 处理AI智能体搜做
   * @param value
   */
  const handleAIAgentSearch = async (value: string) => {
    const result = await props.controller.searchAIAgent(value);
    return result;
  };

  return (
    <div className={ns.b('wrapper')}>
      <div className={ns.b('material-wrapper')}>
        <ChatInputMaterial controller={props.controller}></ChatInputMaterial>
      </div>
      <div className={ns.b('main-wrapper')}>
        <ChatEditor
          c={props.controller}
          value={input.value}
          disabled={props.controller.isLoading.value}
          onCreate={editor => {
            editorRef.current = editor;
          }}
          onChange={value => {
            input.value = value;
          }}
          onKeyDown={onKeyDown}
        ></ChatEditor>
        <div className={ns.b('action-wrapper')}>
          <div className={ns.b('left-action-wrapper')}>
            <SingleSelect
              showBorder={false}
              enableSearch={true}
              placeholder={'Auto'}
              popperStyle={{ height: '220px' }}
              value={props.controller.activeAIAgentID}
              options={props.controller.agentList.value}
              icon={() => <div title='智能体'>{Agent()}</div>}
              disabled={!props.controller.enableAIAgentChange}
              onSearch={handleAIAgentSearch}
              onChange={val => setActiveAIAgent(val as string)}
            ></SingleSelect>
            {props.controller.enableKnowledgeBaseSelect.value && (
              <MultipleSelect
                popperStyle={{ width: '160px' }}
                options={props.controller.knowledgeBases.value}
                icon={() => <div title='知识库'>{KnowledgeSvg}</div>}
                value={props.controller.selectionKnowledgeBases.value}
                onChange={handleKnowledgeChange}
              ></MultipleSelect>
            )}
            {props.controller.enableRecallConfigSetting.value &&
            props.controller.agentList.value.length > 0 ? (
              <ChatAgentSetting controller={props.controller} />
            ) : null}
          </div>
          <div className={ns.b('right-action-wrapper')}>
            <div
              className={`${ns.be('right-action-wrapper', 'action-item')} ${ns.is(
                'disabled',
                props.controller.isLoading.value,
              )}`}
              title={'上传资料'}
            >
              <Popup
                triggerMode='hover'
                content={
                  <div className={ns.b('pop-actions')}>
                    <div
                      className={ns.b('pop-action-item')}
                      onClick={e => {
                        uploadFile(e);
                      }}
                    >
                      <span className={ns.b('pop-action-item-icon')}>
                        <FileSvg />
                      </span>
                      <span className={ns.b('pop-action-item-title')}>
                        文件资料
                      </span>
                    </div>
                    {props.questionToolbarItems?.map(item => {
                      return (
                        <div
                          key={item.id}
                          className={ns.b('pop-action-item')}
                          onClick={e => {
                            commonQuestion(e, item);
                          }}
                        >
                          <span className={ns.b('pop-action-item-icon')}>
                            {typeof item.icon === 'function'
                              ? item.icon()
                              : item.icon?.showIcon && (
                                  <>
                                    {item.icon?.cssClass ? (
                                      <i className={item.icon.cssClass} />
                                    ) : item.icon?.imagePath ? (
                                      isSvg(item.icon.imagePath) ? (
                                        <div
                                          dangerouslySetInnerHTML={{
                                            __html: item.icon.imagePath,
                                          }}
                                        />
                                      ) : (
                                        <img src={item.icon.imagePath} />
                                      )
                                    ) : null}
                                  </>
                                )}
                          </span>
                          <span className={ns.b('pop-action-item-title')}>
                            {item.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                }
                position='top-left'
                isOpen={isPopupOpen}
                onToggleOpen={setIsPopupOpen}
              >
                <PaperclipSvg />
              </Popup>
            </div>
            <div
              title={recording.value ? '语音输入中...' : '语音输入'}
              className={`${ns.be('right-action-wrapper', 'action-item')} ${ns.is(
                'disabled',
                props.controller.isLoading.value,
              )}`}
              onClick={handleRecordButtonClick}
            >
              {recording.value ? <RecordingSvg /> : <AudioSvg />}
            </div>
            {props.controller.isLoading.value ? (
              <div
                title={'停止生成'}
                className={`${ns.be('right-action-wrapper', 'action-item')}`}
                onClick={stopQuestion}
              >
                <StopCircleSvg />
              </div>
            ) : (
              <div
                title={'发送消息'}
                className={`${ns.be('right-action-wrapper', 'action-item')} ${ns.is(
                  'disabled',
                  isDisableSend.value,
                )}`}
                onClick={question}
              >
                <SendSvg />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
