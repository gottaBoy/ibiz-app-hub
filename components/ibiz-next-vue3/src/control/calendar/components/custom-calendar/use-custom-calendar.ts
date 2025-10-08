import { computed, ref, ComputedRef, SetupContext, watch, Ref } from 'vue';
import dayjs, { Dayjs } from 'dayjs';
import { useLocale } from 'element-plus';
import { handleBkColor } from '../util';
import { CHANGE_EVENT, INPUT_EVENT, UPDATE_MODEL_EVENT } from '../constant';
import {
  CalendarDateType,
  CustomCalendarEmits,
  CustomCalendarProps,
  IEvent,
  ILegend,
  IUIEvent,
  IUILegend,
} from '../interface';

const adjacentMonth = (start: Dayjs, end: Dayjs): [Dayjs, Dayjs][] => {
  const firstMonthLastDay = start.endOf('month');
  const lastMonthFirstDay = end.startOf('month');

  /**
   * @description 正月最后一天和上月第一天是否在同一周
   */
  const isSameWeek = firstMonthLastDay.isSame(lastMonthFirstDay, 'week');
  const lastMonthStartDay = isSameWeek
    ? lastMonthFirstDay.add(1, 'week')
    : lastMonthFirstDay;

  return [
    [start, firstMonthLastDay],
    [lastMonthStartDay.startOf('week'), end],
  ];
};

const threeConsecutiveMonth = (start: Dayjs, end: Dayjs): [Dayjs, Dayjs][] => {
  const firstMonthLastDay = start.endOf('month');
  const secondMonthFirstDay = start.add(1, 'month').startOf('month');

  // 正月和二月的最后一天是否在同一周
  const secondMonthStartDay = firstMonthLastDay.isSame(
    secondMonthFirstDay,
    'week',
  )
    ? secondMonthFirstDay.add(1, 'week')
    : secondMonthFirstDay;

  const secondMonthLastDay = secondMonthStartDay.endOf('month');
  const lastMonthFirstDay = end.startOf('month');

  // 第二个月的最后一天和最后一个月的最终一天是否在同一周
  const lastMonthStartDay = secondMonthLastDay.isSame(lastMonthFirstDay, 'week')
    ? lastMonthFirstDay.add(1, 'week')
    : lastMonthFirstDay;

  return [
    [start, firstMonthLastDay],
    [secondMonthStartDay.startOf('week'), secondMonthLastDay],
    [lastMonthStartDay.startOf('week'), end],
  ];
};

export const useCustomCalendar = (
  props: CustomCalendarProps,
  emit: SetupContext<CustomCalendarEmits>['emit'],
  _componentName: string,
): IData => {
  const { lang } = useLocale();
  const selectedDay = ref<Dayjs>();
  const now = dayjs().locale(lang.value);
  const tempRealSelectedDay = ref();
  const viewType = computed(() => props.viewType);
  const legends = ref<IUILegend[]>([]);
  const tempColors = new Map();
  const multiple = computed(() => props.multiple === true);
  const selectedData = computed(() => props.selectedData);

  watch(
    () => props.legends,
    newVal => {
      const tempLegend: IUILegend[] = [];
      if (newVal) {
        props.legends.forEach((item: ILegend) => {
          // 图例没有颜色时，赋默认颜色
          const tempItem = {};
          Object.assign(tempItem, item);
          Object.assign(tempItem, { isShow: true });
          if (item && !item.bkcolor) {
            const bkcolor = handleBkColor(tempColors, item.id);
            Object.assign(tempItem, { bkcolor });
          }
          tempLegend.push(tempItem as IUILegend);
        });
      }
      legends.value = tempLegend as IUILegend[];
    },
    { immediate: true, deep: true },
  );

  // 根据开始日期和结束日期计算验证日期范围
  const calculateValidatedDateRange = (
    startDayjs: Dayjs,
    endDayjs: Dayjs,
  ): [Dayjs, Dayjs][] => {
    const firstDay = startDayjs.startOf('week');
    const lastDay = endDayjs.endOf('week');
    const firstMonth = firstDay.get('month');
    const lastMonth = lastDay.get('month');

    let dateRange: [Dayjs, Dayjs][];
    // 当前月
    if (firstMonth === lastMonth) {
      dateRange = [[firstDay, lastDay]];
    } else if ((firstMonth + 1) % 12 === lastMonth) {
      // 相邻两个月
      dateRange = adjacentMonth(firstDay, lastDay);
    } else if (
      // 连续三个月（兼容时间：2021-01-30至2021-02-28）
      firstMonth + 2 === lastMonth ||
      (firstMonth + 1) % 11 === lastMonth
    ) {
      dateRange = threeConsecutiveMonth(firstDay, lastDay);
    } else {
      dateRange = [];
    }
    return dateRange as [Dayjs, Dayjs][];
  };

  // 如果range有效，我们得到一个两位数的数组
  const validatedRange = computed(() => {
    if (!props.range) return [];
    let tempRange = [];
    const rangeArrDayjs = props.range.map((item: Dayjs) =>
      dayjs(item).locale(lang.value),
    );
    const [startDayjs, endDayjs] = rangeArrDayjs;
    if (startDayjs.isAfter(endDayjs)) {
      tempRange = [];
    }
    if (startDayjs.isSame(endDayjs, 'month')) {
      // same month
      tempRange = calculateValidatedDateRange(startDayjs, endDayjs);
    } else {
      // two months
      if (startDayjs.add(1, 'month').month() !== endDayjs.month()) {
        tempRange = [];
      }
      tempRange = calculateValidatedDateRange(startDayjs, endDayjs);
    }
    return tempRange;
  });

  const date: ComputedRef<Dayjs> = computed(() => {
    let tempVal;
    if (!props.modelValue) {
      tempVal =
        tempRealSelectedDay.value ||
        (validatedRange.value.length ? validatedRange.value[0][0] : now);
    } else {
      tempVal = dayjs(props.modelValue).locale(lang.value);
    }
    return tempVal;
  });

  /**
   * @description 实际选择的日期
   */
  const realSelectedDay = computed<Dayjs | undefined>({
    get() {
      let tempVal: Dayjs | string = date.value;
      if (!props.modelValue) {
        tempVal = selectedDay.value as Dayjs;
      }
      tempRealSelectedDay.value = tempVal;
      return tempVal;
    },
    set(val) {
      if (!val) return;
      const tempVal = dayjs(val);
      selectedDay.value = tempVal as Dayjs;
      const result = (tempVal as Dayjs).toDate();

      emit(INPUT_EVENT, result);
      emit(CHANGE_EVENT, result);
      emit(UPDATE_MODEL_EVENT, result);
    },
  });

  // eslint-disable-next-line vue/return-in-computed-property
  const events: Ref<IUIEvent[]> = computed(() => {
    if (props.events.length > 0)
      return props.events.map((event: IEvent) => {
        const tempItem = {} as IUIEvent;
        Object.assign(tempItem, event);
        Object.assign(tempItem, {
          deData: event.deData,
          beginTime: event.beginTime,
          endTime: event.endTime,
          id: event.id,
          classname: event.classname,
          text: event.text,
          content: event.content,
          tips: event.tips,
          icon: event.icon,
          color: event.color,
          bkColor: event.bkColor,
          itemType: event.itemType,
        });
        return tempItem;
      });
  });
  const prevMonthDayjs = computed(() =>
    date.value.subtract(1, 'month').date(1),
  );
  const nextMonthDayjs = computed(() => date.value.add(1, 'month').date(1));
  const prevYearDayjs = computed(() => date.value.subtract(1, 'year').date(1));
  const nextYearDayjs = computed(() => date.value.add(1, 'year').date(1));

  /**
   * @description 日期选中赋值
   */
  const pickDay = (day: Dayjs) => {
    realSelectedDay.value = day;
  };

  /**
   * @description 切换日期
   * @param {CalendarDateType} type
   */
  const selectDate = (type: CalendarDateType) => {
    const dateMap: Record<CalendarDateType, Dayjs> = {
      'prev-month': prevMonthDayjs.value,
      'next-month': nextMonthDayjs.value,
      'prev-year': prevYearDayjs.value,
      'next-year': nextYearDayjs.value,
      today: now,
    };

    const day = dateMap[type];

    if (!day.isSame(date.value, 'day')) {
      pickDay(day);
    }
  };

  /**
   * @description viewType为MONTH时显示年月
   * @returns {string}
   */
  const i18nDate = computed(() => {
    const pickedMonth = `${date.value.format('M')}`;
    return `${date.value.year()} ${ibiz.i18n.t(
      'control.calendar.year',
    )} ${pickedMonth} ${ibiz.i18n.t('control.calendar.month')}`;
  });

  /**
   * @description 当viewType类型为DAY时绑定时间选择组件
   */
  const shortcuts = [
    {
      text: ibiz.i18n.t('control.calendar.today'),
      value: new Date(),
    },
    {
      text: ibiz.i18n.t('control.calendar.calendardaily.tomorrow'),
      value: () => {
        const tempDate = new Date();
        tempDate.setTime(tempDate.getTime() + 3600 * 1000 * 24);
        return tempDate;
      },
    },
    {
      text: ibiz.i18n.t('control.calendar.calendardaily.nextweek'),
      value: () => {
        const tempDate = new Date();
        tempDate.setTime(tempDate.getTime() + 3600 * 1000 * 24 * 7);
        return tempDate;
      },
    },
  ];

  /**
   * @description 处理事件点击
   * @param {IParams} value
   */
  const handleEVentClick = (value: IParams) => {
    emit('eventClick', value);
  };

  /**
   * @description 处理事件双击
   * @param {IParams} value
   */
  const handleEVentDblClick = (value: IParams) => {
    emit('eventDblClick', value);
  };

  /**
   * @description 处理事件右键点击
   * @param {IParams} value
   */
  const handleEventContextmenu = (value: IParams) => {
    emit('eventContextmenu', value);
  };

  /**
   * @description 处理周显示
   * @param {IParams} value
   */
  const curWeek = computed(() => {
    let tempWeek = '';
    if (realSelectedDay.value) {
      const curDate = realSelectedDay.value.day();
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
        return ibiz.i18n.t(`control.calendar.calendardaily.weeks.${item}`);
      });
      tempWeek = weeks[curDate];
    }
    return tempWeek;
  });

  const selectLegend = (item: IUILegend) => {
    const targetLegend: IUILegend | undefined = legends.value.find(
      (legend: IUILegend) => {
        return item.id === legend.id;
      },
    );
    if (targetLegend) Object.assign(targetLegend, { isShow: !item.isShow });
  };

  return {
    date,
    viewType,
    i18nDate,
    events,
    shortcuts,
    validatedRange,
    realSelectedDay,
    curWeek,
    legends,
    multiple,
    selectedData,
    calculateValidatedDateRange,
    pickDay,
    selectDate,
    handleEVentClick,
    handleEVentDblClick,
    handleEventContextmenu,
    selectLegend,
  };
};

/**
 * 计算一周范围
 *
 * @export
 * @param {Date} date
 * @return {*}  {string[]}
 */
export function calcCurrentWeekRange(date: Date): string[] {
  let monday;
  let sunday;
  const day = date.getDay();
  if (day === 0) {
    // 今天星期天
    monday = dayjs(new Date(date.getTime() - 6 * 86400000)).format(
      'YYYY-MM-DD',
    );
    sunday = dayjs(date).format('YYYY-MM-DD');
  } else {
    monday = dayjs(new Date(date.getTime() - (day - 1) * 86400000)).format(
      'YYYY-MM-DD',
    );
    sunday = dayjs(new Date(date.getTime() + (7 - day) * 86400000)).format(
      'YYYY-MM-DD',
    );
  }
  return [monday, sunday];
}
