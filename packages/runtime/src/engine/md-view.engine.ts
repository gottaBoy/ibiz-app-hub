import { RuntimeModelError } from '@ibiz-template/core';
import { IAppDEMultiDataView, IDEDataView, ISearchBar } from '@ibiz/model-core';
import { clone } from 'ramda';
import { SysUIActionTag, ViewCallTag } from '../constant';
import { ViewController } from '../controller';
import {
  IMDViewEvent,
  IMDViewState,
  IMDControlController,
  MDCtrlRemoveParams,
  ISearchBarController,
  MDCtrlLoadParams,
  EventBase,
  IUIActionResult,
  IToolbarController,
  IApiMDViewCall,
} from '../interface';
import { calcDeCodeNameById, getControl } from '../model';
import { ViewEngineBase } from './view-base.engine';

/**
 * 多数据视图引擎
 * @author lxm
 * @date 2023-05-22 03:12:29
 * @export
 * @class MDViewEngine
 * @extends {ViewEngineBase}
 */
export class MDViewEngine extends ViewEngineBase {
  declare protected view: ViewController<
    IAppDEMultiDataView,
    IMDViewState,
    IMDViewEvent
  >;

  /**
   * 多数据部件名称
   * @author lxm
   * @date 2023-06-07 09:17:19
   * @readonly
   * @type {string}
   */
  get xdataControlName(): string {
    return this.view.model.xdataControlName!;
  }

  /**
   * 获取分页搜索视图上移的工具栏控制器
   * @author lxm
   * @date 2023-05-22 03:47:43
   * @readonly
   * @protected
   * @type {(IToolbarController | undefined)}
   */
  protected get tabToolbar(): IToolbarController | undefined {
    return this.view.getController('tabtoolbar') as IToolbarController;
  }

  /**
   * 获取分页搜索视图上移的搜索栏控制器
   * @author lxm
   * @date 2023-05-22 01:56:25
   * @readonly
   */
  protected get tabSearchBar(): ISearchBarController {
    return this.view.getController('tabsearchbar') as ISearchBarController;
  }

  /**
   * 数据部件控制器（多数据）
   * @author lxm
   * @date 2023-05-22 01:56:35
   * @readonly
   * @type {IMDControlController}
   */
  protected get xdataControl(): IMDControlController {
    return this.view.getController(
      this.xdataControlName,
    ) as IMDControlController;
  }

  async onCreated(): Promise<void> {
    await super.onCreated();
    const { childNames } = this.view;
    childNames.push(
      this.xdataControlName!,
      'searchform',
      'searchbar',
      'tabtoolbar',
      'tabsearchform',
      'tabsearchbar',
    );

    // 存在xdataControlName名称时就是普通多数据视图，给对应的多数据部件传递noLoadDefault
    if (this.xdataControlName) {
      if (!this.view.slotProps[this.xdataControlName]) {
        this.view.slotProps[this.xdataControlName] = {};
      }
      this.view.slotProps[this.xdataControlName].loadDefault = false;
    }

    this.view.listenNewController((name: string) => {
      if (name === 'searchform') {
        // 计算是否默认展开搜索表单
        const { model } = this.view;
        const controller = this.viewLayoutPanel!.panelItems.view_searchform;
        if (controller) {
          const formExists = !!this.searchForm;
          controller.state.keepAlive = formExists;
          controller.state.visible = formExists && !!model.expandSearchForm;
        }
      }
    });
  }

  async onMounted(): Promise<void> {
    await super.onMounted();
    const { model } = this.view;
    this.xdataControl.evt.on('onActive', this.onXDataActive.bind(this));
    this.xdataControl.evt.on('onSelectionChange', async event => {
      // 更新工具栏状态
      this.toolbar?.calcButtonState(
        event.data[0],
        this.xdataControl.model.appDataEntityId,
        event,
      );
      this.tabToolbar?.calcButtonState(
        event.data[0],
        this.xdataControl.model.appDataEntityId,
        event,
      );
    });
    this.xdataControl.evt.on('onBeforeLoad', () => {
      this.xdataControl.state.searchParams = this.getSearchParams();
    });

    // 触发视图数据变更
    this.xdataControl.evt.on('onLoadSuccess', event => {
      // 更新工具栏状态
      this.toolbar?.calcButtonState(
        undefined,
        this.xdataControl.model.appDataEntityId,
        event,
      );
      this.tabToolbar?.calcButtonState(
        undefined,
        this.xdataControl.model.appDataEntityId,
        event,
      );
      this.view.evt.emit('onDataChange', { ...event, actionType: 'LOAD' });
    });
    this.xdataControl.evt.on('onRemoveSuccess', event => {
      this.view.evt.emit('onDataChange', { ...event, actionType: 'REMOVE' });
    });
    this.xdataControl.evt.on('onSaveSuccess', event => {
      this.view.evt.emit('onDataChange', { ...event, actionType: 'SAVE' });
    });
    // 刷新成功后，更新工具栏状态
    this.xdataControl.evt.on('onRefreshSuccess', async event => {
      if (event.data?.length > 0) {
        this.toolbar?.calcButtonState(
          event.data[0],
          this.xdataControl.model.appDataEntityId,
          event,
        );
        this.tabToolbar?.calcButtonState(
          event.data[0],
          this.xdataControl.model.appDataEntityId,
          event,
        );
      }
    });

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

    // 搜索表单搜索触发加载
    if (this.tabSearchForm) {
      this.tabSearchForm.evt.on('onSearch', () => {
        this.reLoad();
      });
    }

    // 搜索栏搜索触发加载
    if (this.tabSearchBar) {
      this.tabSearchBar.evt.on('onSearch', () => {
        this.reLoad();
      });
    }

    // 默认加载
    if (!this.view.state.noLoadDefault && model.loadDefault) {
      const searchbar = this.searchBar || this.tabSearchBar;
      if (
        searchbar &&
        searchbar.hasDefaultSelect &&
        (this.xdataControlName === 'grid' ||
          this.xdataControlName === 'treegrid')
      ) {
        // 搜索栏默认选中，由搜索栏自己触发表格的加载
        searchbar.setDefaultSelect();
      } else {
        this.load();
      }
    }
  }

  /**
   * 重新计算上下文，主要用于视图控制器再算上下文后，每个视图控制器可自身根据变动重新计算
   * @author zpc
   * @date 2024-03-12 13:52:06
   * @return {*}  {Promise<void>}
   */
  handleContextParams(): void {
    super.handleContextParams();
    // 若上下文未指定，多数据视图默认开启简单模式
    if (!this.view.context.srfsimple) {
      this.view.context.srfsimple = true;
    }
  }

  /**
   * 多数据部件激活事件处理
   * @author lxm
   * @date 2023-08-31 02:53:37
   * @protected
   * @param {EventBase} event
   * @return {*}  {Promise<void>}
   */
  protected async onXDataActive(event: EventBase): Promise<void> {
    const res = await this.openData(event);
    if (!res.cancel) {
      this.refresh();
    }
  }

  async call(
    key: keyof IApiMDViewCall,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    args: any,
  ): Promise<IData | null | undefined> {
    if (key === SysUIActionTag.EDIT || key === SysUIActionTag.VIEW) {
      return this.openData(args!);
    }
    if (key === SysUIActionTag.NEW) {
      return this.newData(args!);
    }
    if (key === SysUIActionTag.REMOVE) {
      await this.remove(args);
      return null;
    }
    if (key === SysUIActionTag.IMPORT) {
      await this.importData();
      return null;
    }
    if (key === SysUIActionTag.REFRESH) {
      await this.refresh();
      return null;
    }
    if (key === SysUIActionTag.EXPORT_EXCEL) {
      await this.exportData(args);
      return null;
    }
    if (key === SysUIActionTag.COPY) {
      this.copy(args);
      return null;
    }
    if (key === ViewCallTag.LOAD) {
      this.load(args);
      return null;
    }
    // 获取所有数据
    if (key === ViewCallTag.GET_ALL_DATA) {
      return this.xdataControl.state.items;
    }
    if (key === ViewCallTag.SET_SELECTED_DATA) {
      this.setSelectedData(args.data);
      return null;
    }
    return super.call(key, args);
  }

  protected getData(): IData[] {
    return this.xdataControl.getData();
  }

  /**
   * 打开编辑数据视图
   *
   * @author lxm
   * @date 2022-09-01 18:09:19
   * @param {IData} data
   * @param {MouseEvent} [event]
   * @returns {*}
   */
  protected async openData(args: {
    data: IData[];
    event?: MouseEvent;
    context?: IContext;
    params?: IParams;
  }): Promise<IUIActionResult> {
    const { data, event } = args;

    // 添加选中数据的主键
    const context = (args.context || this.view.context).clone();
    // 添加srfnavctrlid到上下文
    context.srfnavctrlid = this.xdataControl.ctrlId;

    const params = args.params || this.view.params;
    const deName =
      data[0].srfdecodename?.toLowerCase() ||
      calcDeCodeNameById(this.xdataControl.model.appDataEntityId!);
    context[deName!.toLowerCase()] = data[0].srfkey;

    const result = await this.view.scheduler?.triggerCustom('opendata', {
      context,
      params,
      data,
      event,
      view: this.view,
    });

    if (result === -1) {
      throw new RuntimeModelError(
        this.view.model,
        ibiz.i18n.t('runtime.engine.logicOpendata'),
      );
    } else {
      if (result && result.ok && result.data && result.data.length > 0) {
        this.view.evt.emit('onDataChange', {
          data: result.data,
          actionType: 'EDIT',
        });
      }
      return {
        cancel: result ? !result.ok : true,
      };
    }
  }

  /**
   * 打开新建数据视图
   *
   * @author lxm
   * @date 2022-09-01 18:09:19
   * @param {IData} data
   * @param {MouseEvent} [event]
   * @returns {*}
   */
  protected async newData(args: {
    data: IData[];
    event?: MouseEvent;
    copyMode?: boolean;
    params?: IParams;
  }): Promise<IUIActionResult> {
    const { data, event, copyMode } = args;
    const openAppViewLogic =
      this.view.model.viewLayoutPanel?.appViewLogics?.find(
        item => item.id === 'newdata',
      );
    if (!openAppViewLogic) {
      throw new RuntimeModelError(
        this.view.model,
        ibiz.i18n.t('runtime.engine.logicNewdata'),
      );
    }

    const params = clone(this.view.params);
    if (copyMode) {
      params.srfcopymode = copyMode;
    }
    if (args.params) {
      Object.assign(params, { ...args.params });
    }

    const result = await this.view.scheduler?.triggerCustom('newdata', {
      context: this.view.context,
      params,
      data,
      event,
      view: this.view,
    });

    if (result === -1) {
      throw new RuntimeModelError(
        this.view.model,
        ibiz.i18n.t('runtime.engine.logicNewdata'),
      );
    } else {
      if (result.ok && result.data && result.data.length > 0) {
        this.view.evt.emit('onDataChange', {
          data: result.data,
          actionType: 'NEW',
        });
      }
      return {
        cancel: result ? !result.ok : true,
      };
    }
  }

  /**
   * 视图删除
   *
   * @author lxm
   * @date 2022-08-30 19:08:59
   * @returns {*}  {Promise<void>}
   */
  protected async remove(args?: MDCtrlRemoveParams | undefined): Promise<void> {
    await this.xdataControl.remove(args);
  }

  /**
   * 视图加载
   * @author lxm
   * @date 2023-05-22 03:17:33
   * @return {*}  {Promise<void>}
   */
  protected async load(args: MDCtrlLoadParams = {}): Promise<void> {
    await this.xdataControl.load({ isInitialLoad: true, ...args });
  }

  /**
   * 视图刷新
   * @author lxm
   * @date 2023-05-22 03:17:33
   * @return {*}  {Promise<void>}
   */
  protected async refresh(): Promise<void> {
    await this.xdataControl.refresh();
  }

  /**
   * 视图重新加载
   * @author lxm
   * @date 2023-05-22 03:17:33
   * @return {*}  {Promise<void>}
   */
  protected async reLoad(): Promise<void> {
    await this.xdataControl.load({ isInitialLoad: true });
  }

  /**
   * @description 设置选中数据
   * @protected
   * @param {IData[]} items
   * @memberof MDViewEngine
   */
  protected setSelectedData(items: IData[]): void {
    this.xdataControl.setSelectedData(items);
  }

  /**
   * 获取搜索相关的查询参数
   * @author lxm
   * @date 2023-05-22 03:26:04
   * @return {*}  {IParams}
   */
  protected getSearchParams(): IParams {
    const params: IParams = {};
    // 有搜索栏的整合相关参数
    if (this.searchBar) {
      Object.assign(params, this.searchBar.getFilterParams());
    }
    // 有搜索表单的整合相关参数
    if (this.searchForm) {
      const resultParams = this.searchForm.getFilterParams();
      Object.assign(params, this.handleSearchParams(params, resultParams));
    }
    // 有搜索栏的整合相关参数
    if (this.tabSearchBar) {
      Object.assign(params, this.tabSearchBar.getFilterParams());
    }
    // 有搜索表单的整合相关参数
    if (this.tabSearchForm) {
      const resultParams = this.tabSearchForm.getFilterParams();
      Object.assign(params, this.handleSearchParams(params, resultParams));
    }
    return params;
  }

  /**
   * @description 处理搜索参数
   * @protected
   * @param {IParams} params
   * @param {IParams} newParams
   * @returns {*}  {IParams}
   * @memberof MDViewEngine
   */
  protected handleSearchParams(params: IParams, newParams: IParams): IParams {
    const _params = { ...newParams };
    if (params.searchconds && newParams.searchconds) {
      Object.assign(_params, {
        searchconds: [
          {
            condop: 'AND',
            condtype: 'GROUP',
            searchconds: [...params.searchconds, ...newParams.searchconds],
          },
        ],
      });
    }
    return _params;
  }

  /**
   * 导入数据
   * @author lxm
   * @date 2023-05-22 03:28:26
   * @return {*}  {Promise<void>}
   */
  protected async importData(): Promise<void> {
    await this.xdataControl.importData();
  }

  /**
   * 导出数据
   * @author lxm
   * @date 2023-05-22 03:29:06
   * @param {{ event: MouseEvent }} args
   * @return {*}  {Promise<void>}
   */
  protected async exportData(args: { event: MouseEvent }): Promise<void> {
    await this.xdataControl.exportData(args);
  }

  /**
   * 复制数据
   *
   * @author zk
   * @date 2023-06-01 12:06:58
   * @memberof MDViewEngine
   */
  async copy(args: { data: IData[]; event?: MouseEvent }): Promise<void> {
    this.newData(Object.assign(args, { copyMode: true }));
  }

  /**
   * 计算头部显示
   *
   * @author zk
   * @date 2024-01-29 05:01:30
   * @protected
   * @return {*}  {boolean}
   * @memberof MDViewEngine
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
    if (!has) return has;
    const searchBar: ISearchBar = getControl(model, 'searchbar')!;
    const visible = !!(
      searchBar.enableQuickSearch ||
      searchBar.enableGroup ||
      searchBar.enableFilter === true
    );
    // 卡片视图
    const dataview: IDEDataView = getControl(this.view.model, 'dataview')!;
    const cardstyle = dataview?.controlParam?.ctrlParams?.CARDSTYLE;
    return cardstyle === 'userstyle' ? false : visible;
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
    const { model } = this.view;
    const names = super.calcRemoveLayoutModel();
    if (!getControl(model, 'searchform')) {
      names.push('searchform');
    }
    if (!this.calcViewSearchBarVisible()) {
      names.push('view_searchbar');
    }
    return names;
  }
}
