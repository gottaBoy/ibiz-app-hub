import qs from 'qs';
import {
  HttpError,
  LoginMode,
  RuntimeError,
  UrlHelper,
} from '@ibiz-template/core';
import { IErrorHandler } from '@ibiz-template/runtime';

/**
 * 没有权限的错误处理器
 *
 * @author lxm
 * @date 2022-10-11 14:10:10
 * @export
 * @class UnauthorizedHandler
 */
export class UnauthorizedHandler implements IErrorHandler {
  match(error: unknown): boolean {
    return (
      error instanceof HttpError &&
      (error.status === 401 || error.status === 403)
    );
  }

  /**
   * @description 是否存在403错误未处理
   * @protected
   * @type {boolean}
   * @memberof UnauthorizedHandler
   */
  protected hasPermErrPending: boolean = false;

  /**
   * oauth登录处理
   *
   * @author tony001
   * @date 2024-12-22 10:12:48
   * @protected
   * @return {*}  {Promise<void>}
   */
  protected async oauthLogin(): Promise<void> {
    if (window.location.href.indexOf('srfthird_auth_success=false') >= 0) {
      ibiz.log.debug('获取OAUTH的token失败，跳转正常登录页');
      this.normalLogin();
    }
    const res = await ibiz.thirdAuth.auth('OAUTH', 'THIRD');
    if (!res.ok) {
      ibiz.log.debug('获取OAUTH重定向地址失败，跳转正常登录页');
      this.normalLogin();
    }
  }

  /**
   * cas登录处理
   *
   * @author lxm
   * @date 2022-10-11 14:10:35
   * @protected
   * @returns {*}  {Promise<void>}
   */
  protected async casLogin(): Promise<void> {
    if (!ibiz.env.casLoginUrl) {
      throw new RuntimeError(
        ibiz.i18n.t('webApp.unauthorizedHandler.noFoundEnvParams'),
      );
    }
    const { origin } = window.location;
    const baseUrl = `${origin}${ibiz.env.baseUrl}`;

    // 登录后返回来的登录的地址
    const backUrl = `${baseUrl}/cas/v7/login${qs.stringify(
      {
        RU: UrlHelper.fullPath,
        base: baseUrl,
      },
      { addQueryPrefix: true },
    )}`;

    // 要跳转的cas的登录页和参数
    const hasQueryPrefix = ibiz.env.casLoginUrl.indexOf('?') !== -1;
    const targetUrl =
      ibiz.env.casLoginUrl +
      (hasQueryPrefix ? '&' : '?') +
      qs.stringify(
        {
          service: backUrl,
        },
        { addQueryPrefix: false },
      );

    // 跳转cas登录地址
    window.location.href = targetUrl;
  }

  /**
   * 普通登录处理
   *
   * @author lxm
   * @date 2022-10-11 14:10:24
   * @protected
   * @returns {*}  {Promise<void>}
   */
  protected async normalLogin(): Promise<void> {
    const ru = window.location.hash.replace('#', '');
    const targetUrl = `${UrlHelper.routeBase}/login?ru=${encodeURIComponent(
      ru,
    )}`;
    // 改无权限跳转登录页后，刷新页面。避免无权限模型加载异常
    document.body.style.display = 'none';
    window.location.href = targetUrl;
    window.location.reload();
  }

  /**
   * 处理403
   * @author lxm
   * @date 2023-12-06 10:19:12
   * @protected
   * @return {*}  {Promise<void>}
   */
  protected async handle403(error: HttpError): Promise<void> {
    if (error.tag === 'APPINIT') {
      // 存在403错误用户未确认，再次触发403错误时不做处理
      if (this.hasPermErrPending) {
        return;
      }
      this.hasPermErrPending = true;
      const result = await ibiz.confirm.warning({
        title: ibiz.i18n.t('webApp.unauthorizedHandler.forbiddenAccess'),
        desc: ibiz.i18n.t('webApp.unauthorizedHandler.logoutAccount'),
      });
      this.hasPermErrPending = false;
      if (result) {
        const bol = await ibiz.hub.controller.logout();
        if (bol) {
          window.location.reload();
        }
      }
    } else {
      ibiz.mc.error.send(error as IData);
    }
  }

  /**
   * 没有权限处理
   *
   * @author lxm
   * @date 2022-10-11 14:10:50
   * @returns {*}  {Promise<void>}
   */
  handle(error: unknown): boolean | undefined {
    if (error instanceof HttpError) {
      if (error.status === 401) {
        // 若是匿名登录，则直接使用匿名账户登录。不用跳转登录页
        const search = qs.parse(window.location.search.replace('?', ''));
        if (
          (search.isAnonymous || ibiz.env.enableAnonymous) &&
          // 匿名登录获取视图模型发生异常，走普通登录，防止循环执行
          error.tag !== 'APPINIT'
        ) {
          ibiz.auth.anonymousLogin().then(bol => {
            if (bol) {
              // 登录成功后直接刷新页面，避免界面初始化异常
              window.location.reload();
            }
          });
        } else if (ibiz.env.loginMode === LoginMode.CAS) {
          this.casLogin();
        } else if (ibiz.env.loginMode === LoginMode.OAUTH) {
          this.oauthLogin();
        } else {
          this.normalLogin();
        }
        return true;
      }
      if (error.status === 403) {
        this.handle403(error);
        return true;
      }
    }
  }
}
