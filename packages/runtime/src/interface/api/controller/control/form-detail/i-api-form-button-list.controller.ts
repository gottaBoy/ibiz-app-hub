import { IDEFormButton } from '@ibiz/model-core';
import { IApiFormButtonListState } from '../../../state';
import { IApiFormDetailController } from './i-api-form-detail.controller';
/**
 * @description 表单按钮组控制器
 * @export
 * @interface IApiFormButtonListController
 * @extends {IApiFormDetailController}
 */
export interface IApiFormButtonListController extends IApiFormDetailController {
  /**
   * @description 按钮组状态
   * @type {IApiFormButtonListState}
   * @memberof IApiFormButtonListController
   */
  state: IApiFormButtonListState;

  /**
   * @description 处理按钮点击
   * @param {string} id 按钮组成员标识
   * @param {MouseEvent} [event] 鼠标事件
   * @returns {*}  {Promise<void>}
   * @memberof IApiFormButtonListController
   */
  handleClick(id: string, event?: MouseEvent): Promise<void>;

  /**
   * @description 执行界面行为
   * @param {string} actionId 界面行为标识
   * @param {string} appId 应用标识
   * @param {MouseEvent} [event] 鼠标事件
   * @returns {*}  {Promise<void>}
   * @memberof IApiFormButtonListController
   */
  doUIAction(
    actionId: string,
    appId: string,
    event?: MouseEvent,
  ): Promise<void>;

  /**
   * @description 执行表单项更新
   * @param {IDEFormButton} model 表单按钮模型
   * @param {MouseEvent} [event] 鼠标事件
   * @returns {*}  {Promise<void>}
   * @memberof IApiFormButtonListController
   */
  doFormItemUpdate(model: IDEFormButton, event?: MouseEvent): Promise<void>;
}
