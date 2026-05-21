import { RuntimeError } from '@ibiz-template/core';
import {
  getDeACMode,
  UIActionUtil,
  IInLineAIEditor,
  EditorController,
  IInLineAiChatOptions,
} from '@ibiz-template/runtime';
import { IAppDEACMode, ICode } from '@ibiz/model-core';
import type * as Monaco from 'monaco-editor';
import { clone } from 'ramda';

type IMonaco = typeof import('monaco-editor');

/**
 * 代码框编辑器控制器
 *
 * @export
 * @class CodeEditorController
 * @extends {EditorController}
 */
export class CodeEditorController
  extends EditorController<ICode>
  implements IInLineAIEditor
{
  /**
   * 自填模式
   *
   * @type {IAppDEACMode}
   * @memberof CodeEditorController
   */
  deACMode?: IAppDEACMode;

  /**
   * editor 实例
   *
   * @private
   * @type {Monaco.editor.IStandaloneCodeEditor}
   * @memberof HtmlEditorController
   */
  private editor?: Monaco.editor.IStandaloneCodeEditor;

  /**
   * monaco 实例
   *
   * @private
   * @type {IMonaco}
   * @memberof CodeEditorController
   */
  private monaco?: IMonaco;

  /**
   * editor 当前选区
   *
   * @type {monaco.Selection}
   * @memberof CodeEditorController
   */
  currentSelection?: Monaco.Selection;

  /**
   * AI 聊天自填模式
   *
   * @type {boolean}
   * @memberof CodeEditorController
   */
  chatCompletion: boolean = false;

  /**
   * 语言类型
   * @author lxm
   * @date 2023-07-21 04:52:16
   * @readonly
   */
  get language(): string {
    return (
      this.editorParams.codeType || this.editorParams.language || 'typescript'
    );
  }

  /**
   * 主题
   * @author lxm
   * @date 2023-07-21 04:53:37
   * @readonly
   */
  get theme(): string {
    return this.editorParams.theme || 'vs-dark';
  }

  /**
   * AI行内聊天框高度
   *
   * @type {number}
   * @memberof CodeEditorController
   */
  inlineAiChatHeight?: number;

  /**
   * @description 隐藏行号
   * @type {boolean}
   * @memberof CodeEditorController
   */
  hideLineNumbers: boolean = false;

  /**
   * @description 隐藏总览区
   * @type {boolean}
   * @memberof CodeEditorController
   */
  hideMinimap: boolean = false;

  /**
   * 初始化
   *
   * @protected
   * @return {*}  {Promise<void>}
   * @memberof CodeEditorController
   */
  protected async onInit(): Promise<void> {
    await super.onInit();
    if (this.editorParams) {
      const { inlineaichatheight, hidelinenumbers, hideminimap } =
        this.editorParams;
      if (inlineaichatheight)
        this.inlineAiChatHeight = Number(inlineaichatheight);
      if (hidelinenumbers)
        this.hideLineNumbers = this.toBoolean(hidelinenumbers);
      if (hideminimap) this.hideMinimap = this.toBoolean(hideminimap);
    }
    const { appDEACModeId, appDataEntityId } = this.model;
    if (appDEACModeId)
      this.deACMode = await getDeACMode(
        appDEACModeId,
        appDataEntityId!,
        this.context.srfappid,
      );

    if (this.deACMode) {
      if (this.deACMode.actype === 'CHATCOMPLETION') {
        this.chatCompletion = true;
      }
    }
  }

  /**
   * editor 创建完成
   *
   * @private
   * @param {Monaco.editor.IStandaloneCodeEditor} editor
   */
  onCreated(
    editor: Monaco.editor.IStandaloneCodeEditor,
    monaco: IMonaco,
  ): void {
    this.editor = editor;
    this.monaco = monaco;
  }

  /**
   * 获取选中文本
   * @return {*}  {string} 选中文本
   */
  getSelectionText(): string {
    const selection = this.editor?.getSelection();
    let selectedText;
    if (selection) {
      // 关键修正：通过模型获取选区内的文字
      selectedText = this.editor?.getModel()?.getValueInRange(selection);
    }
    return selectedText || '';
  }

  /**
   * 插入文本
   * @param {string} text 文本
   */
  insertText(text: string): void {
    if (!this.editor || !this.monaco) {
      throw new RuntimeError(ibiz.i18n.t('editor.code.editorNotInit'));
    }

    // 取选中结束位置作为插入点
    const selections = this.editor!.getSelections();
    // 无光标时不执行插入
    if (!selections || selections.length === 0) return;

    const activeSelection = selections[selections.length - 1];
    const insertLine = activeSelection.positionLineNumber; // 活跃光标的行号
    const insertColumn = activeSelection.positionColumn; // 活跃光标的列号

    // 以段落的方式插入文本
    const formattedText = `\n${text}\n`;

    // 执行插入操作
    this.editor?.executeEdits('', [
      {
        range: new this.monaco!.Range(
          insertLine,
          insertColumn,
          insertLine,
          insertColumn, // 光标位置纯插入，不替换任何内容
        ),
        text: formattedText,
      },
    ]);

    // 计算插入后光标的新位置（停留在插入文本末尾，换行符之前）
    const linesInText = formattedText.split('\n');
    const linesAdded = linesInText.length - 1; // 前后换行 + 文本内换行 = 总新增行数
    const lastLineOfInsert = insertLine + linesAdded - 1; // 排除末尾的换行符所在行
    const lastLineContent = linesInText[linesInText.length - 2] || ''; // 取文本最后一行（排除末尾换行）
    const newColumn = lastLineContent.length + 1; // Monaco 列号从1开始，末尾位置长度需要加1

    // 更新光标位置并聚焦
    const newPosition = new this.monaco!.Position(lastLineOfInsert, newColumn);
    this.editor?.setPosition(newPosition);
    this.editor?.revealPositionInCenter(newPosition);
    this.editor?.focus();
  }

  /**
   * 替换选中文本
   * @param {string} text
   */
  replaceSelectionText(text: string): void {
    // 获取当前选区和编辑器实例
    const selection = this.editor?.getSelection();
    if (!selection || selection.isEmpty() || !this.monaco || !this.editor) {
      return;
    }

    // 获取选区起始位置（作为计算基准）
    const startPosition = selection.getStartPosition();

    // 替换选区内容
    this.editor.executeEdits('', [
      {
        range: selection,
        text,
      },
    ]);

    // 计算替换文本的行数和最后一行的字符数
    const textLines = text.split('\n');
    const lineCount = textLines.length;
    const lastLineChars = textLines[lineCount - 1].length;

    // 计算光标最终位置
    let finalLineNumber: number;
    let finalColumn: number;

    if (lineCount === 1) {
      // 无换行：直接在起始列基础上增加文本长度
      finalLineNumber = startPosition.lineNumber;
      finalColumn = startPosition.column + lastLineChars;
    } else {
      // 有换行：计算总行数偏移，最后一行从第1列开始计算
      finalLineNumber = startPosition.lineNumber + (lineCount - 1);
      finalColumn = 1 + lastLineChars;
    }

    // 创建空选区（取消选中状态）并定位光标
    const newSelection = new this.monaco.Range(
      finalLineNumber,
      finalColumn,
      finalLineNumber,
      finalColumn,
    );

    // 清除所有装饰（包括选区背景色）
    this.editor.createDecorationsCollection().clear();

    this.editor.setSelection(newSelection);
    this.editor.focus();
  }

  /**
   * 恢复选取
   */
  restoreSelection(): void {
    this.editor?.focus();
  }

  /**
   * 获取内联AI编辑器元素
   */
  getInLineAiEditorElement(): Element {
    if (!this.editor) {
      throw new RuntimeError(ibiz.i18n.t('editor.code.editorNotInit'));
    }
    return this.editor.getDomNode() as Element;
  }

  /**
   * 获取内联AI编辑器主题
   */
  getInLineAiEditorTheme(): 'light' | 'dark' {
    const currentTheme = (this.editor as IParams)?._themeService?._theme
      ?.themeName;
    switch (currentTheme) {
      case 'vs-dark':
        return 'dark';
      case 'vs':
      default:
        return 'light';
    }
  }

  /**
   * 获取内联AI聊天参数
   */
  getInLineAiChatOptions(): IInLineAiChatOptions {
    if (!this.editor || !this.monaco) {
      throw new RuntimeError(ibiz.i18n.t('editor.code.editorNotInit'));
    }
    const contentArea = this.editor
      ?.getDomNode()
      ?.querySelector('.editor-scrollable') as HTMLElement;
    if (!contentArea) {
      throw new RuntimeError(ibiz.i18n.t('editor.code.noEditorArea'));
    }

    const position = this.currentSelection?.getStartPosition();
    if (!position) {
      throw new RuntimeError(ibiz.i18n.t('editor.code.noSelStart'));
    }

    const coordinates = this.editor?.getScrolledVisiblePosition(position);
    const editorRect = this.editor?.getDomNode()?.getBoundingClientRect();
    if (!editorRect) {
      throw new RuntimeError(ibiz.i18n.t('editor.code.noEditorRect'));
    }
    if (!coordinates) {
      throw new RuntimeError(ibiz.i18n.t('editor.code.noSelCoords'));
    }

    const rect = contentArea.getBoundingClientRect();
    // 编辑器布局信息
    const layoutInfo = this.editor.getLayoutInfo();

    return {
      // 编辑器编辑区左侧距离
      left: rect.left,
      // 编辑器上方距离 + 选区距离编辑器上方距离 + 行高度
      top: editorRect.top + coordinates.top + coordinates.height,
      // 编辑器编辑区宽度 - 代码预览区宽度 - 代码预览区标尺宽度
      width:
        rect.width -
        layoutInfo.minimap.minimapWidth -
        layoutInfo.overviewRuler.width,
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
