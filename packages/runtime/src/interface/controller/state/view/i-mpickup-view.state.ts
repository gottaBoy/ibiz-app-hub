import { IApiMPickupViewState } from '../../../api';
import { IPickupViewState } from './i-pickup-view.state';
import { IViewState } from './i-view.state';

/**
 * @description 实体数据多项选择视图UI状态
 * @export
 * @interface IMPickupViewState
 * @extends {IViewState}
 * @extends {IApiMPickupViewState}
 */
export interface IMPickupViewState
  extends IViewState,
    IPickupViewState,
    IApiMPickupViewState {}
