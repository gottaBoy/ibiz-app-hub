import { IMDControl } from '@ibiz/model-core';
import { IApiData, IApiParams } from '@ibiz-template/core';
import { IApiDataAbilityParams } from '../../common';
import { IApiMDControlState } from '../../state';
import { IApiControlController } from './i-api-control.controller';
/**
 * @description 多数据部件控制器加载参数
 * @export
 * @interface IApiMDCtrlLoadParams
 * @extends {IApiDataAbilityParams}
 */
export interface IApiMDCtrlLoadParams extends IApiDataAbilityParams {
  /**
   * @description 是否是初始加载
   * @type {boolean}
   * @memberof IApiMDCtrlLoadParams
   */
  isInitialLoad?: boolean;

  /**
   * @description 是否加载更多
   * @type {boolean}
   * @memberof IApiMDCtrlLoadParams
   */
  isLoadMore?: boolean;

  /**
   * @description 触发源
   * @type {('DEFAULT' | 'REFRESH' | string)}
   * @memberof IApiMDCtrlLoadParams
   */
  triggerSource?: 'DEFAULT' | 'REFRESH' | string;
}

/**
 * @description 多数据部件控制器删除参数
 * @export
 * @interface IApiMDCtrlRemoveParams
 * @extends {IApiDataAbilityParams}
 */
export interface IApiMDCtrlRemoveParams extends IApiDataAbilityParams {
  /**
   * @description 是否不需要刷新(默认为否，如果不需要刷新传true)
   * @type {boolean}
   * @memberof IApiMDCtrlRemoveParams
   */
  notRefresh?: boolean;
}

/**
 * @description 多数据部件分组参数
 * @export
 * @interface IApiCustomGroupParams
 */
export interface IApiMDGroupParams {
  /**
   * @description 分组属性标识
   * @type {string}
   * @memberof IApiMDGroupParams
   */
  groupFieldId: string;

  /**
   * @description 分组代码表标识
   * @type {string}
   * @memberof IApiMDGroupParams
   */
  groupCodeListId?: string;

  /**
   * @description 日期分组格式
   * @type {(('year' | 'quarter' | 'month' | 'week' | 'day')[])} (年 | 季度 | 月 | 周 | 天)
   * @memberof IApiMDGroupParams
   */
  dateFormat?: ('year' | 'quarter' | 'month' | 'week' | 'day')[];

  /**
   * @description 是否为自定义扩展属性
   * @type {boolean}
   * @memberof IApiMDGroupParams
   */
  extend?: boolean;
}

/**
 * 移动端多数据部件
 * @description 多数据部件控制器
 * @primary
 * @export
 * @interface IApiMDControlController
 * @extends {IApiControlController<T, S>}
 * @template T
 * @template S
 */
export interface IApiMDControlController<
  T extends IMDControl = IMDControl,
  S extends IApiMDControlState = IApiMDControlState,
> extends IApiControlController<T, S> {
  /**
   * @description 设置排序
   * @param {string} [key] 排序字段
   * @param {('asc' | 'desc')} [order] 排序顺序
   * @memberof IApiMDControlController
   */
  setSort(key?: string, order?: 'asc' | 'desc'): void;
  /**
   * @description 加载更多
   * @returns {*}  {Promise<void>}
   * @memberof IApiMDControlController
   */
  loadMore(): Promise<void>;
  /**
   * @description 加载数据
   * @param {IApiMDCtrlLoadParams} [args]
   * @returns {*}  {Promise<IApiData[]>}
   * @memberof IApiMDControlController
   */
  load(args?: IApiMDCtrlLoadParams): Promise<IApiData[]>;

  /**
   * @description 删除数据
   * @param {IApiMDCtrlRemoveParams} [args]
   * @returns {*}  {Promise<void>}
   * @memberof IApiMDControlController
   */
  remove(args?: IApiMDCtrlRemoveParams): Promise<void>;

  /**
   * @description 刷新数据
   * @returns {*}  {Promise<void>}
   * @memberof IApiMDControlController
   */
  refresh(): Promise<void>;

  /**
   * @description 导入数据
   * @returns {*}  {Promise<void>}
   * @memberof IApiMDControlController
   */
  importData(): Promise<void>;

  /**
   * @description 获取选中数据
   * @returns {*}  {IApiData[]}
   * @memberof IApiMDControlController
   */
  getData(): IApiData[];

  /**
   * @description 设置选中数据,设置的数据和已经选中的一样时会触发onSelectionChange事件
   * @param {IApiData[]} selection
   * @param {boolean} isEmit 是否触发onSelectionChange事件
   * @memberof IApiMDControlController
   */
  setSelection(selection: IApiData[], isEmit?: boolean): void;

  /**
   * @description 设置激活数据
   * @param {IApiData} data
   * @param {(MouseEvent | undefined)} [event]
   * @returns {*}  {Promise<void>}
   * @memberof IApiMDControlController
   */
  setActive(data: IApiData, event?: MouseEvent | undefined): Promise<void>;

  /**
   * @description 跳转第一页
   * @returns {*}  {Promise<IApiData[]>}
   * @memberof IApiMDControlController
   */
  goToFirstPage(): Promise<IApiData[]>;

  /**
   * @description 跳转上一页
   * @returns {*}  {Promise<IApiData[]>}
   * @memberof IApiMDControlController
   */
  goToPreviousPage(): Promise<IApiData[]>;

  /**
   * @description 跳转下一页
   * @returns {*}  {Promise<IApiData[]>}
   * @memberof IApiMDControlController
   */
  goToNextPage(): Promise<IApiData[]>;

  /**
   * @description 跳转最后一页
   * @returns {*}  {Promise<IApiData[]>}
   * @memberof IApiMDControlController
   */
  goToLastPage(): Promise<IApiData[]>;

  /**
   * @description 选中全部数据
   * @param {boolean} [state] 是否全选，若传递参数则以传递的参数控制是否全选，否则自动计算是否全选
   * @memberof IApiMDControlController
   */
  selectAll(state?: boolean): void;

  /**
   * @description 执行多数据分组
   * @param {IApiMDGroupParams[]} [arg] 分组参数集合（多层分组暂未支持）
   * @param {IApiParams} [params] 额外参数
   * @returns {*}  {Promise<void>}
   * @memberof IApiMDControlController
   */
  execGroup(arg: IApiMDGroupParams[], params?: IApiParams): Promise<void>;

  /**
   * @description 设置选中数据
   * @param {IApiData[]} items
   * @memberof IApiMDControlController
   */
  setSelectedData(items: IApiData[]): void;

  /**
   * @description 新建行
   * @param {IApiMDCtrlLoadParams} [args]
   * @returns {*}  {Promise<void>}
   * @memberof IApiMDControlController
   */
  newRow(args?: IApiMDCtrlLoadParams): Promise<void>;
}
