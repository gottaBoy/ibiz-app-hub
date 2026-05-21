import { IApiParams } from '../global-param';

/**
 * @description 多语言工具接口
 * @export
 * @interface IApiI18n
 */
export interface IApiI18n {
  /**
   * @description 设置当前语言
   * @param {string} lang 语言
   * @memberof IApiI18n
   */
  setLang(lang: string): void;

  /**
   * @description 获取当前语言
   * @returns {*}  {string}
   * @memberof IApiI18n
   */
  getLang(): string;

  /**
   * @description 消息格式化
   * @param {string} tag 消息key
   * @param {IApiParams} [options] 翻译配置
   * @returns {*}  {string}
   * @memberof IApiI18n
   */
  t(tag: string, options?: IApiParams): string;

  /**
   * @description 消息格式化
   * @param {string} tag 消息key
   * @param {string} [defaultMsg] 未找到翻译时默认呈现的消息
   * @param {IApiParams} [options] 翻译配置
   * @returns {*}  {string}
   * @memberof IApiI18n
   */
  t(tag: string, defaultMsg?: string, options?: IApiParams): string;

  /**
   * @description 合并指定语言语言资源
   * @param {string} lang 语言
   * @param {IApiParams} data 语言资源
   * @memberof IApiI18n
   */
  mergeLocaleMessage(lang: string, data: IApiParams): void;

  /**
   * @description 合并语言资源
   * @param {IApiParams} data 语言资源
   * @memberof IApiI18n
   */
  mergeLocaleMessage(data: IApiParams): void;
}
