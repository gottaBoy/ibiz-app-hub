import { IApiData, IApiParams } from '@ibiz-template/core';
import { ISysImage } from '@ibiz/model-core';
import { IApiControlState } from './i-api-control.state';

/**
 * @description 分页状态接口
 * @export
 * @interface IApiTabExpPanelPagesState
 */
export interface IApiTabExpPanelPagesState {
  /**
   * @description 分页标识
   * @type {string}
   * @memberof IApiTabExpPanelPagesState
   */
  tabTag: string;

  /**
   * @description 分页标题
   * @type {string}
   * @memberof IApiTabExpPanelPagesState
   */
  caption: string;

  /**
   * @description 当前分页缓存的全路径
   * @type {string}
   * @memberof IApiTabExpPanelPagesState
   */
  fullPath?: string;

  /**
   * @description 类名集合
   * @type {string[]}
   * @memberof IApiTabExpPanelPagesState
   */
  class: string[];

  /**
   * @description 标题图标
   * @type {ISysImage}
   * @memberof IApiTabExpPanelPagesState
   */
  sysImage?: ISysImage;

  /**
   * @description 计数器标识
   * @type {string}
   * @memberof IApiTabExpPanelPagesState
   */
  counterId?: string;
}

/**
 * @description 分页导航面板状态接口
 * @primary
 * @export
 * @interface IApiTabExpPanelState
 * @extends {IApiControlState}
 */
export interface IApiTabExpPanelState extends IApiControlState {
  /**
   * @description 分页数据
   * @type {ITabExpPanelPagesState[]}
   * @default []
   * @memberof IApiTabExpPanelState
   */
  tabPages: IApiTabExpPanelPagesState[];

  /**
   * @description 激活分页标识
   * @type {string}
   * @default ''
   * @memberof IApiTabExpPanelState
   */
  activeName: string;

  /**
   * @description  默认导航分页标识
   * @type {string}
   * @default ''
   * @memberof IApiTabExpPanelState
   */
  defaultTabName: string;

  /**
   * @description 给导航的视图附加的视图参数
   * @type {IApiParams}
   * @default {}
   * @memberof IApiTabExpPanelState
   */
  expViewParams: IApiParams;

  /**
   * @description 计数器数据
   * @type {IApiData}
   * @memberof IApiTabExpPanelState
   */
  counterData: IApiData;
}
