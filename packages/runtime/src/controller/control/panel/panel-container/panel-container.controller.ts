import { isNotNil } from 'ramda';
import { IPanelItem } from '@ibiz/model-core';
import {
  IApiPanelContainerController,
  IApiPanelContainerState,
} from '../../../../interface';
import { PanelItemController } from '../panel/panel-item.controller';
import { PanelContainerState } from './panel-container.state';

/**
 * @description 面板容器控制器
 * @primary
 * @export
 * @class PanelContainerController
 * @extends {PanelItemController<T>}
 * @implements {IApiPanelContainerController}
 * @template T
 */
export class PanelContainerController<T extends IPanelItem = IPanelItem>
  extends PanelItemController<T>
  implements IApiPanelContainerController
{
  /**
   * @description 面板容器状态
   * @exposedoc
   * @type {IApiPanelContainerState}
   * @memberof PanelContainerController
   */
  state!: IApiPanelContainerState;

  /**
   * @description 创建面板容器状态对象
   * @protected
   * @returns {*}  {PanelContainerState}
   * @memberof PanelContainerController
   */
  protected createState(): PanelContainerState {
    return new PanelContainerState(this.parent?.state);
  }

  /**
   * @description 开始加载中
   * @exposedoc
   * @param {string} [loadingText] 加载提示文本
   * @memberof PanelContainerController
   */
  startLoading(loadingText?: string): void {
    this.state.loading = true;
    if (isNotNil(loadingText)) {
      this.state.loadingText = loadingText;
    } else {
      this.state.loadingText = '';
    }
  }

  /**
   * @description 结束加载中
   * @exposedoc
   * @memberof PanelContainerController
   */
  endLoading(): void {
    this.state.loading = false;
  }
}
