import { IApiSortItem } from '../../common';
import { IApiMDControlState } from './i-api-md-control.state';

/**
 * @description 数据视图（卡片）部件状态接口
 * @primary
 * @export
 * @interface IApiDataViewControlState
 * @extends {IApiMDControlState}
 */
export interface IApiDataViewControlState extends IApiMDControlState {
  /**
   * @description 是否正在更新
   * @type {boolean}
   * @default false
   * @memberof IApiDataViewControlState
   */
  updating: boolean;

  /**
   * @description 是否可拖拽
   * @type {boolean}
   * @default false
   * @memberof IApiKanbanState
   */
  draggable: boolean;

  /**
   * @description 是否只读
   * @type {boolean}
   * @default false
   * @memberof IApiDataViewControlState
   */
  readonly: boolean;

  /**
   * @description 排序项集合
   * @type {IApiSortItem[]}
   * @default []
   * @memberof IApiDataViewControlState
   */
  sortItems: IApiSortItem[];

  /**
   * @description 是否显示分页栏
   * @type {boolean}
   * @memberof IApiDataViewControlState
   */
  enablePagingBar?: boolean;

  /**
   * @description 折叠分组key集合
   * @type {string[]}
   * @default []
   * @memberof IApiDataViewControlState
   */
  collapseKeys: string[];
}
