/**
 * 计算模式列表
 */
import { biReportT } from '../locale';

export const aggModeList = [
  {
    get name() {
      return biReportT('total');
    },
    value: 'SUM',
  },
  {
    get name() {
      return biReportT('average');
    },
    value: 'AVG',
  },
  {
    get name() {
      return biReportT('maximum');
    },
    value: 'MAX',
  },
  {
    get name() {
      return biReportT('minimum');
    },
    value: 'MIN',
  },
  {
    get name() {
      return biReportT('count');
    },
    value: 'COUNT',
  },
];
