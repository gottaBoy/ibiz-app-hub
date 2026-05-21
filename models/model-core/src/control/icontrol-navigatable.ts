import { IControl } from './icontrol';
import { INavigatable } from './inavigatable';

/**
 *
 * 支持导航界面部件模型对象接口
 * @export
 * @interface IControlNavigatable
 */
export interface IControlNavigatable extends IControl, INavigatable {
  /**
   * 导航视图高度
   * @type {number}
   * @default 0.0
   * 来源  getNavViewHeight
   */
  navViewHeight?: number;

  /**
   * 导航视图最大高度
   * @type {number}
   * @default 0.0
   * 来源  getNavViewMaxHeight
   */
  navViewMaxHeight?: number;

  /**
   * 导航视图最大宽度
   * @type {number}
   * @default 0.0
   * 来源  getNavViewMaxWidth
   */
  navViewMaxWidth?: number;

  /**
   * 导航视图最小高度
   * @type {number}
   * @default 0.0
   * 来源  getNavViewMinHeight
   */
  navViewMinHeight?: number;

  /**
   * 导航视图最小宽度
   * @type {number}
   * @default 0.0
   * 来源  getNavViewMinWidth
   */
  navViewMinWidth?: number;

  /**
   * 导航视图位置
   * @description 值模式 [导航视图位置] {NONE：无、 RIGHT：右侧、 BOTTOM：下方、 ANY_RIGHT：任意（默认右侧）、 ANY_BOTTOM：任意（默认下方）、 ROWDETAIL：行明细区、 USER：用户自定义、 USER2：用户自定义2 }
   * @type {( string | 'NONE' | 'RIGHT' | 'BOTTOM' | 'ANY_RIGHT' | 'ANY_BOTTOM' | 'ROWDETAIL' | 'USER' | 'USER2')}
   * @default NONE
   * 来源  getNavViewPos
   */
  navViewPos?:
    | string
    | 'NONE'
    | 'RIGHT'
    | 'BOTTOM'
    | 'ANY_RIGHT'
    | 'ANY_BOTTOM'
    | 'ROWDETAIL'
    | 'USER'
    | 'USER2';

  /**
   * 导航视图显示模式
   * @description 值模式 [导航视图显示模式] {0：默认显示、 1：默认隐藏、 2：显示（程序控制）、 3：隐藏（程序控制） }
   * @type {( number | 0 | 1 | 2 | 3)}
   * @default 0
   * 来源  getNavViewShowMode
   */
  navViewShowMode?: number | 0 | 1 | 2 | 3;

  /**
   * 导航视图宽度
   * @type {number}
   * @default 0.0
   * 来源  getNavViewWidth
   */
  navViewWidth?: number;
}
