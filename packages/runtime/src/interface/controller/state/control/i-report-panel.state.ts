import { IApiReportPanelState } from '../../../api';
import { IControlState } from './i-control.state';

/**
 * @description 报表部件状态接口
 * @export
 * @interface IReportPanelState
 * @extends {IControlState}
 * @extends {IApiReportPanelState}
 */
export interface IReportPanelState extends IControlState, IApiReportPanelState {
  /**
   * @description BI报表
   * @type {{ model: IModel, options: IData, data: IData[] }}
   * @memberof IReportPanelState
   */
  biReport?: {
    /**
     * @description 模型
     * @type {IModel}
     */
    model: IModel;
    /**
     * @description 配置
     * @type {IData}
     */
    options: IData;
    /**
     * @description 数据
     * @type {IData[]}
     */
    data: IData[];
  };
}
