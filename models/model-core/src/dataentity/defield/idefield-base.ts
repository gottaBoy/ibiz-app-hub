import { IModelObject } from '../../imodel-object';

/**
 *
 * 实体属性模型基对象接口，实体属性、应用实体属性等模型对象都继承该接口
 * @export
 * @interface IDEFieldBase
 */
export interface IDEFieldBase extends IModelObject {
  /**
   * 最大值（字符串）
   * @type {string}
   * 来源  getMaxValueString
   */
  maxValueString?: string;

  /**
   * 最小字符串长度
   * @type {number}
   * @default 0
   * 来源  getMinStringLength
   */
  minStringLength?: number;

  /**
   * 最小值（字符串）
   * @type {string}
   * 来源  getMinValueString
   */
  minValueString?: string;

  /**
   * 精度（废弃，使用getScale）
   * @type {number}
   * @default 0
   * 来源  getPrecision
   */
  precision?: number;

  /**
   * 小数点位数
   * @type {number}
   * @default -1
   * 来源  getScale
   */
  scale?: number;

  /**
   * 字符串长度
   * @type {number}
   * @default 0
   * 来源  getStringLength
   */
  stringLength?: number;
}
