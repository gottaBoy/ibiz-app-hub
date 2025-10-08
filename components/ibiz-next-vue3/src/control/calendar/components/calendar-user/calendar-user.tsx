import { defineComponent, ref, watch } from 'vue';
import { useNamespace } from '@ibiz-template/vue3-util';
import { ICalendarItemData } from '@ibiz-template/runtime';
import { calendarUserProps, calendarUserEmits } from '../interface';
import {
  calcCurtimeEvents,
  calcCurWeek,
  getDayTime,
} from './use-calendar-user';
import './calendar-user.scss';

export const CalendarUser = defineComponent({
  name: 'CalendarUser',
  props: calendarUserProps,
  emits: calendarUserEmits,
  setup(props, { emit, slots }) {
    const ns = useNamespace('calendar-user');
    // 一周7天
    const weekday = ref<IData[]>([]);
    // 一天24个小时
    const timeList = ref<IData[]>([]);
    timeList.value = getDayTime();

    // 气泡框对应显示日期
    const popoverValue = ref('');

    // 气泡框
    const curPopover = ref<IData>();

    // 滚动容器
    const scrollContainerRef = ref();

    // 滚动高度
    const scrollTop = ref(0);
    // 滚动条滑块的高度
    const thumbHeight = ref(0);
    // 是否允许滚动
    const enableScroll = ref(false);
    // 上一次的鼠标位置
    const orginY = ref(0);
    // 内容实际高度
    const realHeight = ref(1);
    // 实际可视高度
    const visibleHeight = ref(1);
    // 是否出现滚动条
    const isScroll = ref(false);

    // 监听日期变化，重新计算本周时间
    watch(
      () => props.selectedDay,
      () => {
        if (props.selectedDay) {
          weekday.value = calcCurWeek(new Date(props.selectedDay));
        }
      },
      {
        immediate: true,
        deep: true,
      },
    );

    // 点击空白单元格
    const onBlackClick = () => {
      emit('eventClick', { data: [] });
    };

    // 绘制日历项
    const renderCalendarList = (items: ICalendarItemData[]) => {
      if (items.length === 0) {
        return <div class={ns.e('black')} onClick={onBlackClick}></div>;
      }
      if (items.length > 1) {
        return [
          slots.event?.({ data: items[0] }),
          <el-popover
            popper-class={ns.e('custom-user-popover')}
            trigger='click'
            ref={(el: IData) => {
              if (el && items[0].id === popoverValue.value) {
                curPopover.value = el;
              }
            }}
            onShow={() => {
              popoverValue.value = items[0].id;
            }}
          >
            {{
              reference: () => {
                return (
                  <span class={ns.b('more')}>{`+${
                    items.length - 1
                  } ${ibiz.i18n.t('app.more')}...`}</span>
                );
              },
              default: () => {
                return items.map(item => {
                  return slots.event?.({ data: item });
                });
              },
            }}
          </el-popover>,
        ];
      }
      return items.map(item => {
        return slots.event?.({ data: item });
      });
    };

    // 绘制单元格内事件
    const renderEvent = (_week: IData, _time?: IData) => {
      const events = calcCurtimeEvents(props.events, _week, _time);
      return renderCalendarList(events);
    };

    // 绘制顶部
    const renderWeekHeader = () => {
      return (
        <div class={ns.b('header')}>
          <div class={ns.be('header', 'time-item')}>
            <div
              class={[
                ns.e('cell'),
                ns.be('header', 'time-text'),
                ns.be('header', 'top'),
              ]}
            ></div>
            {weekday.value.map(item => {
              return (
                <div
                  class={[
                    ns.be('header', 'week-day'),
                    ns.e('cell'),
                    ns.be('header', 'top'),
                  ]}
                >
                  {item.text}
                  {item.date}
                </div>
              );
            })}
          </div>
          <div class={ns.be('header', 'time-item')}>
            <div class={[ns.e('cell'), ns.be('header', 'time-text')]}>全天</div>
            {weekday.value.map(item => {
              return (
                <div class={[ns.be('header', 'week-item'), ns.e('cell')]}>
                  {renderEvent(item)}
                </div>
              );
            })}
          </div>
        </div>
      );
    };

    /**
     * 鼠标滚动
     *
     * @param {MouseEvent} event
     */
    const onMouseMove = (event: MouseEvent) => {
      if (enableScroll.value) {
        const y = event.clientY - orginY.value;
        // 计算滚动条位置
        scrollTop.value += y;
        orginY.value = event.clientY;
        // 计算实际内容滚动位置
        if (scrollContainerRef.value) {
          scrollContainerRef.value.scrollTop =
            realHeight.value * (scrollTop.value / visibleHeight.value);
        }
      }
      event.preventDefault();
      event.stopPropagation();
    };

    /**
     * 鼠标放起
     *
     * @param {MouseEvent} event
     */
    const onMouseUp = (event: MouseEvent) => {
      enableScroll.value = false;
      event.preventDefault();
      event.stopPropagation();
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    /**
     * 鼠标按下
     *
     * @param {MouseEvent} event
     */
    const onMouseDown = (event: MouseEvent) => {
      orginY.value = event.clientY;
      enableScroll.value = true;
      event.preventDefault();
      event.stopPropagation();
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    /**
     * 绘制虚拟滚动条
     *
     */
    const renderScrollbar = () => {
      return (
        <div class={ns.b('scroll-bar')}>
          <div
            class={ns.be('scroll-bar', 'thumb')}
            onMousedown={onMouseDown}
          ></div>
        </div>
      );
    };

    /**
     * 滚动方法
     *
     * @param {Event} event
     */
    const onScroll = (event: Event) => {
      // 滚动的高度
      const realTop = (event.target as IData)?.scrollTop || 0;
      // 总体的内容高度
      realHeight.value = (event.target as IData)?.scrollHeight;
      // 可视高度
      visibleHeight.value = (event.target as IData)?.clientHeight;
      // 滚动比例
      const realRatio = realTop / realHeight.value;
      // 滚动条应该滚动高度
      scrollTop.value = realRatio * visibleHeight.value;
    };

    // 绘制内容
    const renderWeekContent = () => {
      return (
        <div
          class={ns.b('content')}
          style={{
            [`--${ns.namespace}-calendar-user-scroll-bar-thumb-height`]: `${thumbHeight.value}px`,
            [`--${ns.namespace}-calendar-user-scroll-bar-thumb-top`]: `${scrollTop.value}px`,
          }}
        >
          <div
            class={ns.be('content', 'wrapping')}
            ref={el => {
              scrollContainerRef.value = el;
            }}
            onScroll={onScroll}
          >
            {timeList.value.map(item => {
              return (
                <div class={ns.be('content', 'time-item')}>
                  <div class={[ns.be('content', 'time-text'), ns.e('cell')]}>
                    {item.text}
                  </div>
                  {weekday.value.map(day => {
                    return (
                      <div
                        class={[ns.be('content', 'week-item'), ns.e('cell')]}
                      >
                        {renderEvent(day, item)}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
          {isScroll.value && renderScrollbar()}
        </div>
      );
    };

    watch(
      () => scrollContainerRef.value,
      () => {
        if (scrollContainerRef.value) {
          realHeight.value = scrollContainerRef.value.scrollHeight;
          visibleHeight.value = scrollContainerRef.value.clientHeight;

          if (realHeight.value > visibleHeight.value) {
            isScroll.value = true;
          }
          thumbHeight.value =
            visibleHeight.value * (visibleHeight.value / realHeight.value);
        }
      },
      {
        immediate: true,
        deep: true,
      },
    );

    return { ns, renderWeekHeader, renderWeekContent };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        {this.renderWeekHeader()}
        {this.renderWeekContent()}
      </div>
    );
  },
});
