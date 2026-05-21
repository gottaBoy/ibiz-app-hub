import { IDELogicBase } from './idelogic-base';
import { IDEUILogicNode } from './ideuilogic-node';
import { IDEUILogicParam } from './ideuilogic-param';

/**
 *
 * 实体界面逻辑模型对象接口
 * @export
 * @interface IDEUILogic
 */
export interface IDEUILogic extends IDELogicBase {
  /**
   * 逻辑标记
   * @type {string}
   * 来源  getLogicTag
   */
  logicTag?: string;

  /**
   * 逻辑标记2
   * @type {string}
   * 来源  getLogicTag2
   */
  logicTag2?: string;

  /**
   * 逻辑标记3
   * @type {string}
   * 来源  getLogicTag3
   */
  logicTag3?: string;

  /**
   * 逻辑标记4
   * @type {string}
   * 来源  getLogicTag4
   */
  logicTag4?: string;

  /**
   * 逻辑处理节点集合
   *
   * @type {IDEUILogicNode[]}
   * 来源  getPSDEUILogicNodes
   */
  deuilogicNodes?: IDEUILogicNode[];

  /**
   * 逻辑处理参数集合
   *
   * @type {IDEUILogicParam[]}
   * 来源  getPSDEUILogicParams
   */
  deuilogicParams?: IDEUILogicParam[];

  /**
   * 开始处理节点
   *
   * @type {string}
   * 来源  getStartPSDEUILogicNode
   */
  startDEUILogicNodeId?: string;
}
