import {
  CoreConst,
  HttpError,
  clearAppCookie,
  getAppCookie,
  getRandomInt,
  setAppCookie,
} from '@ibiz-template/core';
import { IAuthService, IAuthInfo, IAuthResult } from '../../../interface';

/**
 * 认证服务
 *
 * @author chitanda
 * @date 2022-07-19 18:07:51
 * @export
 * @class AuthService
 */
export class V7AuthService implements IAuthService {
  get isAnonymous(): boolean {
    return getAppCookie(CoreConst.IS_ANONYMOUS) === '1';
  }

  /**
   * 使用匿名账号登录
   *
   * @author tony001
   * @date 2024-05-14 17:05:47
   * @return {*}  {Promise<boolean>}
   */
  async anonymousLogin(): Promise<boolean> {
    const { anonymousUser, anonymousPwd } = ibiz.env;
    if (!anonymousUser || !anonymousPwd) {
      ibiz.log.error(ibiz.i18n.t('runtime.service.noFoundUsernamePassword'));
      return false;
    }
    let password = anonymousPwd;
    let headers = {};
    if (ibiz.env.enableEncryption) {
      password = await ibiz.util.encryption.encryptByRSA(
        `${anonymousPwd}|${getRandomInt()}`,
      );
      headers = { 'captcha-state': 'RSA' };
    }
    const result = await this.login(
      anonymousUser,
      password,
      undefined,
      headers,
    );
    if (result) {
      setAppCookie(CoreConst.IS_ANONYMOUS, '1', 0);

      // 全部改成session级别的
      const token = getAppCookie(CoreConst.TOKEN)!;
      const expirein = getAppCookie(CoreConst.TOKEN_EXPIRES)!;
      const remember = getAppCookie(CoreConst.TOKEN_REMEMBER)!;
      const refreshToken = getAppCookie(CoreConst.REFRESH_TOKEN)!;
      setAppCookie(CoreConst.TOKEN, token, 0);
      setAppCookie(CoreConst.TOKEN_EXPIRES, expirein, 0);
      setAppCookie(CoreConst.TOKEN_REMEMBER, remember, 0);
      if (refreshToken) {
        setAppCookie(CoreConst.REFRESH_TOKEN, refreshToken, 0);
      }
    }
    return result;
  }

  /**
   * 登录
   *
   * @author tony001
   * @date 2024-05-14 17:05:54
   * @param {string} loginName
   * @param {string} password
   * @param {boolean} [remember]
   * @param {IData} [headers]
   * @return {*}  {Promise<boolean>}
   */
  async login(
    loginName: string,
    password: string,
    remember?: boolean,
    headers?: IData,
  ): Promise<boolean> {
    // eslint-disable-next-line no-useless-catch
    try {
      this.clearAuthData();
      if (ibiz.env.enableEncryption) {
        password = await ibiz.util.encryption.encryptByRSA(
          `${password}|${getRandomInt()}`,
        );
        headers = { ...headers, 'captcha-state': 'RSA' };
      }
      const res = await ibiz.net.post(
        '/v7/login',
        {
          loginname: loginName,
          password,
          rememberme: remember,
        },
        {},
        headers,
      );
      const { data } = res;
      if (data && data.token) {
        const cacheDay = remember ? 30 : 0;
        if (remember) {
          setAppCookie(CoreConst.TOKEN_REMEMBER, '1', cacheDay);
        }
        setAppCookie(CoreConst.TOKEN, data.token, cacheDay);
        const expiredDate =
          new Date().getTime() + (data.expirein || 7199) * 1000;
        setAppCookie(CoreConst.TOKEN_EXPIRES, `${expiredDate}`, cacheDay);
        if (data.refresh_token) {
          setAppCookie(CoreConst.REFRESH_TOKEN, data.refresh_token, cacheDay);
        }
        clearAppCookie(CoreConst.IS_ANONYMOUS);
      }
      return true;
    } catch (err: unknown) {
      ibiz.notification.error({
        title: ibiz.i18n.t('runtime.service.loginFailure'),
        desc: (err as HttpError).message || '',
      });
    }
    return false;
  }

  /**
   * 登出
   *
   * @author tony001
   * @date 2024-05-14 17:05:04
   * @return {*}  {Promise<boolean>}
   */
  async logout(): Promise<boolean> {
    try {
      await ibiz.net.get('/v7/logout');
      this.clearAuthData();
      return true;
    } catch (err: unknown) {
      ibiz.notification.error({
        title: ibiz.i18n.t('runtime.service.logoutFailure'),
        desc: (err as HttpError).message || '',
      });
    }
    return false;
  }

  /**
   * 变更密码
   *
   * @author tony001
   * @date 2024-05-14 17:05:22
   * @param {string} oldPwd
   * @param {string} newPwd
   * @return {*}  {Promise<IAuthResult>}
   */
  async changePwd(oldPwd: string, newPwd: string): Promise<IAuthResult> {
    try {
      let headers = {};
      if (ibiz.env.enableEncryption) {
        oldPwd = await ibiz.util.encryption.encryptByRSA(
          `${oldPwd}|${getRandomInt()}`,
        );
        newPwd = await ibiz.util.encryption.encryptByRSA(
          `${newPwd}|${getRandomInt()}`,
        );
        headers = { 'captcha-state': 'RSA' };
      }
      const res = await ibiz.net.post(
        '/uaa/changepwd',
        {
          oldPwd,
          newPwd,
        },
        {},
        headers,
      );
      return { ok: true, result: res };
    } catch (err: unknown) {
      return { ok: false, result: err as IData };
    }
  }

  /**
   * 页面未关闭情况下，自动延长登录时间
   *
   * @param {IParams} [context]
   * @return {*}  {Promise<void>}
   * @memberof V7AuthService
   */
  async extendLogin(context?: IParams): Promise<void> {
    if (this.isAnonymous) {
      // 匿名登录不需要延长都是会话级的
      return;
    }

    const token = getAppCookie(CoreConst.TOKEN);
    const expirein = getAppCookie(CoreConst.TOKEN_EXPIRES);
    if (token && expirein) {
      const remaining = Number(expirein) - Date.now();
      if (!Number.isFinite(remaining) || remaining <= 0) {
        return;
      }
      // Short-lived tokens need a positive delay, with at most five minutes of advance.
      const early = Math.min(5 * 60 * 1000, remaining / 4);
      const wait = Math.min(
        2147483647,
        Math.max(1, Math.floor(remaining - early)),
      );
      setTimeout(async () => {
        const remember = getAppCookie(CoreConst.TOKEN_REMEMBER);
        const refreshToken = getAppCookie(CoreConst.REFRESH_TOKEN);
        const cacheDay = remember ? 30 : 0;
        let res;
        if (refreshToken != null && refreshToken !== '') {
          res = await ibiz.net.get(`/uaa/refresh_token/${refreshToken}`);
        } else {
          res = await ibiz.net.get(`/uaa/refreshtoken2`);
        }
        if (res.ok) {
          if (remember) {
            setAppCookie(CoreConst.TOKEN_REMEMBER, '1', cacheDay);
          }
          setAppCookie(CoreConst.TOKEN, res.data.token, cacheDay);
          const expiredDate =
            new Date().getTime() + (res.data.expirein || 7199) * 1000;
          setAppCookie(CoreConst.TOKEN_EXPIRES, `${expiredDate}`, cacheDay);
          if (res.data.refresh_token) {
            setAppCookie(
              CoreConst.REFRESH_TOKEN,
              res.data.refresh_token,
              cacheDay,
            );
          }
          // token刷新后，更新 appData
          await this.loadAppData(context);
          // 刷新token之后用新的token重连mqtt
          ibiz.hub.initMqtt();
        } else {
          clearAppCookie(CoreConst.TOKEN_REMEMBER);
          clearAppCookie(CoreConst.REFRESH_TOKEN);
        }
        // 下一次延时做准备
        this.extendLogin(context);
      }, wait);
    }
  }

  /**
   * 通过refreshToken换算token
   *
   * @author tony001
   * @date 2024-05-14 17:05:45
   * @return {*}  {Promise<void>}
   */
  async refreshToken(): Promise<void> {
    const remember = getAppCookie(CoreConst.TOKEN_REMEMBER);
    const refreshToken = getAppCookie(CoreConst.REFRESH_TOKEN);
    if (refreshToken != null && refreshToken !== '') {
      const res = await ibiz.net.get(`/uaa/refresh_token/${refreshToken}`);
      if (res.ok) {
        const cacheDay = remember ? 30 : 0;
        if (remember) {
          setAppCookie(CoreConst.TOKEN_REMEMBER, '1', cacheDay);
        }
        setAppCookie(CoreConst.TOKEN, res.data.token, cacheDay);
        const expiredDate =
          new Date().getTime() + (res.data.expirein || 7199) * 1000;
        setAppCookie(CoreConst.TOKEN_EXPIRES, `${expiredDate}`, cacheDay);
        if (res.data.refresh_token) {
          setAppCookie(
            CoreConst.REFRESH_TOKEN,
            res.data.refresh_token,
            cacheDay,
          );
        }
        clearAppCookie(CoreConst.IS_ANONYMOUS);
      } else {
        clearAppCookie(CoreConst.TOKEN_REMEMBER);
        clearAppCookie(CoreConst.REFRESH_TOKEN);
      }
    } else {
      throw new Error('refreshToken is null');
    }
  }

  /**
   * 获取当前环境的权限信息（无登录则返回undefined）
   *
   * @author tony001
   * @date 2024-05-14 17:05:57
   * @return {*}  {(IAuthInfo | undefined)}
   */
  getAuthInfo(): IAuthInfo | undefined {
    const token = getAppCookie(CoreConst.TOKEN);
    const isAnonymous = !!getAppCookie(CoreConst.IS_ANONYMOUS);
    return token
      ? {
          token,
          isAnonymous,
        }
      : undefined;
  }

  /**
   * 加载应用数据
   *
   * @protected
   * @param {IParams} [context]
   * @return {*}  {Promise<void>}
   * @memberof V7AuthService
   */
  protected async loadAppData(context?: IParams): Promise<void> {
    let res;
    if (context && Object.keys(context).length > 0) {
      res = await ibiz.net.get('/appdata', context);
    } else {
      res = await ibiz.net.get('/appdata');
    }
    if (res.ok) {
      ibiz.appData = res.data;
    }
  }

  /**
   * 清空权限数据
   *
   * @author tony001
   * @date 2024-05-14 17:05:18
   */
  clearAuthData(): void {
    clearAppCookie(CoreConst.TOKEN);
    clearAppCookie(CoreConst.TOKEN_EXPIRES);
    clearAppCookie(CoreConst.TOKEN_REMEMBER);
    clearAppCookie(CoreConst.REFRESH_TOKEN);
    clearAppCookie(CoreConst.IS_ANONYMOUS);
    ibiz.appData = undefined;
    ibiz.orgData = undefined;
  }
}
