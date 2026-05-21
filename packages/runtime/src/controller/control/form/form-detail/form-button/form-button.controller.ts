import { IDEFormButton } from '@ibiz/model-core';
import { UIActionUtil } from '../../../../../ui-action';
import type { EditFormController } from '../../edit-form';
import { FormDetailController } from '../form-detail';
import { FormButtonState } from './form-button.state';
import { UIActionButtonState } from '../../../../utils';
import { calcDeCodeNameById } from '../../../../../model';
import { FormNotifyState } from '../../../../constant';
import {
  IApiFormButtonController,
  IButtonState,
  IModalData,
} from '../../../../../interface';
import { convertNavData } from '../../../../../utils';
import { OpenAppViewCommand } from '../../../../../command';

/**
 * 表单按钮控制器
 *
 * @author lxm
 * @date 2022-09-04 15:09:52
 * @export
 * @class FormButtonController
 * @extends {FormDetailController}
 */
export class FormButtonController
  extends FormDetailController<IDEFormButton>
  implements IApiFormButtonController
{
  declare state: FormButtonState;

  /**
   *界面行为状态
   *
   * @author zzq
   * @date 2024-03-11 15:09:43
   */
  actionState: IButtonState | null = null;

  protected createState(): FormButtonState {
    return new FormButtonState(this.parent?.state);
  }

  protected async onInit(): Promise<void> {
    super.onInit();
    await this.initActionStates();
  }

  /**
   * 初始化界面行为按钮的状态
   *
   * @author zzq
   * @date 2024-03-11 15:09:43
   */
  async initActionStates(): Promise<void> {
    // 界面行为按钮状态控制
    const actionid = this.model.uiactionId;
    if (actionid) {
      this.actionState = new UIActionButtonState(
        this.model.id!,
        this.form.context.srfappid!,
        actionid,
      );
    }
  }

  /**
   * 表单状态变更通知
   *
   * @author zzq
   * @date 2024-03-11 15:09:43
   */
  async formStateNotify(_state: FormNotifyState): Promise<void> {
    if (this.actionState) {
      const deCodeName = calcDeCodeNameById(
        this.form.model.appDataEntityId || '',
      );
      await this.actionState.update(this.context, this.data, deCodeName);
    }
    await super.formStateNotify(_state);
  }

  /**
   * 计算项的禁用状态
   *
   * @param {IData} data
   */
  calcDetailDisabled(data: IData): void {
    let { disabled } = this.dynaLogicResult;

    // 上层计算为启用时计算预定义项启用逻辑
    if (disabled !== true && this.form.scheduler) {
      const itemEnable = this.form.scheduler.triggerItemEnable(this.model.id!, {
        data: [data],
      });
      if (itemEnable !== undefined) {
        disabled = !itemEnable;
      }
    }

    if (disabled !== true && this.actionState) {
      disabled = this.actionState.disabled;
    }

    // 表单项与界面行为都有权限时才有权限
    if (disabled !== undefined) {
      this.state.disabled = disabled;
    }
  }

  /**
   * 计算项的显示状态
   *
   * @param {IData} data
   */
  calcDetailVisible(data: IData): void {
    let { visible } = this.dynaLogicResult;

    // 上层计算为显示时计算预定义项显示逻辑
    if (visible !== false && this.form.scheduler) {
      const itemVIsible = this.form.scheduler.triggerItemVisible(
        this.model.id!,
        {
          data: [data],
        },
      );
      if (itemVIsible !== undefined) {
        visible = itemVIsible;
      }
    }

    if (visible !== false && this.actionState) {
      visible = this.actionState.visible;
    }

    // 有值的时候才会去修改state
    if (visible !== undefined) {
      this.state.visible = visible;
    }
  }

  /**
   * 按钮点击处理回调
   *
   * @author lxm
   * @date 2022-09-28 21:09:33
   * @param {MouseEvent} event
   */
  async onClick(event: MouseEvent): Promise<void> {
    this.state.loading = true;
    try {
      if (this.model.actionType === 'UIACTION') {
        await this.doUIAction(event);
      } else {
        await this.doFormItemUpdate(event);
      }
    } finally {
      this.state.loading = false;
    }
    super.onClick(event);
  }

  /**
   * 执行界面行为
   *
   * @author lxm
   * @date 2022-10-19 22:10:20
   * @param {MouseEvent} event
   * @returns {*}  {Promise<void>}
   */
  async doUIAction(event: MouseEvent): Promise<void> {
    const actionId = this.model.uiactionId;
    await UIActionUtil.execAndResolved(
      actionId!,
      {
        context: this.form.context,
        params: this.form.params,
        data: [this.data],
        view: this.form.view,
        ctrl: this.form,
        event,
        noWaitRoute: true,
      },
      this.model.appId,
    );
  }

  /**
   * 处理公共参数
   *
   * @param {IData} data
   * @param {IContext} context
   * @param {IParams} params
   * @return {*}  {{ context: IContext; params: IParams }}
   * @memberof FormButtonController
   */
  public handlePublicParams(
    data: IData,
    context: IContext,
    params: IParams,
  ): { context: IContext; params: IParams } {
    const { navigateContexts, navigateParams } = this.model;
    let selfContext = {};
    if (navigateContexts && data) {
      selfContext = convertNavData(navigateContexts!, data, params, context);
    }
    const _context = Object.assign(context.clone(), selfContext);

    let _params = {};
    if (navigateParams && data) {
      _params = convertNavData(navigateParams!, data, params, context);
    }
    return { context: _context, params: _params };
  }

  /**
   * 执行表单项更新
   *
   * @param {MouseEvent} event
   * @return {*}  {Promise<void>}
   * @memberof FormButtonController
   */
  async doFormItemUpdate(event: MouseEvent): Promise<void> {
    const { deformItemUpdateId, paramPickupAppViewId } = this.model;
    if (!deformItemUpdateId) {
      return;
    }
    if (paramPickupAppViewId) {
      const { context, params } = this.handlePublicParams(
        this.data,
        this.context,
        this.params,
      );
      const res: IModalData | undefined = await ibiz.commands.execute(
        OpenAppViewCommand.TAG,
        paramPickupAppViewId,
        context,
        params,
        { event, noWaitRoute: true },
      );
      if (res?.ok && res.data) {
        this.data.srfactionparam = res.data;
        await (this.form as EditFormController).updateFormItem(
          deformItemUpdateId,
        );
        this.data.srfactionparam = undefined;
      }
    } else {
      await (this.form as EditFormController).updateFormItem(
        deformItemUpdateId,
      );
    }
  }
}
