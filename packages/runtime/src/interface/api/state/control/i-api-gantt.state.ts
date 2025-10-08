import { IApiData } from '@ibiz-template/core';
import { IApiTreeGridExState } from './i-api-tree-grid-ex.state';
import { IApiTreeNodeData } from './i-api-tree.state';

/**
 * @description 甘特图节点连接数据
 * @export
 * @interface IApiGanttStyle
 */
export interface IApiGanttNodeLinkData {
  /**
   * @description 节点数据的唯一标识（创建的时候自动生成）
   * @type {string}
   * @memberof IApiGanttNodeLinkData
   */
  _uuid: string;

  /**
   * @description 起始点唯一标识（前端生成）
   * @type {(string)}
   * @memberof IApiGanttNodeLinkData
   */
  _from: string;

  /**
   * @description 结束点唯一标识（前端生成）
   * @type {(string)}
   * @memberof IApiGanttNodeLinkData
   */
  _to: string;

  /**
   * @description 实体数据（服务返回）
   * @type {IApiData}
   * @memberof IApiGanttNodeLinkData
   */
  _deData: IApiData;

  /**
   * @description 起始点节点数据（前端生成的数据）
   * @type {IApiGanttNodeData}
   * @memberof IApiGanttNodeLinkData
   */
  _fromData: IApiGanttNodeData;

  /**
   * @description 结束点节点数据（前端生成的数据）
   * @type {IApiGanttNodeData}
   * @memberof IApiGanttNodeLinkData
   */
  _toData: IApiGanttNodeData;

  /**
   * @description 起始点的值（服务返回的主键）
   * @type {string}
   * @memberof IApiTreeNodeData
   */
  _fromValue: string;

  /**
   * @description 结束点的值（服务返回的主键）
   * @type {string}
   * @memberof IApiTreeNodeData
   */
  _toValue: string;
}

/**
 * @description 甘特图部件状态
 * @primary
 * @export
 * @interface IApiGanttState
 * @extends {IApiTreeGridExState}
 */
export interface IApiGanttState extends IApiTreeGridExState {
  /**
   * @description 甘特图节点数据
   * @type {IApiGanttNodeData[]}
   * @default []
   * @memberof IApiTreeState
   */
  items: IApiGanttNodeData[];

  /**
   * @description 甘特图样式
   * @type {IGanttStyle}
   * @default {}
   * @memberof IApiGanttState
   */
  ganttStyle: IApiGanttStyle;

  /**
   * @description 是否开启滑块拖拽
   * @type {boolean}
   * @default true
   * @memberof IApiGanttState
   */
  sliderDraggable: boolean;

  /**
   * @description 甘特图将根据当前时间单位呈现右侧甘特页面样式
   * @type {('month' | 'week' | 'day' | 'hour')}
   * @default 'day'
   * @memberof IGanttState
   */
  unit: 'month' | 'week' | 'day' | 'hour';

  /**
   * @description 甘特图节点连接数据集合
   * @type {IApiGanttNodeLinkData[]}
   * @memberof IGanttState
   */
  links: IApiGanttNodeLinkData[];
}

/**
 * @description 甘特图样式
 * @export
 * @interface IApiGanttStyle
 */
export interface IApiGanttStyle {
  /**
   * @description 主题色
   * @type {string}
   * @memberof IApiGanttStyle
   */
  primaryColor?: string;

  /**
   * @description 文本色
   * @type {string}
   * @memberof IApiGanttStyle
   */
  textColor?: string;
}

/**
 * @description 甘特节点数据
 * @export
 * @interface IApiGanttNodeData
 * @extends {IApiTreeNodeData}
 */
export interface IApiGanttNodeData extends IApiTreeNodeData {
  /**
   * @description 开始时间
   * @type {string}
   * @memberof IApiGanttNodeData
   */
  _beginDataItemValue: string;

  /**
   * @description 结束时间
   * @type {string}
   * @memberof IApiGanttNodeData
   */
  _endDataItemValue: string;

  /**
   * @description 前置数据
   * @type {(string | number)}
   * @memberof IApiGanttNodeData
   */
  _prevDataItemValue: string | number;

  /**
   * @description 完成量数据
   * @type {(string | number)}
   * @memberof IApiGanttNodeData
   */
  _finishDataItemValue: string | number;

  /**
   * @description 总量数据项
   * @type {(string | number)}
   * @memberof IApiGanttNodeData
   */
  _totalDataItemValue: string | number;

  /**
   * @description 子数据
   * @type {(IApiGanttNodeData[] | undefined)}
   * @memberof IApiGanttNodeData
   */
  _children?: IApiGanttNodeData[] | undefined;

  /**
   * @description 父节点数据对象
   * @type {IApiGanttNodeData}
   * @memberof IApiGanttNodeData
   */
  _parent?: IApiGanttNodeData;
}
