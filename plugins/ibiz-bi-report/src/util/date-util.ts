import dayjs from 'dayjs';
import { biReportT } from '../locale';

/**
 * 是否为日期
 *
 * @author tony001
 * @date 2024-07-23 17:07:19
 * @export
 * @param {number} stdDataType
 * @return {*}
 */
export function isDate(stdDataType: number): boolean {
  return stdDataType === 5 || stdDataType === 27;
}

/**
 * 格式化时间
 *
 * @author tony001
 * @date 2024-07-23 17:07:25
 * @export
 * @param {('DAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR')} type
 * @param {string} value
 * @return {*}  {string}
 */
export function formatDate(
  type: 'DAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR',
  value: string,
): string {
  if (type && type === 'DAY' && value && /^\d{8}$/.test(value)) {
    return biReportT('date.day', {
      year: value.substring(0, 4),
      month: value.substring(4, 6),
      day: value.substring(6),
    });
  }
  if (type && type === 'WEEK' && value && /^\d{4}W\d{1,2}$/.test(value)) {
    return biReportT('date.week', {
      year: value.substring(0, 4),
      week: value.substring(5),
    });
  }
  if (type && type === 'MONTH' && value && /^\d{4}\d{2}$/.test(value)) {
    return biReportT('date.month', {
      year: value.substring(0, 4),
      month: value.substring(4),
    });
  }
  if (type && type === 'QUARTER' && value && /^\d{4}Q\d{1}$/.test(value)) {
    return biReportT('date.quarter', {
      year: value.substring(0, 4),
      quarter: value.substring(5),
    });
  }
  if (type && type === 'YEAR' && value && /^\d{4}$/.test(value)) {
    return biReportT('date.year', { year: value.substring(0, 4) });
  }
  return value;
}

/**
 *
 *  标识与时间单位关系数组
 *
 */
export const tags: Array<{
  unit: 'DAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR';
  tag: string;
}> = [
  {
    unit: 'DAY',
    tag: 'TIMESTAMP',
  },
  {
    unit: 'WEEK',
    tag: 'STARTOFWEEK',
  },
  {
    unit: 'MONTH',
    tag: 'STARTOFMONTH',
  },
  {
    unit: 'QUARTER',
    tag: 'STARTOFQUARTER',
  },
  {
    unit: 'YEAR',
    tag: 'STARTOFYEAR',
  },
];

/**
 * 时间处理工具
 *
 * @export
 * @class DateUtil
 */
export class DateUtil {
  /**
   * 处理时间转字符串 (name >= TIMESTAMP(starttime)) AND (name  <= TIMESTAMP(endtime))
   * starttime: YYYY-MM-DD  00:00:00
   * endtime: YYYY-MM-DD  23:59:59
   *
   * @param {IData} config
   * @return {*}  {string}
   * @memberof DateUtil
   */
  public handleDateToString(config: IData, field: string): string {
    const { unit, type, start, end } = config;
    const dates = this.computedDynamicTimeToDate(unit, type, start, end);
    const tempStart = this.completeTimeFormat(String(dates[0]), 'START');
    const tempEnd = this.completeTimeFormat(String(dates[1]), 'END');

    if (unit === 'WEEK') {
      return `(${field} >= STARTOFWEEK('${tempStart}')) AND (${field}  <= STARTOFWEEK('${tempEnd}'))`;
    }
    if (unit === 'MONTH') {
      return `(${field} >=  STARTOFMONTH('${tempStart}')) AND (${field}  <= STARTOFMONTH('${tempEnd}'))`;
    }
    if (unit === 'QUARTER') {
      return `(${field} >= STARTOFQUARTER('${tempStart}')) AND (${field}  <= STARTOFQUARTER('${tempEnd}'))`;
    }
    if (unit === 'YEAR') {
      return `(${field} >= STARTOFYEAR('${tempStart}')) AND (${field}  <= STARTOFYEAR('${tempEnd}'))`;
    }
    // 默认返回天
    return `(${field} >= TIMESTAMP('${tempStart}')) AND (${field}  <= TIMESTAMP('${tempEnd}'))`;
  }

  /**
   * 处理字符串转时间
   *
   * @param {string} time
   * @return {*}
   * @memberof DateUtil
   */
  public handleStringToDate(
    time: string,
    type: 'DYNAMIC' | 'STATIC' = 'DYNAMIC',
  ) {
    const regex = /\w+\('(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})'\)/g;
    const matches = [...time.matchAll(regex)].map(match => match[1]);
    if (matches && matches.length) {
      const unit = this.computedDateUnit(time);
      const { start, end } = this.computedDateTypesTime(
        unit,
        type,
        matches[0],
        matches[1],
      );
      return {
        unit,
        type,
        start,
        end,
      };
    }
  }

  /**
   * 计算时间单位
   *
   * @param {string} str
   * @return {*}
   * @memberof DateUtil
   */
  public computedDateUnit(
    str: string,
  ): 'DAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR' {
    const temp = tags.find((tag: IData) => {
      return str.indexOf(tag.tag) >= 0;
    });
    if (temp?.unit) {
      return temp.unit;
    }
    return 'DAY';
  }

  /**
   *
   * @param {('DAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR')} dateUnit
   * @param {('DYNAMIC' | 'STATIC')} dateType
   * @param {number} _start
   * @param {number} _end
   * @return {*}  {(Array<string | number>)}
   * @memberof DateUtil
   */
  public computedDynamicTimeToDate(
    dateUnit: 'DAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR',
    dateType: 'DYNAMIC' | 'STATIC',
    _start: number,
    _end: number,
  ): Array<string | number> {
    if (dateType === 'STATIC') {
      const start = new Date(_start * 1000);
      const end = new Date(_end * 1000);
      if (dateUnit === 'YEAR') {
        // 只返回年
        return [start.getFullYear(), end.getFullYear()];
      }
      return [start.toLocaleDateString(), end.toLocaleDateString()];
    }
    const current = new Date();
    current.setHours(0, 0, 0, 0);

    if (dateUnit === 'WEEK') {
      const start = this.timeSpanConvertToWeek(current, _start);
      const end = this.timeSpanConvertToWeek(current, _end);
      return [start, end];
    }
    if (dateUnit === 'MONTH') {
      const start = this.timeSpanConvertToMonth(current, _start);
      const end = this.timeSpanConvertToMonth(current, _end);
      return [start, end];
    }
    if (dateUnit === 'QUARTER') {
      const start = this.timeSpanConvertToQuarter(current, _start);
      const end = this.timeSpanConvertToQuarter(current, _end);
      return [start, end];
    }
    if (dateUnit === 'YEAR') {
      const start = current.getFullYear() - _start;
      const end = current.getFullYear() - _end;
      return [start, end];
    }
    // 默认是天
    const start = _start * 24 * 60 * 60 * 1000;
    const end = _end * 24 * 60 * 60 * 1000;
    const tempStart = new Date(current.getTime() + start);
    const tempEnd = new Date(current.getTime() + end);
    return [
      tempStart.toLocaleDateString().replaceAll('/', '-'),
      tempEnd.toLocaleDateString().replaceAll('/', '-'),
    ];
  }

  /**
   *时间间隔转季度
   *
   * @private
   * @param {Date} current
   * @param {number} timespan
   * @return {*}
   * @memberof DateUtil
   */
  private timeSpanConvertToQuarter(current: Date, timespan: number) {
    const tempYear = Math.floor(timespan / 4);
    const tempQuarter = timespan % 4;
    let year = current.getFullYear() - tempYear;
    const month = current.getMonth() + 1;

    const curQuarter = Math.ceil(month / 3);
    let quarter = curQuarter - tempQuarter;
    if (quarter < 0) {
      year -= 1;
      quarter += 4;
    }
    if (quarter > 4) {
      year += 1;
      quarter -= 4;
    }
    return `${year}-${quarter * 3}`;
  }

  /**
   * 时间转年周
   *
   * @private
   * @param {Date} current
   * @param {number} timespan
   * @return {*}
   * @memberof DateUtil
   */
  private timeSpanConvertToWeek(current: Date, timespan: number) {
    const date = current.getTime();
    const time = timespan * 7 * 24 * 60 * 60 * 1000;
    return new Date(date - time).toLocaleDateString();
  }

  /**
   * 时间间隔转月份
   *
   * @private
   * @param {Date} current
   * @param {number} timespan
   * @return {*}
   * @memberof DateUtil
   */
  private timeSpanConvertToMonth(current: Date, timespan: number) {
    const tempYear = Math.floor(timespan / 12);
    const tempMonth = timespan % 12;
    let year = current.getFullYear() - tempYear;
    let month = current.getMonth() + 1 - tempMonth;
    if (month < 0) {
      year -= 1;
      month += 12;
    }
    if (month > 12) {
      year += 1;
      month -= 12;
    }
    return `${year}-${month}`;
  }

  /**
   * 补全时间格式
   *
   * @private
   * @param {string} _date
   * @param {('START' | 'END')} _tag
   * @return {*}  {string}
   * @memberof DateUtil
   */
  private completeTimeFormat(_date: string, _tag: 'START' | 'END'): string {
    const date = new Date(_date);
    if (_tag === 'START') {
      date.setHours(0, 0, 0, 0);
    } else {
      date.setHours(23, 59, 59, 0);
    }
    const dateString = dayjs(date).format('YYYY-MM-DD HH:mm:ss');
    return dateString;
  }

  /**
   * 计算在各个时间类型下的开始结束时间
   *
   * @param {('DAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR')} dateUnit
   * @param {('DYNAMIC' | 'STATIC')} dateType
   * @param {string} _start
   * @param {string} _end
   * @return {*}  {{
   *     start: number;
   *     end: number;
   *   }}
   * @memberof DateUtil
   */
  public computedDateTypesTime(
    dateUnit: 'DAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR',
    dateType: 'DYNAMIC' | 'STATIC',
    _start: string,
    _end: string,
  ): {
    start: number;
    end: number;
  } {
    if (dateType === 'STATIC') {
      return this.computedStaticTime(dateUnit, _start, _end);
    }
    return this.computedDynamicTime(dateUnit, _start, _end);
  }

  /**
   * 计算动态类型时间
   *
   * @param {('DAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR')} dateUnit
   * @param {string} _start
   * @param {string} _end
   * @return {*}  {{ start: number; end: number }}
   * @memberof DateUtil
   */
  computedDynamicTime(
    dateUnit: 'DAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR',
    _start: string,
    _end: string,
  ): { start: number; end: number } {
    switch (dateUnit) {
      case 'DAY':
        return this.computedDaysSpace(_start, _end);
      case 'WEEK':
        return this.computedWeeksSpace(_start, _end);
      case 'MONTH':
        return this.computedMonthsSpace(_start, _end);
      case 'QUARTER':
        return this.computedQuartersSpace(_start, _end);
      case 'YEAR':
        return this.computedYearsSpace(_start, _end);
      default:
        return this.computedDaysSpace(_start, _end);
    }
  }

  /**
   *计算年的前后间隔
   *
   * @param {string} _start
   * @param {string} _end
   * @return {*}  {{ start: number; end: number }}
   * @memberof DateUtil
   */
  computedYearsSpace(
    _start: string,
    _end: string,
  ): { start: number; end: number } {
    const currentYear = new Date().getFullYear();
    const start = new Date(_start).getFullYear() - currentYear;
    const end = new Date(_end).getFullYear() - currentYear;
    return {
      start,
      end,
    };
  }

  /**
   * 计算季度的前后间隔
   *
   * @param {string} _start
   * @param {string} _end
   * @return {*}  {{ start: number; end: number }}
   * @memberof DateUtil
   */
  computedQuartersSpace(
    _start: string,
    _end: string,
  ): { start: number; end: number } {
    const current = new Date();
    const startDate = new Date(_start);
    const endDate = new Date(_end);

    // 计算季度间隔
    const computedQuarterInterval = (start: Date, end: Date) => {
      const startYear = start.getFullYear();
      const startMonth = start.getMonth() + 1;
      const startQuarter = Math.ceil(startMonth / 3);

      const endYear = end.getFullYear();
      const endMonth = end.getMonth() + 1;
      const endQuarter = Math.ceil(endMonth / 3);

      return (endYear - startYear) * 4 - startQuarter + endQuarter;
    };
    const start = computedQuarterInterval(current, startDate);
    const end = computedQuarterInterval(current, endDate);
    return {
      start,
      end,
    };
  }

  /**
   * 计算天的前后间隔
   *
   * @param {string} _start
   * @param {string} _end
   * @return {*}  {{ start: number; end: number }}
   * @memberof DateUtil
   */
  computedDaysSpace(
    _start: string,
    _end: string,
  ): { start: number; end: number } {
    const current = new Date();
    const tempStart = new Date(_start);
    const tempEnd = new Date(_end);
    current.setHours(0, 0, 0, 0);
    tempStart.setHours(0, 0, 0, 0);
    tempEnd.setHours(0, 0, 0, 0);

    const start =
      (tempStart.getTime() - current.getTime()) / (24 * 60 * 60 * 1000);
    const end = (tempEnd.getTime() - current.getTime()) / (24 * 60 * 60 * 1000);
    return {
      start,
      end,
    };
  }

  /**
   * 计算周的前后间隔
   *
   * @param {string} _start
   * @param {string} _end
   * @return {*}  {{ start: number; end: number }}
   * @memberof DateUtil
   */
  computedWeeksSpace(
    _start: string,
    _end: string,
  ): { start: number; end: number } {
    const current = new Date();
    const tempStart = new Date(_start);
    const tempEnd = new Date(_end);
    // 初始化为每天开始时间
    current.setHours(0, 0, 0, 0);
    tempStart.setHours(0, 0, 0, 0);
    tempEnd.setHours(0, 0, 0, 0);

    // 计算周间隔
    const computedWeekInterval = (start: Date, end: Date): number => {
      const startMonday = this.getDateWeekMonday(start);
      const endMonday = this.getDateWeekMonday(end);
      const week =
        (endMonday.getTime() - startMonday.getTime()) /
        (7 * 24 * 60 * 60 * 1000);
      return week;
    };
    const start = computedWeekInterval(current, tempStart);
    const end = computedWeekInterval(current, tempEnd);
    return {
      start,
      end,
    };
  }

  /**
   * 计算月的前后间隔
   *
   * @param {string} _start
   * @param {string} _end
   * @return {*}  {{ start: number; end: number }}
   * @memberof DateUtil
   */
  computedMonthsSpace(
    _start: string,
    _end: string,
  ): { start: number; end: number } {
    const current = new Date();
    const startDate = new Date(_start);
    const endDate = new Date(_end);

    // 计算月度间隔
    const computedMonthInterval = (start: Date, end: Date) => {
      const startYear = start.getFullYear();
      const startMonth = start.getMonth() + 1;
      const endYear = end.getFullYear();
      const endMonth = end.getMonth() + 1;
      return (endYear - startYear) * 12 - startMonth + endMonth;
    };
    const start = computedMonthInterval(current, startDate);
    const end = computedMonthInterval(current, endDate);
    return {
      start,
      end,
    };
  }

  /**
   * 获取指定时间所在周的星期一
   *
   * @param {Date} date
   * @return {*}  {Date}
   * @memberof DateUtil
   */
  public getDateWeekMonday(date: Date): Date {
    const day = date.getDay();
    let week = day;
    if (day === 0) {
      week = 7;
    }
    const monday = date.getTime() - (week - 1) * 24 * 60 * 60 * 1000;
    return new Date(monday);
  }

  /**
   * 计算静态类型时间
   *
   * @param {('DAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR')} dateUnit
   * @param {string} _start
   * @param {string} _end
   * @return {*}  {{ start: number; end: number }}
   * @memberof DateUtil
   */
  computedStaticTime(
    dateUnit: 'DAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR',
    _start: string,
    _end: string,
  ): { start: number; end: number } {
    switch (dateUnit) {
      case 'DAY':
        return this.computedDaysTime(_start, _end);
      case 'WEEK':
        return this.computedWeeksTime(_start, _end);
      case 'MONTH':
        return this.computedMonthsTime(_start, _end);
      case 'QUARTER':
        return this.computedQuartersTime(_start, _end);
      case 'YEAR':
        return this.computedYearsTime(_start, _end);
      default:
        return this.computedDaysTime(_start, _end);
    }
  }

  /**
   *计算 天 的时间范围,返回开始和结束时间的秒数
   *
   * @param {string} _start
   * @param {string} _end
   * @return {*}  {{
   *     start: number;
   *     end: number;
   *   }}
   * @memberof DateUtil
   */
  public computedDaysTime(
    _start: string,
    _end: string,
  ): {
    start: number;
    end: number;
  } {
    const startDate = new Date(_start);
    const endDate = new Date(_end);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 0);
    const start = startDate.getTime() / 1000;
    const end = endDate.getTime() / 1000;
    return {
      start,
      end,
    };
  }

  /**
   * 计算 周 的时间范围,返回开始和结束时间的秒数
   *
   * @param {string} _start
   * @param {string} _end
   * @return {*}  {{ start: number; end: number }}
   * @memberof DateUtil
   */
  computedWeeksTime(
    _start: string,
    _end: string,
  ): { start: number; end: number } {
    const startDate = new Date(_start);
    const endDate = new Date(_end);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 0);
    const start = startDate.getTime() / 1000;
    const end = endDate.getTime() / 1000;
    return {
      start,
      end,
    };
  }

  /**
   * 计算 月 的时间范围,返回开始和结束时间的秒数
   *
   * @param {string} _start
   * @param {string} _end
   * @return {*}  {{ start: number; end: number }}
   * @memberof DateUtil
   */
  computedMonthsTime(
    _start: string,
    _end: string,
  ): { start: number; end: number } {
    const big = [1, 3, 5, 7, 8, 10, 12]; // 31天的月份
    const startDate = new Date(_start);
    const endDate = new Date(_end);
    startDate.setHours(0, 0, 0, 0);

    if (big.includes(endDate.getMonth() + 1)) {
      // 31天月份
      endDate.setDate(31);
    } else if (endDate.getMonth() === 1) {
      // 2月份，只有29天
      endDate.setDate(29);
    } else {
      // 其余月份，30天
      endDate.setDate(30);
    }
    endDate.setHours(23, 59, 59, 0);
    const start = startDate.getTime() / 1000;
    const end = endDate.getTime() / 1000;
    return {
      start,
      end,
    };
  }

  /**
   * 计算 季度 的时间范围,返回开始和结束时间的秒数
   *
   * @param {string} _start
   * @param {string} _end
   * @return {*}  {{ start: number; end: number }}
   * @memberof DateUtil
   */
  computedQuartersTime(
    _start: string,
    _end: string,
  ): { start: number; end: number } {
    const startDate = new Date(_start);
    const endDate = new Date(_end);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 0);
    const start = startDate.getTime() / 1000;
    const end = endDate.getTime() / 1000;
    return {
      start,
      end,
    };
  }

  /**
   * 计算 年 的时间范围,返回开始和结束时间的秒数
   *
   * @param {string} _start
   * @param {string} _end
   * @return {*}  {{ start: number; end: number }}
   * @memberof DateUtil
   */
  computedYearsTime(
    _start: string,
    _end: string,
  ): { start: number; end: number } {
    const startDate = new Date(_start);
    const endDate = new Date(_end);
    startDate.setHours(0, 0, 0, 0);
    endDate.setMonth(11);
    endDate.setDate(31);
    endDate.setHours(23, 59, 59, 0);
    const start = startDate.getTime() / 1000;
    const end = endDate.getTime() / 1000;
    return {
      start,
      end,
    };
  }
}
