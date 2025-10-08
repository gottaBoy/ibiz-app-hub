import { IApiData, IApiParams } from '@ibiz-template/core';
import { IApiMDControlState } from './i-api-md-control.state';

/**
 * @description 树节点数据格式
 * @export
 * @interface IApiTreeNodeData
 */
export interface IApiTreeNodeData {
  /**
   * @description 节点数据的唯一标识（创建的时候自动生成）
   * @type {string}
   * @memberof IApiTreeNodeData
   */
  _uuid: string;

  /**
   * @description 节点类型
   * @type {string}
   * @memberof IApiTreeNodeData
   */
  _nodeType?: string;

  /**
   * @description 节点标识(对应节点模型的id)
   * @type {string}
   * @memberof IApiTreeNodeData
   */
  _nodeId: string;

  /**
   * @description 节点唯一标识，在父的id上加上自身的唯一标识，用@分隔;如：staticNode1@14@84847aa970ba3db7bbe00754aed3888d
   * @type {string}
   * @memberof IApiTreeNodeData
   */
  _id: string;

  /**
   * @description 节点唯一标识，等同_id，树选择视图回显用
   * @type {string}
   * @memberof IApiTreeNodeData
   */
  srfnodeid: string;

  /**
   * @description 节点的值(可能是自己的主键，也可能是沿用父的值),静态节点可能没有节点值
   * @type {string}
   * @memberof IApiTreeNodeData
   */
  _value?: string;

  /**
   * @description 节点显示名称
   * @type {string}
   * @memberof IApiTreeNodeData
   */
  _text: string;

  /**
   * @description 是否是叶子节点（没有子节点的节点）
   * @type {boolean}
   * @memberof IApiTreeNodeData
   */
  _leaf: boolean;

  /**
   * @description 资源路径相关上下文参数
   * 根据节点展开的主从关系，在父的基础上附加自身的实体主键
   * 附加关系上转换的导航上下文
   * @type {IApiParams}
   * @memberof IApiTreeNodeData
   */
  _context?: IApiParams;

  /**
   * @description 关系上转换的视图参数
   * @type {IApiParams}
   * @memberof IApiTreeNodeData
   */
  _params?: IApiParams;

  /**
   * @description 子节点集合（没有子节点则不存在）
   * @type {IApiTreeNodeData[]}
   * @memberof IApiTreeNodeData
   */
  _children?: IApiTreeNodeData[];

  /**
   * @description 父节点数据对象
   * @type {IApiTreeNodeData}
   * @memberof IApiTreeNodeData
   */
  _parent?: IApiTreeNodeData;

  /**
   * @description 实体数据
   * @type {IApiData}
   * @memberof IApiTreeNodeData
   */
  _deData?: IApiData;

  /**
   * @description 图标
   * @type {IApiData}
   * @memberof IApiTreeNodeData
   */
  _icon?: IApiData;

  /**
   * @description 节点文本的html显示
   * @type {string}
   * @memberof IApiTreeNodeData
   */
  _textHtml?: string;

  /**
   * @description 是否禁止选择
   * @type {boolean}
   * @memberof IApiTreeNodeData
   */
  _disableSelect?: boolean;

  /**
   * @description 作为实体数据时的主键
   * @type {string}
   * @memberof IApiTreeNodeData
   */
  srfkey?: string;

  /**
   * @description 作为实体数据时的主信息
   * @type {string}
   * @memberof IApiTreeNodeData
   */
  srfmajortext?: string;

  /**
   * @description 是否开启拖拽
   * @type {boolean}
   * @memberof IApiTreeNodeData
   */
  _draggable: boolean;

  /**
   * @description 树节点展开状态
   * @type {(-1 | 0 | 1)} -1（无展开），0（收缩），1（展开）
   * @memberof IApiTreeNodeData
   */
  srfcollapsestate: -1 | 0 | 1;
}

/**
 * 树部件状态
 * @description 树部件状态
 * @primary
 * @export
 * @interface IApiTreeState
 * @extends {IApiMDControlState}
 */
export interface IApiTreeState extends IApiMDControlState {
  /**
   * @description 树节点集合
   * @type {IApiTreeNodeData[]}
   * @default []
   * @memberof IApiTreeState
   */
  items: IApiTreeNodeData[];

  /**
   * @description 选中节点集合
   * @type {IApiTreeNodeData[]}
   * @default []
   * @memberof IApiTreeState
   */
  selectedData: IApiTreeNodeData[];

  /**
   * @description 外部提供的默认展开的节点集合
   * @type {string[]}
   * @default []
   * @memberof IApiTreeState
   */
  defaultExpandedKeys: string[];

  /**
   * @description 树的根节点
   * @type {IApiTreeNodeData[]}
   * @default []
   * @memberof IApiTreeState
   */
  rootNodes: IApiTreeNodeData[];

  /**
   * @description 实际默认展开节点标识集合
   * @type {string[]}
   * @default []
   * @memberof IApiTreeState
   */
  expandedKeys: string[];

  /**
   * @description 查询条件
   * @type {string}
   * @default ''
   * @memberof IApiTreeState
   */
  query: string;

  /**
   * @description 快速搜索占位符
   * @type {string}
   * @default ''
   * @memberof IApiTreeState
   */
  placeHolder: string;

  /**
   * @description 移动端展开节点标识（存储最后展开节点的标识）
   * @type {string}
   * @default ''
   * @memberof IApiTreeState
   */
  mobExpandedKey: string;
}
