import { IApiPanelItemState } from './i-api-panel-item.state';

/**
 * @primary
 * @description 面板容器状态
 * @export
 * @interface IApiPanelContainerState
 * @extends {IApiPanelItemState}
 */
export interface IApiPanelContainerState extends IApiPanelItemState {
  /**
   * @description 是否显示loading状态
   * @exposedoc
   * @type {boolean}
   * @memberof IApiPanelContainerState
   */
  loading: boolean;

  /**
   * @description 加载提示文本
   * @exposedoc
   * @type {string}
   * @memberof IApiPanelContainerState
   */
  loadingText: string;
}
