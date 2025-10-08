import { IApiButtonContainerState } from '../common';
import { IApiMDControlState } from './i-api-md-control.state';

/**
 * @description 列表部件状态接口
 * @primary
 * @export
 * @interface IApiListState
 * @extends {IApiMDControlState}
 */
export interface IApiListState extends IApiMDControlState {
  /**
   * @description 是否正在更新
   * @type {boolean}
   * @default false
   * @memberof IApiListState
   */
  updating: boolean;

  /**
   * @description 是否可拖拽
   * @type {boolean}
   * @default false
   * @memberof IApiListState
   */
  draggable: boolean;

  /**
   * @description 是否只读
   * @type {boolean}
   * @default false
   * @memberof IApiListState
   */
  readonly: boolean;

  /**
   * @description 是否显示分页栏
   * @type {boolean}
   * @default true
   * @memberof IApiListState
   */
  enablePagingBar?: boolean;

  /**
   * @description 展开key集合，该状态仅PC端使用。
   * @type {string[]}
   * @default []
   * @memberof IApiListState
   */
  expandedKeys: string[];

  /**
   * @description 列表操作项状态集合
   * @type {{ [p: string]: IApiButtonContainerState }}
   * @memberof IKanbanState
   */
  uaState: { [p: string]: IApiButtonContainerState };
}
