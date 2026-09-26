import {
  ButtonContainerState,
  calcUIActionGroup,
  getAllUIActionItems,
  PanelContainerController,
  UIActionButtonState,
  UIActionUtil,
} from '@ibiz-template/runtime';
import { IPanelContainer, IUIActionGroupDetail } from '@ibiz/model-core';
import { clone } from 'ramda';
import { PanelContainerGroupState } from './panel-container-group.state';

/**
 * 面板分组容器控制器
 *
 * @export
 * @class PanelContainerGroupController
 * @extends {PanelContainerController}
 */
export class PanelContainerGroupController extends PanelContainerController<IPanelContainer> {
  /**
   * @description 状态
   * @exposedoc
   * @type {PanelContainerGroupState}
   * @memberof PanelContainerGroupController
   */
  declare state: PanelContainerGroupState;

  protected createState(): PanelContainerGroupState {
    return new PanelContainerGroupState(this.parent?.state);
  }

  /**
   * @description 禁用关闭
   * @exposedoc
   * @readonly
   * @type {boolean}
   */
  get disableClose(): boolean {
    const { titleBarCloseMode: mode } = this.model;
    return mode === 0 || mode === undefined;
  }

  /**
   * @description 是否默认展开分组
   * @exposedoc
   * @readonly
   */
  get defaultExpansion(): boolean {
    const { titleBarCloseMode: mode } = this.model;
    return this.disableClose || mode === 1;
  }

  protected async onInit(): Promise<void> {
    await super.onInit();
    if (this.model.uiactionGroup) {
      await calcUIActionGroup(
        this.model.uiactionGroup,
        this.panel.context,
        this.panel.params,
      );
    }
    await this.initActionStates();
  }

  /**
   * @description 初始化标题右侧界面行为按钮的状态
   * @returns {*}  {Promise<void>}
   * @memberof PanelContainerGroupController
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
          this.panel.context.srfappid!,
          actionid,
          detail,
        );
        containerState.addState(detail.id!, buttonState);
      }
    });
    await containerState.update(this.panel.context, this.data);
    this.state.actionGroupState = containerState;
  }

  /**
   * @description 触发界面行为
   * @param {IUIActionGroupDetail} detail
   * @param {MouseEvent} event
   * @param {IParams} [args]
   * @returns {*}  {Promise<void>}
   * @memberof PanelContainerGroupController
   */
  async onActionClick(
    detail: IUIActionGroupDetail,
    event: MouseEvent,
    args?: IParams,
  ): Promise<void> {
    const actionId = detail.uiactionId;
    const tempParams = clone(this.panel.params);
    if (args) {
      Object.assign(tempParams, args);
    }

    await UIActionUtil.execAndResolved(
      actionId!,
      {
        context: this.panel.context,
        params: tempParams,
        data: [this.data],
        view: this.panel.view,
        ctrl: this.panel,
        event,
      },
      detail.appId,
    );
  }
}
