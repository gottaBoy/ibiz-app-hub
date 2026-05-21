/* eslint-disable eqeqeq */
/* eslint-disable camelcase */
/* eslint-disable no-plusplus */
import { ConverterBase } from './converter-base';

/**
 * @description 表格转化器基类
 * @export
 * @abstract
 * @class GridConverterBase
 * @extends {ConverterBase}
 */
export abstract class GridConverterBase extends ConverterBase {
  /**
   * @description 获取表格样式
   * @returns {*}  {IData}
   * @memberof GridConverterBase
   */
  getGridStyle(): IData {
    const result: IData = {
      vars: {},
      classList: [],
      model: { controlParam: {} },
    };
    const {
      grid_show_agg,
      grid_header_fontstyle,
      grid_header_fontsize,
      grid_header_fontcolor,
      grid_header_position,
      grid_body_fontstyle,
      grid_body_fontsize,
      grid_body_fontcolor,
      grid_agg_row_position,
      grid_function_setting,
    } = this.reportUIModel;
    result.vars = {
      '--ibiz-control-grid-header-align': grid_header_position,
      '--ibiz-control-grid-header-font-size': `${grid_header_fontsize}px`,
      '--ibiz-control-grid-header-text-color': grid_header_fontcolor,
      '--ibiz-control-grid-content-font-size': `${grid_body_fontsize}px`,
      '--ibiz-control-grid-content-text-color': grid_body_fontcolor,
    };
    if (grid_header_fontstyle) {
      const key =
        grid_header_fontstyle === 'bold'
          ? '--ibiz-control-grid-header-font-weight'
          : '--ibiz-control-grid-header-font-style';
      result.vars[key] = grid_header_fontstyle;
    }
    if (grid_body_fontstyle) {
      const key =
        grid_body_fontstyle === 'bold'
          ? '--ibiz-control-grid-content-font-weight'
          : '--ibiz-control-grid-content-font-style';
      result.vars[key] = grid_body_fontstyle;
    }
    if (grid_show_agg == '1') {
      Object.assign(result.model, { aggMode: 'PAGE' });
      if (grid_agg_row_position === 'top') {
        result.classList.push('el-table--top-agg');
      }
    }
    if (grid_function_setting) {
      const ctrlParams = {};
      if (grid_function_setting.indexOf('fixedGridHeader') === -1) {
        result.classList.push('el-table--scroll-header');
      }
      if (
        grid_function_setting.indexOf('fixedDimension') !== -1 &&
        this.dimensions
      ) {
        Object.assign(result.model, {
          frozenFirstColumn: this.dimensions.length,
        });
      }
      if (grid_function_setting.indexOf('showPercent') !== -1) {
        Object.assign(ctrlParams, {
          percentkeys: JSON.stringify(
            this.measures!.map(x => x.measureTag!.toLowerCase()),
          ),
        });
      }
      Object.assign(result.model.controlParam, { ctrlParams });
    }
    return result;
  }

  /**
   * @description 计算表格列样式
   * @param {boolean} [enableAgg=true]
   * @returns {*}  {IData}
   * @memberof GridConverterBase
   */
  calcGridColumnStyle(enableAgg: boolean = true): IData {
    const { grid_body_position, grid_show_agg } = this.reportUIModel;
    const result: IData = {};
    if (grid_body_position) result.align = grid_body_position;
    if (enableAgg && grid_show_agg == '1') result.aggMode = 'SUM';
    return result;
  }

  /**
   * @description 计算表格列合并
   * @param {IData[]} [items=[]] 表格展示数据
   * @returns {*}  {IData}
   * @memberof GridConverterBase
   */
  calcGridColumnMerge(items: IData[] = []): IData {
    const { grid_function_setting } = this.reportUIModel;
    // rowspans 是手动添加的用于spanMethod脚本中获取，否则通过序列化的方式写入脚本在数据量大时执行太慢
    const result: IData = { controlAttributes: [], rowspans: [] };
    if (grid_function_setting.indexOf('dimensionMerge') !== -1) {
      // 预处理数据，提前计算合并情况
      const columnKeys: string[] = this.dimensions.map(dimension =>
        dimension.dimensionTag!.toLowerCase(),
      );
      const rowspans: number[][] = [];
      columnKeys.forEach((columnKey, colIndex) => {
        rowspans[colIndex] = [];
        let pos = 0;

        // 第一列特殊处理
        if (colIndex === 0) {
          while (pos < items.length) {
            let count = 1;
            const currentValue = items[pos][columnKey];

            while (
              pos + count < items.length &&
              items[pos + count][columnKey] === currentValue
            ) {
              count++;
            }

            for (let i = 0; i < count; i++) {
              rowspans[colIndex][pos + i] = i === 0 ? count : 0;
            }

            pos += count;
          }
        } else {
          // 其他列基于前一列的合并信息处理
          let prevPos = 0;

          while (prevPos < items.length) {
            const prevSpan = rowspans[colIndex - 1][prevPos];

            if (prevSpan > 0) {
              // 在前一列的合并块内处理当前列的合并
              let innerPos = prevPos;

              while (innerPos < prevPos + prevSpan) {
                let count = 1;
                const currentValue = items[innerPos][columnKey];

                while (
                  innerPos + count < prevPos + prevSpan &&
                  items[innerPos + count][columnKey] === currentValue
                ) {
                  count++;
                }

                for (let i = 0; i < count; i++) {
                  rowspans[colIndex][innerPos + i] = i === 0 ? count : 0;
                }

                innerPos += count;
              }
            } else {
              rowspans[colIndex][prevPos] = 0;
            }

            prevPos += Math.max(1, rowspans[colIndex - 1][prevPos]);
          }
        }
      });
      const spanMethod = {
        attrName: 'span-method',
        attrValue: `const { row, column, rowIndex, columnIndex } = metadata;
          const { rowspans } = ctrl.model;
          if (rowspans[columnIndex] && rowspans[columnIndex][rowIndex] !== undefined) {
            const span = rowspans[columnIndex][rowIndex];
            return {
              rowspan: span > 0 ? span : 0,
              colspan: span > 0 ? 1 : 0,
            };
          }
          return { rowspan: 1, colspan: 1 };`,
      };
      result.rowspans = rowspans;
      result.controlAttributes.push(spanMethod);
    }
    return result;
  }

  /**
   * @description 初始化
   * - 处理列顺序
   * @protected
   * @returns {*}  {Promise<void>}
   * @memberof GridConverterBase
   */
  protected async onInit(): Promise<void> {
    const { appBIReportDimensions } = this.appBIReport;
    const { grid_col_sort } = this.reportUIModel;
    this.dimensions = [];
    grid_col_sort.forEach((col: IData) => {
      const dimension = appBIReportDimensions?.find(
        d => d.dimensionTag?.toLowerCase() === col.codename.toLowerCase(),
      );
      if (dimension) this.dimensions.push(dimension);
    });
  }
}
