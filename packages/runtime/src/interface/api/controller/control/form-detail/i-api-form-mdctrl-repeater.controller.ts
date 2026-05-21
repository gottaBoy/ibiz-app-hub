import { IApiData } from '@ibiz-template/core';
import { IDEForm } from '@ibiz/model-core';
import { IApiFormMDCtrlController } from './i-api-form-mdctrl.controller';
import { IApiEditFormController } from '../i-api-edit-form.controller';

/**
 * @description 表单多数据部件(重复器)控制器接口
 * @export
 * @interface IApiFormMDCtrlRepeaterController
 * @extends {IApiFormMDCtrlController}
 */
export interface IApiFormMDCtrlRepeaterController
  extends IApiFormMDCtrlController {
  /**
   * @description 多数据重复器对应的表单里的值
   * @type {(IApiData[] | IApiData | null)}
   * @memberof IApiFormMDCtrlRepeaterController
   */
  readonly value: IApiData[] | IApiData | null;
  /**
   * @description 是否允许排序
   * @type {boolean}
   * @memberof IApiFormMDCtrlRepeaterController
   */
  readonly enableSort: boolean;

  /**
   * @description 重复器样式
   * @type {('Grid' | 'MultiForm' | 'SingleForm')}
   * @memberof IApiFormMDCtrlRepeaterController
   */
  repeaterStyle: 'Grid' | 'MultiForm' | 'SingleForm';

  /**
   * @description 重复器的值是否是单项数据类型，true为数组格式，反之为对象格式
   * @type {boolean}
   * @memberof IApiFormMDCtrlRepeaterController
   */
  isSingleData: boolean;

  /**
   * @description 重复器表单
   * @type {IDEForm}
   * @memberof IApiFormMDCtrlRepeaterController
   */
  repeatedForm: IDEForm;

  /**
   * @description 重复器map
   * @type {Map<string, IApiEditFormController>}
   * @memberof IApiFormMDCtrlRepeaterController
   */
  repeaterMap: Map<string, IApiEditFormController>;

  /**
   * @description 设置重复器数据（修改主表单里重复器对应属性）
   * @param {(IApiData[] | IApiData | null)} value 重复器数据
   * @memberof IApiFormMDCtrlRepeaterController
   */
  setValue(value: IApiData[] | IApiData | null): void;

  /**
   * @description 添加或创建一条数据
   * @param {number} [index] 索引下标
   * @memberof IApiFormMDCtrlRepeaterController
   */
  create(index?: number): void;

  /**
   * @description 删除数据
   * @param {number} [index] 索引下标
   * @memberof IApiFormMDCtrlRepeaterController
   */
  remove(index?: number): void;
}
