import { IApiData } from '@ibiz-template/core';
import { IApiMDControlState } from './i-api-md-control.state';

/**
 * @description 图表部件状态接口
 * @primary
 * @export
 * @interface IApiChartState
 * @extends {IApiMDControlState}
 */
export interface IApiChartState extends IApiMDControlState {
  /**
   * @description 是否开启图表表格，该状态仅PC端使用。
   * @type {boolean}
   * @default false
   * @memberof IApiChartState
   */
  showGrid: boolean;

  /**
   * @description 表格所在方位，值为top：上、right：右、bottom：下、left：左，该状态仅PC端使用。
   * @type {string}
   * @default bottom
   * @memberof IApiChartState
   */
  gridPosition: string;
}

/**
 * @description 图表数据格式接口
 * @export
 * @interface IApiChartData
 */
export interface IApiChartData {
  /**
   * 序列模型id
   *
   */
  _seriesModelId?: string;

  /**
   * 分组名称
   *
   */
  _groupName?: string;

  /**
   * 分类值
   *
   */
  _catalog?: string;

  /**
   * @description 预置导航参数
   * @type {IApiData}
   * @memberof IApiChartData
   */
  navParams: IApiData;
}
