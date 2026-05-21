import { ConverterBase } from './bi-converter/base';
import { ReportPanelBaseGenerator } from './base-generator';
import { ConverterFactory } from './bi-converter/converter-factory';

/**
 * @description BI报表生成器
 * @export
 * @class BIReportPanelGenerator
 * @extends {ReportPanelBaseGenerator}
 */
export class BIReportPanelGenerator extends ReportPanelBaseGenerator {
  /**
   * @description 转换器
   * @type {BaseConverter}
   * @memberof BIReportPanelGenerator
   */
  converter?: ConverterBase;

  /**
   * @description 初始化配置
   * @returns {*}  {Promise<void>}
   * @memberof BIReportPanelGenerator
   */
  public async initConfig(): Promise<void> {
    const { appDEReport } = this.model;
    const { appBIReport } = appDEReport!;
    const appBISchemeId = appDEReport!.appBISchemeId!.split('.').pop();
    (appBIReport as IData).appBISchemeId = appBISchemeId;
    this.config = appBIReport!;
    await this.initConverter();
  }

  /**
   * @description 初始化转换器
   * @private
   * @memberof BIReportPanelGenerator
   */
  private async initConverter(): Promise<void> {
    const { appDEReport } = this.model;
    if (!appDEReport || !appDEReport.appBIReport) return;
    const { reportUIModel } = appDEReport.appBIReport;
    if (reportUIModel) {
      const tempReportUIModel = JSON.parse(reportUIModel);
      // 仅处理建模平台创建出来报表
      if (tempReportUIModel.chart_type) {
        this.reportType = tempReportUIModel.chart_type;
        this.converter = ConverterFactory.createConverter(
          tempReportUIModel.chart_type,
          appDEReport.appBIReport,
          this.reportPanel.context,
          this.reportPanel.params,
        );
        await this.converter?.init();
      }
    }
  }

  /**
   * @description 生成
   * @param {IData[]} items
   * @returns {*}  {({
   *         model: IModel;
   *         options: IData;
   *         data: IData[];
   *       }
   *     | undefined)}
   * @memberof BIReportPanelGenerator
   */
  public generate(items: IData[]):
    | {
        model: IModel;
        options: IData;
        data: IData[];
      }
    | undefined {
    return this.converter?.translateDataToReport(items);
  }
}
