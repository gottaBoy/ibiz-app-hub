import {
  ViewController,
  ICalendarViewEvent,
  ICalendarViewState,
  MDViewEngine,
  ControlType,
} from '@ibiz-template/runtime';
import { IAppDECalendarView, ISysCalendar } from '@ibiz/model-core';

export class MobCalendarViewEngine extends MDViewEngine {
  declare protected view: ViewController<
    IAppDECalendarView,
    ICalendarViewState,
    ICalendarViewEvent
  >;

  async onCreated(): Promise<void> {
    await super.onCreated();
    const calendar = this.view.model.viewLayoutPanel?.controls?.find(
      control => control.controlType === ControlType.CALENDAR,
    ) as ISysCalendar | undefined;
    if (calendar && calendar.calendarStyle === 'TIMELINE') {
      return;
    }
    // 移动端日历默认不加载数据，而是由组件根据选中的日期分别加载当天数据与当月数据
    this.view.model.loadDefault = false;
  }
}
