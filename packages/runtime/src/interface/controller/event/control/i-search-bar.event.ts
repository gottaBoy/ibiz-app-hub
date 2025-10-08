import { EventBase } from '../argument';
import { IControlEvent } from './i-control.event';

/**
 * @description 搜索栏事件
 * @primary
 * @export
 * @interface ISearchBarEvent
 * @extends {IControlEvent}
 */
export interface ISearchBarEvent extends IControlEvent {
  /**
   * @description 搜索事件
   * @type {{
   *     event: EventBase;
   *     emitArgs: undefined;
   *   }}
   * @memberof ISearchBarEvent
   */
  onSearch: {
    event: EventBase;
    emitArgs: undefined;
  };

  /**
   * @description 重置事件
   *
   * @type {{
   *     event: EventBase;
   *     emitArgs: undefined;
   *   }}
   * @memberof ISearchBarEvent
   */
  onReset: {
    event: EventBase;
    emitArgs: undefined;
  };

  /**
   * @description 分页切换事件
   * @type {{
   *     event: EventBase;
   *     emitArgs: IData;
   *   }}
   * @memberof ISearchBarEvent
   */
  onTabChange: {
    event: EventBase;
    emitArgs: IData;
  };
}
