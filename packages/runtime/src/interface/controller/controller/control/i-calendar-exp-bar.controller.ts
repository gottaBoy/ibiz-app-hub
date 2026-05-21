import { ICalendarExpBar } from '@ibiz/model-core';
import { IExpBarControlController } from './i-exp-bar-control.controller';
import { ICalendarExpBarState } from '../../state';
import { ICalendarExpBarEvent } from '../../event';
import { IApiCalendarExpBarController } from '../../../api';
import { IViewController } from '../view';

/**
 * @description 日历导航栏部件控制器接口
 * @export
 * @interface ICalendarExpBarController
 * @extends {IExpBarControlController<ICalendarExpBar, ICalendarExpBarState, ICalendarExpBarEvent>}
 */
export interface ICalendarExpBarController
  extends IExpBarControlController<
      ICalendarExpBar,
      ICalendarExpBarState,
      ICalendarExpBarEvent
    >,
    IApiCalendarExpBarController<ICalendarExpBar, ICalendarExpBarState> {
  /**
   * @description 视图控制器
   * @type {IViewController}
   * @memberof ICalendarExpBarController
   */
  view: IViewController;
}
