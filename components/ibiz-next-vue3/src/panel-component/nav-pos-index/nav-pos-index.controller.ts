import {
  EventBase,
  IAppMenuController,
  IModal,
  IModalData,
  Modal,
  PanelItemController,
  ViewMode,
} from '@ibiz-template/runtime';
import { routerCallback } from '@ibiz-template/vue3-util';
import { IPanelRawItem } from '@ibiz/model-core';
import { Router } from 'vue-router';
import { notNilEmpty } from 'qx-util';
import { NavTabsController } from '../nav-tabs/nav-tabs.controller';
import { NavPosIndexState } from './nav-pos-index.state';
import { NavBreadcrumbController } from '../nav-breadcrumb';

/**
 * @description 导航占位控制器
 * @export
 * @class NavPosIndexController
 * @extends {PanelItemController<IPanelRawItem>}
 */
export class NavPosIndexController extends PanelItemController<IPanelRawItem> {
  declare state: NavPosIndexState;

  /**
   * @exposedoc
   * @description 导航视图的modal
   * @type {{ [key: string]: IModal }}
   * @memberof NavPosIndexController
   */
  viewModals: { [key: string]: IModal } = {};

  /**
   * router对象
   * @author lxm
   * @date 2023-05-25 08:02:43
   * @type {Router}
   */
  router?: Router;

  /**
   * @exposedoc
   * @description 是否关闭后自动跳转上一个页面
   * @type {boolean}
   * @memberof NavPosIndexController
   */
  autoGoLast: boolean = true;

  /**
   * @exposedoc
   * @description 禁止缓存
   * @type {boolean}
   * @memberof NavPosIndexController
   */
  noCache: boolean = false;

  protected createState(): NavPosIndexState {
    return new NavPosIndexState(this.parent?.state);
  }

  setRouter(router: Router): void {
    this.router = router;
  }

  /**
   * @exposedoc
   * @description 当前视图的路由层级，非路由模式不存在
   * @readonly
   * @type {(number | undefined)}
   * @memberof NavPosIndexController
   */
  get routeDepth(): number | undefined {
    return this.panel.view.modal.routeDepth;
  }

  /**
   * @description 导航标签页控制器
   * @readonly
   * @type {(NavTabsController | undefined)}
   * @memberof NavPosIndexController
   */
  get navTabs(): NavTabsController | undefined {
    return this.panel.panelItems.nav_tabs as NavTabsController;
  }

  /**
   * @description 面包屑控制器
   * @readonly
   * @type {(NavBreadcrumbController | undefined)}
   * @memberof NavPosIndexController
   */
  get navBreadcrumb(): NavBreadcrumbController | undefined {
    return this.panel.panelItems.nav_breadcrumb as NavBreadcrumbController;
  }

  /**
   * 应用菜单控制器
   * @author lxm
   * @date 2023-05-10 08:41:42
   * @readonly
   * @type {(IAppMenuController | undefined)}
   */
  get appmenu(): IAppMenuController | undefined {
    return this.panel.getController('appmenu') as IAppMenuController;
  }

  /**
   * @exposedoc
   * @description 面板项参数
   * @type {IData}
   * @memberof NavPosIndexController
   */
  rawItemParams: IData = {};

  /**
   * @exposedoc
   * @description 当前导航key
   * @type {string}
   * @memberof NavPosIndexController
   */
  currentKey: string = '';

  protected async onInit(): Promise<void> {
    await super.onInit();
    this.handleRawItemParams();
    this.noCache = this.rawItemParams.expcache === 'NO_CACHE';
  }

  /**
   * @exposedoc
   * @description 改变显示视图
   * @param {string} key
   * @memberof NavPosIndexController
   */
  changeView(key: string): void {
    const find = this.state.navViewMsgs[key];
    if (find?.fullPath) {
      this.router?.push(find.fullPath);
    }
  }

  /**
   * @description 路由变更,新视图进缓存并初始化，已有的就只切换。
   * @param {{
   *     currentKey: string;
   *     fullPath: string;
   *   }} {
   *     currentKey,
   *     fullPath,
   *   }
   * @returns {*}  {void}
   * @memberof NavPosIndexController
   */
  onRouteChange({
    currentKey,
    fullPath,
  }: {
    currentKey: string;
    fullPath: string;
  }): void {
    // currentKey是否变更，变更说明是首页下一级的页面切换
    const isCurrentKeyChange = this.state.currentKey !== currentKey;
    if (isCurrentKeyChange) {
      // 1.当从别的页面切换过来时
      // 2.且缓存里已经有当前视图的缓存
      // 3.且当前的跳转没有子级路由时，把上一次的路径还原了，这次的路由不处理
      if (
        this.state.cacheKeys.includes(currentKey) &&
        this.router &&
        this.router.currentRoute.value.matched.length === this.routeDepth! + 1
      ) {
        const lastFullPath = this.state.navViewMsgs[currentKey].fullPath!;
        if (lastFullPath !== fullPath) {
          // 延时跳转，避免两次跳转间隔太快路由没反应
          setTimeout(() => {
            this.router!.replace({ path: lastFullPath });
          }, 0);
          return;
        }
      }

      // currentKey变更时先切换
      this.state.currentKey = currentKey;
      if (this.navTabs) {
        this.navTabs.state.currentKey = currentKey;
      }
    }

    // 比监控视图层级低的路由跳转不做缓存等处理
    if (currentKey === '') {
      return;
    }

    this.currentKey = currentKey;
    // *维护操作记录
    const index = this.state.operateSort.indexOf(currentKey);
    if (index !== -1) {
      // 记录里存在先删除
      this.state.operateSort.splice(index, 1);
    }
    // 往最后面添加当前key
    this.state.operateSort.push(currentKey);

    // *维护缓存
    if (!this.state.cacheKeys.includes(currentKey)) {
      // 缓存里没有的，加入缓存
      this.state.cacheKeys.push(currentKey);

      // 维护每个视图的modal
      if (this.routeDepth) {
        this.viewModals[currentKey] = new Modal({
          mode: ViewMode.ROUTE,
          viewUsage: 1,
          routeDepth: this.routeDepth + 1,
          dismiss: modal => {
            // 执行对应key的dismiss方法
            this.dismiss(currentKey, modal);
          },
        });
      }
    }

    // *维护导航视图信息
    if (this.state.navViewMsgs[currentKey]) {
      this.state.navViewMsgs[currentKey].fullPath = fullPath;
    } else {
      ibiz.log.debug('维护导航视图信息', currentKey, fullPath);
      this.state.navViewMsgs[currentKey] = {
        key: currentKey,
        fullPath,
      };
      routerCallback.active(currentKey);
    }
  }

  /**
   * @description 监听视图创建，获取并监听视图控制器
   * @param {EventBase} event
   * @memberof NavPosIndexController
   */
  onViewCreated(event: EventBase): void {
    const { view } = event;
    const key = this.state.currentKey;
    const viewKey = `${view.model.codeName}-${view.id}`;
    if (this.navTabs) {
      this.navTabs.updateViewInfo(key, {
        viewKey,
        caption: view.model.caption,
        sysImage: view.model.sysImage,
      });
      // 监听这个视图的事件
      view.evt.on('onViewInfoChange', ({ caption, dataInfo }) => {
        this.navTabs!.updateViewInfo(key, { viewKey, caption, dataInfo });
      });
    }
    if (this.navBreadcrumb) {
      this.navBreadcrumb.updateViewInfo(key, {
        viewName: view.model.codeName!,
        caption: view.model.caption,
      });
      view.evt.on('onViewInfoChange', ({ caption, dataInfo }) => {
        this.navBreadcrumb!.updateViewInfo(key, {
          viewName: view.model.codeName!,
          caption,
          dataInfo,
        });
      });
      view.evt.on('onActivated', () => {
        const data = view.state.srfactiveviewdata;
        const info = {
          viewName: view.model.codeName!,
          caption: view.model.caption,
        };
        if (data && data.srfkey) {
          Object.assign(info, { dataInfo: data.srfmajortext || '' });
        }
        this.navBreadcrumb!.updateViewInfo(key, info);
      });
    }
  }

  /**
   * @exposedoc
   * @description 删除单个缓存
   * @param {string} key
   * @memberof NavPosIndexController
   */
  removeCache(key: string): void {
    const index = this.state.cacheKeys.indexOf(key);
    if (index !== -1) {
      this.state.cacheKeys.splice(index, 1);

      // 维护每个视图的modal
      delete this.viewModals[key];

      // 删除导航视图信息
      delete this.state.navViewMsgs[key];

      // 删除操作记录里的数据
      const operateIndex = this.state.operateSort.indexOf(key);
      if (operateIndex !== -1) {
        this.state.operateSort.splice(operateIndex, 1);
      }
    }
  }

  /**
   * @exposedoc
   * @description 清空缓存
   * @memberof NavPosIndexController
   */
  clearCache(): void {
    this.state.cacheKeys = [this.currentKey];
    this.viewModals = {};
  }

  /**
   * @exposedoc
   * @description 关闭视图
   * @param {string[]} keys
   * @returns {*}  {Promise<void>}
   * @memberof NavPosIndexController
   */
  async closeViewByKeys(keys: string[]): Promise<void> {
    // 这边可能会关闭多个，但只会回退一次，关闭自动回退，等最后结束之后回退。
    this.autoGoLast = false;
    for (let index = 0; index < keys.length; index++) {
      const key = keys[index];
      const modal = this.viewModals[key];
      // eslint-disable-next-line no-await-in-loop
      await modal.dismiss();
    }
    this.goLast();
    this.autoGoLast = true;
  }

  /**
   * @description 自身的dismiss相关操作
   * @protected
   * @param {string} key
   * @param {IModalData} modal
   * @memberof NavPosIndexController
   */
  protected dismiss(key: string, modal: IModalData): void {
    routerCallback.close(key, modal);

    // 分页存在的时候会去处理分页那边的删除
    if (this.navTabs) {
      this.navTabs.removeCache(key);
    }
    if (this.navBreadcrumb) {
      this.navBreadcrumb.removeCache(key);
    }
    this.removeCache(key);

    if (this.autoGoLast) {
      this.goLast();
    }
  }

  /**
   * @exposedoc
   * @description 返回上一个页面或上一层空白路由
   * @protected
   * @returns {*}  {void}
   * @memberof NavPosIndexController
   */
  protected goLast(): void {
    const lastKey = this.state.operateSort.pop();
    if (lastKey) {
      // 如果上一个视图是当前视图，则不跳转
      if (this.state.currentKey === lastKey) {
        this.state.operateSort.push(lastKey);
        return;
      }
      const fullPath = this.state.navViewMsgs[lastKey].fullPath;
      this.router!.push(fullPath!);
    } else {
      // 没有上一个视图时，跳转到当前层级的空白页面
      const route = this.router!.currentRoute.value;
      const { appContext } = route.params;
      let indexPath = `/${appContext}`;
      // 处理首页多层嵌套跳转当前首页空白页
      for (let index = 1; index <= this.routeDepth!; index++) {
        indexPath += `/${route.params[`view${index}`]}/${
          ibiz.env.routePlaceholder
        }`;
      }
      this.router!.push(indexPath);
      ibiz.util.setBrowserTitle('');
    }
  }

  /**
   * @description 处理自定义补充参数 [{key:'name',value:'data'}] => {name:'data'}
   * @protected
   * @memberof NavPosIndexController
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
