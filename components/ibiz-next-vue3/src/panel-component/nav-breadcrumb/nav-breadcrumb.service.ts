import { clone, isNil, reject } from 'ramda';
import { BreadcrumbMsg } from './nav-breadcrumb.state';
import { getAppIndexViewName, getIndexBreadcrumb } from './nav-breadcrumb.util';

/**
 * @description 面包屑服务
 * @export
 * @class NavBreadcrumbService
 */
export class NavBreadcrumbService {
  /**
   * @description 面包屑堆栈
   * @private
   * @type {BreadcrumbMsg[]}
   * @memberof NavBreadcrumbService
   */
  private chache: BreadcrumbMsg[] = [];

  constructor(
    public readonly navMode: 'router' | 'menu' | 'store',
    private context: IContext,
  ) {}

  /**
   * @description 添加缓存项
   * @param {BreadcrumbMsg} item
   * @memberof NavBreadcrumbService
   */
  add(item: BreadcrumbMsg): void {
    this.chache.push(item);
    this.chache = this.chache.filter(x => !x.isEmbed && !x.isModal);
    if (this.navMode === 'store') {
      localStorage.setItem('breadcrumb', JSON.stringify(this.chache));
    }
  }

  /**
   * @description 删除缓存项
   * @param {string} fullPath
   * @return {*}  {BreadcrumbMsg[]}
   * @memberof NavBreadcrumbService
   */
  remove(fullPath: string): BreadcrumbMsg[] {
    const index = this.chache.findIndex(x => x.fullPath === fullPath);
    if (index !== -1) {
      this.chache.splice(index, 1);
    }
    return clone(this.chache);
  }

  /**
   * @description 删除当前项之后缓存数据
   * @param {string} fullPath
   * @return {*}  {BreadcrumbMsg[]}
   * @memberof NavBreadcrumbService
   */
  removeAfter(fullPath: string): BreadcrumbMsg[] {
    if (this.chache.length === 0) {
      return [];
    }
    const index = this.chache.findIndex(x => x.fullPath === fullPath);
    if (index !== -1) {
      const result = this.chache.splice(index + 1, this.chache.length);
      if (this.navMode === 'store') {
        localStorage.setItem('breadcrumb', JSON.stringify(this.chache));
      }
      return result;
    }
    return [];
  }

  /**
   * @description 更新缓存数据
   * @param {BreadcrumbMsg} item
   * @memberof NavBreadcrumbService
   */
  update(item: BreadcrumbMsg): void {
    // 缓存模式先获取缓存数据
    if (!this.chache.length && this.navMode === 'store') {
      const result = localStorage.getItem('breadcrumb');
      if (result) {
        this.chache = JSON.parse(result);
      }
    }
    const index = this.chache.findIndex(
      x =>
        (x.fullPath && x.fullPath === item.fullPath) ||
        x.viewName.toLowerCase() === item.viewName.toLowerCase(),
    );
    if (index !== -1) {
      Object.assign(this.chache[index], reject(isNil, item));
      this.chache = this.chache.filter(x => !x.isEmbed && !x.isModal);
      if (this.navMode === 'store') {
        localStorage.setItem('breadcrumb', JSON.stringify(this.chache));
      }
    }
  }

  /**
   * @description 获取缓存数据项
   * @param {IData} data
   * @return {*}  {(BreadcrumbMsg | undefined)}
   * @memberof NavBreadcrumbService
   */
  getItem(data: IData): BreadcrumbMsg | undefined {
    // 首页视图特殊处理
    const { viewName = '', fullPath = '' } = data;
    const indexViewName = getAppIndexViewName(this.context);
    if (viewName === indexViewName) {
      return getIndexBreadcrumb(this.context);
    }
    const item = this.chache.find(
      x =>
        (fullPath && x.fullPath === fullPath) ||
        (viewName && x.viewName.toLowerCase() === viewName.toLowerCase()),
    );
    if (item) {
      return clone(item);
    }
  }

  /**
   * @description 获取缓存数据
   * @return {*}  {BreadcrumbMsg[]}
   * @memberof NavBreadcrumbService
   */
  getChache(): BreadcrumbMsg[] {
    if (this.navMode === 'store') {
      const result = localStorage.getItem('breadcrumb');
      if (result) {
        return JSON.parse(result);
      }
      return [];
    }
    if (this.navMode === 'router') {
      return clone(this.chache.filter(x => !x.isEmbed));
    }
    return clone(this.chache);
  }

  /**
   * @description 设置缓存数据
   * @param {BreadcrumbMsg[]} items
   * @memberof NavBreadcrumbService
   */
  setChache(items: BreadcrumbMsg[]): void {
    this.chache = clone(items);
    this.chache = this.chache.filter(x => !x.isEmbed && !x.isModal);
    if (this.navMode === 'store') {
      localStorage.setItem('breadcrumb', JSON.stringify(this.chache));
    }
  }
}
