/* eslint-disable no-nested-ternary */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import { Component, createContext, createRef } from 'preact';
import interact from 'interactjs';
import { Namespace, isWithinBounds, limitDraggable } from '../../utils';
import { ChatMessages } from '../chat-messages/chat-messages';
import { ChatInput } from '../chat-input/chat-input';
import { AiChatController, AiTopicController } from '../../controller';
import {
  CloseSvg,
  MinimizeSvg,
  FullScreenSvg,
  CloseFullScreenSvg,
} from '../../icons';
import { AIChatConst } from '../../constants';
import {
  IAutoClose,
  IChatToolbarItem,
  IChatContainerOptions,
} from '../../interface';
import { ChatTopics } from '../chat-topics/chat-topics';
import { ChatToolbar } from '../chat-toolbar/chat-toolbar';
import { ChatMinimize } from '../chat-minimize/chat-minimize';
import './chat-container.scss';

export interface ChatContainerProps {
  /**
   * 呈现模式
   *
   * @author tony001
   * @date 2025-02-23 16:02:00
   * @type {('DEFAULT' | 'TOPIC')}
   */
  mode: 'DEFAULT' | 'TOPIC';

  /**
   * 是否允许回填
   *
   * @author tony001
   * @date 2025-03-10 16:03:08
   * @type {boolean}
   */
  enableBackFill?: boolean;

  /**
   * ai话题控制器，非loading模式必传
   *
   * @author tony001
   * @date 2025-02-23 16:02:38
   * @type {AiTopicController}
   */
  aiTopic?: AiTopicController;
  /**
   * 聊天控制器，非loading模式必传
   *
   * @author tony001
   * @date 2025-02-23 16:02:24
   * @type {AiChatController}
   */
  aiChat?: AiChatController;

  /**
   * 隐藏话题侧边栏
   */
  hideTopicSidebar: boolean;

  /**
   * 关闭聊天窗口
   *
   * @author chitanda
   * @date 2023-10-15 19:10:35
   */
  close: () => void;

  /**
   * 全屏行为
   *
   * @memberof ChatContainerProps
   */
  fullscreen: (target: boolean) => void;

  /**
   * 最小化行为
   *
   * @memberof ChatContainerProps
   */
  minimize: (target: boolean) => void;

  /**
   * 标题
   *
   * @type {string}
   * @memberof ChatContainerProps
   */
  caption?: string;

  /**
   * 内容工具项
   *
   * @type {IChatToolbarItem[]}
   * @memberof ChatContainerProps
   */
  contentToolbarItems?: IChatToolbarItem[];

  /**
   * 底部工具项
   *
   * @type {IChatToolbarItem[]}
   * @memberof ChatContainerProps
   */
  footerToolbarItems?: IChatToolbarItem[];

  /**
   * 提问区工具栏
   *
   * @author tony001
   * @date 2025-02-28 16:02:51
   * @type {IChatToolbarItem[]}
   */
  questionToolbarItems?: IChatToolbarItem[];

  /**
   * AI容器呈现
   *
   * @author tony001
   * @date 2025-03-03 16:03:06
   * @type {IChatContainerOptions}
   */
  containerOptions?: IChatContainerOptions;

  /**
   * 自动关闭
   *
   * @type {IAutoClose}
   * @memberof ChatContainerProps
   */
  autoClose?: IAutoClose;

  /**
   * @description AI窗口的打开模式
   * - default：默认；minimize：最小化；autoexpand：自动展开
   * @type {('default' | 'minimize' | 'autoexpand')}
   * @memberof IChat
   */
  openMode?: 'default' | 'minimize' | 'autoexpand';

  /**
   * 是否加载中
   */
  isLoading: boolean;
}
/**
 * 容器状态
 */
interface ChatContainerState {
  /**
   * 全屏状态
   *
   * @author ljx
   * @date 2024-05-07 15:10:31
   */
  isFullScreen: boolean;

  /**
   * 最小化
   *
   * @type {boolean}
   * @memberof ChatContainerState
   */
  isMinimize: boolean;

  /**
   * 是否启用最小化
   *
   * @type {boolean}
   * @memberof ChatContainerState
   */
  enableAIMinimize: boolean;
}

// zIndex上下文接口
interface ContainerContext {
  zIndex: number;
  enableBackFill: boolean;
}

// zIndex上下文
export const ContainerContext = createContext<ContainerContext>({
  zIndex: 10,
  enableBackFill: true,
});

/**
 * 聊天窗口容器，可拖拽，可缩放
 *
 * @author chitanda
 * @date 2023-10-13 17:10:37
 * @export
 * @class ChatContainer
 * @extends {Component<ChatContainerProps>}
 */
export class ChatContainer extends Component<
  ChatContainerProps,
  ChatContainerState
> {
  constructor(props: ChatContainerProps | undefined) {
    super(props);
    // 初始化状态
    this.state = {
      isFullScreen: false,
      isMinimize: !!(
        props?.openMode === 'minimize' || props?.openMode === 'autoexpand'
      ),
      enableAIMinimize: props?.containerOptions?.enableAIMinimize === true,
    };

    props?.aiChat?.evt.on('onCompleteMessage', () => {
      // 窗口自动关闭
      if (props.autoClose) {
        const { mode, duration = 3 } = props.autoClose;
        switch (mode) {
          case 'minimize':
            this.minimize();
            break;
          case 'close':
            this.close();
            break;
          case 'closetime':
            setTimeout(() => {
              this.close();
            }, duration * 1000);
            break;
          default:
            break;
        }
      }

      // 窗口的打开模式，请求结束后自动打开
      if (props.openMode === 'autoexpand') {
        this.exitMinimize();
      }
    });
  }

  ns = new Namespace('chat-container');

  containerRef = createRef<HTMLDivElement>();

  dragHandle = createRef<HTMLDivElement>();

  /**
   * 窗口样式数据
   *
   * @memberof ChatContainer
   */
  data = {
    side: {
      y: 0,
      height: 1,
      width: 750 / window.innerWidth,
      x: (window.innerWidth - 750) / window.innerWidth,
    },
    window: {
      y: 0,
      width: 750 / window.innerWidth,
      height: 750 / window.innerHeight,
      x: (window.innerWidth - 750) / window.innerWidth,
    },
    minWidth: 500,
    minHeight: 300,
    showMode: 'side',
  };

  /**
   * 是否禁止拖动
   * - 拖拽边时应禁止拖动
   * @type {boolean}
   * @memberof ChatContainer
   */
  disabled: boolean = false;

  /**
   * 最小化是否在拖拽中
   * - 在拖拽时不应触发点击事件
   * @type {boolean}
   * @memberof ChatContainer
   */
  isDragging: boolean = false;

  /**
   * 容器上下文
   *
   * @author tony001
   * @date 2025-03-03 16:03:44
   * @type {ContainerContext}
   */
  containerContext: ContainerContext = {
    zIndex: this.props.containerOptions?.zIndex || 10,
    enableBackFill:
      this.props?.enableBackFill !== undefined &&
      this.props?.enableBackFill !== null
        ? this.props?.enableBackFill
        : true,
  };

  /**
   * 计算AI窗口样式
   *
   * @return {*}
   * @memberof ChatContainer
   */
  calcWindowStyle() {
    const data =
      this.data.showMode === 'window' ? this.data.window : this.data.side;
    return {
      left: `${data.x * 100}%`,
      top: `${data.y * 100}%`,
      width: `${data.width * 100}%`,
      height: `${data.height * 100}%`,
      minWidth: `${this.data.minWidth}px`,
      minHeight: `${this.data.minHeight}px`,
      'z-index': this.props.containerOptions?.zIndex?.toString() || '10',
    };
  }

  /**
   * 计算靠边模式样式
   *
   * @param {('left' | 'right')} side
   * @memberof ChatContainer
   */
  calcSideModeStyle(side: 'left' | 'right'): void {
    Object.assign(this.data, {
      side: {
        y: 0,
        x: side === 'left' ? 0 : (window.innerWidth - 750) / window.innerWidth,
        height: 1,
        width: 750 / window.innerWidth,
      },
      showMode: 'side',
    });
  }

  /**
   * 设置样式
   *
   * @memberof ChatContainer
   */
  setStyle(): void {
    Object.assign(this.containerRef.current!.style, this.calcWindowStyle());
    localStorage.setItem(AIChatConst.STYLE_CACHE, JSON.stringify(this.data));
  }

  /**
   * 吸附边缘（窗口模式）
   * - 靠近窗口上下边缘(20px) - 自动吸附
   * - 靠近窗口左右边缘(20px) - 靠边模式
   * @memberof ChatContainer
   */
  snapToEdge(): void {
    const snapWidth = 20 / window.innerWidth;
    const snapHeight = 20 / window.innerHeight;
    const { x, y, width, height } = this.data.window;
    // 靠边模式
    if (x < snapWidth || x + width > 1 - snapWidth) {
      this.calcSideModeStyle(x < snapWidth ? 'left' : 'right');
    } else {
      // 吸附模式
      if (y < snapHeight) this.data.window.y = 0;
      if (y + height > 1 - snapHeight) this.data.window.y = 1 - height;
    }
    this.setStyle();
  }

  /**
   * 注册对话框拖拽
   *
   * @memberof ChatContainer
   */
  registerDragDialog(): void {
    this.dragHandle.current!.onmousedown = (e: MouseEvent): void => {
      if (this.state.isFullScreen) return;
      // 禁止选择文本，避免拖动时出现选择效果
      document.body.style.userSelect = 'none';
      const offsetX = e.clientX - this.containerRef.current!.offsetLeft;
      const offsetY = e.clientY - this.containerRef.current!.offsetTop;
      const onMouseMove = (evt: MouseEvent): void => {
        if (this.disabled) return;
        // 如果是靠边模式进行拖拽，立即变为窗口模式
        this.data.showMode = 'window';
        const { x, y } = limitDraggable(
          evt.clientX - offsetX,
          evt.clientY - offsetY,
          this.data.window.width,
          this.data.window.height,
        );
        Object.assign(this.data.window, { x, y });
        this.setStyle();
      };

      const onMouseUp = (): void => {
        // 恢复选择文本功能
        document.body.style.userSelect = '';
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        if (this.disabled) return;
        this.snapToEdge();
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };
  }

  /**
   * 注册对话框边界拖拽
   *
   * @memberof ChatContainer
   */
  registerDragDialogBorder(): void {
    // 注册窗口大小变更
    interact(this.containerRef.current!).resizable({
      // 可拖拽的边缘
      edges: {
        top: true,
        right: true,
        bottom: true,
        left: true,
      },
      margin: 6,
      modifiers: [
        // 保持在父对象内部
        interact.modifiers.restrictEdges({ outer: document.body }),
        // 缩放最小宽度
        interact.modifiers.restrictSize({
          min: { width: this.data.minWidth, height: this.data.minHeight },
        }),
      ],
      inertia: true,
      listeners: {
        move: event => {
          if (this.state.isFullScreen) return;
          const data =
            this.data.showMode === 'side' ? this.data.side : this.data.window;
          data.x = event.rect.left / window.innerWidth;
          data.y = event.rect.top / window.innerHeight;
          data.width = event.rect.width / window.innerWidth;
          data.height = event.rect.height / window.innerHeight;
          this.setStyle();
        },
        start: () => {
          // 禁止选择文本，避免拖动时出现选择效果
          this.disabled = true;
          document.body.style.userSelect = 'none';
        },
        end: () => {
          // 恢复选择文本功能
          this.disabled = false;
          document.body.style.userSelect = '';
        },
      },
    });
  }

  /**
   * 处理全屏改变
   *
   * @memberof ChatContainer
   */
  handleFullScreenChange(): void {
    this.setState({ isFullScreen: document.fullscreenElement !== null });
  }

  componentDidMount(): void {
    this.handleFullScreenChange = this.handleFullScreenChange.bind(this);
    const cache = localStorage.getItem(AIChatConst.STYLE_CACHE);
    if (cache) {
      const data = JSON.parse(cache);
      if (
        data.side &&
        isWithinBounds(data.side) &&
        data.window &&
        isWithinBounds(data.window)
      )
        Object.assign(this.data, data);
    }
    this.setStyle();
    this.registerDragDialog();
    this.registerDragDialogBorder();
    document.addEventListener('fullscreenchange', this.handleFullScreenChange);
  }

  componentWillUnmount(): void {
    document.removeEventListener(
      'fullscreenchange',
      this.handleFullScreenChange,
    );
  }

  /**
   * 关闭聊天窗口
   *
   * @author chitanda
   * @date 2023-10-15 19:10:31
   */
  close(): void {
    this.props.close();
  }

  /**
   * 全屏
   *
   * @author ljx
   * @date 2024-05-07 15:10:31
   */
  fullScreen(): void {
    const container = this.containerRef.current;
    if (container) {
      container.requestFullscreen();
      this.props.fullscreen(true);
    }
  }

  /**
   * 关闭全屏
   *
   * @author ljx
   * @date 2024-05-07 15:10:31
   */
  closeFullScreen(): void {
    if (this.state.isFullScreen) {
      document?.exitFullscreen();
      this.props.fullscreen(false);
      this.setStyle();
    }
  }

  /**
   * 最小化
   *
   * @memberof ChatContainer
   */
  minimize(): void {
    this.closeFullScreen();
    this.setState({ isMinimize: true });
    this.props.minimize(true);
  }

  /**
   * 退出最小化
   *
   * @memberof ChatContainer
   */
  exitMinimize(): void {
    this.setState({ isMinimize: false });
    this.props.minimize(false);
  }

  /**
   * 阻止冒泡
   * - 防止点击头部行为时误触发拖动监听
   * @param {MouseEvent} evt
   * @memberof ChatContainer
   */
  stopPropagation(evt: MouseEvent): void {
    evt.stopPropagation();
  }

  render() {
    return (
      <ContainerContext.Provider value={this.containerContext}>
        <div className={`${this.ns.b()}`}>
          <div
            className={`${this.ns.e('dialog')} ${this.ns.is(
              'full-screen',
              this.state.isFullScreen,
            )} ${this.ns.is('hidden', this.state.isMinimize)}`}
            ref={this.containerRef}
          >
            <div ref={this.dragHandle} className={this.ns.b('header')}>
              <div className={this.ns.b('header-caption')}>
                {this.props.caption || 'AI助手'}
              </div>
              <div className={this.ns.b('header-action-wrapper')}>
                {this.state.enableAIMinimize && (
                  <div
                    title='最小化'
                    className={`${this.ns.be(
                      'header-action-wrapper',
                      'action-item',
                    )} ${this.ns.be('header-action-wrapper', 'minimize')}`}
                    onMouseDown={this.stopPropagation.bind(this)}
                    onClick={this.minimize.bind(this)}
                  >
                    <MinimizeSvg />
                  </div>
                )}
                {this.state.isFullScreen ? (
                  <div
                    title='退出全屏'
                    className={`${this.ns.be(
                      'header-action-wrapper',
                      'action-item',
                    )} ${this.ns.be(
                      'header-action-wrapper',
                      'close-full-screen',
                    )}`}
                    onMouseDown={this.stopPropagation.bind(this)}
                    onClick={this.closeFullScreen.bind(this)}
                  >
                    <CloseFullScreenSvg />
                  </div>
                ) : (
                  <div
                    title='全屏'
                    className={`${this.ns.be(
                      'header-action-wrapper',
                      'action-item',
                    )} ${this.ns.be('header-action-wrapper', 'full-screen')}`}
                    onMouseDown={this.stopPropagation.bind(this)}
                    onClick={this.fullScreen.bind(this)}
                  >
                    <FullScreenSvg />
                  </div>
                )}
                <div
                  title='关闭'
                  className={`${this.ns.be(
                    'header-action-wrapper',
                    'action-item',
                  )} ${this.ns.be('header-action-wrapper', 'action-close')}`}
                  onMouseDown={this.stopPropagation.bind(this)}
                  onClick={this.close.bind(this)}
                >
                  <CloseSvg />
                </div>
              </div>
            </div>
            {this.props.isLoading ? (
              <div className={`${this.ns.be('main', 'loading')}`}>
                <div className={`${this.ns.be('main', 'spinner')}`}></div>
                <div className={`${this.ns.be('main', 'text')}`}>
                  正在加载...
                </div>
              </div>
            ) : this.props.mode === 'TOPIC' ? (
              <div className={`${this.ns.b('main')}`}>
                {!this.props.hideTopicSidebar && (
                  <div
                    className={`${this.ns.be('main', 'left')}`}
                    style={{
                      width: `${this.props.aiTopic!.topicSidebarWidth.value}px`,
                    }}
                  >
                    <ChatTopics controller={this.props.aiTopic!}></ChatTopics>
                  </div>
                )}
                <div
                  className={`${this.ns.be('main', 'right')}`}
                  style={{
                    width: this.props.hideTopicSidebar
                      ? '100%'
                      : `calc(100% - ${this.props.aiTopic!.topicSidebarWidth.value}px)`,
                  }}
                >
                  <div className={this.ns.b('content')}>
                    <ChatMessages
                      controller={this.props.aiChat!}
                      toolbarItems={this.props.contentToolbarItems}
                    />
                  </div>
                  <ChatToolbar
                    type='footer'
                    mode={this.props.mode}
                    hideTopicSidebar={this.props.hideTopicSidebar}
                    data={this.props.aiTopic!.activedTopic.value}
                    className={`${this.ns.e('toolbar')} ${this.ns.is(
                      'has-materials',
                      this.props.aiChat!.materials.value.length > 0,
                    )}`}
                    controller={this.props.aiChat!}
                    items={this.props.footerToolbarItems}
                  />
                  <div className={this.ns.b('footer')}>
                    <ChatInput
                      controller={this.props.aiChat!}
                      questionToolbarItems={this.props.questionToolbarItems}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className={`${this.ns.be('main', 'default')}`}>
                <div className={this.ns.b('content')}>
                  <ChatMessages
                    controller={this.props.aiChat!}
                    toolbarItems={this.props.contentToolbarItems}
                  />
                </div>
                <ChatToolbar
                  type='footer'
                  mode={this.props.mode}
                  hideTopicSidebar={this.props.hideTopicSidebar}
                  data={this.props.aiTopic!.activedTopic.value}
                  className={`${this.ns.e('toolbar')} ${this.ns.is(
                    'has-materials',
                    this.props.aiChat!.materials.value.length > 0,
                  )}`}
                  controller={this.props.aiChat!}
                  items={this.props.footerToolbarItems}
                />
                <div className={this.ns.b('footer')}>
                  <ChatInput
                    controller={this.props.aiChat!}
                    questionToolbarItems={this.props.questionToolbarItems}
                  />
                </div>
              </div>
            )}
          </div>
          {!this.props.isLoading && (
            <ChatMinimize
              title={this.props.caption || 'AI助手'}
              controller={this.props.aiChat!}
              isMinimize={this.state.isMinimize}
              onClick={this.exitMinimize.bind(this)}
            />
          )}
        </div>
      </ContainerContext.Provider>
    );
  }
}
