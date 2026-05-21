import { IApiData } from '@ibiz-template/core';
import { IApiButtonContainerState } from '../common';
import { IApiMDControlState } from './i-api-md-control.state';
import { IApiMobMDCtrlController } from '../../controller';

/**
 * @description 多数据视图行状态接口
 * @export
 * @interface IApiMobMDCtrlRowState
 */
export interface IApiMobMDCtrlRowState {
  /**
   * @description 界面行为状态
   * @type {{ [p: string]: IApiButtonContainerState }}
   * @memberof IApiMobMDCtrlRowState
   */
  uaColStates: { [p: string]: IApiButtonContainerState };

  /**
   * @description 行数据
   * @type {IApiData}
   * @memberof IApiMobMDCtrlRowState
   */
  data: IApiData;

  /**
   * @description 多数据部件控制器
   * @type {IApiMobMDCtrlController}
   * @memberof IApiMobMDCtrlRowState
   */
  controller: IApiMobMDCtrlController;
}

/**
 * @description 移动端多数据部件状态接口
 * @primary
 * @export
 * @interface IApiMobMdCtrlState
 * @extends {IApiMDControlState}
 */
export interface IApiMobMdCtrlState extends IApiMDControlState {
  /**
   * @description 多数据视图行数据
   * @type {IApiMobMDCtrlRowState[]}
   * @default []
   * @memberof IApiMobMdCtrlState
   */
  rows: IApiMobMDCtrlRowState[];

  /**
   * @description 多数视图可设置排序的数据项集合
   * @type {Array<{
   *     value: string;
   *     label: string;
   *   }>}
   * @memberof IApiMobMdCtrlState
   */
  sortDelistItems: Array<{
    value: string;
    label: string;
  }>;
}
