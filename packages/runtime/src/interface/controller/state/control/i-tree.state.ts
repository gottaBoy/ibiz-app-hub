import { IApiTreeNodeData, IApiTreeState } from '../../../api';
import { IMDControlState } from './i-md-control.state';

/**
 * @description 树部件状态
 * @export
 * @interface ITreeState
 * @extends {IMDControlState}
 * @extends {IApiTreeState}
 */
export interface ITreeState extends IMDControlState, IApiTreeState {
  /**
   * @description 树节点集合
   * @type {ITreeNodeData[]}
   * @memberof ITreeState
   */
  items: ITreeNodeData[];

  /**
   * @description 选中节点集合
   * @type {ITreeNodeData[]}
   * @memberof ITreeState
   */
  selectedData: ITreeNodeData[];

  /**
   * @description 外部提供的默认展开的节点集合
   * @type {string[]}
   * @memberof ITreeState
   */
  defaultExpandedKeys: string[];

  /**
   * @description 是否是导航的（即树导航里的树）
   * @type {boolean}
   * @memberof ITreeState
   */
  navigational: boolean;

  /**
   * @description 移动端展开节点标识（存储最后展开节点的标识）
   * @type {string}
   * @memberof ITreeState
   */
  mobExpandedKey: string;

  /**
   * @description 计数器数据
   * @type {IData}
   * @memberof ITreeState
   */
  counterData: IData;
}

/**
 * @description 树节点数据格式
 * @export
 * @interface ITreeNodeData
 * @extends {IApiTreeNodeData}
 */
export interface ITreeNodeData extends IApiTreeNodeData {
  /**
   * @description 根节点集合
   * @type {ITreeNodeData[]}
   * @memberof ITreeNodeData
   */
  rootNodes?: ITreeNodeData[];

  /**
   * @description 实体数据
   * @type {IData}
   * @memberof ITreeNodeData
   */
  _oldDeData?: IData;

  /**
   * @description 是否只提交改变值
   * @type {boolean}
   * @memberof ITreeNodeData
   */
  _changedOnly: boolean;

  /**
   * @description 子节点集合（没有子节点则不存在）
   * @type {ITreeNodeData[]}
   * @memberof ITreeNodeData
   */
  _children?: ITreeNodeData[];

  /**
   * @description 父节点数据对象
   * @type {ITreeNodeData}
   * @memberof ITreeNodeData
   */
  _parent?: ITreeNodeData;

  /**
   * @description 获取改变数据
   * @returns {*}  {(IData | undefined)}
   * @memberof ITreeNodeData
   */
  getDiffData(): IData | undefined;

  // todo 其他界面绘制相关属性
}
