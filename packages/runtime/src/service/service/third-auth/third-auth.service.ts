/* eslint-disable import/no-extraneous-dependencies */
import * as dd from 'dingtalk-jsapi';
import qs from 'qs';
import {
  clearAppCookie,
  CoreConst,
  RuntimeError,
  setAppCookie,
} from '@ibiz-template/core';
import { IThirdAuthResult, IThirdAuthService } from '../../../interface';

export class ThirdAuthService implements IThirdAuthService {
  /**
   * 第三方授权
   *
   * @author tony001
   * @date 2024-11-18 14:11:58
   * @param {('DINGTALK' | 'WXWORK' | 'OAUTH'  |string)} type 授权类型：钉钉 | 企业微信 | OAUTH | 自定义
   * @param {('EMBED' | 'THIRD')} mode
   * @param {IData} [params]
   * @return {*}  {Promise<IThirdAuthResult>}
   */
  async auth(
    type: 'DINGTALK' | 'WXWORK' | 'OAUTH' | string,
    mode: 'EMBED' | 'THIRD',
    params?: IData,
  ): Promise<IThirdAuthResult> {
    switch (type) {
      case 'DINGTALK':
        return mode === 'EMBED'
          ? this.dingTalkEmbedAuth()
          : this.dingTalkThirddAuth();
      case 'WXWORK':
        return mode === 'EMBED'
          ? this.wxWorkEmbedAuth()
          : this.wxWorkThirddAuth();
      case 'OAUTH':
        return this.oauthThirdAuth(params);
      default:
        throw new RuntimeError(
          ibiz.i18n.t('runtime.service.thirdAuth.noSupported', { type }),
        );
    }
  }

  /**
   * 清空权限数据
   *
   * @author tony001
   * @date 2024-11-18 17:11:31
   * @private
   */
  private clearAuthData(): void {
    clearAppCookie(CoreConst.TOKEN);
    clearAppCookie(CoreConst.TOKEN_EXPIRES);
    clearAppCookie(CoreConst.TOKEN_REMEMBER);
    clearAppCookie(CoreConst.REFRESH_TOKEN);
    clearAppCookie(CoreConst.IS_ANONYMOUS);
    ibiz.appData = undefined;
    ibiz.orgData = undefined;
  }

  /**
   * 获取需要的location部分
   *
   * @author tony001
   * @date 2024-11-18 17:11:31
   * @private
   * @return {*}  {string}
   */
  private getNeedLocation(): string {
    // 截取地址，拼接需要部分组成新地址
    const scheme = window.location.protocol;
    const host = window.location.hostname;
    let baseUrl: string = `${scheme}//${host}`;
    const { port } = window.location;
    if (port && port !== '80' && port !== '443') {
      baseUrl += `:${port}`;
    }
    baseUrl += window.location.pathname;
    return baseUrl;
  }

  /**
   * 钉钉嵌入授权
   *
   * @author tony001
   * @date 2024-11-18 14:11:30
   * @return {*}  {Promise<IThirdAuthResult>}
   */
  async dingTalkEmbedAuth(): Promise<IThirdAuthResult> {
    this.clearAuthData();
    const search = qs.parse(window.location.search.replace('?', ''));
    try {
      if (!search.corpId) {
        throw new RuntimeError(
          ibiz.i18n.t('runtime.service.thirdAuth.corpidError'),
        );
      }
      const headers: IData = { srfdcsystem: ibiz.env.dcSystem };
      const res = await dd.runtime.permission.requestAuthCode({
        corpId: search.corpId as string,
      });
      if (!res || !res.code) {
        throw new RuntimeError(
          ibiz.i18n.t('runtime.service.thirdAuth.dingTalkCodeErrir'),
        );
      }
      if (res && res.code) {
        const response = await ibiz.net.get(
          `/uaa/open/dingtalk/auth/${res.code}`,
          {},
          headers,
        );

        if (response && response.status === 200 && response.data.token) {
          setAppCookie(CoreConst.TOKEN, response.data.token, 0);
          const expiredDate = new Date().getTime() + 7199 * 1000;
          setAppCookie(CoreConst.TOKEN_EXPIRES, `${expiredDate}`, 0);
          clearAppCookie(CoreConst.IS_ANONYMOUS);
          window.location.href = './';
          return { ok: true, data: response.data };
        }
        window.location.href = './?srfthird_auth_success=false';
        return { ok: false, data: response.data };
      }
      throw new RuntimeError(
        ibiz.i18n.t('runtime.service.thirdAuth.dingTalkAuthError'),
      );
    } catch (error) {
      window.location.href = './?srfthird_auth_success=false';
      return { ok: false, data: {} };
    }
  }

  /**
   * 钉钉扫码授权
   *
   * @author tony001
   * @date 2024-11-18 14:11:40
   * @return {*}  {Promise<IThirdAuthResult>}
   */
  async dingTalkThirddAuth(): Promise<IThirdAuthResult> {
    const headers: IData = { srfdcsystem: ibiz.env.dcSystem };
    const response = await ibiz.net.get(
      `/uaa/open/dingtalk/appid`,
      {},
      headers,
    );

    if (response && response.status === 200) {
      const { data } = response;
      if (data) {
        // 截取地址，拼接需要部分组成新地址
        const baseUrl = this.getNeedLocation();
        // 1.钉钉开放平台提供的appId
        const appId = data.appid;
        // 2.钉钉扫码后回调地址,需要UrlEncode转码
        let redirectUri =
          `${baseUrl}dingtalk.html?id=${data.appid}&srfdcsystem=${ibiz.env.dcSystem}` +
          `&baseUrl=${ibiz.env.baseUrl}/${ibiz.env.appId}`;
        if (
          ibiz.env.cookieDomain &&
          window.location.href.indexOf(ibiz.env.cookieDomain) !== -1
        ) {
          redirectUri += `&srfcookiedomain=${ibiz.env.cookieDomain}`;
        }
        const redirectUriEncode = encodeURIComponent(redirectUri);
        // 3.钉钉扫码url
        const url =
          `https://oapi.dingtalk.com/connect/qrconnect?response_type=code` +
          `&appid=${appId}&redirect_uri=${redirectUriEncode}&scope=snsapi_login` +
          `&state=STATE`;
        // 4.跳转钉钉扫码
        window.location.href = url;
        return { ok: true, data };
      }
    }
    throw new RuntimeError(ibiz.i18n.t('runtime.service.thirdAuth.appIdError'));
  }

  /**
   * 企业微信嵌入授权
   *
   * @author tony001
   * @date 2024-11-18 14:11:55
   * @return {*}  {Promise<IThirdAuthResult>}
   */
  async wxWorkEmbedAuth(): Promise<IThirdAuthResult> {
    const headers: IData = { srfdcsystem: ibiz.env.dcSystem };
    try {
      const response = await ibiz.net.get(
        `/uaa/open/wxwork/appid`,
        {},
        headers,
      );
      if (response && response.status === 200) {
        const { data } = response;
        if (data && (data.corp_id || data.appid)) {
          // 截取地址，拼接需要部分组成新地址
          const baseUrl = this.getNeedLocation();
          const appId = data.appid; // 企业id
          const agentId = data.agentid; // 应用的标识编码
          // 2.认证成功后回调地址,需要UrlEncode转码
          let redirectUri =
            `${baseUrl}wxwork.html?id=${agentId}&srfdcsystem=${ibiz.env.dcSystem}` +
            `&baseUrl=${ibiz.env.baseUrl}/${ibiz.env.appId}`;
          if (
            ibiz.env.cookieDomain &&
            window.location.href.indexOf(ibiz.env.cookieDomain) !== -1
          ) {
            redirectUri += `&srfcookiedomain=${ibiz.env.cookieDomain}`;
          }
          const redirectUriEncode = encodeURIComponent(redirectUri);
          let scope = 'snsapi_base';
          if (ibiz.env.isMob) {
            scope = 'snsapi_privateinfo';
          }

          // 3.微信认证url
          const tempurl =
            `https://open.weixin.qq.com/connect/oauth2/authorize?response_type=code&scope=${scope}` +
            `&appid=${appId}&agentid=${agentId}&redirect_uri=${redirectUriEncode}` +
            `&state=STATE#wechat_redirect`;

          // 4.跳转到微信认证地址
          window.location.href = tempurl;
          return { ok: true, data };
        }
      }
      window.location.href = './?srfthird_auth_success=false';
      return { ok: false, data: {} };
    } catch (error) {
      ibiz.message.error(ibiz.i18n.t('runtime.service.thirdAuth.appIdError'));
      window.location.href = './?srfthird_auth_success=false';
      return { ok: false, data: {} };
    }
  }

  /**
   * 企业微信扫码授权
   *
   * @author tony001
   * @date 2024-11-18 14:11:04
   * @return {*}  {Promise<IThirdAuthResult>}
   */
  async wxWorkThirddAuth(): Promise<IThirdAuthResult> {
    const headers: IData = { srfdcsystem: ibiz.env.dcSystem };
    const response = await ibiz.net.get(`/uaa/open/wxwork/appid`, {}, headers);
    if (response && response.status === 200) {
      const { data } = response;
      if (data && (data.corp_id || data.appid)) {
        // 截取地址，拼接需要部分组成新地址
        const baseUrl = this.getNeedLocation();
        const appId = data.appid; //  企业id
        const agentId = data.agentid; // 应用的标识编码
        // 2.认证成功后回调地址,需要UrlEncode转码
        let redirectUri =
          `${baseUrl}wxwork.html?id=${agentId}&srfdcsystem=${ibiz.env.dcSystem}` +
          `&baseUrl=${ibiz.env.baseUrl}/${ibiz.env.appId}`;
        if (
          ibiz.env.cookieDomain &&
          window.location.href.indexOf(ibiz.env.cookieDomain) !== -1
        ) {
          redirectUri += `&srfcookiedomain=${ibiz.env.cookieDomain}`;
        }
        const redirectUriEncode = encodeURIComponent(redirectUri);
        // 3.微信认证url
        const url = `https://open.work.weixin.qq.com/wwopen/sso/qrConnect?appid=${appId}&agentid=${agentId}&redirect_uri=${redirectUriEncode}&scope=snsapi_base&state=STATE`;
        // 4.跳转到微信认证地址
        window.location.href = url;
        return { ok: true, data };
      }
    }
    throw new RuntimeError(ibiz.i18n.t('runtime.service.thirdAuth.appIdError'));
  }

  /**
   * oauth 登录
   *
   * @author tony001
   * @date 2024-12-22 11:12:56
   * @param {IData} [params={}]
   * @return {*}  {Promise<IThirdAuthResult>}
   */
  async oauthThirdAuth(params: IData = {}): Promise<IThirdAuthResult> {
    const oauthOpenAccessId =
      params.oauthopenaccessid || ibiz.env.oauthOpenAccessId;
    if (!oauthOpenAccessId) {
      throw new RuntimeError(
        ibiz.i18n.t('runtime.service.thirdAuth.oauthOpenAccessIdError'),
      );
    }
    // 截取地址，拼接需要部分组成新地址
    const baseUrl = this.getNeedLocation();
    // 拼接重定向地址
    const redirectUri = `${baseUrl}oauth.html`;
    const res = await ibiz.net.get(
      `/uaa/open/oauth2-${oauthOpenAccessId}/authorize`,
      { redirect_uri: redirectUri },
    );
    if (res.ok && res.data) {
      const targetUri: string = res.data as unknown as string;
      const lastAccessParams: IData = {
        srfdcsystem: ibiz.env.dcSystem,
        baseurl: `${ibiz.env.baseUrl}/${ibiz.env.appId}`,
        oauthopenaccessid: oauthOpenAccessId,
        srfredirect_uri: encodeURIComponent(window.location.href),
      };
      if (
        ibiz.env.cookieDomain &&
        window.location.href.indexOf(ibiz.env.cookieDomain) !== -1
      ) {
        Object.assign(lastAccessParams, {
          srfcookiedomain: ibiz.env.cookieDomain,
        });
      }
      localStorage.setItem(
        'last-access-params',
        JSON.stringify(lastAccessParams),
      );
      ibiz.log.debug('OAUTH重定向跳转:', targetUri);
      window.location.href = targetUri;
      return { ok: true };
    }
    return { ok: false };
  }
}
