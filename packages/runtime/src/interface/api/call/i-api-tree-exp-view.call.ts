import { IApiData } from '@ibiz-template/core';
import { IApiMDViewCall } from './i-api-md-view.call';
import { IApiTreeNodeData } from '../state';

/**
 * @description 实体树导航视图能力
 * @export
 * @interface IApiTreeExpViewCall
 * @extends {Omit<IApiMDViewCall, 'Refresh'>}
 */
export interface IApiTreeExpViewCall extends Omit<IApiMDViewCall, 'Refresh'> {
  /**
   * @description 树界面_刷新全部操作
   * @type {{
   *     args: undefined;
   *   }}
   * @memberof IApiTreeExpViewCall
   */
  RefreshAll: {
    args: undefined;
  };
  /**
   * @description 刷新视图，data：树节点数据
   * @type {{
   *     args?: { data?: (IApiTreeNodeData | IApiData)[] };
   *   }}
   * @memberof IApiTreeExpViewCall
   */
  Refresh: {
    args?: { data?: (IApiTreeNodeData | IApiData)[] };
  };
  /**
   * @description 树界面_刷新父节点操作，data：树节点数据
   * @type {{
   *     args: { data: (IApiTreeNodeData | IApiData)[] };
   *   }}
   * @memberof IApiTreeExpViewCall
   */
  RefreshParent: {
    args: { data: (IApiTreeNodeData | IApiData)[] };
  };
  /**
   * @description 展开节点，data：树节点数据，srfcollapsetag：树节点标识
   * @type {{
   *     args: { data?: IApiData[]; params?: { srfcollapsetag?: string } };
   *   }}
   * @memberof IApiTreeExpViewCall
   */
  Expand: {
    args: { data?: IApiData[]; params?: { srfcollapsetag?: string } };
  };
  /**
   * @description 收缩节点，data：树节点数据，srfcollapsetag：树节点标识
   * @type {{
   *     args: { data?: IApiData[]; params?: { srfcollapsetag?: string } };
   *   }}
   * @memberof IApiTreeExpViewCall
   */
  Collapse: {
    args: { data?: IApiData[]; params?: { srfcollapsetag?: string } };
  };
  /**
   * @description 全部展开
   * @type {{
   *     args: undefined;
   *   }}
   * @memberof IApiTreeExpViewCall
   */
  ExpandAll: {
    args: undefined;
  };
  /**
   * @description 全部收缩
   * @type {{
   *     args: undefined;
   *   }}
   * @memberof IApiTreeExpViewCall
   */
  CollapseAll: {
    args: undefined;
  };
}
