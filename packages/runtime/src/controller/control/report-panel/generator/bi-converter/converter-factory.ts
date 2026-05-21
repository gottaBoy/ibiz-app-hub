import { IAppBIReport } from '@ibiz/model-core';
import { ConverterBase } from './base';
import { NumberConverter } from './number-converter';
import { StackColConverter } from './stack-col-converter';
import { MultiSeriesColConverter } from './multi-series-col-converter';
import { GaugeConverter } from './gauge-converter';
import { MultiSeriesBarConverter } from './multi-series-bar-converter';
import { ZoneColConverter } from './zone-col-converter';
import { StackBarConverter } from './stack-bar-converter';
import { MultiSeriesLineConverter } from './multi-series-line-converter';
import { ZoneLineConverter } from './zone-line-converter';
import { AreaConverter } from './area-converter';
import { PieConverter } from './pie-converter';
import { RadarConverter } from './radar-converter';
import { ScatterConverter } from './scatter-converter';
import { GridConverter } from './grid-converter';
import { CrossTableConverter } from './cross-table-converter';

/**
 * @description 转换器工厂
 * @export
 * @class ConverterFactory
 */
export class ConverterFactory {
  /**
   * @description 创建转换器
   * @static
   * @param {('NUMBER'
   *       | 'GAUGE'
   *       | 'MULTI_SERIES_COL'
   *       | 'STACK_COL'
   *       | 'ZONE_COL'
   *       | 'MULTI_SERIES_BAR'
   *       | 'STACK_BAR'
   *       | 'MULTI_SERIES_LINE'
   *       | 'ZONE_LINE'
   *       | 'AREA'
   *       | 'GRID'
   *       | 'CROSSTABLE'
   *       | 'PIE'
   *       | 'RADAR'
   *       | 'SCATTER')} chartType
   * @returns {*}  {(BaseConverter | undefined)}
   * @memberof ConverterFactory
   */
  static createConverter(
    chartType:
      | 'NUMBER'
      | 'GAUGE'
      | 'MULTI_SERIES_COL'
      | 'STACK_COL'
      | 'ZONE_COL'
      | 'MULTI_SERIES_BAR'
      | 'STACK_BAR'
      | 'MULTI_SERIES_LINE'
      | 'ZONE_LINE'
      | 'AREA'
      | 'GRID'
      | 'CROSSTABLE'
      | 'PIE'
      | 'RADAR'
      | 'SCATTER',
    model: IAppBIReport,
    context: IContext,
    params: IParams,
  ): ConverterBase | undefined {
    switch (chartType) {
      case 'NUMBER':
        return new NumberConverter(model, context, params);
      case 'GAUGE':
        return new GaugeConverter(model, context, params);
      case 'MULTI_SERIES_COL':
        return new MultiSeriesColConverter(model, context, params);
      case 'STACK_COL':
        return new StackColConverter(model, context, params);
      case 'ZONE_COL':
        return new ZoneColConverter(model, context, params);
      case 'MULTI_SERIES_BAR':
        return new MultiSeriesBarConverter(model, context, params);
      case 'STACK_BAR':
        return new StackBarConverter(model, context, params);
      case 'MULTI_SERIES_LINE':
        return new MultiSeriesLineConverter(model, context, params);
      case 'ZONE_LINE':
        return new ZoneLineConverter(model, context, params);
      case 'AREA':
        return new AreaConverter(model, context, params);
      case 'PIE':
        return new PieConverter(model, context, params);
      case 'RADAR':
        return new RadarConverter(model, context, params);
      case 'SCATTER':
        return new ScatterConverter(model, context, params);
      case 'GRID':
        return new GridConverter(model, context, params);
      case 'CROSSTABLE':
        return new CrossTableConverter(model, context, params);
      default:
        return undefined;
    }
  }
}
