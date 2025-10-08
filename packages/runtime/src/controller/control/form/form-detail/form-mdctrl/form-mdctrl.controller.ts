import { BitMask } from '@ibiz-template/core';
import { IDEFormMDCtrl, IUIActionGroupDetail } from '@ibiz/model-core';
import { FormDetailController } from '../form-detail';
import { FormMDCtrlState } from './form-mdctrl.state';
import { ButtonContainerState, UIActionButtonState } from '../../../../utils';
import { FormNotifyState } from '../../../../constant';
import { UIActionUtil } from '../../../../../ui-action';
import { EditFormController } from '../../edit-form';
import { IFormMDCtrlController } from '../../../../../interface';
import { getAllUIActionItems } from '../../../../../model';

/**
 * @description 表单多数据部件控制器
 * @export
 * @class FormMDCtrlController
 * @extends {FormDetailController<IDEFormMDCtrl>}
 * @implements {IFormMDCtrlController}
 */
export class FormMDCtrlController
  extends FormDetailController<IDEFormMDCtrl>
  implements IFormMDCtrlController
{
  /**
   * @description 表单多数据部件控制器状态
   * @type {FormMDCtrlState}
   * @memberof FormMDCtrlController
   */
  declare state: FormMDCtrlState;

  protected createState(): FormMDCtrlState {
    return new FormMDCtrlState(this.parent?.state);
  }

  /**
   * @description 名称
   * @readonly
   * @type {string}
   * @memberof FormMDCtrlController
   */
  get name(): string {
    return this.model.id!;
  }

  /**
   * @description 上下文
   * @readonly
   * @type {IContext}
   * @memberof FormMDCtrlController
   */
  get context(): IContext {
    return this.form.context;
  }

  /**
   * @description 视图参数
   * @readonly
   * @type {IParams}
   * @memberof FormMDCtrlController
   */
  get params(): IParams {
    return this.form.params;
  }

  /**
   * @description 是否允许新建
   * @readonly
   * @type {boolean}
   * @memberof FormMDCtrlController
   */
  get enableCreate(): boolean {
    return (
      !this.state.readonly &&
      BitMask.checkPermission(this.model.buildInActions, 1)
    );
  }

  /**
   * @description 是否允许更新
   * @readonly
   * @type {boolean}
   * @memberof FormMDCtrlController
   */
  get enableUpdate(): boolean {
    return (
      !this.state.readonly &&
      BitMask.checkPermission(this.model.buildInActions, 2)
    );
  }

  /**
   * @description 是否允许删除
   * @readonly
   * @type {boolean}
   * @memberof FormMDCtrlController
   */
  get enableDelete(): boolean {
    return (
      !this.state.readonly &&
      BitMask.checkPermission(this.model.buildInActions, 4)
    );
  }

  /**
   * @description 执行表单项更新(配置了表单项更新)
   * @returns {*}  {Promise<void>}
   * @memberof FormMDCtrlController
   */
  async updateFormItem(): Promise<void> {
    if (this.model.deformItemUpdateId) {
      await this.form.updateFormItem(this.model.deformItemUpdateId);
    }
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
   * @description 初始化
   * @protected
   * @returns {*}  {Promise<void>}
   * @memberof FormMDCtrlController
   */
  protected async onInit(): Promise<void> {
    super.onInit();
    await this.initActionStates();
    (this.form as EditFormController).evt.on('onBeforeSave', async () => {
      await this.save();
    });
  }

  /**
   * @description  操作列按钮状态控制
   * @returns {*}  {Promise<void>}
   * @memberof FormMDCtrlController
   */
  async initActionStates(): Promise<void> {
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
   * @description 执行界面行为
   * @param {IUIActionGroupDetail} detail
   * @param {MouseEvent} event
   * @returns {*}  {Promise<void>}
   * @memberof FormMDCtrlController
   */
  async onActionClick(
    detail: IUIActionGroupDetail,
    event: MouseEvent,
  ): Promise<void> {
    const actionId = detail.uiactionId;

    await UIActionUtil.execAndResolved(
      actionId!,
      {
        context: this.context,
        params: this.params,
        data: [this.data],
        view: this.form.view,
        ctrl: this.form,
        event,
      },
      detail.appId,
    );
  }

  /**
   * @description 刷新
   * @memberof FormMDCtrlController
   */
  refresh(): void {
    // 子类实现
  }

  /**
   * @description 校验
   * @returns {*}  {Promise<boolean>}
   * @memberof FormMDCtrlController
   */
  async validate(): Promise<boolean> {
    // todo 子类校验实现
    return true;
  }

  /**
   * @description 静默校验
   * @returns {*}  {Promise<boolean>}
   * @memberof FormMDCtrlController
   */
  async silentValidate(): Promise<boolean> {
    // todo 子类校验实现
    return true;
  }

  /**
   * @description 保存
   * @returns {*}  {Promise<void>}
   * @memberof FormMDCtrlController
   */
  async save(): Promise<void> {}
}
