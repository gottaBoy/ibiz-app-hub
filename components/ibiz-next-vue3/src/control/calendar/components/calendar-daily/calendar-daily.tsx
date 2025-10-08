/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { defineComponent, onMounted, onUnmounted, watch } from 'vue';
import { useNamespace } from '@ibiz-template/vue3-util';
import { showTitle } from '@ibiz-template/core';
import { IUIEvent, calendarDailyEmits, calendarDailyProps } from '../interface';
import { isToday } from '../util';
import { useCalendarDaily } from './use-calendar-daily';
import './calendar-daily.scss';

export const CalendarDaily = defineComponent({
  name: 'CalendarDaily',
  props: calendarDailyProps,
  emits: calendarDailyEmits,
  setup(props, { emit, slots }) {
    const ns = useNamespace('calendar-daily');
    const {
      drawData,
      curTimeTop,
      curTimeVal,
      resizableHand,
      events,
      curTimeTimer,
      calendarDaily,
      selectedData,
      handleEventClick,
      handleEventDblClick,
      handleDrag,
      handleDragStart,
      handleCurTime,
      initDrawData,
      eventContextmenu,
      contentMousemove,
      eventMouseenter,
      eventMouseleave,
    } = useCalendarDaily(props, emit, ns);

    watch(
      () => props.selectedData,
      () => {
        if (props.selectedData && props.selectedData.length > 0) {
          const data =
            props.selectedData.length > selectedData.value.length
              ? props.selectedData
              : selectedData.value;
          selectedData.value = data;
        } else {
          selectedData.value = [];
        }
      },
      { immediate: true, deep: true },
    );

    onMounted(() => {
      handleCurTime();
      drawData.value = initDrawData();
      curTimeTimer.value = setInterval(() => handleCurTime(), 1000);
    });

    onUnmounted(() => {
      const timer = curTimeTimer.value;
      if (timer) {
        clearInterval(timer);
        curTimeTimer.value = null;
      }
    });

    /**
     * 绘制事件项popover内容
     * @param {IUIEvent} _event 事件项数据
     */
    const renderPopoverContent = (_event: IUIEvent) => {
      // 适配弹框内详情不要背景色
      const _tempEvent = { ..._event, color: '', bkColor: '' };
      return (
        <div class={[ns.em('event-popover', 'body')]}>
          <div class={[ns.em('event-popover', 'scroll')]}>
            {slots?.event ? (
              slots.event?.({ data: _tempEvent })
            ) : (
              <div class={[ns.em('event-popover', 'content')]}>{`${
                _event.text || ''
              } ${_event.timeRange || ''}`}</div>
            )}
          </div>
        </div>
      );
    };

    /**
     * 绘制事件项
     * @param {string} location 绘制位置
     * @param {IParams} eventBoxStyle 事件容器中style样式
     * @param {IParams} eventContentStyle 事件内容区中style样式
     * @param {IUIEvent} event 事件项数据
     * @param {number} index 事件项下标
     * @param {string} slotNme 事件项插槽名字
     * @param {string} classEName 事件项绘制类名
     */
    const renderEventItem = (
      location: string,
      eventBoxStyle: IParams,
      eventContentStyle: IParams,
      event: IUIEvent,
      index: number,
      slotNme: string,
      classEName: string,
    ) => {
      let title = `${event.text || ''}`;
      // 适配内容区移入不显示时间范围提示
      if (location === 'header' && event.timeRange)
        title = `${title}     ${event.timeRange || ''}`;
      // 根据环境变量判断是否展示title
      title = showTitle(title) || '';
      // 如果配置了显示详情，则内容区不用显示快捷提示，提示由气泡展示
      if (props.showDetail) title = '';

      const component = renderPopoverContent(event);
      return (
        <div
          key={index}
          class={[ns.em(classEName, 'event-box')]}
          style={eventBoxStyle}
        >
          <button
            class={[
              ns.em(classEName, 'event-content'),
              event.isSelectedEvent ? 'is-selected-event' : '',
              event.classname,
            ]}
            onClick={() => {
              handleEventClick(event, 'head');
            }}
            onDblclick={() => {
              handleEventDblClick(event, 'head');
            }}
            onContextmenu={(e: MouseEvent) => eventContextmenu(event, e)}
            onMouseenter={(_e: MouseEvent) =>
              eventMouseenter(_e, component, location)
            }
            onMouseleave={eventMouseleave}
            style={eventContentStyle}
            title={title}
          >
            {slots[slotNme] ? (
              slots[slotNme]?.({ data: event })
            ) : (
              <div
                class={[ns.em(classEName, 'event-summary'), event.classname]}
              >
                {event.icon && (
                  <span
                    class={[event.icon, ns.em(classEName, 'event-icon')]}
                    style={{
                      color: event.bkColor,
                    }}
                  ></span>
                )}
                {event.text && (
                  <span class={[ns.em(classEName, 'event-name')]}>
                    {event.text}
                  </span>
                )}
              </div>
            )}
            {location === 'header' && event.isSelectedEvent ? (
              <span class={['fa fa-check', ns.em(classEName, 'check')]}></span>
            ) : (
              ''
            )}
          </button>
        </div>
      );
    };

    /**
     * 绘制头部
     */
    const renderHeader = () => {
      return (
        <div
          class={[ns.e('calendar-daily__head')]}
          ref={el => {
            resizableHand.value = el;
          }}
        >
          <div class={ns.e('allday-info')}>
            {ibiz.i18n.t('control.calendar.calendardaily.tip')}
          </div>
          <div class={ns.em('allday-info', 'work-items')}>
            <div class={ns.em('allday-info', 'work-items-scroll')}>
              <div class={ns.em('allday-info', 'work-items-body')}>
                {events.value.length > 0 ? (
                  events.value.map((event: IUIEvent, index: number) => {
                    const eventBoxStyle = {};
                    const eventContentStyle = {
                      background: event.bkColorFade,
                    };
                    return renderEventItem(
                      'header',
                      eventBoxStyle,
                      eventContentStyle,
                      event,
                      index,
                      'head-event',
                      'allday-info',
                    );
                  })
                ) : (
                  <iBizNoData hideNoDataImage={true} />
                )}
              </div>
            </div>
          </div>
          <div
            class={ns.e('resizable-handle')}
            draggable='true'
            onDrag={(event: DragEvent) => handleDrag(event)}
            onDragstart={(event: DragEvent) => handleDragStart(event)}
          >
            <div class={ns.e('allday-resize-line')}></div>
          </div>
        </div>
      );
    };

    /**
     * 绘制内容区
     */
    const renderContent = () => {
      return (
        <div class={[ns.e('scroll-area')]} onMousemove={contentMousemove}>
          <div class={ns.e('time-pane')}>
            <div class={ns.em('time-pane', 'time-labels')}>
              {drawData.value.map((timescale: string) => (
                <div key={timescale} class={[ns.em('time-pane', 'time-label')]}>
                  {timescale}
                </div>
              ))}
            </div>
            <div class={ns.em('time-pane', 'time-columns')}>
              {drawData.value.map((timescale: string, index: number) => (
                <div
                  key={timescale}
                  class={[
                    ns.em('time-pane', 'time-column'),
                    index === drawData.value.length - 1 &&
                      ns.em('time-pane', 'time-column-last'),
                  ]}
                ></div>
              ))}

              <div class={ns.em('time-pane', 'event-timed-container')}>
                <div class={ns.em('time-pane', 'container-scroll')}>
                  {events.value.map((event: IUIEvent, index: number) => {
                    const eventBoxStyle = {
                      top: `${event.styleTop}px`,
                      left: `${event.styleLeft}`,
                      height:
                        typeof event.height === 'number'
                          ? `${event.height}px`
                          : event.height,
                      width: `${event.width}`,
                      'z-index': event.zIndex,
                    };
                    if (typeof event.height === 'number') {
                      Object.assign(eventBoxStyle, {
                        'min-height': `${event.height}px`,
                      });
                    }
                    const eventContentStyle = {
                      background: event.bkColorFade,
                      'border-left': `3px solid ${event.bkColor}`,
                    };
                    return renderEventItem(
                      'content',
                      eventBoxStyle,
                      eventContentStyle,
                      event,
                      index,
                      '',
                      'time-pane',
                    );
                  })}
                </div>
              </div>
            </div>
            {isToday(props?.selectedDay, new Date()) ? (
              <div
                class={ns.em('time-pane', 'current-time')}
                style={{ top: `${curTimeTop.value}px` }}
              >
                <div class={ns.em('time-pane', 'current-time-label')}>
                  {curTimeVal.value}
                </div>
              </div>
            ) : (
              ''
            )}
          </div>
        </div>
      );
    };
    return {
      ns,
      calendarDaily,
      renderHeader,
      renderContent,
    };
  },
  render() {
    return (
      <div
        ref={el => {
          this.calendarDaily = el;
        }}
        class={this.ns.b()}
      >
        {this.renderHeader()}
        {this.renderContent()}
      </div>
    );
  },
});
