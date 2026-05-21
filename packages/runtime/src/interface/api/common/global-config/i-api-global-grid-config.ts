/**
 * @description 全局表格配置
 * @export
 * @interface IApiGlobalGridConfig
 */
export interface IApiGlobalGridConfig {
  /**
   * @description 表格行编辑呈现模式，cell 每次只呈现悬浮点击之后的一个单元格的编辑态；row 每次呈现编辑中的那一行所有单元格的编辑态；all 呈现所有编辑项的编辑态
   * @type {('cell' | 'row' | 'all')}
   * @default row
   * @platform web
   * @memberof IApiGlobalGridConfig
   */
  editShowMode: 'cell' | 'row' | 'all';

  /**
   * @description 表格行编辑保存模式，cell-blur 单元格失焦时保存整行数据；auto 自动保存，将每隔 3 秒保存一次值变更后的行数据；manual 手动保存，由界面行为调用表格整体保存或行保存
   * @type {('cell-blur' | 'auto' | 'manual')}
   * @default cell-blur
   * @platform web
   * @memberof IApiGlobalGridConfig
   */
  editSaveMode: 'cell-blur' | 'auto' | 'manual';

  /**
   * @description 表格保存错误处理模式，default：表格保存失败，界面弹出错误信息，编辑错误项切换为错误状态（红色边框、hover显示错误信息）；reset：表格保存失败，界面弹出错误信息，编辑错误项还原为保存之前的值
   * @type {('default' | 'reset')}
   * @default default
   * @platform web
   * @memberof IApiGlobalGridConfig
   */
  saveErrorHandleMode: 'default' | 'reset';

  /**
   * @description 单元格超出呈现模式,wrap 换行，高度自动增高；ellipsis 省略，出...，悬浮出tooltip
   * @type {('wrap' | 'ellipsis')}
   * @default wrap
   * @platform web
   * @memberof IApiGlobalGridConfig
   */
  overflowMode: 'wrap' | 'ellipsis';

  /**
   * @description 表格列格式化值时控制无值状态下单位的显示逻辑，当表格属性列配置了值格式化且绑定属性存在值时，此参数生效。若属性值格式化后无值，该参数为 true 则隐藏单位，为 false 则显示单位
   * @type {boolean}
   * @default true
   * @platform web
   * @memberof IApiGlobalGridConfig
   */
  emptyHiddenUnit: boolean;
}
