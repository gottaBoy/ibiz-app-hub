/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { h, warn } from 'vue';
import dayjs from 'dayjs';
import { clone } from 'ramda';

import type { PropType, VNode } from 'vue';
import { isDate, isArray, isObject, fromPairs, get, set } from 'lodash-es';
import { IModal, IOverlayPopoverContainer } from '@ibiz-template/runtime';
import type {
  EpProp,
  EpPropFinalized,
  EpPropInput,
  EpPropMergeType,
  IEvent,
  IUIEvent,
} from '../interface';

// 避免双击事件时触发单击事件
let clickCount = 0;
let timer: NodeJS.Timeout;

const epPropKey = '__epPropKey';
const colors = [
  '#2196F3',
  '#4CAF50',
  '#3F51B5',
  '#FF9800',
  '#673AB7',
  '#757575',
];
const closeIcon = `<i class='el-icon' data-v-ea893728=''> <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1024 1024' data-v-ea893728='' > <path d='M764.288 214.592 512 466.88 259.712 214.592a31.936 31.936 0 0 0-45.12 45.12L466.752 512 214.528 764.224a31.936 31.936 0 1 0 45.12 45.184L512 557.184l252.288 252.288a31.936 31.936 0 0 0 45.12-45.12L557.12 512.064l252.288-252.352a31.936 31.936 0 1 0-45.12-45.184z'></path> </svg></i>`;

const hexReg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
const rgbReg = /^(rgb|rgba|RGB|RGBA)/;

/**
 * @description 递归查找气泡节点
 * @param {*} element
 */
function findLastParent(element: IParams) {
  if (!element) {
    return null;
  }
  if (!element?.parentNode || element?.classList?.contains('el-popover')) {
    return element;
  }
  return findLastParent(element.parentNode);
}

/**
 * @description 处理气泡关闭
 * @param {MouseEvent} el
 */
const handlePopClose = (el: MouseEvent) => {
  const node = findLastParent((el as IParams).target);
  if (node) {
    node.style.display = 'none';
  }
};

/**
 * @description 处理事件绘制时间范围
 * @param {string | Date} startTime
 * @param {string | Date} endTime
 * @param {string} format
 * @param {string} partition
 * @returns {string}
 */
const handleTimeRange = (
  startTime: string | Date,
  endTime: string | Date,
  format: string,
  partition: string = '~',
) => {
  let timeRange = '';
  if (startTime && dayjs(startTime)?.isValid()) {
    timeRange = dayjs(startTime).format(format);
  }
  if (endTime && dayjs(endTime)?.isValid()) {
    timeRange = `${timeRange} ${partition} ${dayjs(endTime).format(format)}`;
  }
  return timeRange;
};

/**
 * @description 处理背景颜色
 * @param {IData} tempColors
 * @returns {string}
 */
const handleBkColor = (tempColors: IData, type: string) => {
  let tempColor = tempColors.get(type);
  const length = tempColors.size;
  if (type && !tempColor && length < colors.length) {
    tempColor = colors[length];
    tempColors.set(type, tempColor);
  }
  return tempColor || colors[0];
};

/**
 * @description 颜色验证器
 * @param {string} color Hex|Rgb|Rgba color 或 关键字
 * @return {string|boolean} 有效颜色或错误
 */
const validatorF = (color: string): string => {
  const isHex = hexReg.test(color);
  const isRgb = rgbReg.test(color);
  const tempColor = color;
  if (isHex || isRgb) return tempColor;
  if (!color) {
    console.error('Color: Invalid color!');
    return '';
  }

  return tempColor;
};

/**
 * @description 获取十六进制颜色的rgb值
 * @param { } color Hex color
 * @return {number[]} 颜色的Rgb值
 */
const getRgbValueFromHex = (color: string): number[] => {
  const tempColor = color.replace('#', '');
  const red = parseInt(tempColor.substring(0, 2), 16);
  const green = parseInt(tempColor.substring(2, 4), 16);
  const blue = parseInt(tempColor.substring(4, 6), 16);
  return [red, green, blue];
};

/**
 * @description 获取rgb/rgba颜色的rgb值
 * @param {string} color Hex color
 * @return {number[]} 颜色的Rgb值
 */

const getRgbValueFromRgb = (color: string): number[] => {
  return color
    .replace(/rgb\(|rgba\(|\)/g, '')
    .split(',')
    .slice(0, 3)
    .map(function (n: string) {
      return parseInt(n, 10);
    });
};

/**
 * @description 获取颜色的Rgb值
 * @param {string} color Hex|Rgb|Rgba 颜色或颜色关键字
 * @return {number[]|Boolean} 颜色的Rgb值（无效输入将返回false）
 */
const getRgbValue = (color: string) => {
  if (!color) {
    console.error('getRgbValue: Missing parameters!');
    return false;
  }

  const tempColor = validatorF(color);
  if (!tempColor) return false;
  const isHex = hexReg.test(tempColor);
  const isRgb = rgbReg.test(tempColor);
  const lowerColor = tempColor.toLowerCase();
  if (isHex) return getRgbValueFromHex(lowerColor);
  if (isRgb) return getRgbValueFromRgb(lowerColor);
};

/**
 * @description 从Rgb获取颜色| Rgb值
 * @param {number[]} value Rgb|Rgba 颜色值
 * @return {string|Boolean} Rgb|Rgba颜色（无效输入将返回false）
 */

const getColorFromRgbValue = (value: number[]) => {
  if (!value) {
    console.error('getColorFromRgbValue: Missing parameters!');
    return false;
  }

  const valueLength = value.length;

  if (valueLength !== 3 && valueLength !== 4) {
    console.error('getColorFromRgbValue: Value is illegal!');
    return false;
  }

  let color: string = valueLength === 3 ? 'rgb(' : 'rgba(';
  color += `${value.join(',')})`;
  return color;
};

/**
 * @description 调整颜色不透明度
 * @param {String} color   十六进制| Rgb | Rgb颜色或颜色关键字
 * @param {Number} Percent 不透明度
 * @return {String|Boolean} Rgba颜色（无效输入将返回false）
 */
const fade = (color: string, Percent: number) => {
  const percent = Percent || 100;
  if (!color) {
    console.error('fade: Missing parameters!');
    return false;
  }

  const rgbValue = getRgbValue(color);
  if (!rgbValue) return false;
  const rgbaValue = [...rgbValue, percent / 100];
  return getColorFromRgbValue(rgbaValue);
};

/**
 * @description 判断是否为今天
 */
const isToday = (date: Date | string, curDate: Date | string) => {
  const dateToCheck = new Date(date);
  const currentDate = curDate ? new Date(curDate) : new Date();
  const state =
    dateToCheck.getDate() === currentDate.getDate() &&
    dateToCheck.getMonth() === currentDate.getMonth() &&
    dateToCheck.getFullYear() === currentDate.getFullYear();
  return state;
};

/**
 * 判断开始与结束时间是否包含指定日期
 * @param {Date | string} start - 开始时间
 * @param {Date | string} end - 结束时间
 * @param {Date | string} curDate - 指定日期
 * @returns {boolean} 如果指定日期在范围内（含开始和结束）返回 true，否则返回 false
 */
function checkDateRangeIncludes(
  start: Date | string,
  end: Date | string,
  curDate: Date | string,
): boolean {
  const targetDate = dayjs(curDate);
  const startDate = dayjs(start);
  const endDate = dayjs(end);

  // 检查日期是否有效
  if (!targetDate.isValid() || !startDate.isValid() || !endDate.isValid())
    return false;

  // 判断 targetDate 是否在 [startDate, endDate] 闭区间内
  return (
    targetDate.isSame(startDate, 'day') ||
    targetDate.isSame(endDate, 'day') ||
    (startDate.isBefore(targetDate, 'day') &&
      endDate.isAfter(targetDate, 'day'))
  );
}

/**
 * 检查对象是否具有指定的属性（自身属性，不包括原型链上的属性）
 * @param {Object} obj 要检查的对象
 * @param {string} key 要检查的属性名
 * @returns {boolean} 如果对象具有指定的属性，则返回 true，否则返回 false
 */
function hasOwn(obj: IParams, key: string) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

/**
 * @description 定义类型
 * @param {*} val
 * @returns {PropType<T>}
 */
const definePropType = <T>(val: IData | PropType<T>): PropType<T> =>
  val as PropType<T>;

/**
 * @description `handleProp` or `handleProps` 的输入参数 `default` 的类型
 */
const isEpProp = (val: unknown): val is EpProp<never, never, never> =>
  isObject(val) && !!(val as IParams)[epPropKey];

/**
 * @description 是否为有效时间范围
 * @param {*} range
 * @returns {range is [Date, Date]}
 */
const isValidRange = (range: IData): range is [Date, Date] =>
  isArray(range) &&
  range.length === 2 &&
  range.every((item: IParams) => isDate(item));

/**
 * @description 判断时间是否在当前周内
 * @param {Date | string} dateToCheck 需要检查的日期
 * @returns {boolean}
 */
const isDateInCurWeek = (
  dateToCheck: Date | string,
  firstDayOfWeek: Date | string,
  lastDayOfWeek: Date | string,
) => {
  const tempDate = new Date(dateToCheck);
  const tempFirstDay = new Date(firstDayOfWeek);
  const tempLastDay = new Date(lastDayOfWeek);
  tempDate.setHours(0, 0, 0, 0);
  tempFirstDay.setHours(0, 0, 0, 0);
  tempLastDay.setHours(0, 0, 0, 0);
  return tempDate >= tempFirstDay && tempDate <= tempLastDay;
};

/**
 * @description 判断时间A是否大于时间B
 * @param {Date | string} timeA
 * @param {Date | string} timeB
 * @returns {boolean}
 */
const isTimeGreaterThan = (timeA: Date | string, timeB: Date | string) => {
  const date1 = new Date(timeA);
  const date2 = new Date(timeB);

  return date1.getTime() > date2.getTime();
};

/**
 * @description 根据当前时间获取周第一天时间及周末时间
 * @param {Date | string} curDate 当前选中时间
 * @returns {boolean}
 */
const getCurWeekDates = (curDate: Date | string) => {
  const currentDate = new Date(curDate);
  const currentDay = currentDate.getDay();
  const firstDayOfWeek = new Date(currentDate);
  firstDayOfWeek.setDate(currentDate.getDate() - currentDay);
  const lastDayOfWeek = new Date(firstDayOfWeek);
  lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
  firstDayOfWeek.setHours(0, 0, 0, 0);
  lastDayOfWeek.setHours(23, 59, 59, 0);
  return {
    firstDay: firstDayOfWeek,
    lastDay: lastDayOfWeek,
  };
};
/**
 * @description 处理抛值
 * @param {string} eventName
 * @param {IUIEvent} item
 * @param {string} location
 */
const handleEmit = (
  eventName: string,
  item: IUIEvent,
  location: string,
  events: IEvent[],
  multiple: boolean,
  selectedData: IEvent[],
  emit: Function,
) => {
  let tempSelectedData: IData = clone(selectedData);
  let isSelectedEvent = true;
  const targetEvent = events.find((event: IUIEvent) => {
    return item.id === event.id;
  }) as IEvent;
  const index = tempSelectedData.findIndex(
    (event: IUIEvent) => item.id === event.id,
  );
  if (multiple) {
    if (index === -1) {
      tempSelectedData.push(targetEvent);
    } else {
      Object.assign(item, { isSelectedEvent: false });
      isSelectedEvent = false;
      tempSelectedData.splice(index, 1);
    }
  } else if (index === -1) {
    tempSelectedData = [targetEvent];
  } else {
    Object.assign(item, { isSelectedEvent: false });
    isSelectedEvent = false;
    tempSelectedData = [];
  }

  switch (eventName) {
    case 'eventClick':
      emit('eventClick', { location, data: tempSelectedData });
      break;
    case 'eventDblClick':
      emit('eventDblClick', { location, data: tempSelectedData });
      break;
    default:
      break;
  }
  return { eventName, tempSelectedData, isSelectedEvent };
};

/**
 * @description 处理事件点击
 */
const handleEVentClick = (
  item: IUIEvent,
  location: string,
  events: IEvent[],
  multiple: boolean,
  selectedData: IEvent[],
  emit: Function,
) => {
  return new Promise(resolve => {
    clickCount += 1;
    if (clickCount === 1) {
      timer = setTimeout(() => {
        if (clickCount === 1) {
          resolve(
            handleEmit(
              'eventClick',
              item,
              location,
              events,
              multiple,
              selectedData,
              emit,
            ),
          );
        }
        clickCount = 0;
      }, 300);
    } else if (clickCount === 2) {
      clearTimeout(timer);
      resolve(
        handleEmit(
          'eventDblClick',
          item,
          location,
          events,
          multiple,
          selectedData,
          emit,
        ),
      );
      clickCount = 0;
    }
  });
};

/**
 * @description 处理props
 * @param {*} required
 * @param {*} defaultValue
 * @returns {unknown}
 */
const handleProp = <
  Type = never,
  Value = never,
  Validator = never,
  Default extends EpPropMergeType<Type, Value, Validator> = never,
  Required extends boolean = false,
>(
  prop: EpPropInput<Type, Value, Validator, Default, Required>,
  key?: string,
): EpPropFinalized<Type, Value, Validator, Default, Required> => {
  // filter native prop type and nested prop, e.g `null`, `undefined` (from `handleProps`)
  if (!isObject(prop) || isEpProp(prop))
    return prop as EpPropFinalized<Type, Value, Validator, Default, Required>;

  const { values, required, default: defaultValue, type, validator } = prop;

  const _validator =
    values || validator
      ? (val: unknown) => {
          let valid = false;
          let allowedValues: unknown[] = [];

          if (values) {
            allowedValues = Array.from(values);
            if (hasOwn(prop, 'default')) {
              allowedValues.push(defaultValue);
            }
            valid ||= allowedValues.includes(val);
          }
          if (validator) valid ||= (validator as Function)(val);

          if (!valid && allowedValues.length > 0) {
            const allowValuesText = [...new Set(allowedValues)]
              .map(value => JSON.stringify(value))
              .join(', ');
            warn(
              `Invalid prop: validation failed${
                key ? ` for prop "${key}"` : ''
              }. Expected one of [${allowValuesText}], got value ${JSON.stringify(
                val,
              )}.`,
            );
          }
          return valid;
        }
      : undefined;

  const epProp: IParams = {
    type,
    required: !!required,
    validator: _validator,
    [epPropKey]: true,
  };
  if (hasOwn(prop, 'default')) epProp.default = defaultValue;
  return epProp as EpPropFinalized<Type, Value, Validator, Default, Required>;
};

/**
 * @description 生成一个从 0 到 n-1 的范围数组
 * @param {number} n 生成范围数组的长度
 * @returns {number[]} 从 0 到 n-1 的范围数组
 */
const rangeArr = (n: number) => Array.from(Array.from({ length: n }).keys());

/**
 * @description 处理props
 * @param {*} props
 * @returns {Record<string, any>}
 */
const handleProps = <
  Props extends Record<string, { [epPropKey]: true } | IParams>,
>(
  props: Props,
): IParams =>
  fromPairs(
    Object.entries(props).map(([key, option]) => [
      key,
      handleProp(option as IParams, key),
    ]),
  );

/**
 * 打开popover
 *
 * @param {VNode} _component
 * @param {HTMLElement} _evt
 * @param {IData} _opts
 */
function openPopover(
  _component: VNode,
  _targetEvt: HTMLElement,
  _opts: IData,
): IOverlayPopoverContainer {
  const overlay = ibiz.overlay.createPopover(
    (modal: IModal): VNode => {
      return h(_component, { modal });
    },
    undefined,
    {
      width: 'auto',
      height: 'auto',
      noArrow: true,
      ..._opts,
    },
  );
  overlay?.present(_targetEvt as HTMLElement);
  return overlay;
}

/**
 * _follow、_overlay跟随_event移动
 *
 * @param {MouseEvent} _event
 * @param {HTMLElement} _follow
 */
function followMouseMove(_event: MouseEvent, _follow: HTMLElement): void {
  // 设置元素位置
  _follow.style.left = `${_event.clientX + 20}px`;
  _follow.style.top = `${_event.clientY + 20}px`;
}

/**
 * 创建跟随元素
 *
 * @return {*}  {HTMLElement}
 */
const createFollowElement = (): HTMLElement => {
  const followEl = document.createElement('div');
  (followEl as IData).style =
    'position: fixed; height: 2px; width: 2px; z-index: -1;';
  document.body?.appendChild(followEl);
  return followEl;
};

/**
 * 删除跟随元素
 *
 * @param {HTMLElement} followEl
 */
const removeFollowElement = (followEl: HTMLElement): void => {
  document.body.removeChild(followEl);
};

export {
  epPropKey,
  closeIcon,
  isDate,
  isArray,
  isObject,
  isToday,
  get,
  set,
  handleProps,
  rangeArr,
  isValidRange,
  definePropType,
  handleTimeRange,
  handleBkColor,
  fade,
  handleEmit,
  handleEVentClick,
  handlePopClose,
  getCurWeekDates,
  isDateInCurWeek,
  isTimeGreaterThan,
  checkDateRangeIncludes,
  openPopover,
  followMouseMove,
  createFollowElement,
  removeFollowElement,
};
