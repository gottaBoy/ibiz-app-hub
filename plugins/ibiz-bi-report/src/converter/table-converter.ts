/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-param-reassign */
import {
  IAppBIReport,
  IAppBIReportDimension,
  IAppBIReportMeasure,
} from '@ibiz/model-core';
import { ControlVO } from '@ibiz-template/runtime';
import { IBIReportGridController } from '../interface';
import { deepHandData, formatField } from '../util';
import { BaseConverter } from './base-converter';

/**
 * 饼图转化器
 *
 * @author tony001
 * @date 2024-06-06 15:06:12
 * @export
 * @class TableConverter
 * @implements {IChartConverter}
 */
export class TableConverter extends BaseConverter {
  /**
   * 控制器
   *
   * @type {IBIReportGridController}
   * @memberof TableConverter
   */
  declare controller: IBIReportGridController;

  /**
   * 样式配置
   *
   * @type {IData}
   * @memberof TableConverter
   */
  styleConfig: IData = {};

  /**
   * 是否存在同环比数据
   *
   * @type {IData}
   * @memberof TableConverter
   */
  hasPeriod: boolean = false;

  /**
   * @description 表格属性映射表
   * @type {Map<string, string>}
   * @memberof TableConverter
   */
  gridFieldMap: Map<string, string> = new Map();

  /**
   * 根据样式计算列模型
   *
   * @return {*}
   * @memberof TableConverter
   */
  calcColumnStyle(enableAgg: boolean = true) {
    const { gridFont, agg } = this.styleConfig;
    const result: IData = {};
    if (gridFont) {
      result.align = gridFont.gridBodyAlign;
    }
    if (enableAgg && agg && agg.show) {
      result.aggMode = 'SUM';
    }
    return result;
  }

  /**
   * 计算表格列模型
   *
   * @param {IData} data
   * @return {*}
   * @memberof TableConverter
   */
  calcGridColumns(data: IAppBIReport) {
    const { appBIReportMeasures = [], appBIReportDimensions = [] } = data;
    const degridColumns = [];
    if (appBIReportDimensions.length > 0) {
      const groupColumn = appBIReportDimensions.map(
        (item: IAppBIReportDimension) => {
          return {
            dataItemName: this.getGridField(item.dimensionTag),
            appDEFieldId: this.getGridField(item.appDEFieldId),
            caption: item.dimensionName,
            codeName: this.getGridField(item.dimensionTag),
            width: 150,
            widthUnit: 'STAR',
            appCodeListId: item.appCodeListId,
            columnType: 'DEFGRIDCOLUMN',
            id: this.getGridField(item.dimensionTag),
            appId: 'srfAppId',
            ...this.calcColumnStyle(false),
          };
        },
      );
      degridColumns.push(...groupColumn);
    }
    if (appBIReportMeasures.length > 0) {
      degridColumns.push(
        ...appBIReportMeasures.map((item: IAppBIReportMeasure) => {
          return {
            dataItemName: this.getGridField(item.measureTag),
            appDEFieldId: this.getGridField(
              item.appDEFieldId || item.measureTag,
            ),
            caption: item.measureName,
            codeName: this.getGridField(item.measureTag),
            width: 150,
            widthUnit: 'STAR',
            appCodeListId: item.appCodeListId,
            columnType: 'DEFGRIDCOLUMN',
            id: this.getGridField(item.measureTag),
            appId: 'srfAppId',
            format: item.jsonFormat,
            valueType: 'SIMPLE',
            ...this.calcColumnStyle(),
            align: 'RIGHT',
          };
        }),
      );
    }
    return degridColumns;
  }

  /**
   * 计算表格数据列
   *
   * @param {IData[]} columns
   * @return {*}
   * @memberof TableConverter
   */
  calcGridDataItems(columns: IData[]) {
    const degridDataItems: IData[] = [];
    columns.forEach((column: IData) => {
      degridDataItems.push({
        appDEFieldId: column.appDEFieldId,
        valueType: 'SIMPLE',
        dataType: 25,
        id: column.id,
        appId: 'srfAppId',
        format: column.format,
      });
      if (column.columnType === 'GROUPGRIDCOLUMN') {
        degridDataItems.push(...this.calcGridDataItems(column.degridColumns));
      }
    });
    return degridDataItems;
  }

  /**
   * 计算行合并
   *
   * @param {IAppBIReport} data
   * @return {*}
   * @memberof TableConverter
   */
  calcRowSpan(data: IAppBIReport) {
    const { appBIReportDimensions = [] } = data;
    return appBIReportDimensions.map((x: IData) => x.dimensionTag);
  }

  /**
   * 通过数据翻译模型
   *
   * @param {(IAppBIReport | undefined)} data
   * @param {IModel} model
   * @param {IData} [opts={}]
   * @return {*}  {(Promise<IModel | undefined>)}
   * @memberof TableConverter
   */
  async translateDataToModel(
    data: IAppBIReport | undefined,
    model: IModel,
    opts: IData = {},
  ): Promise<IModel | undefined> {
    const { appDataEntityId, mode, items = [] } = opts;
    if (!data || !model || !appDataEntityId) return;
    if (!data.appBIReportMeasures) return model;
    const input = {
      appId: data.appId || ibiz.env.appId,
      appDataEntityId,
      caption: data!.name,
      value: data.appBIReportMeasures[0].measureTag,
    };
    this.calcGridFieldMap(data, items);
    this.styleConfig = this.getStyleConfig(data) || {};
    const degridColumns = this.calcGridColumns(data);
    const degridDataItems = this.calcGridDataItems(degridColumns);
    Object.assign(model, { degridColumns, degridDataItems });
    this.controller.state.tableData = this.filterPeriod(
      this.controller.state.items,
    );
    deepHandData(model, (str: string) => {
      return formatField(str, input);
    });
    this.transformStyle(data, model, mode);
    // 反查
    if (mode === 'CONTENT') {
      const { appBIReportMeasures = [], appBIReportDimensions = [] } = data;
      this.controller.state.attrs = {
        'cell-class-name': ({ column }: IData) => {
          const index = appBIReportMeasures.findIndex(
            x => x.measureTag === column.property,
          );
          if (index !== -1) {
            return 'enable-pointer';
          }
        },
        onCellClick: (row: ControlVO, column: IData) => {
          // 全屏时不反查
          if (ibiz.fullscreenUtil.isFullScreen) {
            return;
          }
          const measure = appBIReportMeasures.find(
            (x: IData) => x.measureTag === column.property,
          );
          if (!measure || !measure.drillDetailAppViewId) {
            return;
          }
          const origin = row.getOrigin();
          const dimension = appBIReportDimensions.map(x => {
            return {
              value: this.getDrillValue(
                origin.$origin || origin,
                x.dimensionTag!,
              ),
              name: x.dimensionTag!,
            };
          });
          const args = {
            measure: {
              name: column.property,
            },
            dimension,
          };
          this.controller.handleDrillDetail(args);
        },
      };
    }
    return model;
  }

  /**
   * 获取样式配置
   *
   * @param {IAppBIReport} config
   * @memberof TableConverter
   */
  getStyleConfig(config: IAppBIReport) {
    const { reportUIModel } = config;
    if (reportUIModel) {
      const reportUIModelObject = JSON.parse(reportUIModel);
      if (reportUIModelObject.style) {
        return reportUIModelObject.style;
      }
      this.hasPeriod = !!reportUIModelObject.period;
    }
  }

  /**
   * 转换样式
   *
   * @param {IAppBIReport} data
   * @param {IData} model
   * @memberof TableConverter
   */
  transformStyle(data: IAppBIReport, model: IData, mode?: string) {
    const style = this.styleConfig;
    const result: IData = {
      vars: {},
      classList: [],
    };
    result.vars = {
      '--ibiz-control-grid-header-align': style.gridFont.gridHeaderAlign,
      '--ibiz-control-grid-header-font-size': `${style.gridFont.gridHeader.fontSize}px`,
      '--ibiz-control-grid-header-font-weight':
        style.gridFont.gridHeader.fontWeight,
      '--ibiz-control-grid-header-text-color': style.gridFont.gridHeader.color,
      '--ibiz-control-grid-header-font-style':
        style.gridFont.gridHeader.fontStyle,
      '--ibiz-control-grid-content-font-size': `${style.gridFont.gridBody.fontSize}px`,
      '--ibiz-control-grid-content-font-weight':
        style.gridFont.gridBody.fontWeight,
      '--ibiz-control-grid-content-text-color': style.gridFont.gridBody.color,
      '--ibiz-control-grid-content-font-style':
        style.gridFont.gridBody.fontStyle,
    };
    if (style.agg.show) {
      Object.assign(model, { aggMode: 'PAGE' });
      if (style.agg.position === 'top') {
        result.classList.push('el-table--top-agg');
      }
    }
    if (style.function.show) {
      const ctrlParams = {};
      const details = style.function.function || [];
      if (!details.includes('fixedGridHeader')) {
        result.classList.push('el-table--scroll-header');
      }
      if (details.includes('dimensionMerge')) {
        const rowspankeys = this.calcRowSpan(data);
        Object.assign(ctrlParams, { rowspankeys });
      }
      if (details.includes('fixedDimension') && data.appBIReportDimensions) {
        Object.assign(model, {
          frozenFirstColumn: data.appBIReportDimensions.length,
        });
      }
      if (details.includes('showPercent')) {
        Object.assign(ctrlParams, {
          percentkeys: data.appBIReportMeasures!.map(
            (x: IData) => x.measureTag,
          ),
        });
      }
      Object.assign(model.controlParam, { ctrlParams });
    }
    if (mode === 'CONTENT') {
      result.classList.push('el-table--is-drill');
    }
    this.controller.state.style = result;
  }

  /**
   * 过滤同环比数据
   *
   * @param {IAppBIReport} data
   * @param {IData} model
   * @memberof TableConverter
   */
  filterPeriod(items: IData[]) {
    return items.filter(x => !x.srfperiodtype);
  }

  /**
   * @description 获取反查值
   * @param {IData} item
   * @param {string} name
   * @return {*}
   * @memberof TableConverter
   */
  getDrillValue(item: IData, name: string) {
    if (
      item.$origin &&
      Object.prototype.hasOwnProperty.call(item.$origin, name)
    ) {
      return item.$origin[name];
    }
    return item[name];
  }

  /**
   * @description 计算表格属性
   * @param {IData} data
   * @param {IData[]} items
   * @memberof TableConverter
   */
  calcGridFieldMap(data: IData, items: IData[]) {
    this.gridFieldMap.clear();
    let allFields: string[] = [];
    items.forEach((item: IData) => {
      allFields = Array.from(new Set([...allFields, ...Object.keys(item)]));
    });
    const { appBIReportMeasures = [], appBIReportDimensions = [] } = data;
    appBIReportMeasures.forEach((item: IAppBIReportMeasure) => {
      if (
        item.appDEFieldId &&
        allFields.includes(`${item.appDEFieldId}_text`)
      ) {
        this.gridFieldMap.set(item.appDEFieldId, `${item.appDEFieldId}_text`);
      }
      if (item.measureTag && allFields.includes(`${item.measureTag}_text`)) {
        this.gridFieldMap.set(item.measureTag, `${item.measureTag}_text`);
      }
    });
    appBIReportDimensions.forEach((item: IAppBIReportDimension) => {
      if (
        item.appDEFieldId &&
        allFields.includes(`${item.appDEFieldId}_text`)
      ) {
        this.gridFieldMap.set(item.appDEFieldId, `${item.appDEFieldId}_text`);
      }
      if (
        item.dimensionTag &&
        allFields.includes(`${item.dimensionTag}_text`)
      ) {
        this.gridFieldMap.set(item.dimensionTag, `${item.dimensionTag}_text`);
      }
    });
  }

  /**
   * @description 获取表格属性
   * @param {string} codeName
   * @return {*}  {string}
   * @memberof TableConverter
   */
  getGridField(codeName?: string): string | undefined {
    if (codeName && this.gridFieldMap.has(codeName)) {
      return this.gridFieldMap.get(codeName);
    }
    return codeName;
  }
}
