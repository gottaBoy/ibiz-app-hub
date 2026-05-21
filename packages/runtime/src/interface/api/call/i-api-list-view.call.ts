import { IApiMDViewCall } from './i-api-md-view.call';

/**
 * @description 实体列表视图能力
 * @export
 * @interface IApiListViewCall
 * @extends {IApiMDViewCall}
 */
export interface IApiListViewCall extends IApiMDViewCall {
  /**
   * @description 展开列表分组，srfcollapsetag: 列表分组标识，srfgroup: 列表分组标识，优先取srfcollapsetag参数
   * @type {{
   *     args: { params: { srfcollapsetag?: string; srfgroup?: string } };
   *   }}
   * @memberof IApiListViewCall
   */
  Expand: {
    args: { params: { srfcollapsetag?: string; srfgroup?: string } };
  };
  /**
   * @description 收缩列表分组，srfcollapsetag: 列表分组标识，srfgroup: 列表分组标识，优先取srfcollapsetag参数
   * @type {{
   *     args: { params: { srfcollapsetag?: string; srfgroup?: string } };
   *   }}
   * @memberof IApiListViewCall
   */
  Collapse: {
    args: { params: { srfcollapsetag?: string; srfgroup?: string } };
  };
  /**
   * @description 全部展开
   * @type {{
   *     args: undefined;
   *   }}
   * @memberof IApiListViewCall
   */
  ExpandAll: {
    args: undefined;
  };
  /**
   * @description 全部收缩
   * @type {{
   *     args: undefined;
   *   }}
   * @memberof IApiListViewCall
   */
  CollapseAll: {
    args: undefined;
  };
}
