import { PanelContainerState } from '@ibiz-template/runtime';

/**
 * 分割面板容器状态
 *
 * @author zhanghengfeng
 * @date 2023-10-08 17:10:22
 * @export
 * @class SplitContainerState
 * @extends {PanelContainerState}
 */
export class SplitContainerState extends PanelContainerState {
  /**
   * @description 分割值
   * @exposedoc
   * @type {(number | string)}
   */
  splitValue: number | string = 0.5;

  /**
   * @description 是否隐藏拖拽触发器，即不允许拖拽
   * @exposedoc
   * @type {boolean}
   */
  isHiddenTrigger: boolean = false;
}
