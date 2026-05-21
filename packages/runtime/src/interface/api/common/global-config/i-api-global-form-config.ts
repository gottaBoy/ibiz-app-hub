/**
 * @description 全局表单配置
 * @export
 * @interface IApiGlobalFormConfig
 */
export interface IApiGlobalFormConfig {
  /**
   * @description 多数据部件删除前是否需要确认
   * @type {boolean}
   * @default true
   * @platform web
   * @memberof IApiGlobalFormConfig
   */
  mdCtrlConfirmBeforeRemove: boolean;

  /**
   * @description 移动端是否展示表单项下方下划线
   * @type {boolean}
   * @default true
   * @platform mob
   * @memberof IApiGlobalFormConfig
   */
  mobShowUnderLine: boolean;

  /**
   * @description 移动端文本在输入框中的位置
   * @type {('right' | 'left' | '')}
   * @platform mob
   * @memberof IApiGlobalFormConfig
   */
  mobFormItemAlignMode: 'right' | 'left' | '';

  /**
   * @description 移动端是否显示表单项边框
   * @type {boolean}
   * @default false
   * @platform mob
   * @memberof IApiGlobalFormConfig
   */
  mobShowEditorBorder: boolean;

  /**
   * @description 隐藏无值的单位
   * @type {boolean}
   * @default true
   * @platform web
   * @memberof IApiGlobalFormConfig
   */
  emptyHiddenUnit: boolean;

  /**
   * @description 显示属性提示图标
   * @type {boolean}
   * @default true
   * @platform web
   * @memberof IApiGlobalFormConfig
   */
  showTipsIcon: boolean;

  /**
   * @description 校验模式(default:默认模式,错误信息显示在表单项下方；notification:通知模式，错误信息显示在页面右上角弹框中)
   * @type {('default' | 'notification')}
   * @default default
   * @platform web
   * @memberof IApiGlobalFormConfig
   */
  validateMode: 'default' | 'notification';

  /**
   * @description 是否启用缓存(目前仅表单分页部件支持)
   * @type {boolean}
   * @default false
   * @platform web
   * @memberof IApiGlobalFormConfig
   */
  srfCachePos: boolean;

  /**
   * @description 缓存标识(目前仅表单分页部件支持)
   * @type {string}
   * @platform web
   * @memberof IApiGlobalFormConfig
   */
  srfCacheKeyTempl: string;

  /**
   * @description 是否启用表单jsonschema。参数为true时，会请求服务获取jsonschema对象，并根据该对象的enumOptions属性值计算生成表单项编辑器的代码表数据集合
   * @type {boolean}
   * @default false
   * @platform web
   * @platform mob
   * @memberof IApiGlobalFormConfig
   */
  enableDynaFormJsonSchema: boolean;
}
