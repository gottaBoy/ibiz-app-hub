import { IApiPickupGridViewState } from '../../../api';
import { IGridViewState } from './i-grid-view.state';
import { IPickupMDViewState } from './i-pickup-md-view.state';

/**
 * @description 实体选择表格视图（部件视图）UI状态
 * @export
 * @interface IPickupGridViewState
 * @extends {IGridViewState}
 * @extends {IApiPickupGridViewState}
 */
export interface IPickupGridViewState
  extends IGridViewState,
    IPickupMDViewState,
    IApiPickupGridViewState {}
