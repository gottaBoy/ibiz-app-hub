import { PanelItemController } from '@ibiz-template/runtime';
import { IPanelTabPanel } from '@ibiz/model-core';
import { PanelTabPanelState } from './panel-tab-panel.state';

export class PanelTabPanelController extends PanelItemController<IPanelTabPanel> {
  declare state: PanelTabPanelState;

  /**
   * 新建状态
   *
   * @author tony001
   * @date 2024-05-12 14:05:16
   * @protected
   * @return {*}  {PanelTabPanelState}
   */
  protected createState(): PanelTabPanelState {
    return new PanelTabPanelState(this.parent?.state);
  }

  /**
   * 初始化
   *
   * @author tony001
   * @date 2024-05-12 14:05:51
   * @return {*}  {Promise<void>}
   */
  async onInit(): Promise<void> {
    await super.onInit();
    this.state.activeTab = this.model.panelTabPages?.[0].id || '';
  }

  /**
   * @description 分页点击切换处理
   * @exposedoc
   * @param {string} tabId
   */
  onTabChange(tabId: string): void {
    this.state.activeTab = tabId;
  }
}
