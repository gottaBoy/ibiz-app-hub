import {
  ViewController,
  ICalendarViewEvent,
  ICalendarViewState,
  MDViewEngine,
  EventBase,
  IUIActionResult,
} from '@ibiz-template/runtime';
import { IAppDECalendarView } from '@ibiz/model-core';

export class CalendarViewEngine extends MDViewEngine {
  declare protected view: ViewController<
    IAppDECalendarView,
    ICalendarViewState,
    ICalendarViewEvent
  >;

  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  protected async onXDataActive(event: EventBase): Promise<void> {
    // 日历视图 opendata 逻辑由部件执行
  }

  async onCreated(): Promise<void> {
    super.onCreated();
    const { model } = this.view;
    if (!this.view.slotProps.calendar) {
      this.view.slotProps.calendar = {};
    }
    this.view.slotProps.calendar.mdctrlActiveMode = model.mdctrlActiveMode!;
  }

  protected async openData(args: {
    data: IData[];
    event?: MouseEvent;
    context?: IContext;
    params?: IParams;
  }): Promise<IUIActionResult> {
    const { data, event } = args;
    const result = await (this.xdataControl as IData).openData(data[0], event);
    return result;
  }

  protected async newData(args: {
    data: IData[];
    event?: MouseEvent;
  }): Promise<IUIActionResult> {
    const { data, event } = args;
    const result = await (this.xdataControl as IData).newData(data[0], event);
    return result;
  }
}
