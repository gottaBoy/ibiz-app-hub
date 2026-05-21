import { IApiData } from '@ibiz-template/core';

/**
 * @description 报表生成器
 * @export
 * @interface IApiReportPanelGenerator
 */
export interface IApiReportPanelGenerator {
  /**
   * @description 报表类型
   * @type {string}
   * @memberof IApiReportPanelGenerator
   */
  reportType?: string;

  /**
   * @description 加载数据
   * @param {IApiData} [data] 数据
   * @returns {*}  {Promise<IApiData>}
   * @memberof IApiReportPanelGenerator
   */
  load(data?: IApiData): Promise<IApiData>;

  /**
   * @description 生成报表
   * @param {IApiData[]} items 数据集合
   * @returns {*}  {({ model: IModel; options: IApiData; data: IApiData[] } | undefined)}
   * @memberof IApiReportPanelGenerator
   */
  generate(
    items: IApiData[],
  ): { model: IModel; options: IApiData; data: IApiData[] } | undefined;
}
