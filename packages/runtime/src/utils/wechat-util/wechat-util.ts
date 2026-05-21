import { IApiWeChatUtil } from '../../interface';

/**
 * @description 微信工具类
 * @export
 * @class WeChatUtil
 * @implements {IApiWeChatUtil}
 */
export class WeChatUtil implements IApiWeChatUtil {
  /**
   * @description 获取微信授权签名数据
   * @param {IData} data
   * @returns {*}  {(Promise<IData | undefined>)}
   * @memberof WeChatUtil
   */
  async getSign(data: IData): Promise<IData | undefined> {
    const result = await ibiz.net.request(ibiz.config.mob.mobGetSignUrl, {
      method: ibiz.config.mob.mobGetSignMethod,
      data,
    });
    if (result.ok) {
      return result.data;
    }
  }

  /**
   * @description 配置微信授权
   * @param {string[]} [jsApiList=[]] 使用js-sdk的api列表
   * @param {IData} signData 获取授权签名请求数据
   * @param {IData} [fieldMap={}] 授权签名数据与ws.config的属性映射表,分别为timestamp（时间戳属性）、nonceStr（随机字符串属性）、signature（签名属性）
   * @returns {*}  {Promise<IData>}
   * @memberof WeChatUtil
   */
  config(
    jsApiList: string[] = [],
    signData: IData = {},
    fieldMap: IData = {},
  ): Promise<IData> {
    return new Promise((resolve, reject) => {
      // 先获取授权签名
      this.getSign(signData)
        .then((data: IData | undefined) => {
          if (data) {
            // 微信授权签名数据与config的映射关系字段
            const timestampField = fieldMap.timestamp || 'timestamp';
            const nonceStrField = fieldMap.nonceStr || 'nonceStr';
            const signatureField = fieldMap.signature || 'signature';
            // wx为引入的微信sdk，wx为全局变量，具体请查看微信sdk文档
            (window as IData).wx.config({
              debug: ibiz.config.mob.mobWeChatDebug,
              appId: ibiz.env.mobWeChatAppId,
              timestamp: data[timestampField],
              nonceStr: data[nonceStrField],
              signature: data[signatureField],
              jsApiList,
            });
            (window as IData).wx.ready((event: IData) => {
              // config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，
              // config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，
              // 则须把相关接口放在ready函数中调用来确保正确执行。对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中
              resolve(event);
            });
            (window as IData).wx.error((error: IData) => {
              // config信息验证失败会执行error函数，如签名过期导致验证失败，
              // 具体错误信息可以打开config的debug模式查看，
              // 也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
              reject(error);
            });
          }
        })
        .catch(error => {
          reject(error);
        });
    });
  }
}
