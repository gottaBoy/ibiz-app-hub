/* eslint-disable prefer-destructuring */
import {
  RuntimeError,
  findRecursiveChild,
  IBizContext,
  IPortalMessage,
} from '@ibiz-template/core';
import { IDEToolbar, IPanel, IPanelContainer } from '@ibiz/model-core';
import qs from 'qs';
import { isNil } from 'ramda';
import { SysUIActionTag, ViewCallTag } from '../constant';
import {
  IViewController,
  IToolbarController,
  IViewLayoutPanelController,
  ISearchFormController,
  ISearchBarController,
  IApiViewCall,
} from '../interface';
import { IViewEngine } from '../interface/engine';
import { getControl } from '../model';
import { fieldValueToBoolean } from '../service';

/**
 * 视图引擎基类
 * @author lxm
 * @date 2023-04-26 07:29:27
 * @export
 * @class ViewEngineBase
 */
export class ViewEngineBase implements IViewEngine {
  /**
   * 获取工具栏控制器
   * @author lxm
   * @date 2023-05-22 03:47:43
   * @readonly
   * @protected
   * @type {(IToolbarController | undefined)}
   */
  protected get toolbar(): IToolbarController | undefined {
    return this.view.getController('toolbar') as IToolbarController;
  }

  /**
   * 左工具栏
   * @author lxm
   * @date 2023-06-20 02:36:45
   * @readonly
   * @protected
   * @type {(IToolbarController | undefined)}
   */
  protected get leftToolbar(): IToolbarController | undefined {
    return this.view.getController('lefttoolbar') as IToolbarController;
  }

  /**
   * 右工具栏
   * @author lxm
   * @date 2023-06-20 02:36:45
   * @readonly
   * @protected
   * @type {(IToolbarController | undefined)}
   */
  protected get rightToolbar(): IToolbarController | undefined {
    return this.view.getController('righttoolbar') as IToolbarController;
  }

  /**
   * 右工具栏
   * @author lxm
   * @date 2023-06-20 02:36:45
   * @readonly
   * @protected
   * @type {(IToolbarController | undefined)}
   */
  protected get footerToolbar(): IToolbarController | undefined {
    return this.view.getController('footertoolbar') as IToolbarController;
  }

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
   * 获取分页搜索视图上移的搜索表单控制器
   * @author lxm
   * @date 2023-05-22 01:56:25
   * @readonly
   */
  protected get tabSearchForm(): ISearchFormController {
    return this.view.getController('tabsearchform') as ISearchFormController;
  }

  /**
   * 获取视图布局面板控制器
   * @author lxm
   * @date 2023-05-22 03:47:43
   * @readonly
   * @protected
   * @type {(IToolbarController | undefined)}
   */
  protected get viewLayoutPanel(): IViewLayoutPanelController | undefined {
    return this.view.layoutPanel as IViewLayoutPanelController | undefined;
  }

  /**
   *是否允许请求数据权限
   *
   * @protected
   * @type {boolean}
   * @memberof ViewEngineBase
   */
  protected enabledDataAccAction: boolean = false;

  /**
   * 构造函数在视图控制器的构造函数逻辑内部执行
   * @author lxm
   * @date 2023-05-06 08:18:28
   * @param {IViewController} view 视图控制器
   */
  constructor(protected view: IViewController) {
    this.init();
    this.initViewState();
  }

  /**
   * 引擎内部初始化
   *
   * @author chitanda
   * @date 2024-02-05 22:02:12
   * @protected
   */
  protected init(): void {
    // 引擎初始化
  }

  /**
   * 重新计算上下文，主要用于视图控制器再算上下文后，每个视图控制器可自身根据变动重新计算
   * @author zpc
   * @date 2024-03-12 13:50:07
   * @return {*}  {Promise<void>}
   */
  handleContextParams(): void {
    // 若视图参数配置了srfdataaccaction，则加载实体数据时请求权限，同时删除srfdataaccaction
    if (this.view.params.srfdataaccaction) {
      this.enabledDataAccAction = fieldValueToBoolean(
        this.view.params.srfdataaccaction,
      );
      delete this.view.params.srfdataaccaction;
    }
  }

  async onCreated(): Promise<void> {
    const { childNames, modal } = this.view;
    modal.hooks.shouldDismiss.tapPromise(async context => {
      if (this.view.state.isLoading) {
        context.allowClose = false;
      }
    });
    childNames.push(
      'captionbar',
      'toolbar',
      'lefttoolbar',
      'righttoolbar',
      'footertoolbar',
    );
    this.calcDynamicLayout();

    // 监听实体数据变更
    this.onDEDataChange = this.onDEDataChange.bind(this);
    ibiz.mc.command.change.on(this.onDEDataChange);
    if (ibiz.env.isMob) {
      ibiz.util.hiddenAppLoading();
    }
  }

  /**
   * 计算动态布局模型
   *
   * @author zk
   * @date 2024-01-29 02:01:47
   * @memberof ViewEngineBase
   */
  protected calcDynamicLayout(): void {
    const names = this.calcRemoveLayoutModel();
    ibiz.log.debug(
      ibiz.i18n.t('runtime.engine.deleteModel', {
        codeName: this.view.model.codeName,
        name: names.join(';'),
      }),
    );
    this.removeLayoutModel(names);
  }

  /**
   * 计算移除的模型名称
   *
   * @author zk
   * @date 2024-01-29 02:01:21
   * @return {*}  {string[]}
   * @memberof ViewEngineBase
   */
  protected calcRemoveLayoutModel(): string[] {
    const { model } = this.view;
    const names = [];

    if (model.showCaptionBar === false) {
      names.push('view_captionbar');
    }

    const toolBarList = ['lefttoolbar', 'righttoolbar', 'footertoolbar'];
    toolBarList.forEach(name => {
      if (!getControl(model, name)) {
        names.push(name);
      }
    });
    if (!this.calcViewHeaderVisible()) {
      names.push('view_header');
    }

    if (ibiz.env.isMob) {
      if (!this.calcViewFooterVisible()) {
        names.push('view_footer');
      }
      if (
        !this.isExistAndInLayout('lefttoolbar') &&
        !this.isExistAndInLayout('righttoolbar') &&
        model.showCaptionBar === false
      ) {
        names.push('view_toolbar');
      }
    } else if (!getControl(model, 'toolbar')) {
      names.push('view_toolbar', 'toolbar');
    }
    return names;
  }

  /**
   * 删除布局模型
   *
   * @author zk
   * @date 2024-01-29 02:01:29
   * @param {string[]} names
   * @param {(IPanelContainer | undefined)} [container=this.view.model.viewLayoutPanel]
   * @return {*}  {void}
   * @memberof ViewEngineBase
   */
  private removeLayoutModel(
    names: string[],
    container: IPanelContainer | undefined = this.view.model.viewLayoutPanel,
  ): void {
    if (!container) {
      return;
    }
    const items =
      (container as IPanel)!.rootPanelItems || container.panelItems || [];
    const index = items.findIndex(item => names.includes(item.id!));
    if (index !== -1) {
      items.splice(index, 1);
    }
    // 过滤深层的子成员
    items.forEach(item => {
      if (item.itemType === 'CONTAINER') {
        this.removeLayoutModel(names, item);
      }
    });
  }

  async onMounted(): Promise<void> {
    // 子类重写
    const { model, childNames } = this.view;
    ibiz.log.debug(
      ibiz.i18n.t('runtime.engine.childComponentsMounted', {
        id: model.id,
        childName: childNames.join(';'),
      }),
    );
  }

  async onDestroyed(): Promise<void> {
    ibiz.mc.command.change.off(this.onDEDataChange);
  }

  async call(
    key: keyof IApiViewCall,
    _args?: IData,
  ): Promise<IData | null | undefined> {
    if (key === ViewCallTag.GET_DATA) {
      return this.getData();
    }
    if (key === ViewCallTag.COPY_PATH) {
      return this.onCopyPath();
    }
    if (key === SysUIActionTag.SHOTR_CUT) {
      return this.onShortCut(_args);
    }
    if (key === SysUIActionTag.TOGGLE_FILTER) {
      this.toggleFilter();
      return null;
    }
    if (key === SysUIActionTag.SEARCH) {
      const { ctrl } = _args || {};
      const searchForm = ctrl || this.searchForm || this.tabSearchForm;
      await searchForm.search();
      return null;
    }
    if (key === SysUIActionTag.RESET) {
      const { ctrl } = _args || {};
      const searchForm = ctrl || this.searchForm || this.tabSearchForm;
      await searchForm.reset();
      return null;
    }
    if (key === SysUIActionTag.CANCEL_CHANGES) {
      await this.cancelChanges({ targetState: 'INIT' });
      return null;
    }
    return undefined;
  }

  /**
   * 拷贝路径
   *
   * @protected
   * @return {*}  {IData}
   * @memberof ViewEngineBase
   */
  protected onCopyPath(): IData {
    const hash = window.location.hash;
    const items = hash.split('/');
    const viewCodeName = this.view.model.codeName!.toLowerCase();
    // 获取当前视图所在的路由位置
    const findIndex = items.findIndex(item => item === viewCodeName);
    // 计算当前视图路由参数
    if (findIndex !== -1) {
      const oldRouteParams = qs.parse(items[findIndex + 1], {
        strictNullHandling: true,
        delimiter: ';',
        depth: 8,
      });
      const newRouteParams = { ...oldRouteParams };
      if (oldRouteParams?.srfnavctx) {
        const srfnavctx: IData = JSON.parse(
          decodeURIComponent(oldRouteParams.srfnavctx as string),
        );
        Object.keys(srfnavctx).forEach(key => {
          srfnavctx[key] = this.view.context[key];
        });
        newRouteParams.srfnavctx = encodeURIComponent(
          JSON.stringify(srfnavctx),
        );
      }
      items[findIndex + 1] = qs.stringify(newRouteParams, {
        delimiter: ';',
        strictNullHandling: true,
        skipNulls: true,
      });
    }
    const path = `${window.location.origin}${
      window.location.pathname
    }${items.join('/')}`;
    const result = ibiz.util.text.copy(path);
    return { ok: result };
  }

  /**
   * @description 取消变更，'UNDO' | 'REDO'暂未支持
   * @param {({
   *       targetState: 'INIT' | 'UNDO' | 'REDO';
   *     })} [args={ targetState: 'INIT' }] 目标状态，初始化状态|撤销上一步操作|重做下一步操作
   * @returns {*}  {Promise<void>}
   * @memberof ViewEngineBase
   */
  async cancelChanges(
    args: {
      targetState: 'INIT' | 'UNDO' | 'REDO';
    } = { targetState: 'INIT' },
  ): Promise<void> {
    const sessionId = this.view.context.srfsessionid;
    const app = ibiz.hub.getApp(this.view.context.srfappid);
    app.deService.cancelUIDomainDChanges(sessionId, args.targetState);
  }

  /**
   * 快捷方式
   *
   * @param {*} args
   * @return {*}  {(Promise<any>)}
   * @memberof ViewEngineBase
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
  async onShortCut(args: any): Promise<any> {
    const { data } = args;
    const { context, model, params, modal } = this.view;

    if (['EMBED', 'POPOVER'].includes(modal.mode)) {
      throw new Error(
        ibiz.i18n.t('runtime.engine.minimization', { mode: modal.mode }),
      );
    }
    const key = await ibiz.util.shortCut.calcShortCutKey({
      context,
      appViewId: model.id!,
    });
    const isExist = ibiz.util.shortCut.isExist(key);
    if (!isExist) {
      const caption = (data && data[0].srfmajortext) || model.caption;
      ibiz.util.shortCut.addShortCut({
        key,
        caption,
        icon: model.sysImage,
        appViewId: model.id!,
        context: IBizContext.create(context),
        params: { ...params },
        openMode: modal.mode,
        fullPath: window.location.hash,
      });
      this.view.state.isShortCut = true;
      this.view.closeView();
      return null;
    }
    ibiz.util.shortCut.removeShortCut(key);
    this.view.state.isShortCut = false;
    return null;
  }

  /**
   * 初始化视图state
   * @author lxm
   * @date 2023-05-15 06:42:25
   * @protected
   */
  protected initViewState(): void {
    // 子类重写初始化状态默认值
  }

  /**
   * 获取视图数据部件的数据
   * @author lxm
   * @date 2023-05-08 12:46:19
   * @return {*}  {IData[]}
   */
  protected getData(): IData[] {
    return [];
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
    let showHeader: boolean = false;
    const { model } = this.view;

    // 标题栏
    if (model.showCaptionBar) {
      showHeader = true;
    }
    if (ibiz.env.isMob) {
      if (this.isExistAndInLayout('lefttoolbar')) {
        showHeader = true;
      }

      if (this.isExistAndInLayout('righttoolbar')) {
        showHeader = true;
      }
    } else if (this.isExistAndInLayout('toolbar')) {
      showHeader = true;
    }
    return showHeader;
  }

  /**
   * 是否存在模型 并且 布局中有占位
   * - 工具栏模型还需判断是否有工具栏项
   * @author zk
   * @date 2024-01-30 11:01:33
   * @param {string} name
   * @return {*}  {(IData | undefined)}
   * @memberof ViewEngineBase
   */
  isExistAndInLayout(name: string): boolean {
    const layout = this.view.model.viewLayoutPanel;
    if (!layout) {
      return false;
    }
    const ins = findRecursiveChild(layout, name, {
      compareField: 'id',
      childrenFields: ['panelItems', 'rootPanelItems'],
    });
    const { model } = this.view;
    const has = getControl(model, name);
    let visible = !!(ins && has);
    if (has?.controlType === 'TOOLBAR') {
      const items = (has as IDEToolbar).detoolbarItems;
      visible = !!(visible && items && items.length > 0);
    }
    return visible;
  }

  /**
   * 计算底部的显示与否
   * @author lxm
   * @date 2023-06-20 02:45:17
   * @protected
   * @return {*}  {boolean}
   */
  protected calcViewFooterVisible(): boolean {
    let showFooter: boolean = false;
    const { model } = this.view;
    // 存在底部工具栏显示视图底部
    if (this.isExistAndInLayout('footertoolbar')) {
      showFooter = true;
    }

    // 是工作流视图显示视图底部
    if (
      model.viewType === 'DEMOBWFDYNAEDITVIEW3' ||
      model.viewType === 'DEMOBWFDYNAEDITVIEW'
    ) {
      showFooter = true;
    }
    return showFooter;
  }

  /**
   * 监听实体数据变更
   *
   * @author zzq
   * @date 2024-10-29 18:03:33
   * @protected
   * @param {IPortalMessage} msg
   */
  protected onDEDataChange(msg: IPortalMessage): void {
    ibiz.log.debug('onDEDataChange', msg);
  }

  /**
   * 加载实体数据
   *
   * @return {*}  {(Promise<void>)}
   * @memberof ViewEngineBase
   */
  async loadEntityData(): Promise<void> {
    const { appDataEntityId } = this.view.model;
    const { evt, context, params } = this.view;
    if (!appDataEntityId) {
      throw new RuntimeError(ibiz.i18n.t('runtime.engine.loadEntityData'));
    }
    const app = ibiz.hub.getApp(context.srfappid);
    const res = await app.deService.exec(
      appDataEntityId,
      'get',
      context,
      params,
      undefined,
      { srfdataaccaction: this.enabledDataAccAction },
    );

    const { data } = res;
    if (data) {
      if (this.enabledDataAccAction) {
        await this.handleEntityPrivilege(data, this.view.context);
      }
      // 更新视图作用域数据和srfreadonly数据
      this.view.state.srfactiveviewdata = data;
      if (Object.prototype.hasOwnProperty.call(data, 'srfreadonly')) {
        if (data.srfreadonly) {
          this.view.context.srfreadonly = true;
        } else if (isNil(this.view.context.srfreadonly)) {
          this.view.context.srfreadonly = false;
        }
      }
      evt.emit('onDataChange', { actionType: 'LOAD', data: [data] });
      if (data.srfkey) {
        evt.emit('onViewInfoChange', { dataInfo: data.srfmajortext || '' });
      }
      this.calcToolbarState(data, appDataEntityId);
    }
  }

  /**
   * 计算工具栏状态
   *
   * @protected
   * @param {IData} [data]
   * @param {string} [appDeId]
   * @memberof ViewEngineBase
   */
  protected calcToolbarState(data?: IData, appDeId?: string): void {
    this.toolbar?.calcButtonState(data, appDeId);
    this.leftToolbar?.calcButtonState(data, appDeId);
    this.rightToolbar?.calcButtonState(data, appDeId);
    this.footerToolbar?.calcButtonState(data, appDeId);
  }

  /**
   * 处理实体权限
   * @author zzq
   * @date 2024-06-03 15:59:08
   * @return {*}  {Promise<void>}
   */
  protected async handleEntityPrivilege(
    data: IData,
    context: IContext,
  ): Promise<void> {
    const { appDataEntityId } = this.view.model;
    if (!data.srfdataaccaction) {
      return;
    }
    const app = ibiz.hub.getApp(context.srfappid);
    const deAuthority = await app.authority.getService(appDataEntityId!);
    deAuthority.setDataAccAction(
      { srfkey: data.srfkey, srfsessionid: context.srfsessionid },
      data.srfdataaccaction,
    );
  }

  /**
   * 切换搜索表单的显示与否
   * @author lxm
   * @date 2023-06-06 09:20:35
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
