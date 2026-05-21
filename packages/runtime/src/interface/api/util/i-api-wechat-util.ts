import { IApiData } from '@ibiz-template/core';

/**
 * @description 微信工具类
 * @export
 * @interface IApiWeChatUtil
 */
export interface IApiWeChatUtil {
  /**
   * @description 获取微信授权签名
   * @param {IApiData} data 请求数据
   * @returns {*}  {(Promise<IApiData | undefined>)}
   * @memberof IApiWeChatUtil
   */
  getSign(data: IApiData): Promise<IApiData | undefined>;

  /**
   * @description 配置微信授权
   * @param {string[]} [jsApiList=[]] 使用js-sdk的api列表
   * @param {IApiData} signData 获取授权签名请求数据
   * @param {{
   *       timestamp?: string;
   *       nonceStr?: string;
   *       signature?: string;
   *     }} [fieldMap] 授权签名数据与ws.config的属性映射表,分别为timestamp（时间戳属性）、nonceStr（随机字符串属性）、signature（签名属性）
   * @returns {*}  {Promise<IApiData>}
   * @memberof IApiWeChatUtil
   */
  config(
    jsApiList?: string[],
    signData?: IApiData,
    fieldMap?: {
      timestamp?: string;
      nonceStr?: string;
      signature?: string;
    },
  ): Promise<IApiData>;
}
