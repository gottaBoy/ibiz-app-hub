import { IApiViewState } from './i-api-view.state';

/**
 * @description 实体html视图UI状态
 * @export
 * @interface IApiHtmlViewState
 * @extends {IApiViewState}
 */
export interface IApiHtmlViewState extends IApiViewState {
  /**
   * @description 指定html视图的 iframe 元素所加载的目标网页 URL 地址
   * @type {string}
   * @memberof IApiHtmlViewState
   */
  htmlUrl: string;
}
