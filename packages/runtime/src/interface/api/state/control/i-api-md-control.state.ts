import { IApiData, IApiParams } from '@ibiz-template/core';
import { IApiControlState } from './i-api-control.state';
import { IApiButtonContainerState } from '../common';

/**
 * @description 多数据部件UI状态接口
 * @primary
 * @export
 * @interface IApiMDControlState
 * @extends {IApiControlState}
 */
export interface IApiMDControlState extends IApiControlState {
  /**
   * @description 多数据部件数据集合
   * @type {IApiData[]}
   * @default []
   * @memberof IApiMDControlState
   */
  items: IApiData[];

  /**
   * @description 多数据部件已选中的数据集合
   * @type {IApiData[]}
   * @default []
   * @memberof IApiMDControlState
   */
  selectedData: IApiData[];

  /**
   * @description 多数据部件选中数据主键集合(数据选择视图中使用)
   * @type {string[]}
   * @default []
   * @memberof IApiMDControlState
   */
  selectedKeys: string[];

  /**
   * @description 是否是单项选择
   * @type {boolean}
   * @default true
   * @memberof IApiMDControlState
   */
  singleSelect: boolean;

  /**
   * @description 多数据部件激活模式,0：无激活；1：单击激活；2：双击激活
   * @type {(number | 0 | 1 | 2)} 0：无、 1：单击、 2：双击
   * @default 0
   * @memberof IApiMDControlState
   */
  mdctrlActiveMode: number | 0 | 1 | 2;

  /**
   * @description 当前页
   * @type {number}
   * @default 1
   * @memberof IApiMDControlState
   */
  curPage: number;

  /**
   * @description 分页条数
   * @type {number}
   * @default 20
   * @memberof IApiMDControlState
   */
  size: number;

  /**
   * @description 总条数
   * @type {number}
   * @default 0
   * @memberof IApiMDControlState
   */
  total: number;

  /**
   * @description 全部计数条数，数据集配置需勾选返回全部计数
   * @type {number}
   * @default 0
   * @memberof IApiMDControlState
   */
  totalx?: number;

  /**
   * @description 总页数
   * @type {number}
   * @memberof IApiMDControlState
   */
  totalPages: number;

  /**
   * @description 是否加载过数据，用于某些需要等待数据加载回来之后的场景。
   * @type {boolean}
   * @default false
   * @memberof IApiMDControlState
   */
  isLoaded: boolean;

  /**
   * @description 搜索部件的查询参数
   * @type {IApiParams}
   * @default {}
   * @memberof IApiMDControlState
   */
  searchParams: IApiParams;

  /**
   * @description 是否禁用排序
   * @type {boolean}
   * @default false
   * @memberof IApiMDControlState
   */
  noSort: boolean;

  /**
   * @description 排序查询条件
   * @type {string}
   * @default ''
   * @memberof IApiMDControlState
   */
  sortQuery: string;

  /**
   * @description 分组数据
   * @type {IApiMDControlGroupState[]}
   * @default []
   * @memberof IApiMDControlState
   */
  groups: IApiMDControlGroupState[];

  /**
   * @description 隐藏无数据图片，该状态仅PC端使用。
   * @type {boolean}
   * @default false
   * @memberof IApiMDControlState
   */
  hideNoDataImage: boolean;

  /**
   * @description 是否启用内置导航视图，该状态仅PC端使用。
   * @type {boolean}
   * @default false
   * @memberof IApiMDControlState
   */
  enableNavView: boolean;

  /**
   * @description 是否显示内置导航视图，该状态仅PC端使用。
   * @type {boolean}
   * @default false
   * @memberof IApiMDControlState
   */
  showNavView: boolean;

  /**
   * @description 是否显示内置导航图标，导航视图显示模式为程序控制时不显示。该状态仅PC端使用。
   * @type {boolean}
   * @default false
   * @memberof IApiMDControlState
   */
  showNavIcon: boolean;

  /**
   * @description 是否显示行明细，该状态仅PC端（表格，列表）使用。
   * @type {boolean}
   * @default false
   * @memberof IApiMDControlState
   */
  showRowDetail: boolean;

  /**
   * @description 是否启用分组，该状态仅PC端（表格，卡片，列表）使用。
   * @type {boolean}
   * @memberof IApiMDControlState
   */
  enableGroup: boolean;
}

/**
 * @description  分组UI数据接口
 * @export
 * @interface IApiMDControlGroupState
 */
export interface IApiMDControlGroupState {
  /**
   * @description 子数据
   * @type {IApiData[]}
   * @memberof IApiMDControlGroupState
   */
  children: IApiData[];

  /**
   * @description 分组标题
   * @type {string}
   * @memberof IApiMDControlGroupState
   */
  caption: string;

  /**
   * @description 分组唯一标识（分组属性对应的值）
   * @type {(string | number)}
   * @memberof IApiMDControlGroupState
   */
  key: string | number;

  /**
   * @description 分组界面行为组状态
   * @type {IApiButtonContainerState}
   * @memberof IApiMDControlGroupState
   */
  groupActionGroupState?: IApiButtonContainerState;

  /**
   * @description 当前分组已选中的数据集合
   * @type {IApiData[]}
   * @memberof IApiMDControlGroupState
   */
  selectedData?: IApiData[];
}
