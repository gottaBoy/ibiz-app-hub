import { IUIActionGroupDetail } from '@ibiz/model-core';
import { IApiGridRowState } from '../../../state';
import { IApiGridColumnController } from './i-api-grid-column.controller';
/**
 * @description 表格属性列控制器
 * @export
 * @interface IApiGridFieldColumnController
 * @extends {IApiGridColumnController}
 */
export interface IApiGridFieldColumnController
  extends IApiGridColumnController {
  /**
   * @description 是否是链接列
   * @type {boolean}
   * @memberof IApiGridFieldColumnController
   */
  readonly isLinkColumn: boolean;

  /**
   * @description 是否可触发界面行为
   * @type {boolean}
   * @memberof IApiGridFieldColumnController
   */
  readonly hasAction: boolean;

  /**
   * @description 属性列对应值在数据里的属性字段名称
   * @type {string}
   * @memberof IApiGridFieldColumnController
   */
  readonly fieldName: string;

  /**
   * @description 单位
   * @type {(string | undefined)}
   * @memberof IApiGridFieldColumnController
   */
  readonly unitName: string | undefined;

  /**
   * @description 格式化值
   * @param {unknown} value 属性值
   * @returns {*}  {string}
   * @memberof IApiGridFieldColumnController
   */
  formatValue(value: unknown): string;

  /**
   * @description 打开链接视图
   * @param {IApiGridRowState} row 行数据状态
   * @param {MouseEvent} event 鼠标事件
   * @returns {*}  {Promise<void>}
   * @memberof IApiGridFieldColumnController
   */
  openLinkView(row: IApiGridRowState, event: MouseEvent): Promise<void>;

  /**
   * @description 触发表格列附加界面行为
   * @param {IApiGridRowState} row 行数据状态
   * @param {MouseEvent} event 鼠标事件
   * @returns {*}  {Promise<void>}
   * @memberof IApiGridFieldColumnController
   */
  triggerAction(row: IApiGridRowState, event: MouseEvent): Promise<void>;

  /**
   * @description 触发界面行为组点击事件
   * @param {IUIActionGroupDetail} detail 界面行为组成员模型
   * @param {IApiGridRowState} row 行数据状态
   * @param {MouseEvent} event 鼠标事件
   * @returns {*}  {Promise<void>}
   * @memberof IApiGridFieldColumnController
   */
  onActionClick(
    detail: IUIActionGroupDetail,
    row: IApiGridRowState,
    event: MouseEvent,
  ): Promise<void>;
}
