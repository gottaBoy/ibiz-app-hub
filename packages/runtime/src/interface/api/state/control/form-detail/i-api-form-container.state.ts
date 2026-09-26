import { IApiFormDetailState } from './i-api-form-detail.state';
/**
 * @description 表单容器状态
 * @export
 * @interface IApiFormContainerState
 * @extends {IApiFormDetailState}
 */
export interface IApiFormContainerState extends IApiFormDetailState {
  /**
   * @description 是否显示loading状态
   * @type {boolean}
   * @memberof IApiFormContainerState
   */
  loading: boolean;

  /**
   * @description 加载提示文本
   * @type {string}
   * @memberof IApiFormContainerState
   */
  loadingText: string;
}
