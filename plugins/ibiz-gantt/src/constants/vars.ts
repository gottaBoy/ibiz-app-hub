// 所有的默认变量
export const Variables = {
  noData: '无数据 😢',

  name: {
    root: 'XGantt',
    column: 'XGanttColumn',
    slider: 'XGanttSlider'
  },

  slots: {
    settings: 'settings'
  },

  size: {
    minContentRowHeight: 20,
    maxContentRowHeight: 70,
    minHeaderHeight: 30,
    minTableColumnWidth: 40,
    ganttColumnWidth: {
      small: {
        hour: 15,
        day: 15,
        week: 5,
        month: 3
      },
      normal: {
        hour: 30,
        day: 30,
        week: 10,
        month: 7
      },
      large: {
        hour: 60,
        day: 60,
        week: 20,
        month: 14
      }
    }
  },

  default: {
    headerHeight: 80,
    rowHeight: 30,
    ganttColumnWidth: 60,
    tableColumnWidth: 80,
    startKey: 'startDate',
    endKey: 'endDate',
    idKey: 'id',
    children: 'children',
    leaf: 'leaf',
    linkProps: {
      fromKey: 'from',
      toKey: 'to',
      linkKey: 'id',
      relationTypeKey: 'relationType',
    },
  },

  time: {
    millisecondOf: {
      millisecond: 1,
      second: 1000,
      minute: 60000,
      hour: 3600000,
      day: 86400000,
      week: 604800000
    } as any,
    aggregation: {
      month: 'year',
      week: 'month',
      day: 'month',
      hour: 'day',
      minute: 'hour'
    }
  }
};

export default Variables;
