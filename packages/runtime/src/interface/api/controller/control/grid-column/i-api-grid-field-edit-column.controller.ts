import { IDEGridEditItem } from '@ibiz/model-core';
import { IApiData } from '@ibiz-template/core';
import { IApiGridFieldColumnController } from './i-api-grid-field-column.controller';
import { IApiGridRowState } from '../../../state';

/**
 * @description 表格编辑列控制器
 * @export
 * @interface IApiGridFieldEditColumnController
 * @extends {IApiGridFieldColumnController}
 */
export interface IApiGridFieldEditColumnController
  extends IApiGridFieldColumnController {
  /**
   * @description 表格编辑项模型
   * @type {IDEGridEditItem}
   * @memberof IApiGridFieldEditColumnController
   */
  editItem: IDEGridEditItem;

  /**
   * @description 值规则
   * @type {IApiData[]}
   * @memberof IApiGridFieldEditColumnController
   */
  rules: IApiData[];

  /**
   * @description 值项
   * @type {(string | undefined)}
   * @memberof IApiGridFieldEditColumnController
   */
  readonly valueItemName: string | undefined;

  /**
   * @description 设置行属性的值
   * @param {IApiGridRowState} row 行数据状态
   * @param {unknown} value 要设置的值
   * @param {string} [name] 要设置的行数据的属性名称
   * @param {boolean} [ignore] 忽略脏值检查，默认值为false
   * @returns {*}  {Promise<void>}
   * @memberof IApiGridFieldEditColumnController
   */
  setRowValue(
    row: IApiGridRowState,
    value: unknown,
    name?: string,
    ignore?: boolean,
  ): Promise<void>;

  /**
   * @description 表格编辑项值规则校验（如果表格编辑项不显示则不校验直接返回true）
   * @param {IApiGridRowState} row 行数据状态
   * @returns {*}  {Promise<boolean>}
   * @memberof IApiGridFieldEditColumnController
   */
  validate(row: IApiGridRowState): Promise<boolean>;
}
