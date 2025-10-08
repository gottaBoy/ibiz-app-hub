/* eslint-disable default-param-last */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { createUUID } from 'qx-util';
import {
  ControlController,
  IDRTabController,
  IDRTabEvent,
  IDRTabState,
  IDRTabPagesState,
  IEditFormController,
  calcNavParams,
  Srfuf,
  IPanelItemNavPosController,
  hasSubRoute,
  AppCounter,
  CounterService,
  calcItemVisibleByCounter,
  calcItemVisible,
} from '@ibiz-template/runtime';
import { getNestedRoutePath } from '@ibiz-template/vue3-util';
import { IDEDRCtrlItem, IDEDRTab } from '@ibiz/model-core';
import { Router } from 'vue-router';

/**
 * 数据关系栏控制器
 *
 * @export
 * @class DRTabController
 * @extends {ControlController<IDEDRTab, IDRTabState, IDRTabEvent>}
 * @implements {IDRTabController}
 */
export class DRTabController
  extends ControlController<IDEDRTab, IDRTabState, IDRTabEvent>
  implements IDRTabController
{
  /**
   * 计数器对象
   * @author lxm
   * @date 2024-01-18 05:12:35
   * @type {AppCounter}
   */
  counter?: AppCounter;

  /**
   * @description 启用缓存
   * @type {boolean}
   * @memberof DRTabController
   */
  srfCachePos: boolean = false;

  /**
   * @description 缓存标记
   * @type {string}
   * @memberof DRTabController
   */
  srfCacheKeyTempl: string = '';

  /**
   * 导航占位控制器
   *
   * @readonly
   * @memberof DRTabController
   */
  get navPos(): IPanelItemNavPosController {
    return this.view.layoutPanel?.panelItems
      .nav_pos as IPanelItemNavPosController;
  }

  /**
   * 表单部件
   *
   * @readonly
   * @memberof DRTabController
   */
  get form(): IEditFormController {
    return this.view?.getController('form') as IEditFormController;
  }

  /**
   * 路由层级
   *
   * @readonly
   * @type {(number | undefined)}
   * @memberof DRTabController
   */
  get routeDepth(): number | undefined {
    return this.view.modal.routeDepth;
  }

  /**
   * @description 选中缓存标识
   * @readonly
   * @type {string}
   * @memberof DRTabController
   */
  get storageTag(): string {
    if (this.srfCacheKeyTempl) {
      return this.srfCacheKeyTempl;
    }
    const userId = this.context.srfuserid;
    return `${userId}_${this.view.model.codeName}_${this.model.codeName}`;
  }

  /**
   * 是否启用锚点栏
   *
   * @readonly
   * @type {boolean}
   * @memberof DRTabController
   */
  get enableAnchor(): boolean {
    if (this.controlParams.enablenavbar) {
      return this.controlParams.enablenavbar === 'true';
    }
    return (ibiz.config as IData).drtab.enableNavbar;
  }

  /**
   * 导航栏位置
   *
   * @readonly
   * @type {string}
   * @memberof DRTabController
   */
  get navbarpos(): string {
    return (
      (this.controlParams.navbarpos as string)?.toLowerCase() ||
      ((ibiz.config as IData).drtab.navbarPos as string).toLowerCase()
    );
  }

  /**
   * 导航栏宽度
   *
   * @readonly
   * @type {string}
   * @memberof DRTabController
   */
  get navbarwidth(): string | number {
    return (
      this.controlParams.navbarwidth || (ibiz.config as IData).drtab.navbarWidth
    );
  }

  /**
   * Router 对象
   *
   * @type {Router}
   * @memberof DRTabController
   */
  router!: Router;

  /**
   * 设置 Router 对象
   *
   * @param {Router} router
   * @memberof DRTabController
   */
  setRouter(router: Router): void {
    this.router = router;
  }

  /**
   * 获取数据
   *
   * @return {*}  {IData[]}
   * @memberof DRTabController
   */
  getData(): IData[] {
    return this.form?.getData() || [{}];
  }

  /**
   * 初始化state的属性
   *
   * @protected
   * @memberof DRTabController
   */
  protected initState(): void {
    super.initState();
    this.state.drTabPages = [];
    this.state.showMore = false;
    // 未配置时默认隐藏编辑项
    this.state.hideEditItem = !!this.model.hideEditItem;
  }

  /**
   * 创建完成
   *
   * @return {*}  {Promise<void>}
   * @memberof DRTabController
   */
  async onCreated(): Promise<void> {
    await super.onCreated();
    await this.initCounter();
    this.srfCacheKeyTempl = this.controlParams.srfcachekeytempl || '';
    if (this.controlParams.showmore) {
      this.state.showMore = this.controlParams.showmore === 'true';
    }
    if (this.controlParams.srfcachepos) {
      this.srfCachePos =
        this.controlParams.srfcachepos.toLowerCase() === 'true';
    }
  }

  /**
   * 通过计数器数据，计算项状态
   *
   * @author zhanghengfeng
   * @date 2024-05-16 17:05:01
   */
  calcItemStateByCounter(): void {
    // fix:PLM#3251
    if (!this.state.activated) return;
    this.state.drTabPages.forEach(item => {
      const visible = calcItemVisibleByCounter(item, this.counter);
      if (visible !== undefined) {
        item.hidden = !visible;
      }
    });

    if (this.state.activeName) {
      const { visible, defaultVisibleItem } = this.getItemVisibleState(
        this.state.activeName,
      );
      if (!visible && defaultVisibleItem) {
        this.state.activeName = defaultVisibleItem.tag;
        this.handleTabChange();
      }
    }
  }

  /**
   * 获取对应项的显示状态
   *
   * @author zhanghengfeng
   * @date 2024-05-16 17:05:18
   * @param {string} key
   * @return {*}  {{
   *     visible: boolean;
   *     defaultVisibleItem?: IDRTabPagesState;
   *   }}
   */
  getItemVisibleState(key: string): {
    visible: boolean;
    defaultVisibleItem?: IDRTabPagesState;
  } {
    let visible = true;
    let defaultVisibleItem: IDRTabPagesState | undefined;
    this.state.drTabPages.forEach(item => {
      if (!defaultVisibleItem && !item.hidden) {
        defaultVisibleItem = item;
      }
      if (item.tag === key) {
        visible = !item.hidden;
      }
    });

    return {
      visible,
      defaultVisibleItem,
    };
  }

  /**
   * 计算项权限
   *
   * @author zhanghengfeng
   * @date 2024-05-16 17:05:40
   * @param {IDRTabPagesState} item
   * @return {*}  {Promise<void>}
   */
  async calcPermitted(item: IDRTabPagesState): Promise<void> {
    let permitted = true;
    const data = this.getData()?.length ? this.getData()[0] : undefined;
    const visible = await calcItemVisible(
      item,
      this.context,
      this.params,
      this.model.appDataEntityId!,
      this.model.appId,
      data,
    );
    if (visible !== undefined) {
      permitted = visible;
    }
    item.hidden = !permitted;
  }

  /**
   * 计算项状态
   *
   * @author zhanghengfeng
   * @date 2024-05-16 17:05:05
   * @return {*}  {Promise<void>}
   */
  async calcDrTabPagesState(): Promise<void> {
    await Promise.all(
      this.state.drTabPages.map(async item => {
        await this.calcPermitted(item);
      }),
    );
    this.calcItemStateByCounter();
    this.state.isCalculatedPermission = true;
  }

  /**
   * 加载完成
   *
   * @return {*}  {Promise<void>}
   * @memberof DRTabController
   */
  async onMounted(): Promise<void> {
    await super.onMounted();
    if (this.form) {
      this.form.evt.on('onLoadSuccess', async event => {
        // 更新视图作用域数据和srfreadonly数据
        const data = event.data[0];
        this.view.state.srfactiveviewdata = data;
        if (Object.prototype.hasOwnProperty.call(data, 'srfreadonly')) {
          this.view.context.srfreadonly = data.srfreadonly;
        }
        await this.calcDrTabPagesState();
        this.handleFormChange();
        this.doDefaultSelect();
      });
      this.form.evt.on('onLoadDraftSuccess', () => {
        this.handleFormChange();
      });
      this.form.evt.on('onSaveSuccess', () => {
        this.handleFormChange();
      });
    }
    this.initDRTabPages();
    if (!this.form) {
      await this.calcDrTabPagesState();
    }

    // 表单已经加载完成执行默认选中，否则加载完成事件里执行
    if (this.form && this.form.state.isLoaded) {
      this.doDefaultSelect();
    }
  }

  /**
   * @description 处理第一次的默认选中
   * @memberof DRTabController
   */
  doDefaultSelect(): void {
    const viewForm = this.view.layoutPanel?.panelItems.view_form;
    if (viewForm) {
      viewForm.state.visible = false;
      viewForm.state.keepAlive = false;
    }

    // 显示编辑项且激活表单时显示表单
    if (
      !this.state.hideEditItem &&
      this.state.activeName === this.model.uniqueTag
    ) {
      this.setVisible('form');
    }
  }

  /**
   * 处理表单数据变更
   *
   * @memberof DRTabController
   */
  handleFormChange(): void {
    const disabled = this.getData()[0].srfuf !== Srfuf.UPDATE;
    this.setDRTabPagesState(this.state.drTabPages, disabled);
  }

  /**
   * 设置关系分页状态
   *
   * @param {IDRTabPagesState[]} drTabPages 关系分页
   * @param {boolean} disabled 禁用状态
   * @memberof DRTabController
   */
  setDRTabPagesState(drTabPages: IDRTabPagesState[], disabled: boolean): void {
    drTabPages.forEach(item => {
      // 排除首项
      if (item.tag !== this.model.uniqueTag) {
        item.disabled = disabled;
      }
    });
  }

  /**
   * 初始化关系分页数据
   *
   * @memberof DRTabController
   */
  initDRTabPages(): void {
    const {
      editItemCaption,
      editItemCapLanguageRes,
      editItemSysImage,
      uniqueTag,
      dedrtabPages,
    } = this.model;
    const drTabPages: IDRTabPagesState[] = [];
    let caption = editItemCaption;
    if (editItemCapLanguageRes) {
      caption = ibiz.i18n.t(editItemCapLanguageRes.lanResTag!, editItemCaption);
    }
    if (!this.state.hideEditItem) {
      // 首项
      drTabPages.push({
        caption,
        tag: uniqueTag!,
        hidden: !!this.state.hideEditItem,
        disabled: false,
        sysImage: editItemSysImage,
        fullPath: this.routeDepth
          ? getNestedRoutePath(this.router.currentRoute.value, this.routeDepth!)
          : '',
      });
    }
    // 关系项
    dedrtabPages?.forEach((item: IDEDRCtrlItem) => {
      let itemCaption = item.caption;
      if (item.capLanguageRes) {
        itemCaption = ibiz.i18n.t(item.capLanguageRes.lanResTag!, item.caption);
      }
      const {
        enableMode,
        dataAccessAction,
        testAppDELogicId,
        testScriptCode,
        counterMode,
      } = item;
      drTabPages.push({
        tag: item.id!,
        caption: itemCaption,
        sysImage: item.sysImage,
        hidden: false,
        disabled: false,
        counterId: item.counterId,
        dataAccessAction,
        enableMode,
        testAppDELogicId,
        testScriptCode,
        counterMode,
      });
    });
    this.state.drTabPages = drTabPages;
    this.state.defaultName = drTabPages[0].tag;
    if ((this.view.state as IData).srfnav) {
      this.state.activeName = (this.view.state as IData).srfnav!;
    } else {
      this.state.activeName = drTabPages[0].tag;
      if (this.srfCachePos && localStorage.getItem(this.storageTag)) {
        const activeName = localStorage.getItem(this.storageTag)!;
        this.state.activeName = activeName;
      }
    }
    // 路由模式下，且有子路由的时候不需要navpos跳转路由，只要做呈现
    const isRoutePushed = !!this.routeDepth && hasSubRoute(this.routeDepth);
    this.handleTabChange(isRoutePushed);
  }

  /**
   * 处理分页改变
   *
   * @author lxm
   * @date 2023-12-21 05:31:59
   * @param {boolean} [isRoutePushed=false] 是否是路由已经跳转过了
   */
  handleTabChange(isRoutePushed: boolean = false): void {
    const { activeName } = this.state;
    const drBarItem = this.model.dedrtabPages?.find(
      item => item.id === activeName,
    );
    // 缓存选中标识
    if (this.srfCachePos && activeName) {
      localStorage.setItem(`${this.storageTag}`, activeName);
    }
    if (drBarItem) {
      this.setVisible('navPos');
      this.openNavPosView(drBarItem, isRoutePushed);
    } else {
      this.setVisible('form');
      if (this.routeDepth && this.state.drTabPages[0]) {
        this.router.push(this.state.drTabPages[0].fullPath!);
      }
    }
  }

  /**
   * 设置显示状态
   *
   * @param {('form' | 'navPos')} ctrlName 显示的部件名称
   * @memberof DRTabController
   */
  setVisible(ctrlName: 'form' | 'navPos'): void {
    if (this.state.hideEditItem) {
      // 不显示编辑项的时候不需要控制显示隐藏
      return;
    }
    const viewForm = this.view.layoutPanel?.panelItems.view_form;
    if (ctrlName === 'form') {
      if (viewForm) {
        viewForm.state.visible = true;
        viewForm.state.keepAlive = true;
      }
      if (this.navPos) {
        this.navPos.state.visible = false;
        this.navPos.state.keepAlive = true;
      }
    } else {
      if (viewForm) {
        viewForm.state.visible = false;
        viewForm.state.keepAlive = true;
      }
      if (this.navPos) {
        this.navPos.state.visible = true;
        this.navPos.state.keepAlive = true;
      }
    }
  }

  /**
   * 准备参数
   *
   * @param {IDEDRCtrlItem} drTabPages 关系分页
   * @return {*}
   * @memberof DRTabController
   */
  prepareParams(drTabPages: IDEDRCtrlItem): {
    context: IContext;
    params: IParams;
  } {
    const { navigateContexts, navigateParams } = drTabPages;
    const model = {
      navContexts: navigateContexts,
      navParams: navigateParams,
    };
    const originParams = {
      context: this.context,
      params: this.params,
      data: this.getData()[0],
    };
    const { resultContext, resultParams } = calcNavParams(model, originParams);
    const context = Object.assign(this.context.clone(), resultContext, {
      currentSrfNav: drTabPages.id,
    });
    const params = { ...this.params, ...resultParams };
    return { context, params };
  }

  /**
   * 打开导航占位视图
   *
   * @author lxm
   * @date 2023-12-21 05:40:07
   * @param {IDEDRCtrlItem} drTabPages
   * @param {boolean} [isRoutePushed=false]
   * @return {*}  {Promise<void>}
   */
  async openNavPosView(
    drTabPages: IDEDRCtrlItem,
    isRoutePushed = false,
    navViewKey?: string,
  ): Promise<void> {
    const { context, params } = this.prepareParams(drTabPages);
    if (!drTabPages.appViewId) return;
    this.navPos?.openView({
      key: navViewKey || drTabPages.id!,
      context,
      params,
      viewId: drTabPages.appViewId,
      isRoutePushed,
    });
  }

  /**
   * 初始化计数器
   * @author lxm
   * @date 2024-01-18 05:12:02
   * @protected
   * @return {*}  {Promise<void>}
   */
  protected async initCounter(): Promise<void> {
    // todo 接口更新后换
    const { appCounterRefs } = this.model as IData;
    const appCounterRef = appCounterRefs?.[0];
    if (appCounterRef) {
      this.counter = await CounterService.getCounterByRef(
        appCounterRef,
        this.context,
        { ...this.params },
      );
      this.calcItemStateByCounter = this.calcItemStateByCounter.bind(this);
      this.counter.onChange(this.calcItemStateByCounter);
    }
  }

  /**
   * 刷新
   *
   * @author tony001
   * @date 2024-10-21 11:10:10
   * @return {*}  {Promise<void>}
   */
  async refresh(): Promise<void> {
    const { activeName } = this.state;
    const drBarItem = this.model.dedrtabPages?.find(
      item => item.id === activeName,
    );

    if (drBarItem) {
      this.setVisible('navPos');
      this.openNavPosView(drBarItem, false, createUUID());
    } else {
      this.setVisible('form');
      if (this.routeDepth && this.state.drTabPages[0]) {
        this.router.push(this.state.drTabPages[0].fullPath!);
      }
    }
  }

  /**
   * 监听组件销毁
   *
   * @author zhanghengfeng
   * @date 2024-04-10 19:04:40
   * @protected
   * @return {*}  {Promise<void>}
   */
  protected async onDestroyed(): Promise<void> {
    await super.onDestroyed();
    if (this.counter) {
      this.counter.offChange(this.calcItemStateByCounter);
      this.counter.destroy();
    }
  }

  /**
   * @description 设置激活项
   * @param {string} name
   * @memberof DRTabController
   */
  public setActive(name: string): void {
    this.state.activeName = name;
    this.handleTabChange();
  }
}
