import {
  ViewController,
  IWFDynaActionViewState,
  IWFDynaActionViewEvent,
  SysUIActionTag,
  IApiWFDynaActionViewCall,
} from '@ibiz-template/runtime';
import { IAppDEWFDynaActionView } from '@ibiz/model-core';
import { WFDynaEditViewEngine } from './wf-dyna-edit-view.engine';

export class WFDynaActionViewEngine extends WFDynaEditViewEngine {
  /**
   * 视图控制器
   *
   * @protected
   * @type {ViewController<IAppDEWFDynaActionView, IWFDynaActionViewState, IWFDynaActionViewEvent>}
   * @memberof WFDynaActionViewEngine
   */
  declare protected view: ViewController<
    IAppDEWFDynaActionView,
    IWFDynaActionViewState,
    IWFDynaActionViewEvent
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
    key: keyof IApiWFDynaActionViewCall,
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
    if (this.view.context.isEditable) {
      await this.save({ silent: true });
    } else {
      // 如果不需要调用保存需手动 将修改状态置空
      this.form.state.modified = false;
    }
    await this.form.wfSubmit({});
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
