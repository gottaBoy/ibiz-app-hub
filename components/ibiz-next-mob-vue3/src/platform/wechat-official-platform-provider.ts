import { getToken, UrlHelper } from '@ibiz-template/core';
import { isAndroid } from '@ibiz-template/runtime';
import { useViewStack } from '../util';
import { MobPlatformProviderBase } from './mob-platform-provider-base';

type IConfigParams = {
  /**
   * @description 公众号的唯一标识
   * @type {string}
   */
  appId: string;

  /**
   * @description 生成签名的时间戳
   * @type {string}
   */
  timestamp: string;

  /**
   * @description 生成签名的随机串
   * @type {string}
   */
  nonceStr: string;

  /**
   * @description 签名
   * @type {string}
   */
  signature: string;

  /**
   * @description 需要使用的JS接口列表
   * @type {string[]}
   */
  jsApiList: string[];
};

/**
 * @description 微信公众号搭载平台适配器
 * @export
 * @class WeChatOfficialPlatformProvider
 * @extends {MobPlatformProviderBase}
 */
export class WeChatOfficialPlatformProvider extends MobPlatformProviderBase {
  /**
   * @description 获取配置参数
   * @private
   * @returns {*}  {(Promise<IConfigParams | undefined>)}
   * @memberof WeChatOfficialPlatformProvider
   */
  private async getConfigParams(): Promise<IConfigParams | undefined> {
    // 当前应用路径
    // const url = window.location.href.split('#')[0];
    // TODO 发送后台获取微信公众号权限校验参数
    return undefined;
  }

  /**
   * @description 初始化
   * @returns {*}  {Promise<void>}
   * @memberof WeChatOfficialPlatformProvider
   */
  async init(): Promise<void> {
    if (!window.wx) return;
    const config = await this.getConfigParams();
    if (config) {
      return new Promise((resolve, reject) => {
        window.wx.ready(() => {
          resolve();
        });
        window.wx.error((err: IData) => {
          reject(err);
        });
        window.wx.config(config);
      });
    }
  }

  /**
   * @description 下载文件
   * @param {string} url
   * @param {string} name
   * @return {*}
   * @memberof WeChatOfficialPlatformProvider
   */
  async download(url: string, name: string): Promise<boolean> {
    // 安卓环境下微信浏览器不支持直接下载，需跳转到默认浏览器中下载
    if (isAndroid()) {
      const search = new URLSearchParams({
        fileurl: encodeURIComponent(url),
        filename: encodeURIComponent(name),
        token: getToken() || '',
      });
      window.open(`${UrlHelper.routeBase}/download?${search}`, '_self');
      return Promise.resolve(true);
    }
    return super.download(url, name);
  }

  /**
   * 返回事件
   *
   * @memberof WeChatOfficialPlatformProvider
   */
  back(): void {
    const { goBack } = useViewStack();
    goBack();
  }

  getShowViewHeader(): boolean {
    return true;
  }

  getShowPresetBack(): boolean {
    return false;
  }
}
