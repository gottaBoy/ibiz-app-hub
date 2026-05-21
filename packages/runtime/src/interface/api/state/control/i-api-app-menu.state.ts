import { IAppMenuItem } from '@ibiz/model-core';
import { IApiData } from '@ibiz-template/core';
import { IApiControlState } from './i-api-control.state';

/**
 * @description 菜单状态接口
 * @primary
 * @export
 * @interface IApiAppMenuState
 * @extends {IApiControlState}
 */
export interface IApiAppMenuState extends IApiControlState {
  /**
   * @description 菜单项状态
   * @type {{ [p: string]: { visible: boolean; permitted: boolean } }} {[菜单标识]: { 是否显示；是否有权限 }}
   * @default {}
   * @memberof IApiAppMenuState
   */
  menuItemsState: { [p: string]: { visible: boolean; permitted: boolean } };

  /**
   * @description 移动端最终展示的菜单项集合，基于“mobAuthedMenuItems”（经权限计算后的可显示项），结合用户自定义配置计算生成
   * @type {IAppMenuItem[]}
   * @default []
   * @memberof IApiAppMenuState
   */
  mobMenuItems: IAppMenuItem[];

  /**
   * @description 移动端菜单经过权限计算后可显示的菜单项集合，该参数将作为“mobMenuItems”计算的基础数据源
   * @type {IAppMenuItem[]}
   * @default []
   * @memberof IApiAppMenuState
   */
  mobAuthedMenuItems: IAppMenuItem[];

  /**
   * @description 计数器数据
   * @type {IApiData}
   * @memberof IApiAppMenuState
   */
  counterData: IApiData;
}
