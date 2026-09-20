import { aiChatT } from '..';
import { IChatSuggestion } from '../../interface';

/**
 * 聊天建议解析器
 *
 * @author tony001
 * @date 2025-03-18 14:03:51
 * @export
 * @class ChatSuggestionParser
 */
export class ChatSuggestionParser {
  /**
   * 从XML元素中提取CDATA内容
   *
   * @author tony001
   * @date 2025-03-03 15:03:43
   * @private
   * @static
   * @param {(Element | null)} element
   * @return {*}  {(string | null)}
   */
  private static getCdataContent(element: Element | null): string | null {
    if (!element) return null;

    // 查找CDATA节点
    const cdataNode = Array.from(element.childNodes).find(
      node => node.nodeType === node.CDATA_SECTION_NODE,
    );

    return cdataNode?.nodeValue || element.textContent;
  }

  /**
   *  XML 字符串转数据对象
   *
   * @author tony001
   * @date 2025-03-03 11:03:17
   * @static
   * @param {string} xmlString
   * @return {*}  {IChatSuggestion[]}
   */
  static parse(xmlString: string): IChatSuggestion[] {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    const suggestions = Array.from(xmlDoc.querySelectorAll('suggestion'));

    return suggestions.map(suggestion => {
      const type = suggestion.getAttribute('type') || '';

      const dataElement = suggestion.querySelector('data');
      const metadataElement = suggestion.querySelector('metadata');

      try {
        const dataContent = this.getCdataContent(dataElement);
        const metadataContent = this.getCdataContent(metadataElement);
        const data = dataContent ? JSON.parse(dataContent) : {};
        const metadata = metadataContent ? JSON.parse(metadataContent) : {};

        return { type, data, metadata } as IChatSuggestion;
      } catch (e) {
        throw new Error(
          aiChatT('xmlParseFailed', { message: (e as Error).message }),
        );
      }
    });
  }

  /**
   * 混合内容解析
   *
   * @author tony001
   * @date 2025-03-03 13:03:35
   * @static
   * @param {string} input  包含 XML 和其他文本的混合字符串
   * @return {*}  {{
   *     suggestions: IChatSuggestion[];
   *     remainingText: string;
   *     hasSuggestions: boolean;
   *     error?: string;
   *   }}
   */
  static parseMixedContent(input: string): {
    /** 解析出的建议对象数组 */
    suggestions: IChatSuggestion[];
    /** 去除 XML 后的剩余文本 */
    remainingText: string;
    /** 是否存在有效建议标签 */
    hasSuggestions: boolean;
    /** 解析错误信息 (可选) */
    error?: string;
  } {
    // 匹配完整的 <suggestions> 标签内容 (包含属性)
    const resourceRegex = /<suggestions\b[^>]*>[\s\S]*?<\/suggestions>/i;
    const match = resourceRegex.exec(input);

    if (!match) {
      return {
        suggestions: [],
        remainingText: input,
        hasSuggestions: false,
      };
    }

    // 提取并移除 XML 部分
    const [fullMatch] = match;
    const matchStart = match.index;
    const matchEnd = matchStart + fullMatch.length;
    const remainingText = (
      input.slice(0, matchStart) + input.slice(matchEnd)
    ).replace(/\n/g, '');

    try {
      // 复用原有解析逻辑
      const suggestions = this.parse(fullMatch);
      return {
        suggestions,
        remainingText,
        hasSuggestions: true,
      };
    } catch (error) {
      return {
        suggestions: [],
        remainingText,
        hasSuggestions: true,
        error: aiChatT('resourceParseFailed', {
          message: (error as Error).message,
        }),
      };
    }
  }

  /**
   * 数据对象转 XML 字符串
   *
   * @author tony001
   * @date 2025-03-03 11:03:51
   * @static
   * @param {IChatSuggestion[]} suggestions
   * @return {*}  {string}
   */
  static stringify(suggestions: IChatSuggestion[]): string {
    const doc = document.implementation.createDocument(null, null, null);
    const root = doc.createElement('suggestions');
    root.setAttribute('version', '1.0');

    // 添加换行和缩进
    const indent = (level: number) => `\n${'  '.repeat(level)}`;
    const currentIndentLevel = 1;

    suggestions.forEach(suggestion => {
      // 添加资源间的换行和缩进
      root.appendChild(doc.createTextNode(indent(currentIndentLevel)));

      const suggestionEl = doc.createElement('suggestion');
      suggestionEl.setAttribute('type', suggestion.type);
      suggestionEl.setAttribute('version', '1.0');

      // 创建带缩进的子元素
      const createChildWithCdata = (name: string, content: object) => {
        const el = doc.createElement(name);
        el.appendChild(doc.createTextNode(indent(currentIndentLevel + 1)));
        const cdata = doc.createCDATASection(JSON.stringify(content));
        el.appendChild(cdata);
        el.appendChild(doc.createTextNode(indent(currentIndentLevel)));
        return el;
      };

      suggestionEl.appendChild(
        doc.createTextNode(indent(currentIndentLevel + 1)),
      );
      suggestionEl.appendChild(createChildWithCdata('data', suggestion.data));
      suggestionEl.appendChild(
        doc.createTextNode(indent(currentIndentLevel + 1)),
      );
      suggestionEl.appendChild(
        createChildWithCdata('metadata', suggestion.metadata),
      );
      suggestionEl.appendChild(doc.createTextNode(indent(currentIndentLevel)));

      root.appendChild(suggestionEl);
    });

    root.appendChild(doc.createTextNode('\n'));
    doc.appendChild(root);

    // 使用XMLSerializer生成带格式的字符串
    return new XMLSerializer().serializeToString(doc).replace(/></g, '>\n<'); // 在标签间添加换行
  }
}
