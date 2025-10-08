/* eslint-disable no-constructor-return */
import { createUUID } from 'qx-util';
import { IDEChartSeries } from '@ibiz/model-core';
import { IChartData } from '../../../interface';
import { TimeScale, calcDateRangeByScale } from '../../../utils';

// 更新属性，缺的补充定义
function updateKeyDefine(target: IParams, keys: string[]): void {
  keys.forEach(key => {
    if (!Object.prototype.hasOwnProperty.call(target, key)) {
      Object.defineProperty(target, key, {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined,
      });
    }
  });
}

export class ChartData implements IChartData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string | symbol]: any;

  _seriesModelId?: string;

  _catalog?: string;

  _groupName?: string;

  _uuid?: string;

  _chartid?: string;

  _catalogLevelData?: IData[];

  constructor(
    private deData: IData,
    private seriesModel?: IDEChartSeries,
    catalog?: string,
    groupName?: string,
    chartId?: string,
    catalogLevelData?: IData[],
  ) {
    this._seriesModelId = seriesModel?.id;

    this._catalog = catalog;

    this._groupName = groupName;

    this._uuid = createUUID();

    this._chartid = chartId;

    this._catalogLevelData = catalogLevelData;

    return new Proxy<ChartData>(this, {
      set(target, p, value): boolean {
        if (Object.prototype.hasOwnProperty.call(deData, p)) {
          deData[p] = value;
        } else {
          target[p] = value;
        }
        return true;
      },

      get(target, p, _receiver): unknown {
        if (target[p] !== undefined) {
          return target[p];
        }
        if (deData[p] !== undefined) {
          return deData[p];
        }
      },

      ownKeys(target): ArrayLike<string | symbol> {
        // 整合所有并排除重复
        const allKeys = [
          ...new Set([...Object.keys(target), ...Object.keys(deData)]),
        ];
        updateKeyDefine(target, allKeys);
        return allKeys;
      },
    });
  }

  /**
   * @description 预定义导航参数
   * @returns {*}  {IData}
   * @memberof ChartData
   */
  get navParams(): IData {
    const params: IData = { srfcategory: this._catalog };
    if (!this.seriesModel) return params;
    const {
      groupMode,
      seriesField,
      catalogField,
      seriesCodeListId,
      catalogCodeListId,
    } = this.seriesModel;
    // catalogField.toLowerCase()_value 和 seriesField.toLowerCase()_value 为分类属性和名称属性的原始值
    if (catalogField && catalogCodeListId)
      Object.assign(params, {
        srfcategoryvalue: this.deData[`${catalogField.toLowerCase()}_value`],
      });
    if (seriesField) Object.assign(params, { srfgroup: this._groupName });
    if (seriesField && seriesCodeListId)
      Object.assign(params, {
        srfgroupvalue: this.deData[`${seriesField.toLowerCase()}_value`],
      });
    if (groupMode && groupMode !== 'CODELIST') {
      const dateRange = calcDateRangeByScale(
        this._catalog!,
        groupMode.toLowerCase() as TimeScale,
      );
      if (dateRange)
        Object.assign(params, {
          srfstarttime: dateRange.start,
          srfendtime: dateRange.end,
        });
    }
    return params;
  }
}
