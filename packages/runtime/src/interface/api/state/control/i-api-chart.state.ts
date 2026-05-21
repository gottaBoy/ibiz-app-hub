import { IApiMDControlState } from './i-api-md-control.state';

/**
 * @description 图表数据预置导航参数接口
 * @export
 * @interface IApiChartDataNavParams
 */
export interface IApiChartDataNavParams {
  /**
   * @description 分类值
   * @type {string}
   * @memberof IApiChartDataNavParams
   */
  srfcategory?: string;
  /**
   * @description 配置的分类值
   * @type {string}
   * @memberof IApiChartDataNavParams
   */
  srfcategoryvalue?: string;
  /**
   * @description 配置的序列名称值
   * @type {string}
   * @memberof IApiChartDataNavParams
   */
  srfgroupvalue?: string;
  /**
   * @description 开始时间
   * @type {string}
   * @memberof IApiChartDataNavParams
   */
  srfstarttime?: string;
  /**
   * @description 结束时间
   * @type {string}
   * @memberof IApiChartDataNavParams
   */
  srfendtime?: string;
}

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
   * @description 序列模型id
   * @type {string}
   * @memberof IApiChartData
   */
  _seriesModelId?: string;

  /**
   * @description 分组名称
   * @type {string}
   * @memberof IApiChartData
   */
  _groupName?: string;

  /**
   * @description 分类值
   * @type {string}
   * @memberof IApiChartData
   */
  _catalog?: string;

  /**
   * @description 预置导航参数
   * @type {IApiChartDataNavParams}
   * @memberof IApiChartData
   */
  navParams: IApiChartDataNavParams;
}
