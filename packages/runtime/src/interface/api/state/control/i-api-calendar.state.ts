import { IApiData } from '@ibiz-template/core';
import { IApiMDControlState } from './i-api-md-control.state';

/**
 * @description 图例项数据接口
 * @export
 * @interface IApiLegend
 */
export interface IApiLegend {
  /**
   * @description 标识
   * @type {string}
   * @memberof IApiLegend
   */
  id?: string;
  /**
   * @description 名称
   * @type {string}
   * @memberof IApiLegend
   */
  name?: string;
  /**
   * @description 背景色
   * @type {string}
   * @memberof IApiLegend
   */
  bkcolor?: string;
  /**
   * @description 字体颜色
   * @type {string}
   * @memberof IApiLegend
   */
  color?: string;
}

/**
 * @description 日历项数据接口
 * @export
 * @interface IApiCalendarItemData
 */
export interface IApiCalendarItemData {
  /**
   * @description 背景色
   * @type {string}
   * @memberof iApiCalendatItemData
   */
  bkColor: string;

  /**
   * @description 开始时间
   * @type {string}
   * @memberof iApiCalendatItemData
   */
  beginTime: string;

  /**
   * @description 颜色
   * @type {string}
   * @memberof iApiCalendatItemData
   */
  color: string;

  /**
   * @description 内容
   * @type {string}
   * @memberof iApiCalendatItemData
   */
  content: string;

  /**
   * @description  结束时间
   * @type {string}
   * @memberof iApiCalendatItemData
   */
  endTime: string;

  /**
   * @description 图标
   * @type {string}
   * @memberof iApiCalendatItemData
   */
  icon: string;

  /**
   * @description id标识
   * @type {string}
   * @memberof iApiCalendatItemData
   */
  id: string;

  /**
   * @description 级别
   * @type {string}
   * @memberof iApiCalendatItemData
   */
  level: string;

  /**
   * @description 标记2
   * @type {string}
   * @memberof iApiCalendatItemData
   */
  tag2: string;

  /**
   * @description 标记1
   * @type {string}
   * @memberof iApiCalendatItemData
   */
  tag: string;

  /**
   * @description 文本
   * @type {string}
   * @memberof iApiCalendatItemData
   */
  text: string;

  /**
   * @description 提示
   * @type {string}
   * @memberof iApiCalendatItemData
   */
  tips: string;

  /**
   * @description 实体数据
   * @type {IApiData}
   * @memberof iApiCalendatItemData
   */
  deData: IApiData;

  /**
   * @description  日历项名称
   * @type {string}
   * @memberof iApiCalendatItemData
   */
  itemType: string;

  /**
   * @description 导航标识
   * @type {string}
   * @memberof iApiCalendatItemData
   */
  navId: string;

  /**
   * @description 数据主键
   * @type {string}
   * @memberof IApiCalendarItemData
   */
  srfkey: string;
}

/**
 * @description 日历分组数据接口
 * @export
 * @interface IApiCalendarGroup
 */
export interface IApiCalendarGroup {
  /**
   * @description 分组标题
   * @type {string}
   * @memberof IApiCalendarGroup
   */
  caption: string;

  /**
   * @description 分组标识
   * @type {string}
   * @memberof IApiCalendarGroup
   */
  key: string;

  /**
   * @description 日历项数据
   * @type {IApiCalendarItemData[]}
   * @memberof IApiCalendarGroup
   */
  children: IApiCalendarItemData[];
}

/**
 * @description 日历控件状态接口
 * @primary
 * @export
 * @interface IApiCalendarState
 * @extends {IApiMDControlState}
 */
export interface IApiCalendarState extends IApiMDControlState {
  /**
   * @description 日历项数据
   * @type {ICalendarItemData[]}
   * @default []
   * @memberof IApiCalendarState
   */
  items: IApiCalendarItemData[];

  /**
   * @description 日历分组数据
   * @type {IApiCalendarGroup[]}
   * @default []
   * @memberof IApiCalendarState
   */
  groups: IApiCalendarGroup[];

  /**
   * @description 选中的日期
   * @type {Date}
   * @default Date
   * @memberof IApiCalendarState
   */
  selectedDate: Date;

  /**
   * @description 图例
   * @type {IApiLegend[]}
   * @default []
   * @memberof IApiCalendarState
   */
  legends: IApiLegend[];

  /**
   * @description 日历名称
   * @type {string}
   * @default ''
   * @memberof IApiCalendarState
   */
  calendarTitle: string;
}
