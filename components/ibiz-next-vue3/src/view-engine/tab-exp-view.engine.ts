import { ModelError } from '@ibiz-template/core';
import {
  ViewEngineBase,
  ViewController,
  ITabExpPanelController,
  ITabExpViewEvent,
  ITabExpViewState,
  calcDeCodeNameById,
  getControl,
  SysUIActionTag,
  IApiTabExpViewCall,
} from '@ibiz-template/runtime';
import {
  IAppDETabExplorerView,
  IPanelContainer,
  IPanelItem,
} from '@ibiz/model-core';

export class TabExpViewEngine extends ViewEngineBase {
  /**
   * 分页面板视图控制器
   *
   * @protected
   * @type {ViewController<
   *         IAppDETabExplorerView,
   *         ITabExpViewState,
   *         ITabExpViewEvent
   *     >}
   * @memberof TabExpViewEngine
   */
  declare protected view: ViewController<
    IAppDETabExplorerView,
    ITabExpViewState,
    ITabExpViewEvent
  >;

  /**
   * 分页导航面板
   *
   * @readonly
   * @memberof TabExpViewEngine
   */
  get tabExpPanel(): ITabExpPanelController {
    return this.view.getController('tabexppanel') as ITabExpPanelController;
  }

  /**
   * 视图created生命周期执行逻辑
   *
   * @return {*}  {Promise<void>}
   * @memberof TabExpViewEngine
   */
  async onCreated(): Promise<void> {
    this.preprocessTabExpModelLayout();
    await super.onCreated();
    const { childNames, model } = this.view;
    childNames.push('tabexppanel');
    if (!this.view.slotProps.tabexppanel) {
      this.view.slotProps.tabexppanel = {};
    }

    // 获取视图参数里的srfdefaultnav
    const { appViewParams } = model;
    const srfdefaultnav = appViewParams?.find(
      item => item.id === 'srfdefaultnav',
    )?.value;

    this.view.slotProps.tabexppanel.defaultTabName =
      this.view.state.srfnav || srfdefaultnav;
    // 分页导航视图默认隐藏编辑项
    this.view.slotProps.tabexppanel.hideEditItem = true;
  }

  /**
   * 分页导航视图刷新
   *
   * @author tony001
   * @date 2024-10-21 11:10:47
   * @return {*}  {Promise<void>}
   */
  async refresh(): Promise<void> {
    await this.loadEntityData();
    this.tabExpPanel.refresh();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
  async call(key: keyof IApiTabExpViewCall, args: any): Promise<any> {
    if (key === SysUIActionTag.REFRESH) {
      await this.refresh();
      return null;
    }
    return super.call(key, args);
  }

  async onMounted(): Promise<void> {
    await super.onMounted();
    await this.loadEntityData();
  }

  async loadEntityData(): Promise<void> {
    // 分页导航没有主键不加载
    const deName = calcDeCodeNameById(this.view.model.appDataEntityId!);
    if (!this.view.context[deName]) {
      return;
    }
    return super.loadEntityData();
  }

  /**
   * 根据视图模型配置方向决定分页面板部件位置方向
   *
   * @author zk
   * @date 2023-09-20 05:09:37
   * @protected
   * @memberof TabExpViewEngine
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
        throw new ModelError(
          this.view.model.viewLayoutPanel!,
          ibiz.i18n.t('viewEngine.noFoundLayoutOccupied'),
        );
      }
      // 实际分页面板容器
      const layoutContainer = findPanelItem(name);
      if (!layoutContainer) {
        throw new ModelError(
          this.view.model.viewLayoutPanel!,
          ibiz.i18n.t('viewEngine.noFoundLayoutContainer', { name }),
        );
      }
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
    // 非流式布局时进行额外处理
    if (tabLayout !== 'FLOW' && tabLayout !== 'FLOW_NOHEADER') {
      // 设置分页导航面板布局
      setTabExpModelLayout(containerName);
      // 删除多余布局模型
      findPanelItemsAndDelete(deleteItems);
    }
  }

  /**
   * 计算视图头部元素的显示与否
   * 所有部件容器名称均为：view_部件名称
   *
   * @author lxm
   * @date 2023-06-06 07:16:26
   * @protected
   */
  protected calcViewHeaderVisible(): boolean {
    let showHeader = super.calcViewHeaderVisible();

    const { tabLayout } = this.view.model;
    // 只有上方显示分页的时候，且有分页导航面板时显示头部
    if (
      tabLayout === undefined ||
      (['TOP', 'TOP_DROPDOWNLIST'].includes(tabLayout) &&
        getControl(this.view.model, 'tabexppanel'))
    ) {
      showHeader = true;
    }
    return showHeader;
  }
}
