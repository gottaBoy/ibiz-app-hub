/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable no-shadow */
/* eslint-disable no-use-before-define */
import { computed, ref, watch, nextTick, onBeforeUnmount } from 'vue';
import type { SetupContext, VNode } from 'vue';
import { Namespace } from '@ibiz-template/core';
import { IOverlayPopoverContainer } from '@ibiz-template/runtime';
import {
  CalendarWeekEmits,
  CalendarWeekProps,
  IEvent,
  IUIEvent,
  IUILegend,
} from '../interface';
import {
  checkDateRangeIncludes,
  createFollowElement,
  fade,
  followMouseMove,
  getCurWeekDates,
  handleBkColor,
  handleEmit,
  handleTimeRange,
  isDateInCurWeek,
  isTimeGreaterThan,
  isToday,
  openPopover,
  removeFollowElement,
} from '../util';

export const useCalendarWeek = (
  props: CalendarWeekProps,
  emit: SetupContext<CalendarWeekEmits>['emit'],
  _ns: Namespace,
) => {
  const drawData = ref<string[]>([]);
  const curTimeTimer = ref();
  const curTimeTop = ref(1);
  const curTimeVal = ref('00:00');
  const resizableHand = ref();
  const calendarWeek = ref();
  const legends = ref();
  const multiple = computed(() => props.multiple === true);
  const selectedData = ref<IEvent[]>([]);
  const rows = ref<IData[]>([]);
  const rowsHeader = ref<IData[]>([]);
  const weekDays = ref<IData>([]);
  const popVisible = ref(true);

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
   * @description 处理拖动结束
   */
  const handleDragEnd = () => {
    initHeaderEventScroll();
  };

  /**
   * @description 获取两个时间范围内的所有时间
   * @
   */
  const getDateRanges = (firstDate: Date | string, lastDate: Date | string) => {
    const firstDay = new Date(firstDate);
    const targetDate = new Date(lastDate);
    const dateArray = [];
    firstDay.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);
    // 循环从开始时间到目标日期，将中间日期添加到数组中
    for (
      let currentDate = new Date(firstDay);
      currentDate <= targetDate;
      currentDate.setDate(currentDate.getDate() + 1)
    ) {
      dateArray.push(new Date(currentDate));
    }
    return dateArray;
  };

  /**
   * 处理事件项ui数据
   */
  const handleEventItemUIData = (
    _event: IUIEvent,
    _weekDay: IData,
    tempColors: IData,
    _length: number,
    _index: number,
  ) => {
    const tempEventContent = {} as IUIEvent;
    const { targetLegend } = _event;

    // 处理内容区的ui绘制数据
    Object.assign(tempEventContent, _event);
    Object.assign(tempEventContent, { zIndex: _index + 1 });
    // 计算宽度
    const percentage: number = Number((100 / _length).toFixed(3));
    const width = `${percentage}%`;
    // 计算定位
    const styleLeft = `${_index * percentage}%`;
    Object.assign(tempEventContent, { width, styleLeft });
    // 计算高度定位及显示时间范围
    let height: string | number = 'auto';
    let styleTop = 60;
    const timeRange = handleTimeRange(
      _event.beginTime,
      _event.endTime,
      'YYYY-MM-DD HH:mm:ss',
    );
    if (isToday(_event.beginTime, _event.endTime)) {
      height = getEventHeight(_event.beginTime, _event.endTime);
      const tempVal = handleTopOrCurVal(new Date(_event.beginTime));
      styleTop = tempVal.styleTop;
    } else if (
      isToday(_event.beginTime, _weekDay.date) &&
      !isToday(_event.endTime, _weekDay.date)
    ) {
      const endDate = new Date(_weekDay.date);
      endDate.setHours(23, 59, 59, 0);
      height = getEventHeight(_event.beginTime, endDate);
      const tempVal = handleTopOrCurVal(new Date(_event.beginTime));
      styleTop = tempVal.styleTop;
    } else if (
      isToday(_event.endTime, _weekDay.date) &&
      !isToday(_event.beginTime, _weekDay.date)
    ) {
      const beginDate = new Date(_weekDay.date);
      beginDate.setHours(0, 0, 0, 0);
      height = getEventHeight(beginDate, _event.endTime);
      const tempVal = handleTopOrCurVal(new Date(beginDate));
      styleTop = tempVal.styleTop;
    } else {
      const date = new Date(_weekDay.date);
      const beginDate = new Date(date.setHours(0, 0, 0, 0));
      const endDate = new Date(date.setHours(23, 59, 59, 59));
      height = getEventHeight(beginDate, endDate);
      const tempVal = handleTopOrCurVal(new Date(beginDate));
      styleTop = tempVal.styleTop;
    }
    Object.assign(tempEventContent, { height, styleTop, timeRange });
    if (!_event?.bkColor) {
      const bkColor =
        (targetLegend && targetLegend.bkcolor) ||
        handleBkColor(tempColors, _event.itemType);
      Object.assign(tempEventContent, { bkColor });
    }
    if (tempEventContent.bkColor) {
      const tempBkColor = fade(tempEventContent.bkColor, 10);
      Object.assign(tempEventContent, {
        bkColorFade: tempBkColor,
      });
    }
    if (!_event?.color) {
      const tempColor = targetLegend && targetLegend.color;
      Object.assign(tempEventContent, {
        color: tempColor,
      });
    }
    // 计算边框显示
    if (
      tempEventContent?.height &&
      (tempEventContent as IParams)?.height > 10
    ) {
      const border = '1px solid #FFF';
      Object.assign(tempEventContent, { border });
    } else {
      Object.assign(tempEventContent, { border: 'none' });
    }
    return tempEventContent;
  };

  /**
   * 处理头部事件项ui数据
   */
  const handleHeaderEventItemUIData = (
    _event: IUIEvent,
    _weekDay: IData,
    _firstDay: Date,
    _lastDay: Date,
    _length: number,
    _index: number,
    _hostIndex: number,
  ) => {
    const tempEventHeader = {};
    Object.assign(tempEventHeader, _event);
    Object.assign(tempEventHeader, {
      width: 0,
      styleLeft: 0,
    });
    // 计算宽度及left定位
    let headerEVentWidth: number | string = 0;
    let headerEventLeft: number | string = 0;
    if (
      isDateInCurWeek(_event.beginTime, _firstDay, _lastDay) &&
      isDateInCurWeek(_event.endTime, _firstDay, _lastDay)
    ) {
      const eventWidth = handleHeaderEventWidth(
        _event.beginTime,
        _event.endTime,
        _firstDay,
        _lastDay,
      );
      const eventLeft = handleHeaderEventLeft(
        _event.beginTime,
        _firstDay,
        _lastDay,
      );
      headerEVentWidth = `${eventWidth}%`;
      headerEventLeft = `${eventLeft}%`;
    } else if (
      isDateInCurWeek(_event.beginTime, _firstDay, _lastDay) &&
      !isDateInCurWeek(_event.endTime, _firstDay, _lastDay)
    ) {
      const eventWidth = handleHeaderEventWidth(
        _event.beginTime,
        _lastDay,
        _firstDay,
        _lastDay,
      );
      const eventLeft = handleHeaderEventLeft(
        _event.beginTime,
        _firstDay,
        _lastDay,
      );
      headerEVentWidth = `${eventWidth}%`;
      headerEventLeft = `${eventLeft}%`;
    } else if (
      isDateInCurWeek(_event.endTime, _firstDay, _lastDay) &&
      !isDateInCurWeek(_event.beginTime, _firstDay, _lastDay)
    ) {
      const eventWidth = handleHeaderEventWidth(
        _firstDay,
        _event.endTime,
        _firstDay,
        _lastDay,
      );
      headerEVentWidth = `${eventWidth}%`;
      headerEventLeft = `${0}%`;
    } else if (
      !isDateInCurWeek(_event.endTime, _firstDay, _lastDay) &&
      !isDateInCurWeek(_event.beginTime, _firstDay, _lastDay) &&
      isTimeGreaterThan(_firstDay, _event.beginTime) &&
      isTimeGreaterThan(_event.endTime, _firstDay)
    ) {
      const eventWidth = handleHeaderEventWidth(
        _firstDay,
        _lastDay,
        _firstDay,
        _lastDay,
      );
      headerEVentWidth = `${eventWidth}%`;
      headerEventLeft = `${0}%`;
    }
    Object.assign(tempEventHeader, {
      width: headerEVentWidth,
      styleLeft: headerEventLeft,
    });
    // 判断事件开始时间是否在当前周，或者当前周为0时才显示
    let eventHeaderIsShow = false;
    if (
      isDateInCurWeek(_event.beginTime, _firstDay, _lastDay) &&
      isToday(_event.beginTime, _weekDay.date)
    ) {
      eventHeaderIsShow = true;
    } else if (_hostIndex === 0) {
      eventHeaderIsShow = true;
    }
    const _curDate = new Date(_weekDay.date);
    // 当前绘制的时间, 不在开始与结束时间范围内, 则不显示
    if (!checkDateRangeIncludes(_event.beginTime, _event.endTime, _curDate)) {
      eventHeaderIsShow = false;
    }
    Object.assign(tempEventHeader, {
      isShow: eventHeaderIsShow,
    });

    return tempEventHeader;
  };

  /**
   * @description 计算events数据
   */
  const handleUIEvents = () => {
    const events = props.events;
    const curDate = props?.selectedDay;
    const tempColors = new Map();
    const { firstDay, lastDay } = getCurWeekDates(curDate);
    // 初始化二维数组数据
    const tempArray: IData[] = [];
    const tempHeaderArray: IData[] = [];
    const tempEvents: IData[] = [];
    const tempRowsHeader: IData[] = [];
    weekDays.value = [];
    for (let i = 0; i < 7; i++) {
      const addDay = i;
      const dayValue = firstDay.getDate() + addDay;
      const date = new Date(
        firstDay.getFullYear(),
        firstDay.getMonth(),
        dayValue,
      );
      const day = date.getDate();
      const tempWeeks = [
        'sunday',
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
      ];
      const weeks = tempWeeks.map((item: string) => {
        return ibiz.i18n.t(`control.calendar.calendarweek.weeks.${item}`);
      });
      const caption = weeks[i];
      const isActivate = isToday(date, curDate);
      const item = { date, day, caption, isActivate };
      weekDays.value.push(item);
      tempArray.push([]);
      tempHeaderArray.push([]);
      tempEvents.push([]);
      tempRowsHeader.push([]);
    }
    // 根据事件数据分类并计算ui绘制数据
    events.forEach((event: IUIEvent) => {
      const targetLegend = legends.value.find((legendItem: IUILegend) =>
        Object.is(legendItem.id, event.itemType),
      );
      // 图例过滤
      if (!targetLegend || !targetLegend.isShow) return;
      if (event.beginTime) {
        const item = { targetLegend } as IUIEvent;
        Object.assign(item, event);
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
        // 过滤，通过判断开始或结束时间是否在当前周范围内

        // 处理头部数据
        // 开始时间及结束时间都在这周范围内
        // 开始时间在这周范围内
        // 结束时间在这周范围内
        // 开始时间及结束时间都在这周第一天与最后一天
        if (
          (isDateInCurWeek(item.beginTime, firstDay, lastDay) &&
            isDateInCurWeek(item.endTime, firstDay, lastDay)) ||
          (isDateInCurWeek(item.beginTime, firstDay, lastDay) &&
            !isDateInCurWeek(item.endTime, firstDay, lastDay)) ||
          (isDateInCurWeek(item.endTime, firstDay, lastDay) &&
            !isDateInCurWeek(item.beginTime, firstDay, lastDay)) ||
          (!isDateInCurWeek(event.endTime, firstDay, lastDay) &&
            !isDateInCurWeek(event.beginTime, firstDay, lastDay) &&
            isTimeGreaterThan(firstDay, event.beginTime) &&
            isTimeGreaterThan(event.endTime, firstDay))
        ) {
          const dateArray: Date[] = getDateRanges(firstDay, lastDay);
          dateArray.forEach((date: Date) => {
            const weekIndex = new Date(date).getDay();
            tempHeaderArray[weekIndex].push({ ...item });
          });
        }

        if (
          isDateInCurWeek(item.beginTime, firstDay, lastDay) &&
          isDateInCurWeek(item.endTime, firstDay, lastDay)
        ) {
          // 开始时间及结束时间都在这周范围内
          const dateArray: Date[] = getDateRanges(item.beginTime, item.endTime);
          dateArray.forEach((date: Date) => {
            const weekIndex = new Date(date).getDay();
            tempArray[weekIndex].push(item);
          });
        } else if (
          isDateInCurWeek(item.beginTime, firstDay, lastDay) &&
          !isDateInCurWeek(item.endTime, firstDay, lastDay)
        ) {
          // 开始时间在这周范围内
          const dateArray: Date[] = getDateRanges(item.beginTime, lastDay);
          dateArray.forEach((date: Date) => {
            const weekIndex = new Date(date).getDay();
            tempArray[weekIndex].push(item);
          });
        } else if (
          isDateInCurWeek(item.endTime, firstDay, lastDay) &&
          !isDateInCurWeek(item.beginTime, firstDay, lastDay)
        ) {
          // 结束时间在这周范围内
          const dateArray: Date[] = getDateRanges(firstDay, item.endTime);
          dateArray.forEach((date: Date) => {
            const weekIndex = new Date(date).getDay();
            tempArray[weekIndex].push(item);
          });
        } else if (
          !isDateInCurWeek(event.endTime, firstDay, lastDay) &&
          !isDateInCurWeek(event.beginTime, firstDay, lastDay) &&
          isTimeGreaterThan(firstDay, event.beginTime) &&
          isTimeGreaterThan(event.endTime, firstDay)
        ) {
          // 开始时间及结束时间都在这周第一天与最后一天
          const dateArray: Date[] = getDateRanges(firstDay, lastDay);
          dateArray.forEach((date: Date) => {
            const weekIndex = new Date(date).getDay();
            tempArray[weekIndex].push(item);
          });
        }
      }
    });
    // 排序
    tempArray.forEach((item: IData) => {
      item.sort((a: IParams, b: IParams) => {
        const tempA = a;
        const tempB = b;
        const beginTimeDifference =
          new Date(tempA.beginTime).getTime() -
          new Date(tempB.beginTime).getTime();
        let type;
        if (beginTimeDifference === 0) {
          type =
            new Date(tempA.endTime).getTime() -
            new Date(tempB.endTime).getTime();
        } else {
          type = beginTimeDifference;
        }
        return type;
      });
    });
    tempHeaderArray.forEach((item: IData) => {
      item.sort((a: IParams, b: IParams) => {
        const tempA = a;
        const tempB = b;
        const beginTimeDifference =
          new Date(tempA.beginTime).getTime() -
          new Date(tempB.beginTime).getTime();
        let type;
        if (beginTimeDifference === 0) {
          type =
            new Date(tempA.endTime).getTime() -
            new Date(tempB.endTime).getTime();
        } else {
          type = beginTimeDifference;
        }
        return type;
      });
    });
    // 初始化ui参数
    tempArray.forEach((item: IData, hostIndex: number) => {
      item.forEach((event: IUIEvent, index: number) => {
        // 图例过滤
        if (event.targetLegend) {
          const length = tempArray[hostIndex].length;
          const weekDay: IParams = weekDays.value[hostIndex];
          tempEvents[hostIndex].push(
            handleEventItemUIData(event, weekDay, tempColors, length, index),
          );
        }
      });
    });
    tempHeaderArray.forEach((item: IData, hostIndex: number) => {
      item.forEach((event: IUIEvent, index: number) => {
        // 图例过滤
        if (event.targetLegend) {
          const length = tempArray[hostIndex].length;
          const weekDay: IParams = weekDays.value[hostIndex];
          const _tempEnent = handleEventItemUIData(
            event,
            weekDay,
            tempColors,
            length,
            index,
          );
          tempRowsHeader[hostIndex].push(
            handleHeaderEventItemUIData(
              _tempEnent,
              weekDay,
              firstDay,
              lastDay,
              length,
              index,
              hostIndex,
            ),
          );
        }
      });
    });
    tempColors.clear();
    rows.value = tempEvents as IData[];
    rowsHeader.value = tempRowsHeader as IData[];
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
   * @description 获取头部事件卡片展示宽度
   * @param {string | Date} startTime
   * @param {string | Date} endTime
   * @returns {number}
   */
  const handleHeaderEventWidth = (
    startTime: string | Date,
    endTime: string | Date,
    firstDay: string | Date,
    lastDay: string | Date,
  ) => {
    let eventWidth = '0';
    if (
      isDateInCurWeek(startTime, firstDay, lastDay) &&
      isDateInCurWeek(endTime, firstDay, lastDay)
    ) {
      const hour = 24;
      const ratio = Number((100 / hour).toFixed(3));
      const difference =
        new Date(endTime).getTime() - new Date(startTime).getTime();
      const totalHours = difference / (1000 * 60 * 60);
      eventWidth = (totalHours * ratio).toFixed(3);
    }
    return eventWidth;
  };

  /**
   * @description 获取头部事件卡片展示left定位
   * @param {string | Date} startTime
   * @param {string | Date} endTime
   * @returns {number}
   */
  const handleHeaderEventLeft = (
    startTime: string | Date,
    firstDay: string | Date,
    lastDay: string | Date,
  ) => {
    let eventLeft = '0';
    if (isDateInCurWeek(startTime, firstDay, lastDay)) {
      const beginTimeHour = new Date(startTime).getHours();
      const beginTimeMinutes = new Date(startTime).getMinutes() / 60;
      const hour = 24;
      const ratio = Number((100 / hour).toFixed(3));
      const positionTotalHour = beginTimeHour + beginTimeMinutes;
      eventLeft = (positionTotalHour * ratio).toFixed(3);
    }
    return eventLeft;
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
      styleTop = 1;
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
   * @description 事件单击
   * @param {IUIEvent} item
   * @param {string} location
   */
  const handleEventClick = (item: IUIEvent, location: string) => {
    popVisible.value = false;
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
    handleUIEvents();
  };

  /**
   * @description 事件双击
   * @param {IUIEvent} item
   * @param {string} location
   */
  const handleEventDblClick = (item: IUIEvent, location: string) => {
    popVisible.value = false;
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
    handleUIEvents();
  };

  // 头部事件容器滚动相关
  // 滚动容器实例
  const headerEventRef = ref();
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
      if (headerEventRef.value) {
        headerEventRef.value.scrollTop =
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
  const onScrollbarMouseDown = (event: MouseEvent) => {
    orginY.value = event.clientY;
    enableScroll.value = true;
    event.preventDefault();
    event.stopPropagation();
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  /**
   * 头部事件容器滚动方法
   *
   * @param {Event} event
   */
  const onHeaderEventScroll = (event: Event) => {
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

    thumbHeight.value =
      visibleHeight.value * (visibleHeight.value / realHeight.value);
  };

  const initHeaderEventScroll = () => {
    realHeight.value = 0;
    visibleHeight.value = 0;
    isScroll.value = false;
    thumbHeight.value = 0;
    nextTick(() => {
      if (headerEventRef.value) {
        realHeight.value = headerEventRef.value.scrollHeight;
        visibleHeight.value = headerEventRef.value.clientHeight;

        if (realHeight.value > visibleHeight.value) {
          isScroll.value = true;
        }
        thumbHeight.value =
          visibleHeight.value * (visibleHeight.value / realHeight.value);
      }
    });
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

  watch(
    () => headerEventRef.value,
    () => {
      initHeaderEventScroll();
    },
    {
      immediate: true,
      deep: true,
    },
  );

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
    rows,
    resizableHand,
    calendarWeek,
    selectedData,
    weekDays,
    legends,
    rowsHeader,
    popVisible,
    headerEventRef,
    thumbHeight,
    realHeight,
    scrollTop,
    isScroll,
    handleCurTime,
    handleDrag,
    handleDragStart,
    handleDragEnd,
    handleEventClick,
    handleEventDblClick,
    initDrawData,
    handleUIEvents,
    onScrollbarMouseDown,
    onHeaderEventScroll,
    initHeaderEventScroll,
    eventContextmenu,
    contentMousemove,
    eventMouseenter,
    eventMouseleave,
  };
};
