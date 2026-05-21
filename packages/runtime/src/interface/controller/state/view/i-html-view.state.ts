import { IApiHtmlViewState } from '../../../api';
import { IViewState } from './i-view.state';

/**
 * @description 实体html视图UI状态
 * @export
 * @interface IHtmlViewState
 * @extends {IViewState}
 * @extends {IApiHtmlViewState}
 */
export interface IHtmlViewState extends IViewState, IApiHtmlViewState {}
