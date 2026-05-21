import { IDEReportPanel } from '@ibiz/model-core';
import { IApiData } from '@ibiz-template/core';
import { IApiReportPanelState } from '../../state';
import { IApiControlController } from './i-api-control.controller';
import { IApiMDCtrlLoadParams } from './i-api-md-control.controller';
import { IApiReportPanelGenerator } from './report-panel';

/**
 * 报表部件
 * @description 构建智能报表引擎，支持多源数据融合、关键指标动态计算及可视化渲染，实现数据驱动的决策分析。
 * @primary
 * @export
 * @interface IReportPanelController
 * @extends {IApiControlController<T, S>}
 * @template T
 * @template S
 */
export interface IApiReportPanelController<
  T extends IDEReportPanel = IDEReportPanel,
  S extends IApiReportPanelState = IApiReportPanelState,
> extends IApiControlController<T, S> {
  /**
   * @description 报表生成器对象
   * @type {IApiData}
   * @memberof IApiReportPanelController
   */
  generator: IApiReportPanelGenerator;

  /**
   * @description 加载数据
   * @param {IApiMDCtrlLoadParams} [args] 加载参数
   * @returns {*}  {Promise<IApiData>}
   * @memberof IApiReportPanelController
   */
  load(args?: IApiMDCtrlLoadParams): Promise<IApiData>;

  /**
   * @description 获取报表数据
   * @returns {*}  {IApiData[]}
   * @memberof IApiReportPanelController
   */
  getData(): IApiData[];

  /**
   * @description 刷新
   * @returns {*}  {Promise<void>}
   * @memberof IApiReportPanelController
   */
  refresh(): Promise<void>;
}
