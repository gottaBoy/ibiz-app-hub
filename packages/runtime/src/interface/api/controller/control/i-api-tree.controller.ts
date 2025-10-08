import { IDETree, IDETreeNode } from '@ibiz/model-core';
import { IApiData } from '@ibiz-template/core';
import { IApiTreeNodeData, IApiTreeState } from '../../state';
import { IApiMDControlController } from './i-api-md-control.controller';
import { IApiNewTreeNodeParams } from './tree';

/**
 * 树部件
 * @description 以树形结构展示数据，每种树节点类型可指定不同的导航视图，支持节点动态展开/折叠，支持树节点拖拽。
 * @primary
 * @export
 * @interface IApiTreeController
 * @extends {IApiMDControlController<T, S>}
 * @ctrlparams {name:cascadeselect,title:父子节点级联选择,parameterType:boolean,defaultvalue:false,description:在显示复选框的情况下，是否严格的遵循父子不互相关联的做法，默认为 false,effectPlatform:web}
 * @ctrlparams {name:contextmenurightclickinvoke,title:拦截右键点击事件,parameterType:boolean,defaultvalue:true,description:当该值为false时，拦截右键点击事件不弹出节点的右键上下文菜单,effectPlatform:web}
 * @ctrlparams {"name":"menushowmode","title":"右键菜单显示模式","parameterType":"'default' | 'hover'","defaultvalue":"'default'","description":"上下文菜单的显示时机支持两种配置模式：始终显示的 'default' 模式，以及仅鼠标悬停树节点时显示对应菜单的 'hover' 模式","effectPlatform":"web"}
 * @ctrlparams {"name":"mdctrlrefreshmode","title":"刷新模式","defaultvalue":"'cache'","parameterType":"'nocache' | 'cache'","description":"多数据部件刷新模式，当值为 'cache'，部件刷新时保留选中数据；当值为 'nocache'，部件刷新时清空选中数据","effectPlatform":"web"}
 * @ctrlparams {name:searchphseparator,title:快速搜索提示分隔符,parameterType:string,defaultvalue:'、',description:搜索栏输入框根据该值将所有输入项提示文本进行拼接展示}
 * @template T
 * @template S
 */
export interface IApiTreeController<
  T extends IDETree = IDETree,
  S extends IApiTreeState = IApiTreeState,
> extends IApiMDControlController<T, S> {
  /**
   * 刷新指定树节点的子节点数据
   * @description 刷新指定树节点的子节点数据
   * @param {(IApiTreeNodeData | IApiData)} nodeData 指定树节点数据，可以是节点数据，也可以是对应的实体数据
   * @param {boolean} [refreshParent] 是否是刷新给定节点数据的父节点的子节点数据
   * @returns {*}  {Promise<void>}
   * @memberof IApiTreeController
   */
  refreshNodeChildren(
    nodeData: IApiTreeNodeData | IApiData,
    refreshParent?: boolean,
  ): Promise<void>;

  /**
   * 展开并加载节点
   * @description 展开并加载节点
   * @param {string[]} expandedKeys
   * @returns {*}  {Promise<void>}
   * @memberof IApiTreeController
   */
  expandNodeByKey(expandedKeys: string[]): Promise<void>;

  /**
   * @description 切换折叠，其中tag表示操作指定树节点标识，若不传则操作当前树的第一层节点展开状态，expand表示是否展开，若不传则基于节点展开状态取反
   * @param {{ tag?: string; expand?: boolean }} [params]
   * @memberof IApiTreeController
   */
  changeCollapse(params?: { tag?: string; expand?: boolean }): void;

  /**
   * 获取节点模型
   * @description 获取节点模型
   * @param {string} id
   * @returns {*}  {(IDETreeNode | undefined)}
   * @memberof IApiTreeController
   */
  getNodeModel(id: string): IDETreeNode | undefined;

  /**
   * 通过标识获取节点数据
   * @description 通过标识获取节点数据
   * @param {string} key 可以是节点_id也可以是_uuid
   * @returns {*}  {(IApiTreeNodeData | undefined)}
   * @memberof IApiTreeController
   */
  getNodeData(key: string): IApiTreeNodeData | undefined;

  /**
   * 新建树节点
   * @description 新建树节点
   * @param {IApiNewTreeNodeParams} _params 新建树节点需要的参数
   */
  newTreeNode(_params: IApiNewTreeNodeParams): void;
}
