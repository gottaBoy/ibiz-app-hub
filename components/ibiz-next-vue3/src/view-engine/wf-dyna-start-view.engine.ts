import {
  ViewController,
  IWFDynaStartViewState,
  IWFDynaStartViewEvent,
  SysUIActionTag,
  IApiWFDynaStartViewCall,
} from '@ibiz-template/runtime';
import { IAppDEWFDynaStartView } from '@ibiz/model-core';
import { WFDynaEditViewEngine } from './wf-dyna-edit-view.engine';

export class WFDynaStartViewEngine extends WFDynaEditViewEngine {
  /**
   * 视图控制器
   *
   * @protected
   * @type {ViewController<IAppDEWFDynaStartView, IWFDynaStartViewState, IWFDynaStartViewEvent>}
   * @memberof WFDynaStartViewEngine
   */
  declare protected view: ViewController<
    IAppDEWFDynaStartView,
    IWFDynaStartViewState,
    IWFDynaStartViewEvent
  >;

  isCalcWFToolbar = false;

  async calcProcessFormName(): Promise<string> {
    this.isEditable = this.view.context.isEditable === 'true';
    const processForm = this.view.context.processForm
      ? `wfform_${this.view.context.processForm}`
      : 'form';
    return processForm;
  }

  async call(
    key: keyof IApiWFDynaStartViewCall,
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
    await this.save({ silent: true });
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
}
