import {
  ViewEngineBase,
  ViewController,
  IWizardViewState,
  IWizardViewEvent,
  IWizardPanelController,
} from '@ibiz-template/runtime';
import { IAppDEWizardView } from '@ibiz/model-core';

export class WizardViewEngine extends ViewEngineBase {
  /**
   * 视图控制器
   *
   * @protected
   * @type {ViewController<IAppDEWizardView, IWizardViewState, IWizardViewEvent>}
   * @memberof WizardViewEngine
   */
  declare protected view: ViewController<
    IAppDEWizardView,
    IWizardViewState,
    IWizardViewEvent
  >;

  /**
   * 数据视图（卡片）部件
   *
   * @readonly
   * @memberof WizardViewEngine
   */
  get wizardPanel(): IWizardPanelController {
    return this.view.getController('wizardpanel') as IWizardPanelController;
  }

  async onCreated(): Promise<void> {
    await super.onCreated();
    const { childNames } = this.view;
    childNames.push('wizardpanel');
  }

  /**
   * 视图mounted生命周期执行逻辑
   *
   * @memberof WizardViewEngine
   */
  async onMounted(): Promise<void> {
    await super.onMounted();
    if (!this.view.slotProps.wizardpanel) {
      this.view.slotProps.wizardpanel = {};
    }

    this.wizardPanel.initialize();

    this.wizardPanel.evt.on('onFinishSuccess', event => {
      this.view.closeView({ ok: true, data: event.data });
    });
  }
}
