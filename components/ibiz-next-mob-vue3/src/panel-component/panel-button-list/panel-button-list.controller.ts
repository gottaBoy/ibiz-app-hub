/* eslint-disable object-shorthand */
import {
  ButtonContainerState,
  PanelController,
  PanelItemController,
  PanelNotifyState,
  UIActionButtonState,
  UIActionUtil,
} from '@ibiz-template/runtime';
import {
  IPanelButton,
  IPanelButtonList,
  IUIActionGroupDetail,
} from '@ibiz/model-core';
import { PanelButtonListState } from './panel-button-list.state';

/**
 * 面板按钮组控制器
 *
 * @export
 * @class PanelButtonListController
 * @extends {PanelItemController<IPanelButtonList>}
 */
export class PanelButtonListController extends PanelItemController<IPanelButtonList> {
  declare state: PanelButtonListState;

  protected createState(): PanelButtonListState {
    return new PanelButtonListState(this.parent?.state);
  }

  /**
   * @description 父容器数据对象数据
   * @exposedoc
   * @readonly
   * @type {IData}
   */
  get data(): IData {
    return this.dataParent.data;
  }

  /**
   * Creates an instance of PanelButtonController.
   * @param {IPanelButtonList} model
   * @param {PanelController} panel
   * @param {PanelItemController} [parent]
   * @memberof PanelButtonController
   */
  constructor(
    model: IPanelButtonList,
    panel: PanelController,
    parent?: PanelItemController,
  ) {
    super(model, panel, parent);
    this.state.buttonsState = new ButtonContainerState();
  }

  /**
   * 初始化
   *
   * @return {*}  {Promise<void>}
   * @memberof PanelButtonController
   */
  async onInit(): Promise<void> {
    await super.onInit();
    await this.initButtonsState();
  }

  /**
   * 初始化按钮组状态
   *
   * @protected
   * @return {*}  {Promise<void>}
   * @memberof PanelButtonListController
   */
  protected async initButtonsState(): Promise<void> {
    const { buttonListType, uiactionGroup, panelButtons } = this.model;
    if (buttonListType === 'UIACTIONGROUP') {
      uiactionGroup?.uiactionGroupDetails?.forEach(detail => {
        if (detail.uiactionId) {
          const buttonState = new UIActionButtonState(
            detail.id!,
            this.model.appId,
            detail.uiactionId,
            detail,
          );
          this.state.buttonsState.addState(detail.id!, buttonState);
        }
      });
    } else {
      panelButtons?.forEach(button => {
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
   * 面板数据变更通知(由面板控制器调用)
   *
   * @param {string[]} names
   * @memberof PanelButtonController
   */
  async dataChangeNotify(names: string[]): Promise<void> {
    await this.state.buttonsState.update(
      this.panel.context,
      this.data,
      this.panel.model.appDataEntityId,
    );
    super.dataChangeNotify(names);
  }

  /**
   * 面板状态变更通知
   *
   * @param {PanelNotifyState} _state
   * @memberof PanelButtonController
   */
  async panelStateNotify(_state: PanelNotifyState): Promise<void> {
    await this.state.buttonsState.update(
      this.panel.context,
      this.data,
      this.panel.model.appDataEntityId,
    );
    super.panelStateNotify(_state);
  }

  /**
   * 通过项标识获取项模型
   *
   * @private
   * @param {string} id
   * @return {*}  {(IPanelButton | IUIActionGroupDetail | undefined)}
   * @memberof PanelButtonListController
   */
  private getModelById(
    id: string,
  ): IPanelButton | IUIActionGroupDetail | undefined {
    const { buttonListType, uiactionGroup, panelButtons } = this.model;
    if (buttonListType === 'UIACTIONGROUP')
      return uiactionGroup?.uiactionGroupDetails?.find(
        detail => detail.id === id,
      );
    return panelButtons?.find(button => button.id === id);
  }

  /**
   * @description 处理按钮点击
   * @exposedoc
   * @param {string} id
   * @param {MouseEvent} [event]
   * @return {*}  {Promise<void>}
   * @memberof PanelButtonListController
   */
  async handleClick(id: string, event?: MouseEvent): Promise<void> {
    const action = this.getModelById(id);
    if (!action?.uiactionId) return;
    await UIActionUtil.execAndResolved(
      action.uiactionId,
      {
        context: this.panel.context,
        params: {
          panelDataParent: this.dataParent.model.id!,
          ...this.panel.params,
        },
        event,
        data: [this.data],
        view: this.panel.view,
        ctrl: this.panel,
        noWaitRoute: true,
      },
      action.appId || this.model.appId,
    );
  }

  calcItemVisible(data: IData): void {
    // 权限不显示时就一定不显示
    if (!this.state.buttonsState.visible) {
      this.state.visible = false;
      return;
    }
    super.calcItemVisible(data);
  }

  calcItemDisabled(data: IData): void {
    // 权限禁用时就一定禁用
    if (this.state.buttonsState.disabled) {
      this.state.disabled = true;
      return;
    }
    super.calcItemDisabled(data);
  }
}
