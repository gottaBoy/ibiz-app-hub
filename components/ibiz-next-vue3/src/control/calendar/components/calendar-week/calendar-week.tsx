/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { defineComponent, onMounted, onUnmounted, watch } from 'vue';
import { useNamespace } from '@ibiz-template/vue3-util';
import { showTitle } from '@ibiz-template/core';
import { IUIEvent, calendarWeekEmits, calendarWeekProps } from '../interface';
import { useCalendarWeek } from './use-calendar-week';
import './calendar-week.scss';

export const CalendarWeek = defineComponent({
  name: 'CalendarWeek',
  props: calendarWeekProps,
  emits: calendarWeekEmits,
  setup(props, { emit, slots }) {
    const ns = useNamespace('calendar-week');
    const {
      drawData,
      resizableHand,
      rows,
      weekDays,
      curTimeTimer,
      calendarWeek,
      selectedData,
      legends,
      rowsHeader,
      headerEventRef,
      thumbHeight,
      scrollTop,
      realHeight,
      isScroll,
      handleEventClick,
      handleEventDblClick,
      handleDrag,
      handleDragStart,
      handleDragEnd,
      handleCurTime,
      initDrawData,
      handleUIEvents,
      onScrollbarMouseDown,
      onHeaderEventScroll,
      initHeaderEventScroll,
      eventContextmenu,
      contentMousemove,
      eventMouseenter,
      eventMouseleave,
    } = useCalendarWeek(props, emit, ns);

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

    watch(
      () => props.legends,
      () => {
        legends.value = props.legends || [];
        handleUIEvents();
      },
      { immediate: true, deep: true },
    );

    watch(
      () => props.events,
      () => {
        handleUIEvents();
        initHeaderEventScroll();
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
     * 绘制虚拟滚动条
     *
     */
    const renderScrollbar = () => {
      return (
        <div class={ns.b('scroll-bar')}>
          <div
            class={ns.be('scroll-bar', 'thumb')}
            onMousedown={onScrollbarMouseDown}
          ></div>
        </div>
      );
    };

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
              ns.is('selected-event', !!event.isSelectedEvent),
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
          class={[ns.e('header')]}
          ref={el => {
            resizableHand.value = el;
          }}
        >
          <div class={[ns.em('header', 'dates')]}>
            <div class={[ns.em('header', 'date-cell-first')]}></div>
            {weekDays.value.map((weekDay: IParams) => (
              <div class={[ns.em('header', 'date-cell')]}>
                <div class={[ns.em('header', 'date-week')]}>
                  {weekDay.caption}
                </div>
                <div
                  class={[
                    ns.em('header', 'date-day'),
                    weekDay.isActivate ? 'is-today' : '',
                  ]}
                >
                  {weekDay.day}
                </div>
              </div>
            ))}
          </div>
          <div class={[ns.em('header', 'events')]}>
            <div class={[ns.em('header', 'event-cell-first')]}>
              {ibiz.i18n.t('control.calendar.calendardaily.tip')}
            </div>
            <div
              class={ns.em('header', 'event-container')}
              ref={el => {
                headerEventRef.value = el;
              }}
              onScroll={onHeaderEventScroll}
            >
              <div class={ns.em('header', 'container-scroll')}>
                {rowsHeader.value.map((item: IData) => (
                  <div class={[ns.em('header', 'event-cell')]}>
                    {item.map((event: IUIEvent, index: number) => {
                      const eventBoxStyle = {
                        top: `${Number(index * 26) + 2}px`,
                        left: `${event.styleLeft}`,
                        width: `${event?.width}`,
                      };
                      const eventContentStyle = {
                        background: event.bkColorFade,
                      };
                      if (!event.isShow) return '';

                      return renderEventItem(
                        'header',
                        eventBoxStyle,
                        eventContentStyle,
                        event,
                        index,
                        'head-event',
                        'header',
                      );
                    })}
                  </div>
                ))}
              </div>
              {isScroll.value && renderScrollbar()}
            </div>
          </div>
          <div
            class={ns.em('header', 'resizable-handle')}
            draggable='true'
            onDrag={(event: DragEvent) => handleDrag(event)}
            onDragstart={(event: DragEvent) => handleDragStart(event)}
            onDragend={() => handleDragEnd()}
          >
            <div class={ns.em('header', 'resize-line')}></div>
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
            {rows.value.map((item: IData) => (
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
                    {item.map((event: IUIEvent, index: number) => {
                      const eventBoxStyle = {
                        top: `${event.styleTop}px`,
                        left: `${event.styleLeft}`,
                        height:
                          typeof event.height === 'number'
                            ? `${event.height}px`
                            : event.height,
                        width: `${event.width}`,
                        'min-height': `${
                          event.height && event.height > 30 ? event.height : 30
                        }px`,
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
            ))}
          </div>
        </div>
      );
    };
    return {
      ns,
      thumbHeight,
      calendarWeek,
      scrollTop,
      realHeight,
      headerEventRef,
      renderHeader,
      renderContent,
    };
  },
  render() {
    return (
      <div
        ref={el => {
          this.calendarWeek = el;
        }}
        class={this.ns.b()}
        style={{
          [`${this.ns.cssVarBlockName(
            'header-event-scroll-bar-thumb-height',
          )}`]: `${this.thumbHeight}px`,
          [`${this.ns.cssVarBlockName('header-event-scroll-bar-thumb-top')}`]: `${this.scrollTop}px`,
          [`${this.ns.cssVarBlockName('header-event-scroll-real-height')}`]: `${this.realHeight}px`,
        }}
      >
        {this.renderHeader()}
        {this.renderContent()}
      </div>
    );
  },
});
