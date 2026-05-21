import {
  IApiReportViewCall,
  IReportPanelController,
  IReportViewEvent,
  IReportViewState,
  ISearchBarController,
  ISearchFormController,
  SysUIActionTag,
  ViewController,
  ViewEngineBase,
  getControl,
} from '@ibiz-template/runtime';
import { IAppDEReportView, ISearchBar } from '@ibiz/model-core';

export class ReportViewEngine extends ViewEngineBase {
  /**
   * 视图控制器
   *
   * @protected
   * @type {ViewController<
   *     IAppDEReportView,
   *     IReportViewState,
   *     IReportViewEvent
   *   >}
   * @memberof EditViewEngine
   */
  declare protected view: ViewController<
    IAppDEReportView,
    IReportViewState,
    IReportViewEvent
  >;

  /**
   * 搜索表单控制器
   *
   * @readonly
   */
  protected get searchForm(): ISearchFormController {
    return this.view.getController('searchform') as ISearchFormController;
  }

  /**
   * 搜索栏控制器
   *
   * @readonly
   */
  protected get searchBar(): ISearchBarController {
    return this.view.getController('searchbar') as ISearchBarController;
  }

  /**
   * 报表部件
   *
   * @readonly
   */
  get reportpanel(): IReportPanelController {
    return this.view.getController('reportpanel') as IReportPanelController;
  }

  /**
   * 初始化
   *
   * @return {*}  {Promise<void>}
   * @memberof ReportViewEngine
   */
  async onCreated(): Promise<void> {
    await super.onCreated();
    const { childNames } = this.view;
    childNames.push('searchform', 'searchbar', 'reportpanel');
    if (!this.view.slotProps.reportpanel) {
      this.view.slotProps.reportpanel = {};
    }
  }

  /**
   * 挂载
   *
   * @return {*}  {Promise<void>}
   * @memberof ReportViewEngine
   */
  async onMounted(): Promise<void> {
    await super.onMounted();
    const { model } = this.view;

    this.reportpanel.evt.on('onBeforeLoad', () => {
      this.reportpanel.state.searchParams = this.getSearchParams();
    });

    this.reportpanel.evt.on('onLoadSuccess', event => {
      this.view.evt.emit('onDataChange', { ...event, actionType: 'LOAD' });
    });
    // 计算是否默认展开搜索表单
    const controller = this.viewLayoutPanel!.panelItems.view_searchform;
    if (controller) {
      const formExists = !!this.searchForm;
      controller.state.keepAlive = formExists;
      controller.state.visible = formExists && !!model.expandSearchForm;
    }

    // 搜索表单搜索触发加载
    if (this.searchForm) {
      this.searchForm.evt.on('onSearch', () => {
        this.reLoad();
      });
    }

    // 搜索栏搜索触发加载
    if (this.searchBar) {
      this.searchBar.evt.on('onSearch', () => {
        this.reLoad();
      });
    }

    if (!this.view.state.noLoadDefault && model.loadDefault) {
      this.load();
    }
  }

  async call(
    key: keyof IApiReportViewCall,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    args: any,
  ): Promise<IData | null | undefined> {
    if (key === SysUIActionTag.REFRESH) {
      await this.refresh();
      return null;
    }
    if (key === SysUIActionTag.SEARCH) {
      await this.searchForm.search();
      return null;
    }
    if (key === SysUIActionTag.RESET) {
      await this.searchForm.reset();
      return null;
    }
    return super.call(key, args);
  }

  /**
   * 获取数据
   *
   * @return {*}  {IData[]}
   * @memberof ReportViewEngine
   */
  getData(): IData[] {
    return this.reportpanel.getData();
  }

  /**
   * 加载数据
   *
   * @return {*}  {Promise<IData>}
   * @memberof ReportViewEngine
   */
  async load(): Promise<IData> {
    return this.reportpanel.load();
  }

  /**
   * 视图重新加载
   *
   * @return {*}  {Promise<void>}
   */
  protected async reLoad(): Promise<void> {
    await this.reportpanel.load({ isInitialLoad: true });
  }

  /**
   * 刷新
   *
   * @return {*}  {Promise<void>}
   * @memberof ReportViewEngine
   */
  async refresh(): Promise<void> {
    this.reportpanel.doNextActive(() => this.load(), { key: 'load' });
  }

  /**
   * 获取搜索相关的查询参数
   *
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
   *计算视图头部实现是否显示
   *
   * @protected
   * @return {*}  {boolean}
   * @memberof ReportViewEngine
   */
  protected calcViewHeaderVisible(): boolean {
    const showHeader = super.calcViewHeaderVisible();
    // 搜索栏
    const visible = this.calcViewSearchBarVisible();
    return visible || showHeader;
  }

  /**
   * 计算搜索栏显示
   *
   * @author zk
   * @date 2024-01-29 05:01:36
   * @protected
   * @return {*}  {boolean}
   * @memberof MDViewEngine
   */
  protected calcViewSearchBarVisible(): boolean {
    const { model } = this.view;
    // 搜索栏

    const has: boolean = this.isExistAndInLayout('searchbar');
    if (!has) {
      return has;
    }
    const searchBar: ISearchBar = getControl(model, 'searchbar')!;
    const visible = !!(
      searchBar.enableQuickSearch ||
      searchBar.enableGroup ||
      searchBar.enableFilter === true
    );
    return visible;
  }

  /**
   * 计算移除的模型名称
   *
   * @author zk
   * @date 2024-01-29 03:01:42
   * @return {*}  {string[]}
   * @memberof MDViewEngine
   */
  calcRemoveLayoutModel(): string[] {
    const names = super.calcRemoveLayoutModel();
    if (!this.calcViewSearchBarVisible()) {
      names.push('view_searchbar');
    }
    return names;
  }

  /**
   * 切换搜索表单的显示与否
   *
   * @protected
   */
  protected toggleFilter(): void {
    if (this.searchForm) {
      const searchformContainer =
        this.viewLayoutPanel!.panelItems.view_searchform;
      if (searchformContainer) {
        searchformContainer.state.visible = !searchformContainer.state.visible;
      }
    }
  }
}
