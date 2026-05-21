import { IChatUIAction } from '../../interface';

/**
 * 聊天界面操作解析器
 */
export class ChatUIActionParser {
  /**
   * 解析界面操作字符串
   * @param chatStepString
   * @returns
   */
  static parse(str: string): IChatUIAction[] {
    let chatuiactions: IChatUIAction[] = [];
    const startIndex: number = str.indexOf('<chatuiaction>');
    const endIndex: number = str.indexOf('</chatuiaction>');
    if (startIndex === -1 || endIndex === -1) {
      return chatuiactions;
    }
    let chatUIActionString: string = str.substring(startIndex, endIndex + 17);
    chatUIActionString = chatUIActionString
      .replace(/\\r/g, '\r')
      .replace(/\\n/g, '\n');
    // 使用正则表达式匹配被<chatuiaction>和</chatuiaction>包围的内容
    // eslint-disable-next-line prefer-regex-literals
    const completeRegex = new RegExp(
      '<chatuiaction>\\s*({[\\s\\S]*?})\\s*</chatuiaction>',
      'g',
    );
    const completeMatches = chatUIActionString.matchAll(completeRegex);
    for (const match of completeMatches) {
      try {
        // 先替换掉多余的反斜杠
        const cleaned = match[1]
          .replace(/\\/g, '')
          .replace(/"\[/g, '[')
          .replace(/\]"/g, ']')
          .replace(/\n/g, '');
        const completeData = JSON.parse(cleaned);
        if (
          completeData &&
          completeData.content &&
          completeData.content.length > 0
        ) {
          chatuiactions = [...completeData.content];
        }
      } catch (e) {
        console.error('解析完整聊天界面操作失败:', e);
      }
    }
    return chatuiactions;
  }
}
