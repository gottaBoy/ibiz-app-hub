/* eslint-disable no-plusplus */
/* eslint-disable no-continue */
/* eslint-disable no-useless-escape */
import { RuntimeError } from '@ibiz-template/core';
import { ValueOP } from '@ibiz-template/runtime';
import { IPqlItem } from '../interface';
import { ExcludeOPs } from './fliter-util';
import { biReportT } from '../locale';

// 过滤操作模式
const FilterModes = [
  {
    valueOP: ValueOP.EQ,
    get label() {
      return biReportT('operators.equal');
    },
    sqlOP: '=',
  },
  {
    valueOP: ValueOP.NOT_EQ,
    get label() {
      return biReportT('operators.notEqual');
    },
    sqlOP: '<>',
  },
  {
    valueOP: ValueOP.GT,
    get label() {
      return biReportT('operators.greater');
    },
    sqlOP: '>',
  },
  {
    valueOP: ValueOP.GT_AND_EQ,
    get label() {
      return biReportT('operators.greaterOrEqual');
    },
    sqlOP: '>=',
  },
  {
    valueOP: ValueOP.LT,
    get label() {
      return biReportT('operators.less');
    },
    sqlOP: '<',
  },
  {
    valueOP: ValueOP.LT_AND_EQ,
    get label() {
      return biReportT('operators.lessOrEqual');
    },
    sqlOP: '<=',
  },
  {
    valueOP: ValueOP.IS_NULL,
    get label() {
      return biReportT('operators.empty');
    },
    sqlOP: 'IS NULL',
  },
  {
    valueOP: ValueOP.IS_NOT_NULL,
    get label() {
      return biReportT('operators.notEmpty');
    },
    sqlOP: 'IS NOT NULL',
  },
  {
    valueOP: ValueOP.IN,
    get label() {
      return biReportT('operators.in');
    },
    sqlOP: 'IN',
  },
  {
    valueOP: ValueOP.NOT_IN,
    get label() {
      return biReportT('operators.notIn');
    },
    sqlOP: 'NOT IN',
  },
  {
    valueOP: ValueOP.LIKE,
    get label() {
      return biReportT('operators.contains');
    },
    sqlOP: 'LIKE',
  },
  // { valueOP: ValueOP.EXISTS, label: '存在', sqlOP: 'EXISTS' },
  // { valueOP: ValueOP.NOT_EXISTS, label: '不存在', sqlOP: 'NOT EXISTS' },
];

// 过滤操作模式映射
const filterModeMap = new Map();
FilterModes.forEach(mode => {
  filterModeMap.set(mode.valueOP, mode);
});
// 过滤操作符号映射
const symbolMap = new Map();
FilterModes.forEach(mode => {
  symbolMap.set(mode.sqlOP, mode.valueOP);
});

// 解析自定义条件
export const parseCustomCond = (cond: string): IData[] | undefined => {
  try {
    const items = cond.split(`  `);
    const pqlItems: IPqlItem[] = [];
    for (let i = 0; i < items.length; i++) {
      if (i !== 0) {
        const connection = items[i];
        if (connection === 'and' || connection === 'or') {
          if (i === items.length - 1) {
            throw new RuntimeError(biReportT('pqlParseError'));
          }
          pqlItems.push({
            type: 'connection',
            value: {
              label: connection,
              value: connection,
            },
          });
        } else {
          throw new RuntimeError(biReportT('pqlParseError'));
        }
      }
      const key = items[i !== 0 ? ++i : i];
      const operator = items[++i];

      if (key && /^\$/.test(key) && operator) {
        const keyObj: IData = JSON.parse(key.slice(1));
        if (ExcludeOPs.includes(symbolMap.get(operator))) {
          pqlItems.push({
            type: 'condition',
            key: {
              label: keyObj.caption,
              value: keyObj.name,
            },
            operator: {
              label: filterModeMap.get(symbolMap.get(operator))?.label || '',
              value: symbolMap.get(operator),
            },
          });
          continue;
        } else {
          const value = items[++i];
          if (value) {
            const valueObj: IData = /^\$/.test(value)
              ? JSON.parse(value.slice(1))
              : { caption: value, value };
            pqlItems.push({
              type: 'condition',
              key: {
                label: keyObj.caption,
                value: keyObj.name,
              },
              operator: {
                label: filterModeMap.get(symbolMap.get(operator))?.label || '',
                value: symbolMap.get(operator),
              },
              value: {
                type: /^\$/.test(value) ? 'pql-field-value' : undefined,
                label: valueObj.caption,
                value: valueObj.value,
              },
            });
            continue;
          }
        }
      }
      throw new RuntimeError(biReportT('pqlParseError'));
    }
    return pqlItems;
  } catch (err) {
    ibiz.log.error((err as IData)?.message);
  }
};
