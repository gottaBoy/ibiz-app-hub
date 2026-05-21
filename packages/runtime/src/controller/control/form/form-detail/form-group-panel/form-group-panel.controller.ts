import { IDEFormGroupPanel, IUIActionGroupDetail } from '@ibiz/model-core';
import { clone } from 'ramda';
import { IApiFormGroupPanelController } from '../../../../../interface';
import { UIActionUtil } from '../../../../../ui-action';
import { FormNotifyState } from '../../../../constant';
import { ButtonContainerState, UIActionButtonState } from '../../../../utils';
import { FormGroupPanelState } from './form-group-panel.state';
import { calcUIActionGroup, getAllUIActionItems } from '../../../../../model';
import { FormContainerController } from '../form-container';

/**
 * 表单分组面板控制器
 *
 * @author lxm
 * @date 2022-09-04 15:09:52
 * @export
 * @class FormGroupPanelController
 * @extends {FormContainerController}
 */
export class FormGroupPanelController<
    T extends IDEFormGroupPanel = IDEFormGroupPanel,
  >
  extends FormContainerController<T>
  implements IApiFormGroupPanelController
{
  declare state: FormGroupPanelState;

  /**
   * 禁用关闭
   *
   * @author chitanda
   * @date 2022-09-14 14:09:51
   * @readonly
   * @type {boolean}
   */
  get disableClose(): boolean {
    const { titleBarCloseMode: mode } = this.model;
    return mode === 0 || mode === undefined;
  }

  /**
   * 是否默认展开分组
   *
   * @author chitanda
   * @date 2022-09-14 14:09:09
   * @readonly
   */
  get defaultExpansion(): boolean {
    const { titleBarCloseMode: mode } = this.model;
    return this.disableClose || mode === 1;
  }

  protected createState(): FormGroupPanelState {
    return new FormGroupPanelState(this.parent?.state);
  }

  protected async onInit(): Promise<void> {
    await super.onInit();
    this.state.collapse = !this.defaultExpansion;
    await this.initActionStates();
  }

  async formStateNotify(state: FormNotifyState): Promise<void> {
    super.formStateNotify(state);
    // 只在加载后台数据之后，更新界面行为组状态
    if (this.state.actionGroupState) {
      const deData = this.data.getOrigin ? this.data.getOrigin() : this.data;
      this.state.actionGroupState.update(this.form.context, deData);
    }
  }

  /**
   * @description 初始化界面行为组
   * @protected
   * @returns {*}  {Promise<void>}
   * @memberof FormGroupPanelController
   */
  protected async initUIActions(): Promise<void> {
    if (this.model.uiactionGroup) {
      await calcUIActionGroup(
        this.model.uiactionGroup,
        this.form.context,
        this.form.params,
      );
    }
  }

  /**
   * 初始化标题右侧界面行为按钮的状态
   *
   * @author lxm
   * @date 2022-09-07 21:09:43
   */
  async initActionStates(): Promise<void> {
    // 操作列按钮状态控制
    const { uiactionGroup } = this.model;
    if (!uiactionGroup?.uiactionGroupDetails?.length) return;
    const containerState = new ButtonContainerState();
    const actions = getAllUIActionItems(uiactionGroup.uiactionGroupDetails);
    actions.forEach(detail => {
      const actionid = detail.uiactionId;
      if (actionid) {
        const buttonState = new UIActionButtonState(
          detail.id!,
          this.form.context.srfappid!,
          actionid,
          detail,
        );
        containerState.addState(detail.id!, buttonState);
      }
    });
    await containerState.update(this.form.context);
    this.state.actionGroupState = containerState;
  }

  /**
   * 触发界面行为
   *
   * @author lxm
   * @date 2022-09-07 22:09:46
   * @param {IPSUIActionGroupDetail} detail
   * @param {MouseEvent} event
   */
  async onActionClick(
    detail: IUIActionGroupDetail,
    event: MouseEvent,
    args?: IParams,
  ): Promise<void> {
    const actionId = detail.uiactionId;
    const tempParams = clone(this.form.params);
    if (args) {
      Object.assign(tempParams, args);
    }

    await UIActionUtil.execAndResolved(
      actionId!,
      {
        context: this.form.context,
        params: tempParams,
        data: [this.data],
        view: this.form.view,
        ctrl: this.form,
        event,
      },
      detail.appId,
    );
  }
}
