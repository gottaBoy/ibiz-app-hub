/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  RuntimeError,
  isElementSame,
  IPortalMessage,
  RuntimeModelError,
} from '@ibiz-template/core';
import {
  IDER1N,
  IMDControl,
  INavigatable,
  IAppDataEntity,
  IControlNavigatable,
} from '@ibiz/model-core';
import { isNil } from 'ramda';
import { isArray } from 'lodash-es';
import {
  EventBase,
  IMDControlEvent,
  IMDControlState,
  MDCtrlLoadParams,
  IApiMDGroupParams,
  MDCtrlRemoveParams,
  IToolbarController,
  IMDControlController,
} from '../../../interface';
import { calcDeCodeNameById } from '../../../model';
import { MDControlService, Srfuf } from '../../../service';
import { calcNavParams, handleAllSettled } from '../../../utils';
import { ControllerEvent, openDataImport } from '../../utils';
import { ControlController } from './control.controller';

/**
 * 多数据部件控制器
 *
 * @author chitanda
 * @date 2022-08-01 18:08:13
 * @export
 * @class MDControlController
 * @extends {ControlController<T>}
 * @template T
 */
export class MDControlController<
    T extends IMDControl = IMDControl,
    S extends IMDControlState = IMDControlState,
    E extends IMDControlEvent = IMDControlEvent,
  >
  extends ControlController<T, S, E>
  implements IMDControlController<T, S, E>
{
  /**
   * 多数据部件服务
   *
   * @author lxm
   * @date 2022-08-19 13:08:51
   * @type {EntityService}
   */
  service!: MDControlService;

  /**
   * 是否设置过排序条件，比如searchBars默认点击分组时设置了
   * @return {*}
   * @author: zhujiamin
   * @Date: 2024-02-22 16:10:23
   */
  public isSetSort = false;

  /**
   * 是否允许加载数据
   *
   * @author ljx
   * @date 2024-11-15 15:08:51
   * @type {boolean}
   */
  public enableLoad: boolean = true;

  /**
   * @description 分组日期格式化
   * @protected
   * @type {(('year' | 'quarter' | 'month' | 'week' | 'day')[])}
   * @memberof MDControlController
   */
  protected groupDateFormat: ('year' | 'quarter' | 'month' | 'week' | 'day')[] =
    [];

  /**
   * 刷新模式
   *
   * @readonly
   * @type {('nocache' | 'cache')}
   * @memberof MDControlController
   */
  get refreshMode(): 'nocache' | 'cache' {
    if (this.controlParams.mdctrlrefreshmode) {
      return this.controlParams.mdctrlrefreshmode;
    }
    return ibiz.config.mdctrlrefreshmode;
  }

  /**
   * 批操作工具栏显示模式
   *
   * @readonly
   * @type {('default' | 'multiple')}
   * @memberof MDControlController
   */
  get batchToolbarMode(): 'default' | 'multiple' {
    if (this.controlParams.batchtoolbarmode) {
      return this.controlParams.batchtoolbarmode;
    }
    return ibiz.config.common.batchToolbarMode;
  }

  /**
   * @description 是否显示批操作工具栏
   * @readonly
   * @type {boolean}
   * @memberof MDControlController
   */
  get showBatchToolbar(): boolean {
    switch (this.batchToolbarMode) {
      case 'multiple':
        return this.state.selectedData.length >= 2;
      case 'default':
      default:
        return this.state.selectedData.length > 0;
    }
  }

  /**
   * @description 分页显示模式，default：显示完整分页栏，simple：只显示总条数，上一页，页码栏，下一页
   * @readonly
   * @type {('default' | 'simple')}
   * @memberof MDControlController
   */
  get paginationMode(): 'default' | 'simple' {
    if (this.controlParams.paginationmode) {
      return this.controlParams.paginationmode;
    }
    return 'default';
  }

  protected get _evt(): ControllerEvent<IMDControlEvent> {
    return this.evt;
  }

  /**
   * 获取部件通用的事件参数
   *
   * @return {*}  {Omit<EventBase, 'eventName'>}
   * @memberof MDControlController
   */
  getEventArgs(): Omit<EventBase, 'eventName'> {
    const result = super.getEventArgs();
    return {
      ...result,
      dataArg: {
        total: this.state.total,
        totalx: this.state.totalx,
      },
    };
  }

  protected initState(): void {
    super.initState();
    const { navViewPos, navViewShowMode } = this.model as IControlNavigatable;
    this.state.enableNavView = ![undefined, 'NONE', 'ROWDETAIL'].includes(
      navViewPos,
    );
    this.state.showNavView = navViewShowMode !== 1 && navViewShowMode !== 3;
    this.state.showNavIcon = navViewShowMode !== 2 && navViewShowMode !== 3;
    this.state.showRowDetail = navViewPos === 'ROWDETAIL';
    this.state.items = [];
    this.state.selectedData = [];
    this.state.selectedKeys = [];
    this.state.searchParams = {};
    this.state.noSort = false;
    this.state.sortQuery = '';
    this.state.curPage = 1;
    this.state.size = 20;
    this.state.total = 0;
    this.state.totalx = undefined;
    this.state.isLoaded = false;
    this.state.singleSelect = true;
    this.state.mdctrlActiveMode = 0;
    this.state.groups = [];
    this.state.hideNoDataImage = false;
    this.state.enableGroup = !!(this.model as IData).enableGroup;
  }

  /**
   * 实体属性映射，key是id，value是name
   * @author lxm
   * @date 2023-09-07 03:16:56
   * @protected
   */
  protected fieldIdNameMap = new Map<string, string>();

  /**
   * 当前多数据部件对应的应用实体对象
   *
   * @author chitanda
   * @date 2023-09-13 17:09:32
   * @protected
   * @type {IAppDataEntity}
   */
  protected dataEntity!: IAppDataEntity;

  /**
   * 批操作工具栏
   *
   * @author zk
   * @date 2023-08-02 06:08:34
   * @readonly
   * @type {(IToolbarController | undefined)}
   * @memberof ListController
   */
  protected get batchToolbarController(): IToolbarController | undefined {
    const controller = this.view.getController(
      `${this.model.name!}_batchtoolbar`,
    );
    return controller as IToolbarController;
  }

  /**
   * 快速工具栏
   *
   * @author zk
   * @date 2023-08-02 06:08:34
   * @readonly
   * @type {(IToolbarController | undefined)}
   * @memberof ListController
   */
  protected get quickToolbarController(): IToolbarController | undefined {
    const controller = this.view.getController(
      `${this.model.name!}_quicktoolbar`,
    );
    return controller as IToolbarController;
  }

  protected async onCreated(): Promise<void> {
    await super.onCreated();
    await this.initUIActions();

    if (this.model.appDataEntityId) {
      // 初始化实体属性id和name的映射
      this.dataEntity = await ibiz.hub.getAppDataEntity(
        this.model.appDataEntityId!,
        this.model.appId,
      );
      this.dataEntity.appDEFields?.forEach(field => {
        this.fieldIdNameMap.set(field.id!, field.name!);
      });
    }

    // 设置默认排序，只有在没设置过排序才走
    if (!this.isSetSort) {
      this.setSort();
    }
  }

  protected async onMounted(): Promise<void> {
    await super.onMounted();

    // 如果外面没有配置默认不加载的话，默认部件自己加载
    if (this.state.loadDefault) {
      this.load({ isInitialLoad: true });
    }
  }

  /**
   * @description 初始化界面行为组
   * @protected
   * @memberof MDControlController
   */
  protected async initUIActions(): Promise<void> {}

  /**
   * @description 执行多数据分组
   * - 子类实现
   * @param {IApiMDGroupParams[]} [_arg] 分组参数集合（多层分组暂未支持）
   * @param {IParams} [_params] 额外参数
   * @returns {*}  {Promise<void>}
   * @memberof MDControlController
   */
  async execGroup(
    _arg: IApiMDGroupParams[],
    _params?: IParams,
  ): Promise<void> {}

  /**
   * 获取部件默认排序模型
   * @return {*}
   * @author: zhujiamin
   * @Date: 2023-12-28 18:43:27
   */
  getSortModel(): {
    minorSortAppDEFieldId: string | undefined;
    minorSortDir: string | undefined;
  } {
    return {
      minorSortAppDEFieldId: undefined,
      minorSortDir: undefined,
    };
  }

  /**
   * 显示内置导航视图变化
   *
   * @memberof MDControlController
   */
  onShowNavViewChange(): void {
    this.state.showNavView = !this.state.showNavView;
  }

  /**
   * 打开内置导航视图
   * - 默认为当前激活数据
   * @param {IData} [data]
   * @memberof MDControlController
   */
  openNavView(data?: IData): void {
    const selected = data || this.state.selectedData[0];
    if (selected) {
      // 判断点击项是否已选中
      const findIndex = this.state.selectedData.findIndex(item => {
        return selected.srfkey === item.srfkey;
      });
      if (findIndex !== -1) {
        // 点击项已选中时，显示内置导航置反
        this.state.showNavView = !this.state.showNavView;
      } else {
        // 点击项未选中时，先设置选中，再设置显示内置导航
        this.onRowClick(selected);
        this.state.showNavView = true;
      }
    }
  }

  /**
   * 设置排序
   * 无参数时设置的是默认排序。
   *
   * @author lxm
   * @date 2022-09-28 13:09:44
   * @param {string} key 排序字段
   * @param {string} order 排序顺序
   */
  setSort(key?: string, order?: 'asc' | 'desc'): void {
    if (key && order) {
      this.state.sortQuery = `${key},${order}`;
    } else if (!key && !order) {
      // 设置默认排序(localStorage的优先级高于配置)
      const { minorSortAppDEFieldId, minorSortDir } = this.getSortModel();
      if (
        this.view &&
        localStorage.getItem(`${this.view.model.id}.${this.model.name}.sort`)
      ) {
        this.state.sortQuery = localStorage.getItem(
          `${this.view.model.id}.${this.model.name}.sort`,
        )!;
      } else if (minorSortAppDEFieldId && minorSortDir) {
        const fieldName = this.fieldIdNameMap.get(minorSortAppDEFieldId)!;
        this.state.sortQuery = `${fieldName.toLowerCase()},${minorSortDir.toLowerCase()}`;
      } else if (ibiz.config.mdctrldefaultsort) {
        this.state.sortQuery = ibiz.config.mdctrldefaultsort;
      }
    } else {
      // 排序字段和顺序只要有一个没有就置空
      this.state.sortQuery = '';
    }
    // 设置后更新localStorage里的
    if (this.view) {
      if (this.state.sortQuery) {
        localStorage.setItem(
          `${this.view.model.id}.${this.model.name}.sort`,
          this.state.sortQuery,
        );
      } else {
        localStorage.removeItem(
          `${this.view.model.id}.${this.model.name}.sort`,
        );
      }
    }
  }

  /**
   * 获取请求过滤参数（整合了视图参数，各种过滤条件，排序，分页）
   * @author lxm
   * @date 2023-05-23 03:20:40
   * @param {IParams} [extraParams] 额外视图参数，附加在最后
   * @return {*}  {Promise<IParams>}
   */
  async getFetchParams(extraParams?: IParams): Promise<IParams> {
    const { curPage, size, sortQuery, noSort } = this.state;
    const resultParams: IParams = {
      ...this.params,
    };
    // 有size才给page和size。size默认值给0就不传分页和大小
    if (size) {
      resultParams.page = curPage - 1;
      resultParams.size = size;
    }

    // 排序条件
    if (!noSort && sortQuery) {
      resultParams.sort = sortQuery;
    }
    // *请求参数处理
    await this._evt.emit('onBeforeLoad', { params: resultParams });
    // 合并搜索条件参数，这些参数在onBeforeLoad监听里由外部填入
    Object.assign(resultParams, {
      ...this.state.searchParams,
    });

    // 额外附加参数
    if (extraParams) {
      Object.assign(resultParams, extraParams);
    }
    // 门户过滤参数统一处理,部件引擎中搜索栏参数也在此处理
    if (resultParams.srfsearchconds) {
      const srfsearchconds = isArray(resultParams.srfsearchconds)
        ? resultParams.srfsearchconds
        : [resultParams.srfsearchconds];
      if (resultParams.searchconds && resultParams.searchconds.length > 0) {
        resultParams.searchconds = [
          {
            condop: 'AND',
            condtype: 'GROUP',
            searchconds: [...srfsearchconds, ...resultParams.searchconds],
          },
        ];
      } else {
        resultParams.searchconds = [...srfsearchconds];
      }
      delete resultParams.srfsearchconds;
    }
    return resultParams;
  }

  /**
   * 加载更多
   *
   * @author zhanghengfeng
   * @date 2024-06-11 19:06:15
   * @return {*}  {Promise<void>}
   */
  async loadMore(): Promise<void> {
    if (this.state.total > this.state.items.length) {
      await this.load({ isLoadMore: true });
    }
  }

  /**
   * 部件加载数据行为
   *
   * @author lxm
   * @date 2022-08-19 14:08:50
   */
  async load(args: MDCtrlLoadParams = {}): Promise<IData[]> {
    if (this.state.isSimple) {
      this.state.isLoaded = true;
      return [];
    }
    const silent = this.getSilent(args) === true;
    if (!silent) {
      await this.startLoading();
    }
    try {
      // *初始加载需要重置分页
      const isInitialLoad = args.isInitialLoad === true;
      const isLoadMore = args.isLoadMore === true;
      if (isInitialLoad) {
        this.state.curPage = 1;
      } else if (isLoadMore) {
        this.state.curPage += 1;
      }

      // *查询参数处理
      const { context } = this.handlerAbilityParams(args);
      const params = await this.getFetchParams(args?.viewParam);

      // 加载前判断是否允许加载数据
      if (!this.enableLoad) {
        return [];
      }
      const res = await this.service.fetch(context, params);
      // 更新分页数据总条数
      if (typeof res.total === 'number') {
        this.state.total = res.total;
      }
      if (typeof res.totalx === 'number') {
        this.state.totalx = res.totalx;
      }
      if (typeof res.totalPages === 'number') {
        this.state.totalPages = res.totalPages;
      }

      if (isLoadMore) {
        this.state.items.push(...res.data);
      } else {
        this.state.items = res.data;
      }

      await this.afterLoad(args, res.data);

      await this._evt.emit('onLoadSuccess', {
        isInitialLoad,
      });
      if (args.triggerSource && args.triggerSource === 'REFRESH') {
        await this._evt.emit('onRefreshSuccess', {
          data: this.state.selectedData,
        });
      }
    } catch (error) {
      await this._evt.emit('onLoadError', undefined);
      this.actionNotification('FETCHERROR', {
        error: error as Error,
      });
      throw error;
    } finally {
      this.state.isLoaded = true;
      if (!silent) {
        await this.endLoading();
      }
    }

    this.state.items.forEach((item, index) => {
      item.srfserialnum = index + 1;
    });

    this.actionNotification('FETCHSUCCESS');
    return this.state.items;
  }

  /**
   * @description 根据选中标识计算选中数据
   * @protected
   * @memberof MDControlController
   */
  protected calcSelectDataBySelectKey(): void {
    if (!this.state.selectedKeys.length) return;
    const selectedData = this.state.items.filter(
      item =>
        this.state.selectedKeys.includes(item.srfkey) &&
        !this.state.selectedData.some(
          selected => selected.srfkey === item.srfkey,
        ),
    );
    this.state.selectedData.push(...selectedData);
  }

  /**
   * @description 处理刷新模式
   * @protected
   * @param {MDCtrlLoadParams} args
   * @memberof MDControlController
   */
  protected handleRefreshMode(args: MDCtrlLoadParams): void {
    // 初始化加载时需重置选中数据
    if (args.isInitialLoad || this.refreshMode === 'nocache') {
      this.state.selectedData = [];
    } else if (this.refreshMode === 'cache') {
      // 重新计算选中数据
      this.state.selectedData = this.state.items.filter(item =>
        this.state.selectedData.find(select => select.srfkey === item.srfkey),
      );
    }
  }

  /**
   * 部件加载后处理
   *
   * @author chitanda
   * @date 2023-06-21 15:06:44
   * @param {MDCtrlLoadParams} args 本次请求参数
   * @param {IData[]} items 上游处理的数据（默认是后台数据）
   * @return {*}  {Promise<IData[]>} 返回给后续处理的数据
   */
  async afterLoad(args: MDCtrlLoadParams, items: IData[]): Promise<IData[]> {
    this.handleRefreshMode(args);
    this.calcSelectDataBySelectKey();
    return items;
  }

  /**
   * 部件刷新，走初始加载(规避预置后续刷新和通知刷新同时进行)
   *
   * @author tony001
   * @date 2024-03-28 18:03:00
   * @return {*}  {Promise<void>}
   */
  async refresh(): Promise<void> {
    const { pagingMode } = this.model as IModel;
    this.doNextActive(
      () =>
        !this.ctx.isDestroyed &&
        this.load({
          isInitialLoad:
            !!ibiz.env.isMob || pagingMode === 2 || pagingMode === 3,
          triggerSource: 'REFRESH',
        }),
      {
        key: 'refresh',
      },
    );
  }

  /**
   * 删除选中的数据
   *
   * @author lxm
   * @date 2022-09-06 19:09:48
   * @returns {*}  {Promise<void>}
   */
  async remove(args?: MDCtrlRemoveParams): Promise<void> {
    const { context, params, data } = this.handlerAbilityParams(args);
    if (!data?.length) {
      throw new RuntimeError(
        ibiz.i18n.t('runtime.controller.common.control.uncheckedData'),
      );
    }

    // 删除确认提示
    if (args?.silent !== true) {
      let del: boolean = false;
      const hiddenSsgItem = this.findCtrlMsgByTag('BEFOREREMOVE_HIDDEN');
      if (hiddenSsgItem) {
        del = true;
      } else {
        del = await ibiz.confirm.error({
          title: ibiz.i18n.t('runtime.controller.common.control.dataDeletion'),
          desc: ibiz.i18n.t(
            'runtime.controller.common.control.confirmDataDeletion',
          ),
        });
      }
      if (!del) {
        return;
      }
    }

    await this._evt.emit('onBeforeRemove', undefined);
    await this.startLoading();
    let needRefresh = false;
    try {
      await handleAllSettled(
        data.map(async item => {
          // 新建未保存的数据直接走后续删除处理逻辑
          needRefresh = await this.handleItemRemove(item, context, params);
          this.afterRemove(item);
        }),
      );

      if (args?.silent !== true) {
        this.actionNotification('REMOVESUCCESS', {
          data,
          default: ibiz.i18n.t('runtime.controller.common.md.dataDeleted', {
            str: data.map(item => item.srfmajortext).join('、'),
          }),
        });
      }

      // 刷新数据，补全这一页缺少的数据
      if (needRefresh && !args?.notRefresh) {
        await this.refresh();
      }
    } catch (error) {
      await this._evt.emit('onRemoveError', undefined);
      if (args?.silent !== true) {
        this.actionNotification('REMOVEERROR', {
          error: error as Error,
          data,
        });
      }
      throw error;
    } finally {
      await this.endLoading();
    }
    this.state.selectedData = [];

    await this._evt.emit('onRemoveSuccess', undefined);

    // 发送对象删除事件
    data.forEach(item => {
      this.emitDEDataChange('remove', item);
    });
  }

  /**
   * @description 处理项删除
   * @param {IData} item
   * @param {IContext} context
   * @param {IParams} params
   * @returns {*}  {Promise<boolean>}
   * @memberof MDControlController
   */
  async handleItemRemove(
    item: IData,
    context: IContext,
    params: IParams,
  ): Promise<boolean> {
    let needRefresh = false;
    const deName = calcDeCodeNameById(this.model.appDataEntityId!);
    if (item.srfuf !== Srfuf.CREATE) {
      const tempContext = context.clone();
      tempContext[deName] = item.srfkey;
      // 删除后台的数据
      await this.service.remove(tempContext, params);
      needRefresh = true;
    }
    return needRefresh;
  }

  /**
   * 后台删除结束后界面删除逻辑
   *
   * @author lxm
   * @date 2022-09-06 19:09:10
   * @param {IData} data
   */
  afterRemove(data: IData): void {
    // 删除this.items里的数据
    const index = this.state.items.findIndex(
      item => item.srfkey === data.srfkey,
    );
    if (index !== -1) {
      this.state.items.splice(index, 1);
    }
  }

  /**
   * 获取多数据部件的选中数据集合
   *
   * @author lxm
   * @date 2022-08-30 18:08:00
   * @returns {*}  {IData[]}
   */
  getData(): IData[] {
    return this.state.selectedData || [];
  }

  /**
   * @description 设置选中数据
   * @param {IData[]} items
   * @memberof MDControlController
   */
  setSelectedData(items: IData[]): void {
    this.state.selectedKeys = items
      .filter(item => item.srfkey)
      .map(item => item.srfkey);
    this.state.selectedData = this.state.items.filter(item =>
      this.state.selectedKeys.includes(item.srfkey),
    );
  }

  /**
   * 设置导航数据
   *
   * @param {IData} item
   * @memberof MDControlController
   */
  setNavData(item: IData): void {
    this._evt.emit('onNavDataChange', {
      navData: item,
    });
  }

  setActive(item: IData, event?: MouseEvent): Promise<void> {
    return this._evt.emit('onActive', {
      data: [item],
      event,
    });
  }

  setSelection(selection: IData[], isEmit: boolean = true): void {
    const { selectedData } = this.state;
    // 检查新的选中数据和旧的是否一致，不一致才变更。
    if (!isElementSame(selectedData, selection)) {
      this.state.selectedData = selection;
      if (isEmit) {
        this._evt.emit('onSelectionChange', {
          data: selection,
        });
      }
    }
    // 根据数据计算工具栏权限和状态
    const data = selection?.[0];
    this.batchToolbarController?.calcButtonState(
      data,
      this.model.appDataEntityId,
      { view: this.view, ctrl: this },
    );
    this.quickToolbarController?.calcButtonState(
      data,
      this.model.appDataEntityId,
      { view: this.view, ctrl: this },
    );
  }

  /**
   * 行单击事件
   *
   * @author lxm
   * @date 2022-08-18 22:08:16
   * @param {IData} data 选中的单条数据
   * @param {MouseEvent} event
   */
  async onRowClick(_data: IData, event?: MouseEvent): Promise<void> {
    const data = this.state.items.find(item => item.srfkey === _data.srfkey);
    if (!data) {
      return;
    }
    // 选中相关处理
    const { selectedData } = this.state;
    // 选中里没有则添加，有则删除
    const filterArr = selectedData.filter(item => item.srfkey !== data.srfkey);
    if (filterArr.length === selectedData.length) {
      this.setSelection(
        this.state.singleSelect ? [data] : selectedData.concat([data]),
      );
    } else {
      this.setSelection(filterArr);
    }
    // 设置导航数据
    this.setNavData(data);
    // 激活事件
    if (this.state.mdctrlActiveMode === 1) {
      await this.setActive(data, event);
    }
  }

  /**
   * 行双击事件
   *
   * @author lxm
   * @date 2022-08-18 22:08:16
   * @param {IData} data 选中的单条数据
   */
  async onDbRowClick(_data: IData): Promise<void> {
    const data = this.state.items.find(item => item.srfkey === _data.srfkey);
    if (this.state.mdctrlActiveMode === 2 && data) {
      await this.setActive(data);
    }
  }

  /**
   * 数据导入
   *
   * @author lxm
   * @date 2022-11-08 15:11:54
   * @returns {*}  {Promise<void>}
   */
  async importData(): Promise<void> {
    const { appDataEntityId, dedataImportId } = this.model;
    if (!appDataEntityId || !dedataImportId) {
      throw new RuntimeModelError(
        this.model,
        ibiz.i18n.t('runtime.controller.common.control.noImportModel'),
      );
    }
    await openDataImport({
      appDataEntityId,
      deDataImportId: dedataImportId,
      context: this.context,
      params: this.params,
    });
  }

  /**
   * 数据导出
   *
   * @param {MouseEvent} event 原生js点击事件
   * @returns {*}  {Promise<void>}
   * @memberof MDControlController
   */
  async exportData(_args: { event: MouseEvent }): Promise<void> {
    // const { dataExport, appEntity } = this.model;
    // if (!dataExport) {
    //   throw new DefectModelError(this.model.source, '没有配置实体导出模型！');
    // }
    // if (!dataExport.enableBackend) {
    //   throw new UnsupportedModelError(dataExport, '前台导出暂未支持！');
    // }
    // // 创建气泡框，操作后获得相关参数。
    // const popover = ibiz.overlay.createPopover(
    //   'DataExport',
    //   {
    //     dismiss: (result: unknown) => popover.dismiss(result),
    //     maxRowCount: dataExport.maxRowCount || 1000,
    //     pageSize: this.state.size,
    //   },
    //   { autoClose: true, placement: 'bottom-end' },
    // );
    // popover.present(event.target as HTMLElement);
    // const exportParams = await popover.onWillDismiss();
    // // 没有返回值，则是取消导出操作
    // if (!exportParams) {
    //   return;
    // }
    // // *请求参数处理，合并选择的导出参数
    // const params = await this.getFetchParams(exportParams);
    // const { data: file } = await this.service.exportData(
    //   dataExport,
    //   this.context,
    //   params,
    // );
    // const fileName = `${appEntity.source.logicName}表.xlsx`;
    // downloadFileFromBlob(file, fileName);
  }

  /**
   * 检测实体数据变更
   *
   * @author tony001
   * @date 2024-03-28 18:03:30
   * @protected
   * @param {IPortalMessage} msg
   * @return {*}  {void}
   */
  protected onDEDataChange(msg: IPortalMessage): void {
    // msg.triggerKey 不为空，且与当前控制器的triggerKey一致时，则不处理
    if (!isNil(msg.triggerKey) && msg.triggerKey === this.triggerKey) {
      return;
    }
    // 非这个实体的数据变更，则不处理
    let data: IData | undefined;
    try {
      data = msg.data || (msg.content ? JSON.parse(msg.content) : undefined);
    } catch (error) {
      ibiz.log.error(error);
    }
    if (
      !data ||
      (!data.srfdecodename && !data.srfdename) ||
      (data.srfdecodename &&
        data.srfdecodename !== this.dataEntity?.codeName) ||
      (data.srfdename && data.srfdename !== this.dataEntity?.name)
    ) {
      return;
    }

    let isRefresh = false;
    const { srfkey } = data as IData;

    // 新增一定刷新，修改和删除只有当前多数据部件存在的数据命中后才刷新
    switch (msg.subtype) {
      case 'OBJECTCREATED':
        isRefresh = true;
        break;
      case 'OBJECTUPDATED':
        if (this.state.items.findIndex(item => item.srfkey === srfkey) !== -1) {
          isRefresh = true;
        }
        break;
      case 'OBJECTREMOVED':
        if (this.state.items.findIndex(item => item.srfkey === srfkey) !== -1) {
          isRefresh = true;
        }
        break;
      default:
        break;
    }

    if (isRefresh) {
      this.refresh();
    }
  }

  /**
   * 跳转第一页
   *
   * @author tony001
   * @date 2024-07-15 14:07:03
   * @return {*}  {Promise<IData[]>}
   */
  async goToFirstPage(): Promise<IData[]> {
    const { curPage, items } = this.state;
    const { pagingMode } = this.model as IModel;
    let result: IData[] = items;
    // 分页模式为分页栏且当前页面不是第一个页面才查询
    if (curPage !== 1 && pagingMode === 1) {
      this.state.curPage = 1;
      result = await this.load();
    }
    return result;
  }

  /**
   * 跳转上一页
   *
   * @author tony001
   * @date 2024-07-15 14:07:28
   * @return {*}  {Promise<IData[]>}
   */
  async goToPreviousPage(): Promise<IData[]> {
    const { curPage } = this.state;
    const { pagingMode } = this.model as IModel;
    let result: IData[] = [];
    // 分页模式为分页栏且当前页面大于1才查询
    if (pagingMode === 1 && curPage > 1) {
      this.state.curPage -= 1;
      result = await this.load();
    }
    return result;
  }

  /**
   * 跳转下一页
   *
   * @author tony001
   * @date 2024-07-15 14:07:34
   * @return {*}  {Promise<IData[]>}
   */
  async goToNextPage(): Promise<IData[]> {
    const { curPage, totalPages } = this.state;
    const { pagingMode } = this.model as IModel;
    let result: IData[] = [];
    // 分页模式存在且前页小于总页数才加载下一页
    if (pagingMode && curPage < totalPages) {
      // 分页栏模式
      if (pagingMode === 1) {
        this.state.curPage += 1;
        result = await this.load();
      } else {
        result = await this.load({ isLoadMore: true });
      }
    }
    return result;
  }

  /**
   * 跳转最后一页
   *
   * @author tony001
   * @date 2024-07-15 14:07:44
   * @return {*}  {Promise<IData[]>}
   */
  async goToLastPage(): Promise<IData[]> {
    const { curPage, items, totalPages, total } = this.state;
    const { pagingMode } = this.model as IModel;
    let result: IData[] = items;
    // 当前页小于最大页时才加载数据
    if (pagingMode && curPage < totalPages) {
      // 分页栏模式
      if (pagingMode === 1) {
        this.state.curPage = totalPages;
        result = await this.load();
      } else {
        this.state.size = total;
        result = await this.load({ isInitialLoad: true });
      }
    }
    return result;
  }

  /**
   * @description 选中全部数据
   * @param {boolean} [state]
   * @returns {*}  {void}
   * @memberof MDControlController
   */
  selectAll(state?: boolean): void {
    if (this.state.singleSelect) return;
    let isSelectAll: boolean = state !== false;
    if (state === undefined) {
      isSelectAll = !!this.state.items.find(
        item =>
          !this.state.selectedData.find(
            select => select.srfkey === item.srfkey,
          ),
      );
    }
    this.setSelection(isSelectAll ? [...this.state.items] : []);
  }

  /**
   * @description 计算导航参数
   * @param {IData} data
   * @returns {*}  {{ context: IContext; params: IParams }}
   * @memberof MDControlController
   */
  calcNavParams(data: IData): { context: IContext; params: IParams } {
    const {
      navDER,
      navFilter,
      navigateParams,
      appDataEntityId,
      navigateContexts,
    } = this.model as INavigatable & { appDataEntityId?: string };
    const model = {
      deName: appDataEntityId ? calcDeCodeNameById(appDataEntityId) : undefined,
      navFilter,
      pickupDEFName: (navDER as IDER1N)?.pickupDEFName,
      navContexts: navigateContexts,
      navParams: navigateParams,
    };
    const originParams = {
      context: this.context,
      params: this.params,
      data,
    };
    const { resultContext, resultParams } = calcNavParams(model, originParams);
    const tempContext = Object.assign(this.context.clone(), resultContext);
    const tempParams = { ...resultParams };
    return { context: tempContext, params: tempParams };
  }

  /**
   * @description 新建行
   * - 子类实现
   * @param {MDCtrlLoadParams} [args={}]
   * @returns {*}  {Promise<void>}
   * @memberof MDControlController
   */
  async newRow(args: MDCtrlLoadParams = {}): Promise<void> {
    throw new RuntimeError(ibiz.i18n.t('runtime.common.unrealized'));
  }
}
