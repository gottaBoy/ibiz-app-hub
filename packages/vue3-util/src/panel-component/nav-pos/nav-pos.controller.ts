import {
  EventBase,
  IModal,
  Modal,
  OpenAppViewCommand,
  IPanelItemNavPosController,
  ViewMode,
  INavViewMsg,
  NavViewChangeEvent,
  PanelItemController,
} from '@ibiz-template/runtime';
import { IPanelRawItem } from '@ibiz/model-core';
import { RouteLocationNormalizedLoaded, Router } from 'vue-router';
import { notNilEmpty } from 'qx-util';
import { mergeLeft } from 'ramda';
import { NavPosState } from './nav-pos.state';
import { getNestedRoutePath } from '../../util';

const excludeKeys = ['is404', 'isRoutePushed'] as const;

/**
 * 导航占位控制器
 *
 * @export
 * @class NavPosController
 * @extends {PanelItemController}
 */
export class NavPosController
  extends PanelItemController<IPanelRawItem>
  implements IPanelItemNavPosController
{
  /**
   * @description 导航占位状态
   * @exposedoc
   * @type {NavPosState}
   * @memberof NavPosController
   */
  declare state: NavPosState;

  /**
   * @description 导航视图的模态操作对象
   * @exposedoc
   * @type {{ [key: string]: IModal }}
   * @memberof NavPosController
   */
  viewModals: { [key: string]: IModal } = {};

  /**
   * @description 当前导航视图
   * @exposedoc
   * @type {INavViewMsg}
   * @memberof NavPosController
   */
  curNavViewMsg!: INavViewMsg;

  /**
   * @description Router 对象
   * @type {Router}
   * @memberof NavPosController
   */
  router!: Router;

  /**
   * @description 关联部件标识集合，根据配置的REFCTRL参数指定关联部件，关联部件可控制导航视图
   * @exposedoc
   * @type {string[]}
   */
  refCtrlKeys: string[] = [];

  /**
   * @description 面板项参数
   * @exposedoc
   * @type {IData}
   * @memberof NavPosController
   */
  rawItemParams: IData = {};

  /**
   * @description 是否忽略嵌入视图key，为true时嵌入视图组件不会绑定key
   * @exposedoc
   * @type {boolean}
   * @memberof NavPosController
   */
  ignoreEmbedKey: boolean = false;

  /**
   * @description Route 对象
   * @type {RouteLocationNormalizedLoaded}
   * @memberof NavPosController
   */
  get route(): RouteLocationNormalizedLoaded {
    return this.router.currentRoute.value;
  }

  /**
   * @description 导航项是否缓存
   * @param {INavViewMsg} navViewMsg
   * @return {*}  {boolean}
   * @memberof NavPosController
   */
  getExpItemIsCache(navViewMsg: INavViewMsg): boolean {
    if (this.rawItemParams.expcache === 'CACHE') {
      return true;
    }
    if (this.rawItemParams.expcache === 'NO_CACHE') {
      return false;
    }
    return navViewMsg.isCache as boolean;
  }

  /**
   * @description 设置 Router 对象
   * @param {Router} router
   * @memberof NavPosController
   */
  setRouter(router: Router): void {
    this.router = router;
  }

  protected async onInit(): Promise<void> {
    await super.onInit();
    this.handleRawItemParams();
    if (this.model.rawItem?.rawItemParams) {
      this.model.rawItem.rawItemParams.find(item => {
        if (item.key === 'REFCTRL' && item.value) {
          this.refCtrlKeys = item.value
            .split(';')
            .map(str => str.toLowerCase());
          return true;
        }
        return false;
      });
    }

    this.panel.evt.on('onControlEvent', event => {
      // 是否是关联部件，如果没有配置都监控，配置了只监控指定部件
      const isRefCtrl =
        this.refCtrlKeys.length === 0 ||
        this.refCtrlKeys.includes(event.triggerControlName);
      if (isRefCtrl && event.triggerEventName === 'onNavViewChange') {
        const triggerEvent = event.triggerEvent as NavViewChangeEvent;
        this.openView(triggerEvent.navViewMsg);
      }
    });

    //  根据 导航占位参数 || 视图参数 判断是否用路由打开视图 不使用：NO_ROUTE 使用 ：ROUTE
    //  导航占位参数优先级大于视图参数
    const expRoute =
      this.rawItemParams.expmode || this.panel.view.params.expmode;

    const ignoreEmbedKey: string =
      this.rawItemParams.ignoreembedkey ||
      this.panel.view.params.ignoreembedkey ||
      '';

    this.ignoreEmbedKey = Object.is(ignoreEmbedKey.toLowerCase(), 'true');

    // 路由模式下 必须为路由打开
    if (expRoute === 'ROUTE' && this.routeDepth) {
      this.state.routeOpen = true;
    } else if (expRoute === 'NO_ROUTE') {
      this.state.routeOpen = false;
    } else {
      this.state.routeOpen = !!this.routeDepth;
    }
    // 消费完参数销毁 expmode
    if (this.panel.view.params.expmode) {
      delete this.panel.view.params.expmode;
    }
  }

  /**
   * 创建导航占位状态对象
   *
   * @protected
   * @return {*}  {NavPosState}
   * @memberof NavPosController
   */
  protected createState(): NavPosState {
    return new NavPosState(this.parent?.state);
  }

  /**
   * @description 当前路由视图的层级
   * @exposedoc
   * @readonly
   * @type {(number | undefined)}
   * @memberof NavPosController
   */
  get routeDepth(): number | undefined {
    return this.panel.view.modal.routeDepth;
  }

  /**
   * 计算缓存 key 标识
   *
   * @author chitanda
   * @date 2023-12-03 13:12:25
   * @protected
   * @param {INavViewMsg} msg
   * @return {*}  {string}
   */
  protected calcCacheKey(msg: INavViewMsg): string {
    if (msg) {
      return `${msg.viewId}___${msg.key}`;
    }
    return '';
  }

  /**
   * 路由改变
   *
   * @memberof NavPosController
   */
  onRouteChange(route: RouteLocationNormalizedLoaded): void {
    // 没有当前导航视图信息时不做任何处理
    if (this.curNavViewMsg) {
      const cacheKey = this.calcCacheKey(this.curNavViewMsg);

      // 路由打开的视图，currentKey在路由变更之后改值。此时新建的视图才能识别到跳转之后的路由。
      this.state.currentKey = cacheKey;

      // 更新fullPath信息
      this.state.navViewMsgs[cacheKey].fullPath = route.fullPath;
    }
  }

  /**
   * 设置导航视图信息
   *
   * @author zk
   * @date 2023-06-29 02:06:41
   * @param {INavViewMsg} navViewMsg 导航视图信息
   * @memberof NavPosController
   */
  setNavViewMsgs(navViewMsg: INavViewMsg): void {
    // isRoutePushed没传的时候给false
    navViewMsg.isRoutePushed = navViewMsg.isRoutePushed === true;
    const cacheKey = this.calcCacheKey(navViewMsg);
    if (this.state.navViewMsgs[cacheKey]) {
      mergeLeft(this.state.navViewMsgs[cacheKey], navViewMsg);
      // 部分属性这次没传就是undefined
      excludeKeys.forEach(key => {
        if (Object.prototype.hasOwnProperty.call(navViewMsg, key)) {
          this.state.navViewMsgs[cacheKey][key] = undefined;
        }
      });
    } else {
      // 不存在的走新建流程
      this.state.navViewMsgs[cacheKey] = navViewMsg;
      if (this.getExpItemIsCache(navViewMsg)) {
        // 往缓存keys里添加新视图的key
        this.state.cacheKeys.push(cacheKey);
      }
      this.viewModals[cacheKey] = new Modal({
        mode: this.routeDepth ? ViewMode.ROUTE : ViewMode.EMBED,
        routeDepth: this.routeDepth ? this.routeDepth + 1 : undefined,
        dismiss: () => {
          // 执行对应key的dismiss方法
          this.dismiss(cacheKey);
        },
      });
    }

    // todo 换个方式
    this.curNavViewMsg = this.state.navViewMsgs[cacheKey];
  }

  /**
   * 自身的dismiss相关操作
   *
   * @param {string} key
   * @memberof NavPosController
   */
  dismiss(key: string): void {
    ibiz.log.debug(this.constructor.name, 'dismiss', key);
  }

  /**
   * 监听视图创建
   *
   * @param {EventBase} event
   * @memberof NavPosController
   */
  onViewCreated(event: EventBase): void {
    this.panel.evt.emit('onPresetPanelItemEvent', {
      panelItemName: this.model.id!,
      panelItemEventName: 'onViewCreated',
      presetParams: event,
    });
    ibiz.log.debug(this.constructor.name, 'onViewCreated', event);
  }

  toBlankRoute(): void {
    const blankRoute = getNestedRoutePath(this.route, this.routeDepth!);
    this.router.push(blankRoute);
  }

  /**
   * 打开视图
   *
   * @param {INavViewMsg} openViewMsg
   * @memberof NavPosController
   */
  openView(openViewMsg: INavViewMsg): void {
    // 当key为空时，直接切换currentKey，绘制null
    if (!openViewMsg.key) {
      this.state.currentKey = this.calcCacheKey(openViewMsg);
      if (this.routeDepth && this.state.routeOpen) {
        this.toBlankRoute();
      }
      return;
    }

    if (this.routeDepth && this.state.routeOpen) {
      this.openViewByPath(openViewMsg);
    } else {
      this.openViewByModel(openViewMsg);
    }
  }

  /**
   * 通过路由打开视图
   *
   * @param {INavViewMsg} openViewMsg
   * @memberof NavPosController
   */
  async openViewByPath(openViewMsg: INavViewMsg): Promise<void> {
    const cacheKey = this.calcCacheKey(openViewMsg);
    this.setNavViewMsgs(openViewMsg);
    const isRoutePushed = openViewMsg.isRoutePushed === true;
    // * 外部跳转过了的场景不需要这边跳转路由了，直接处理后续内容。
    if (isRoutePushed) {
      this.state.currentKey = cacheKey;
      this.state.navViewMsgs[this.calcCacheKey(this.curNavViewMsg)].fullPath =
        this.route.fullPath;
      return;
    }

    // * 404路由跳转
    if (openViewMsg.is404) {
      const selfPath = getNestedRoutePath(this.route, this.routeDepth!, false);
      if (openViewMsg.modalOptions?.replace) {
        this.router.replace(`${selfPath}/error/404`);
      } else {
        this.router.push(`${selfPath}/error/404`);
      }
      return;
    }

    // 如果key相同，且有缓存的fullPath，则直接push回fullPath。
    if (
      cacheKey === this.state.currentKey &&
      this.state.navViewMsgs[cacheKey].fullPath
    ) {
      if (openViewMsg.modalOptions?.replace) {
        this.router.replace(this.state.navViewMsgs[cacheKey].fullPath!);
      } else {
        this.router.push(this.state.navViewMsgs[cacheKey].fullPath!);
      }
      return;
    }

    if (
      // 如果启用缓存并且有之前存过的fullPath则push回fullPath。
      this.state.navViewMsgs[cacheKey].fullPath &&
      this.getExpItemIsCache(openViewMsg)
    ) {
      if (openViewMsg.modalOptions?.replace) {
        this.router.replace(this.state.navViewMsgs[cacheKey].fullPath!);
      } else {
        this.router.push(this.state.navViewMsgs[cacheKey].fullPath!);
      }
    } else {
      // 走视图路由打开逻辑计算并push
      const tempContext = Object.assign(openViewMsg.context!.clone(), {
        toRouteDepth: this.routeDepth! + 1,
      });
      if (this.rawItemParams?.routeattributekeys) {
        tempContext.attributekeys = this.rawItemParams!.routeattributekeys;
      }
      if (this.getExpItemIsCache(openViewMsg)) {
        this.state.cacheKeys.push(cacheKey);
      }
      if (openViewMsg.viewId) {
        this.state.isLoading = true;
        await ibiz.commands.execute(
          OpenAppViewCommand.TAG,
          openViewMsg.viewId,
          tempContext,
          openViewMsg.params,
          {
            openMode: 'INDEXVIEWTAB',
            modalOption: {
              replace: !this.state.currentKey,
              ...openViewMsg.modalOptions,
            },
          },
        );
        this.state.isLoading = false;
      }
    }

    // !跳转路由过后，修改currentKey由onRouteChange那边路由变更之后处理。
  }

  /**
   * 通过模型绘制视图
   *
   * @param {INavViewMsg} openViewMsg
   * @memberof NavPosController
   */
  openViewByModel(openViewMsg: INavViewMsg): void {
    this.setNavViewMsgs(openViewMsg);
    // 切换currentKey，重新渲染openViewMsg
    this.state.currentKey = this.calcCacheKey(openViewMsg);
  }

  /**
   * 处理自定义补充参数 [{key:'name',value:'data'}] => {name:'data'}
   *
   * @author zk
   * @date 2023-09-27 03:09:55
   * @protected
   * @memberof NavPosController
   */
  protected handleRawItemParams(): void {
    let params = {};
    const rawItemParams = this.model.rawItem?.rawItemParams;
    if (notNilEmpty(rawItemParams)) {
      params = rawItemParams!.reduce((param: IData, item) => {
        param[item.key!.toLowerCase()] = item.value;
        return param;
      }, {});
    }
    Object.assign(this.rawItemParams, params);
  }
}
