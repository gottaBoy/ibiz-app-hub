import { IApiData } from '@ibiz-template/core';
import { IApiEditFormController } from '../i-api-edit-form.controller';
import { IApiFormMDCtrlController } from './i-api-form-mdctrl.controller';
import { IApiFormMDCtrlFormState } from '../../../state';

/**
 * @description 表单多数据部件（表单）控制器接口
 * @export
 * @interface IApiFormMDCtrlFormController
 * @extends {IApiFormMDCtrlController}
 */
export interface IApiFormMDCtrlFormController extends IApiFormMDCtrlController {
  /**
   * @description 表单多数据部件（表单）状态
   * @type {IApiFormMDCtrlFormState}
   * @memberof IApiFormMDCtrlFormController
   */
  state: IApiFormMDCtrlFormState;
  /**
   * @description 表单控制器Map
   * @type {Map<string, IApiEditFormController>}
   * @memberof IApiFormMDCtrlFormController
   */
  formMap: Map<string, IApiEditFormController>;

  /**
   * @description 实体上下文主键标识
   * @type {string}
   * @memberof IApiFormMDCtrlFormController
   */
  deName: string;

  /**
   * @description 数据集合
   * @type {IApiData[]}
   * @memberof IApiFormMDCtrlFormController
   */
  items: IApiData[];

  /**
   * @description 加载实体的数据
   * @returns {*}  {Promise<void>}
   * @memberof IApiFormMDCtrlFormController
   */
  fetchData(): Promise<void>;

  /**
   * @description 更新数据,仅支持更新临时数据
   * @returns {*}  {Promise<void>}
   * @memberof IApiFormMDCtrlFormController
   */
  updateData(): Promise<void>;

  /**
   * @description 删除数据
   * @param {string} id 数据标识
   * @returns {*}  {Promise<void>}
   * @memberof IApiFormMDCtrlFormController
   */
  remove(id: string): Promise<void>;

  /**
   * @description 新建数据
   * @param {number} [index] 索引下标
   * @memberof IApiFormMDCtrlFormController
   */
  create(index?: number): void;
}
