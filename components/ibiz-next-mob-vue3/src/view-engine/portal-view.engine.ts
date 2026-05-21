import {
  ViewEngineBase,
  ViewController,
  IAppPortalViewState,
  IAppPortalViewEvent,
  IWizardPanelController,
} from '@ibiz-template/runtime';
import { IAppPortalView } from '@ibiz/model-core';

export class PortalViewEngine extends ViewEngineBase {
  /**
   * 视图控制器
   *
   * @protected
   * @type {ViewController<IAppDEAppPortalView, IAppPortalViewState, IAppPortalViewEvent>}
   * @memberof PortalViewEngine
   */
  declare protected view: ViewController<
    IAppPortalView,
    IAppPortalViewState,
    IAppPortalViewEvent
  >;

  /**
   * 数据看板部件
   *
   * @readonly
   * @memberof PortalViewEngine
   */
  get dashboard(): IWizardPanelController {
    return this.view.getController('dashboard') as IWizardPanelController;
  }

  async onCreated(): Promise<void> {
    await super.onCreated();
    const { childNames } = this.view;
    childNames.push('dashboard');
  }
}
