import {
  UIActionUtil,
  getUIActionById,
  PanelController,
  PanelNotifyState,
  PanelItemController,
  UIActionButtonState,
  ViewLayoutPanelController,
} from '@ibiz-template/runtime';
import { IPanelButton } from '@ibiz/model-core';
import { PanelButtonState } from './panel-button.state';

/**
 * 面板按钮控制器
 *
 * @export
 * @class PanelButtonController
 * @extends {PanelItemController<IPanelButton>}
 */
export class PanelButtonController extends PanelItemController<IPanelButton> {
  declare state: PanelButtonState;

  protected createState(): PanelButtonState {
    return new PanelButtonState(this.parent?.state);
  }

  /**
   * @description 面板控制器
   * @exposedoc
   * @type {ViewLayoutPanelController}
   * @memberof PanelButtonController
   */
  declare panel: ViewLayoutPanelController;

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
   * @param {IPanelButton} model
   * @param {PanelController} panel
   * @param {PanelItemController} [parent]
   * @memberof PanelButtonController
   */
  constructor(
    model: IPanelButton,
    panel: PanelController,
    parent?: PanelItemController,
  ) {
    super(model, panel, parent);
    this.state.uiActionState = this.createUIActionState();
  }

  /**
   * @description AI按钮位置
   * @private
   * @type {('left'
   *     | 'left-start'
   *     | 'left-end'
   *     | 'right'
   *     | 'right-start'
   *     | 'right-end')}
   * @memberof PanelButtonController
   */
  private placement:
    | 'left'
    | 'left-start'
    | 'left-end'
    | 'right'
    | 'right-start'
    | 'right-end' = 'right-end';

  /**
   * 初始化
   *
   * @return {*}  {Promise<void>}
   * @memberof PanelButtonController
   */
  async onInit(): Promise<void> {
    await super.onInit();
    const { appId, uiactionId } = this.model;
    if (uiactionId) {
      const action = await getUIActionById(uiactionId, appId);
      this.state.isGlobalAIAssistant =
        action?.codeName === 'global_ai_assistant';
    }
    this.updateButtonState();
  }

  /**
   * 创建界面行为状态对象
   *
   * @protected
   * @return {*}  {PanelButtonState}
   * @memberof PanelButtonController
   */
  protected createUIActionState(): UIActionButtonState {
    const { uiactionId, name } = this.model;
    return new UIActionButtonState(
      name!,
      this.panel.context.srfappid!,
      uiactionId,
    );
  }

  /**
   * 面板数据变更通知(由面板控制器调用)
   *
   * @param {string[]} names
   * @memberof PanelButtonController
   */
  async dataChangeNotify(names: string[]): Promise<void> {
    await this.updateButtonState();
    super.dataChangeNotify(names);
  }

  /**
   * 面板状态变更通知
   *
   * @param {PanelNotifyState} _state
   * @memberof PanelButtonController
   */
  async panelStateNotify(_state: PanelNotifyState): Promise<void> {
    await this.updateButtonState();
    super.panelStateNotify(_state);
  }

  /**
   * 更新按钮权限状态
   *
   * @memberof PanelButtonController
   */
  async updateButtonState(): Promise<void> {
    await this.state.uiActionState.update(this.panel.context, this.data);
    this.updateGlobalAIState();
  }

  /**
   * 行为点击
   *
   * @param {MouseEvent} event
   * @return {*}  {Promise<void>}
   * @memberof PanelButtonController
   */
  async onActionClick(event: MouseEvent): Promise<void> {
    event.stopPropagation();
    event.preventDefault();
    const { uiactionId } = this.model;
    await UIActionUtil.execAndResolved(
      uiactionId!,
      {
        context: this.panel.context,
        params: this.panel.params,
        data: [this.data],
        view: this.panel.view,
        event,
        noWaitRoute: true,
      },
      this.model.appId,
    );
  }

  calcItemVisible(data: IData): void {
    // 权限不显示时就一定不显示
    if (this.state.uiActionState.visible === false) {
      this.state.visible = false;
      return;
    }
    super.calcItemVisible(data);
  }

  calcItemDisabled(data: IData): void {
    // 权限不显示时就一定禁用
    if (this.state.uiActionState.disabled === true) {
      this.state.disabled = true;
      return;
    }
    super.calcItemDisabled(data);
  }

  /**
   * @description 更新全局AI状态
   * @memberof PanelButtonController
   */
  updateGlobalAIState(): void {
    if (!this.state.isGlobalAIAssistant) return;
    const { appId, uiactionId, actionType, sysImage } = this.model;
    const params = ibiz.util.getGlobalParam();
    params.AIAssistantState = {
      appId,
      sysImage,
      actionType,
      uiActionId: uiactionId,
      placement: this.placement,
      visible: this.state.uiActionState.visible,
    };
  }
}
