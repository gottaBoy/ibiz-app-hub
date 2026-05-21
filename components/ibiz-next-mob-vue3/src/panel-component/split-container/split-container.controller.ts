import { IPanelContainer } from '@ibiz/model-core';
import { PanelContainerController } from '@ibiz-template/runtime';
import { SplitContainerState } from './split-container.state';

/**
 * 分割面板容器控制器
 *
 * @author zhanghengfeng
 * @date 2023-08-22 17:08:37
 * @export
 * @class SplitContainerController
 * @extends {PanelContainerController<IPanelContainer>}
 */
export class SplitContainerController extends PanelContainerController<IPanelContainer> {
  /**
   * @description 分割面板容器状态
   * @exposedoc
   * @author zhanghengfeng
   * @date 2023-10-08 17:10:25
   * @type {SplitContainerState}
   */
  declare state: SplitContainerState;

  /**
   * @description 分割面板模式
   * @exposedoc
   * @author zhanghengfeng
   * @date 2023-08-22 17:08:24
   * @type {('horizontal' | 'vertical')}
   */
  splitMode: 'horizontal' | 'vertical' = 'horizontal';

  /**
   * @description 默认分割值
   * @exposedoc
   * @author zhanghengfeng
   * @date 2023-08-22 17:08:38
   * @type {(number | string)}
   */
  splitValue: number | string = 0.5;

  /**
   * @description 面板隐藏前分割值
   * @author zhanghengfeng
   * @date 2023-10-08 17:10:58
   * @type {(number | string | null)}
   */
  lastSplitValue: number | string | null = null;

  /**
   * 初始化默认分割值
   *
   * @author zhanghengfeng
   * @date 2023-08-22 17:08:13
   * @param {number} value
   * @param {string} mode
   */
  initSplitValue(value: number, mode: string): void {
    if (mode === 'PX') {
      this.splitValue = `${value}px`;
    }
    if (mode === 'PERCENTAGE') {
      this.splitValue = value / 100;
    }
    this.state.splitValue = this.splitValue;
  }

  protected async onInit(): Promise<void> {
    await super.onInit();
    const { predefinedType, panelItems } = this.model;
    this.splitMode =
      predefinedType === 'CONTAINER_V_SPLIT' ? 'vertical' : 'horizontal';
    if (Array.isArray(panelItems) && panelItems.length) {
      const panelItem = panelItems[0];
      const layoutPos = panelItem.layoutPos;
      if (layoutPos) {
        if (this.splitMode === 'horizontal') {
          const { width, widthMode } = layoutPos;
          if (width != null && widthMode != null) {
            this.initSplitValue(width, widthMode);
          }
        }
        if (this.splitMode === 'vertical') {
          const { height, heightMode } = layoutPos;
          if (height != null && heightMode != null) {
            this.initSplitValue(height, heightMode);
          }
        }
      }
    }
  }

  /**
   * @description 隐藏面板，left：左侧面板隐藏，right：右侧面板隐藏，top：上方面板隐藏，bottom：底部面板隐藏
   * @exposedoc
   * @author zhanghengfeng
   * @date 2023-10-08 17:10:35
   * @param {('left' | 'right' | 'top' | 'bottom')} position
   */
  hiddenPanel(position: 'left' | 'right' | 'top' | 'bottom'): void {
    if (!this.state.isHiddenTrigger)
      this.lastSplitValue = this.state.splitValue;
    if (position === 'left' || position === 'top') {
      this.state.splitValue = 0;
    }
    if (position === 'right' || position === 'bottom') {
      this.state.splitValue = 1;
    }
    this.state.isHiddenTrigger = true;
  }

  /**
   * @description 显示面板，恢复上一次的分割比例
   * @exposedoc
   * @author zhanghengfeng
   * @date 2023-10-08 17:10:31
   */
  showPanel(): void {
    if (this.lastSplitValue != null) {
      this.state.splitValue = this.lastSplitValue;
      this.state.isHiddenTrigger = false;
      this.lastSplitValue = null;
    }
  }
}
