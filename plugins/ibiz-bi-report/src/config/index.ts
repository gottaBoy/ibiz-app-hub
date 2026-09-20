import { RuntimeError } from '@ibiz-template/core';
import { biReportT, localizeBiReportConfig } from '../locale';
import { IChartDefaultConfig } from '../interface';
import { NumberChartConfig, NumberDefaultData } from './number-chart-config';
import {
  GaugeChartModel,
  GaugeChartConfig,
  GaugeDefaultData,
} from './gauge-chart-config';
import {
  MultiSeriesColChartModel,
  MultiSeriesColChartConfig,
  MultiSeriesColDefaultData,
} from './multi-series-col-chart-config';
import {
  StackColChartModel,
  StackColChartConfig,
  StackColDefaultData,
} from './stack-col-chart-config';
import {
  ZoneColChartConfig,
  ZoneColChartModel,
  ZoneColDefaultData,
} from './zone-col-chart-config';
import {
  MultiSeriesBarChartConfig,
  MultiSeriesBarChartModel,
  MultiSeriesBarDefaultData,
} from './multi-series-bar-chart-config';
import {
  StackBarChartConfig,
  StackBarDefaultData,
  StackBarChartModel,
} from './stack-bar-chart-config';
import {
  MultiSeriesLineChartModel,
  MultiSeriesLineChartConfig,
  MultiSeriesLineDefaultData,
} from './multi-series-line-chart-config';
import {
  ZoneLineChartConfig,
  ZoneLineChartModel,
  ZoneLineDefaultData,
} from './zone-line-chart-config';
import {
  AreaChartConfig,
  AreaChartModel,
  AreaDefaultData,
} from './area-chart-config';
import { TableConfig, TableModel, TableDefaultData } from './table-config';
import {
  CrossTableConfig,
  CrossTableModel,
  CrossTableDefaultData,
} from './cross-table-config';
import {
  PieChartConfig,
  PieChartModel,
  PieDefaultData,
} from './pie-chart-config';
import {
  RadarChartConfig,
  RadarChartModel,
  RadarDefaultData,
} from './radar-chart-config';
import {
  ScatterChartConfig,
  ScatterChartModel,
  ScatterDefaultData,
} from './scatter-chart-config';

export { ChartTypes } from './chart-types';
export { NumberChartConfig, NumberDefaultData };
export { GaugeChartModel, GaugeChartConfig, GaugeDefaultData };
export {
  MultiSeriesColChartModel,
  MultiSeriesColChartConfig,
  MultiSeriesColDefaultData,
};
export { StackColChartModel, StackColChartConfig, StackColDefaultData };
export { ZoneColChartConfig, ZoneColChartModel, ZoneColDefaultData };
export {
  MultiSeriesBarChartConfig,
  MultiSeriesBarChartModel,
  MultiSeriesBarDefaultData,
};
export { StackBarChartConfig, StackBarDefaultData, StackBarChartModel };
export {
  MultiSeriesLineChartModel,
  MultiSeriesLineChartConfig,
  MultiSeriesLineDefaultData,
};
export { ZoneLineChartConfig, ZoneLineChartModel, ZoneLineDefaultData };
export { AreaChartConfig, AreaChartModel, AreaDefaultData };
export { TableConfig, TableModel, TableDefaultData };
export { CrossTableConfig, CrossTableModel, CrossTableDefaultData };
export { PieChartConfig, PieChartModel, PieDefaultData };
export { RadarChartConfig, RadarChartModel, RadarDefaultData };
export { ScatterChartConfig, ScatterChartModel, ScatterDefaultData };

export { extendData } from './extend-data';

export function getChartConfig(type: string): IChartDefaultConfig {
  let result: IChartDefaultConfig;
  switch (type) {
    case 'NUMBER':
      result = {
        chartConfig: NumberChartConfig,
        chartDefaultValue: NumberDefaultData,
      };
      break;
    case 'GAUGE':
      result = {
        chartConfig: GaugeChartConfig,
        chartModel: GaugeChartModel,
        chartDefaultValue: GaugeDefaultData,
      };
      break;
    case 'MULTI_SERIES_COL':
      result = {
        chartConfig: MultiSeriesColChartConfig,
        chartModel: MultiSeriesColChartModel,
        chartDefaultValue: MultiSeriesColDefaultData,
      };
      break;
    case 'STACK_COL':
      result = {
        chartConfig: StackColChartConfig,
        chartModel: StackColChartModel,
        chartDefaultValue: StackColDefaultData,
      };
      break;
    case 'ZONE_COL':
      result = {
        chartConfig: ZoneColChartConfig,
        chartModel: ZoneColChartModel,
        chartDefaultValue: ZoneColDefaultData,
      };
      break;
    case 'MULTI_SERIES_BAR':
      result = {
        chartConfig: MultiSeriesBarChartConfig,
        chartModel: MultiSeriesBarChartModel,
        chartDefaultValue: MultiSeriesBarDefaultData,
      };
      break;
    case 'STACK_BAR':
      result = {
        chartConfig: StackBarChartConfig,
        chartModel: StackBarChartModel,
        chartDefaultValue: StackBarDefaultData,
      };
      break;
    case 'MULTI_SERIES_LINE':
      result = {
        chartConfig: MultiSeriesLineChartConfig,
        chartModel: MultiSeriesLineChartModel,
        chartDefaultValue: MultiSeriesLineDefaultData,
      };
      break;
    case 'ZONE_LINE':
      result = {
        chartConfig: ZoneLineChartConfig,
        chartModel: ZoneLineChartModel,
        chartDefaultValue: ZoneLineDefaultData,
      };
      break;
    case 'AREA':
      result = {
        chartConfig: AreaChartConfig,
        chartModel: AreaChartModel,
        chartDefaultValue: AreaDefaultData,
      };
      break;
    case 'GRID':
      result = {
        chartConfig: TableConfig,
        chartModel: TableModel,
        chartDefaultValue: TableDefaultData,
      };
      break;
    case 'CROSSTABLE':
      result = {
        chartConfig: CrossTableConfig,
        chartModel: CrossTableModel,
        chartDefaultValue: CrossTableDefaultData,
      };
      break;
    case 'PIE':
      result = {
        chartConfig: PieChartConfig,
        chartModel: PieChartModel,
        chartDefaultValue: PieDefaultData,
      };
      break;
    case 'RADAR':
      result = {
        chartConfig: RadarChartConfig,
        chartModel: RadarChartModel,
        chartDefaultValue: RadarDefaultData,
      };
      break;
    case 'SCATTER':
      result = {
        chartConfig: ScatterChartConfig,
        chartModel: ScatterChartModel,
        chartDefaultValue: ScatterDefaultData,
      };
      break;
    default:
      throw new RuntimeError(biReportT('unknownChartType', { type }));
  }
  return {
    ...result,
    chartConfig: localizeBiReportConfig(result.chartConfig),
  };
}
