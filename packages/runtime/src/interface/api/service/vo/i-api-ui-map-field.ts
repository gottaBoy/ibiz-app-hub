/**
 * @description 界面映射字段信息接口
 * @export
 * @interface IApiUIMapField
 */
export interface IApiUIMapField {
  /**
   * @description 界面字段名
   * @type {string}
   * @memberof IApiUIMapField
   */
  uiKey: string;

  /**
   * @description 映射数据字段名
   * @type {string}
   * @memberof IApiUIMapField
   */
  dataKey: string;

  /**
   * @description 数据类型
   * @type {number}
   * @memberof IApiUIMapField
   */
  dataType?: number;

  /**
   * @description 是否存储到origin中
   * @type {boolean}
   * @default false
   * @memberof IApiUIMapField
   */
  isOriginField: boolean;

  /**
   * @description 当前项数据属性是否对应多个表单项
   * @type {boolean}
   * @default false
   * @memberof IApiUIMapField
   */
  isOneToMultiField: boolean;

  /**
   * @description 是否是请求需要的字段
   * @type {boolean}
   * @default true
   * @memberof IApiUIMapField
   */
  isRequestNeed: boolean;

  /**
   * @description 值转换
   * @param {unknown} value 任意类型的值
   * @returns {*}  {unknown}
   * @memberof IApiUIMapField
   */
  convertVal(value: unknown): unknown;
}
