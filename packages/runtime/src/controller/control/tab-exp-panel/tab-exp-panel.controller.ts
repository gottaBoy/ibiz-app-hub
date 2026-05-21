import { IDER1N, IDETabViewPanel, ITabExpPanel } from '@ibiz/model-core';
import { createUUID } from 'qx-util';
import {
  ITabExpPanelState,
  ITabExpPanelEvent,
  ITabExpPanelController,
  ITabExpPanelPagesState,
  INavViewMsg,
  IViewLayoutPanelController,
} from '../../../interface';
import { calcDeCodeNameById } from '../../../model';
import { calcNavParams } from '../../../utils';
import { ControlController } from '../../common';
import { hasSubRoute } from '../../utils';
import { AppCounter, CounterService } from '../../../service';

/**
 * 分页导航面板
 *
 * @export
 * @class TabExpPanelController
 * @extends {ControlController<IDETabExpPanel, ITabExpPanelState, ITabExpPanelEvent>}
 * @implements {ITabExpPanelController}
 */
export class TabExpPanelController
  extends ControlController<ITabExpPanel, ITabExpPanelState, ITabExpPanelEvent>
  implements ITabExpPanelController
{
  /**
   * 是否显示文本
   * @return {*}
   * @author: zhujiamin
   * @Date: 2023-09-20 10:36:35
   */
  isShowCaption = true;

  /**
   * 是否显示图标
   * @return {*}
   * @author: zhujiamin
   * @Date: 2023-09-20 10:36:46
   */
  isShowIcon = false;

  /**
   * @description 计数器对象
   * @type {AppCounter}
   * @memberof TabExpPanelController
   */
  counter?: AppCounter;

  /**
   * 是否缓存
   *
   * @author zk
   * @date 2023-09-27 09:09:59
   * @readonly
   * @type {boolean}
   * @memberof ExpBarControlController
   */
  get isCache(): boolean {
    if (this.controlParams.expcache === 'CACHE') {
      return true;
    }
    if (this.controlParams.expcache === 'NO_CACHE') {
      return false;
    }
    return ibiz.config.view.expCacheMode.includes(this.model.controlType!);
  }

  /**
   * 当前路由视图的层级
   *
   * @author zk
   * @date 2023-07-11 10:07:20
   * @readonly
   * @type {(number | undefined)}
   * @memberof ExpBarControlController
   */
  get routeDepth(): number | undefined {
    return this.view.modal.routeDepth;
  }

  /**
   * 初始化state的属性
   *
   * @protected
   * @memberof TabExpPanelController
   */
  protected initState(): void {
    super.initState();
    this.state.tabPages = [];
    this.state.activeName = '';
    this.state.expViewParams = {};
    this.state.counterData = {};
  }

  /**
   * 创建完成
   *
   * @protected
   * @return {*}  {Promise<void>}
   * @memberof TabExpPanelController
   */
  async onCreated(): Promise<void> {
    await super.onCreated();
    await this.initCounter();
    this.counter?.onChange(this.onCounterChange.bind(this));
    this.layoutPanel = this.view.layoutPanel! as
      | IViewLayoutPanelController
      | undefined;

    this.initTabPages();
    this.initIconCaption();
  }

  /**
   * 初始化分页数据
   *
   * @memberof TabExpPanelController
   */
  initTabPages(): void {
    const viewPanel = this.model.controls as IDETabViewPanel[];
    const tabPages: ITabExpPanelPagesState[] = [];
    viewPanel.forEach((panel: IDETabViewPanel) => {
      tabPages.push({
        caption: panel.caption!,
        tabTag: panel.id!,
        class: panel.sysCss ? [panel.sysCss.cssName!] : [],
        sysImage: panel.sysImage,
        counterId: panel.counterId,
      });
    });
    this.state.tabPages = tabPages;
    if (tabPages.length > 0) {
      this.initDefaultPage();
    }
  }

  /**
   * 初始化图标和文本显示
   *
   * @memberof TabExpPanelController
   */
  initIconCaption(): void {
    // 临时处理，视图参数那边配置showMode决定显示
    if (this.params.showmode) {
      switch (this.params.showmode) {
        case 'ICONANDSHORTWORD':
          this.isShowIcon = true;
          this.isShowCaption = true;
          break;
        case 'ICON':
          this.isShowIcon = true;
          this.isShowCaption = false;
          break;
        case 'SHORTWORD':
          this.isShowIcon = false;
          this.isShowCaption = true;
          break;
        default:
          break;
      }
    }
  }

  /**
   * 初始化默认分页
   *
   * @author zk
   * @date 2023-06-19 09:06:33
   * @memberof TabExpPanelController
   */
  initDefaultPage(): void {
    // 跳转指定的默认分页
    if (this.state.defaultTabName) {
      const activeTab = this.state.tabPages.find(
        item => item.tabTag === this.state.defaultTabName,
      );
      if (activeTab) {
        this.state.activeName = activeTab.tabTag;
        this.changeToTab(
          this.activeTabViewPanelModel,
          // 路由模式下并且有子路由
          this.routeDepth !== undefined && hasSubRoute(this.routeDepth),
        );
        return;
      }
    }

    // 没有默认分页或者匹配不到时，跳转第一个分页
    this.state.activeName = this.state.tabPages[0].tabTag;
    this.handleTabChange();
  }

  /**
   * 切换分页
   * @author lxm
   * @date 2023-08-10 05:37:26
   * @protected
   * @param {IDETabViewPanel} [tab=this.activeTabViewPanelModel!]
   */
  protected changeToTab(
    tab: IDETabViewPanel = this.activeTabViewPanelModel!,
    isRoutePushed = false,
  ): void {
    const navViewMsg = this.getNavViewMsg(tab);
    if (isRoutePushed === true) {
      navViewMsg.isRoutePushed = true;
    }
    this.evt.emit('onNavViewChange', { navViewMsg });
    this.evt.emit('onTabChange', { tab });
  }

  /**
   * 当前激活tab模型
   *
   * @author zk
   * @date 2023-06-29 03:06:56
   * @readonly
   * @type {IDETabViewPanel}
   * @memberof TabExpPanelController
   */
  get activeTabViewPanelModel(): IDETabViewPanel {
    const { activeName } = this.state;
    const viewPanel = this.model.controls!.find(tab => tab.id === activeName);
    return viewPanel as IDETabViewPanel;
  }

  /**
   * 处理分页改变
   *
   * @memberof TabExpPanelController
   */
  async handleTabChange(): Promise<void> {
    if (this.activeTabViewPanelModel) {
      this.changeToTab();
    }
  }

  /**
   * 准备参数
   *
   * @param {IDETabViewPanel} tabViewPanel
   * @memberof TabExpPanelController
   */
  prepareParams(tabViewPanel: IDETabViewPanel): {
    context: IContext;
    params: IParams;
  } {
    const {
      navDER,
      navFilter,
      navigateContexts,
      navigateParams,
      appDataEntityId,
    } = tabViewPanel;
    const model = {
      deName: calcDeCodeNameById(appDataEntityId!),
      navFilter,
      pickupDEFName: (navDER as IDER1N)?.pickupDEFName,
      navContexts: navigateContexts,
      navParams: navigateParams,
    };
    const originParams = {
      context: this.context,
      params: this.params,
      data: {},
    };
    const { resultContext, resultParams } = calcNavParams(model, originParams);
    // 合并SrfNav
    const context = Object.assign(this.context.clone(), resultContext, {
      currentSrfNav: this.state.activeName,
    });
    const params = { ...resultParams, ...this.state.expViewParams };
    return { context, params };
  }

  /**
   *
   *
   * @author zk
   * @date 2023-06-29 03:06:41
   * @param {IDETabViewPanel} tabViewPanel
   * @return {*}  {Promise<INavViewMsg>}
   * @memberof TabExpPanelController
   */
  public getNavViewMsg(tabViewPanel: IDETabViewPanel): INavViewMsg {
    const { context, params } = this.prepareParams(tabViewPanel);
    return {
      key: tabViewPanel.codeName!.toLowerCase(),
      context,
      params,
      viewId: tabViewPanel.embeddedAppDEViewId,
      isCache: this.isCache,
      modalOptions: { replace: true },
    };
  }

  refresh(): void {
    const navViewMsg = this.getNavViewMsg(this.activeTabViewPanelModel);
    navViewMsg.key += createUUID();
    this.evt.emit('onNavViewChange', { navViewMsg });
  }

  /**
   * @description 初始化计数器
   * @protected
   * @returns {*}  {Promise<void>}
   * @memberof TabExpPanelController
   */
  protected async initCounter(): Promise<void> {
    if (this.state.isCounterDisabled) return;
    const { appCounterRefs } = this.model as IData;
    const appCounterRef = appCounterRefs?.[0];
    if (appCounterRef) {
      this.counter = await CounterService.getCounterByRef(
        appCounterRef,
        this.context,
        { ...this.params },
      );
    }
  }

  /**
   * @description 计数器对象数据改变
   * @param {IData} data
   * @memberof TabExpPanelController
   */
  onCounterChange(data: IData): void {
    this.state.counterData = data;
  }

  /**
   * @description 设置激活项
   * @param {string} name
   * @memberof TabExpPanelController
   */
  setActive(name: string): void {
    this.state.activeName = name;
    this.handleTabChange();
  }

  /**
   * @description 生命周期-销毁完成
   * @protected
   * @returns {*}  {Promise<void>}
   * @memberof TabExpPanelController
   */
  protected async onDestroyed(): Promise<void> {
    await super.onDestroyed();
    if (this.counter) {
      this.counter.destroy();
    }
  }
}
