import { IApiPickupDataViewState } from '../../../api';
import { IDataViewState } from './i-data-view.state';
import { IPickupMDViewState } from './i-pickup-md-view.state';

/**
 * @description 实体选择数据视图（部件视图）UI状态
 * @export
 * @interface IPickupDataViewState
 * @extends {IDataViewState}
 * @extends {IApiPickupDataViewState}
 */
export interface IPickupDataViewState
  extends IDataViewState,
    IPickupMDViewState,
    IApiPickupDataViewState {}
