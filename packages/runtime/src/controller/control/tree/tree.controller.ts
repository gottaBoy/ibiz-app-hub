/* eslint-disable no-param-reassign */
/* eslint-disable no-lonely-if */
/* eslint-disable no-else-return */
import {
  RuntimeError,
  IPortalMessage,
  recursiveIterate,
  RuntimeModelError,
} from '@ibiz-template/core';
import {
  IDETree,
  IDETreeNode,
  IDEToolbarItem,
  IDETBUIActionItem,
  IDETreeDataSetNode,
} from '@ibiz/model-core';
import { isNil } from 'ramda';
import { isBoolean } from 'qx-util';
import {
  ITreeState,
  ITreeEvent,
  ITreeNodeData,
  IUILogicParams,
  IUIActionResult,
  ITreeController,
  MDCtrlLoadParams,
  IApiNewTreeNodeParams,
} from '../../../interface';
import { UIActionUtil } from '../../../ui-action';
import { MDControlController } from '../../common';
import { ContextMenuController } from '../context-menu';
import { LoadMoreInfoItem, TreeService } from './tree.service';
import {
  getTreeNode,
  getChildNodeRSs,
  getUIActionById,
  calcDeCodeNameById,
} from '../../../model';
import { ControllerEvent } from '../../utils';
import { AppCounter, CounterService, Srfuf } from '../../../service';
import { convertNavData } from '../../../utils';
import { OpenAppViewCommand } from '../../../command';
import { PresetIdentifier } from '../../../constant';
import { ViewLogicScheduler } from '../../../logic-scheduler';

export type DropNodeRS = {
  minorEntityId: string;
  pickupDEFName: string;
  childDETreeNodeId: string;
};

/**
 * 树部件控制器
 * @author lxm
 * @date 2023-05-26 08:20:46
 * @export
 * @class TreeController
 * @extends {MDControlController<IDETree, ITreeState, ITreeEvent>}
 * @implements {ITreeController}
 */
export class TreeController<
    T extends IDETree = IDETree,
    S extends ITreeState = ITreeState,
    E extends ITreeEvent = ITreeEvent,
  >
  extends MDControlController<T, S, E>
  implements ITreeController<T, S, E>
{
  declare service: TreeService;

  protected get _evt(): ControllerEvent<ITreeEvent> {
    return this.evt;
  }

  /**
   * @description 快速搜索提示分隔符
   * @readonly
   * @type {string}
   * @memberof TreeController
   */
  get searchPhSeparator(): string {
    if (this.controlParams.searchphseparator) {
      return this.controlParams.searchphseparator;
    }
    return ibiz.config.common.searchPhSeparator;
  }

  /**
   * 上下文菜单控制器
   * @author lxm
   * @date 2023-08-21 10:56:24
   * @type {{ [p: string]: ContextMenuController }}
   */
  contextMenus: { [p: string]: ContextMenuController } = {};

  /**
   * 是否启用快速搜索
   * @author lxm
   * @date 2023-12-04 03:33:32
   * @type {boolean}
   */
  enableQuickSearch: boolean = false;

  /**
   * 拖入节点关系处理
   * @author lxm
   * @date 2023-12-14 03:05:38
   */
  dropNodeRss = new Map<string, DropNodeRS[]>();

  /**
   * 节点上下文解析后信息`
   * @author lxm
   * @date 2023-12-29 10:38:37
   */
  contextMenuInfos: {
    [p: string]: {
      /**
       * 上下文菜单里第一个行为级别为常用操作的项
       */
      clickTBUIActionItem?: IDETBUIActionItem;
      onlyOneActionItem: boolean;
    };
  } = {};

  /**
   * 计数器对象
   * @author lxm
   * @date 2024-01-18 05:12:35
   * @type {AppCounter}
   */
  counter?: AppCounter;

  /**
   * @description 视图逻辑触发器
   * @type {ViewLogicScheduler}
   * @memberof TreeController
   */
  viewScheduler?: ViewLogicScheduler;

  protected initState(): void {
    super.initState();
    // 根节点初始化
    this.state.defaultExpandedKeys = [];
    this.state.expandedKeys = [];
    this.state.navigational = false;
    this.state.size = 0;
    this.state.query = '';
    this.state.mobExpandedKey = '';
  }

  protected async onCreated(): Promise<void> {
    await super.onCreated();

    this.state.expandedKeys = [...this.state.defaultExpandedKeys];

    this.initDropNodeRss();
    this.initViewScheduler();
    this.initNodeClickTBUIActionItem();
    await this.initQuickSearch();
    await this.initService();
    await this.initCounter();
    // 初始化上下文菜单控制器
    this.model.detreeNodes!.forEach(node => {
      if (node.decontextMenu?.detoolbarItems?.length) {
        this.contextMenus[node.decontextMenu.id!] = new ContextMenuController(
          node.decontextMenu,
          this.context,
          this.params,
          this.ctx,
        );
      }
    });

    // 上下文菜单控制器初始化
    await Promise.all(
      Object.values(this.contextMenus).map(menu => menu.created()),
    );
  }

  /**
   * @description 初始化部件视图逻辑
   * @protected
   * @memberof TreeController
   */
  protected initViewScheduler(): void {
    const viewLogics = this.model.appViewLogics || [];
    if (viewLogics.length !== 0) {
      this.viewScheduler = ibiz.scheduler.createViewScheduler(viewLogics);
      this.viewScheduler.defaultParamsCb = (): IUILogicParams => {
        return this.getEventArgs();
      };
      if (this.viewScheduler.hasViewEventTrigger) {
        // 监听视图事件触发视图事件触发器
        this.evt.onAll((_eventName, event) => {
          this.viewScheduler!.triggerViewEvent(event);
        });
      }
    }
  }

  /**
   * 初始化快速搜索
   *
   * @protected
   * @memberof TreeController
   */
  protected async initQuickSearch(): Promise<void> {
    const { detreeNodes } = this.model;
    if (detreeNodes) {
      // 快速搜索
      if (detreeNodes[0].enableQuickSearch) {
        this.enableQuickSearch = true;
      }
      // 支持快速搜索的节点
      const quickSearchNode = detreeNodes
        .filter(node => node.treeNodeType === 'DE' && node.enableQuickSearch)
        .map(node => node);
      const placeHolders: string[] = [];
      for (let index = 0; index < quickSearchNode.length; index++) {
        const { appDataEntityId, appId } = quickSearchNode[index];
        if (appDataEntityId) {
          const dataEntity = await ibiz.hub.getAppDataEntity(
            appDataEntityId,
            appId,
          );
          const searchFields = dataEntity.appDEFields?.filter(field => {
            return field.enableQuickSearch;
          });
          searchFields?.forEach(searchField => {
            if (
              searchField?.lnlanguageRes &&
              searchField.lnlanguageRes.lanResTag
            ) {
              placeHolders.push(
                ibiz.i18n.t(
                  searchField.lnlanguageRes.lanResTag,
                  searchField.logicName,
                ),
              );
            } else if (searchField?.logicName) {
              placeHolders.push(searchField.logicName);
            }
          });
        }
      }
      if (placeHolders.length > 0) {
        // 使用set去重
        this.state.placeHolder = [...new Set(placeHolders)].join(
          this.searchPhSeparator,
        );
      }
    }
  }

  protected async onDestroyed(): Promise<void> {
    await super.onDestroyed();
    if (this.counter) {
      this.counter.destroy();
    }
  }

  /**
   * 初始化对应类型的部件服务
   * @author lxm
   * @date 2023-12-21 11:25:33
   * @protected
   * @return {*}  {Promise<void>}
   */
  protected async initService(): Promise<void> {
    this.service = new TreeService(this.model);
    await this.service.init(this.context);
  }

  /**
   * 初始化计数器
   * @author lxm
   * @date 2024-01-18 05:12:02
   * @protected
   * @return {*}  {Promise<void>}
   */
  protected async initCounter(): Promise<void> {
    const { appCounterRefs } = this.model;
    const appCounterRef = appCounterRefs?.[0];
    if (appCounterRef) {
      this.counter = await CounterService.getCounterByRef(
        appCounterRef,
        this.context,
        { ...this.params },
      );
    }
  }

  /**
   * 初始化节点拖入关系处理
   * @author lxm
   * @date 2023-12-14 03:13:42
   * @protected
   */
  protected initDropNodeRss(): void {
    this.model.detreeNodes?.forEach(node => {
      // 代码表节点不可拖入，静态节点默认可拖入，动态节点允许拖入才可拖入
      if (
        node.treeNodeType === 'CODELIST' ||
        (node.treeNodeType === 'DE' && !node.allowDrop)
      ) {
        return;
      }
      const infos: Array<DropNodeRS> = [];
      const nodeRSs = getChildNodeRSs(this.model, {
        parentId: node.id,
        hasQuery: false,
      });
      nodeRSs.forEach(nodeRS => {
        if (nodeRS.parentDER1N?.pickupDEFName) {
          const childNode = this.getNodeModel(nodeRS.childDETreeNodeId!);
          if (childNode?.treeNodeType === 'DE' && childNode.appDataEntityId) {
            infos.push({
              minorEntityId: childNode.appDataEntityId,
              pickupDEFName: nodeRS.parentDER1N.pickupDEFName.toLowerCase(),
              childDETreeNodeId: nodeRS.childDETreeNodeId!,
            });
          }
        }
      });

      if (infos.length > 0) {
        this.dropNodeRss.set(node.id!, infos);
      }
    });
  }

  /**
   * 初始化节点点击后触发的第一个常用操作的上下文菜单项
   * @author lxm
   * @date 2023-12-19 03:18:43
   * @protected
   */
  protected initNodeClickTBUIActionItem(): void {
    this.model.detreeNodes?.forEach(node => {
      const contextMenu = node.decontextMenu;
      if (contextMenu?.detoolbarItems?.length) {
        let itemNum = 0;
        const items: IDETBUIActionItem[] = [];

        recursiveIterate(
          contextMenu,
          (item: IDEToolbarItem) => {
            if (item.itemType === 'DEUIACTION') {
              itemNum += 1;
              const uiItem = item as IDETBUIActionItem;
              if (uiItem.actionLevel === 200) {
                items.push(uiItem);
              }
            }
          },
          { childrenFields: ['detoolbarItems'] },
        );

        this.contextMenuInfos[node.id!] = {
          onlyOneActionItem: itemNum === 1,
          clickTBUIActionItem: items[0],
        };
      }
    });
  }

  /**
   * 树部件加载，从根节点开始重新加载
   *
   * @author lxm
   * @date 2022-08-19 14:08:50
   */
  async load(args: MDCtrlLoadParams = {}): Promise<ITreeNodeData[]> {
    // 适配移动端搜索功能，移动端有展开节点的时候,刷新当前展开节点
    if (ibiz.env.isMob && this.state.mobExpandedKey) {
      const parentNode = this.getNodeData(this.state.mobExpandedKey);
      if (parentNode) {
        await this.refreshNodeChildren(parentNode);
        return parentNode._children!;
      }
    }

    const isInitialLoad = args.isInitialLoad === true;
    const nodes = await this.loadNodes();
    await this.afterLoad(args, nodes);
    this.state.isLoaded = true;
    await this._evt.emit('onLoadSuccess', {
      isInitialLoad,
    });

    return nodes;
  }

  async getFetchParams(extraParams?: IParams): Promise<IParams> {
    const params = await super.getFetchParams(extraParams);
    if (this.state.query) {
      params.query = this.state.query;
    }
    return params;
  }

  /**
   * 加载子节点数据
   *
   * @param {(ITreeNodeData | undefined)} parentNode
   * @returns {*}
   * @memberof TreeController
   */
  async loadNodes(
    parentNode?: ITreeNodeData,
    isLoadMore: boolean = false,
  ): Promise<ITreeNodeData[]> {
    const params = await this.getFetchParams();
    const hasQuery = !!params.query;

    this.state.isLoading = true;

    let nodes;
    try {
      // 请求服务获取子节点数据
      const children =
        (await this.service.fetchChildNodes(parentNode, {
          context: this.context.clone(),
          params,
          hasQuery,
          isLoadMore,
          ctrl: this,
          view: this.view,
          defaultExpandedKeys: this.state.expandedKeys,
        })) || [];
      const targetNodes: ITreeNodeData[] = [];
      children.forEach((child: ITreeNodeData) => {
        const targetNode = this.model.detreeNodes?.find((item: IData) => {
          return item.id === child._nodeId;
        });
        // 开启了排除重复值,并且配置了标识属性
        if (
          targetNode &&
          (targetNode as IDETreeDataSetNode).distinctMode &&
          (targetNode as IDETreeDataSetNode).idAppDEFieldId
        ) {
          // 同批次数据排重
          const index = targetNodes.findIndex((item: ITreeNodeData) => {
            const id = (targetNode as IDETreeDataSetNode).idAppDEFieldId;
            if (id) {
              return item._deData?.[id] === child._deData?.[id];
            }
            return false;
          });
          if (index < 0) {
            targetNodes.push(child);
          }
        } else {
          targetNodes.push(child);
        }
      });
      nodes = targetNodes;
    } finally {
      this.state.isLoading = false;
    }

    // 有父节点绑定到父节点数据上，无父节点替换rootNodes
    if (parentNode) {
      if (isLoadMore) {
        parentNode._children = this.getLoadMoreNodes(parentNode, hasQuery);
      } else {
        parentNode._children = nodes;
      }
    } else {
      if (isLoadMore) {
        nodes.forEach(node => {
          node._children = this.getLoadMoreNodes(node, hasQuery);
        });
      }
      this.state.rootNodes = nodes;
    }

    await this.afterLoadNodes(nodes);

    return nodes;
  }

  /**
   * loadNodes加载完子数据之后的处理
   * @author lxm
   * @date 2023-12-22 02:37:50
   * @param {ITreeNodeData[]} nodes 加载回来的子数据
   * @return {*}  {Promise<void>}
   */
  async afterLoadNodes(nodes: ITreeNodeData[]): Promise<void> {
    // 更新items
    this.state.items = [];
    recursiveIterate(
      { _children: this.state.rootNodes },
      (node: ITreeNodeData) => {
        this.state.items.push(node);
      },
      { childrenFields: ['_children'] },
    );
    // 重新计算展开节点标识
    this.state.expandedKeys = this.calcExpandedKeys(nodes);
    this.calcSelectDataBySelectKey();
  }

  /**
   * 树节点点击事件
   *
   * @param {ITreeNodeData} nodeData
   * @returns {*}  {Promise<void>}
   * @memberof TreeController
   */
  async onTreeNodeClick(
    _nodeData: ITreeNodeData,
    event: MouseEvent,
  ): Promise<void> {
    const nodeData = this.getNodeData(_nodeData._id);
    if (!nodeData) {
      return;
    }
    // 设置导航数据
    this.setNavData(nodeData);
    // 节点有配置常用操作的上下文菜单时，触发界面行为，后续逻辑都不走
    const clickActionItem =
      this.contextMenuInfos[nodeData._nodeId]?.clickTBUIActionItem;
    const onlyOneActionItem =
      this.contextMenuInfos[nodeData._nodeId]?.onlyOneActionItem;
    // 只有一个界面行为项，且是常用操作界面行为时，执行界面行为
    if (clickActionItem && onlyOneActionItem) {
      return this.doUIAction(
        clickActionItem.uiactionId!,
        nodeData,
        event,
        clickActionItem.appId,
      );
    }

    // 导航的时候，没有导航视图的时候，节点后续点击逻辑都不走，也不选中
    const nodeModel = this.getNodeModel(nodeData._nodeId);
    if (this.state.navigational && !nodeModel?.navAppViewId) {
      return;
    }
    // 不是导航树上的树，且不是内置导航模式，但是有配置导航视图的时候，直接打开导航视图
    if (
      !this.state.enableNavView &&
      !this.state.navigational &&
      nodeModel?.navAppViewId
    ) {
      const resultContext = this.context.clone();
      const resultParams = { ...this.params };
      const navContexts = [...(nodeModel.navigateContexts || [])];
      const navParams = [...(nodeModel.navigateParams || [])];
      const { tempContext, tempParams } = this.handleNavParams(
        navContexts,
        navParams,
        _nodeData,
      );
      Object.assign(resultContext, tempContext);
      Object.assign(resultParams, tempParams);

      await ibiz.commands.execute(
        OpenAppViewCommand.TAG,
        nodeModel?.navAppViewId,
        resultContext,
        resultParams,
        { ctx: this.view.getCtx(), event },
      );
      return;
    }

    // 单选时，单击才会触发选中逻辑,禁止选择的时候不触发
    if (this.state.singleSelect && !nodeData._disableSelect) {
      // 选中相关处理
      const { selectedData } = this.state;
      // 选中里没有则添加，有则删除
      const filterArr = selectedData.filter(item => item._id !== nodeData._id);
      if (filterArr.length === selectedData.length) {
        this.setSelection(
          this.state.singleSelect
            ? [nodeData]
            : selectedData.concat([nodeData]),
        );
      } else {
        this.setSelection(filterArr);
      }
    }

    // 激活事件
    if (this.state.mdctrlActiveMode === 1) {
      await this.setActive(nodeData);
    }
  }

  /**
   * @description 处理导航参数
   * @memberof TreeController
   */
  public handleNavParams(
    navContexts: IData[],
    navParams: IData[],
    data: IData,
  ): IData {
    // 处理自定义导航上下文
    const tempContext = convertNavData(
      navContexts,
      data,
      this.params,
      this.context,
    );
    // 处理自定义导航参数
    const tempParams = convertNavData(
      navParams,
      data,
      this.params,
      this.context,
    );
    return { tempContext, tempParams };
  }

  /**
   * 树节点数据变更事件处理
   * @author lxm
   * @date 2023-09-28 01:48:05
   * @param {ITreeNodeData} nodeData
   * @param {boolean} isExpand true为展开，false为折叠
   */
  onExpandChange(nodeData: ITreeNodeData, isExpand: boolean): void {
    nodeData.srfcollapsestate = isExpand ? 1 : 0;
    const hasKey = this.state.expandedKeys.includes(nodeData._id);
    if (isExpand && !hasKey) {
      this.state.expandedKeys.push(nodeData._id);
    } else if (!isExpand && hasKey) {
      const index = this.state.expandedKeys.indexOf(nodeData._id);
      if (index !== -1) {
        this.state.expandedKeys.splice(index, 1);
      }
    }
  }

  /**
   * 树节点双击事件
   * @author lxm
   * @date 2023-05-29 10:01:36
   * @param {ITreeNodeData} nodeData
   * @return {*}  {Promise<void>}
   */
  async onDbTreeNodeClick(_nodeData: ITreeNodeData): Promise<void> {
    const nodeData = this.getNodeData(_nodeData._id);
    if (this.state.mdctrlActiveMode === 2 && nodeData) {
      await this.setActive(nodeData);
    }
  }

  setActive(item: ITreeNodeData): Promise<void> {
    const nodeParams = this.parseTreeNodeData(item);
    return this._evt.emit('onActive', { ...nodeParams, nodeData: item });
  }

  setSelection(selection: { _id: string }[]): void {
    // todo 当自己点选中时，父节点选不选中，如果选中需要在这边优化

    // 通过id过滤出原始的树节点数据，避免外部使用的时候传入的选中数据有问题。
    const selectionIds = selection.map(item => item._id);
    const filterArr = this.state.items.filter(item =>
      selectionIds.includes(item._id),
    );
    super.setSelection(filterArr);
  }

  /**
   * 获取节点模型
   * @author lxm
   * @date 2023-07-27 10:47:58
   * @param {string} id
   * @return {*}  {(IDETreeNode | undefined)}
   */
  getNodeModel(id: string): IDETreeNode | undefined {
    return this.model.detreeNodes?.find(item => item.id === id);
  }

  /**
   * 通过标识获取节点数据
   * @author lxm
   * @date 2023-12-22 02:21:38
   * @param {string} key 可以是节点_id也可以是_uuid
   * @return {*}  {(ITreeNodeData | undefined)}
   */
  getNodeData(key: string): ITreeNodeData | undefined {
    const find = this.state.items.find(item => item._id === key);
    if (find) {
      return find;
    }
    return this.state.items.find(item => item._uuid === key);
  }

  /**
   * 执行界面行为
   *
   * @author chitanda
   * @date 2023-12-07 15:12:26
   * @param {string} uiActionId
   * @param {ITreeNodeData} nodeData
   * @param {MouseEvent} event
   * @param {string} appId
   * @return {*}  {Promise<void>}
   */
  async doUIAction(
    uiActionId: string,
    nodeData: ITreeNodeData,
    event: MouseEvent,
    appId: string,
  ): Promise<void> {
    const eventArgs = this.getEventArgs();
    const nodeParams = this.parseTreeNodeData(nodeData);
    const result = await UIActionUtil.exec(
      uiActionId!,
      {
        ...eventArgs,
        ...nodeParams,
        event,
        noWaitRoute: true,
      },
      appId,
    );
    if (result.closeView) {
      this.view.closeView();
    } else if (result.refresh) {
      switch (result.refreshMode) {
        // 刷新当前节点的子
        case 1:
          this.refreshNodeChildren(nodeData);
          break;
        // 刷新当前节点的父节点的子
        case 2:
          this.refreshNodeChildren(nodeData, true);
          break;
        // 刷新所有节点数据
        case 3:
          this.refresh();
          break;
        default:
      }
    }
    // 异步行为处理
    const action = await getUIActionById(uiActionId, appId);
    if (
      (action!.asyncAction && !result.cancel) ||
      action!.uiactionParamJO?.srfasyncaction
    ) {
      if (!event || !event.target) {
        return;
      }
      await ibiz.util.anime.moveAndResize(
        event.target as HTMLElement,
        `#${PresetIdentifier.MESSAGE}`,
      );
    }
  }

  /**
   * 解析树节点获取通用数据，和完整的上下文和视图参数。
   * @author lxm
   * @date 2023-08-09 11:45:34
   * @protected
   * @param {ITreeNodeData} nodeData
   */
  protected parseTreeNodeData(nodeData: ITreeNodeData): {
    data: IData[];
    context: IContext;
    params: IParams;
  } {
    let tempData = null;
    if (nodeData._nodeType === 'DE') {
      tempData = nodeData;
    } else {
      tempData = { ...nodeData, ...(nodeData._deData || {}) };
    }
    return {
      data: [tempData],
      context: Object.assign(this.context.clone(), nodeData._context || {}),
      params: { ...this.params, ...(nodeData._params || {}) },
    };
  }

  /**
   * 计算展开节点集合(根据加载的子节点计算所有的展开节点标识集合)
   * @author lxm
   * @date 2023-08-09 05:19:36
   * @param {ITreeNodeData[]} nodes
   * @param {boolean} [isRoot=false]
   * @return {*}  {string[]}
   */
  calcExpandedKeys(nodes: ITreeNodeData[]): string[] {
    // 用户操作的添加的要保留
    let expandedKeys: string[] = [...this.state.expandedKeys];

    // 计算加载回来的里面带的默认展开
    recursiveIterate(
      { _children: nodes },
      (node: ITreeNodeData) => {
        if (node._children?.length) {
          expandedKeys.push(node._id);
        }
      },
      { childrenFields: ['_children'] },
    );

    // 去重
    expandedKeys = Array.from(new Set(expandedKeys));
    return expandedKeys;
  }

  /**
   * 刷新指定树节点的子节点数据
   * @author lxm
   * @date 2023-08-23 08:23:59
   * @param {(ITreeNodeData | IData)} nodeData 指定树节点数据，可以是节点数据，也可以是对应的实体数据
   * @param {boolean} [refreshParent=false] 是否是刷新给定节点数据的父节点的子节点数据
   * @return {*}  {Promise<void>}
   */
  async refreshNodeChildren(
    nodeData: { _id?: string; srfkey?: string },
    refreshParent = false,
  ): Promise<void> {
    const key = nodeData.srfkey ? 'srfkey' : '_id';
    const currentNode = this.state.items.find(
      item => item[key] === nodeData[key],
    );
    if (!currentNode) {
      ibiz.log.error(
        ibiz.i18n.t('runtime.controller.control.tree.noFoundTreeData'),
        nodeData,
      );
      return;
    }

    // 刷新父，但是没父，刷新根
    if (refreshParent) {
      const { _parent } = currentNode;
      // 没有父，或者父是不显示的根节点，那么刷新所有
      if (
        !_parent ||
        (!this.model.rootVisible && this.state.rootNodes.includes(_parent))
      ) {
        await this.refresh();
        return;
      }
    }

    const targetNode = refreshParent ? currentNode._parent! : currentNode;

    const nodes = await this.loadNodes(targetNode);
    this._evt.emit('onAfterRefreshParent', {
      parentNode: targetNode,
      children: nodes,
    });
  }

  async expandNodeByKey(expandKeys: string[]): Promise<void> {
    const noExpandKeys = expandKeys.filter(
      key => !this.state.expandedKeys.includes(key),
    );
    if (noExpandKeys.length === 0) {
      return;
    }

    // 找到已存在的要展开的节点
    const existNodes = this.state.items.filter(item =>
      noExpandKeys.includes(item._id),
    );

    // 补充所有未展开的节点标识，查询过程中会自动加载后续展开
    this.state.expandedKeys.push(...noExpandKeys);

    if (existNodes.length === 0) {
      return;
    }
    // 展开加载节点
    await Promise.all(
      existNodes.map(node => {
        return this.loadNodes(node);
      }),
    );
  }

  /**
   * 计算是否允许拖动
   * @author lxm
   * @date 2023-12-14 11:28:07
   * @param {ITreeNodeData} draggingNode
   * @return {*}  {boolean}
   */
  calcAllowDrag(draggingNode: ITreeNodeData): boolean {
    const nodeModel = this.getNodeModel(draggingNode._nodeId);
    return nodeModel?.allowDrag === true;
  }

  /**
   * 验证是否可拖入
   *
   * - 放入节点不能是拖拽节点或其子项，以免造成异常递归问题
   *
   * @protected
   * @param {ITreeNodeData} draggingNode 拖拽节点
   * @param {ITreeNodeData} dropNode 放入节点
   * @return {*}  {boolean}
   * @memberof TreeController
   */
  protected validateDrop(
    draggingNode: ITreeNodeData,
    dropNode: ITreeNodeData,
  ): boolean {
    let state: boolean = true;
    recursiveIterate(
      { _children: [draggingNode] },
      (node: ITreeNodeData) => {
        if (node._id === dropNode._id) {
          state = false;
          return true;
        }
      },
      { childrenFields: ['_children'] },
    );
    return state;
  }

  /**
   * 计算是否允许拖入
   * @author lxm
   * @date 2023-12-14 02:04:15
   * @param {ITreeNodeData} draggingNode
   * @param {ITreeNodeData} dropNode
   * @param {('inner' | 'prev' | 'next')} type
   * @return {*}  {boolean}
   */
  calcAllowDrop(
    draggingNode: ITreeNodeData,
    dropNode: ITreeNodeData,
    type: 'inner' | 'prev' | 'next',
  ): boolean {
    if (!this.validateDrop(draggingNode, dropNode)) return false;
    const draggingNodeModel = this.getNodeModel(draggingNode._nodeId)!;
    const dropNodeModel = this.getNodeModel(dropNode._nodeId)!;
    // * 移入的情况
    if (type === 'inner') {
      return !!this.findDropNodeRS(
        dropNode._nodeId!,
        draggingNodeModel.appDataEntityId!,
      );
    } else {
      // * 前后的情况，不同实体之间不能排序
      if (draggingNodeModel.appDataEntityId !== dropNodeModel.appDataEntityId) {
        return false;
      }
    }

    // 父相同的情况下,就是排序，看当前节点是否能排序
    if (draggingNode._parent?._id === dropNode._parent?._id) {
      const currentNodeModel = this.getNodeModel(dropNode._nodeId)!;
      return currentNodeModel?.allowOrder === true;
    }

    // 没有父就是根节点，根节点没有上层关系，无法换父
    if (!dropNode._parent) {
      return false;
    }

    // 父不一样的时候需要判断能否移入到对方的父节点内
    return !!this.findDropNodeRS(
      dropNode._parent!._nodeId!,
      draggingNodeModel.appDataEntityId!,
    );
  }

  /**
   * 找到指定父节点下的节点关系里面
   * 配置的实体关系的子实体是指定实体的
   * @author lxm
   * @date 2023-12-14 01:43:41
   * @protected
   * @param {string} parentId 父节点模型id
   * @param {string} appDataEntityId
   * @return {*}  {(IDETreeNodeRS | undefined)}
   */
  protected findDropNodeRS(
    parentId: string,
    appDataEntityId: string,
  ): DropNodeRS | undefined {
    const nodeRSs = this.dropNodeRss.get(parentId);
    return nodeRSs?.find(item => item.minorEntityId === appDataEntityId);
  }

  /**
   * 处理节点拖入事件
   * @author lxm
   * @date 2023-12-15 04:23:29
   * @param {ITreeNodeData} draggingNode
   * @param {ITreeNodeData} dropNode
   * @param {('inner' | 'prev' | 'next')} dropType
   * @return {*}  {Promise<void>}
   */
  async onNodeDrop(
    draggingNode: ITreeNodeData,
    dropNode: ITreeNodeData,
    dropType: 'inner' | 'prev' | 'next',
  ): Promise<void> {
    if (
      dropType === 'inner' &&
      !dropNode._leaf &&
      dropNode._children === undefined
    ) {
      await this.expandNodeByKey([dropNode._id]);
    }

    const draggingNodeModel = this.getNodeModel(draggingNode._nodeId)!;
    const dropInNode = dropType === 'inner' ? dropNode : dropNode._parent!;
    const isChangedParent =
      dropType === 'inner' ||
      dropNode._parent?._id !== draggingNode._parent?._id;
    let orderNodeModel = this.getNodeModel(dropNode._nodeId)!;
    const isEntityChange =
      draggingNodeModel.appDataEntityId !== orderNodeModel.appDataEntityId;

    // * 处理切换父节点
    if (isChangedParent) {
      const dropNodeRs = this.findDropNodeRS(
        dropInNode._nodeId,
        draggingNodeModel.appDataEntityId!,
      );
      if (dropNodeRs) {
        // 修改关系属性的值为父节点的主键和树节点id
        draggingNode._deData![dropNodeRs.pickupDEFName] =
          dropInNode._nodeType === 'STATIC' ? null : dropInNode._value;
        orderNodeModel = this.getNodeModel(dropNodeRs.childDETreeNodeId)!;
      }
      // 维护拖拽的节点和其子孙的展开，维护拖入节点的展开
      this.state.expandedKeys = this.calcExpandedKeys([dropInNode]);
      await this.updateDeNodeData([draggingNode]);
    }

    // 拖入节点或实体不同时刷新父节点
    if (dropType === 'inner' || isEntityChange) {
      if (isChangedParent) {
        await this.refreshNodeChildren(draggingNode, true);
      }
      await this.refreshNodeChildren(dropInNode, true);
    } else {
      // 移动排序
      const { moveAppDEActionId, appDataEntityId, allowOrder } =
        orderNodeModel as IDETreeDataSetNode;
      if (allowOrder) {
        if (!moveAppDEActionId) {
          throw new RuntimeModelError(
            this.model,
            ibiz.i18n.t('runtime.controller.common.md.noMoveDataCconfig'),
          );
        }
        const moveParams = {
          srftargetkey: dropNode.srfkey,
          srfmovetype: dropType === 'prev' ? 'MOVEBEFORE' : 'MOVEAFTER',
        };
        const app = ibiz.hub.getApp(this.context.srfappid);
        const deName = calcDeCodeNameById(appDataEntityId!);
        const tempContext = this.context.clone();
        tempContext[deName] = draggingNode.srfkey;
        try {
          const res = await app.deService.exec(
            appDataEntityId!,
            moveAppDEActionId,
            tempContext,
            moveParams,
          );
          if (res.ok) {
            this.emitDEDataChange('update', draggingNode._deData!);
            if (isChangedParent) {
              await this.refreshNodeChildren(draggingNode, true);
            }
            await this.refreshNodeChildren(dropInNode);
          }
        } catch (error) {
          // 拖动失败重置位置
          await this.refreshNodeChildren(dropInNode);
          this.actionNotification('DROPERROR', {
            error: error as Error,
          });
        }
      }
    }

    // *通知界面修改移入的父节点的子节点数据
    this._evt.emit('onAfterNodeDrop', { isChangedParent });
  }

  /**
   * 更新实体节点数据
   * @author lxm
   * @date 2023-12-15 04:19:36
   * @protected
   * @param {ITreeNodeData[]} nodeDatas 节点数据集合
   * @return {*}  {Promise<void>}
   */
  async updateDeNodeData(nodeDatas: ITreeNodeData[]): Promise<void> {
    const app = ibiz.hub.getApp(this.context.srfappid);
    await Promise.all(
      nodeDatas.map(async node => {
        const model = this.getNodeModel(node._nodeId)!;
        let deData = node._deData!;
        if (node._changedOnly) {
          deData = node.getDiffData()!;
        }
        // 往上下文添加主键
        const deName = calcDeCodeNameById(model.appDataEntityId!);
        const tempContext = this.context.clone();
        tempContext[deName] = deData.srfkey;

        // 调用接口修改数据
        const res = await app.deService.exec(
          model.appDataEntityId!,
          (model as IData).updateAppDEActionId || 'update',
          tempContext,
          deData,
        );

        // 更新完之后更新state里的数据。
        if (res.ok) {
          node._deData = res.data;
          node._oldDeData = res.data.clone();
          // 通知实体数据变更
          this.emitDEDataChange('update', node._deData!);
        }
      }),
    );
  }

  /**
   * 修改节点文本
   * @author lxm
   * @date 2023-12-15 04:32:52
   * @param {ITreeNodeData} nodeData
   * @param {string} text
   * @return {*}  {Promise<void>}
   */
  async modifyNodeText(nodeData: ITreeNodeData, text: string): Promise<void> {
    const model = this.getNodeModel(nodeData._nodeId)! as IDETreeDataSetNode;
    if (!model.allowEditText) {
      throw new RuntimeModelError(
        model,
        ibiz.i18n.t('runtime.controller.control.tree.editMode'),
      );
    }
    if (nodeData._nodeType !== 'DE') {
      throw new RuntimeError(
        ibiz.i18n.t('runtime.controller.control.tree.nodeData'),
      );
    }
    nodeData._text = text;
    await this.updateDeNodeData([nodeData]);
  }

  /**
   * @description 处理项删除
   * @param {IData} item
   * @param {IContext} context
   * @param {IParams} params
   * @returns {*}  {Promise<boolean>}
   * @memberof TreeController
   */
  async handleItemRemove(
    item: ITreeNodeData,
    context: IContext,
    params: IParams,
  ): Promise<boolean> {
    let needRefresh = false;
    const treeNode = this.getNodeModel(item._nodeId);
    if (!treeNode) {
      throw new RuntimeError(
        ibiz.i18n.t('runtime.controller.control.tree.noFoundTreeNode'),
      );
    }
    const nodeAppDataEntityId = treeNode.appDataEntityId;
    if (nodeAppDataEntityId) {
      const deName = calcDeCodeNameById(nodeAppDataEntityId);
      if ((item as IData).srfuf !== Srfuf.CREATE) {
        const tempContext = context.clone();
        tempContext[deName] = item.srfkey;
        // 删除后台的数据
        await this.service.removeItem(
          nodeAppDataEntityId,
          tempContext,
          params,
          (treeNode as IDETreeDataSetNode).removeAppDEActionId,
        );
        needRefresh = true;
      }
    }
    return needRefresh;
  }

  /**
   * 检测实体数据变更
   *
   * @author tony001
   * @date 2024-03-28 18:03:09
   * @protected
   * @param {IPortalMessage} msg
   * @return {*}  {void}
   */
  protected onDEDataChange(msg: IPortalMessage): void {
    // msg.triggerKey 不为空，且与当前控制器的triggerKey一致时，则不处理
    if (!isNil(msg.triggerKey) && msg.triggerKey === this.triggerKey) {
      return;
    }

    // 新增数据不刷新
    if (msg.subtype === 'OBJECTCREATED') {
      return;
    }

    const data = msg.data as IData;
    const findNode = this.state.items.find(
      item =>
        item._nodeType === 'DE' &&
        item._deData &&
        data &&
        item._deData.srfdecodename === data.srfdecodename &&
        item._deData.srfkey === data.srfkey,
    );

    if (!findNode) {
      return;
    }

    this.doNextActive(
      () => !this.ctx.isDestroyed && this.refreshNodeChildren(findNode, true),
      {
        key: `refresh${findNode._id}`,
      },
    );
  }

  /**
   * @description 切换折叠，其中tag表示操作指定树节点标识，若不传则操作当前树的第一层节点展开状态，expand表示是否展开，若不传则基于节点展开状态取反
   * @param {{ tag?: string; expand?: boolean }} [params={}]
   * @memberof TreeController
   */
  changeCollapse(params: { tag?: string; expand?: boolean } = {}): void {
    const { tag, expand } = params;
    if (tag) {
      const expandedKeysSet = new Set(this.state.expandedKeys);
      const expanded = isBoolean(expand) ? expand : !expandedKeysSet.has(tag);
      if (expanded) {
        expandedKeysSet.add(tag);
      } else {
        expandedKeysSet.delete(tag);
      }
      this.state.expandedKeys = Array.from(expandedKeysSet);
    } else if (this.state.rootNodes.length > 0) {
      // 全部展开只对第一层节点生效
      if (expand) {
        const { _children = [] } = this.state.rootNodes[0];
        this.state.expandedKeys = _children.map(x => x.srfnodeid);
      } else {
        this.state.expandedKeys = [];
      }
    }
  }

  /**
   * 新建树节点
   *
   * @author tony001
   * @date 2024-12-24 17:12:00
   * @param {IApiNewTreeNodeParams} _params 新建树节点需要的参数
   */
  public newTreeNode(_params: IApiNewTreeNodeParams): void {
    const { parentKey = '', nodeType, defaultValue = {} } = _params;
    const nodeModel = this.getNodeModel(nodeType);
    const parentNodeData = this.getNodeData(parentKey);
    if (!nodeModel) {
      throw new RuntimeModelError(
        this.model,
        ibiz.i18n.t('runtime.controller.control.tree.noFoundTreeNode'),
      );
    }
    this._evt.emit('onNewTreeNode', {
      nodeModel,
      parentNodeData,
      defaultValue,
    });
  }

  /**
   * 新建树节点数据
   *
   * @author tony001
   * @date 2024-12-24 18:12:31
   * @param {IData[]} nodeDatas
   * @return {*}  {Promise<void>}
   */
  async createDeNodeData(nodeDatas: IData[]): Promise<void> {
    const app = ibiz.hub.getApp(this.context.srfappid);
    await Promise.all(
      nodeDatas.map(async node => {
        const model = this.getNodeModel(node._nodeId)!;
        const _deData = node._deData!;
        const tempContext = this.context.clone();
        const res = await app.deService.exec(
          model.appDataEntityId!,
          'create',
          tempContext,
          _deData,
        );
        // 更新完之后更新state里的数据。
        if (res.data) {
          this.refresh();
        }
      }),
    );
  }

  /**
   * @description 获取加载更多信息项
   * @param {string} id
   * @returns {*}  {(LoadMoreInfoItem[] | undefined)}
   * @memberof TreeController
   */
  getLoadMoreInfoItems(id: string): LoadMoreInfoItem[] | undefined {
    return this.service.loadMoreMap[id];
  }

  /**
   * @description 获取加载更多最终节点数据
   * @param {ITreeNodeData} parentNode
   * @param {boolean} hasQuery
   * @returns {*}  {ITreeNodeData[]}
   * @memberof TreeController
   */
  getLoadMoreNodes(
    parentNode: ITreeNodeData,
    hasQuery: boolean,
  ): ITreeNodeData[] {
    const items: ITreeNodeData[] = [];
    const infoItems = this.getLoadMoreInfoItems(parentNode._id);
    if (infoItems) {
      const childNodeRSs = getChildNodeRSs(this.model, {
        parentId: parentNode._nodeId,
        hasQuery,
      });
      childNodeRSs?.forEach(item => {
        const nodeModel = getTreeNode(this.model, item.childDETreeNodeId!);
        if (!nodeModel) {
          return;
        }
        const infoItem = infoItems.find(
          _item => _item.nodeModelId === nodeModel.id,
        );
        if (!infoItem) {
          return;
        }
        items.push(...(infoItem.items || []));
      });
    }
    const targetNodes: ITreeNodeData[] = [];
    items.forEach((child: ITreeNodeData) => {
      const targetNode = this.model.detreeNodes?.find((item: IData) => {
        return item.id === child._nodeId;
      });
      // 开启了排除重复值,并且配置了标识属性
      if (
        targetNode &&
        (targetNode as IDETreeDataSetNode).distinctMode &&
        (targetNode as IDETreeDataSetNode).idAppDEFieldId
      ) {
        // 同批次数据排重
        const index = targetNodes.findIndex((item: ITreeNodeData) => {
          const id = (targetNode as IDETreeDataSetNode).idAppDEFieldId;
          if (id) {
            return item._deData?.[id] === child._deData?.[id];
          }
          return false;
        });
        if (index < 0) {
          targetNodes.push(child);
        }
      } else {
        targetNodes.push(child);
      }
    });
    return targetNodes;
  }

  /**
   * @description 打开编辑数据视图
   * @param {ITreeNodeData} node
   * @param {MouseEvent} [event]
   * @returns {*}  {Promise<IUIActionResult>}
   * @memberof TreeController
   */
  async openData(
    item: ITreeNodeData,
    event?: MouseEvent,
  ): Promise<IUIActionResult> {
    const nodeModel = this.getNodeModel(item._nodeId);
    if (!nodeModel) {
      throw new RuntimeError(
        ibiz.i18n.t('runtime.controller.control.tree.noFoundTreeNode'),
      );
    }
    const { context, params, data } = this.parseTreeNodeData(item);
    const { appDataEntityId } = nodeModel as IDETreeDataSetNode;
    const deName = calcDeCodeNameById(appDataEntityId!);
    context[deName!.toLowerCase()] = item.srfkey;
    context.srfnavctrlid = this.ctrlId;
    const result = await this.viewScheduler?.triggerCustom(
      `${nodeModel.id!.toLowerCase()}_opendata`,
      {
        data,
        event,
        params,
        context,
        view: this.view,
        ctrl: this,
      },
    );

    if (result === -1)
      throw new RuntimeModelError(
        nodeModel,
        ibiz.i18n.t('runtime.controller.common.md.logicOpendata', {
          itemType: nodeModel.id!.toLowerCase(),
        }),
      );

    return {
      cancel: result ? !result.ok : true,
    };
  }

  /**
   * @description 打开新建编辑视图
   * @param {ITreeNodeData} node
   * @param {MouseEvent} [event]
   * @returns {*}  {Promise<IUIActionResult>}
   * @memberof TreeController
   */
  async newData(
    item: ITreeNodeData,
    event?: MouseEvent,
  ): Promise<IUIActionResult> {
    const nodeModel = this.getNodeModel(item._nodeId);
    if (!nodeModel) {
      throw new RuntimeError(
        ibiz.i18n.t('runtime.controller.control.tree.noFoundTreeNode'),
      );
    }
    const { context, params, data } = this.parseTreeNodeData(item);
    context.srfnavctrlid = this.ctrlId;
    const result = await this.viewScheduler?.triggerCustom(
      `${item._nodeId.toLowerCase()}_newdata`,
      {
        data,
        event,
        params,
        context,
        view: this.view,
        ctrl: this,
      },
    );

    if (result === -1)
      throw new RuntimeModelError(
        nodeModel,
        ibiz.i18n.t('runtime.controller.common.md.logicNewdata', {
          itemType: nodeModel.id!.toLowerCase(),
        }),
      );

    return {
      cancel: result ? !result.ok : true,
    };
  }
}
