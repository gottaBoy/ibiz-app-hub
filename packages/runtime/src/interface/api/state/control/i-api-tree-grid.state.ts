import { IApiData } from '@ibiz-template/core';
import { IApiGridState } from './i-api-grid.state';

/**
 * @description 树表格部件状态
 * @primary
 * @export
 * @interface IApiTreeGridState
 * @extends {IApiGridState}
 */
export interface IApiTreeGridState extends IApiGridState {
  /**
   * @description 表格绑定的key，用于强制刷新组件
   * @type {string}
   * @memberof IApiTreeGridState
   */
  tableKey: string;
  /**
   * @description 树表格是否显示树形结构(默认为true)
   * @type {boolean}
   * @default true
   * @memberof IApiTreeGridState
   */
  showTreeGrid: boolean;

  /**
   * @description 树表格数据
   * @type {IApiData[]}
   * @default []
   * @memberof IApiTreeGridState
   */
  treeGirdData: IApiData[];
}
