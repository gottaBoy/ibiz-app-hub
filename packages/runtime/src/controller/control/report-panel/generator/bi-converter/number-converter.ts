/* eslint-disable camelcase */
import { ConverterBase } from './base/converter-base';
/**
 * @description 数值图表转换器
 * @export
 * @class NumberConverter
 * @extends {ConverterBase}
 */
export class NumberConverter extends ConverterBase {
  /**
   * @description 转化数据到报表
   * @param {IData[]} items
   * @returns {*}  {({ model: IModel; options: IData; data: IData[] } | undefined)}
   * @memberof NumberConverter
   */
  translateDataToReport(
    items: IData[],
  ): { model: IModel; options: IData; data: IData[] } | undefined {
    const {
      period,
      chart_type,
      number_fontsize,
      number_yoy_show,
      number_qoq_show,
      number_fontcolor,
      number_yoy_value,
      number_qoq_value,
      number_fontstyle,
    } = this.reportUIModel;
    const model: IModel = {
      period,
      chart_type,
      number_fontsize,
      number_yoy_show,
      number_qoq_show,
      number_fontcolor,
      number_yoy_value,
      number_qoq_value,
      number_fontstyle,
      measure: this.measures[0],
    };
    return { model, options: {}, data: items };
  }
}
