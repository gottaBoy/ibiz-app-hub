import {
  ViewController,
  SysUIActionTag,
  IOptViewState,
  IOptViewEvent,
  ViewCallTag,
  IApiMobOptViewCall,
} from '@ibiz-template/runtime';
import { IAppDEEditView } from '@ibiz/model-core';
import { MobEditViewEngine } from './mob-edit-view.engine';

export class MobOptViewEngine extends MobEditViewEngine {
  /**
   * 视图控制器
   *
   * @protected
   * @type {ViewController<IAppDEEditView, IOptViewState, IOptViewEvent>}
   * @memberof MobOptViewEngine
   */
  protected declare view: ViewController<
    IAppDEEditView,
    IOptViewState,
    IOptViewEvent
  >;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
  async call(key: keyof IApiMobOptViewCall, args: any): Promise<any> {
    if (key === SysUIActionTag.CANCEL) {
      this.cancel();
      return null;
    }
    if (key === SysUIActionTag.OK) {
      await this.confirm();
      return null;
    }
    if (key === ViewCallTag.LOAD) {
      this.load();
      return null;
    }
    if (key === ViewCallTag.VALIDATE) {
      return this.form.validate();
    }
    return super.call(key, args);
  }

  /**
   * 确认
   *
   * @memberof MobOptViewEngine
   */
  async confirm(): Promise<void> {
    await this.form.save();
    this.view.closeView({ ok: true, data: this.getData() });
  }

  /**
   * 取消
   *
   * @memberof MobOptViewEngine
   */
  cancel(): void {
    this.view.modal.ignoreDismissCheck = true;
    this.view.closeView({ ok: false, data: [] });
  }

  protected calcViewFooterVisible(): boolean {
    return true;
  }
}
