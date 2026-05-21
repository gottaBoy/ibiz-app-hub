/**
 * @description 文本工具
 * @export
 * @interface IApiTextUtil
 */
export interface IApiTextUtil {
  /**
   * @description 格式化文本，遵循excel格式化标准
   * @param {string} value 文本值
   * @param {string} format 格式
   * @returns {*}  {string}
   * @memberof IApiTextUtil
   */
  format(value: string, format: string): string;

  /**
   * @description 拷贝文本到剪切板
   * @param {string} value 拷贝文本值
   * @returns {*}  {boolean}
   * @memberof IApiTextUtil
   */
  copy(value: string): boolean;

  /**
   * @description 文本是否包含中文字符
   * @param {string} str 文本
   * @returns {*}  {boolean}
   * @memberof IApiTextUtil
   */
  isChineseCharacter(str: string): boolean;

  /**
   * @description 文本是否包含中文和英文字符
   * @param {string} str 文本
   * @returns {*}  {boolean}
   * @memberof IApiTextUtil
   */
  hasChineseAndEnglish(str: string): boolean;

  /**
   * @description 文本转十六进制颜色
   * @param {string} text 颜色字符串
   * @returns {*}  {string}
   * @memberof IApiTextUtil
   */
  stringToHexColor(text: string): string;

  /**
   * @description 获取文本缩写
   * @param {string} text 文本
   * @returns {*}  {(string | void)}
   * @memberof IApiTextUtil
   */
  abbreviation(text: string): string | void;
}
