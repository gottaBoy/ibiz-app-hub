import { IApiGridViewCall } from './i-api-grid-view.call';

/**
 * @description 实体树表格视图能力
 * @export
 * @interface IApiTreeGridViewCall
 * @extends {IApiGridViewCall}
 */
export interface IApiTreeGridViewCall extends IApiGridViewCall {
  /**
   * @description 展开表格分组，srfcollapsetag: 表格分组标识
   * @type {{
   *     args: { params?: { srfcollapsetag?: string } };
   *   }}
   * @memberof IApiTreeGridViewCall
   */
  Expand: {
    args: { params?: { srfcollapsetag?: string } };
  };
  /**
   * @description 收缩表格分组，srfcollapsetag: 表格分组标识
   * @type {{
   *     args: { params?: { srfcollapsetag?: string } };
   *   }}
   * @memberof IApiTreeGridViewCall
   */
  Collapse: {
    args: { params?: { srfcollapsetag?: string } };
  };
  /**
   * @description 全部展开
   * @type {{
   *     args: undefined;
   *   }}
   * @memberof IApiTreeGridViewCall
   */
  ExpandAll: {
    args: undefined;
  };
  /**
   * @description 全部收缩
   * @type {{
   *     args: undefined;
   *   }}
   * @memberof IApiTreeGridViewCall
   */
  CollapseAll: {
    args: undefined;
  };
}
