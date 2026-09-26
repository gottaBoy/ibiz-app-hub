import { IApiFormContainerState } from '../../../state';
import { IApiFormDetailController } from './i-api-form-detail.controller';
/**
 * @description 表单容器控制器
 * @export
 * @interface IApiFormContainerController
 * @extends {IApiFormDetailController}
 */
export interface IApiFormContainerController extends IApiFormDetailController {
  /**
   * @description 表单容器状态
   * @type {IApiFormContainerState}
   * @memberof IApiFormContainerController
   */
  state: IApiFormContainerState;

  /**
   * @description 开始加载中
   * @param {(string | undefined)} [loadingText] 加载提示文本
   * @memberof IApiFormContainerState
   */
  startLoading(loadingText?: string): void;

  /**
   * @description 结束加载中
   * @memberof IApiFormContainerState
   */
  endLoading(): void;
}
