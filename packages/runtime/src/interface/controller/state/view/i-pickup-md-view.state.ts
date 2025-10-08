import { IApiPickupMDViewState } from '../../../api';
import { IMDViewState } from './i-md-view.state';

/**
 * @description 选择多数据视图UI状态
 * @export
 * @interface IPickupMDViewState
 * @extends {IMDViewState}
 * @extends {IApiPickupMDViewState}
 */
export interface IPickupMDViewState
  extends IMDViewState,
    IApiPickupMDViewState {
  /**
   * @description 是否单选
   * @type {boolean}
   * @memberof IPickupMDViewState
   */
  singleSelect: boolean;

  /**
   * @description 选择数据
   * @type {IData[]}
   * @memberof IPickupMDViewState
   */
  selectedData: IData[];
}
