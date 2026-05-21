import { IDEToolbar, IDEToolbarItem } from '@ibiz/model-core';
import { IApiData } from '@ibiz-template/core';
import { IApiControlController } from './i-api-control.controller';
import { IApiExtraButton, IApiToolbarState } from '../../state';

/**
 * 工具栏
 * @description 工具栏集中了页面常用操作按钮，点击按钮即可执行相应操作，实现页面多样化业务功能。
 * @ctrlparams {"name":"placement","title":"移动端自定义工具栏显示位置","defaultvalue":"'RIGHTEND'","parameterType":"'LEFTSTART' | 'LEFT' | 'LEFTEND' | 'RIGHT' | 'RIGHTSTART' | 'RIGHTEND'","description":"该参数可将工具栏固定在屏幕左侧或右侧的顶部、中部、底部位置，可选值包含左上（LEFTSTART）、左侧居中（LEFT）、左下（LEFTEND）、右上（RIGHTSTART）、右侧居中（RIGHT）、右下（RIGHTEND）。仅工具栏样式设为自定义时生效","effectPlatform":"mob"}
 * @ctrlparams {"name":"direction","title":"移动端自定义工具栏项的排列方向","defaultvalue":"'HORIZONTAL'","parameterType":"'VERTICAL' | 'HORIZONTAL'","description":"定义移动端工具栏项的排列方向，可选值包含水平排列（HORIZONTAL）、垂直排列（VERTICAL）。仅工具栏样式设为自定义时生效。","effectPlatform":"mob"}
 * @ctrlparams {"name":"showmode","title":"移动端工具栏的显示模式","defaultvalue":"'IMMEDIATE'","parameterType":"'IMMEDIATE' | 'COLLAPSIBLE'","description":"定义移动端工具栏的显示模式，可选值包含即时渲染模式（IMMEDIATE）、可折叠模式（COLLAPSIBLE）。","effectPlatform":"mob"}
 * @ctrlparams {"name":"groupshowmode","title":"移动端工具栏分组与行为组的展示模式","defaultvalue":"'ACTIONSHEET'","parameterType":"'DEFAULT' | 'ACTIONSHEET'","description":"定义移动端工具栏分组与行为组的展示模式，可选值包含DEFAULT（气泡模式，组内容以悬浮气泡形式展示）、ACTIONSHEET（行为列表模式，组内容以下拉抽屉形式展示）。","effectPlatform":"mob"}
 * @primary
 * @export
 * @interface IApiToolbarController
 * @extends {IApiControlController<T, S>}
 * @template T
 * @template S
 */
export interface IApiToolbarController<
  T extends IDEToolbar = IDEToolbar,
  S extends IApiToolbarState = IApiToolbarState,
> extends IApiControlController<T, S> {
  /**
   * @description 所有工具栏项
   * @type {IDEToolbarItem[]}
   * @memberof IApiToolbarController
   */
  allToolbarItems: IDEToolbarItem[];

  /**
   * @description 设置额外的按钮（可多次调用，会累加）
   * @param {('before' | 'after' | number)} position 按钮位置
   * @param {IExtraButton[]} buttons 按钮集合
   * @memberof IApiToolbarController
   */
  setExtraButtons(
    position: 'before' | 'after' | number,
    buttons: IApiExtraButton[],
  ): void;

  /**
   * @description 清除所有设置的额外按钮
   * @param {('before' | 'after' | number)} [position] 按钮位置
   * @memberof IApiToolbarController
   */
  clearExtraButtons(position?: 'before' | 'after' | number): void;

  /**
   * @description 执行工具栏按钮点击
   * @param {(IDEToolbarItem | IApiExtraButton)} item 工具栏项
   * @param {MouseEvent} event 鼠标事件
   * @param {IApiData} [params] 界面行为参数（界面行为点击自定义按钮可能需要传参数到行为去，标准行为忽略此参数）
   * @returns {*}  {Promise<void>}
   * @memberof IApiToolbarController
   */
  onItemClick(
    item: IDEToolbarItem | IApiExtraButton,
    event: MouseEvent,
    params?: IApiData,
  ): Promise<void>;
}
