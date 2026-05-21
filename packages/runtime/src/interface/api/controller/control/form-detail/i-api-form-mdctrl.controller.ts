import { IApiContext, IApiParams } from '@ibiz-template/core';
import { IUIActionGroupDetail } from '@ibiz/model-core';
import { IApiFormMDCtrlState } from '../../../state';
import { IApiFormDetailController } from './i-api-form-detail.controller';

/**
 * @description 表单多数据部件控制器接口
 * @export
 * @interface IApiFormMDCtrlController
 * @extends {IApiFormDetailController}
 */
export interface IApiFormMDCtrlController extends IApiFormDetailController {
  /**
   * @description 表单多数据部件状态
   * @type {IApiFormMDCtrlState}
   * @memberof IApiFormMDCtrlController
   */
  state: IApiFormMDCtrlState;

  /**
   * @description 名称
   * @type {string}
   * @memberof IApiFormMDCtrlController
   */
  readonly name: string;

  /**
   * @description 上下文
   * @type {IApiContext}
   * @memberof IApiFormMDCtrlController
   */
  readonly context: IApiContext;

  /**
   * @description 视图参数
   * @type {IApiParams}
   * @memberof IApiFormMDCtrlController
   */
  readonly params: IApiParams;

  /**
   * @description 是否允许新建
   * @type {boolean}
   * @memberof IApiFormMDCtrlController
   */
  readonly enableCreate: boolean;

  /**
   * @description 是否允许更新
   * @type {boolean}
   * @memberof IApiFormMDCtrlController
   */
  readonly enableUpdate: boolean;

  /**
   * @description 是否允许删除
   * @type {boolean}
   * @memberof IApiFormMDCtrlController
   */
  readonly enableDelete: boolean;

  /**
   * @description 执行表单项更新(配置了表单项更新)
   * @returns {*}  {Promise<void>}
   * @memberof IApiFormMDCtrlController
   */
  updateFormItem(): Promise<void>;

  /**
   * @description 执行界面行为
   * @param {IUIActionGroupDetail} detail 界面行为组成员模型
   * @param {MouseEvent} event 鼠标事件
   * @returns {*}  {Promise<void>}
   * @memberof IApiFormMDCtrlController
   */
  onActionClick(detail: IUIActionGroupDetail, event: MouseEvent): Promise<void>;

  /**
   * @description 刷新
   * @memberof IApiFormMDCtrlController
   */
  refresh(): void;

  /**
   * @description 校验
   * @returns {*}  {Promise<boolean>}
   * @memberof IApiFormMDCtrlController
   */
  validate(): Promise<boolean>;

  /**
   * @description 静默校验
   * @returns {*}  {Promise<boolean>}
   * @memberof IApiFormMDCtrlController
   */
  silentValidate(): Promise<boolean>;

  /**
   * @description 保存
   * @memberof IApiFormMDCtrlController
   */
  save(): Promise<void>;
}
