import Variables from '@/constants/vars';
import RowItem from '@/models/data/row';
import { type PropType } from 'vue';

export default {
  /**
   * 每一列的宽度，默认80。单位：px
   */
  width: {
    type: [String, Number],
    default: Variables.default.tableColumnWidth
  },

  /**
   * 当前列要展示的字段 key
   */
  prop: String,

  /**
   * 当前列的表头显示文本。如果没有 label，则直接显示 prop 字段名称
   */
  label: String,

  /**
   * 是否合并，一个函数，抛出当前数据，接收true / false，true为合并当前行，与前置列合并
   */
  merge: {
    type: [Function, Boolean] as PropType<boolean | ((data: any) => boolean)>,
    default: () => false
  },

  /**
   * 居中显示
   */
  center: {
    type: Boolean,
    default: false
  },

  /**
   * 文本溢出显示省略号
   */
  ellipsis: {
    type: Boolean,
    default: false
  },

  /**
   * 自定义格式化显示日期。如果列内需要显示日期时间，提供一个格式化字符串
   * * 只有提供了该字段才会生效。哪怕只给了key，会使用 ISO8601 格式进行解析，例如：2020-04-02T08:02:17-05:00
   * * 注意，这里不能提供默认值，否则所有数据都会被作为日期解析
   */
  dateFormat: String,

  /**
   * 设置空数据显示内容。默认 "无数据 😢"
   */
  emptyData: {
    type: String,
    default: undefined
  },

  /**
   * 内容样式
   */
  columnStyle: {
    type: [Object, String],
    default: () => ({})
  },

  /**
   * 内容类名
   */
  columnClass: {
    type: [Object, String],
    default: () => ({})
  },

  // ********* 内部参数 ********* //
  data: RowItem,
  __index: Number,
  __renderTitle: Boolean,
  __renderTitleLabel: String,
  __renderTitleProps: Object
};
