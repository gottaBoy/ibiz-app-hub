import { IEditor } from '../ieditor';
import { ISysValueRule } from '../../valuerule/isys-value-rule';

/**
 *
 * 继承父接口类型值[NUMBER,MOBNUMBER]
 * @export
 * @interface INumberEditor
 */
export interface INumberEditor extends IEditor {
  /**
   * 最大值[MAXVALUE]
   * @type {number}
   * 来源  getMaxValue
   */
  maxValue?: number;

  /**
   * 最小值[MINVALUE]
   * @type {number}
   * 来源  getMinValue
   */
  minValue?: number;

  /**
   * 值规则
   *
   * @type {ISysValueRule}
   * 来源  getPSSysValueRule
   */
  sysValueRule?: ISysValueRule;

  /**
   * 浮点精度[PRECISION]
   * @type {number}
   * 来源  getPrecision
   */
  precision?: number;

  /**
   * 小数点位数[SCALE]
   * @type {number}
   * 来源  getScale
   */
  scale?: number;
}
