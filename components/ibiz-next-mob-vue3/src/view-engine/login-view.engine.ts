import {
  SysUIActionTag,
  ViewController,
  ViewEngineBase,
  IAppLoginViewState,
  IAppLoginViewEvent,
  IApiLoginViewCall,
} from '@ibiz-template/runtime';
import { RouteLocationNormalizedLoaded, useRoute } from 'vue-router';
import { IPanelField, IAppView } from '@ibiz/model-core';
import { PanelFieldController } from '@ibiz-template/vue3-util';
import { notNilEmpty } from 'qx-util';

export class LoginViewEngine extends ViewEngineBase {
  /**
   * 路由对象
   *
   * @type {RouteLocationNormalizedLoaded}
   * @memberof LoginViewEngine
   */
  route: RouteLocationNormalizedLoaded = useRoute();

  /**
   * 应用登录视图控制器
   *
   * @protected
   * @type {ViewController<
   *     IAppView,
   *     IAppLoginViewState,
   *     IAppLoginViewEvent
   *   >}
   * @memberof LoginViewEngine
   */
  protected declare view: ViewController<
    IAppView,
    IAppLoginViewState,
    IAppLoginViewEvent
  >;

  /**
   * 视图mounted生命周期执行逻辑
   *
   * @return {*}  {Promise<void>}
   * @memberof LoginViewEngine
   */
  async onMounted(): Promise<void> {
    super.onMounted();
  }

  /**
   * 视图destroyed生命周期执行逻辑
   *
   * @return {*}  {Promise<void>}
   * @memberof LoginViewEngine
   */
  async onDestroyed(): Promise<void> {
    super.onDestroyed();
  }

  async call(
    key: keyof IApiLoginViewCall,
    args: IData = {},
  ): Promise<IData | null | undefined> {
    if (key === SysUIActionTag.LOGIN) {
      await this.login(args);
      return null;
    }
    if (key === SysUIActionTag.CANCEL_CHANGES) {
      await this.cancelChanges();
      return null;
    }
    return super.call(key, args);
  }

  async login(args: IData): Promise<void> {
    let rememberme;
    const headers: IData = {};
    const data = args.data[0] || {};
    const panelDataParent: string = args.params.panelDataParent;
    if (this.view.layoutPanel) {
      if (!(await this.view.layoutPanel.validate(panelDataParent))) {
        return;
      }
      const panelData: IData = this.view.layoutPanel.data;
      // 记住我
      if (typeof panelData.isRemember === 'boolean') {
        rememberme = panelData.isRemember;
      }
      // 验证码从登录表单中获取
      if (data.captcha) {
        Object.assign(headers, data.captcha);
      }
      // 自定义请求头数据
      if (panelData.srfheaders) {
        Object.assign(headers, panelData.srfheaders);
      }
    }
    let username = data.username;
    if (notNilEmpty(data.orgid)) {
      username = `${data.username}@${data.orgid}`;
    }
    const bol = await ibiz.auth.login(
      username,
      data.password,
      rememberme,
      headers,
    );
    this.view.evt.emit('onAfterLogin', { ok: bol, panelDataParent });
    if (bol === true) {
      // 保存登录后的目标地址
      const ru = (this.route.query.ru as string) || '/';
      // hash重置为初始空状态
      window.location.hash = '';
      // 将当前历史路由状态给替换成初始状态
      window.history.replaceState({}, '');
      // 重新赋值路由为目标页面地址
      window.location.hash = ru;
      // 重新加载目标页面
      const loadFailed =
        window.location.href.indexOf('srfthird_auth_success=false') >= 0;
      if (!loadFailed) {
        // 不是从授权页面跳转过来的
        window.location.reload();
      } else {
        // 从授权页面跳过来的需要地址栏里面的标记
        const path = window.location.href.replace(
          '?srfthird_auth_success=false',
          '',
        );
        window.location.href = path;
      }
    }
  }

  async cancelChanges(): Promise<void> {
    if (this.view.layoutPanel) {
      Object.keys(this.view.layoutPanel.panelItems).forEach(key => {
        const controller = this.view.layoutPanel!.panelItems[
          key
        ] as unknown as PanelFieldController;
        const { viewFieldName } = controller.model as IPanelField;
        if (viewFieldName) {
          controller.setDataValue('', viewFieldName);
        }
      });
    }
  }
}
