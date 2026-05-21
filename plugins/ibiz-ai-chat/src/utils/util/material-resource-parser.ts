import { IMaterial } from '../../interface';

/**
 * 素材资源解析器
 *
 * @author tony001
 * @date 2025-03-03 11:03:59
 * @export
 * @class MaterialResourceParser
 */
export class MaterialResourceParser {
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
   * @return {*}  {IMaterial[]}
   */
  static parse(xmlString: string): IMaterial[] {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    const resources = Array.from(xmlDoc.querySelectorAll('resource'));

    return resources.map(res => {
      const type = res.getAttribute('type') || '';

      const dataElement = res.querySelector('data');
      const metadataElement = res.querySelector('metadata');

      try {
        const dataContent = this.getCdataContent(dataElement);
        const metadataContent = this.getCdataContent(metadataElement);
        const data = dataContent ? JSON.parse(dataContent) : {};
        const metadata = metadataContent ? JSON.parse(metadataContent) : {};
        const id = data.id;

        return { id, type, data, metadata } as IMaterial;
      } catch (e) {
        throw new Error(`XML 解析错误: ${(e as Error).message}`);
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
   *     resources: IMaterial[];
   *     remainingText: string;
   *     hasResources: boolean;
   *     error?: string;
   *   }}
   */
  static parseMixedContent(input: string): {
    /** 解析出的资源对象数组 */
    resources: IMaterial[];
    /** 去除 XML 后的剩余文本 */
    remainingText: string;
    /** 是否存在有效资源标签 */
    hasResources: boolean;
    /** 解析错误信息 (可选) */
    error?: string;
  } {
    // 匹配完整的 <resources> 标签内容 (包含属性)
    const resourceRegex = /<resources\b[^>]*>[\s\S]*?<\/resources>/i;
    const match = resourceRegex.exec(input);

    if (!match) {
      return {
        resources: [],
        remainingText: input,
        hasResources: false,
      };
    }

    // 提取并移除 XML 部分
    const [fullMatch] = match;
    const matchStart = match.index;
    const matchEnd = matchStart + fullMatch.length;
    const remainingText = (input.slice(0, matchStart) + input.slice(matchEnd))
      .replace(/\n/g, '')
      .replace(/(!\[[^\]]*\]\([^)]+\))/g, '\n$1\n')
      .replace(/\n+/g, '\n')
      .replace(/^\n|\n$/g, '');

    try {
      // 复用原有解析逻辑
      const resources = this.parse(fullMatch);
      return {
        resources,
        remainingText,
        hasResources: true,
      };
    } catch (error) {
      return {
        resources: [],
        remainingText,
        hasResources: true,
        error: `资源解析失败: ${(error as Error).message}`,
      };
    }
  }

  /**
   * 数据对象转 XML 字符串
   *
   * @author tony001
   * @date 2025-03-03 11:03:51
   * @static
   * @param {IMaterial[]} resources
   * @return {*}  {string}
   */
  static stringify(resources: IMaterial[]): string {
    const doc = document.implementation.createDocument(null, null, null);
    const root = doc.createElement('resources');
    root.setAttribute('version', '1.0');

    // 添加换行和缩进
    const indent = (level: number) => `\n${'  '.repeat(level)}`;
    const currentIndentLevel = 1;

    resources.forEach(res => {
      // 添加资源间的换行和缩进
      root.appendChild(doc.createTextNode(indent(currentIndentLevel)));

      const resourceEl = doc.createElement('resource');
      resourceEl.setAttribute('type', res.type);
      resourceEl.setAttribute('version', '1.0');

      // 创建带缩进的子元素
      const createChildWithCdata = (name: string, content: object) => {
        const el = doc.createElement(name);
        el.appendChild(doc.createTextNode(indent(currentIndentLevel + 1)));
        const cdata = doc.createCDATASection(JSON.stringify(content));
        el.appendChild(cdata);
        el.appendChild(doc.createTextNode(indent(currentIndentLevel)));
        return el;
      };

      resourceEl.appendChild(
        doc.createTextNode(indent(currentIndentLevel + 1)),
      );
      resourceEl.appendChild(createChildWithCdata('data', res.data));
      resourceEl.appendChild(
        doc.createTextNode(indent(currentIndentLevel + 1)),
      );
      resourceEl.appendChild(createChildWithCdata('metadata', res.metadata));
      resourceEl.appendChild(doc.createTextNode(indent(currentIndentLevel)));

      root.appendChild(resourceEl);
    });

    root.appendChild(doc.createTextNode('\n'));
    doc.appendChild(root);

    // 使用XMLSerializer生成带格式的字符串
    return new XMLSerializer().serializeToString(doc).replace(/></g, '>\n<'); // 在标签间添加换行
  }
}
