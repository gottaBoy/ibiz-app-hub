import {
  ViewEngineBase,
  ViewController,
  IPanelController,
  IPanelViewEvent,
  IPanelViewState,
} from '@ibiz-template/runtime';
import { IAppView } from '@ibiz/model-core';

export class PanelViewEngine extends ViewEngineBase {
  /**
   * 视图控制器
   *
   * @protected
   * @type {ViewController<IAppView, IPanelViewState, IPanelViewEvent>}
   * @memberof PanelViewEngine
   */
  declare protected view: ViewController<
    IAppView,
    IPanelViewState,
    IPanelViewEvent
  >;

  async onCreated(): Promise<void> {
    await super.onCreated();
    const { childNames } = this.view;
    childNames.push('panel');
  }

  /**
   * 面板部件
   *
   * @readonly
   * @memberof PanelViewEngine
   */
  get panel(): IPanelController {
    return this.view.getController('panel') as IPanelController;
  }

  async onMounted(): Promise<void> {
    await super.onMounted();
    // 实体面板视图加载主数据
    if (this.view.model.appDataEntityId) {
      await this.loadEntityData();
    }
  }
}
