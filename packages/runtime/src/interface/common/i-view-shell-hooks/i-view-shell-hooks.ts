import { AsyncSeriesHook } from 'qx-util';
import { EventBase } from '../../controller';

type Hooks = {
  /**
   * @description 视图创建完成
   * @type {AsyncSeriesHook<[], EventBase>}
   */
  viewCreated: AsyncSeriesHook<[], EventBase>;
  /**
   * @description 视图加载完成
   * @type {AsyncSeriesHook<[], EventBase>}
   */
  viewMounted: AsyncSeriesHook<[], EventBase>;
  /**
   * @description 视图销毁完成
   * @type {AsyncSeriesHook<[], EventBase>}
   */
  viewDestroyed: AsyncSeriesHook<[], EventBase>;
};

/**
 * 视图壳操作对象，在以模态等形式打开视图时，操作类需给视图壳注入此对象实现类
 *
 * @export
 * @interface IViewShellHooks
 */
export interface IViewShellHooks {
  /**
   * 钩子
   * @type {Hooks}
   */
  hooks: Hooks;
}
