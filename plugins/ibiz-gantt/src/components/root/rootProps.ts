import { type PropType, type Slots } from 'vue';
import { Errors } from '@/constants/errors';
import { Variables } from '@/constants/vars';
import { parseNumber } from '@/utils/common';

export default {
  // 内部使用
  slots: { type: Object as PropType<Slots>, default: () => ({}) },

  /**
   * 数据列表
   */
  data: {
    type: Array as PropType<any[]>,
    default: () => [],
  },

  links: {
    type: Array as PropType<any[]>,
    default: () => [],
  },

  /**
   * 链接数据配置项
   */
  linkProps: {
    type: Object as PropType<{
      fromKey: string;
      toKey: string;
      relationTypeKey: string;
      linkKey: string;
    }>,
    default: Variables.default.linkProps,
  },

  /**
   * 数据索引的label，默认 id。应当确保它是唯一的，如果不是，则会引起渲染错误。
   */
  dataId: {
    type: String,
    default: Variables.default.idKey,
  },

  /**
   * 数据中起始日期的label，默认值：startDate，如果找不到，则不会渲染甘特条
   */
  startKey: {
    type: String,
    default: Variables.default.startKey,
  },

  /**
   * 数据中截止日期的label，默认值：endDate。如果找不到，同时没有起始日期，则不会渲染甘特条
   */
  endKey: {
    type: String,
    default: Variables.default.endKey,
  },

  /**
   * 数据的子集属性
   */
  children: {
    type: String,
    default: Variables.default.children,
  },

  /**
   * 数据的叶子节点属性
   */
  leaf: {
    type: String,
    default: Variables.default.leaf,
  },

  /**
   * 接收一个表头高度，默认值为80。如果高度过小，且表头过于复杂，可能会引起高度异常
   */
  headerHeight: {
    type: [Number, String],
    default: Variables.default.headerHeight,
    validator: (v: number | string) => {
      const r = parseNumber(v) >= Variables.size.minHeaderHeight;
      if (!r) {
        throw Errors.propsError(
          `"headerHeight" should be at least ${Variables.size.minHeaderHeight}.`,
        );
      }
      return r;
    },
  },

  /**
   * 接收一个内容的行高，应该保证大于20，默认行高30（含1px的border）
   */
  rowHeight: {
    type: [Number, String],
    default: Variables.default.rowHeight,
    validator: (v: number | string) => {
      const minR = parseNumber(v) >= Variables.size.minContentRowHeight;
      if (!minR) {
        throw Errors.propsError(
          `"rowHeight" should be at least ${Variables.size.minContentRowHeight}.`,
        );
      }

      const maxR = parseNumber(v) <= Variables.size.maxContentRowHeight;
      if (!maxR) {
        throw Errors.propsError(
          `"rowHeight" should be no more than ${Variables.size.maxContentRowHeight}.`,
        );
      }
      return minR && maxR;
    },
  },

  /**
   * 边框尺寸，0 为不显示。默认为 1
   */
  border: {
    type: Number,
    default: 1,
    validator: (v: number) => {
      const r = parseNumber(v) >= 0;
      if (!r) {
        throw Errors.propsError(`"border" should be a nonnegative integer.`);
      }
      return r;
    },
  },

  /**
   * border 颜色
   */
  borderColor: {
    type: String,
  },

  /**
   * 是否显示复选框，默认为隐藏
   */
  showCheckbox: {
    type: Boolean,
  },

  /**
   * 是否显示展开按钮，如果为否，则全部展开。默认为是
   */
  showExpand: {
    type: Boolean,
    default: true,
  },

  /**
   * 展开所有数据，默认展开。仅当传入了 `showExpand` 才生效
   */
  expandAll: {
    type: Boolean,
    default: true,
  },

  /**
   * 展开字段状态字段，如果该字段为空，则根据 expandAll 处理
   */
  expandKey: {
    type: String,
    default: '',
  },

  /**
   * 显示展开按钮列名称，如果该字段为空，则默认第一列展示展开按钮
   */
  expandColumnName: {
    type: String,
    default: null,
  },

  /**
   * 虚拟表格预加载数量
   */
  preload: {
    type: Number,
    default: 5,
  },

  /**
   * 甘特图表的每一列宽度
   */
  ganttColumnSize: {
    type: [String, Object] as PropType<GanttColumnSize>,
    default: 'normal',
    validator: (v: GanttColumnSize) => {
      return typeof v === 'object' || ['small', 'normal', 'large'].includes(v);
    },
  },

  /**
   * 显示甘特图的今日线
   */
  showToday: {
    type: Boolean,
    default: true,
  },

  /**
   * 显示甘特图的周末背景
   */
  showWeekend: {
    type: Boolean,
    default: true,
  },

  /**
   * 定义层级颜色，循环显示
   */
  levelColor: {
    type: Array as PropType<string[]>,
    default: () => {
      return [];
    },
  },

  /**
   * 头部样式，一个对象
   */
  headerStyle: {
    type: Object as PropType<HeaderOptions>,
    default: () => {
      return {};
    },
  },

  /**
   * 内容样式，一个对象
   */
  bodyStyle: {
    type: Object as PropType<BodyOptions>,
    default: () => {
      return {};
    },
  },

  /**
   * 暗黑模式
   */
  dark: {
    type: Boolean,
    default: false,
  },

  /**
   * 主色。它会显示在表头以及按钮上
   */
  primaryColor: {
    type: String,
    default: '#eca710',
  },

  /**
   * 日期单位
   */
  unit: {
    type: String as PropType<HeaderDateUnit>,
    default: 'day',
    validator: (v: HeaderDateUnit) => {
      return ['month', 'week', 'day', 'hour'].includes(v);
    },
  },

  /**
   * 允许鼠标悬停高亮表头对应日期
   */
  highlightDate: {
    type: Boolean,
    default: false,
  },

  /**
   * 允许点击行时，将甘特进度条滚动到可视区域
   */
  sliderIntoView: {
    type: Boolean,
    default: false,
  },

  /**
   * 允许拖拽
   */
  draggable: {
    type: [Object, Boolean] as PropType<boolean | Partial<DraggableOptions>>,
    default: false,
  },

  /**
   * 拖拽时判定目标节点能否成为拖动目标位置
   */
  allowDrop: Function,

  /**
   * 判断节点能否被拖拽
   */
  allowDrag: Function,

  /**
   * 启用时间自动补全。启用后，按照当前的时间单位，开始时间设置为时间的开始，结束时间设置为时间的结束。示例：时间单位为'day'，开始时间（2025-05-13 12:12:12）、结束时间（2025-05-13 12:12:12），开启后，开始时间（2025-05-13 00:00:00）、结束时间（2025-05-13 23:59:59）
   */
  enableDateCompletion: {
    type: Boolean,
    default: false,
  },

  /**
   * 头部拖拽
   */
  headerDrag: {
    type: Boolean,
    default: false,
  },

  /**
   * 时间范围（指定甘特的时间显示范围）
   */
  dateRange: {
    type: Object as PropType<DateRange>,
  },

  /**
   * 根据数组内周天数显示列 ( [0, 1, 2, 3, 4, 5, 6] 其中0代表周日，1代表周一，依此类推 )
   */
  showWeekdays: {
    type: Array as PropType<Array<number>>,
    default: [0, 1, 2, 3, 4, 5, 6],
  },

  /**
   * 显示视图工具栏
   */
  showViewToolbar: {
    type: Boolean,
    default: true,
  },

  /**
   * 国际化
   */
  locale: {
    type: String,
    default: 'en',
  },

  /**
   * 自定义节日
   */
  holidays: {
    type: Array as PropType<
      Array<{ date: LikeDate | LikeDate[]; color?: string }>
    >,
    default: () => [],
  },
};
