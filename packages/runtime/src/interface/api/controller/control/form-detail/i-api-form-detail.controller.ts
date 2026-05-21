import { IApiData } from '@ibiz-template/core';
import { IApiFormDetailState } from '../../../state';
import { IApiEnforceableController } from '../../common';
import { IApiFormController } from '../i-api-form.controller';
import { IApiFormDetailContainerController } from './i-api-form-detail-container.controller';

/**
 * @description 表单成员控制器
 * @export
 * @interface IApiFormDetailController
 * @extends {IApiEnforceableController}
 */
export interface IApiFormDetailController extends IApiEnforceableController {
  /**
   * @description 表单成员状态
   * @type {IApiFormState}
   * @memberof IApiFormDetailController
   */
  state: IApiFormDetailState;

  /**
   * @description 是否为自定义代码
   * @type {boolean}
   * @memberof IApiFormDetailController
   */
  isCustomCode: boolean;

  /**
   * @description 表单控制器
   * @type {IApiFormController}
   * @memberof IApiFormDetailController
   */
  form: IApiFormController;

  /**
   * @description 父容器控制器(除了表单分页都存在)
   * @type {IApiFormDetailContainerController}
   * @memberof IApiFormDetailController
   */
  parent?: IApiFormDetailContainerController;

  /**
   * @description 点击事件
   * @param {MouseEvent} [event] 鼠标事件
   * @returns {*}  {Promise<void>}
   * @memberof IApiFormDetailController
   */
  onClick(event?: MouseEvent): Promise<void>;

  /**
   * @description 获取脚本代码html
   * @param {IApiData} data
   * @returns {*}  {(Promise<string | undefined>)}
   * @memberof IApiFormDetailController
   */
  getCustomHtml(data: IApiData): Promise<string | undefined>;
}
