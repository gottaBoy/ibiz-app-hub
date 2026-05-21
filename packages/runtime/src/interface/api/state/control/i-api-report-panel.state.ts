import { IApiData, IApiParams } from '@ibiz-template/core';
import { IApiControlState } from './i-api-control.state';

/**
 * @description 报表部件状态接口
 * @primary
 * @export
 * @interface IApiReportPanelState
 * @extends {IApiControlState}
 */
export interface IApiReportPanelState extends IApiControlState {
  /**
   * @description 是否加载完成
   * @type {boolean}
   * @default false
   * @memberof IApiReportPanelState
   */
  isLoaded: boolean;

  /**
   * @description 搜索部件的查询参数
   * @type {IApiParams}
   * @default {}
   * @memberof IApiReportPanelState
   */
  searchParams: IApiParams;

  /**
   * @description 报表数据
   * @type {(IApiData[])}
   * @default {}
   * @memberof IApiReportPanelState
   */
  data: IApiData[];

  /**
   * @description 是否正在处理中
   * @type {boolean}
   * @default false
   * @memberof IApiReportPanelState
   */
  processing: boolean;
}
