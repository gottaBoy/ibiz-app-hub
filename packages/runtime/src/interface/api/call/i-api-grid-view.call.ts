import { IApiMDViewCall } from './i-api-md-view.call';

/**
 * @description 实体表格视图能力
 * @export
 * @interface IApiGridViewCall
 * @extends {IApiMDViewCall}
 */
export interface IApiGridViewCall extends IApiMDViewCall {
  /**
   * @description 新建行
   * @type {{
   *     args: undefined;
   *   }}
   * @memberof IApiGridViewCall
   */
  NewRow: {
    args: undefined;
  };
  /**
   * @description 行编辑
   * @type {{
   *     args: undefined;
   *   }}
   * @memberof IApiGridViewCall
   */
  ToggleRowEdit: {
    args: undefined;
  };
  /**
   * @description 保存
   * @type {{
   *     args: undefined;
   *   }}
   * @memberof IApiGridViewCall
   */
  Save: {
    args: undefined;
  };
  /**
   * @description 保存行
   * @type {{
   *     args: undefined;
   *   }}
   * @memberof IApiGridViewCall
   */
  SaveRow: {
    args: undefined;
  };
  /**
   * @description 展开表格分组，srfcollapsetag: 表格分组标识
   * @type {{
   *     args: { params?: { srfcollapsetag?: string } };
   *   }}
   * @memberof IApiGridViewCall
   */
  Expand: {
    args: { params?: { srfcollapsetag?: string } };
  };
  /**
   * @description 收缩表格分组，srfcollapsetag: 表格分组标识
   * @type {{
   *     args: { params?: { srfcollapsetag?: string } };
   *   }}
   * @memberof IApiGridViewCall
   */
  Collapse: {
    args: { params?: { srfcollapsetag?: string } };
  };
  /**
   * @description 全部展开
   * @type {{
   *     args: undefined;
   *   }}
   * @memberof IApiGridViewCall
   */
  ExpandAll: {
    args: undefined;
  };
  /**
   * @description 全部收缩
   * @type {{
   *     args: undefined;
   *   }}
   * @memberof IApiGridViewCall
   */
  CollapseAll: {
    args: undefined;
  };
}
