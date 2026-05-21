import { IDEFormDetail } from '@ibiz/model-core';
import { IApiFormContainerController } from '../../../../../interface';
import { FormDetailController } from '../form-detail/form-detail.controller';
import { FormContainerState } from './form-container.state';

export class FormContainerController<T extends IDEFormDetail = IDEFormDetail>
  extends FormDetailController<T>
  implements IApiFormContainerController
{
  /**
   * @description 表单容器状态
   * @type {FormContainerState}
   * @memberof FormContainerController
   */
  state!: FormContainerState;

  /**
   * @description 创建表单容器状态对象
   * @protected
   * @returns {*}  {FormContainerState}
   * @memberof FormContainerController
   */
  protected createState(): FormContainerState {
    return new FormContainerState(this.parent?.state);
  }

  /**
   * @description 开始加载中
   * @memberof FormContainerController
   */
  startLoading(): void {
    this.state.loading = true;
  }

  /**
   * @description 结束加载中
   * @memberof FormContainerController
   */
  endLoading(): void {
    this.state.loading = false;
  }
}
