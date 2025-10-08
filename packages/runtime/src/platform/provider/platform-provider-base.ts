import { downloadFileFromBlob, RuntimeError } from '@ibiz-template/core';
import { IPlatformProvider } from '../../interface';

/**
 * 搭载平台处理器基类
 *
 * @author zk
 * @date 2023-11-20 03:11:13
 * @export
 * @abstract
 * @class PlatformProviderBase
 * @implements {IPlatformProvider}
 */
export abstract class PlatformProviderBase implements IPlatformProvider {
  // 保存浏览器标签原始标题
  sourceTitle = document.title;

  back(): void {}

  async init(): Promise<void> {}

  async destroyed(): Promise<void> {}

  async login(
    loginName: string,
    passWord: string,
    _verificationCode?: string | undefined,
  ): Promise<boolean> {
    return ibiz.auth.login(loginName, passWord);
  }

  async download(url: string, name: string): Promise<boolean> {
    // 发送get请求
    const response = await ibiz.net.request(url, {
      method: 'get',
      responseType: 'blob',
      baseURL: '',
    });
    if (response.status !== 200) {
      throw new RuntimeError(ibiz.i18n.t('runtime.platform.failedDownload'));
    }
    // 请求成功，后台返回的是一个文件流
    if (!response.data) {
      throw new RuntimeError(ibiz.i18n.t('runtime.platform.fileStreamData'));
    } else {
      // 获取文件名
      const fileName = name;
      downloadFileFromBlob(response.data as Blob, fileName);
      return Promise.resolve(true);
    }
  }

  /**
   * @description 设置浏览器标签页标题
   * @param {string} title
   * @memberof PlatformProviderBase
   */
  setBrowserTitle(title: string): void {
    const app = ibiz.hub.getApp();
    let tabTitle: string = '';
    if (ibiz.env.AppLabel) {
      tabTitle = ibiz.env.AppLabel;
    } else if (app.model.title) {
      tabTitle = app.model.title;
    } else {
      tabTitle = this.sourceTitle;
    }
    // 隐藏应用标题时，有视图标题就显示视图标题，没有时则显示应用标题
    if (ibiz.env.isMob && !ibiz.config.mob.mobShowAppTitle) {
      document.title = title || tabTitle;
    } else if (title) {
      document.title = `${tabTitle} - ${title}`;
    } else {
      document.title = tabTitle;
    }
  }
}
