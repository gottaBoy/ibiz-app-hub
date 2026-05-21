/**
 * @description 加密工具类
 * @export
 * @interface IApiEncryptionUtil
 */
export interface IApiEncryptionUtil {
  /**
   * @description RSA加密
   * @param {string} plainText 待加密文本
   * @returns {*}  {Promise<string>}
   * @memberof IApiEncryptionUtil
   */
  encryptByRSA(plainText: string): Promise<string>;
}
