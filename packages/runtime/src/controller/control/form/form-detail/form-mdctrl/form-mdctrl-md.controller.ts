import {
  ModelError,
  mergeInLeft,
  RuntimeModelError,
} from '@ibiz-template/core';
import {
  IControlProvider,
  IMDControlController,
  IFormMDCtrlMDController,
} from '../../../../../interface';
import { getControlProvider } from '../../../../../register';
import { FormMDCtrlController } from './form-mdctrl.controller';
import { FormNotifyState } from '../../../../constant';

/**
 * @description 表单多数据部件(引用实体多数据部件模型)控制器 (类型是列表，卡片，表格时)
 * @export
 * @class FormMDCtrlMDController
 * @extends {FormMDCtrlController}
 * @implements {IFormMDCtrlMDController}
 */
export class FormMDCtrlMDController
  extends FormMDCtrlController
  implements IFormMDCtrlMDController
{
  /**
   * @description 多数据部件的适配器
   * @type {IControlProvider}
   * @memberof FormMDCtrlMDController
   */
  mdProvider!: IControlProvider;

  /**
   * @description 多数据部件控制器
   * @type {IMDControlController}
   * @memberof FormMDCtrlMDController
   */
  mdController!: IMDControlController;

  /**
   * @description 忽略下一次自身对应表单项数据变更
   * @memberof FormMDCtrlMDController
   */
  ignoreNextSelfChange = false;

  /**
   * @description 是否允许刷新，可能存在当表单数据变更后，需要通知多数据部件刷新时但多数据部件还没有加载好的情况，所以需要记录是否存在通知刷新的历史记录，等多数据部件加载完成后若判断存在，会调用一次刷新
   * @memberof FormMDCtrlMDController
   */
  enableRefresh = false;

  /**
   * @description 表单项名称
   * @readonly
   * @type {string}
   * @memberof FormMDCtrlMDController
   */
  get name(): string {
    return this.model.id!;
  }

  /**
   * @description 初始化
   * @protected
   * @returns {*}  {Promise<void>}
   * @memberof FormMDCtrlMDController
   */
  protected async onInit(): Promise<void> {
    await super.onInit();
    const { contentControl } = this.model;
    if (!contentControl) {
      if (this.context?.srfrunmode === 'DESIGN') {
        return;
      }
      throw new RuntimeModelError(
        this.model,
        ibiz.i18n.t('runtime.controller.control.form.unconfiguredWidgets'),
      );
    }

    // 把修改表格的模型，把行编辑打开，行新建看多数据部件的新建是否开启
    if (contentControl.controlType === 'GRID') {
      mergeInLeft(contentControl, {
        enableRowEdit: this.enableCreate || this.enableUpdate,
        enableRowNew: this.enableCreate,
      });
    }

    const controlProvider = await getControlProvider(contentControl);
    if (controlProvider) {
      this.mdProvider = controlProvider;
    }
  }

  /**
   * @description 设置多数据部件控制器
   * @param {IMDControlController} controller
   * @memberof FormMDCtrlMDController
   */
  setMDControl(controller: IMDControlController): void {
    this.mdController = controller;

    // 多数据部件保存，删除之后触发表单项更新
    controller.evt.on('onSaveSuccess', () => {
      this.notifyFormDataChange();
    });
    controller.evt.on('onRemoveSuccess', () => {
      this.notifyFormDataChange();
    });
    if (this.enableRefresh) {
      this.refresh();
    }
  }

  /**
   * @description 更新表单项
   * @returns {*}  {Promise<void>}
   * @memberof FormMDCtrlMDController
   */
  updateFormItem(): Promise<void> {
    const items = this.mdController.state.items || [];
    this.data[this.name] = items;
    return super.updateFormItem();
  }

  /**
   * @description 删除多数据选中的数据
   * @memberof FormMDCtrlMDController
   */
  remove(): void {
    this.mdController.remove({
      silent: true,
    });
  }

  /**
   * @description 多数据新建一条数据
   * @memberof FormMDCtrlMDController
   */
  create(): void {
    if (this.mdController) {
      this.mdController.newRow();
    } else {
      throw new ModelError(
        this.model,
        ibiz.i18n.t('runtime.controller.control.form.multiDataAddData', {
          contentType: this.model.contentType,
        }),
      );
    }
  }

  /**
   * @description 刷新
   * @memberof FormMDCtrlMDController
   */
  refresh(): void {
    if (this.mdController) {
      this.mdController.refresh();
    } else {
      this.enableRefresh = true;
      ibiz.log.debug(
        ibiz.i18n.t('runtime.controller.control.form.mdControllerNoExist'),
      );
    }
  }

  /**
   * @description 表单状态变更通知
   * @param {FormNotifyState} state
   * @returns {*}  {Promise<void>}
   * @memberof FormMDCtrlMDController
   */
  async formStateNotify(state: FormNotifyState): Promise<void> {
    await super.formStateNotify(state);
    this.refresh();
  }

  /**
   * @description 表单数据变更通知
   * @param {string[]} names
   * @returns {*}  {Promise<void>}
   * @memberof FormMDCtrlMDController
   */
  async dataChangeNotify(names: string[]): Promise<void> {
    if (names.includes(this.model.id!) && this.ignoreNextSelfChange) {
      this.ignoreNextSelfChange = false;
      return;
    }

    await super.dataChangeNotify(names);

    // 表单项更新的时候修改数据的时候需要刷新
    if (names.includes(this.model.id!)) {
      this.refresh();
    }
  }

  /**
   * @description 通知表单多数据部件对应的表单项数据变更
   * @protected
   * @memberof FormMDCtrlMDController
   */
  protected notifyFormDataChange(): void {
    this.updateFormItem();
    this.ignoreNextSelfChange = true;
    this.form.dataChangeNotify([this.name]);
  }

  /**
   * @description 保存
   * @returns {*}  {Promise<void>}
   * @memberof FormMDCtrlMDController
   */
  async save(): Promise<void> {
    // 目前只有表格
    if (this.mdController && (this.mdController as IData).saveAll) {
      await (this.mdController as IData).saveAll();
    }
  }
}
