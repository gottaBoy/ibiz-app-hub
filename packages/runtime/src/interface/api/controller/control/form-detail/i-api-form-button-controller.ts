import { IApiFormButtonState } from '../../../state';
import { IApiFormDetailController } from './i-api-form-detail.controller';
/**
 * @description 表单按钮控制器
 * @export
 * @interface IApiFormButtonController
 * @extends {IApiFormDetailController}
 */
export interface IApiFormButtonController extends IApiFormDetailController {
  /**
   * @description 表单按钮状态
   * @type {IApiFormButtonState}
   * @memberof IApiFormButtonController
   */
  state: IApiFormButtonState;
  /**
   * @description 表单按钮点击
   * @param {MouseEvent} event 鼠标事件
   * @returns {*}  {Promise<void>}
   * @memberof IApiFormButtonController
   */
  onClick(event: MouseEvent): Promise<void>;

  /**
   * @description 执行界面行为
   * @param {MouseEvent} event 鼠标事件
   * @returns {*}  {Promise<void>}
   * @memberof IApiFormButtonController
   */
  doUIAction(event: MouseEvent): Promise<void>;

  /**
   * @description 执行表单项更新
   * @param {MouseEvent} event 鼠标事件
   * @returns {*}  {Promise<void>}
   * @memberof IApiFormButtonController
   */
  doFormItemUpdate(event: MouseEvent): Promise<void>;
}
