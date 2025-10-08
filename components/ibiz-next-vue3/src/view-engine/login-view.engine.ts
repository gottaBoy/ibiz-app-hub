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
    // 支持enter登录
    document.addEventListener('keyup', this.enterKeyListener);
  }

  /**
   * 视图destroyed生命周期执行逻辑
   *
   * @return {*}  {Promise<void>}
   * @memberof LoginViewEngine
   */
  async onDestroyed(): Promise<void> {
    super.onDestroyed();
    // 移除全局事件监听以避免内存泄漏
    document.removeEventListener('keyup', this.enterKeyListener);
  }

  async call(
    key: keyof IApiLoginViewCall,
    args: IData = {},
  ): Promise<IData | null | undefined> {
    if (key === SysUIActionTag.LOGIN) {
      await this.login(args);
      return null;
    }
    return super.call(key, args);
  }

  async login(args: IData): Promise<void> {
    let rememberme;
    const headers: IData = {};
    const data = args.data[0] || {};
    const panelDataParent: string = args.params?.panelDataParent;
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
      const loginFailed =
        window.location.href.indexOf('srfthird_auth_success=false') >= 0;
      window.location.hash = (this.route.query.ru as string) || '/';
      // 重置会话记录state,防止直接返回到登录页
      window.history.pushState({}, '');
      if (loginFailed) {
        const path = window.location.href.replace(
          '?srfthird_auth_success=false',
          '',
        );
        window.location.href = path;
      } else {
        window.location.reload();
      }
    }
  }

  /**
   * @description 取消变更
   * @param {({
   *       targetState: 'INIT' | 'UNDO' | 'REDO';
   *     })} [_args={ targetState: 'INIT' }] 目标状态，初始化状态|撤销上一步操作|重做下一步操作
   * @returns {*}  {Promise<void>}
   * @memberof LoginViewEngine
   */
  async cancelChanges(
    _args: {
      targetState: 'INIT' | 'UNDO' | 'REDO';
    } = { targetState: 'INIT' },
  ): Promise<void> {
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

  private enterKeyListener = async (event: KeyboardEvent) => {
    if (
      (event.target as IData).nodeName === 'BUTTON' &&
      event.key === 'Enter' &&
      this.view.layoutPanel
    ) {
      const args: IData = {
        data: [
          {
            username: this.view.layoutPanel.data.username,
            password: this.view.layoutPanel.data.password,
            captcha: this.view.layoutPanel.data.captcha,
          },
        ],
      };
      const targetID = (event.target as HTMLElement).dataset.id;
      if (targetID) {
        const targetPanelItem =
          this.view.layoutPanel.findPanelItemByName(targetID);
        if (targetPanelItem) {
          args.data = [targetPanelItem.data];
        }
      }
      await this.login(args);
    }
  };
}
