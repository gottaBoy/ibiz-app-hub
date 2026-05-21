import { IApiFormContainerState } from './i-api-form-container.state';

/**
 * @description 表单分页部件状态
 * @export
 * @interface IApiFormTabPanelState
 * @extends {IApiFormContainerState}
 */
export interface IApiFormTabPanelState extends IApiFormContainerState {
  /**
   * @description 当前激活的分页
   * @type {string}
   * @memberof IApiFormTabPanelState
   */
  activeTab: string;
}
