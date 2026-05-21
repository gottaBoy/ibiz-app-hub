import { PanelNotifyState } from '../../../../../controller';
import { IPanelController } from '../i-panel.controller';
import { IPanelItemContainerController } from './i-panel-item-container.controller';
import { IApiPanelItemController } from '../../../../api';
import { AppCounter } from '../../../../../service';
/**
 * @description 面板成员控制器接口
 * @export
 * @interface IPanelItemController
 * @extends {IApiPanelItemController}
 */
export interface IPanelItemController extends IApiPanelItemController {
  /**
   * @description 面板控制器
   * @type {IPanelController}
   * @memberof IPanelItemController
   */
  panel: IPanelController;

  /**
   * @description 父容器控制器(除了根成员都存在)
   * @type {IPanelItemContainerController}
   * @memberof IPanelItemController
   */
  parent?: IPanelItemContainerController;

  /**
   * @description 计数器对象
   * @type {AppCounter}
   * @memberof IPanelItemController
   */
  counter?: AppCounter;

  /**
   * @description 面板数据变更通知(由面板控制器调用)
   * @param {string[]} names
   * @returns {*}  {Promise<void>}
   * @memberof IPanelItemController
   */
  dataChangeNotify(names: string[]): Promise<void>;

  /**
   * @description 面板状态变更通知
   * @param {PanelNotifyState} state
   * @returns {*}  {Promise<void>}
   * @memberof IPanelItemController
   */
  panelStateNotify(state: PanelNotifyState): Promise<void>;

  /**
   * @description 值校验
   * @returns {*}  {Promise<boolean>}
   * @memberof IPanelItemController
   */
  validate(): Promise<boolean>;

  /**
   * @description 销毁方法
   * @memberof IPanelItemController
   */
  destroy(): void;
}
