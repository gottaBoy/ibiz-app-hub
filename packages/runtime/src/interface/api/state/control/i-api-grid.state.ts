import { IApiData } from '@ibiz-template/core';
import { IApiMDControlState } from './i-api-md-control.state';
import { IApiButtonContainerState } from '../common';
import { IApiControlVO } from '../../service';

/**
 * @description 行数据状态
 * @export
 * @interface IApiGridRowState
 */
export interface IApiGridRowState {
  /**
   * @description 数据
   * @type {IApiData}
   * @memberof IApiGridRowState
   */
  data: IApiData;

  /**
   * @description 旧数据
   * @type {IApiData}
   * @memberof IApiGridRowState
   */
  oldData: IApiData;

  /**
   * @description 错误信息集合，p是对应属性名称
   * @type {({ [p: string]: string | null })}
   * @memberof IApiGridRowState
   */
  errors: { [p: string]: string | null };

  /**
   * @description 操作列状态(p是操作列的标识)
   * @type {{ [p: string]: IApiButtonContainerState }}
   * @memberof IApiGridRowState
   */
  uaColStates: { [p: string]: IApiButtonContainerState };

  /**
   * @description 界面行为组状态(p是界面行为的标识)
   * @type {{ [p: string]: IApiButtonContainerState }}
   * @memberof IApiGridRowState
   */
  uiActionGroupStates: { [p: string]: IApiButtonContainerState };

  /**
   * @description 编辑列的状态
   * @type {{
   *     [p: string]: {
   *       disabled: boolean;
   *       readonly: boolean;
   *       editable: boolean;
   *       required: boolean;
   *     };
   *   }}
   * @memberof IApiGridRowState
   */
  editColStates: {
    [p: string]: {
      disabled: boolean;
      readonly: boolean;
      editable: boolean;
      required: boolean;
    };
  };

  /**
   * @description 是否显示行编辑
   * @type {boolean}
   * @memberof IApiGridRowState
   */
  showRowEdit: boolean;

  /**
   * @description 是否被修改过
   * @type {boolean}
   * @memberof IApiGridRowState
   */
  modified: boolean;

  /**
   * @description 是否正在处理中(动态控制，值规则，表单项更新等逻辑中)
   * @type {boolean}
   * @memberof IApiGridRowState
   */
  processing: boolean;

  /**
   * @description 缓存的数据对象
   * @type {IApiControlVO}
   * @memberof IApiGridRowState
   */
  cacheData?: IApiControlVO;

  /**
   * @description 获取改变数据
   * @returns {*}  {IApiData}
   * @memberof IApiGridRowState
   */
  getDiffData(): IApiControlVO;
}

/**
 * @description 表格列状态
 * @export
 * @interface IApiColumnState
 */
export interface IApiColumnState {
  /**
   * @description 列标识,是列模型的codeName
   * @type {string}
   * @memberof IApiColumnState
   */
  key: string;

  /**
   * @description 列标题
   * @type {string}
   * @memberof IApiColumnState
   */
  caption: string;

  /**
   * @description 显示隐藏
   * @type {boolean}
   * @memberof IApiColumnState
   */
  hidden: boolean;

  /**
   * @description 隐藏模式，0：默认不隐藏，1：默认隐藏，2：始终隐藏，3：从不隐藏
   * @type {number}
   * @memberof IApiColumnState
   */
  hideMode: number;

  /**
   * @description 是否是操作列
   * @type {boolean}
   * @memberof IApiColumnState
   */
  uaColumn: boolean;

  /**
   * @description 是否是固定列，固定在左侧还是右侧
   * @type {('left' | 'right')}
   * @memberof IApiColumnState
   */
  fixed?: 'left' | 'right';

  /**
   * @description 是否是自适应列
   * @type {boolean}
   * @memberof IApiColumnState
   */
  adaptive?: boolean;

  /**
   * @description 列宽
   * @type {number}
   * @memberof IApiColumnState
   */
  columnWidth?: number;
}

/**
 * @description 本地存储表格列状态对象
 * @export
 * @interface IApiStorageColumnStates
 */
export interface IApiStorageColumnStates {
  /**
   * @description 开启jsonschema下的表格列状态
   * @type {IApiColumnState[]}
   * @memberof IApiStorageColumnStates
   */
  schemaColumnStates?: IApiColumnState[];

  /**
   * @description 默认表格列状态
   * @type {IApiColumnState[]}
   * @memberof IApiStorageColumnStates
   */
  defaultColumnStates?: IApiColumnState[];
}

/**
 * @description 表格UI状态接口
 * @primary
 * @export
 * @interface IApiGridState
 * @extends {IApiMDControlState}
 */
export interface IApiGridState extends IApiMDControlState {
  /**
   * @description 展开行的 keys 数组
   * @type {string[]}
   * @memberof IApiTreeGridState
   */
  expandRowKeys: string[];

  /**
   * @description 表格行状态
   * @type {IApiGridRowState[]}
   * @default []
   * @memberof IApiGridState
   */
  rows: IApiGridRowState[];

  /**
   * @description 表格列状态数组，顺序就是列的排序
   * @type {IApiColumnState[]}
   * @default []
   * @memberof IApiGridState
   */
  columnStates: IApiColumnState[];

  /**
   * @description 聚合计算的结果
   * @type {IApiData}
   * @default {}
   * @memberof IApiGridState
   */
  aggResult: IApiData;

  /**
   * @description 统计结果
   * @type {IApiData}
   * @default {}
   * @memberof IApiGridState
   */
  totalResult: IApiData;

  /**
   * @description 远程聚合计算结果
   * @type {IApiData}
   * @default {}
   * @memberof IApiGridState
   */
  remoteAggResult?: IApiData;

  /**
   * @description 开启表格行编辑,表格样式为自动表格(AUTOGRID)时默认为true，否则为false
   * @type {boolean}
   * @default false
   * @memberof IApiGridState
   */
  rowEditOpen: boolean;

  /**
   * @description 是否为自动表格,自动表格可添加行
   * @type {boolean}
   * @default false
   * @memberof IApiGridState
   */
  isAutoGrid: boolean;

  /**
   * @description 隐藏表格头部
   * @type {boolean}
   * @default false
   * @memberof IApiGridState
   */
  hideHeader?: boolean;

  /**
   * @description 是否启用分页栏
   * @type {boolean}
   * @default true
   * @memberof IApiGridState
   */
  enablePagingBar?: boolean;

  /**
   * @description simple数据
   * @type {IApiData[]}
   * @default []
   * @memberof IApiGridState
   */
  simpleData?: IApiData[];
}
