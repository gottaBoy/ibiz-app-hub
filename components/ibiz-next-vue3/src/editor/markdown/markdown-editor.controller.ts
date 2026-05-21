import { RuntimeModelError } from '@ibiz-template/core';
import {
  EditorController,
  IAppDEService,
  IInLineAIEditor,
  IInLineAiChatOptions,
  UIActionUtil,
  getDeACMode,
} from '@ibiz-template/runtime';
import { IAppDEACMode, IDEACModeDataItem, IMarkdown } from '@ibiz/model-core';
import { clone } from 'ramda';

/**
 * MarkDown编辑器控制器
 *
 * @export
 * @class MarkDownEditorController
 * @extends {EditorController}
 */
export class MarkDownEditorController
  extends EditorController<IMarkdown>
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
   * @author chitanda
   * @date 2023-10-12 14:10:41
   * @type {IAppDEService}
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
   * 自填模式对应主键属性名称
   *
   * @author chitanda
   * @date 2023-10-12 10:10:58
   * @type {string}
   */
  keyName: string = 'srfkey';

  /**
   * 自填模式对应主文本属性名称
   *
   * @author chitanda
   * @date 2023-10-12 10:10:02
   * @type {string}
   */
  textName: string = 'srfmajortext';

  /**
   * 自填模式排序模式，默认升序
   *
   * @author chitanda
   * @date 2023-10-12 10:10:29
   * @type {string}
   */
  sort: string = 'asc';

  /**
   * 自填数据项集合（已排除了value和text)
   *
   * @author chitanda
   * @date 2023-10-12 10:10:23
   * @type {IDEACModeDataItem[]}
   */
  dataItems: IDEACModeDataItem[] = [];

  /**
   * AI 聊天自填模式
   *
   * @author chitanda
   * @date 2023-10-12 10:10:37
   * @type {boolean}
   */
  chatCompletion: boolean = false;

  /**
   * 编辑器实例
   *
   * @type {IData}
   * @memberof MarkDownEditorController
   */
  mdeditor: IData | null = null;

  /**
   * 选区位置缓存
   *
   * @type {(IData | null)}
   * @memberof MarkDownEditorController
   */
  selectionAreaPosition: IData | null = null;

  /**
   * 选区方向  true表示正向，从左到右；false表示反向，从右到左
   *
   * @type {boolean}
   * @memberof MarkDownEditorController
   */
  selectionDirection: boolean = true;

  /**
   * 当前编辑器使用主题
   *
   * @type {string}
   * @memberof MarkDownEditorController
   */
  currentEditorTheme: string = 'light';

  /**
   * AI行内聊天框高度
   *
   * @type {number}
   * @memberof MarkDownEditorController
   */
  inlineAiChatHeight?: number;

  protected async onInit(): Promise<void> {
    await super.onInit();

    // 没配高度默认给600px
    if (!this.style.height) {
      this.style.height = '600px';
    }

    if (this.editorParams) {
      const { uploadparams, exportparams, inlineaichatheight } =
        this.editorParams;

      if (uploadparams) {
        try {
          this.uploadParams = JSON.parse(uploadparams);
        } catch (error) {
          throw new RuntimeModelError(
            uploadparams,
            ibiz.i18n.t('editor.markdown.uploadJsonFormatErr'),
          );
        }
      }
      if (exportparams) {
        try {
          this.exportParams = JSON.parse(exportparams);
        } catch (error) {
          throw new RuntimeModelError(
            exportparams,
            ibiz.i18n.t('editor.markdown.exportJsonFormatErr'),
          );
        }
      }
      if (inlineaichatheight) {
        this.inlineAiChatHeight = Number(inlineaichatheight);
      }
    }

    // 解析自填模式相关模型
    const model = this.model;
    if (model.appDEACModeId) {
      this.deACMode = await getDeACMode(
        model.appDEACModeId,
        model.appDataEntityId!,
        this.context.srfappid,
      );
      if (this.deACMode) {
        if (this.deACMode.actype === 'AUTOCOMPLETE') {
          // 自填模式相关
          const { minorSortAppDEFieldId, minorSortDir } = this.deACMode;
          if (minorSortAppDEFieldId && minorSortDir) {
            this.sort = `${minorSortAppDEFieldId.toLowerCase()},${minorSortDir.toLowerCase()}`;
          }
          if (this.deACMode.textAppDEFieldId) {
            this.textName = this.deACMode.textAppDEFieldId;
          }
          if (this.deACMode.valueAppDEFieldId) {
            this.keyName = this.deACMode.valueAppDEFieldId;
          }
          if (this.deACMode.deacmodeDataItems) {
            this.dataItems = [];
            this.deACMode.deacmodeDataItems.forEach(
              (dataItem: IDEACModeDataItem) => {
                if (dataItem.id !== 'value' && dataItem.id !== 'text') {
                  this.dataItems.push(dataItem);
                }
              },
            );
          }
        }
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
   * 设置编辑器实例
   *
   * @param {IData} mdeditor
   * @memberof MarkDownEditorController
   */
  public setMDEditor(mdeditor: IData): void {
    this.mdeditor = mdeditor;
  }

  /**
   * 设置保存当前选区位置
   *
   * @param {IData} start
   * @param {IData} end
   * @memberof MarkDownEditorController
   */
  setCursorPos(start: IData, end: IData): void {
    this.selectionAreaPosition = { start, end };
  }

  /**
   * 设置当前编辑器的主题
   *
   * @param {string} theme
   * @memberof MarkDownEditorController
   */
  setCurrentEditorTheme(theme: string): void {
    this.currentEditorTheme = theme;
  }

  /**
   * 设置当前选区方向
   *
   * @param {boolean} direction
   * @memberof MarkDownEditorController
   */
  setSelectionDirection(direction: boolean): void {
    this.selectionDirection = direction;
  }

  /**
   * 获取当前主题
   *
   * @return {*}  {('light' | 'dark')}
   * @memberof MarkDownEditorController
   */
  getCurrentTheme(): 'light' | 'dark' {
    return this.currentEditorTheme === 'dark' ? 'dark' : 'light';
  }

  /**
   * 获取选中文本
   *
   * @return {*}  {string}
   * @memberof MarkDownEditorController
   */
  public getSelectionText(): string {
    return this.mdeditor?.editor.editor.getSelection();
  }

  /**
   * 获取内联AI编辑器主题
   *
   * @return {*}  {('light' | 'dark')}
   * @memberof MarkDownEditorController
   */
  getInLineAiEditorTheme(): 'light' | 'dark' {
    return this.getCurrentTheme();
  }

  /**
   * 判断选区方向
   *
   * @param {IData} posA
   * @param {IData} posB
   * @return {*}  {boolean}
   * @memberof MarkDownEditorController
   */
  isPositionBefore(posA: IData, posB: IData): boolean {
    if (posA.line < posB.line) return true;
    if (posA.line > posB.line) return false;
    return posA.ch < posB.ch;
  }

  /**
   * 插入文本
   *
   * @param {string} text
   * @memberof MarkDownEditorController
   */
  insertText(text: string): void {
    // 找到当前光标的结束位置，然后新建一行，再插入
    // 获取选区的起始和结束位置
    if (this.selectionAreaPosition) {
      const { start, end } = this.selectionAreaPosition;
      const contentToInsert = `\n${text}\n`;

      // 检查是否有选中内容（非折叠选区）
      const hasSelection = !(start.line === end.line && start.ch === end.ch);

      if (!hasSelection) {
        this.mdeditor?.editor.editor.replaceSelection(contentToInsert);
        return;
      }

      // 判断选择方向（正向/反向）true: 正向，从左到右，false：反向，从右到左
      let insetPos;
      if (this.selectionDirection) {
        insetPos = end;
      } else {
        insetPos = start;
      }
      // 定位光标到选区末尾（不替换选区，仅在末尾插入）
      this.mdeditor?.editor.editor.setCursor(insetPos);

      // 插入内容（此时插入在选区末尾之后，原选区内容保留）
      this.mdeditor?.editor.editor.replaceSelection(contentToInsert);
      if (this.selectionDirection === false) {
        // 需要重新计算一下选区位置
        const index = (contentToInsert.match(/\n/g) || []).length;
        // 根据分行往下加，同时，因为换行，选区开始从第0列选取，所以开始和结束都要减去开始选区的列数
        this.selectionAreaPosition.start.line += index;
        this.selectionAreaPosition.end.line += index;
        this.selectionAreaPosition.end.ch -=
          this.selectionAreaPosition.start.ch;
        this.selectionAreaPosition.start.ch = 0;
      }
      this.restoreSelection();
    }
  }

  /**
   * 替换选中文本
   *
   * @param {string} text
   * @memberof MarkDownEditorController
   */
  replaceSelectionText(text: string): void {
    this.mdeditor?.editor.editor.replaceSelection(text);
  }

  /**
   * 恢复选区
   *
   * @memberof MarkDownEditorController
   */
  restoreSelection(): void {
    this.mdeditor?.editor.editor.setSelection(
      this.selectionAreaPosition?.start,
      this.selectionAreaPosition?.end,
    );
  }

  /**
   * 获取内联AI参数
   *
   * @return {*}  {IData}
   * @memberof MarkDownEditorController
   */
  getInLineAiChatOptions(): IInLineAiChatOptions {
    const editorRect = this.mdeditor?.wrapperDom.getBoundingClientRect();
    if (!this.mdeditor?.bubble.visible) {
      this.mdeditor?.bubble.showBubble();
    }
    const bubbleRect = this.mdeditor?.bubble.bubbleDom.getBoundingClientRect();
    return {
      // 编辑器的左侧距离 + 10px
      left: editorRect.left + 10,
      // 浮动工具栏的顶部距离位置
      top: bubbleRect.top,
      // 编辑器的宽度 - 右侧工具栏的宽度(38px) - 左侧边距（10px）- 右侧边距（10px）
      width: editorRect.width - 58,
      editorElement: this.mdeditor?.wrapperDom,
      editorTheme: this.getCurrentTheme(),
      height: this.inlineAiChatHeight,
    };
  }

  /**
   * 返回内联AI编辑器元素
   *
   * @return {*}  {Element}
   * @memberof MarkDownEditorController
   */
  getInLineAiEditorElement(): Element {
    return this.mdeditor?.wrapperDom;
  }

  /**
   *  执行内联AIUI操作
   *
   * @param {string} _uiAction
   * @param {string} _appId
   * @return {*}  {Promise<void>}
   * @memberof MarkDownEditorController
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
