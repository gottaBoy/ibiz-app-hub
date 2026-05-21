/* eslint-disable no-case-declarations */
import { IPortalMessage } from '@ibiz-template/core';
import {
  ViewController,
  ITabExpPanelController,
  ITabExpViewEvent,
  ITabExpViewState,
  ViewEngineBase,
  calcDeCodeNameById,
  IApiMDViewCall,
  SysUIActionTag,
  IViewController,
} from '@ibiz-template/runtime';
import {
  IAppDataEntity,
  IAppDETabExplorerView,
  ILayout,
  IPanelContainer,
  IPanelItem,
} from '@ibiz/model-core';

export class MobTabExpViewEngine extends ViewEngineBase {
  /**
   * 分页面板视图控制器
   *
   * @author zk
   * @date 2023-06-19 10:06:00
   * @protected
   * @type {ViewController<
   *     IAppDETabExplorerView,
   *     ITabExpViewState,
   *     ITabExpViewEvent
   *   >}
   * @memberof MobTabExpViewEngine
   */
  declare protected view: ViewController<
    IAppDETabExplorerView,
    ITabExpViewState,
    ITabExpViewEvent
  >;

  /**
   * 分页导航面板
   *
   * @author zk
   * @date 2023-06-19 10:06:15
   * @readonly
   * @memberof MobTabExpViewEngine
   */
  get tabExpPanel(): ITabExpPanelController {
    return this.view.getController('tabexppanel') as ITabExpPanelController;
  }

  /**
   * @description 当前多数据部件对应的应用实体对象
   * @protected
   * @type {IAppDataEntity}
   * @memberof MobTreeExpViewEngine
   */
  protected dataEntity!: IAppDataEntity;

  /**
   * @description 根据视图模型配置方向决定分页面板部件位置方向
   * @protected
   * @memberof MobTabExpViewEngine
   */
  protected preprocessTabExpModelLayout(): void {
    const findPanelItem = (
      name: string,
      items: IPanelItem[] = this.view.model.viewLayoutPanel!.rootPanelItems!,
    ): IPanelItem | undefined => {
      if (items?.length) {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          // 判断当前元素是否为目标子成员
          if (item.id === name) {
            return item; // 找到目标子成员，返回
          }
          // 如果当前元素包含panelItems属性，并且panelItems是一个非空数组，则递归查找子成员
          const container = item as IPanelContainer;
          if (container.panelItems && container.panelItems.length > 0) {
            const result = findPanelItem(name, container.panelItems);
            if (result) {
              return result; // 找到目标子成员，返回
            }
          }
        }
      }
      return undefined;
    };

    const findPanelItemsAndDelete = (
      names: string[],
      items: IPanelItem[] = this.view.model.viewLayoutPanel!.rootPanelItems!,
    ) => {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        // 判断当前元素是否为目标子成员
        if (names.includes(item.id!)) {
          items.splice(i, 1);
        }
        // 如果当前元素包含panelItems属性，并且panelItems是一个非空数组，则递归删除成员
        const container = item as IPanelContainer;
        if (container.panelItems && container.panelItems.length > 0) {
          findPanelItemsAndDelete(names, container.panelItems);
        }
      }
    };

    const setTabExpModelLayout = (name: string): void => {
      // 预制分页面板
      const tabexppanel = findPanelItem('tabexppanel');
      if (!tabexppanel) {
        return;
      }
      // 左侧及右侧布局模式下需调整tabexppanel的flex布局, 高度需撑满
      if (['view_tabexppanel_left', 'view_tabexppanel_right'].includes(name)) {
        tabexppanel.layoutPos = {
          ...tabexppanel.layoutPos,
          grow: 1,
        } as ILayout;
      }
      // 实际分页面板容器
      const layoutContainer = findPanelItem(name);
      if (!layoutContainer) {
        return;
      }
      // 删除原本的分页导航面板模型
      findPanelItemsAndDelete(['tabexppanel']);
      (layoutContainer as IPanelContainer).panelItems = [tabexppanel];
    };
    const { tabLayout } = this.view.model as IAppDETabExplorerView;
    // 需删除的容器数组
    const deleteItems: string[] = [
      'view_tabexppanel',
      'view_tabexppanel_left',
      'view_tabexppanel_bottom',
      'view_tabexppanel_right',
    ];
    // 配置方向的部件容器名称
    let containerName: string = 'view_tabexppanel';
    switch (tabLayout) {
      case 'LEFT':
        containerName = 'view_tabexppanel_left';
        deleteItems.splice(1, 1);
        break;
      case 'BOTTOM':
        containerName = 'view_tabexppanel_bottom';
        deleteItems.splice(2, 1);
        break;
      case 'RIGHT':
        containerName = 'view_tabexppanel_right';
        deleteItems.splice(3, 1);
        break;
      case 'TOP':
        deleteItems.splice(0, 1);
        break;
      case 'FLOW':
      case 'FLOW_NOHEADER':
        break;
      default:
        deleteItems.splice(0, 1);
        break;
    }
    // 设置分页导航面板布局
    setTabExpModelLayout(containerName);
    // 删除多余布局模型
    findPanelItemsAndDelete(deleteItems);
  }

  /**
   * 视图created生命周期执行逻辑
   *
   * @author zk
   * @date 2023-06-19 10:06:22
   * @return {*}  {Promise<void>}
   * @memberof MobTabExpViewEngine
   */
  async onCreated(): Promise<void> {
    this.preprocessTabExpModelLayout();
    await super.onCreated();
    const { childNames } = this.view;
    childNames.push('tabexppanel');
    if (!this.view.slotProps.tabexppanel) {
      this.view.slotProps.tabexppanel = {};
    }
    this.view.slotProps.tabexppanel.defaultTabName = this.view.state.srfnav;
    if (this.view.model.appDataEntityId) {
      // 初始化实体属性id和name的映射
      this.dataEntity = await ibiz.hub.getAppDataEntity(
        this.view.model.appDataEntityId!,
        this.view.model.appId,
      );
    }
    // 分页导航视图默认隐藏编辑项
    this.view.slotProps.tabexppanel.hideEditItem = true;
  }

  /**
   * 嵌入视图映射Map
   *
   * @type {Map<string, IViewController>}
   * @memberof MobTabExpViewEngine
   */
  embedViewMap: Map<string, IViewController> = new Map();

  /**
   * 视图mounted生命周期执行逻辑
   *
   * @return {*}  {Promise<void>}
   * @memberof MobTabExpViewEngine
   */
  async onMounted(): Promise<void> {
    await super.onMounted();
    await this.loadEntityData();

    this.view.layoutPanel?.evt.on('onPresetPanelItemEvent', (event: IData) => {
      if (!event?.presetParams?.view || !this.tabExpPanel?.state?.activeName) {
        return;
      }
      this.embedViewMap.set(
        this.tabExpPanel.state.activeName,
        event.presetParams.view,
      );
    });
  }

  async call(
    key: keyof IApiMDViewCall,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    _args: any,
  ): Promise<IData | null | undefined> {
    if (key === SysUIActionTag.REFRESH) {
      await this.refresh();
      return null;
    }
  }

  /**
   * 视图刷新
   *
   * @protected
   * @return {*}  {Promise<void>}
   * @memberof MobTabExpViewEngine
   */
  protected async refresh(): Promise<void> {
    if (!this.tabExpPanel?.state?.activeName) {
      return;
    }
    await this.loadEntityData();
    // 分页导航面板部件刷新通知路由变化，存在搜索栏时可刷新搜索使用的路由参数
    this.tabExpPanel.refresh();
    const activeView = this.embedViewMap.get(this.tabExpPanel.state.activeName);
    if (activeView) {
      activeView.call(SysUIActionTag.REFRESH);
    }
  }

  /**
   * 加载实体数据
   *
   * @return {*}  {Promise<void>}
   * @memberof MobTabExpViewEngine
   */
  async loadEntityData(): Promise<void> {
    // 分页导航没有主键不加载
    const deName = calcDeCodeNameById(this.view.model.appDataEntityId!);
    if (!this.view.context[deName]) {
      return;
    }
    return super.loadEntityData();
  }

  /**
   * @description 检测实体数据变更
   * @protected
   * @param {IPortalMessage} msg
   * @return {*}  {void}
   * @memberof MobTreeExpViewEngine
   */
  protected onDEDataChange(msg: IPortalMessage): void {
    // 非这个实体的数据变更，则不处理
    if (
      !msg.data ||
      (msg.data as IData).srfdecodename !== this.dataEntity?.codeName
    ) {
      return;
    }

    let isRefresh = false;
    const { srfkey } = msg.data as IData;

    // 只监听更新事件
    switch (msg.subtype) {
      case 'OBJECTUPDATED':
        const { srfactiveviewdata } = this.view.state;
        if (srfactiveviewdata && srfactiveviewdata.srfkey === srfkey) {
          isRefresh = true;
        }
        break;
      default:
        break;
    }

    if (isRefresh) {
      this.loadEntityData();
    }
  }
}
