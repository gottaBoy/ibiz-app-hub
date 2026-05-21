import { PanelContainerController } from '@ibiz-template/runtime';
import { IPanelContainer } from '@ibiz/model-core';
import { PanelContainerGroupState } from './panel-container-group.state';

/**
 * 面板分组容器控制器
 *
 * @export
 * @class PanelContainerGroupController
 * @extends {PanelContainerController}
 */
export class PanelContainerGroupController extends PanelContainerController<IPanelContainer> {
  /**
   * @description 状态
   * @exposedoc
   * @type {PanelContainerGroupState}
   * @memberof PanelContainerGroupController
   */
  declare state: PanelContainerGroupState;

  protected createState(): PanelContainerGroupState {
    return new PanelContainerGroupState(this.parent?.state);
  }

  /**
   * @description 禁用关闭
   * @exposedoc
   * @readonly
   * @type {boolean}
   */
  get disableClose(): boolean {
    const { titleBarCloseMode: mode } = this.model;
    return mode === 0 || mode === undefined;
  }

  /**
   * @description 是否默认展开分组
   * @exposedoc
   * @readonly
   */
  get defaultExpansion(): boolean {
    const { titleBarCloseMode: mode } = this.model;
    return this.disableClose || mode === 1;
  }
}
