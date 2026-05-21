import { IApiContext, IApiData } from '@ibiz-template/core';
import { IApiColState } from '../../common/i-api-col-state';
/**
 * @primary
 * @description 面板项状态
 * @export
 * @interface IApiPanelItemState
 * @extends {IApiColState}
 */
export interface IApiPanelItemState extends IApiColState {
  /**
   * @description 是否禁用
   * @type {boolean}
   * @memberof IApiPanelItemState
   */
  disabled: boolean;

  /**
   * @description 类名集合
   * @type {IApiPanelItemClass}
   * @memberof IApiPanelItemState
   */
  class: IApiPanelItemClass;

  /**
   * @description 是否必填
   * @type {boolean}
   * @memberof IApiPanelItemState
   */
  required: boolean;

  /**
   * @description 是否只读
   * @type {boolean}
   * @memberof IApiPanelItemState
   */
  readonly: boolean;

  /**
   * @description 应用上下文
   * @type {IApiContext}
   * @memberof IApiPanelItemState
   */
  context?: IApiContext;

  /**
   * @description 计数器数据
   * @type {IApiData}
   * @memberof IApiPanelItemState
   */
  counterData: IApiData;
}
/**
 * @description 面板项样式接口
 * @export
 * @interface IApiPanelItemClass
 */
export interface IApiPanelItemClass {
  /**
   * @description 容器样式
   * @type {string[]}
   * @memberof IApiPanelItemClass
   */
  container: string[];
  /**
   * @description 容器动态样式
   * @type {string[]}
   * @memberof IApiPanelItemClass
   */
  containerDyna: string[];
  /**
   * @description 标题样式
   * @type {string[]}
   * @memberof IApiPanelItemClass
   */
  label: string[];
  /**
   * @description 标题动态样式
   * @type {string[]}
   * @memberof IApiPanelItemClass
   */
  labelDyna: string[];
}
