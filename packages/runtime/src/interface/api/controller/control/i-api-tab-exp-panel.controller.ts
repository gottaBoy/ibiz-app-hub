import { ITabExpPanel } from '@ibiz/model-core';
import { IApiTabExpPanelState } from '../../state';
import { IApiControlController } from './i-api-control.controller';

/**
 * 分页导航面板
 * @description 采用 Tab 分页导航组件，支持动态路由加载、页面缓存及状态保持，实现高效的多视图切换与管理。
 * @primary
 * @export
 * @interface IApiTabExpPanelController
 * @extends {IApiControlController<T, S>}
 * @ctrlparams {"name":"expcache","title":"是否启用缓存","defaultvalue":"'DEFAULT'","parameterType":"'DEFAULT' | 'CACHE' | 'NO_CACHE'","description":"用于判断导航区占位中显示的导航视图是否缓存。有三种情况，'CACHE' 为缓存；'NO_CACHE' 为不缓存；'DEFAULT' 时匹配当前部件类型是否存在于全局配置参数`expCacheMode`中，存在则缓存，否则不缓存"}
 * @template T
 * @template S
 */
export interface IApiTabExpPanelController<
  T extends ITabExpPanel = ITabExpPanel,
  S extends IApiTabExpPanelState = IApiTabExpPanelState,
> extends IApiControlController<T, S> {
  /**
   * @description 刷新当前页面（会重新计算相关视图参数和上下文）
   * @memberof IApiTabExpPanelController
   */
  refresh(): void;

  /**
   * @description 设置激活项
   * @param {string} name 分页标识
   * @memberof IApiTabExpPanelController
   */
  setActive(name: string): void;
}
