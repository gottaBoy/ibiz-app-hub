/* eslint-disable no-param-reassign */
import {
  ControlController,
  IDRBarController,
  IDRBarEvent,
  IDRBarState,
  IDRBarItemsState,
  IEditFormController,
  calcNavParams,
  Srfuf,
  IPanelItemNavPosController,
  hasSubRoute,
  AppCounter,
  CounterService,
  IPanelItemController,
  calcItemVisibleByCounter,
  calcItemVisible,
} from '@ibiz-template/runtime';
import { IDEDRBar, IDEDRBarItem } from '@ibiz/model-core';
import { Router } from 'vue-router';

/**
 * 数据关系栏控制器
 *
 * @export
 * @class DRBarController
 * @extends {ControlController<IDEDRBar, IDRBarState, IDRBarEvent>}
 * @implements {IDRBarController}
 */
export class DRBarController
  extends ControlController<IDEDRBar, IDRBarState, IDRBarEvent>
  implements IDRBarController
{
  setActive(_name: string): void {
    throw new Error('Method not implemented.');
  }

  /**
   * 计数器对象
   * @author lxm
   * @date 2024-01-18 05:12:35
   * @type {AppCounter}
   */
  counter?: AppCounter;

  /**
   * 导航占位控制器
   *
   * @readonly
   * @memberof DRBarController
   */
  get navPos(): IPanelItemNavPosController {
    return this.view.layoutPanel?.panelItems
      .nav_pos as IPanelItemNavPosController;
  }

  /**
   * 导航视图容器控制器
   * @return {*}
   * @author: zhujiamin
   * @Date: 2024-01-25 16:03:00
   */
  get viewNavPos(): IPanelItemController | undefined {
    return this.view.layoutPanel?.panelItems.view_nav_pos as
      | IPanelItemController
      | undefined;
  }

  /**
   * 表单部件
   *
   * @readonly
   * @memberof DRBarController
   */
  get form(): IEditFormController {
    return this.view.getController('form') as IEditFormController;
  }

  /**
   * 是否是新建
   * @author lxm
   * @date 2023-12-11 06:32:04
   * @readonly
   * @type {boolean}
   */
  get isCreate(): boolean {
    return this.getData()[0].srfuf !== Srfuf.UPDATE;
  }

  /**
   * 获取数据
   *
   * @return {*}  {IData[]}
   * @memberof DRBarController
   */
  getData(): IData[] {
    return this.form?.getData() || [{}];
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
   * 路由层级
   *
   * @readonly
   * @type {(number | undefined)}
   * @memberof DRBarController
   */
  get routeDepth(): number | undefined {
    return this.view.modal.routeDepth;
  }

  /**
   * 初始化state的属性
   *
   * @protected
   * @memberof DRBarController
   */
  protected initState(): void {
    super.initState();
    this.state.drBarItems = [];
    this.state.srfnav = '';
    this.state.isCalculatedPermission = false;
    this.state.hideEditItem = !!this.model.hideEditItem;
  }

  /**
   * 创建完成
   *
   * @return {*}  {Promise<void>}
   * @memberof DRBarController
   */
  async onCreated(): Promise<void> {
    await super.onCreated();
    await this.initCounter();
  }

  /**
   * 通过计数器数据，计算项状态
   *
   * @memberof DRBarController
   */
  calcItemStateByCounter(): void {
    this.state.drBarItems.forEach(item => {
      if (item.children?.length) {
        item.children.forEach(childItem => {
          const visible = calcItemVisibleByCounter(childItem, this.counter);
          if (visible !== undefined) {
            childItem.visible = visible;
          }
        });
        // 有一个子显示的时候分组就是显示的
        item.visible = item.children.some(childItem => childItem.visible);
      } else {
        // 不是分组的时候直接计算
        const visible = calcItemVisibleByCounter(item, this.counter);
        if (visible !== undefined) {
          item.visible = visible;
        }
      }
    });
    if (this.state.selectedItem) {
      const { visible, defaultVisibleItem } = this.getItemVisibleState(
        this.state.selectedItem,
      );
      if (!visible && defaultVisibleItem) {
        this.handleSelectChange(defaultVisibleItem.tag);
      }
    }
  }

  /**
   * 获取对应项的显示状态
   *
   * @author zhanghengfeng
   * @date 2024-05-16 17:05:15
   * @param {string} key
   * @return {*}  {{
   *     visible: boolean;
   *     defaultVisibleItem?: IDRBarItemsState;
   *   }}
   */
  getItemVisibleState(key: string): {
    visible: boolean;
    defaultVisibleItem?: IDRBarItemsState;
  } {
    let visible = true;
    let defaultVisibleItem: IDRBarItemsState | undefined;
    this.state.drBarItems.forEach(item => {
      if (item.children) {
        if (!defaultVisibleItem) {
          defaultVisibleItem = item.children.find(child => child.visible);
        }
        const drBarItem = item.children.find(child => child.tag === key);
        if (drBarItem) {
          visible = !!drBarItem.visible;
        }
      } else {
        if (!defaultVisibleItem && item.visible) {
          defaultVisibleItem = item;
        }
        if (item.tag === key) {
          visible = !!item.visible;
        }
      }
    });

    return {
      visible,
      defaultVisibleItem,
    };
  }

  /**
   * 计算关系界面组权限
   *
   * @param {IDRBarItemsState} item 关系组成员
   * @memberof DRBarController
   */
  async calcPermitted(item: IDRBarItemsState): Promise<void> {
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
    item.visible = permitted;
  }

  /**
   * 计算是否展示
   *
   * @param {IData} item 关系组成员
   * @memberof DRBarController
   */
  async calcDrBarItemsState(): Promise<void> {
    await Promise.all(
      this.state.drBarItems.map(async item => {
        if (item.children?.length) {
          await Promise.all(
            item.children.map(async childItem => {
              await this.calcPermitted(childItem);
            }),
          );
          // 有一个子显示的时候分组就是显示的
          item.visible = item.children.some(childItem => childItem.visible);
        } else {
          // 不是分组的时候直接计算权限
          await this.calcPermitted(item);
        }
      }),
    );
    this.calcItemStateByCounter();
    this.state.isCalculatedPermission = true;
  }

  /**
   * 加载完成
   *
   * @return {*}  {Promise<void>}
   * @memberof DRBarController
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
        await this.calcDrBarItemsState();
        this.handleFormChange();
      });
      this.form.evt.on('onLoadDraftSuccess', () => {
        this.handleFormChange();
      });
      this.form.evt.on('onSaveSuccess', () => {
        this.handleFormChange();
      });
    }
    this.initDRBarItems();
    if (!this.form) {
      await this.calcDrBarItemsState();
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

    // 显示编辑项的时候如果没有srfnav需要回显则不处理
    if (!this.state.hideEditItem && !this.state.srfnav) {
      this.setVisible('form');
      return;
    }

    if (this.isCreate) {
      this.state.defaultItem = this.model.uniqueTag!;
    }
  }

  /**
   * 处理表单数据变更
   *
   * @memberof DRBarController
   */
  handleFormChange(): void {
    const disabled = this.isCreate;
    this.setDRBarItemsState(this.state.drBarItems, disabled);
  }

  /**
   * 设置关系项状态
   *
   * @param {IDRBarItemsState[]} drBarItems 关系项
   * @param {boolean} disabled 禁用状态
   * @memberof DRBarController
   */
  setDRBarItemsState(drBarItems: IDRBarItemsState[], disabled: boolean): void {
    drBarItems.forEach(item => {
      // 排除首项
      if (item.tag !== this.model.uniqueTag) {
        item.disabled = disabled;
      }
      if (item.children) {
        this.setDRBarItemsState(item.children, disabled);
      }
    });
  }

  /**
   * 初始化关系项数据
   *
   * @memberof DRBarController
   */
  initDRBarItems(): void {
    const { dedrctrlItems, dedrbarGroups } = this.model;
    const drBarItems: IDRBarItemsState[] = [];

    // 绘制编辑项
    if (!this.state.hideEditItem) {
      const {
        editItemCaption,
        editItemCapLanguageRes,
        editItemSysImage,
        uniqueTag,
      } = this.model;
      let caption = editItemCaption;
      if (editItemCapLanguageRes) {
        caption = ibiz.i18n.t(
          editItemCapLanguageRes.lanResTag!,
          editItemCaption,
        );
      }
      // 编辑项
      drBarItems.push({
        tag: uniqueTag!,
        caption,
        disabled: false,
        visible: !this.state.hideEditItem,
        sysImage: editItemSysImage,
        fullPath: this.router.currentRoute.value.fullPath,
      });
      // 默认显示编辑项
      this.state.defaultItem = uniqueTag!;
    }

    // 分组和关系项
    if (dedrbarGroups && dedrctrlItems) {
      dedrbarGroups.forEach(group => {
        const children = dedrctrlItems.filter(
          item => (item as IDEDRBarItem).dedrbarGroupId === group.id,
        );
        let groupCaption = group.caption;
        if (group.capLanguageRes) {
          groupCaption = ibiz.i18n.t(
            group.capLanguageRes.lanResTag!,
            group.caption,
          );
        }
        drBarItems.push({
          tag: group.id!,
          visible: false,
          caption: groupCaption,
          sysImage: group.sysImage,
          children: children.map(child => {
            let itemCaption = child.caption;
            if (child.capLanguageRes) {
              itemCaption = ibiz.i18n.t(
                child.capLanguageRes.lanResTag!,
                child.caption,
              );
            }
            const {
              sysImage,
              counterId,
              enableMode,
              counterMode,
              testScriptCode,
              dataAccessAction,
              testAppDELogicId,
            } = child;
            return {
              tag: child.id!,
              caption: itemCaption,
              sysImage,
              visible: false, // 默认不显示
              disabled: false,
              counterId,
              dataAccessAction,
              enableMode,
              testAppDELogicId,
              testScriptCode,
              counterMode,
            };
          }),
        });
      });
    }

    this.state.drBarItems = drBarItems;
    // 路由模式下，且有子路由的时候不需要navpos跳转路由，只要做呈现
    const isRoutePushed = !!this.routeDepth && hasSubRoute(this.routeDepth);
    const defaultSelect = (this.view.state as IData).srfnav
      ? (this.view.state as IData).srfnav
      : drBarItems[0].children![0].tag;
    this.handleSelectChange(defaultSelect, isRoutePushed);
  }

  /**
   * 处理选中改变
   *
   * @param {boolean} [isRoutePushed=false]
   * @memberof DRBarController
   */
  handleSelectChange(key: string, isRoutePushed: boolean = false): void {
    const { selectedItem } = this.state;
    if (key !== selectedItem) {
      this.state.selectedItem = key;
      const drBarItem = this.model.dedrctrlItems?.find(item => item.id === key);
      if (drBarItem) {
        this.setVisible('navPos');
        this.openNavPosView(drBarItem, isRoutePushed);
      } else {
        this.setVisible('form');
        if (this.routeDepth) {
          this.router.push(this.state.drBarItems[0].fullPath!);
        }
      }
    }
  }

  /**
   * 设置显示状态
   *
   * @param {('form' | 'navPos')} ctrlName 显示的部件名称
   * @memberof DRBarController
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
      if (this.viewNavPos) {
        this.viewNavPos.state.visible = false;
        this.viewNavPos.state.keepAlive = true;
      }
    } else {
      if (viewForm) {
        viewForm.state.visible = false;
        viewForm.state.keepAlive = true;
      }
      if (this.viewNavPos) {
        this.viewNavPos.state.visible = true;
        this.viewNavPos.state.keepAlive = true;
      }
    }
  }

  /**
   * 准备参数
   *
   * @param {IDEDRBarItem} drBarItem 关系项
   * @return {*}
   * @memberof DRBarController
   */
  prepareParams(drBarItem: IDEDRBarItem): {
    context: IContext;
    params: IParams;
  } {
    const { navigateContexts, navigateParams } = drBarItem;
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
    const context = Object.assign(this.context.clone(), resultContext);
    const params = { ...this.params, ...resultParams };
    return { context, params };
  }

  /**
   * 打开导航占位视图
   *
   * @param {IDEDRBarItem} drBarItem 关系项
   * @memberof DRBarController
   */
  async openNavPosView(
    drBarItem: IDEDRBarItem,
    isRoutePushed = false,
  ): Promise<void> {
    const { context, params } = this.prepareParams(drBarItem);
    // 合并SrfNav
    context.currentSrfNav = drBarItem.id!;
    this.state.srfnav = drBarItem.id!;
    this.navPos?.openView({
      key: drBarItem.id!,
      context,
      params,
      viewId: drBarItem.appViewId,
      isRoutePushed,
      modalOptions: {
        replace: true,
      },
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
    const { appCounterRefs } = this.model;
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
   * 监听组件销毁
   *
   * @author zhanghengfeng
   * @date 2024-04-10 19:04:43
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
}
