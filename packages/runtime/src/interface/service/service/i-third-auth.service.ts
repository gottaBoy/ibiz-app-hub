export interface IThirdAuthResult {
  /**
   * 是否成功
   *
   * @author tony001
   * @date 2024-11-18 16:11:01
   * @type {boolean}
   */
  ok: boolean;

  /**
   * 数据
   *
   * @author tony001
   * @date 2024-11-18 16:11:16
   * @type {IData}
   */
  data?: IData;
}
/**
 * 第三方授权服务接口
 *
 * @author tony001
 * @date 2024-11-18 14:11:04
 * @export
 * @interface IThirdAuthService
 */
export interface IThirdAuthService {
  /**
   * 授权
   *
   * @author tony001
   * @date 2024-11-18 14:11:19
   * @param {('DINGTALK' | 'WXWORK' | 'OAUTH'  |string)} type 授权类型：钉钉 | 企业微信 | OAUTH | 自定义
   * @param {('EMBED' | 'THIRD')} mode 授权模式：嵌入 | 第三方（网页扫码）
   * @param {IData} [params] 授权参数
   * @return {*}  {Promise<IThirdAuthResult>}
   */
  auth(
    type: 'DINGTALK' | 'WXWORK' | 'OAUTH' | string,
    mode: 'EMBED' | 'THIRD',
    params?: IData,
  ): Promise<IThirdAuthResult>;
}
