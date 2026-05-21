/* eslint-disable import/no-extraneous-dependencies */
import * as dd from 'dingtalk-jsapi';
import { useViewStack } from '../util';
import { MobPlatformProviderBase } from './mob-platform-provider-base';

type IConfigParams = {
  /**
   * @description 企业内部应用的agentId
   * @type {string}
   */
  agentId: string;

  /**
   * @description 企业ID
   * @type {string}
   */
  corpId: string;

  /**
   * @description 签名时间戳
   * @type {string}
   */
  timeStamp: string;

  /**
   * @description 随机字符串
   * @type {string}
   */
  nonceStr: string;

  /**
   * @description 签名
   * @type {string}
   */
  signature: string;

  /**
   * @description 授权API集合
   * @type {string[]}
   */
  jsApiList: string[];
};

/**
 * @description 钉钉搭载平台适配器
 * @export
 * @class DingTalkPlatformProvider
 * @extends {MobPlatformProviderBase}
 */
export class DingTalkPlatformProvider extends MobPlatformProviderBase {
  /**
   * @description 获取配置参数
   * @private
   * @returns {*}  {(Promise<IConfigParams | undefined>)}
   * @memberof DingTalkPlatformProvider
   */
  private async getConfigParams(): Promise<IConfigParams | undefined> {
    // 当前应用路径
    // const url = window.location.href.split('#')[0];
    // TODO 发送后台获取钉钉权限校验参数
    return undefined;
  }

  /**
   * @description 初始化
   * @returns {*}  {Promise<void>}
   * @memberof DingTalkPlatformProvider
   */
  async init(): Promise<void> {
    if (!dd) return;
    const config = await this.getConfigParams();
    if (config) dd.config(config);
  }

  /**
   * @description 设置浏览器标签页标题
   * @param {string} title
   * @memberof PlatformProviderBase
   */
  setBrowserTitle(title: string): void {
    const app = ibiz.hub.getApp();
    let tabTitle: string =
      ibiz.env.AppLabel || app.model.title || this.sourceTitle;
    if (!ibiz.config.mob.mobShowAppTitle) {
      tabTitle = title;
    } else if (title) {
      tabTitle = `${tabTitle} - ${title}`;
    }
    if (dd) {
      dd.setNavigationTitle({
        title: tabTitle,
      });
    } else {
      super.setBrowserTitle(title);
    }
  }

  /**
   * 返回
   *
   * @memberof DingTalkPlatformProvider
   */
  back(): void {
    const { goBack } = useViewStack();
    if (dd) {
      dd.goBackPage({
        fail: (res: IData) => {
          // 如果当前环境没有 goBackPage 则走默认的预置的返回逻辑
          if (res.errorMessage === 'API not exists') goBack();
        },
      });
    } else {
      goBack();
    }
  }

  getShowViewHeader(): boolean {
    return true;
  }

  getShowPresetBack(): boolean {
    return false;
  }
}
