import { IAppFunc, IAppMenuItem } from '@ibiz/model-core';
import { Router } from 'vue-router';
import {
  route2routePath,
  IRoutePath,
  IRoutePathNode,
} from '@ibiz-template/vue3-util';
import { IAppMenuController, RouteConst } from '@ibiz-template/runtime';
import { BreadcrumbMsg } from './nav-breadcrumb.state';

/**
 * @description 获取首页视图名称
 * @export
 * @param {IContext} context
 * @returns {*}  {string}
 */
export function getAppIndexViewName(context: IContext): string {
  const targetAppModel = ibiz.hub.getAppSourceModel(context.srfappid);
  if (targetAppModel.getDefaultPSAppIndexView) {
    const view = targetAppModel.getDefaultPSAppIndexView as IModel;
    const name = view.path.split('/').pop().replace('.json', '');
    return name;
  }
  return ibiz.hub.defaultAppIndexViewName;
}

/**
 * @description 获取首页导航信息
 * @export
 * @return {*}  {BreadcrumbMsg}
 */
export function getIndexBreadcrumb(context: IContext): BreadcrumbMsg {
  const app = ibiz.hub.getApp(context.srfappid);
  const caption = app.model.caption;
  const indexViewName = getAppIndexViewName(context);
  return {
    viewName: indexViewName,
    fullPath: '/',
    type: 'default',
    caption,
  };
}

/**
 * @description 根据视图名获取应用功能
 * @export
 * @param {string} name
 * @param {string} appid
 * @return {*}  {(IAppFunc | undefined)}
 */
export function getAppFuncByViewName(
  name: string,
  appid: string,
): IAppFunc | undefined {
  const app = ibiz.hub.getApp(appid);
  const appFuncs = app.model.appFuncs || [];
  const item = appFuncs.find(func => {
    const { appViewId = '' } = func;
    const viewName = appViewId.split('.').pop();
    return viewName?.toLowerCase() === name.toLowerCase();
  });
  return item;
}

/**
 * @description 根据应该功能获取菜单模型
 * @export
 * @param {IAppFunc} func
 * @param {IAppMenuItem[]} appMenuItems
 * @return {*}  {IAppMenuItem[]}
 */
export function getMenuItemsByAppFunc(
  func: IAppFunc,
  appMenuItems: IAppMenuItem[],
): IAppMenuItem[] {
  const result: IAppMenuItem[] = [];
  const findMenuItem = (
    menuItems: IAppMenuItem[],
  ): IAppMenuItem | undefined => {
    return menuItems.find(item => {
      if (item.appFuncId && item.appFuncId === func.id) {
        result.unshift(item);
        return true;
      }
      if (item.appMenuItems && item.appMenuItems.length > 0) {
        const menuItem = findMenuItem(item.appMenuItems);
        if (menuItem) {
          result.unshift(item);
          return true;
        }
      }
      return false;
    });
  };
  findMenuItem(appMenuItems);
  return result;
}

/**
 * @description 获取当前视图名称
 * @export
 * @param {Router} router
 * @return {*}  {string}
 */
export function getCurViewName(router: Router): string {
  const { currentRoute } = router;
  const routePath: IRoutePath = route2routePath(currentRoute.value);
  return routePath.pathNodes.pop()?.viewName || '';
}

/**
 * @description 从视图堆栈中查找视图信息
 * @export
 * @param {string} viewName
 * @return {*}  {(IData | undefined)}
 */
export function getViewInfoByViewStack(
  viewName: string,
  context: IContext,
): IData | undefined {
  if (viewName === RouteConst.ROUTE_MODAL_TAG) {
    return {
      viewName,
      fullPath: '',
      isModal: true,
    };
  }
  const view = ibiz.appUtil.viewCacheCenter.get(viewName);
  const indexViewName = getAppIndexViewName(context);
  if (view) {
    // 识别嵌入视图
    let isEmbed = false;
    if (view.parentView && view.parentView.model.codeName !== indexViewName) {
      isEmbed = true;
    }
    const data = view.state.srfactiveviewdata;
    const result = {
      viewName: view.model.codeName!,
      caption: view.model.caption,
      isEmbed,
    };
    if (data && data.srfkey) {
      Object.assign(result, { dataInfo: data.srfmajortext || '' });
    }
    return result;
  }
}

/**
 * @description 获取菜单标识
 * @export
 * @param {IRoutePathNode[]} pathNodes
 * @returns {*}  {string}
 */
export function getMenuTag(pathNodes: IRoutePathNode[]): string {
  if (pathNodes.length > 1) {
    return pathNodes[1].params?.srfmenuitem || '';
  }
  return '';
}

/**
 * @description 根据标识获取菜单数据
 * @export
 * @param {string} tag
 * @param {IAppMenuController} appMenu
 * @param {IContext} context
 * @returns {*}  {Promise<IData>}
 */
export async function getMenuItemByTag(
  tag: string,
  appMenu: IAppMenuController,
  context: IContext,
): Promise<IData | undefined> {
  if (!tag) {
    return;
  }
  const menuItem = appMenu.allAppMenuItems.find(x => x.id === tag);
  if (menuItem) {
    const app = ibiz.hub.getApp(context.srfappid);
    const appFunc = app.getAppFunc(menuItem.appFuncId!);
    const viewName = appFunc!.appViewId?.split('.').pop() || '';
    const viewConfig = await ibiz.hub.config.view.get(viewName);
    return {
      tag,
      viewName,
      viewConfig,
      appFunc,
      menuItem,
    };
  }
}
