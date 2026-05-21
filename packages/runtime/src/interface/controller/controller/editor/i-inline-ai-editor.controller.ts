import { IInLineAiChatOptions } from '../../../util';

/**
 * @description 内联AI编辑器接口
 * @export
 * @interface IInLineAIEditor
 */
export interface IInLineAIEditor {
  /**
   * @description 获取选中文本
   */
  getSelectionText(): string;

  /**
   * @description 插入文本
   * @param text 文本
   */
  insertText(text: string): void;

  /**
   * @description 替换选中文本
   * @param text 文本
   */
  replaceSelectionText(text: string): void;

  /**
   * @description 恢复选中文本
   */
  restoreSelection(): void;

  /**
   * @description 获取内联AI聊天参数
   */
  getInLineAiChatOptions(): IInLineAiChatOptions;

  /**
   * @description 获取内联AI编辑器元素
   */
  getInLineAiEditorElement(): Element;

  /**
   * @description 获取内联AI编辑器主题
   */
  getInLineAiEditorTheme(): 'light' | 'dark';

  /**
   * @description 执行内联AI界面行为
   * @param uiActionId 界面行为标识
   * @param appId 应用标识
   */
  doInLineAIUIAction(uiActionId: string, appId: string): Promise<void>;
}
