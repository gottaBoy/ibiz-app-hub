import { defineComponent, SetupContext } from 'vue';
import dayjs from 'dayjs';
import { useNamespace } from '@ibiz-template/vue3-util';
import { showTitle } from '@ibiz-template/core';
import CalendarDaily from '../calendar-daily';
import CalendarWeek from '../calendar-week';
import CalendarUser from '../calendar-user';
import { useCustomCalendar, calcCurrentWeekRange } from './use-custom-calendar';
import './custom-calendar.scss';
import {
  CustomCalendarEmits,
  IUILegend,
  customCalendarEmits,
  customCalendarProps,
} from '../interface';

export const CustomCalendar = defineComponent({
  name: 'CustomCalendar',
  props: customCalendarProps,
  emits: customCalendarEmits,
  setup(props, { emit, slots }) {
    const ns = useNamespace('custom-calendar');
    const {
      date,
      events,
      shortcuts,
      viewType,
      validatedRange,
      realSelectedDay,
      curWeek,
      legends,
      multiple,
      selectedData,
      pickDay,
      handleEVentClick,
      handleEVentDblClick,
      handleEventContextmenu,
      selectDate,
      selectLegend,
    } = useCustomCalendar(
      props,
      emit as SetupContext<CustomCalendarEmits>['emit'],
      'custom-calendar',
    );

    /**
     * 绘制周
     */
    const renderWeek = () => {
      return (
        <div class={[ns.e('calendar-week')]}>
          {slots?.header ? (
            <div class={[ns.em('calendar-month', 'header')]}>
              {slots?.header?.({
                date: dayjs(realSelectedDay.value).format('YYYY-MM-DD'),
                legends: legends.value,
              })}
            </div>
          ) : (
            <div class={[ns.em('calendar-week', 'header')]}>
              <div class={ns.em('calendar-week', 'header-top')}>
                <div class={ns.em('calendar-week', 'title')}>
                  {props.calendarTitle || ibiz.i18n.t('control.calendar.title')}
                </div>
                <div class={ns.em('calendar-week', 'legend')}>
                  {legends.value.length > 1 &&
                    legends.value.map((item: IUILegend) => {
                      return (
                        <div
                          class={ns.em('calendar-week', 'legend-item')}
                          onClick={() => selectLegend(item)}
                        >
                          <div
                            class={ns.em('calendar-week', 'legend-item-tip')}
                            style={{
                              background: item.isShow
                                ? item.bkcolor
                                : `var(${ns.cssVarName('color-disabled-bg')})`,
                            }}
                          ></div>
                          <div
                            class={ns.em('calendar-week', 'legend-item-text')}
                            title={showTitle(item.name)}
                          >
                            {item.name}
                          </div>
                        </div>
                      );
                    })}
                </div>
                <div class={ns.em('calendar-week', 'select-time')}>
                  <el-date-picker
                    v-model={realSelectedDay.value}
                    type='date'
                    placeholder='选择日期'
                    shortcuts={shortcuts}
                  />
                </div>
              </div>
            </div>
          )}
          <CalendarWeek
            selected-day={realSelectedDay.value}
            showDetail={props.showDetail}
            events={events.value}
            legends={legends.value}
            multiple={multiple.value}
            selectedData={selectedData.value}
            onEventClick={(value: IParams) => handleEVentClick(value)}
            onEventDblClick={(value: IParams) => handleEVentDblClick(value)}
            onEventContextmenu={(value: IParams) =>
              handleEventContextmenu(value)
            }
            v-slots={slots}
          ></CalendarWeek>
        </div>
      );
    };

    /**
     * 绘制全天
     */
    const renderDay = () => {
      return (
        <div class={[ns.e('calendar-week')]}>
          {slots?.header ? (
            <div class={[ns.em('calendar-month', 'header')]}>
              {slots?.header?.({
                date: dayjs(realSelectedDay.value).format('YYYY-MM-DD'),
                legends: legends.value,
              })}
            </div>
          ) : (
            <div class={[ns.em('calendar-week', 'header')]}>
              <div class={ns.em('calendar-week', 'header-top')}>
                <div class={ns.em('calendar-week', 'title')}>
                  {props.calendarTitle || ibiz.i18n.t('control.calendar.title')}
                </div>
                <div class={ns.em('calendar-week', 'legend')}>
                  {legends.value.length > 1 &&
                    legends.value.map((item: IUILegend) => {
                      return (
                        <div
                          class={ns.em('calendar-week', 'legend-item')}
                          onClick={() => selectLegend(item)}
                        >
                          <div
                            class={ns.em('calendar-week', 'legend-item-tip')}
                            style={{
                              background: item.isShow
                                ? item.bkcolor
                                : `var(${ns.cssVarName('color-disabled-bg')})`,
                            }}
                          ></div>
                          <div
                            class={ns.em('calendar-week', 'legend-item-text')}
                            title={showTitle(item.name)}
                          >
                            {item.name}
                          </div>
                        </div>
                      );
                    })}
                </div>
                <div class={ns.em('calendar-week', 'select-time')}>
                  <el-date-picker
                    v-model={realSelectedDay.value}
                    type='date'
                    placeholder={ibiz.i18n.t(
                      'control.calendar.calendardaily.selectdate',
                    )}
                    shortcuts={shortcuts}
                  />
                </div>
              </div>
              <div class={ns.em('calendar-week', 'text-secondary')}>
                {curWeek.value}
              </div>
            </div>
          )}
          <CalendarDaily
            selected-day={realSelectedDay.value}
            controller={props.controller}
            showDetail={props.showDetail}
            events={events.value}
            legends={legends.value}
            multiple={multiple.value}
            selectedData={selectedData.value}
            onEventClick={(value: IParams) => handleEVentClick(value)}
            onEventDblClick={(value: IParams) => handleEVentDblClick(value)}
            onEventContextmenu={(value: IParams) =>
              handleEventContextmenu(value)
            }
            v-slots={slots}
          ></CalendarDaily>
        </div>
      );
    };

    /**
     * 绘制用户自定义1
     *
     * @return {*}
     */
    const renderUser = () => {
      const weekRange = calcCurrentWeekRange(new Date(realSelectedDay.value));
      return (
        <div class={[ns.e('calendar-user')]}>
          <div class={[ns.e('calendar-user-header')]}>
            <div class={ns.em('calendar-user-header', 'left')}>
              {weekRange
                .map(_date => {
                  return dayjs(new Date(_date)).format('YYYY-MM-DD');
                })
                .join(' ~ ')}
            </div>
            <div class={ns.em('calendar-user-header', 'right')}>
              <el-date-picker
                type='week'
                clearable={false}
                popper-class={ns.em('calendar-user-header', 'date-picker')}
                v-model={realSelectedDay.value}
                class={ns.em('calendar-user-header', 'date-range')}
                placeholder={ibiz.i18n.t(
                  'control.calendar.calendarUser.selectWeekRange',
                )}
                format={ibiz.i18n.t('control.calendar.calendarUser.weekFormat')}
              ></el-date-picker>
            </div>
          </div>
          <CalendarUser
            selected-day={realSelectedDay.value}
            events={events.value}
            onEventClick={(value: IParams) => handleEVentClick(value)}
            onEventDblClick={(value: IParams) => handleEVentDblClick(value)}
            v-slots={slots}
          ></CalendarUser>
        </div>
      );
    };

    const renderContent = () => {
      switch (viewType.value) {
        case 'DAY':
          return renderDay();
        case 'WEEK':
          return renderWeek();
        case 'USER':
          return renderUser();
        default:
          return null;
      }
    };
    return {
      ns,
      date,
      validatedRange,
      pickDay,
      selectDate,
      renderContent,
    };
  },
  render() {
    return <div class={[this.ns.b()]}>{this.renderContent()}</div>;
  },
});
