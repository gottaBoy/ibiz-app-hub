import {
  IApiGanttNodeData,
  IApiGanttNodeLinkData,
  IApiGanttState,
  IApiGanttStyle,
} from '../../../api';
import { ITreeGridExState } from './i-tree-grid-ex.state';
import { ITreeNodeData } from './i-tree.state';

/**
 * @description 甘特图状态
 * @export
 * @interface IGanttState
 * @extends {ITreeGridExState}
 * @extends {IApiGanttState}
 */
export interface IGanttState extends ITreeGridExState, IApiGanttState {
  /**
   * @description 甘特图节点集合
   * @type {IGanttNodeData[]}
   * @memberof IGanttState
   */
  rootNodes: IGanttNodeData[];

  /**
   * @description 甘特图节点数据
   * @type {IGanttNodeData[]}
   * @memberof IGanttState
   */
  items: IGanttNodeData[];

  /**
   * @description 选中节点集合
   * @type {IGanttNodeData[]}
   * @memberof IGanttState
   */
  selectedData: IGanttNodeData[];

  /**
   * @description 必须显示的列名称
   * @description 没有配置时默认值为["sn", "name"]，配置部件参数时数组内填写树表格列标识，以引号包裹名称
   * ```
   * 部件参数配置格式如下
   * mustshowcolumns=["sn","name"]
   * ```
   * @type {(string[] | null)}
   * @memberof IGanttState
   */
  mustShowColumns: string[] | null;
}

/**
 * @description 甘特图样式
 * @export
 * @interface IGanttStyle
 * @extends {IApiGanttStyle}
 */
export interface IGanttStyle extends IApiGanttStyle {}

/**
 * @description 甘特图节点数据
 * @export
 * @interface IGanttNodeData
 * @extends {ITreeNodeData}
 */
export interface IGanttNodeData extends ITreeNodeData, IApiGanttNodeData {
  /**
   * @description 子节点集合（没有子节点则不存在）
   * @type {IGanttNodeData[]}
   * @memberof IGanttNodeData
   */
  _children?: IGanttNodeData[];

  /**
   * @description 父节点数据对象
   * @type {IGanttNodeData}
   * @memberof IGanttNodeData
   */
  _parent?: IGanttNodeData;

  /**
   * @description 编号
   * @type {string}
   * @memberof IGanttNodeData
   */
  _snDataItemValue: string;
}

/**
 * @description 甘特图节点链接数据
 * @export
 * @interface IGanttNodeLinkData
 * @extends {IApiGanttNodeLinkData}
 */
export interface IGanttNodeLinkData extends IApiGanttNodeLinkData {}
