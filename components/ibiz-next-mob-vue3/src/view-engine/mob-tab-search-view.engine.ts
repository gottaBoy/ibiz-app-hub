import {
  IApiMobTabSearchViewCall,
  ISearchBarController,
  ISearchFormController,
  ITabExpPanelController,
  ITabSearchViewEvent,
  ITabSearchViewState,
  SysUIActionTag,
  ViewController,
} from '@ibiz-template/runtime';
import { IAppDETabSearchView, IDETabViewPanel } from '@ibiz/model-core';
import { MobTabExpViewEngine } from './mob-tab-exp-view.engine';

/**
 * 分页搜索视图
 *
 * @export
 * @class MobTabSearchViewEngine
 * @extends {EditViewEngine}
 */
export class MobTabSearchViewEngine extends MobTabExpViewEngine {
  /**
   * 视图控制器
   *
   * @protected
   * @type {ViewController<
   *     IAppDETabSearchView,
   *     ITabSearchViewState,
   *     ITabSearchViewEvent
   *   >}
   * @memberof MobTabSearchViewEngine
   */
  declare protected view: ViewController<
    IAppDETabSearchView,
    ITabSearchViewState,
    ITabSearchViewEvent
  >;

  /**
   * 搜索表单控制器
   * @author lxm
   * @date 2023-05-22 01:56:25
   * @readonly
   */
  protected get searchForm(): ISearchFormController {
    return this.view.getController('searchform') as ISearchFormController;
  }

  /**
   * 搜索栏控制器
   * @author lxm
   * @date 2023-05-22 01:56:25
   * @readonly
   */
  protected get searchBar(): ISearchBarController {
    return this.view.getController('searchbar') as ISearchBarController;
  }

  /**
   * 分页导航面板控制器
   * @author lxm
   * @date 2023-05-22 01:56:25
   * @readonly
   */
  public get tabExpPanel(): ITabExpPanelController {
    return this.view.getController('tabexppanel') as ITabExpPanelController;
  }

  protected preprocessTabExpModelLayout(): void {
    // 不进行模型处理
  }

  async onCreated(): Promise<void> {
    await super.onCreated();
    const { childNames } = this.view;
    childNames.push('searchform', 'searchbar');
  }

  async onMounted(): Promise<void> {
    await super.onMounted();
    // 计算是否默认展开搜索表单
    const controller = this.viewLayoutPanel!.panelItems.view_searchform;
    if (controller) {
      const formExists = !!this.searchForm;
      controller.state.keepAlive = formExists;
      controller.state.visible = formExists;
    }

    const searchbarC = this.viewLayoutPanel!.panelItems.view_searchbar;
    if (searchbarC) {
      const visible =
        this.searchBar &&
        !!(
          this.searchBar.model.enableQuickSearch ||
          this.searchBar.model.enableGroup ||
          this.searchBar.model.enableFilter === true
        );
      searchbarC.state.visible = visible;
    }

    // 搜索表单搜索触发加载
    if (this.searchForm) {
      this.searchForm.evt.on('onSearch', () => {
        this.calcViewParams();
      });
    }

    // 搜索栏搜索触发加载
    if (this.searchBar) {
      this.searchBar.evt.on('onSearch', () => {
        this.calcViewParams();
      });
    }
    // 分页导航面板切换
    if (this.tabExpPanel) {
      this.tabExpPanel.evt.on(
        'onTabChange',
        ({ tab }: { tab: IDETabViewPanel }) => {
          this.calcViewParams();
          // 动态切换输入提示
          this.onQuickSearchPlaceHolder(tab);
        },
      );
      // 适配onTabChange第一次抛值时onMouted没有执行完毕
      const { activeTabViewPanelModel } = this.tabExpPanel as IParams;
      if (activeTabViewPanelModel) {
        this.onQuickSearchPlaceHolder(activeTabViewPanelModel);
      }
      this.onQuickSearchQuery();
    }
  }

  /**
   * 给快捷搜索赋query参数
   */
  public onQuickSearchQuery(): void {
    if (this.searchBar) {
      const routeDepth = this.view.modal.routeDepth;
      if (routeDepth) {
        const { pathNodes } = ibiz.appUtil.route2routeObject();
        const nextRouteObject = pathNodes[routeDepth];
        if (
          nextRouteObject &&
          nextRouteObject.params &&
          nextRouteObject.params.query
        ) {
          this.searchBar.state.query = nextRouteObject.params.query;
        }
      }
    }
  }

  /**
   * 给快捷搜索赋默认提示值
   * @author ljx
   * @date 2024-11-12 10:50:25
   * @return {*}  {Promise<void>}
   * @memberof MobTabSearchViewEngine
   */
  async onQuickSearchPlaceHolder(tab: IDETabViewPanel): Promise<void> {
    let { caption } = tab;
    const viewConfig = await ibiz.hub.config.view.get(
      tab.embeddedAppDEViewId || '',
    );
    const appDataEntity = await ibiz.hub.getAppDataEntity(
      viewConfig.appDataEntityId!,
      viewConfig.appId,
    );

    if (appDataEntity) {
      const searchFields = appDataEntity.appDEFields!.filter(field => {
        return field.enableQuickSearch;
      });
      if (searchFields.length) {
        const placeHolders: string[] = [];
        searchFields.forEach(searchField => {
          if (
            searchField.lnlanguageRes &&
            searchField.lnlanguageRes.lanResTag
          ) {
            placeHolders.push(
              ibiz.i18n.t(
                searchField.lnlanguageRes.lanResTag,
                searchField.logicName,
              ),
            );
          } else if (searchField.logicName) {
            placeHolders.push(searchField.logicName);
          }
        });
        if (placeHolders.length > 0) {
          caption = placeHolders.join('、');
        }
      }
    }

    // 直接赋值 caption
    (this.searchBar as IParams).placeHolder = caption || '';
    this.searchBar.state.quickSearchPlaceHolder = caption || '';
  }

  async call(
    key: keyof IApiMobTabSearchViewCall,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    args: any,
  ): Promise<IData | null | undefined> {
    if (key === SysUIActionTag.SEARCH) {
      await this.searchForm.search();
      return null;
    }
    if (key === SysUIActionTag.RESET) {
      await this.searchForm.reset();
      return null;
    }
    if (key === SysUIActionTag.REFRESH) {
      await this.calcViewParams();
      this.refresh();
      return null;
    }
    return super.call(key, args);
  }

  /**
   * 获取搜索相关的查询参数
   * @author lxm
   * @date 2023-05-22 03:26:04
   * @return {*}  {IParams}
   */
  protected getSearchParams(): IParams {
    const params: IParams = {};
    // 有搜索表单的整合相关参数
    if (this.searchForm) {
      Object.assign(params, this.searchForm.getFilterParams());
    }
    // 有搜索栏的整合相关参数
    if (this.searchBar) {
      Object.assign(params, this.searchBar.getFilterParams());
    }
    return params;
  }

  /**
   * 重新计算视图参数
   * @author lxm
   * @date 2024-03-18 05:00:02
   */
  calcViewParams(): void {
    this.tabExpPanel.state.expViewParams = this.getSearchParams();
    this.tabExpPanel.refresh();
  }
}
