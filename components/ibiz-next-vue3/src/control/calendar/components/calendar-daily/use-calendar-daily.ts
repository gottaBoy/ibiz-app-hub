/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable no-use-before-define */
/* eslint-disable no-shadow */
import { computed, ref, onBeforeUnmount } from 'vue';
import type { SetupContext, VNode } from 'vue';
import { IOverlayPopoverContainer } from '@ibiz-template/runtime';
import { Namespace } from '@ibiz-template/core';
import {
  CalendarDailyEmits,
  CalendarDailyProps,
  IEvent,
  IUIEvent,
  IUILegend,
} from '../interface';
import {
  checkDateRangeIncludes,
  createFollowElement,
  fade,
  followMouseMove,
  handleBkColor,
  handleEmit,
  handleTimeRange,
  isToday,
  openPopover,
  removeFollowElement,
} from '../util';

export const useCalendarDaily = (
  props: CalendarDailyProps,
  emit: SetupContext<CalendarDailyEmits>['emit'],
  _ns: Namespace,
) => {
  const drawData = ref<string[]>([]);
  const curTimeTimer = ref();
  const curTimeTop = ref(0);
  const curTimeVal = ref('00:00');
  const resizableHand = ref();
  const calendarDaily = ref();
  const legends = computed(() => props.legends || []);
  const multiple = computed(() => props.multiple === true);
  const selectedData = ref<IEvent[]>([]);

  // 记录初始鼠标位置和要改变大小的元素的初始大小
  let initialMouseY = 0;
  let initialHeight = 0;
  /**
   * @description 开始拖动，初始化节点数据
   * @param {DragEvent} event
   */
  const handleDragStart = (event: DragEvent) => {
    initialMouseY = (event as IParams).clientY;
    initialHeight = parseInt(
      window.getComputedStyle(resizableHand.value).height,
      10,
    );
  };

  /**
   * @description 处理拖动
   * @param {DragEvent} event
   */
  const handleDrag = (event: DragEvent) => {
    const heightChange: number =
      (event as IParams).clientY - initialMouseY + initialHeight;
    // 顶部拖动高度时增加最大高度限制
    if (heightChange < 320)
      resizableHand.value.style.height = `${heightChange}px`;
  };

  /**
   * @description 事件数据集合
   * @returns {IData}
   */
  const events = computed(() => {
    // eslint-disable-next-line no-use-before-define
    return computeUIEvents(
      props.events,
      props?.selectedDay,
      legends.value,
      calendarDaily.value,
    );
  });

  /**
   * @description 计算events数据
   * @param {IUIEvent[]} _events
   * @returns {IEvent[]}
   */
  const computeUIEvents = (
    _events: IUIEvent[],
    curDate: Date,
    _legends: IUILegend[],
    _calendarDaily: HTMLElement,
  ) => {
    const tempEvents: IUIEvent[] = [];
    const tempColors = new Map();
    let contentWidth = 0;
    if (_calendarDaily) {
      contentWidth = parseInt(
        window.getComputedStyle(_calendarDaily).width,
        10,
      );
    }
    // 排序处理事件显示顺序
    _events.sort((a: IUIEvent, b: IUIEvent) => {
      const beginTimeDifference =
        new Date(a.beginTime).getTime() - new Date(b.beginTime).getTime();
      let type;
      if (beginTimeDifference === 0) {
        type = new Date(a.endTime).getTime() - new Date(b.endTime).getTime();
      } else {
        type = beginTimeDifference;
      }
      return type;
    });
    // 过滤数组
    const tempArray: IUIEvent[] = [];
    _events.forEach((event: IUIEvent) => {
      const targetLegend = _legends.find((legendItem: IUILegend) =>
        Object.is(legendItem.id, event.itemType),
      );
      // 图例过滤
      if (!targetLegend || !targetLegend.isShow) return;
      if (
        event &&
        event.beginTime &&
        checkDateRangeIncludes(event.beginTime, event.endTime, curDate)
      ) {
        const item = { ...event, targetLegend } as IUIEvent;
        const targetEvent = selectedData.value.find(
          (tempItem: IUIEvent) => tempItem.id === event.id,
        );
        // 判断事件是否默认选中
        if (targetEvent) {
          Object.assign(item, { isSelectedEvent: true });
        } else {
          Object.assign(item, { isSelectedEvent: false });
        }
        // 如果没有结束时间，默认赋值开始时间
        if (!event.endTime && event.beginTime) {
          Object.assign(item, { endTime: event.beginTime });
        }
        tempArray.push(item);
      }
    });
    // 处理绘制需要的UI参数
    tempArray.forEach((event: IUIEvent, index: number) => {
      const { targetLegend } = event;
      const tempItem = {} as IUIEvent;
      Object.assign(tempItem, event);
      Object.assign(tempItem, { zIndex: index + 1 });
      const length = tempArray.length;
      const itemWidth = (contentWidth - 90) / length;
      // 计算宽度
      const percentage: number = Number((100 / length).toFixed(3));
      let width = `${percentage}%`;
      // 计算定位
      let styleLeft = `${index * percentage}%`;
      if (itemWidth < 100) {
        width = '100px';
        styleLeft = `${index * 100}px`;
      }
      Object.assign(tempItem, { width, styleLeft });

      // 计算高度定位及显示时间范围
      let height: string | number = 'auto';
      let styleTop = 60;
      const timeRange = handleTimeRange(
        event.beginTime,
        event.endTime,
        'YYYY-MM-DD HH:mm:ss',
      );
      if (isToday(event.beginTime, event.endTime)) {
        height = getEventHeight(event.beginTime, event.endTime);
        const tempVal = handleTopOrCurVal(new Date(event.beginTime));
        styleTop = tempVal.styleTop;
      } else if (
        isToday(event.beginTime, curDate) &&
        !isToday(event.endTime, curDate)
      ) {
        const endDate = new Date(curDate);
        endDate.setHours(23, 59, 59, 0);
        height = getEventHeight(event.beginTime, endDate);
        const tempVal = handleTopOrCurVal(new Date(event.beginTime));
        styleTop = tempVal.styleTop;
      } else if (
        isToday(event.endTime, curDate) &&
        !isToday(event.beginTime, curDate)
      ) {
        const beginDate = new Date(curDate);
        beginDate.setHours(0, 0, 0, 0);
        height = getEventHeight(beginDate, event.endTime);
        const tempVal = handleTopOrCurVal(new Date(beginDate));
        styleTop = tempVal.styleTop;
      } else {
        const date = new Date(curDate);
        const beginDate = new Date(date.setHours(0, 0, 0, 0));
        const endDate = new Date(date.setHours(23, 59, 59, 59));
        height = getEventHeight(beginDate, endDate);
        const tempVal = handleTopOrCurVal(new Date(beginDate));
        styleTop = tempVal.styleTop;
      }
      Object.assign(tempItem, { height, styleTop, timeRange });
      if (!event?.bkColor) {
        const bkColor =
          (targetLegend && targetLegend.bkcolor) ||
          handleBkColor(tempColors, event.itemType);
        Object.assign(tempItem, { bkColor });
      }
      if (tempItem.bkColor) {
        const tempBkColor = fade(tempItem.bkColor, 10);
        Object.assign(tempItem, {
          bkColorFade: tempBkColor,
        });
      }
      if (!event?.color) {
        const tempColor = targetLegend && targetLegend.color;
        Object.assign(tempItem, {
          color: tempColor,
        });
      }
      // 计算边框显示
      if (tempItem?.height && (tempItem as IParams)?.height > 10) {
        const border = '1px solid #FFF';
        Object.assign(tempItem, { border });
      } else {
        Object.assign(tempItem, { border: 'none' });
      }
      // 图例过滤
      tempEvents.push(tempItem);
    });
    tempColors.clear();
    return tempEvents;
  };

  /**
   * @description 获取事件卡片展示高度
   * @param {string | Date} startTime
   * @param {string | Date} endTime
   * @returns {number}
   */
  const getEventHeight = (startTime: string | Date, endTime: string | Date) => {
    let height: string | number = 1;
    if (isToday(startTime, endTime)) {
      const difference =
        new Date(endTime).getTime() - new Date(startTime).getTime();
      height = Math.floor(difference / (1000 * 60));
    }
    if (height < 30) {
      height = 'auto';
    }
    return height;
  };

  /**
   * @description 处理定位高度及当前时间显示值
   * @param {Date} date
   * @returns {{number, string}} {styleTop, timeVal}
   */
  const handleTopOrCurVal = (date: Date) => {
    const currentHours = date.getHours();
    const currentMinutes = date.getMinutes();
    const hours = String(currentHours).padStart(2, '0');
    const minutes = String(currentMinutes).padStart(2, '0');
    let styleTop;
    let timeVal;
    if (currentHours === 0 && currentMinutes === 0) {
      styleTop = 0;
      timeVal = '00:00';
    } else {
      const topVal = currentHours * 60 + currentMinutes;
      styleTop = topVal;
      timeVal = `${hours}:${minutes}`;
    }
    return { styleTop, timeVal };
  };

  /**
   * @description 处理当前时间显示内容及定位高度
   */
  const handleCurTime = () => {
    const { styleTop, timeVal } = handleTopOrCurVal(new Date());
    curTimeTop.value = styleTop;
    curTimeVal.value = timeVal;
  };

  /**
   * @description 初始化数据
   * @returns {string[]}
   */
  const initDrawData = () => {
    const tempDrawData = [];
    for (let i = 1; i < 24; i++) {
      const hours = String(i).padStart(2, '0');
      const timescale = `${hours}:00`;
      tempDrawData.push(timescale);
    }
    return tempDrawData;
  };

  /**
   * @description 事件点击
   * @param {IUIEvent} item
   * @param {string} location
   */
  const handleEventClick = (item: IUIEvent, location: string) => {
    const res = handleEmit(
      'eventClick',
      item,
      location,
      props.events,
      multiple.value,
      selectedData.value,
      emit,
    );
    const { tempSelectedData, isSelectedEvent } = res as IParams;
    if (!isSelectedEvent) {
      Object.assign(item, { isSelectedEvent });
    }
    selectedData.value = tempSelectedData;
  };

  /**
   * @description 事件点击
   * @param {IUIEvent} item
   * @param {string} location
   */
  const handleEventDblClick = (item: IUIEvent, location: string) => {
    const res = handleEmit(
      'eventDblClick',
      item,
      location,
      props.events,
      multiple.value,
      selectedData.value,
      emit,
    );
    const { tempSelectedData, isSelectedEvent } = res as IParams;
    if (!isSelectedEvent) {
      Object.assign(item, { isSelectedEvent });
    }
    selectedData.value = tempSelectedData;
  };

  /**
   * @description 事件右键点击
   * @param {IUIEvent} item
   * @param {MouseEvent} evt
   * @param {string} location
   */
  const eventContextmenu = async (item: IUIEvent, evt: MouseEvent) => {
    emit('eventContextmenu', { evt, data: [item] });
  };

  // 处理事件气泡显示与隐藏
  const followElement: HTMLElement = createFollowElement();
  let overlay: IOverlayPopoverContainer | null = null;
  let eventLocation: string = '';

  /**
   * 日历内容区鼠标移动
   *
   * @param {MouseEvent} _event
   */
  const contentMousemove = (_event: MouseEvent) => {
    if (eventLocation === 'content' && overlay && followElement)
      followMouseMove(_event, followElement);
  };

  /**
   * 事件项上鼠标移入
   *
   * @param {MouseEvent} _event
   * @param {VNode} _component
   * @param {string} _location
   */
  const eventMouseenter = (
    _event: MouseEvent,
    _component: VNode,
    _location: string,
  ) => {
    if (!props.showDetail || overlay) {
      return;
    }
    const isContent = _location === 'content';
    eventLocation = _location;
    overlay = openPopover(
      _component,
      isContent ? followElement : (_event.target as HTMLElement),
      {
        placement: isContent ? 'right-start' : 'bottom',
        modalClass: _ns.e('event-popover'),
      },
    );
  };

  /**
   * 事件项上鼠标移出
   *
   * @return {*}
   */
  const eventMouseleave = (_e: MouseEvent): void => {
    overlay?.dismiss();
    overlay = null;
    eventLocation = '';
  };

  onBeforeUnmount(() => {
    removeFollowElement(followElement!);
  });

  return {
    drawData,
    curTimeTimer,
    curTimeTop,
    curTimeVal,
    events,
    resizableHand,
    calendarDaily,
    selectedData,
    handleCurTime,
    handleDrag,
    handleDragStart,
    handleEventClick,
    handleEventDblClick,
    eventContextmenu,
    initDrawData,
    contentMousemove,
    eventMouseenter,
    eventMouseleave,
  };
};
