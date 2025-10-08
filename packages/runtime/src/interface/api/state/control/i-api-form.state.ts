import { IApiData } from '@ibiz-template/core';
import { IApiControlState } from './i-api-control.state';

/**
 * @primary
 * @description 表单状态
 * @export
 * @interface IApiFormState
 * @extends {IApiControlState}
 */
export interface IApiFormState extends IApiControlState {
  /**
   * @description 是否加载完数据
   * @type {boolean}
   * @default false
   * @memberof IApiFormState
   */
  isLoaded: boolean;

  /**
   * @description 表单数据
   * @type {IApiData}
   * @default {}
   * @memberof IApiFormState
   */
  data: IApiData;

  /**
   * @description 是否正在处理中(动态控制，值规则，表单项更新等逻辑中)
   * @type {boolean}
   * @default false
   * @memberof IApiFormState
   */
  processing: boolean;

  /**
   * @description 是否被修改过
   * @type {boolean}
   * @default false
   * @memberof IApiFormState
   */
  modified: boolean;

  /**
   * @description 当前激活分页
   * @type {string}
   * @memberof IApiFormState
   */
  activeTab: string;

  /**
   * @description 表单是否销毁(UI)
   * @type {boolean}
   * @default false
   * @memberof IApiFormState
   */
  formIsDestroyed: boolean;

  /**
   * @description 简单模式数据索引
   * @type {number}
   * @default 0
   * @memberof IApiFormState
   */
  simpleDataIndex: number;

  /**
   * @description 多数据部件表单模式下当前表单索引
   * @memberof IApiFormState
   */
  mdCtrlFormIndex: number;
}
