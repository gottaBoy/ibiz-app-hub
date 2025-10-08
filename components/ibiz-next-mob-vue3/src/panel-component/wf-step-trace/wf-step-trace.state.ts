import { PanelItemState } from '@ibiz-template/runtime';

/**
 * 流程跟踪占位状态
 *
 * @export
 * @class NavPosState
 * @extends {PanelItemState}
 */
export class WFStepTraceState extends PanelItemState {
  /**
   * @description 流程跟踪数据
   * @exposedoc
   * @type {IData}
   * @memberof WFStepTraceState
   */
  data: IData[] = [];
}
