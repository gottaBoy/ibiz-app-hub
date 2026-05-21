import { IApiPanelContainerState } from '../../../state';
import { IApiPanelItemController } from './i-api-panel-item.controller';

/**
 * @description 面板容器控制器接口
 * @primary
 * @export
 * @interface IPanelItemController
 * @extends {IApiPanelItemController}
 */
export interface IApiPanelContainerController extends IApiPanelItemController {
  /**
   * @description 面板容器状态
   * @exposedoc
   * @type {IApiPanelContainerState}
   * @memberof IApiPanelContainerController
   */
  state: IApiPanelContainerState;

  /**
   * @description 开始加载中
   * @exposedoc
   * @memberof IApiPanelContainerController
   */
  startLoading(): void;

  /**
   * @description 结束加载中
   * @exposedoc
   * @memberof IApiPanelContainerController
   */
  endLoading(): void;
}
