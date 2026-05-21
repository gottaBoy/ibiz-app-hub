/**
 * @description 直接值工具
 * @export
 * @interface IApiRawValueUtil
 */
export interface IApiRawValueUtil {
  /**
   * @description 字符串是否完全由整数/浮点数组成
   * @param {string} str 字符串
   * @returns {*}  {boolean}
   * @memberof IApiRawValueUtil
   */
  isNumber(str: string): boolean;

  /**
   * @description 转换直接值
   * @param {(string | undefined)} val 直接值
   * @returns {*}  {(number | boolean | string | undefined)}
   * @memberof IApiRawValueUtil
   */
  format(val: string | undefined): number | boolean | string | undefined;
}
