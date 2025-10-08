/* eslint-disable no-plusplus */
/* eslint-disable no-restricted-globals */
import dayjs from 'dayjs';

/**
 * 时间尺度
 */
export type TimeScale =
  | 'year'
  | 'quarter'
  | 'month'
  | 'week'
  | 'yearweek'
  | 'day';

/**
 * @description 根据尺度格式化时间
 * @export
 * @param {string} val 时间
 * @param {TimeScale} timeScale 时间尺度
 * @returns {*}  {string}
 */
export function formatDateByScale(val: string, timeScale: TimeScale): string {
  let value = val;
  const date = new Date(val);
  if (!val || isNaN(date.getTime())) return value;
  const year = dayjs(date).year();
  const type = timeScale === 'yearweek' ? 'week' : timeScale;
  switch (type) {
    case 'year':
      value = `${year}`;
      break;
    case 'quarter':
      value = `${year} ${dayjs(date).quarter()}${ibiz.i18n.t('runtime.controller.utils.util.quarter')}`;
      break;
    case 'month':
      value = `${year} ${dayjs(date).month() + 1}${ibiz.i18n.t('runtime.controller.utils.util.month')}`;
      break;
    case 'week':
      value = `${year} ${dayjs(date).week()}${ibiz.i18n.t('runtime.controller.utils.util.week')}`;
      break;
    case 'day':
      value = dayjs(date).format('YYYY-MM-DD');
      break;
    default:
      break;
  }
  return value;
}

/**
 * @description 获取某年的总周数
 * @param {number} year 年份
 * @returns {*}  {number}
 */
export function getWeeksInYear(year: number): number {
  const lastDayOfYear = dayjs(`${year}-12-31`);
  const week = lastDayOfYear.isoWeek();
  return week === 1 ? 52 : week;
}

/**
 * @description 生成年周数组
 * 如：['2025-23', '2025-24', '2025-25']
 * @export
 * @param {string} minYearWeek 最小年周
 * @param {string} maxYearWeek 最大年周
 * @param {number} [paddingWeeks=0] 前后范围
 * @returns {*}  {string[]}
 */
export function generateYearWeekRange(
  minYearWeek: string,
  maxYearWeek: string,
  paddingWeeks = 0,
): string[] {
  // 1. 解析最小和最大年周
  const [minYear, minWeek] = minYearWeek.split('-').map(Number);
  const [maxYear, maxWeek] = maxYearWeek.split('-').map(Number);

  // 2. 计算起始年周（minYearWeek - paddingWeeks）
  let startYear = minYear;
  let startWeek = minWeek - paddingWeeks;
  while (startWeek < 1) {
    startYear--;
    startWeek += getWeeksInYear(startYear);
  }

  // 3. 计算结束年周（maxYearWeek + paddingWeeks）
  let endYear = maxYear;
  let endWeek = maxWeek + paddingWeeks;
  const maxWeeksInEndYear = getWeeksInYear(endYear);
  if (endWeek > maxWeeksInEndYear) {
    endWeek -= maxWeeksInEndYear;
    endYear++;
  }

  // 4. 生成从 startYear-startWeek 到 endYear-endWeek 的所有年周
  const yearWeeks = [];
  let currentYear = startYear;
  let currentWeek = startWeek;

  while (
    currentYear < endYear ||
    (currentYear === endYear && currentWeek <= endWeek)
  ) {
    yearWeeks.push(`${currentYear}-${currentWeek}`);

    currentWeek++;
    const weeksInCurrentYear = getWeeksInYear(currentYear);
    if (currentWeek > weeksInCurrentYear) {
      currentYear++;
      currentWeek = 1;
    }
  }

  return yearWeeks;
}

/**
 * @description 根据尺度计算时间范围
 * @export
 * @param {string} val 时间
 * @param {TimeScale} timeScale 时间尺度
 * @returns {*}  {({
 *       start: string;
 *       end: string;
 *     }
 *   | undefined)}
 */
export function calcDateRangeByScale(
  val: string,
  timeScale: TimeScale,
):
  | {
      start: string;
      end: string;
    }
  | undefined {
  if (!val || isNaN(new Date(val).getTime())) return;
  let date = dayjs(val);
  const type = timeScale === 'yearweek' ? 'week' : timeScale;
  switch (type) {
    case 'year':
      date = date.year(date.year());
      break;
    case 'quarter':
      date = date.quarter(date.quarter());
      break;
    case 'month':
      date = date.month(date.month());
      break;
    case 'week':
      date = date.week(date.week());
      break;
    case 'day':
      date = date.date(date.date());
      break;
    default:
      break;
  }
  return {
    start: date.startOf(type).format('YYYY-MM-DD HH:mm:ss'),
    end: date.endOf(type).format('YYYY-MM-DD HH:mm:ss'),
  };
}

/**
 * @description 根据时间尺度比较两个日期是否相等
 * @export
 * @param {(string | Date)} dateStr1 时间1
 * @param {(string | Date)} dateStr2 时间2
 * @param {TimeScale} timeScale
 * @returns {*}  {boolean}
 */
export function compareDateEqualByScale(
  dateStr1: string | Date,
  dateStr2: string | Date,
  timeScale: TimeScale,
): boolean {
  let result: boolean = false;
  const date1 = dayjs(dateStr1);
  const date2 = dayjs(dateStr2);

  if (!dateStr1 || !dateStr2 || !date1.isValid() || !date2.isValid())
    return result;

  switch (timeScale) {
    case 'year':
      result = date1.isSame(date2, 'year');
      break;
    case 'quarter':
      result = date1.isSame(date2, 'quarter');
      break;
    case 'month':
      result = date1.isSame(date2, 'month');
      break;
    case 'week':
      result = date1.isSame(date2, 'week');
      break;
    case 'day':
      result = date1.isSame(date2, 'day');
      break;
    default:
      break;
  }

  return result;
}
