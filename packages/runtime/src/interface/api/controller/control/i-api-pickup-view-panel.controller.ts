import { IDEPickupViewPanel } from '@ibiz/model-core';
import { IApiData } from '@ibiz-template/core';
import { IApiPickupViewPanelState } from '../../state';
import { IApiControlController } from './i-api-control.controller';
import { IApiViewController } from '../view';

/**
 * 选择视图面板
 * @description 承载选择视图（部件视图），传递选中数据给选择视图，并监听内部视图的数据选择并规范化返回给外部调用组件。
 * @primary
 * @export
 * @interface IApiPickupViewPanelController
 * @extends {IApiControlController<T, S>}
 * @template T
 * @template S
 */
export interface IApiPickupViewPanelController<
  T extends IDEPickupViewPanel = IDEPickupViewPanel,
  S extends IApiPickupViewPanelState = IApiPickupViewPanelState,
> extends IApiControlController<T, S> {
  /**
   * @description 选择视图嵌入视图控制器
   * @type {IApiViewController}
   * @memberof IApiPickupViewPanelController
   */
  embedView: IApiViewController;

  /**
   * @description 获取选中数据
   * @returns {*}  {Promise<IApiData[]>}
   * @memberof IApiPickupViewPanelController
   */
  getSelectedData(): Promise<IApiData[]>;

  /**
   * @description 设置选中数据
   * @param {IApiData[]} items 数据集合
   * @returns {*}  {Promise<void>}
   * @memberof IApiPickupViewPanelController
   */
  setSelectedData(items: IApiData[]): Promise<void>;

  /**
   * @description 获取所有数据
   * @returns {*}  {Promise<IApiData[]>}
   * @memberof IApiPickupViewPanelController
   */
  getAllData(): Promise<IApiData[]>;
}
