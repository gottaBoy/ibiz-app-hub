/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { RuntimeModelError } from '@ibiz-template/core';
import {
  IViewEvent,
  ViewEngineBase,
  SysUIActionTag,
  getControlsByView,
  IToolbarController,
  IMDControlController,
  IUIActionResult,
  ViewController,
  IControlController,
  calcDeCodeNameById,
  IApiMDCustomViewCall,
  IMDCustomViewState,
  ISearchBarController,
} from '@ibiz-template/runtime';
import {
  IControl,
  IDEToolbar,
  IMDControl,
  IAppDECustomView,
} from '@ibiz/model-core';
import { clone } from 'lodash-es';

export class MDCustomViewEngine extends ViewEngineBase {
  declare protected view: ViewController<
    IAppDECustomView,
    IMDCustomViewState,
    IViewEvent
  >;

  /**
   * 部件集合
   *
   * @type {IControl[]}
   * @memberof MDCustomViewEngine
   */
  controls: IControl[] = [];

  /**
   * @description 获取分页搜索视图上移的搜索栏控制器
   * @readonly
   * @protected
   * @type {ISearchBarController}
   * @memberof MDCustomViewEngine
   */
  protected get tabSearchBar(): ISearchBarController {
    return this.view.getController('tabsearchbar') as ISearchBarController;
  }

  /**
   * 视图created生命周期执行逻辑
   *
   * @return {*}  {Promise<void>}
   * @memberof MDCustomViewEngine
   */
  async onCreated(): Promise<void> {
    await super.onCreated();
    this.controls = getControlsByView(this.view.model);
    this.initMDCtrlActiveMode();
  }

  /**
   * 视图mounted生命周期执行逻辑
   *
   * @return {*}  {Promise<void>}
   * @memberof MDCustomViewEngine
   */
  async onMounted(): Promise<void> {
    await super.onMounted();
    this.calcToolbarState = this.calcToolbarState.bind(this);

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

    this.controls.forEach(ctrl => {
      const control = this.view.getController(
        ctrl.name!,
      ) as IMDControlController;
      control?.evt.on('onLoadSuccess', evt =>
        this.calcToolbarButtonState(ctrl, undefined, evt),
      );
      control?.evt.on('onSelectionChange', evt =>
        this.calcToolbarButtonState(ctrl, evt.data[0], evt),
      );
      control?.evt.on('onRefreshSuccess', evt =>
        this.calcToolbarButtonState(ctrl, evt.data[0], evt),
      );
      control?.evt.on('onBeforeLoad', () => {
        control.state.searchParams = this.getSearchParams();
      });
    });
  }

  /**
   * @description 获取搜索相关的查询参数
   * @protected
   * @returns {*}  {IParams}
   * @memberof MDCustomViewEngine
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
    // 有搜索表单的整合相关参数
    if (this.tabSearchForm) {
      Object.assign(params, this.tabSearchForm.getFilterParams());
    }
    // 有搜索栏的整合相关参数
    if (this.tabSearchBar) {
      Object.assign(params, this.tabSearchBar.getFilterParams());
    }
    return params;
  }

  /**
   * @description 初始化部件激活模式
   * @memberof MDCustomViewEngine
   */
  initMDCtrlActiveMode() {
    const { model } = this.view;
    this.controls.forEach(ctrl => {
      const name = ctrl.name! || ctrl.id!;
      if (!this.view.slotProps[name]) {
        this.view.slotProps[name] = {};
      }
      this.view.slotProps[name].mdctrlActiveMode = (
        model as IData
      ).mdctrlActiveMode!;
    });
  }

  /**
   * 计算工具栏按钮状态
   *
   * @param {IMDControl} control 数据部件模型
   * @param {(IData | undefined)} data 数据
   * @memberof MDCustomViewEngine
   */
  calcToolbarButtonState(
    control: IMDControl,
    data: IData | undefined,
    _params?: IParams,
  ): void {
    const model = this.controls.find(
      ctrl =>
        ctrl.controlType === 'TOOLBAR' &&
        (ctrl as IDEToolbar).xdataControlName?.toLowerCase() === control.name,
    );
    if (model) {
      const toolbar = this.view.getController(
        model.name!,
      ) as IToolbarController;
      toolbar?.calcButtonState(data, control.appDataEntityId, _params);
    }
  }

  async call(
    key: keyof IApiMDCustomViewCall,
    args: any,
  ): Promise<IData | null | undefined> {
    if (key === SysUIActionTag.REFRESH) {
      await this.refresh();
      return null;
    }
    if (key === SysUIActionTag.EDIT || key === SysUIActionTag.VIEW) {
      return this.openData(args!);
    }
    if (key === SysUIActionTag.NEW) {
      return this.newData(args!);
    }
    return super.call(key, args);
  }

  /**
   * @description 视图重新加载
   * @protected
   * @returns {*}  {Promise<void>}
   * @memberof MDCustomViewEngine
   */
  protected async reLoad(): Promise<void> {
    if (this.view.state.xdatacontrolname) {
      const xDataCtrl = this.view.getController(
        this.view.state.xdatacontrolname,
      ) as IMDControlController;
      await xDataCtrl?.load({ isInitialLoad: true });
    }
  }

  /**
   * @description 刷新数据
   * @returns {*}  {Promise<void>}
   * @memberof MDCustomViewEngine
   */
  async refresh(): Promise<void> {
    if (this.view.state.xdatacontrolname) {
      const xDataCtrl = this.view.getController(
        this.view.state.xdatacontrolname,
      ) as IMDControlController;
      await xDataCtrl?.refresh();
    }
  }

  /**
   * @description 打开编辑数据视图
   * @protected
   * @param {{
   *     data: IData[];
   *     event?: MouseEvent;
   *     context?: IContext;
   *     params?: IParams;
   *   }} args
   * @returns {*}  {Promise<IUIActionResult>}
   * @memberof MDCustomViewEngine
   */
  protected async openData(args: {
    data: IData[];
    ctrl?: IControlController;
    event?: MouseEvent;
    context?: IContext;
    params?: IParams;
  }): Promise<IUIActionResult> {
    const { data, ctrl, event } = args;

    // 添加选中数据的主键
    const context = (args.context || this.view.context).clone();
    let deName = data[0].srfdecodename?.toLowerCase();
    if (ctrl) {
      // 添加srfnavctrlid到上下文
      context.srfnavctrlid = ctrl.ctrlId;
      if (!deName) {
        deName = calcDeCodeNameById(ctrl.model.appDataEntityId!);
      }
    }

    const params = args.params || this.view.params;
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
      return {
        cancel: result ? !result.ok : true,
      };
    }
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
  protected async newData(args: {
    data: IData[];
    event?: MouseEvent;
    copyMode?: boolean;
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
      return {
        cancel: result ? !result.ok : true,
      };
    }
  }
}
