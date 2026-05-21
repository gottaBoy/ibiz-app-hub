/* eslint-disable no-unused-expressions */
/* eslint-disable eqeqeq */
import { plus, RuntimeModelError, toNumberOrNil } from '@ibiz-template/core';
import {
  IDEChartSeries,
  IChartSeriesCSCartesian2DEncode,
} from '@ibiz/model-core';
import dayjs, { Dayjs } from 'dayjs';
import minMax from 'dayjs/plugin/minMax';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isoWeek from 'dayjs/plugin/isoWeek';
import type { ECElementEvent, SeriesOption } from 'echarts';
import { clone, isNil, mergeDeepRight } from 'ramda';
import {
  parseUserParams,
  ChartOptionsGenerator,
} from './chart-options-generator';
import { CodeListItem, IChartData } from '../../../../interface';
import { ChartData } from '../../../../service';
import { generateYearWeekRange } from '../../../../utils';

dayjs.extend(minMax);
dayjs.extend(isSameOrBefore);
dayjs.extend(quarterOfYear);
dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);

/** 序列的单条数据 */
export type SingleData = {
  /**
   * 值属性的值
   */
  value: number;

  /**
   * 图表数据
   * @author lxm
   * @date 2023-06-09 09:31:27
   * @type {IChartData}
   */
  chartData?: IChartData;
};
/** 分类数据，key是分类属性的值 */
export type CatalogData = Map<string, SingleData>;

/** 分组数据，key是分组属性的值 */
export type GroupData = Record<string, CatalogData>;

export const DEFAULT_GROUP = '$default_group';

export class BaseSeriesGenerator<T extends IDEChartSeries = IDEChartSeries> {
  /**
   * 分类属性(小写)
   * @author lxm
   * @date 2023-06-09 02:44:57
   * @type {string}
   */
  catalogField: string = '';

  /**
   * 分类属性(小写)数组，用于构建多维度分层
   *
   * @type {string[]}
   * @memberof BaseSeriesGenerator
   */
  catalogFields: IData[] = [];

  /**
   * 值属性（小写）
   * @author lxm
   * @date 2023-06-09 02:45:15
   * @type {string}
   */
  valueField!: string;

  /**
   * 分组属性（小写）
   * @author lxm
   * @date 2023-06-09 02:46:05
   * @type {string}
   */
  groupField?: string;

  /**
   * X轴坐标索引
   * @author lxm
   * @date 2023-06-09 02:47:54
   * @type {number}
   */
  xAxisIndex?: number;

  /**
   * y轴坐标索引
   * @author lxm
   * @date 2023-06-09 02:48:13
   * @type {number}
   */
  yAxisIndex?: number;

  /**
   * 序列名称
   * @author lxm
   * @date 2023-06-09 02:49:35
   * @type {string}
   */
  seriesName!: string;

  /**
   * 根据后台数据处理出来的分组数据
   * @author lxm
   * @date 2023-06-09 02:58:28
   * @type {GroupData}
   */
  groupData?: GroupData;

  /**
   * 根据分组处理出来的图表数据数组
   * @author lxm
   * @date 2023-06-09 02:58:28
   * @type {GroupData}
   */
  chartDataArr: IChartData[] = [];

  /**
   * 静态的序列options
   * @author lxm
   * @date 2023-06-09 03:08:47
   * @type {SeriesOption}
   */
  staticOptions: SeriesOption = {};

  /**
   * 序列的自定义Options
   * @author lxm
   * @date 2023-06-09 08:59:40
   * @type {SeriesOption}
   */
  seriesUserParam?: SeriesOption;

  /**
   * 是否根据代码表自动补全分类
   * @author lxm
   * @date 2023-06-09 09:28:04
   * @type {boolean}
   */
  autoCompleteCategory: boolean = true;

  /**
   * 多维度分层时的维度映射，记录序列值与分层的关系
   *
   * @type {Map<string, Array<IData>>}
   * @memberof BaseSeriesGenerator
   */
  catalogMap: Map<string, IData> = new Map();

  /**
   * Creates an instance of BaseSeriesGenerator.
   * @author lxm
   * @date 2023-06-09 02:46:54
   * @param {T} model 序列模型
   * @param {ChartOptionsGenerator} chartGenerator 图表生成器
   */
  constructor(
    public model: T,
    protected chartGenerator: ChartOptionsGenerator,
  ) {
    this.model = model;
    this.chartGenerator = chartGenerator;

    this.initParams(model, chartGenerator);
  }

  /**
   * 初始化参数
   * @author ljx
   * @date 2024-12-31 10:03:53
   * @param {T} model 序列模型
   * @param {ChartOptionsGenerator} chartGenerator 图表生成器
   */
  initParams(model: T, chartGenerator: ChartOptionsGenerator): void {
    const { chartSeriesEncode, caption, id, userParam } = model;
    if (!model.catalogField) {
      throw new RuntimeModelError(
        model,
        ibiz.i18n.t('runtime.controller.control.chart.missingClassification'),
      );
    }
    if (!model.valueField) {
      throw new RuntimeModelError(
        model,
        ibiz.i18n.t('runtime.controller.control.chart.missingValue'),
      );
    }
    if (
      chartGenerator.model.controlParam &&
      chartGenerator.model.controlParam.ctrlParams?.CATALOGFIELDS
    ) {
      try {
        // 获取分类分层配置
        const tempCatalogFields = JSON.parse(
          chartGenerator.model.controlParam.ctrlParams.CATALOGFIELDS,
        );
        if (Array.isArray(tempCatalogFields)) {
          this.catalogFields = tempCatalogFields;
        }
      } catch {
        throw new Error(ibiz.i18n.t('runtime.control.chart.errorJson'));
      }
    }
    this.catalogField = chartGenerator.getFieldKey(model.catalogField);
    this.valueField = chartGenerator.getFieldKey(model.valueField);
    this.groupField = model.seriesField
      ? chartGenerator.getFieldKey(model.seriesField)
      : undefined;

    const { chartXAxisId, chartYAxisId } = (chartSeriesEncode ||
      {}) as IChartSeriesCSCartesian2DEncode;
    this.xAxisIndex = toNumberOrNil(chartXAxisId);
    this.yAxisIndex = toNumberOrNil(chartYAxisId);
    this.seriesName = caption || id!;

    this.staticOptions = this.calcStaticOptions();

    if (userParam) {
      this.seriesUserParam = parseUserParams(userParam);
    }
  }

  /**
   * 计算静态序列的options
   * @author lxm
   * @date 2023-06-09 03:09:34
   */
  protected calcStaticOptions(): SeriesOption {
    const options: SeriesOption = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      type: this.model.seriesType! as any,
      name: this.seriesName,
      emphasis: {
        label: {
          fontSize: 20,
          show: true,
        },
      },
      label: {
        position: 'top',
        show: true,
      },
    };
    return options;
  }

  /**
   * 有代码就转换，值为空直接返回空
   *
   * @author lxm
   * @date 2023-06-09 08:42:50
   * @author lxm
   * @date 2023-06-09 08:46:00
   * @param {(string | undefined)} codeListKey 代码表值
   * @param {(string | undefined)} val 数据值
   * @param {boolean} isExclude 是否排除非代码表的值，true时，匹配不到代码表返回undefined，反之返回原值
   * @return {*}  {(string | undefined)}
   */
  translateVal(
    codeListKey: string | undefined,
    val: string | undefined,
    isExclude: boolean = false,
  ): string | undefined {
    if (isNil(val)) return undefined;
    if (isNil(codeListKey)) return val;
    const codeListItems = this.chartGenerator.codeListMap.get(codeListKey);
    if (codeListItems?.length) {
      const find = codeListItems.find(x => x.value == val);
      if (find) return find.text;
      return ibiz.i18n.t('runtime.common.undefined');
    }
    return isExclude ? undefined : val;
  }

  /**
   * 获取序列颜色
   *
   * @param {string} group
   * @return {*}  {string}
   * @memberof BaseSeriesGenerator
   */
  getSeriesColor(group: string): string {
    let color = '';
    const maps = this.chartGenerator.codeListMap.values();
    const codeListItems = [...maps].flat();
    const item = codeListItems.find(x => x.text === group);
    if (item) {
      color = item.color || '';
    }
    return color;
  }

  /**
   * 准备图表数据
   * @return {*}
   * @author: zhujiamin
   * @Date: 2023-11-23 15:24:12
   */
  protected prepareChartData(
    groupData: GroupData,
    deData: IData,
    catalog: string,
    group: string,
    catalogLevelData: IData[],
  ): void {
    if (this.groupField) {
      deData[`${this.groupField}_value`] = deData[this.groupField];
      Object.assign(deData, { [this.groupField]: group });
    }
    if (this.catalogField) {
      deData[`${this.catalogField}_value`] = deData[this.catalogField];
      Object.assign(deData, { [this.catalogField]: catalog });
    }
    const tempChartData = new ChartData(
      deData,
      this.model,
      catalog,
      group,
      this.chartGenerator.extraArgs.chartId,
      catalogLevelData,
    );
    groupData[group].get(catalog)!.chartData = tempChartData;
    this.chartDataArr?.push(tempChartData);
  }

  /**
   * 处理多分类分组
   *
   * @param {IData[]} prevItems
   * @param {IData[]} nextItems
   * @return {*}
   * @memberof BaseSeriesGenerator
   */
  handleMultiCatalogGroup(prevItems: IData, nextItems: IData): IData[] {
    let tempItems: IData[] = [];
    if (prevItems.length === 0) {
      tempItems = nextItems.codelist.map((item: IData) => {
        // 设置当前分类层级对应的文本和值
        this.catalogMap.set(item.text, { [nextItems.codename]: item.value });
        return {
          codename: {
            [nextItems.codename]: item.value,
          },
          chartData: [
            {
              codename: nextItems.codename,
              name: nextItems.name,
              value: item.value,
              valueText: item.text,
            },
          ],
          text: item.text,
          value: item.value,
        };
      });
    } else {
      for (let prev = 0; prev < prevItems.length; prev++) {
        if (nextItems.codelist.length > 0) {
          for (let next = 0; next < nextItems.codelist.length; next++) {
            // 设置当前分类层级对应的文本和值，文本会拼接上一层级的文本，
            // 对应的值则是一个对象{ id:value}，里面存放第一层到现在这一层的每一层的标识与值
            this.catalogMap.set(
              `${prevItems[prev].text}_${nextItems.codelist[next].text}`,
              {
                ...prevItems[prev].codename,
                [nextItems.codename]: nextItems.codelist[next].value,
              },
            );
            tempItems.push({
              codename: {
                ...prevItems[prev].codename,
                [nextItems.codename]: nextItems.codelist[next].value,
              },
              chartData: [
                ...prevItems[prev].chartData,
                {
                  codename: nextItems.codename,
                  name: nextItems.name,
                  value: nextItems.codelist[next].value,
                  valueText: nextItems.codelist[next].text,
                },
              ],
              text: `${prevItems[prev].text}_${nextItems.codelist[next].text}`,
              value: nextItems.codelist[next].value,
            });
          }
        } else {
          tempItems.push({
            codename: {
              ...prevItems[prev].codename,
            },
            chartData: [...prevItems[prev].chartData],
            text: prevItems[prev].text,
            value: prevItems[prev].value,
          });
        }
      }
    }
    return tempItems;
  }

  /**
   * 计算代码表排序
   *
   * @protected
   * @param {(string | undefined)} sort
   * @param {IData[]} data
   * @param {string} codename
   * @param {readonly} codeListItems
   * @param {*} CodeListItem
   * @param {*} []
   * @return {*}
   * @memberof BaseSeriesGenerator
   */
  protected computeCodelistSort(
    sort: string | undefined,
    data: IData[],
    codename: string,
    codeListItems: readonly CodeListItem[],
  ): CodeListItem[] {
    if (
      !sort &&
      this.chartGenerator.model.controlParam &&
      this.chartGenerator.model.controlParam.ctrlParams?.NOSORT
    ) {
      // 不依照代码表排序
      const orginItem = Array.from(
        new Set(
          data
            .map((_data: IData) => {
              return _data[codename];
            })
            .filter(val => !!val),
        ),
      );
      const cloneItem = clone(codeListItems);
      cloneItem.sort((a, b) => {
        const aIndex = orginItem.findIndex((_code: string | number) => {
          return _code === a.value;
        });
        const bIndex = orginItem.findIndex((_code: string | number) => {
          return _code === b.value;
        });
        return aIndex - bIndex;
      });
      return cloneItem;
    }
    if (sort === 'desc') {
      return clone(codeListItems).reverse();
    }
    return clone(codeListItems);
  }

  /**
   * 计算分组数据
   * @author lxm
   * @date 2023-06-09 03:42:53
   * @param {IData[]} data
   * @return {*}  {GroupData}
   */
  protected calcGroupData(data: IData[]): GroupData {
    // 清空分组数据
    this.groupData = {};
    // 清空图表数据数组
    this.chartDataArr = [];
    const groupData = this.groupData!;
    // 分组属性代码表和分类属性代码表
    const { seriesCodeListId, catalogCodeListId } = this.model;

    const getOrigin = (origin: IData): IData => {
      if (origin && origin.$origin) {
        return getOrigin(origin.$origin);
      }
      return origin;
    };

    data.forEach(item => {
      // 计算分组名称标识
      let group = DEFAULT_GROUP;
      if (this.groupField) {
        const groupVal = this.translateVal(
          seriesCodeListId,
          item[this.groupField],
        );

        // 存在分组属性，但是分组属性没值的数据排除在外
        if (isNil(groupVal)) {
          return;
        }
        const tempOrigin = getOrigin(item.$origin);
        if (seriesCodeListId) {
          this.catalogMap.set(groupVal, tempOrigin[this.groupField]);
        } else {
          this.catalogMap.set(
            item[this.groupField],
            tempOrigin[this.groupField],
          );
        }
        group = groupVal;
      }

      // 分组对应的分类数据不存在时新建一个
      if (!groupData[group]) {
        groupData[group] = new Map();
        if (this.catalogFields.length > 0) {
          // 多个分类，构建分层结构
          let tempCodes: IData[] = [];
          const tempCodeLists: IData[] = [];
          // 遍历分类数据，即多个维度
          this.catalogFields.forEach((catalog: IData) => {
            const { codelistId, codename, mode, name, sort } = catalog;
            if (codelistId && this.autoCompleteCategory) {
              // 如果分类有代码表，保存起来，最终要计算分层情况下最后一层有多少数据，以及每一项数据对应了各个分层的值
              const codeListItems =
                this.chartGenerator.codeListMap.get(codelistId)!;
              tempCodeLists.push({
                codename,
                name,
                codelist: this.computeCodelistSort(
                  sort,
                  data,
                  codename,
                  codeListItems,
                ),
              });
            } else if (mode === 'field') {
              // 如果不是代码表，那就是属性项，根据data手动构建一个数组
              const tempdata = data.map((_data: IData) => {
                let tempValue;
                const tempOrigin = getOrigin(_data.$origin);
                if (tempOrigin) {
                  tempValue = tempOrigin[codename];
                }
                return {
                  text: _data[codename],
                  value: tempValue,
                };
              });
              tempCodeLists.push({ codename, name, codelist: tempdata });
            }
          });
          for (let i = 0; i < tempCodeLists.length; i++) {
            tempCodes = this.handleMultiCatalogGroup(
              tempCodes,
              tempCodeLists[i],
            );
          }
          tempCodes.forEach(x => {
            groupData[group].set(x.text, { value: 0 });
            // 分组数据默认封装chartData，此时值定死为0
            this.prepareChartData(
              groupData,
              {
                [this.valueField!]: 0,
                [this.catalogField]: x.value,
              },
              x.text,
              group,
              x.chartData,
            );
          });
        } else if (catalogCodeListId && this.autoCompleteCategory) {
          // 有代码表的时候补全代码表项个数的数据条数
          const codeListItems =
            this.chartGenerator.codeListMap.get(catalogCodeListId)!;
          codeListItems.forEach(x => {
            groupData[group].set(x.text, { value: 0 });
            // 没有分层数据，但是有代码表的情况就直接记录分类属性与代码表项的值
            this.catalogMap.set(x.text, { [this.catalogField]: x.value });
            // 分组数据默认封装chartData，此时值定死为0
            this.prepareChartData(
              groupData,
              {
                [this.valueField!]: 0,
                [this.catalogField]: x.value,
              },
              x.text,
              group,
              [
                {
                  codename: this.catalogField,
                  name: this.catalogField,
                  value: x.value,
                  valueText: x.text,
                },
              ],
            );
          });
        }
      }
      let catalog: string | undefined = '';
      let catalogLevelData: IData[] = [];
      if (this.catalogFields.length > 0) {
        const tempCatalog: IData[] = [];
        this.catalogFields.forEach((_catalog: IData) => {
          const mergeCatalog = this.translateVal(
            _catalog.codelistId,
            item[_catalog.codename],
            true,
          );
          if (!mergeCatalog) {
            return;
          }
          tempCatalog.push({
            codename: _catalog.codename, // 标识
            name: _catalog.name, // 分类名称
            value: item[_catalog.codename], // 当前数据项对应值
            valueText: mergeCatalog, // 当前数据项对应文本值
          });
        });
        if (tempCatalog.length !== this.catalogFields.length) {
          // 表明上面计算的时候有分类没有得到值
          return;
        }
        catalog = tempCatalog.map(_data => _data.valueText).join('_');
        catalogLevelData = tempCatalog;
      } else {
        // 分类属性值计算和转换
        catalog = this.translateVal(
          catalogCodeListId,
          item[this.catalogField],
          true,
        );
      }
      // 分类属性没值的数据排除
      if (!catalog) {
        return;
      }
      if (!catalogCodeListId) {
        // 类似雷达图，有维度项，却不是横纵坐标轴,没有分类数组，但是当前数据有分类属性，这里直接记录当前分类属性值对应的数据
        let tempValue;
        const tempOrigin = getOrigin(item.$origin);
        if (tempOrigin) {
          tempValue = tempOrigin[this.catalogField];
        }
        this.catalogMap.set(item[this.catalogField], {
          [this.catalogField]: tempValue,
        });
      }

      // 该分类属性对应的单条数据不存在时新建一个
      if (!groupData[group].get(catalog)) {
        groupData[group].set(catalog, { value: 0 });
      }
      // 相同分类属性的值属性数据累加
      groupData[group].get(catalog)!.value = plus(
        groupData[group].get(catalog)!.value,
        item[this.valueField] || 0,
      );

      // 没有chartData说明是第一条，有chartData说明是累加数据，自己封装里面的deData
      if (!groupData[group].get(catalog)!.chartData) {
        this.prepareChartData(
          groupData,
          item,
          catalog,
          group,
          catalogLevelData,
        );
      } else {
        this.prepareChartData(
          groupData,
          Object.assign(item, {
            [this.valueField!]: groupData[group].get(catalog)!.value,
          }),
          catalog,
          group,
          catalogLevelData,
        );
      }
    });
    return groupData;
  }

  /**
   * 根据分组数据算出多个序列的options
   * 大多数图表分组都是一个分组数据生成一条series
   * @author lxm
   * @date 2023-06-09 03:34:24
   * @param {GroupData} groupData
   * @return {*}  {SeriesOption[]}
   */
  protected calcGroupSeries(groupData: GroupData): SeriesOption[] {
    const tempSeries = Object.keys(groupData).map(group => {
      // 处理每个序列的数据
      const catalogData = groupData[group];
      const data: IData[] = this.calcSeriesData(catalogData);

      // 合并静态的seriesOptions
      let options: IData = { ...this.staticOptions, data };

      // 非默认分组的时候name是分组属性的值
      if (group !== DEFAULT_GROUP) {
        options.name = group;
      }
      // 合并颜色
      const color = this.getSeriesColor(group);
      if (color) {
        options.color = color;
      }
      // 合并自定义参数
      if (this.seriesUserParam) {
        options = mergeDeepRight(options, this.seriesUserParam);
      }

      return options as SeriesOption;
    });
    if (this.model.seriesCodeListId) {
      const codelist = this.chartGenerator.codeListMap.get(
        this.model.seriesCodeListId,
      );
      if (codelist) {
        tempSeries.sort((a, b) => {
          const aIndex = codelist.findIndex((_code: CodeListItem) => {
            return _code.text === a.name;
          });
          const bIndex = codelist.findIndex((_code: CodeListItem) => {
            return _code.text === b.name;
          });
          return aIndex - bIndex;
        });
      }
    }
    return tempSeries;
  }

  /**
   * 生成每条序列的data,由于不同图表类型格式不同所以为any
   * 默认提供的是二维数组，按[x轴, y轴, 图表数据]格式
   * @author lxm
   * @date 2023-06-09 03:38:07
   * @param {CatalogData} catalogData
   * @return {*}  {*}
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected calcSeriesData(catalogData: CatalogData): any {
    const temData: IData[] = [];
    catalogData.forEach((catalog, key) => {
      if (
        this.chartGenerator.model.controlParam &&
        this.chartGenerator.model.controlParam.ctrlParams?.MODE === 'ROW'
      ) {
        temData.push([catalog.value, key, catalog.chartData]);
      } else {
        temData.push([key, catalog.value, catalog.chartData]);
      }
    });
    return temData;
  }

  /**
   * 根据数据计算出序列的options
   * @author lxm
   * @date 2023-06-09 03:44:31
   * @param {IData[]} data
   * @return {*}  {(SeriesOption[] | SeriesOption)}
   */
  calcByData(data: IData[]): SeriesOption[] | SeriesOption {
    const { userParam, echartsType } = this.model;
    const tempData = this.dataPreprocess(data);
    const groupData = this.calcGroupData(tempData);
    // 判断是否补全日期（无横轴序列默认不补全（饼图，仪表盘，雷达图，漏斗图），有横轴序列默认补全）
    const noCompletionDate =
      userParam?.completiondate === 'false' ||
      (echartsType &&
        ['pie', 'gauge', 'radar', 'funnel'].includes(echartsType));
    noCompletionDate
      ? this.calcTimeData(groupData)
      : this.addTimeData(groupData);
    return this.calcGroupSeries(groupData);
  }

  /**
   * 通过echarts事件的params获取封装好的图表数据
   * @author lxm
   * @date 2023-06-09 10:56:25
   * @param {ECElementEvent} params
   * @return {*}  {string}
   */
  getChartDataByParams(params: ECElementEvent): IData | undefined {
    if (
      this.groupData &&
      Object.keys(this.groupData).length === 1 &&
      Object.keys(this.groupData)[0] === DEFAULT_GROUP
    ) {
      return this.groupData[DEFAULT_GROUP].get(params.name)?.chartData;
    }
    return this.groupData?.[params.seriesName!].get(params.name)?.chartData;
  }

  /**
   * 数据预处理
   * @return {*}
   * @author: zhujiamin
   * @Date: 2023-08-16 09:58:39
   */
  dataPreprocess(data: IData[]): IData[] {
    const tempData: IData[] = [];
    data.forEach(singleData => {
      tempData.push(clone(singleData));
    });

    // 根据分组模式格式化时间
    const { groupMode } = this.model;
    if (groupMode) {
      tempData.forEach((singleData: IData) => {
        let format = '';
        if (
          groupMode === 'DAY' ||
          groupMode === 'YEAR' ||
          groupMode === 'MONTH'
        ) {
          if (groupMode === 'DAY') {
            format = 'YYYY-MM-DD';
          } else if (groupMode === 'YEAR') {
            format = 'YYYY';
          } else if (groupMode === 'MONTH') {
            format = 'YYYY-MM';
          }
          if (singleData[this.catalogField]) {
            const formattedDate = dayjs(singleData[this.catalogField]).format(
              format,
            );
            singleData[this.catalogField] = formattedDate;
          }
        } else if (groupMode === 'QUARTER') {
          if (singleData[this.catalogField]) {
            const formattedDate = `${dayjs(
              singleData[this.catalogField],
            ).format('YYYY')}-${dayjs(
              singleData[this.catalogField],
            ).quarter()}`;
            singleData[this.catalogField] = formattedDate;
          }
        } else if (groupMode === 'YEARWEEK') {
          if (singleData[this.catalogField]) {
            const formattedDate = `${dayjs(
              singleData[this.catalogField],
            ).format('YYYY')}-${dayjs(singleData[this.catalogField]).week()}`;
            singleData[this.catalogField] = formattedDate;
          }
        }
      });
    }
    return tempData;
  }

  /**
   * 补全分组数据后排序
   * @param {GroupData} data
   * @return {*}
   * @author: zhujiamin
   * @Date: 2023-08-17 16:25:44
   */
  sortTimeData(data: GroupData): void {
    const { groupMode } = this.model;
    Object.keys(data).forEach(key => {
      const dateMap = data[key];
      let sortedKeys: string[] = [];
      if (
        groupMode === 'DAY' ||
        groupMode === 'YEAR' ||
        groupMode === 'MONTH'
      ) {
        sortedKeys = Array.from(dateMap.keys()).sort((a, b) =>
          dayjs(a).diff(dayjs(b)),
        );
      } else if (groupMode === 'QUARTER' || groupMode === 'YEARWEEK') {
        sortedKeys = Array.from(dateMap.keys()).sort((a, b) => {
          const [yearA, quarterA] = a.split('-');
          const [yearB, quarterB] = b.split('-');
          if (yearA !== yearB) {
            return parseInt(yearA, 10) - parseInt(yearB, 10);
          }
          return parseInt(quarterA, 10) - parseInt(quarterB, 10);
        });
      }
      const sortedMap = new Map();
      sortedKeys.forEach(sortKey => {
        sortedMap.set(sortKey, dateMap.get(sortKey));
      });
      data[key] = sortedMap;
    });
  }

  /**
   * @description 根据分组模式补全时间数据
   * - 将最小日期和最大日期之间的数据补全，确保横坐标时间的连续性
   * @param {GroupData} data
   * @returns {*}  {void}
   * @memberof BaseSeriesGenerator
   */
  addTimeData(data: GroupData): void {
    const { groupMode } = this.model;
    if (!groupMode || groupMode === 'CODELIST') return;
    const dates: Dayjs[] = [];
    // 遍历数据，生成日期数组
    Object.keys(data).forEach(key => {
      data[key].forEach((_val, date) => {
        dates.push(dayjs(date));
      });
    });
    if (!dates.length) return;
    // 使用 dayjs 的 max() 和 min() 方法找出最大和最小日期
    const maxDate = dayjs.max(dates);
    const minDate = dayjs.min(dates);
    if (groupMode === 'DAY') {
      // 补充缺失的日期项
      let currentDate = minDate;
      const endDate = maxDate;
      while (currentDate?.isSameOrBefore(endDate, 'day')) {
        const formattedDate = currentDate.format('YYYY-MM-DD');
        Object.keys(data).forEach(key => {
          if (!data[key].get(formattedDate)) {
            data[key].set(formattedDate, { value: 0 });
          }
        });
        currentDate = currentDate.add(1, 'day');
      }
    } else if (groupMode === 'YEAR') {
      // 补充缺失的年份项
      let currentYear = minDate!.year();
      const endYear = maxDate!.year();
      while (currentYear <= endYear) {
        const yearString = currentYear.toString();
        Object.keys(data).forEach(key => {
          if (!data[key].get(yearString)) {
            data[key].set(yearString, { value: 0 });
          }
        });
        currentYear += 1;
      }
    } else if (groupMode === 'MONTH') {
      // 补充缺失的年月项
      let currentYearMonth = minDate!.clone().startOf('month');
      const endYearMonth = maxDate!.clone().startOf('month');
      while (currentYearMonth.isSameOrBefore(endYearMonth)) {
        const yearMonthString = currentYearMonth.format('YYYY-MM');
        Object.keys(data).forEach(key => {
          if (!data[key].get(yearMonthString)) {
            data[key].set(yearMonthString, { value: 0 });
          }
        });
        currentYearMonth = currentYearMonth.add(1, 'month');
      }
    } else if (groupMode === 'QUARTER') {
      // 找出最大和最小年季度
      const yearQuarters: string[] = [];
      Object.keys(data).forEach(key => {
        data[key].forEach((_val, yearQuarter) => {
          yearQuarters.push(yearQuarter);
        });
      });
      const minYearQuarter = yearQuarters.reduce(
        (min, current) => (current < min ? current : min),
        yearQuarters[0],
      );
      const maxYearQuarter = yearQuarters.reduce(
        (max, current) => (current > max ? current : max),
        yearQuarters[0],
      );
      // 解析最小和最大年季度
      const [minYear] = minYearQuarter.split('-');
      const [maxYear] = maxYearQuarter.split('-');
      // 填充中间季度的数据项
      for (
        let year = parseInt(minYear, 10);
        year <= parseInt(maxYear, 10);
        year++
      ) {
        for (let quarter = 1; quarter <= 4; quarter++) {
          const yearQuarter = `${year}-${quarter}`;
          Object.keys(data).forEach(key => {
            if (!data[key].get(yearQuarter)) {
              data[key].set(yearQuarter, { value: 0 });
            }
          });
        }
      }
    } else if (groupMode === 'YEARWEEK') {
      // 找出最大和最小年周
      let yearWeeks: string[] = [];
      Object.keys(data).forEach(key => {
        data[key].forEach((_val, yearWeek) => {
          yearWeeks.push(yearWeek);
        });
      });
      const minYearWeek = yearWeeks.reduce(
        (min, current) => (current < min ? current : min),
        yearWeeks[0],
      );
      const maxYearWeek = yearWeeks.reduce(
        (max, current) => (current > max ? current : max),
        yearWeeks[0],
      );
      // 只解析开始周和结束周前后3周，防止数据过大
      yearWeeks = generateYearWeekRange(minYearWeek, maxYearWeek, 3);
      // 填充年周数据项
      yearWeeks.forEach(yearWeek => {
        Object.keys(data).forEach(key => {
          if (!data[key].get(yearWeek)) {
            data[key].set(yearWeek, { value: 0 });
          }
        });
      });
    }
    // 根据时间大小排序
    this.sortTimeData(data);
  }

  /**
   * @description 根据分组模式计算时间数据
   * - 只计算有值的日期，展示关键信息数据，多用于横轴日期显示跨度大的情况
   * @param {GroupData} data
   * @memberof BaseSeriesGenerator
   */
  calcTimeData(data: GroupData): void {
    const { groupMode } = this.model;
    if (!groupMode || groupMode === 'CODELIST') return;
    // 所有有值的日期数组
    const dates: string[] = [];
    // 遍历数据，生成日期数组
    Object.keys(data).forEach(key => {
      data[key].forEach((_val, date) => {
        dates.push(date);
      });
    });
    if (!dates.length) return;
    // 补全每组缺失的日期值，防止横坐标绘制异常
    dates.forEach(date => {
      Object.keys(data).forEach(key => {
        if (!data[key].get(date)) data[key].set(date, { value: 0 });
      });
    });
    // 根据时间大小排序
    this.sortTimeData(data);
  }
}
