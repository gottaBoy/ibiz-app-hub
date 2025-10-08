import { UrlHelper } from '@ibiz-template/core';
import {
  IModalData,
  IOpenViewOptions,
  IOpenViewUtil,
  IPopoverOptions,
  IOverlayContainerOptions,
  IViewController,
  Placement,
} from '@ibiz-template/runtime';
import {
  generateRoutePath,
  generateRoutePathByModal,
  getDrawerPlacement,
  openViewDrawer,
  openViewModal,
  openViewPopover,
  routerCallback,
} from '@ibiz-template/vue3-util';
import { Router } from 'vue-router';
import { isNil } from 'ramda';
import { FloatingUIConfig } from '../app-popover/app-popover-component';

/**
 * 打开视图方式工具类
 *
 * @description 此实现类挂载在 ibiz.openViewUtil
 * @author chitanda
 * @date 2022-08-16 20:08:54
 * @export
 * @class OpenViewUtil
 * @implements {IOpenViewUtil}
 */
export class OpenViewUtil implements IOpenViewUtil {
  // eslint-disable-next-line no-useless-constructor, no-empty-function
  constructor(protected router: Router) {}

  async rootByModal(
    appViewId: string,
    context: IContext,
    params?: IParams | undefined,
  ): Promise<IModalData> {
    const appView = await ibiz.hub.config.view.get(appViewId!);
    const { path } = await generateRoutePathByModal(
      appView,
      this.router.currentRoute.value,
      context,
      params,
    );
    return this.push(path);
  }

  push(path: string): Promise<IModalData> {
    return routerCallback.open(this.router, path);
  }

  async root(
    appViewId: string,
    context: IContext,
    params?: IParams | undefined,
    opts: IData = {},
  ): Promise<IModalData> {
    const appView = await ibiz.hub.config.view.get(appViewId!);
    const route = this.router.currentRoute.value;
    const { path } = await generateRoutePath(appView, route, context, params);
    // 配置mobHomeRouteMode为replace，视图位于home视图下，且界面行为中未配置modaloption.replace时，设置replace为true
    if (
      route.meta.home &&
      isNil(opts.replace) &&
      ibiz.config.mob.mobHomeRouteMode === 'replace'
    ) {
      opts.replace = true;
    }
    return routerCallback.open(this.router, path, opts);
  }

  /**
   * 模态模式打开
   *
   * @author tony001
   * @date 2025-03-24 18:03:55
   * @param {string} appViewId
   * @param {IContext} context
   * @param {(IParams | undefined)} [params]
   * @param {IOverlayContainerOptions} [options={}]
   * @return {*}  {Promise<IModalData>}
   */
  async modal(
    appViewId: string,
    context: IContext,
    params?: IParams | undefined,
    options: IOverlayContainerOptions = {},
  ): Promise<IModalData> {
    const appView = await ibiz.hub.config.view.get(appViewId!);
    // 设置默认的modal参数
    const opts = {
      width: appView.width,
      height: appView.height,
      footerHide: true,
      ...appView.modalOption,
    };

    return openViewModal(
      {
        context,
        params,
        viewId: appView.id,
        ctx: options.ctx,
      },
      opts,
    );
  }

  /**
   * 气泡模式打开
   *
   * @author tony001
   * @date 2025-03-24 18:03:33
   * @param {string} appViewId
   * @param {MouseEvent} event
   * @param {IContext} context
   * @param {(IParams | undefined)} [params]
   * @param {(IPopoverOptions<FloatingUIConfig> & IOverlayContainerOptions)} [options={}]
   * @return {*}  {Promise<IModalData>}
   */
  async popover(
    appViewId: string,
    event: MouseEvent,
    context: IContext,
    params?: IParams | undefined,
    options: IPopoverOptions<FloatingUIConfig> & IOverlayContainerOptions = {},
  ): Promise<IModalData> {
    const appView = await ibiz.hub.config.view.get(appViewId!);
    const opts = {
      width: appView.width,
      height: appView.height,
      autoClose: true,
      placement: 'bottom' as Placement,
      ...options,
      ...appView.modalOption,
    };
    return openViewPopover(
      event,
      {
        context,
        params,
        viewId: appView.id,
        ctx: options.ctx,
      },
      opts,
    );
  }

  /**
   * 抽屉打开视图
   *
   * @author tony001
   * @date 2025-03-24 18:03:01
   * @param {string} appViewId
   * @param {IContext} context
   * @param {(IParams | undefined)} [params]
   * @param {IOverlayContainerOptions} [options={}]
   * @return {*}  {Promise<IModalData>}
   */
  async drawer(
    appViewId: string,
    context: IContext,
    params?: IParams | undefined,
    options: IOverlayContainerOptions = {},
  ): Promise<IModalData> {
    const appView = await ibiz.hub.config.view.get(appViewId!);
    const placement = getDrawerPlacement(appView.openMode!);
    // 设置默认的modal参数
    const opts = {
      width: appView.width,
      height: appView.height,
      placement,
    };

    return openViewDrawer(
      {
        context,
        params,
        viewId: appView.id,
        ctx: options.ctx,
      },
      opts,
    );
  }

  async custom(
    appViewId: string,
    context: IContext,
    params?: IParams | undefined,
  ): Promise<IModalData> {
    const appView = await ibiz.hub.config.view.get(appViewId!);
    ibiz.log.warn('openUserCustom', appView, context, params);
    throw new Error();
  }

  /**
   * 独立程序打开
   *
   * @author zhanghengfeng
   * @date 2024-08-05 20:08:54
   * @param {string} appViewId
   * @param {IContext} context
   * @param {IParams} [params]
   * @return {*}  {Promise<void>}
   */
  async popupApp(
    appViewId: string,
    context: IContext,
    params?: IParams,
  ): Promise<void> {
    const appView = await ibiz.hub.config.view.get(appViewId!);
    const { path } = await generateRoutePath(
      appView,
      this.router.currentRoute.value,
      context,
      params,
    );
    window.open(`${UrlHelper.routeBase}${path}`, '_blank', 'popup');
  }

  /**
   * 校验是否可以打开视图
   *
   * @author tony001
   * @date 2025-02-13 17:02:43
   * @param {IViewController} topView
   * @param {string} appViewId
   * @param {IContext} context
   * @param {IParams} [_params={}]
   * @param {IOpenViewOptions} [opts={}]
   * @return {*}  {Promise<boolean>}
   */
  async verify(
    topView: IViewController,
    appViewId: string,
    context: IContext,
    _params: IParams = {},
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    opts: IOpenViewOptions = {},
  ): Promise<boolean> {
    return true;
  }
}
