import { IApiButtonContainerState } from '../../common';
import { IApiFormContainerState } from './i-api-form-container.state';

/**
 * @description 表单分组状态
 * @export
 * @interface IApiFormGroupPanelState
 * @extends {IApiFormContainerState}
 */
export interface IApiFormGroupPanelState extends IApiFormContainerState {
  /**
   * @description 界面行为组状态
   * @type {(IApiButtonContainerState | null)}
   * @memberof IApiFormGroupPanelState
   */
  actionGroupState: IApiButtonContainerState | null;

  /**
   * @description 是否折叠
   * @type {boolean}
   * @memberof IApiFormGroupPanelState
   */
  collapse: boolean;
}
