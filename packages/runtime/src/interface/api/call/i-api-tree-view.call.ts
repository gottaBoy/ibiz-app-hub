import { IApiData } from '@ibiz-template/core';
import { IApiMDViewCall } from './i-api-md-view.call';
import { IApiTreeNodeData } from '../state';

/**
 * @description 实体树视图能力
 * @export
 * @interface IApiTreeViewCall
 * @extends {Omit<IApiMDViewCall, 'Refresh'>}
 */
export interface IApiTreeViewCall extends Omit<IApiMDViewCall, 'Refresh'> {
  /**
   * @description 树界面_刷新全部操作
   * @type {{
   *     args: undefined;
   *   }}
   * @memberof IApiTreeViewCall
   */
  RefreshAll: {
    args: undefined;
  };
  /**
   * @description 刷新视图，data: 树节点数据
   * @type {{
   *     args?: { data?: (IApiTreeNodeData | IApiData)[] };
   *   }}
   * @memberof IApiTreeViewCall
   */
  Refresh: {
    args?: { data?: (IApiTreeNodeData | IApiData)[] };
  };
  /**
   * @description 树界面_刷新父节点操作，data: 树节点数据
   * @type {{
   *     args: { data: (IApiTreeNodeData | IApiData)[] };
   *   }}
   * @memberof IApiTreeViewCall
   */
  RefreshParent: {
    args: { data: (IApiTreeNodeData | IApiData)[] };
  };
  /**
   * @description 展开节点，data：树节点数据，srfcollapsetag：树节点标识
   * @type {{
   *     args: { data?: IApiData[]; params?: { srfcollapsetag?: string } };
   *   }}
   * @memberof IApiTreeViewCall
   */
  Expand: {
    args: { data?: IApiData[]; params?: { srfcollapsetag?: string } };
  };
  /**
   * @description 收缩节点，data：树节点数据，srfcollapsetag：树节点标识
   * @type {{
   *     args: { data?: IApiData[]; params?: { srfcollapsetag?: string } };
   *   }}
   * @memberof IApiTreeViewCall
   */
  Collapse: {
    args: { data?: IApiData[]; params?: { srfcollapsetag?: string } };
  };
  /**
   * @description 全部展开
   * @type {{
   *     args: undefined;
   *   }}
   * @memberof IApiTreeViewCall
   */
  ExpandAll: {
    args: undefined;
  };
  /**
   * @description 全部收缩
   * @type {{
   *     args: undefined;
   *   }}
   * @memberof IApiTreeViewCall
   */
  CollapseAll: {
    args: undefined;
  };
}
