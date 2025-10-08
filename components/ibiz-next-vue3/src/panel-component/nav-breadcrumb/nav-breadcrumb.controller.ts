/* eslint-disable array-callback-return */
import {
  AppMenuController,
  IAppMenuController,
  PanelItemController,
} from '@ibiz-template/runtime';
import { isNil, reject } from 'ramda';
import { IAppFunc, IPanelRawItem } from '@ibiz/model-core';
import {
  route2routePath,
  routePath2string,
  IRoutePath,
  IRoutePathNode,
} from '@ibiz-template/vue3-util';
import { Router } from 'vue-router';
import { notNilEmpty } from 'qx-util';
import { BreadcrumbMsg, NavBreadcrumbState } from './nav-breadcrumb.state';
import { NavBreadcrumbService } from './nav-breadcrumb.service';
import {
  getAppFuncByViewName,
  getAppIndexViewName,
  getCurViewName,
  getIndexBreadcrumb,
  getMenuItemByTag,
  getMenuItemsByAppFunc,
  getMenuTag,
  getViewInfoByViewStack,
} from './nav-breadcrumb.util';
import { NavPosIndexController } from '../nav-pos-index';

/**
 * @description 面包屑控制器
 * @export
 * @class NavBreadcrumbController
 * @extends {PanelItemController<IPanelRawItem>}
 */
export class NavBreadcrumbController extends PanelItemController<IPanelRawItem> {
  declare state: NavBreadcrumbState;

  protected createState(): NavBreadcrumbState {
    return new NavBreadcrumbState(this.parent?.state);
  }

  /**
   * @description 面包屑分割符
   * @exposedoc
   * @type {string}
   * @memberof NavBreadcrumbController
   */
  separator: string = '/';

  /**
   * @description 导航模式，路由模式：根据路由计算导航数据，菜单模式：根据菜单模型计算导航数据，缓存模式：根据缓存计算导航数据
   * @exposedoc
   * @type {('router' | 'menu' | 'store')}
   * @memberof NavBreadcrumbController
   */
  navMode: 'router' | 'menu' | 'store' = 'router';

  /**
   * @description 是否显示应用标题
   * @exposedoc
   * @type {boolean}
   * @memberof NavBreadcrumbController
   */
  showHome: boolean = true;

  /**
   * @description 面包屑服务
   * @type {NavBreadcrumbService}
   * @memberof NavBreadcrumbController
   */
  service!: NavBreadcrumbService;

  /**
   * @description 自定义补充参数
   * @exposedoc
   * @type {IData}
   * @memberof NavBreadcrumbController
   */
  rawItemParams: IData = {};

  /**
   * @description 应用菜单控制器
   * @exposedoc
   * @readonly
   * @type {(IAppMenuController | undefined)}
   * @memberof NavBreadcrumbController
   */
  get appmenu(): IAppMenuController | undefined {
    return this.panel.view.getController('appmenu') as IAppMenuController;
  }

  /**
   * @description 首页导航占位控制器
   * @readonly
   * @exposedoc
   * @type {(NavPosIndexController | undefined)}
   * @memberof NavBreadcrumbController
   */
  get navPos(): NavPosIndexController | undefined {
    return this.panel.panelItems.nav_pos_index as NavPosIndexController;
  }

  protected async onInit(): Promise<void> {
    await super.onInit();
    this.handleRawItemParams();
    this.navMode = this.rawItemParams.navmode || 'router';
    this.separator = this.rawItemParams.separator || '/';
    this.showHome = this.rawItemParams.showhome === 'true';
    this.service = new NavBreadcrumbService(this.navMode, this.panel.context);
  }

  /**
   * @description 初始化
   * @param {Router} router
   * @memberof NavBreadcrumbController
   */
  onCreated(router: Router): void {
    // 初始化时根据路由获取菜单模型，算出导航数据
    if (this.navMode === 'menu') {
      this.setBreadcrumbByMenu(router);
    }
    // 缓存模式初始化时，获取缓存数据，如果不存在缓存数据，则更加路由计算出导航数据
    if (this.navMode === 'store') {
      this.setBreadcrumbByStore(router);
    }
  }

  /**
   * @description 路由改变
   * @param {Router} router
   * @memberof NavBreadcrumbController
   */
  onRouteChange(router: Router): void {
    // 路由模式：根据路由计算导航数据
    if (this.navMode === 'router') {
      this.setBreadcrumbByRouter(router);
      return;
    }
    if (this.navMode === 'store') {
      const { currentRoute } = router;
      const routePath: IRoutePath = route2routePath(currentRoute.value);
      const fullPath = currentRoute.value.fullPath;
      const viewName = getCurViewName(router);
      const menuTag = getMenuTag(routePath.pathNodes);
      // 缓存模式：点击面包屑时或者浏览器路由返回，会存在缓存数据，此时需将缓存数据项后续数据删除
      const chacheItem = this.service.getItem({ fullPath, viewName });
      const indexViewName = getAppIndexViewName(this.panel.context);
      if (chacheItem) {
        // 首页特殊处理
        if (chacheItem.viewName === indexViewName) {
          this.service.setChache([
            { ...getIndexBreadcrumb(this.panel.context), fullPath },
          ]);
          this.resetBreadcrumbs();
          return;
        }
        this.service.update({ ...chacheItem, fullPath });
        const removeItems = this.service.removeAfter(fullPath);
        removeItems.forEach(item => {
          this.navPos?.removeCache(item.fullPath);
        });
        this.resetBreadcrumbs();
      } else if (this.state.menuTag !== menuTag) {
        // 菜单标识变更时重置缓存
        this.setBreadcrumbByRouter(router);
      } else {
        this.service.add({ viewName, fullPath, type: 'default' });
      }
      this.state.menuTag = menuTag;
    }
  }

  /**
   * @description 重置面包屑数据
   * @memberof NavBreadcrumbController
   */
  resetBreadcrumbs(): void {
    this.state.breadcrumbItems = this.service.getChache();
  }

  /**
   * @description 更新视图信息
   * @param {string} fullPath
   * @param {{ viewName: string; caption?: string; dataInfo?: string }} info
   * @return {*}  {void}
   * @memberof NavBreadcrumbController
   */
  updateViewInfo(
    fullPath: string,
    info: { viewName: string; caption?: string; dataInfo?: string },
  ): void {
    // 菜单模式不更新
    if (this.navMode === 'menu') {
      return;
    }
    // 路由模式：路由跳转时只存放视图codename，具体视图信息此时更新，且datainfo也是此时添加
    // 缓存模式：视图更新时，判断是否存在缓存数据项，存在则更新
    this.service.update({ fullPath, type: 'default', ...info });
    this.resetBreadcrumbs();
  }

  /**
   * @description 删除缓存数据
   * @param {string} fullPath
   * @memberof NavBreadcrumbController
   */
  removeCache(fullPath: string): void {
    this.service.remove(fullPath);
  }

  /**
   * @description 根据路由计算面包屑数据
   * @param {Router} router
   * @memberof NavBreadcrumbController
   */
  protected async setBreadcrumbByRouter(router: Router): Promise<void> {
    const { currentRoute } = router;
    const routePath: IRoutePath = route2routePath(currentRoute.value);
    const { appContext = {}, pathNodes } = routePath;
    const menuTag = getMenuTag(pathNodes);
    let hasMenuItem = false;
    const menuData = await getMenuItemByTag(
      menuTag,
      this.appmenu!,
      this.panel.context,
    );
    const calcPathNodes = routePath.pathNodes.map(
      async (node: IRoutePathNode, index: number) => {
        if (this.appmenu && menuData && menuData.viewName === node.viewName) {
          hasMenuItem = true;
        }
        const fullPath = routePath2string({
          appContext,
          pathNodes: pathNodes.slice(0, index + 1),
        });
        const result: BreadcrumbMsg = {
          viewName: node.viewName,
          fullPath,
          type: 'default',
        };
        const chacheItem = this.service.getItem({ viewName: node.viewName });
        if (chacheItem) {
          if (!chacheItem.fullPath) {
            chacheItem.fullPath = fullPath;
          }
          Object.assign(result, chacheItem);
        }
        const viewInfo = getViewInfoByViewStack(
          node.viewName,
          this.panel.context,
        );
        if (viewInfo) {
          Object.assign(result, reject(isNil, viewInfo));
        }
        return result;
      },
    );
    const items = await Promise.all(calcPathNodes);
    // 路由模式下，存在菜单标识且不存在菜单视图时添加菜单项
    if (!hasMenuItem && menuData) {
      this.state.menuTag = menuData.tag;
      const item: BreadcrumbMsg = {
        viewName: menuData.viewName,
        caption: menuData.menuItem.caption,
        fullPath: '',
        type: 'menuItem',
        menuTag: menuData.tag,
      };
      items.splice(1, 0, item);
    }
    this.service.setChache(items);
    this.resetBreadcrumbs();
  }

  /**
   * @description 根据路由设置菜单面包屑导航数据
   * @param {Router} router
   * @memberof NavBreadcrumbController
   */
  protected setBreadcrumbByMenu(router: Router): void {
    const { currentRoute } = router;
    const routePath: IRoutePath = route2routePath(currentRoute.value);
    let appFunc: IAppFunc | undefined;
    routePath.pathNodes.some((item: IRoutePathNode, index: number) => {
      // 首页不参与计算
      if (index === 0) {
        return false;
      }
      const { viewName } = item;
      const func = getAppFuncByViewName(viewName, this.panel.context.srfappid);
      if (func) {
        appFunc = func;
      }
      return appFunc;
    });
    if (this.appmenu) {
      if (appFunc) {
        const menuItems = getMenuItemsByAppFunc(
          appFunc,
          this.appmenu.model.appMenuItems || [],
        );
        const items: BreadcrumbMsg[] = menuItems.map(item => {
          return {
            caption: item.caption,
            fullPath: '',
            type: 'default',
            viewName: item.id!,
          };
        });
        items.unshift(getIndexBreadcrumb(this.panel.context));
        this.service.setChache(items);
        this.resetBreadcrumbs();
      } else {
        // 未找到应用功能时只绘制首页
        this.service.setChache([getIndexBreadcrumb(this.panel.context)]);
        this.resetBreadcrumbs();
      }
      // 菜单模式：每次点击菜单都会重新计算导航数据
      this.appmenu.evt.on('onClick', (data: IData) => {
        const { event } = data;
        const items = event.map((key: string) => {
          const item = this.appmenu!.allAppMenuItems.find(x => x.id === key);
          if (item) {
            return {
              caption: item.caption,
              fullPath: '',
              viewName: item.id!,
            };
          }
        });
        items.unshift(getIndexBreadcrumb(this.panel.context));
        this.service.setChache(items);
        this.resetBreadcrumbs();
      });
    }
  }

  /**
   * @description 设置缓存模式面包屑数据
   * @param {Router} router
   * @memberof NavBreadcrumbController
   */
  protected setBreadcrumbByStore(router: Router): void {
    const chache = this.service.getChache();
    if (chache.length === 0) {
      // 无缓存时，根据路由计算路径
      this.setBreadcrumbByRouter(router);
    } else {
      this.resetBreadcrumbs();
    }
    // 缓存模式点击菜单将重置面包屑
    if (this.appmenu) {
      this.appmenu.evt.on('onClick', async (data: IData) => {
        const { eventArg } = data;
        const menuData = await getMenuItemByTag(
          eventArg,
          this.appmenu!,
          this.panel.context,
        );
        if (menuData) {
          const { viewName, appFunc, viewConfig } = menuData;
          // 非分页打开不处理
          if (
            appFunc!.openMode !== 'INDEXVIEWTAB' ||
            (viewConfig &&
              viewConfig.openMode &&
              viewConfig.openMode !== 'INDEXVIEWTAB')
          ) {
            return;
          }
          const chacheItem = this.service.getItem({ viewName });
          const items: BreadcrumbMsg[] = [];
          if (chacheItem) {
            items.push(chacheItem);
          } else {
            items.push({
              viewName,
              fullPath: '',
              type: 'default',
            });
          }
          items.unshift(getIndexBreadcrumb(this.panel.context));
          this.service.setChache(items);
          this.resetBreadcrumbs();
        }
      });
    }
  }

  /**
   * @description 处理自定义补充参数
   * @protected
   * @memberof NavBreadcrumbController
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

  /**
   * @description 打开菜单项视图
   * @param {IData} item
   * @param {MouseEvent} event
   * @memberof NavBreadcrumbController
   */
  openMenuItemView(item: IData, event: MouseEvent): void {
    if (this.appmenu) {
      (this.appmenu as AppMenuController).onClickMenuItem(item.menuTag, event);
    }
  }
}
