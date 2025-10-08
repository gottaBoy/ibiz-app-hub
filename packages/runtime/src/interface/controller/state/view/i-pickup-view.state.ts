import { IApiPickupViewState } from '../../../api';
import { IViewState } from './i-view.state';

/**
 * @description 实体数据选择视图UI状态
 * @export
 * @interface IPickupViewState
 * @extends {IViewState}
 * @extends {IApiPickupViewState}
 */
export interface IPickupViewState extends IViewState, IApiPickupViewState {
  /**
   * @description 选中数据
   * @type {IData[]}
   * @memberof IPickupViewState
   */
  selectedData: IData[];
}
