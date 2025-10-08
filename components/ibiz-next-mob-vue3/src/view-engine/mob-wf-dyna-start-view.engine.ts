import {
  ViewController,
  IWFDynaStartViewState,
  IWFDynaStartViewEvent,
  SysUIActionTag,
  IApiMobWFDynaStartViewCall,
} from '@ibiz-template/runtime';
import { IAppDEMobWFDynaStartView } from '@ibiz/model-core';
import { MobWFDynaEditViewEngine } from './mob-wf-dyna-edit-view.engine';

export class MobWFDynaStartViewEngine extends MobWFDynaEditViewEngine {
  /**
   * 视图控制器
   *
   * @protected
   * @type {ViewController<IAppDEWFDynaStartView, IWFDynaStartViewState, IWFDynaStartViewEvent>}
   * @memberof WFDynaStartViewEngine
   */
  protected declare view: ViewController<
    IAppDEMobWFDynaStartView,
    IWFDynaStartViewState,
    IWFDynaStartViewEvent
  >;

  isCalcWFToolbar = false;

  async calcProcessFormName(): Promise<string> {
    this.isEditable = this.view.context.isEditable;
    const processForm = this.view.context.processForm
      ? `wfform_${this.view.context.processForm}`
      : 'form';
    return processForm;
  }

  async call(
    key: keyof IApiMobWFDynaStartViewCall,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    args: any,
  ): Promise<IData | null | undefined> {
    if (key === SysUIActionTag.OK) {
      this.onOkButtonClick();
      return null;
    }
    if (key === SysUIActionTag.CANCEL) {
      await this.onCancelButtonClick();
      return null;
    }
    return super.call(key, args);
  }

  /**
   * 确认按钮回调
   *
   * @author lxm
   * @date 2022-09-12 20:09:13
   */
  async onOkButtonClick(): Promise<void> {
    // 先保存数据在提交工作流
    if (this.isEditable) {
      await this.save();
    }
    await this.form.wfStart({});
    await this.view.closeView({ ok: true, data: this.getData() });
  }

  /**
   * 取消按钮回调
   *
   * @author lxm
   * @date 2022-09-12 20:09:00
   */
  async onCancelButtonClick(): Promise<void> {
    await this.view.closeView({ ok: false, data: [] });
  }

  protected calcViewFooterVisible(): boolean {
    return true;
  }
}
