import { FormNotifyState } from '../../../../../controller';
import { IApiFormDetailController } from '../../../../api';
import { IEnforceableController } from '../../common';

/**
 * @description 表单成员控制器
 * @export
 * @interface IFormDetailController
 * @extends {IEnforceableController}
 * @extends {IApiFormDetailController}
 */
export interface IFormDetailController
  extends IEnforceableController,
    IApiFormDetailController {
  /**
   * @description 表单数据变更通知(由表单控制器调用)
   * @param {string[]} names
   * @returns {*}  {Promise<void>}
   * @memberof IFormDetailController
   */
  dataChangeNotify(names: string[]): Promise<void>;

  /**
   * @description 表单状态变更通知
   * @param {FormNotifyState} state
   * @returns {*}  {Promise<void>}
   * @memberof IFormDetailController
   */
  formStateNotify(state: FormNotifyState): Promise<void>;

  /**
   * @description 销毁方法
   * @memberof IApiFormDetailController
   */
  destroy(): void;
}
