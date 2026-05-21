import { PanelItemState, UIActionButtonState } from '@ibiz-template/runtime';

/**
 * 面板按钮状态
 *
 * @author lxm
 * @date 2023-02-07 06:04:27
 * @export
 * @class PanelButtonState
 * @extends {PanelItemState}
 */
export class PanelButtonState extends PanelItemState {
  /**
   * @description 加载中
   * @exposedoc
   * @type {boolean}
   */
  loading: boolean = false;

  /**
   * @description 界面行为状态
   * @exposedoc
   * @type {UIActionButtonState}
   */
  uiActionState!: UIActionButtonState;

  /**
   * @description 是否为全局AI助手
   * @type {boolean}
   * @memberof PanelButtonState
   */
  isGlobalAIAssistant: boolean = false;
}
