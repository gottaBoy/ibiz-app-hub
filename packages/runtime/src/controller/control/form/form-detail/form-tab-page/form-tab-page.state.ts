import { IApiFormTabPageState } from '../../../../../interface';
import { FormContainerState } from '../form-container';

/**
 * @description 表单分页部件分页状态
 * @export
 * @class FormTabPageState
 * @extends {FormContainerState}
 * @implements {IApiFormTabPageState}
 */
export class FormTabPageState
  extends FormContainerState
  implements IApiFormTabPageState {}
