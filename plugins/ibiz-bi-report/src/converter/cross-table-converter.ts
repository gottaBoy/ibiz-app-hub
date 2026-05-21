/* eslint-disable no-continue */
/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-param-reassign */
import { CodeListItem, ControlVO } from '@ibiz-template/runtime';
import {
  IAppBIReport,
  IAppBIReportDimension,
  IAppBIReportMeasure,
} from '@ibiz/model-core';
import { clone, plus } from '@ibiz-template/core';
import { deepHandData, formatField } from '../util';
import { BaseConverter } from './base-converter';
import { IBIReportGridController } from '../interface';

/**
 * 交叉表转化器
 *
 * @author tony001
 * @date 2024-06-06 15:06:12
 * @export
 * @class CrossTableConverter
 * @implements {IChartConverter}
 */
export class CrossTableConverter extends BaseConverter {
  /**
   * 控制器
   *
   * @type {IBIReportGridController}
   * @memberof CrossTableConverter
   */
  declare controller: IBIReportGridController;

  /**
   * 代码表项
   *
   * @type {readonly}
   * @memberof CrossTableConverter
   */
  codeListItems?: readonly CodeListItem[];

  /**
   * 样式配置
   *
   * @type {IData}
   * @memberof CrossTableConverter
   */
  styleConfig: IData = {};

  /**
   * 是否存在同环比数据
   *
   * @type {IData}
   * @memberof CrossTableConverter
   */
  hasPeriod: boolean = false;

  /**
   * 代码表列
   *
   * @type {string[]}
   * @memberof CrossTableConverter
   */
  codelistColumn: string[] = [];

  /**
   * 合计列标识
   *
   * @type {string}
   * @memberof CrossTableConverter
   */
  totalColTag: string = 'col_sum';

  /**
   * 百分比数据
   *
   * @type {string}
   * @memberof CrossTableConverter
   */
  percentkeys: string[] = [];

  /**
   * 指标
   *
   * @type {IAppBIReportMeasure[]}
   * @memberof CrossTableConverter
   */
  measures: IAppBIReportMeasure[] = [];

  /**
   * @description 维度行
   * @type {IAppBIReportDimension[]}
   * @memberof CrossTableConverter
   */
  dimensionRow: IAppBIReportDimension[] = [];

  /**
   * @description 维度列
   * @type {IAppBIReportDimension[]}
   * @memberof CrossTableConverter
   */
  dimensionCol: IAppBIReportDimension[] = [];

  /**
   * @description 指标总数
   * @type {IData}
   * @memberof CrossTableConverter
   */
  measuresTotalResult: IData = {};

  /**
   * @description 列维度数据映射表
   * @type {Map<string, string>}
   * @memberof CrossTableConverter
   */
  colDataMap: Map<string, string> = new Map();

  /**
   * @description 表格属性映射表
   * @type {Map<string, string>}
   * @memberof CrossTableConverter
   */
  gridFieldMap: Map<string, string> = new Map();

  /**
   * 根据样式计算列模型
   *
   * @return {*}
   * @memberof CrossTableConverter
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
   * 计算合计列
   *
   * @param {string} position
   * @param {IData[]} degridColumns
   * @memberof CrossTableConverter
   */
  calcTotalCol(position: string, degridColumns: IData[]) {
    const { agg } = this.styleConfig;
    if (
      this.dimensionCol.length > 0 &&
      agg.show &&
      agg.colPosition === position
    ) {
      const children = this.clacMeasureColumns(this.measures, this.totalColTag);
      const column = {
        dataItemName: this.totalColTag,
        appDEFieldId: this.totalColTag,
        caption: '合计',
        codeName: this.totalColTag,
        columnType: 'GROUPGRIDCOLUMN',
        id: this.totalColTag,
        appId: 'srfAppId',
        degridColumns: children,
      };
      degridColumns.push(column);
    }
  }

  /**
   * 计算分组类型
   *
   * @param {IAppBIReport} data
   * @param {IData[]} items
   * @memberof CrossTableConverter
   */
  async calcGroupType(items: IData[]) {
    const result: string[] = [];
    if (this.dimensionCol.length > 0) {
      const { dimensionTag, appCodeListId } = this.dimensionCol[0];
      const { context, viewParams } = this.controller;
      if (appCodeListId) {
        await this.loadCodeList(appCodeListId, context, viewParams);
      }
      let hasBlank = false;
      items.forEach((item: IData) => {
        const value = item[this.getGridField(dimensionTag!)];
        if (!value) {
          hasBlank = true;
        } else if (!result.includes(value)) {
          result.push(value);
        }
      });
      if (hasBlank) {
        result.push('');
      }
    }
    return result;
  }

  /**
   * 计算指标列
   *
   * @param {IData[]} measure
   * @param {string} type
   * @return {*}
   * @memberof CrossTableConverter
   */
  clacMeasureColumns(measure: IData[], type?: string) {
    return measure.map((item: IData) => {
      let codeName = this.getGridField(item.measureTag!);
      if (type) {
        codeName = `${type}@${codeName}`;
      }
      const totalCodename = `${this.totalColTag}@${this.getGridField(
        item.measureTag!,
      )}`;
      if (item.appCodeListId) {
        this.codelistColumn.push(codeName);
      }
      this.percentkeys.push(codeName);
      return {
        dataItemName: codeName,
        appDEFieldId: codeName,
        caption: item.measureName,
        codeName,
        width: 150,
        widthUnit: 'STAR',
        appCodeListId: item.appCodeListId,
        columnType: 'DEFGRIDCOLUMN',
        id: codeName,
        appId: 'srfAppId',
        totalCodename,
        format: item.jsonFormat,
        valueType: 'SIMPLE',
        ...this.calcColumnStyle(),
        align: 'RIGHT',
      };
    });
  }

  /**
   * 计算表格列模型
   *
   * @param {IAppBIReport} data
   * @return {*}
   * @memberof CrossTableConverter
   */
  calcGridColumns(groupType: string[]) {
    const degridColumns = [];
    if (this.dimensionRow) {
      degridColumns.push(
        ...this.dimensionRow.map((item: IAppBIReportDimension) => {
          if (item.appCodeListId) {
            this.codelistColumn.push(this.getGridField(item.dimensionTag!));
          }
          return {
            dataItemName: this.getGridField(item.dimensionTag!),
            appDEFieldId: this.getGridField(
              item.appDEFieldId || item.dimensionTag!,
            ),
            width: 150,
            widthUnit: 'STAR',
            appCodeListId: item.appCodeListId,
            caption: item.dimensionName,
            codeName: this.getGridField(item.dimensionTag!),
            columnType: 'DEFGRIDCOLUMN',
            id: this.getGridField(item.dimensionTag!),
            appId: 'srfAppId',
            ...this.calcColumnStyle(false),
          };
        }),
      );
    }
    this.calcTotalCol('left', degridColumns);
    // 维度列为分组列，包含指标
    if (this.dimensionCol.length > 0) {
      const item: IAppBIReportDimension = this.dimensionCol[0];
      const groupColumns = groupType.map(type => {
        const children = this.clacMeasureColumns(this.measures, type);
        return {
          dataItemName: this.getGridField(item.dimensionTag!),
          appDEFieldId: this.getGridField(item.appDEFieldId!),
          caption: this.transCodeListValue(type),
          appCodeListId: item.appCodeListId,
          codeName: this.getGridField(item.dimensionTag!),
          columnType: 'GROUPGRIDCOLUMN',
          id: this.getGridField(item.dimensionTag!),
          appId: 'srfAppId',
          degridColumns: children,
        };
      });
      degridColumns.push(...groupColumns);
    } else {
      const children = this.clacMeasureColumns(this.measures);
      degridColumns.push(...children);
    }
    this.calcTotalCol('right', degridColumns);
    return degridColumns;
  }

  /**
   * 计算表格数据列
   *
   * @param {IData[]} columns
   * @return {*}
   * @memberof CrossTableConverter
   */
  calcGridDataItems(columns: IData[]) {
    const degridDataItems: IData[] = [];
    const details = this.styleConfig.function.function || [];
    columns.forEach((column: IData) => {
      const otherParams: IData = {};
      if (
        details.includes('showPercent') &&
        column.totalCodename &&
        this.measuresTotalResult[column.totalCodename]
      ) {
        otherParams.customCode = true;
        otherParams.scriptCode = `
        if (Object.prototype.hasOwnProperty.call(data, '${
          column.appDEFieldId
        }')) {
          const value = data['${column.appDEFieldId}'] / ${
            this.measuresTotalResult[column.totalCodename]
          };
          let formatValue = data['${column.appDEFieldId}'];
          if (controller.valueFormat) {
            formatValue = ibiz.util.text.format(formatValue, controller.valueFormat);
          }
          return formatValue + '(' + ibiz.util.text.format(value, '0.##%') + ')'
        }`;
      }
      degridDataItems.push({
        appDEFieldId: column.appDEFieldId,
        valueType: 'SIMPLE',
        dataType: 25,
        id: column.id,
        appId: 'srfAppId',
        format: column.format,
        ...otherParams,
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
   * @param {IData} data
   * @return {*}
   * @memberof CrossTableConverter
   */
  calcRowSpan() {
    return this.dimensionRow.map((x: IData) =>
      this.getGridField(x.dimensionTag!),
    );
  }

  /**
   * 是否存在数据项
   *
   * @param {IData[]} items
   * @param {IAppBIReportDimension[]} dimension_row
   * @return {*}
   * @memberof CrossTableConverter
   */
  getItem(
    items: IData[],
    dimension_row: IAppBIReportDimension[],
    item: IData,
  ): IData | undefined {
    return items.find(x => {
      return (
        dimension_row.findIndex(
          c =>
            x[this.getGridField(c.dimensionTag!)] !==
            item[this.getGridField(c.dimensionTag!)],
        ) === -1
      );
    });
  }

  /**
   * 计算表格数据
   *
   * @param {IAppBIReport} data
   * @param {IData[]} items
   * @memberof CrossTableConverter
   */
  calcGridData(items: IData[]) {
    this.colDataMap.clear();
    if (this.dimensionCol.length > 0) {
      const result: IData[] = [];
      const { dimensionTag } = this.dimensionCol[0];
      items.forEach((item: IData) => {
        this.measures.forEach((_item: IAppBIReportMeasure) => {
          const type = this.getGridField(_item.measureTag!) || '';
          const value = item[this.getGridField(dimensionTag!)];
          let key = type || '';
          if (value) {
            key = `${value}@${type}`;
            this.colDataMap.set(
              value,
              this.getDrillValue(item, this.getGridField(dimensionTag!)),
            );
          }
          const oldData = this.getItem(result, this.dimensionRow, item);
          if (oldData) {
            oldData[key] = item[type];
          } else {
            const newItem = { [key]: item[type] };
            this.dimensionRow.forEach((x: IData) => {
              newItem[this.getGridField(x.dimensionTag!)] =
                item[this.getGridField(x.dimensionTag!)];
            });
            newItem.$origin = item.$origin;
            result.push(newItem);
          }
        });
      });
      return result;
    }
    return items;
  }

  /**
   * 计算统计数据
   *
   * @param {IData[]} items
   * @return {*}
   * @memberof CrossTableConverter
   */
  calcTotalData(items: IData[]) {
    this.measures.forEach(measure => {
      const codeName = `${this.totalColTag}@${this.getGridField(
        measure.measureTag!,
      )}`;
      this.measuresTotalResult[codeName] = 0;
    });
    items.forEach((item: IData) => {
      this.measures.forEach(measure => {
        const codeName = `${this.totalColTag}@${this.getGridField(
          measure.measureTag!,
        )}`;
        const total = this.percentkeys.reduce((a, b) => {
          const bvalue = Number(item[b]) || 0;
          return plus(a, bvalue);
        }, 0);
        this.measuresTotalResult[codeName] += total;
        item[codeName] = total;
      });
    });
  }

  /**
   * 通过数据翻译模型
   *
   * @param {(IAppBIReport | undefined)} data
   * @param {IModel} model
   * @param {IData} [opts={}]
   * @return {*}  {(Promise<IModel | undefined>)}
   * @memberof CrossTableConverter
   */
  async translateDataToModel(
    data: IAppBIReport | undefined,
    model: IModel,
    opts: IData = {},
  ): Promise<IModel | undefined> {
    const { appDataEntityId, mode, items = [] } = opts;
    if (!data || !model || !appDataEntityId) return;
    const { appBIReportMeasures, appBIReportDimensions = [] } = data;
    if (!appBIReportMeasures) return model;
    this.measures = appBIReportMeasures;
    this.getDimension(appBIReportDimensions);
    const input = {
      appId: data.appId || ibiz.env.appId,
      appDataEntityId,
      caption: data!.name,
      value: appBIReportMeasures[0].measureTag,
    };
    this.styleConfig = this.getStyleConfig(data) || {};
    this.codelistColumn = [];
    this.percentkeys = [];
    this.calcGridFieldMap(items);
    const temItems = this.filterPeriod(clone(items));
    const dynamicGroupType = await this.calcGroupType(temItems);
    const degridColumns = this.calcGridColumns(dynamicGroupType);
    const newItems = this.calcGridData(temItems);
    this.calcTotalData(newItems);
    const degridDataItems = this.calcGridDataItems(degridColumns);
    this.controller.state.tableData = newItems;
    Object.assign(model, { degridColumns, degridDataItems });
    deepHandData(model, (str: string) => {
      return formatField(str, input);
    });
    this.transformStyle(model, mode);
    // 反查
    if (mode === 'CONTENT') {
      this.controller.state.attrs = {
        'cell-class-name': ({ column }: IData) => {
          const property = column.property.split('@').pop();
          const index = this.measures.findIndex(
            x => this.getGridField(x.measureTag!) === property,
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
          const property = column.property.split('@').pop();
          const measure = appBIReportMeasures.find(
            (x: IData) => this.getGridField(x.measureTag!) === property,
          );
          // 合计列或无反查视图直接返回
          if (
            !measure ||
            !measure.drillDetailAppViewId ||
            column.property.startsWith(this.totalColTag)
          ) {
            return;
          }
          const origin = row.getOrigin();
          const dimension = this.dimensionRow.map(x => {
            return {
              value: this.getDrillValue(
                origin.$origin || origin,
                x.dimensionTag!,
              ),
              name: x.dimensionTag!,
            };
          });
          // 存在列维度
          if (column.property.includes('@')) {
            let colValue = column.property.split('@').shift();
            if (this.colDataMap.has(colValue)) {
              colValue = this.colDataMap.get(colValue);
            }
            dimension.push({
              value: colValue,
              name: this.dimensionCol[0].dimensionTag!,
            });
          }
          const args = {
            measure: {
              name: property,
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
   * @return {*}
   * @memberof CrossTableConverter
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
   * 获取维度数据
   *
   * @param {IAppBIReportDimension[]} dimensions
   * @return {*}
   * @memberof CrossTableConverter
   */
  getDimension(dimensions: IAppBIReportDimension[]) {
    this.dimensionRow = dimensions.filter(
      (x: IData) => x.placement !== 'COLHEADER',
    );
    this.dimensionCol = dimensions.filter(
      (x: IData) => x.placement === 'COLHEADER',
    );
  }

  /**
   * 加载代码表
   *
   * @param {string} appCodeListId
   * @param {IContext} context
   * @param {IParams} params
   * @return {*}  {(Promise<Readonly<CodeListItem[]> | undefined>)}
   * @memberof CrossTableConverter
   */
  async loadCodeList(
    appCodeListId: string,
    context: IContext,
    params: IParams,
  ): Promise<Readonly<CodeListItem[]> | undefined> {
    const app = ibiz.hub.getApp(context.srfappid);
    const codeList = app.codeList.getCodeList(appCodeListId);
    // 顺便加载代码表模型
    if (!codeList) {
      ibiz.message.error(`未找到代码表: ${appCodeListId}`);
      return [];
    }

    const dataItems = await app.codeList.get(appCodeListId, context, params);
    this.codeListItems = dataItems;
    return dataItems;
  }

  /**
   * 转换代码表值
   *
   * @param {string} value
   * @return {*}
   * @memberof CrossTableConverter
   */
  transCodeListValue(value: string) {
    const item = this.findCodeListItem(this.codeListItems, value);
    if (item) {
      return item.text;
    }
    return value;
  }

  /**
   * 转换代码表值
   *
   * @param {(CodeListItem[] | undefined)} codelist
   * @param {(string | number)} value
   * @return {*}
   * @memberof CrossTableConverter
   */
  findCodeListItem(
    codelist: readonly CodeListItem[] | undefined,
    value: string | number,
  ) {
    if (codelist) {
      // eslint-disable-next-line eqeqeq
      const findItem = codelist.find(item => item.value == value);
      if (findItem) {
        return findItem;
      }
      for (let i = 0; i < codelist.length; i++) {
        const childrenItem = this.findCodeListItem(
          codelist[i].children,
          value,
        ) as CodeListItem;
        if (childrenItem) {
          return childrenItem;
        }
      }
    }
  }

  /**
   * 转换样式
   *
   * @param {IAppBIReport} data
   * @param {IData} model
   * @memberof CrossTableConverter
   */
  transformStyle(model: IData, mode?: string) {
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
      if (style.agg.rowPosition === 'top') {
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
        const rowspankeys = this.calcRowSpan();
        Object.assign(ctrlParams, { rowspankeys });
      }
      if (details.includes('fixedDimension') && this.dimensionRow) {
        Object.assign(model, {
          frozenFirstColumn: this.dimensionRow.length,
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
   * @memberof CrossTableConverter
   */
  filterPeriod(items: IData[]) {
    return items.filter(x => !x.srfperiodtype);
  }

  /**
   * @description 获取反查值
   * @param {IData} item
   * @param {string} name
   * @return {*}
   * @memberof CrossTableConverter
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
   * @memberof CrossTableConverter
   */
  calcGridFieldMap(items: IData[]) {
    this.gridFieldMap.clear();
    let allFields: string[] = [];
    items.forEach((item: IData) => {
      allFields = Array.from(new Set([...allFields, ...Object.keys(item)]));
    });
    this.measures.forEach((item: IAppBIReportMeasure) => {
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
    [...this.dimensionRow, ...this.dimensionCol].forEach(
      (item: IAppBIReportDimension) => {
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
      },
    );
  }

  /**
   * @description 获取表格属性
   * @param {string} codeName
   * @return {*}  {string}
   * @memberof CrossTableConverter
   */
  getGridField(codeName: string): string {
    if (codeName && this.gridFieldMap.has(codeName)) {
      return this.gridFieldMap.get(codeName)!;
    }
    return codeName;
  }
}
