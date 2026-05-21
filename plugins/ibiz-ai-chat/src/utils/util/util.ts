/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 生成随机字符串
 *
 * @export
 * @return {*}  {string}
 */
function S4(): string {
  // eslint-disable-next-line no-bitwise
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}

/**
 * 创建UUID
 *
 * @author chitanda
 * @date 2023-10-13 16:10:17
 * @export
 * @return {*}  {string}
 */
export function createUUID(): string {
  return `${S4() + S4()}-${S4()}-${S4()}-${S4()}-${S4()}${S4()}${S4()}`;
}

/**
 * 截取最后一个@符号之前的字符串，如果没有@符号，返回原字符串
 * @param str
 * @returns
 */
export function getStringBeforeLastAt(str: string): string {
  const lastAtIndex = str.lastIndexOf('@');
  if (lastAtIndex === -1) {
    return str;
  }
  return str.substring(0, lastAtIndex);
}

const SvgPattern = /<svg\b[^>]*>[\s\S]*?<\/svg>/;

/**
 * 判断字符串是否是svg的格式
 *
 * @author tony001
 * @date 2025-03-12 17:03:40
 * @export
 * @param {string} str
 * @return {*}  {boolean}
 */
export function isSvg(str: string): boolean {
  return SvgPattern.test(str);
}

const TOPIC_CHAT_PREFIX: string = 'topic';

const INLINE_CHAT_SUFFIX: string = 'inline';

const TEMP_CHAT_SUFFIX: string = 'temp';

const UNKOWN_CHAT_SUFFIX: string = 'unknow';
/**
 * 获取会话标识(TOPIC:适用于多话题场景；INLINE：适用于ai行内会话场景；TEMP：适用于传统ai编辑器会话场景)
 * @param sessionID
 */
export function getChatSessionId(
  type: 'TOPIC' | 'INLINE' | 'TEMP',
  sessionID?: string,
): string {
  let tempSessionID = '';
  switch (type) {
    case 'TOPIC':
      tempSessionID += TOPIC_CHAT_PREFIX;
      break;
    case 'INLINE':
      tempSessionID += INLINE_CHAT_SUFFIX;
      break;
    case 'TEMP':
      tempSessionID += TEMP_CHAT_SUFFIX;
      break;
    default:
      tempSessionID += UNKOWN_CHAT_SUFFIX;
      break;
  }
  tempSessionID += `@${sessionID || createUUID()}@${new Date().getTime()}`;
  return tempSessionID;
}

/**
 * @description 解析url对象查询参数，防止浏览器不支持解析URL
 * @export
 * @param {string} search
 * @return {*}  {any}
 */
export function parseSearchParams(search: string): any {
  const result: any = {};
  if (search.startsWith('?')) {
    search = search.substring(1);
  }
  const pairs: string[] = search.split('&');
  for (let i = 0; i < pairs.length; i++) {
    const [key, value] = pairs[i].split('=');
    result[key] = value;
  }
  return result;
}

/**
 * 解析预置协议的字符串
 * @export
 * @param {string} urlStr
 * @return {*}  {{
 *   context: any;
 *   params: any;
 *   typeId: string;
 * }}
 */
export function parsePredefProtocol(urlStr: string): {
  context: any;
  params: any;
  typeId: string;
} {
  const url = new URL(urlStr);
  const context: any = {};
  const params: any = {};
  let typeId = '';
  if (url.searchParams.size > 0) {
    const navCtx = url.searchParams.get('srfnavctx');
    if (navCtx) {
      try {
        Object.assign(context, JSON.parse(navCtx));
      } catch (error) {
        console.error('srfnavctx 参数解析失败');
      }
      url.searchParams.delete('srfnavctx');
    }
    url.searchParams.forEach((value, _key) => {
      params[_key] = value;
    });
    // 路径中存在search但searchParams为空，说明浏览器不支持URLSearchParams对象
  } else if (url.search) {
    const searchParams = parseSearchParams(url.search);
    const navCtx: string = searchParams.srfnavctx;
    if (navCtx) {
      try {
        const value = decodeURIComponent(navCtx);
        Object.assign(context, JSON.parse(value));
      } catch (error) {
        console.error('srfnavctx 参数解析失败');
      }
      delete searchParams.srfnavctx;
    }
    Object.keys(searchParams).forEach(key => {
      params[key] = searchParams[key];
    });
  }
  // 兼容edge浏览器
  const pathname = url.pathname || url.hostname;
  const rdTagItems = pathname.replace('//', '').split('/');
  // 当只有一个时，为视图标识。当有两个时，第二个是视图标识
  const [appOrViewTag, viewTag] = rdTagItems;
  if (viewTag) {
    typeId = viewTag;
  } else {
    typeId = appOrViewTag;
  }

  return {
    context,
    params,
    typeId,
  };
}

export class TextUtil {
  /**
   * input元素，用于存储拷贝的文本
   *
   * @author zhanghengfeng
   * @date 2023-08-31 20:08:06
   * @private
   * @type {(HTMLInputElement | null)}
   */
  static inputElement: HTMLInputElement | null = null;

  /**
   * 拷贝文本
   *
   * @author zhanghengfeng
   * @date 2023-08-31 11:08:51
   * @param {string} value
   * @return {*}  {boolean}
   */
  static copy(value: string): boolean {
    if (!this.inputElement) {
      this.inputElement = document.createElement('input');
      this.inputElement.style.position = 'absolute';
      this.inputElement.style.left = '-9999px';
      document.body.appendChild(this.inputElement);
    }
    this.inputElement.value = value;
    this.inputElement.select();
    return document.execCommand('copy');
  }
}
