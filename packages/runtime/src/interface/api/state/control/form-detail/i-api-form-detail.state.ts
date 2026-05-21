import { IApiData } from '@ibiz-template/core';
import { IApiColState } from '../../common';

/**
 * @description 表单成员类名集合接口
 * @export
 * @interface IApiFormDetailClass
 */
export interface IApiFormDetailClass {
  /**
   * @description 容器样式
   * @type {string[]}
   * @memberof IApiFormDetailClass
   */
  container: string[];

  /**
   * @description 容器动态样式
   * @type {string[]}
   * @memberof IApiFormDetailClass
   */
  containerDyna: string[];

  /**
   * @description 标题样式
   * @type {string[]}
   * @memberof IApiFormDetailClass
   */
  label: string[];

  /**
   * @description 标题动态样式
   * @type {string[]}
   * @memberof IApiFormDetailClass
   */
  labelDyna: string[];
}

/**
 * @description 表单成员状态
 * @export
 * @interface IApiFormDetailState
 * @extends {IApiColState}
 */
export interface IApiFormDetailState extends IApiColState {
  /**
   * @description  显示更多模式 {0：无、 1：受控内容、 2：管理容器}
   * @type {(0 | 1 | 2 | number)}
   * @memberof IApiFormDetailState
   */
  showMoreMode: 0 | 1 | 2 | number;

  /**
   * @description 类名集合
   * @type {IFormDetailClass}
   * @memberof IApiFormDetailState
   */
  class: IApiFormDetailClass;

  /**
   * @description 是否禁用
   * @type {boolean}
   * @memberof IApiFormDetailState
   */
  disabled: boolean;

  /**
   * @description 是否必填
   * @type {boolean}
   * @memberof IApiFormDetailState
   */
  required: boolean;

  /**
   * @description 计数器数据
   * @type {IApiData}
   * @memberof IApiFormDetailState
   */
  counterData: IApiData;
}
