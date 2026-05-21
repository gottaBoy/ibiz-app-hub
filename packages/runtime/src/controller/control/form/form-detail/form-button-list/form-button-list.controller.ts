import {
  IDEFormButton,
  IDEFormButtonList,
  IUIActionGroupDetail,
} from '@ibiz/model-core';
import { UIActionUtil } from '../../../../../ui-action';
import { FormDetailController } from '../form-detail';
import { ButtonContainerState, UIActionButtonState } from '../../../../utils';
import { FormNotifyState } from '../../../../constant';
import { FormButtonListState } from './form-button-list.state';
import { FormController } from '../../form';
import {
  IModalData,
  IApiFormButtonListController,
  IFormDetailContainerController,
} from '../../../../../interface';
import { OpenAppViewCommand } from '../../../../../command';
import { convertNavData } from '../../../../../utils';
import { EditFormController } from '../../edit-form';
import { calcUIActionGroup, getAllUIActionItems } from '../../../../../model';

/**
 * 表单按钮组控制器
 *
 * @export
 * @class FormButtonListController
 * @extends {FormDetailController<IDEFormButtonList>}
 */
export class FormButtonListController
  extends FormDetailController<IDEFormButtonList>
  implements IApiFormButtonListController
{
  declare state: FormButtonListState;

  protected createState(): FormButtonListState {
    return new FormButtonListState(this.parent?.state);
  }

  /**
   * Creates an instance of FormButtonListController.
   * @param {IDEFormButtonList} model
   * @param {FormController} form
   * @param {IFormDetailContainerController} [parent]
   * @memberof FormButtonListController
   */
  constructor(
    model: IDEFormButtonList,
    form: FormController,
    parent?: IFormDetailContainerController,
  ) {
    super(model, form, parent);
    this.state.buttonsState = new ButtonContainerState();
  }

  protected async onInit(): Promise<void> {
    await super.onInit();
    await this.initButtonsState();
  }

  /**
   * @description 初始化界面行为组
   * @protected
   * @returns {*}  {Promise<void>}
   * @memberof FormButtonListController
   */
  protected async initUIActions(): Promise<void> {
    const { buttonListType, uiactionGroup } = this.model;
    if (buttonListType === 'UIACTIONGROUP' && uiactionGroup) {
      await calcUIActionGroup(
        uiactionGroup,
        this.form.context,
        this.form.params,
      );
    }
  }

  /**
   * 初始化按钮组状态
   *
   * @return {*}  {Promise<void>}
   * @memberof FormButtonListController
   */
  async initButtonsState(): Promise<void> {
    const { buttonListType, uiactionGroup, deformButtons } = this.model;
    if (buttonListType === 'UIACTIONGROUP') {
      if (uiactionGroup?.uiactionGroupDetails) {
        const actions = getAllUIActionItems(uiactionGroup.uiactionGroupDetails);
        actions.forEach(detail => {
          if (detail.uiactionId) {
            const buttonState = new UIActionButtonState(
              detail.id!,
              detail.appId,
              detail.uiactionId,
              detail,
            );
            this.state.buttonsState.addState(detail.id!, buttonState);
          }
        });
      }
    } else {
      deformButtons?.forEach(button => {
        if (button.uiactionId) {
          const buttonState = new UIActionButtonState(
            button.id!,
            this.model.appId,
            button.uiactionId,
          );
          this.state.buttonsState.addState(button.id!, buttonState);
        }
      });
    }
    await this.state.buttonsState.init();
  }

  /**
   * 表单状态变更通知
   *
   * @param {FormNotifyState} _state
   * @return {*}  {Promise<void>}
   * @memberof FormButtonListController
   */
  async formStateNotify(_state: FormNotifyState): Promise<void> {
    await this.state.buttonsState.update(
      this.form.context,
      this.data,
      this.form.model.appDataEntityId,
    );
    await super.formStateNotify(_state);
  }

  /**
   * 计算项的禁用状态
   *
   * @param {IData} data
   * @return {*}  {void}
   * @memberof FormButtonListController
   */
  calcDetailDisabled(data: IData): void {
    // 权限禁用时就一定禁用
    if (this.state.buttonsState.disabled) {
      this.state.disabled = true;
      return;
    }
    super.calcDetailDisabled(data);
  }

  /**
   * 计算项的显示状态
   *
   * @param {IData} data
   * @return {*}  {void}
   * @memberof FormButtonListController
   */
  calcDetailVisible(data: IData): void {
    // 权限不显示时就一定不显示
    if (!this.state.buttonsState.visible) {
      this.state.visible = false;
      return;
    }
    super.calcDetailVisible(data);
  }

  /**
   * 通过项标识获取项模型
   *
   * @private
   * @param {string} id
   * @return {*}  {(IDEFormButton | IUIActionGroupDetail | undefined)}
   * @memberof FormButtonListController
   */
  private getModelById(
    id: string,
  ): IDEFormButton | IUIActionGroupDetail | undefined {
    const { buttonListType, uiactionGroup, deformButtons } = this.model;
    if (buttonListType === 'UIACTIONGROUP') {
      const actions = getAllUIActionItems(uiactionGroup?.uiactionGroupDetails);
      return actions.find(detail => detail.id === id);
    }
    return deformButtons?.find(button => button.id === id);
  }

  /**
   * 执行界面行为
   *
   * @param {string} actionId
   * @param {MouseEvent} event
   * @return {*}  {Promise<void>}
   * @memberof FormButtonListController
   */
  async doUIAction(
    actionId: string,
    appId: string,
    event?: MouseEvent,
  ): Promise<void> {
    await UIActionUtil.execAndResolved(
      actionId,
      {
        context: this.form.context,
        params: this.form.params,
        data: [this.data],
        view: this.form.view,
        ctrl: this.form,
        event,
        noWaitRoute: true,
      },
      appId || this.model.appId,
    );
  }

  /**
   * 处理公共参数
   *
   * @param {IData} data
   * @param {IContext} context
   * @param {IParams} params
   * @return {*}  {{ context: IContext; params: IParams }}
   * @memberof FormButtonListController
   */
  public handlePublicParams(
    model: IDEFormButton,
    data: IData,
    context: IContext,
    params: IParams,
  ): { context: IContext; params: IParams } {
    const { navigateContexts, navigateParams } = model;
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
   * @param {IDEFormButton} model
   * @param {MouseEvent} [event]
   * @return {*}  {Promise<void>}
   * @memberof FormButtonListController
   */
  async doFormItemUpdate(
    model: IDEFormButton,
    event?: MouseEvent,
  ): Promise<void> {
    const { deformItemUpdateId, paramPickupAppViewId, actionType } = model;
    if (!deformItemUpdateId || actionType !== 'FIUPDATE') return;
    if (paramPickupAppViewId) {
      const { context, params } = this.handlePublicParams(
        model,
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

  /**
   * 处理按钮点击
   *
   * @param {string} id
   * @param {MouseEvent} [event]
   * @return {*}  {Promise<void>}
   * @memberof FormButtonListController
   */
  async handleClick(id: string, event?: MouseEvent): Promise<void> {
    const action = this.getModelById(id);
    if (!action) return;
    if (action.uiactionId) {
      await this.doUIAction(action.uiactionId, action.appId, event);
    } else {
      await this.doFormItemUpdate(action, event);
    }
  }
}
