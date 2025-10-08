import {
  IModalData,
  IOpenViewOptions,
  IOpenViewUtil,
  IOverlayContainerOptions,
  IPopoverOptions,
  IViewController,
  Placement,
  calcDeCodeNameById,
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
import { UrlHelper } from '@ibiz-template/core';
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

  push(path: string): Promise<IModalData> {
    return routerCallback.open(this.router, path);
  }

  /**
   * 校验是否可以打开视图
   *
   * @author zhanghengfeng
   * @date 2025-02-10 19:02:35
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
    opts: IOpenViewOptions = {},
  ): Promise<boolean> {
    if (!topView || !appViewId) {
      return true;
    }
    const appView = await ibiz.hub.config.view.get(appViewId);
    if (!appView) {
      return true;
    }
    const { openMode = 'INDEXVIEWTAB' } = appView;
    const viewOpenMode = opts.openMode || openMode;
    if (
      viewOpenMode !== 'INDEXVIEWTAB' &&
      viewOpenMode !== 'INDEXVIEWTAB_POPUP'
    ) {
      return true;
    }
    if (topView.model.id !== appView.id) {
      return true;
    }
    if (
      topView.model.appDataEntityId &&
      appView.appDataEntityId &&
      topView.model.appDataEntityId === appView.appDataEntityId &&
      context.srfkey
    ) {
      const deName = calcDeCodeNameById(topView.model.appDataEntityId);
      if (topView.context[deName] === context.srfkey) {
        return false;
      }
    }
    return true;
  }

  async root(
    appViewId: string,
    context: IContext,
    params?: IParams,
    modalOptions?: IData,
  ): Promise<IModalData> {
    const appView = await ibiz.hub.config.view.get(appViewId!);
    const { path } = await generateRoutePath(
      appView,
      this.router.currentRoute.value,
      context,
      params,
    );
    if (modalOptions && modalOptions.replace === true) {
      this.router.replace({ path });
    } else {
      this.router.push({ path });
    }
    return { ok: false };
  }

  async rootByModal(
    appViewId: string,
    context: IContext,
    params?: IParams,
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

  /**
   * 模态打开视图
   *
   * @author tony001
   * @date 2025-03-24 17:03:17
   * @param {string} appViewId
   * @param {IContext} context
   * @param {IParams} [params]
   * @param {IOverlayContainerOptions} [options={}]
   * @return {*}  {Promise<IModalData>}
   */
  async modal(
    appViewId: string,
    context: IContext,
    params?: IParams,
    options: IOverlayContainerOptions = {},
  ): Promise<IModalData> {
    const appView = await ibiz.hub.config.view.get(appViewId!);
    // 设置默认的modal参数
    const modalOption = JSON.parse(ibiz.config.common.modalOption || '{}');
    const opts = {
      width: appView.width || '80%',
      height: appView.height || '80%',
      footerHide: true,
      ...modalOption,
      ...options,
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
   * @date 2025-03-24 17:03:35
   * @param {string} appViewId
   * @param {MouseEvent} event
   * @param {IContext} context
   * @param {IParams} [params]
   * @param {(IPopoverOptions<FloatingUIConfig> & IOverlayContainerOptions)} [options={}]
   * @return {*}  {Promise<IModalData>}
   */
  async popover(
    appViewId: string,
    event: MouseEvent,
    context: IContext,
    params?: IParams,
    options: IPopoverOptions<FloatingUIConfig> & IOverlayContainerOptions = {},
  ): Promise<IModalData> {
    const appView = await ibiz.hub.config.view.get(appViewId!);
    // 设置默认的modal参数
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
   * @date 2025-03-24 17:03:59
   * @param {string} appViewId
   * @param {IContext} context
   * @param {IParams} [params]
   * @param {IOverlayContainerOptions} [options={}]
   * @return {*}  {Promise<IModalData>}
   */
  async drawer(
    appViewId: string,
    context: IContext,
    params?: IParams,
    options: IOverlayContainerOptions = {},
  ): Promise<IModalData> {
    const appView = await ibiz.hub.config.view.get(appViewId!);
    const placement = getDrawerPlacement(appView.openMode!);

    // 设置默认的modal参数
    const drawerOption = JSON.parse(ibiz.config.common.drawerOption || '{}');
    const opts = {
      width: appView.width,
      height: appView.height,
      placement,
      ...drawerOption,
      ...options,
      ...appView.modalOption,
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
    params?: IParams,
  ): Promise<IModalData> {
    const appView = await ibiz.hub.config.view.get(appViewId!);
    ibiz.log.warn('openUserCustom', appView, context, params);
    throw new Error();
  }

  /**
   * 抽屉打开视图
   *
   * @author lxm
   * @date 2022-09-15 15:09:50
   * @param {string} appViewId
   * @param {(IContext)} [context]
   * @param {(IParams)} [params]
   * @returns {*}  {Promise<IModalData>}
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
    window.open(`${UrlHelper.routeBase}${path}`, '_blank');
  }
}
