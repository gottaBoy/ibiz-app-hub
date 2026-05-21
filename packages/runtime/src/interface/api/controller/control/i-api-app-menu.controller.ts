import { IAppMenu, IAppMenuItem } from '@ibiz/model-core';
import { IApiControlController } from './i-api-control.controller';
import { IApiAppMenuState } from '../../state';

/**
 * 应用菜单
 * @description 菜单是网站导航的核心组件，用于组织并展示站点层级结构，提供快速访问路径。其中PC端菜单通常包含水平/垂直布局、多级下拉、高亮交互等功能，移动端菜单则是在页面底部进行平铺展示，支持高亮交互，折叠收缩多余菜单项等功能。
 * @ctrlparams {"name":"columnnum","title":"移动端图标菜单显示列数","defaultvalue":"4","parameterType":"number","description":"控制移动端每行显示的菜单项个数，当前菜单为图标菜单时生效","effectPlatform":"mob"}
 * @ctrlparams {"name":"customizedalign","title":"移动端定制按钮对齐位置","defaultvalue":"'RIGHTEND'","parameterType":"'LEFTSTART' | 'LEFT' | 'LEFTEND' | 'RIGHT' | 'RIGHTSTART' | 'RIGHTEND'","description":"该参数可将定制按钮固定在屏幕左侧或右侧的顶部、中部、底部位置，可选值包含左上（LEFTSTART）、左侧居中（LEFT）、左下（LEFTEND）、右上（RIGHTSTART）、右侧居中（RIGHT）、右下（RIGHTEND）。当前菜单为图标菜单、列表菜单时生效","effectPlatform":"mob"}
 * @primary
 * @export
 * @interface IApiMenuController
 * @extends {IApiControlController<T, S>}
 * @template T
 * @template S
 */
export interface IApiMenuController<
  T extends IAppMenu = IAppMenu,
  S extends IApiAppMenuState = IApiAppMenuState,
> extends IApiControlController<T, S> {
  /**
   * @description 所有菜单项
   * @type {IAppMenuItem[]}
   * @memberof IApiMenuController
   */
  allAppMenuItems: IAppMenuItem[];

  /**
   * @description 获取菜单默认打开视图
   * @returns {*}  {(string | undefined)}
   * @memberof IApiMenuController
   */
  getDefaultOpenView(): string | undefined;
}
