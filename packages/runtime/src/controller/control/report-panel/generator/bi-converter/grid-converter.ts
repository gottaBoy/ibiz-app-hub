import { clone } from 'ramda';
import { GridConverterBase } from './base';

/**
 * @description 表格转化器
 * @export
 * @class GridConverter
 * @extends {GridConverterBase}
 */
export class GridConverter extends GridConverterBase {
  /**
   * @description 仿真模型
   * @type {IModel}
   * @memberof GridConverter
   */
  mockModel: IModel = {
    controlParam: { id: this.appBIReport.id, appId: this.appBIReport.appId },
    fetchControlAction: {
      id: 'fetch',
      appDEMethodId: 'fetchdefault',
      appId: this.appBIReport.appId,
      appDataEntityId: this.appBIReport.appDataEntityId,
    },
    pagingMode: 1,
    autoLoad: true,
    pagingSize: 20,
    aggMode: 'NONE',
    groupMode: 'NONE',
    sortMode: 'REMOTE',
    singleSelect: true,
    columnEnableLink: 2,
    controlType: 'GRID',
    columnEnableFilter: 2,
    modelType: 'PSDEGRID',
    enablePagingBar: false,
    enableCustomized: false,
    showBusyIndicator: true,
    id: this.appBIReport.id,
    name: this.appBIReport.id,
    modelId: this.appBIReport.id,
    codeName: this.appBIReport.id,
    appId: this.appBIReport.appId,
    logicName: this.appBIReport.name,
    appDataEntityId: this.appBIReport.appDataEntityId,
  };

  /**
   * @description 计算表格列模型
   * @returns {*}  {IModel[]}
   * @memberof GridConverter
   */
  calcGridColumns(): IModel[] {
    const deGridColumns: IModel[] = [];
    if (this.dimensions.length > 0) {
      deGridColumns.push(
        ...this.dimensions.map(item => {
          const codeName = item.dimensionTag!.toLowerCase();
          return {
            width: 150,
            id: codeName,
            widthUnit: 'STAR',
            enableSort: false,
            codeName,
            measureTag: codeName,
            dataItemName: codeName,
            appDEFieldId: codeName,
            columnType: 'DEFGRIDCOLUMN',
            caption: item.dimensionName,
            appId: this.appBIReport.appId,
            appCodeListId: item.appCodeListId,
            ...this.calcGridColumnStyle(false),
          };
        }),
      );
    }
    if (this.measures.length > 0) {
      deGridColumns.push(
        ...this.measures.map(item => {
          const codeName = item.measureTag!.toLowerCase();
          return {
            width: 150,
            id: codeName,
            widthUnit: 'STAR',
            enableSort: false,
            codeName,
            valueType: 'SIMPLE',
            measureTag: codeName,
            dataItemName: codeName,
            appDEFieldId: codeName,
            format: item.jsonFormat,
            caption: item.measureName,
            columnType: 'DEFGRIDCOLUMN',
            appId: this.appBIReport.appId,
            appCodeListId: item.appCodeListId,
            ...this.calcGridColumnStyle(),
          };
        }),
      );
    }
    return deGridColumns;
  }

  /**
   * @description 计算表格数据项
   * @param {IModel[]} gridColumns
   * @returns {*}  {IModel[]}
   * @memberof GridConverter
   */
  calcGridDataItems(gridColumns: IModel[]): IModel[] {
    const deGridDataItems: IData[] = [];
    gridColumns.forEach((column: IData) => {
      deGridDataItems.push({
        dataType: 25,
        id: column.id,
        valueType: 'SIMPLE',
        format: column.format,
        appId: this.appBIReport.appId,
        measureTag: column.measureTag,
      });
      if (column.columnType === 'GROUPGRIDCOLUMN')
        deGridDataItems.push(...this.calcGridDataItems(column.degridColumns));
    });
    return deGridDataItems;
  }

  /**
   * @description 转化数据到报表
   * @param {IData[]} items
   * @returns {*}  {({ model: IModel; options: IData; data: IData[] } | undefined)}
   * @memberof GridConverter
   */
  translateDataToReport(
    items: IData[],
  ): { model: IModel; options: IData; data: IData[] } | undefined {
    if (!this.measures) return;
    const tempModel = clone(this.mockModel);
    const degridColumns = this.calcGridColumns();
    const degridDataItems = this.calcGridDataItems(degridColumns);
    Object.assign(tempModel, { degridColumns, degridDataItems });
    const { vars, classList, model } = this.getGridStyle();
    Object.assign(tempModel, model);
    const spanMethod = this.calcGridColumnMerge(items);
    Object.assign(tempModel, spanMethod);
    return {
      data: items,
      model: tempModel,
      options: { vars, classList },
    };
  }
}
