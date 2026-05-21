/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-shadow */
export enum ToolbarItemType {
  BRUSH = 'brush', // 画笔工具
  RECT = 'rect', // 矩形工具
  CIRCLE = 'circle', // 圆形工具
  MARKER = 'marker', // 标记类工具
  TEXT = 'text', // 文本工具
  ARROW = 'arrow', // 箭头工具
  DIVIDER = 'divider', // 分割线
  AI = 'ai', // AI功能
  MOSAIC = 'mosaic', // 马赛克
  DRAWDOWN = 'drawdown', // 回撤
  CLOSE = 'close', // 关闭
}

/**
 * @description 画笔配置信息
 * @export
 * @interface IBrushOption
 */
export interface IBrushOption {
  /**
   * @description 画笔大小
   * @type {number}
   * @memberof IBrushOption
   */
  size: number;
  /**
   * @description 画笔颜色
   * @type {string}
   * @memberof IBrushOption
   */
  color: string;
}

/**
 * @description 工具项
 * @export
 * @interface IToolbarItem
 */
export interface IToolbarItem {
  /**
   * @description 项类型
   * @type {ToolbarItemType}
   * @memberof IToolbarItem
   */
  type: ToolbarItemType;

  /**
   * @description 图标组件（部分项可选，如分割线）
   * @memberof IToolbarItem
   */
  icon?: any;

  /**
   * @description 显示文本
   * @type {string}
   * @memberof IToolbarItem
   */
  text?: string;

  /**
   * @description 大小配置
   * @type {IData}
   * @memberof IToolbarItem
   */
  sizeOpts?: IData[];

  /**
   * @description 大小
   * @type {number}
   * @memberof IToolbarItem
   */
  size?: number;

  /**
   * @description 颜色
   * @type {string}
   * @memberof IToolbarItem
   */
  color?: string;
}

/**
 * @description 大小配置
 * @export
 * @interface ISizeOpt
 */
export interface ISizeOpt {
  /**
   * @description 值
   * @type {number}
   * @memberof ISizeOpt
   */
  value: number;
  /**
   * @description 类型
   * @type {('small' | 'medium' | 'big')}
   * @memberof ISizeOpt
   */
  type: 'small' | 'medium' | 'big';
  /**
   * @description 显示文本
   * @type {string}
   * @memberof ISizeOpt
   */
  text: string;
}

/**
 * @description 鼠标位置（相对于画布）
 * @export
 * @interface IMousePosition
 */
export interface IMousePosition {
  mouseX: number;
  mouseY: number;
}
