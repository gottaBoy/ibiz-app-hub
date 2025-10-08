import { IApiToolbarController } from '../../controller';
import { IApiDataViewControlState } from './i-api-data-view-control.state';
import { IApiMDControlGroupState } from './i-api-md-control.state';

/**
 * @description 看板部件（kanban）部件状态接口
 * @primary
 * @export
 * @interface IApiKanbanState
 * @extends {IApiDataViewControlState}
 */
export interface IApiKanbanState extends IApiDataViewControlState {
  /**
   * @description 是否正在批操作
   * @type {boolean}
   * @default false
   * @memberof IApiKanbanState
   */
  batching: boolean;

  /**
   * @description 分组数据
   * @type {IApiKanbanGroupState[]}
   * @default []
   * @memberof IApiKanbanState
   */
  groups: IApiKanbanGroupState[];

  /**
   * @description 选中分组标识
   * @type {(string | number)}
   * @default ''
   * @memberof IApiKanbanState
   */
  selectGroupKey: string | number;
}

/**
 * @description 看板分组状态
 * @export
 * @interface IApiKanbanGroupState
 * @extends {IApiMDControlGroupState}
 */
export interface IApiKanbanGroupState extends IApiMDControlGroupState {
  /**
   * @description 颜色
   * @type {string}
   * @memberof IApiKanbanGroupState
   */
  color?: string;

  /**
   * @description 快速工具栏控制器
   * @type {IApiToolbarController}
   * @memberof IApiKanbanGroupState
   */
  quickToolbarController?: IApiToolbarController;

  /**
   * @description 批操作工具栏控制器
   * @type {IApiToolbarController}
   * @memberof IApiKanbanGroupState
   */
  batchToolbarController?: IApiToolbarController;
}
