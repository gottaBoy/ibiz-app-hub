import {
  IButtonContainerState,
  PanelContainerState,
} from '@ibiz-template/runtime';

/**
 * 面板分组容器状态
 *
 * @author lxm
 * @date 2023-02-07 06:04:27
 * @export
 * @class PanelContainerGroupState
 * @extends {PanelContainerState}
 */
export class PanelContainerGroupState extends PanelContainerState {
  /**
   * 界面行为组状态
   *
   * @type {(IButtonContainerState | null)}
   * @memberof PanelContainerGroupState
   */
  actionGroupState: IButtonContainerState | null = null;
}
