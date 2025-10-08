import { PanelItemState } from '@ibiz-template/runtime';

export interface BreadcrumbMsg {
  viewName: string;
  fullPath: string;
  caption?: string;
  dataInfo?: string;
  isEmbed?: boolean;
  isModal?: boolean;
  type: 'menuItem' | 'default';
  menuTag?: string;
}

/**
 * 导航标签页占位状态
 *
 * @author lxm
 * @date 2023-02-07 06:04:27
 * @export
 * @class NavBreadcrumbState
 * @extends {PanelItemState}
 */
export class NavBreadcrumbState extends PanelItemState {
  /**
   * @description 面包屑数据
   * @exposedoc
   * @type {BreadcrumbMsg[]}
   * @memberof NavBreadcrumbState
   */
  breadcrumbItems: BreadcrumbMsg[] = [];

  /**
   * @description 菜单标识
   * @type {string}
   * @memberof NavBreadcrumbState
   */
  menuTag: string = '';
}
