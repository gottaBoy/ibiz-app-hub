import { IApiContext, IApiParams } from '@ibiz-template/core';
import { IDEGridColumn, IDEGridDataItem } from '@ibiz/model-core';
import { IApiGridRowState } from '../../../state';
import { IApiGridController } from '../i-api-grid.controller';

/**
 * @description 表格列控制器
 * @export
 * @interface IApiGridColumnController
 */
export interface IApiGridColumnController {
  /**
   * @description 表格列模型
   * @type {IDEGridColumn}
   * @memberof IApiGridColumnController
   */
  readonly model: IDEGridColumn;

  /**
   * @description 表格控制器
   * @type {IApiGridController}
   * @memberof IApiGridColumnController
   */
  readonly grid: IApiGridController;

  /**
   * @description 是否是自适应列
   * @type {boolean}
   * @memberof IApiGridColumnController
   */
  isAdaptiveColumn: boolean;

  /**
   * @description 是否是脚本代码列
   * @type {boolean}
   * @memberof IApiGridColumnController
   */
  isCustomCode: boolean;

  /**
   * @description 上下文
   * @type {IApiContext}
   * @memberof IApiGridColumnController
   */
  readonly context: IApiContext;

  /**
   * @description 视图参数
   * @type {IApiParams}
   * @memberof IApiGridColumnController
   */
  readonly params: IApiParams;

  /**
   * @description 该列是否启用行编辑
   * @type {boolean}
   * @memberof IApiGridColumnController
   */
  readonly enableRowEdit: boolean;

  /**
   * @description 该列对应数据项
   * @returns {*}  {(IDEGridDataItem | undefined)}
   * @memberof IApiGridColumnController
   */
  readonly deGridDataItem: IDEGridDataItem | undefined;

  /**
   * @description 值格式化
   * @type {(string | undefined)}
   * @memberof IApiGridColumnController
   */
  readonly valueFormat: string | undefined;

  /**
   * @description 数据类型（数值）
   * @type {(number | undefined)}
   * @memberof IApiGridColumnController
   */
  readonly dataType: number | undefined;

  /**
   * @description 解析获取脚本代码html
   * @param {IApiGridRowState} row 行数据状态
   * @returns {*}  {(Promise<string | undefined>)}
   * @memberof IApiGridColumnController
   */
  getCustomHtml(row: IApiGridRowState): Promise<string | undefined>;
}
