import { h } from 'vue';
import {
  EditorController,
  IAppDEService,
  IInLineAIEditor,
  IInLineAiChatOptions,
  IModal,
  IModalData,
  IOverlayPopoverContainer,
  UIActionUtil,
  getDeACMode,
} from '@ibiz-template/runtime';
import { NOOP, RuntimeError, listenJSEvent } from '@ibiz-template/core';
import { IAppDEACMode, IHtml } from '@ibiz/model-core';
import { Boot, IDomEditor } from '@wangeditor/editor';
import { clone } from 'ramda';
import {
  AIMenu,
  Emoji,
  EmojiElem,
  EmojiModule,
  InLineAIMenu,
  Plugin,
} from './wang-editor';

/**
 * html框编辑器控制器
 *
 * @export
 * @class HtmlEditorController
 * @extends {EditorController}
 */
export class HtmlEditorController
  extends EditorController<IHtml>
  implements IInLineAIEditor
{
  /**
   * 上传参数
   */
  public uploadParams?: IParams;

  /**
   * 下载参数
   */
  public exportParams?: IParams;

  /**
   * 应用实体服务
   *
   * @type {IAppDEService}
   * @memberof HtmlEditorController
   */
  deService?: IAppDEService;

  /**
   * 自填模式
   *
   * @author chitanda
   * @date 2023-10-12 10:10:52
   * @type {IAppDEACMode}
   */
  deACMode?: IAppDEACMode;

  /**
   * AI 聊天自填模式
   *
   * @author chitanda
   * @date 2023-10-12 10:10:37
   * @type {boolean}
   */
  chatCompletion: boolean = false;

  /**
   * wangEditor 实例
   *
   * @private
   * @type {IDomEditor}
   * @memberof HtmlEditorController
   */
  private wangEditor!: IDomEditor;

  /**
   * 气泡容器
   *
   * @type {(IOverlayPopoverContainer | null)}
   * @memberof HtmlEditorController
   */
  private overlay: IOverlayPopoverContainer | null = null;

  /**
   * 清除回调
   *
   * @private
   * @memberof HtmlEditorController
   */
  private cleanup = NOOP;

  /**
   * 预定义阻止捕获事件code
   *
   * @private
   * @type {number[]}
   * @memberof HtmlEditorController
   */
  private presetPreventEvents: number[] = [13, 38, 40];

  /**
   * 预定义阻止冒泡事件code
   *
   * @private
   * @type {number[]}
   * @memberof HtmlEditorController
   */
  private presetPreventPropEvents: number[] = [27];

  /**
   * AI行内聊天框高度
   *
   * @type {number}
   * @memberof HtmlEditorController
   */
  inlineAiChatHeight?: number;

  /**
   * 初始化
   *
   * @protected
   * @return {*}  {Promise<void>}
   * @memberof HtmlEditorController
   */
  protected async onInit(): Promise<void> {
    await super.onInit();
    this.customRegister();
    if (this.editorParams) {
      const {
        uploadParams,
        exportParams,
        uploadparams,
        exportparams,
        inlineaichatheight,
      } = this.editorParams;

      if (uploadParams) {
        try {
          this.uploadParams = JSON.parse(uploadParams);
        } catch (error) {
          ibiz.log.error(
            `编辑器[${ibiz.log.error(
              error,
            )}]编辑器参数 uploadParams 非 json 格式`,
          );
        }
      }
      if (uploadparams) {
        try {
          this.uploadParams = JSON.parse(uploadparams);
        } catch (error) {
          ibiz.log.error(
            `编辑器[${ibiz.log.error(
              error,
            )}]编辑器参数 uploadparams 非 json 格式`,
          );
        }
      }
      if (exportParams) {
        try {
          this.exportParams = JSON.parse(exportParams);
        } catch (error) {
          ibiz.log.error(
            `编辑器[${ibiz.log.error(
              error,
            )}]编辑器参数 exportParams 非 json 格式`,
          );
        }
      }
      if (exportparams) {
        try {
          this.exportParams = JSON.parse(exportparams);
        } catch (error) {
          ibiz.log.error(
            `编辑器[${ibiz.log.error(
              error,
            )}]编辑器参数 exportparams 非 json 格式`,
          );
        }
      }
      if (inlineaichatheight) {
        this.inlineAiChatHeight = Number(inlineaichatheight);
      }
    }
    const model = this.model;
    if (model.appDEACModeId) {
      this.deACMode = await getDeACMode(
        model.appDEACModeId,
        model.appDataEntityId!,
        this.context.srfappid,
      );
      if (this.deACMode) {
        if (this.deACMode.actype === 'CHATCOMPLETION') {
          this.deService = await ibiz.hub
            .getApp(model.appId)
            .deService.getService(this.context, model.appDataEntityId!);
          this.chatCompletion = true;
        }
      }
    }
  }

  /**
   * 自定义注册
   *
   * @private
   * @memberof HtmlEditorController
   */
  private customRegister() {
    // 全局只能注册一次，不要重复注册
    // 注册AI
    if (!(window as IData).aichartRegister && ibiz.env.enableAI) {
      Boot.registerMenu(AIMenu);
      Boot.registerMenu(InLineAIMenu);
      (window as IData).aichartRegister = true;
    }
    // 注册表情相关
    if (!window.customElements.get('emoji-elem')) {
      window.customElements.define('emoji-elem', EmojiElem);
    }
    if (!(window as IData).emojiIsRegiter) {
      Boot.registerModule(EmojiModule);
      (window as IData).emojiIsRegiter = true;
    }
    // 插件相关
    if (!(window as IData).wangEditorPlugin) {
      Boot.registerPlugin(Plugin);
      (window as IData).wangEditorPlugin = true;
    }
  }

  /**
   * wangEditor 创建完成
   *
   * @private
   * @param {IDomEditor} editor
   * @memberof HtmlEditorController
   */
  onCreated(editor: IDomEditor): void {
    this.wangEditor = editor;
    this.listenEvent();
  }

  /**
   * 监听事件
   *
   * @private
   * @memberof HtmlEditorController
   */
  private listenEvent() {
    const container = this.wangEditor.getEditableContainer();
    this.wangEditor.on('openEmojiSelect', () => this.openEmojiSelect());
    this.cleanup = listenJSEvent(container, 'keydown', event => {
      if (this.overlay && this.presetPreventEvents.includes(event.keyCode)) {
        event.preventDefault();
      }
      // 监听esc按键，销毁弹框
      if (
        this.overlay &&
        this.presetPreventPropEvents.includes(event.keyCode)
      ) {
        event.stopPropagation();
        this.overlay?.dismiss();
      }
    });
  }

  /**
   * 打开表情选择
   *
   * @memberof HtmlEditorController
   */
  private async openEmojiSelect(): Promise<void> {
    const domSelection = document.getSelection()!;
    const { focusNode } = domSelection;
    if (focusNode) {
      this.overlay = ibiz.overlay.createPopover(
        (modal: IModal) => {
          return h(Emoji, {
            modal,
          });
        },
        undefined,
        {
          width: 'auto',
          noArrow: true,
          autoClose: true,
          placement: 'bottom-start',
        },
      );
      await this.overlay.present(focusNode.parentNode as HTMLElement);
      this.overlay.onWillDismiss().then(result => {
        const _result = result as IModalData;
        const item = _result.data?.[0];
        if (_result.ok && item) {
          this.addEmojiNode(item);
        }
        this.overlay = null;
      });
    }
  }

  /**
   * 添加表情
   *
   * @param {string} data
   * @memberof HtmlEditorController
   */
  private addEmojiNode(data: IData): void {
    const emojiNode = {
      data,
      type: 'emoji',
      children: [{ text: '' }],
    };
    this.wangEditor.restoreSelection();
    this.wangEditor.insertNode(emojiNode);
    this.wangEditor.move(1);
  }

  /**
   * 销毁
   *
   * @private
   * @memberof HtmlEditorController
   */
  onDestroyed(): void {
    if (this.cleanup !== NOOP) {
      this.cleanup();
    }
    if (this.overlay) {
      this.overlay.dismiss();
    }
  }

  /**
   * 获取选中文本
   * @returns 选中文本
   */
  getSelectionText(): string {
    if (this.wangEditor) {
      return this.wangEditor.getSelectionText();
    }
    return '';
  }

  /**
   * 插入文本
   * @param text 文本
   */
  insertText(text: string): void {
    if (this.wangEditor) {
      // 创建一个新的段落节点
      const newParagraph = {
        type: 'paragraph',
        children: [{ text }],
      };
      // 将选区折叠到末尾位置
      const selection = this.wangEditor.selection;
      if (selection) {
        const collapsedSelection = {
          anchor: selection.anchor,
          focus: selection.anchor,
        };
        // 如果有选中文本，将光标移到选区末尾
        if (
          selection.anchor.path !== selection.focus.path ||
          selection.anchor.offset !== selection.focus.offset
        ) {
          collapsedSelection.anchor = selection.focus;
          collapsedSelection.focus = selection.focus;
        }
        // 应用折叠后的选区
        this.wangEditor.select(collapsedSelection);
      }
      // 在当前光标位置后插入新段落
      this.wangEditor.insertNode(newParagraph);
      // 将光标移动到新段落的末尾
      this.wangEditor.move(1);
    }
  }

  /**
   * 替换选中文本
   * @param text 文本
   */
  replaceSelectionText(text: string): void {
    if (this.wangEditor) {
      // 检查是否有选区
      if (this.wangEditor.selection) {
        // 先删除选中内容
        this.wangEditor.deleteFragment();
        // 再插入新内容
        this.wangEditor.insertText(text);
      } else {
        // 没有选区时直接插入文本
        this.wangEditor.insertText(text);
      }
    }
  }

  /**
   * 恢复选区
   */
  restoreSelection(): void {
    if (this.wangEditor) {
      this.wangEditor.restoreSelection();
    }
  }

  /**
   * 获取内联AI编辑器元素
   */
  getInLineAiEditorElement(): Element {
    if (!this.wangEditor) {
      throw new RuntimeError('编辑器未初始化');
    }
    return this.wangEditor.getEditableContainer();
  }

  /**
   * 获取内联AI编辑器主题
   */
  getInLineAiEditorTheme(): 'light' | 'dark' {
    const appTheme = ibiz.util.theme.getTheme();
    if (appTheme.indexOf('dark') !== -1) {
      return 'dark';
    }
    return 'light';
  }

  /**
   * 获取内联AI参数
   */
  getInLineAiChatOptions(): IInLineAiChatOptions {
    if (!this.wangEditor) {
      throw new RuntimeError('编辑器未初始化');
    }
    const selectionPosition = this.wangEditor.getSelectionPosition();
    if (!selectionPosition || !selectionPosition.left || !selectionPosition.top)
      throw new RuntimeError('获取选区位置失败');
    const editorBoundingClientRect = this.wangEditor
      .getEditableContainer()
      .getBoundingClientRect();
    return {
      // 编辑器的左侧距离 + 默认padding
      left: editorBoundingClientRect.x + 10,
      // 编辑器的上方距离+选区距离编辑器上方距离
      top:
        editorBoundingClientRect.y +
        Number(selectionPosition.top.replace('px', '')),
      // 编辑器的宽度 - 左右padding
      width: editorBoundingClientRect.width - 20,
      editorElement: this.getInLineAiEditorElement(),
      editorTheme: this.getInLineAiEditorTheme(),
      height: this.inlineAiChatHeight,
    };
  }

  /**
   * 执行内联AIUI操作
   * @param uiActionId
   * @param appId
   */
  async doInLineAIUIAction(uiActionId: string, appId: string): Promise<void> {
    const eventArgs = this.ctrl.getEventArgs();
    eventArgs.params = clone(eventArgs.params);
    eventArgs.params.editor = this;
    // 编辑器参数srfaiappendcurdata，是否传入对象参数，用于历史查询传参
    if (
      this.editorParams.srfaiappendcurdata &&
      this.editorParams.srfaiappendcurdata === 'true'
    ) {
      eventArgs.context.srfaiappendcurdata = true;
    }
    await UIActionUtil.exec(
      uiActionId!,
      {
        ...eventArgs,
      },
      appId,
    );
  }
}
