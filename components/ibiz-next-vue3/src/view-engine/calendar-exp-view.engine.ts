import {
  ViewController,
  ICalendarExpViewEvent,
  ICalendarExpViewState,
} from '@ibiz-template/runtime';
import { IAppDECalendarExplorerView } from '@ibiz/model-core';
import { ExpViewEngine } from './exp-view.engine';

export class CalendarExpViewEngine extends ExpViewEngine {
  /**
   * 日历导航视图控制器
   *
   * @protected
   * @type {ViewController<
   *     IAppDECalendarExplorerView,
   *     ICalendarExpViewState,
   *     ICalendarExpViewEvent
   *   >}
   * @memberof CalendarExpViewEngine
   */
  declare protected view: ViewController<
    IAppDECalendarExplorerView,
    ICalendarExpViewState,
    ICalendarExpViewEvent
  >;

  /**
   * @description 导航栏部件名称
   * @readonly
   * @type {string}
   * @memberof CalendarExpViewEngine
   */
  get expBarName(): string {
    return 'calendarexpbar';
  }
}
