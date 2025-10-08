import { notNilEmpty } from 'qx-util';
import {
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
import { NavPosIndexState } from './nav-pos-index.state';

/**
 * 导航占位控制器
 *
 * @export
 * @class NavPosIndexController
 * @extends {PanelItemController}
 */
export class NavPosIndexController extends PanelItemController<IPanelRawItem> {
  declare state: NavPosIndexState;

  /**
   * @description 导航视图的modal
   * @exposedoc
   * @type {{ [key: string]: IModal }}
   */
  viewModals: { [key: string]: IModal } = {};

  /**
   * @description router对象
   * @type {Router}
   */
  router?: Router;

  /**
   * @description 是否关闭后自动跳转上一个页面
   * @exposedoc
   * @type {boolean}
   */
  autoGoLast: boolean = true;

  /**
   * @description 自定义补充参数
   * @exposedoc
   * @type {IData}
   */
  rawItemParams: IData = {};

  /**
   * @description 无缓存
   * @exposedoc
   * @type {boolean}
   */
  noCache: boolean = false;

  protected createState(): NavPosIndexState {
    return new NavPosIndexState(this.parent?.state);
  }

  protected async onInit(): Promise<void> {
    await super.onInit();
    this.handleRawItemParams();
    this.noCache = this.rawItemParams.expcache === 'NO_CACHE';
  }

  setRouter(router: Router): void {
    this.router = router;
  }

  /**
   * @description 当前视图的路由层级，非路由模式不存在。
   * @exposedoc
   * @readonly
   */
  get routeDepth(): number | undefined {
    return this.panel.view.modal.routeDepth;
  }

  /**
   * @description 应用菜单控制器
   * @exposedoc
   * @readonly
   * @type {(IAppMenuController | undefined)}
   */
  get appmenu(): IAppMenuController | undefined {
    return this.panel.getController('appmenu') as IAppMenuController;
  }

  /**
   * @description 改变显示视图
   * @exposedoc
   * @param {string} key
   */
  changeView(key: string): void {
    const find = this.state.navViewMsgs[key];
    if (find?.fullPath) {
      this.router?.push(find.fullPath);
    }
  }

  /**
   * 路由变更,新视图进缓存并初始化，已有的就只切换。
   * @author lxm
   * @date 2023-05-25 03:07:07
   * @param {{ currentKey: string; fullPath: string }} { currentKey }
   * @return {*}
   */
  onRouteChange({
    currentKey,
    fullPath,
  }: {
    currentKey: string;
    fullPath: string;
  }): void {
    if (this.state.currentKey !== currentKey) {
      // currentKey变更时先切换
      this.state.currentKey = currentKey;
      // 已经在缓存里时，把上一次的路径还原了，这次的路由不处理
      if (this.state.cacheKeys.includes(currentKey)) {
        const lastFullPath = this.state.navViewMsgs[currentKey].fullPath!;
        this.router?.push({ path: lastFullPath });
      }
    }

    // 比监控视图层级低的路由跳转不做处理。
    if (currentKey === '') {
      return;
    }

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
   * @description 删除单个缓存
   * @exposedoc
   * @param {string} key
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
   * @description 清空缓存
   * @exposedoc
   */
  clearCache(): void {
    this.state.cacheKeys = [];
    this.viewModals = {};
  }

  /**
   * @description 关闭视图
   * @exposedoc
   * @param {string} keys
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
   * 自身的dismiss相关操作
   *
   * @author chitanda
   * @date 2023-07-12 22:07:09
   * @protected
   * @param {string} key
   * @param {IModalData} modal
   * @return {*}
   */
  protected dismiss(key: string, modal: IModalData): void {
    routerCallback.close(key, modal);

    this.removeCache(key);

    if (this.autoGoLast) {
      ibiz.platform.back();
    }
  }

  /**
   * @description 返回上一个页面或上一层空白路由
   * @exposedoc
   * @author lxm
   * @date 2023-05-25 06:46:27
   * @protected
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
   * 处理自定义补充参数 [{key:'name',value:'data'}] => {name:'data'}
   *
   * @author tony001
   * @date 2025-01-21 16:01:05
   * @protected
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
