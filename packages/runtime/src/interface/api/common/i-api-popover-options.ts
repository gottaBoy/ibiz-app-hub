export declare type ApiAlignment = 'start' | 'end';
export declare type ApiSide = 'top' | 'right' | 'bottom' | 'left';
export declare type ApiAlignedPlacement = `${ApiSide}-${ApiAlignment}`;
export declare type ApiPlacement = ApiSide | ApiAlignedPlacement;
export interface IApiAxesOffsets {
  /**
   * @description 浮动元素与参考元素之间的间距
   * @type {number}
   * @memberof IApiAxesOffsets
   */
  mainAxis?: number;
  /**
   * @description 浮动元素与参考元素之间的偏移量，与mainAxis垂直
   * @type {number}
   * @memberof IApiAxesOffsets
   */
  crossAxis?: number;
  alignmentAxis?: number | null;
}

/**
 * @description 飘窗参数
 * @export
 * @interface IApiPopoverOptions
 * @template O
 */
export interface IApiPopoverOptions<O = unknown> {
  /**
   * @description 宽度,数字0-100的时候算百分比，100以上算像素px，字符串原样设置
   * @type {(string | number)}
   * @memberof IApiPopoverOptions
   */
  width?: string | number;
  /**
   * @description 高度,数字0-100的时候算百分比，100以上算像素px，字符串原样设置
   * @type {(string | number)}
   * @memberof IApiPopoverOptions
   */
  height?: string | number;
  /**
   * @description 展示方向
   * @type {ApiPlacement}
   * @memberof IApiPopoverOptions
   */
  placement?: ApiPlacement;
  /**
   * @description 是否自动关闭
   * @type {boolean}
   * @memberof IApiPopoverOptions
   */
  autoClose?: boolean;

  /**
   * @description 偏移参数
   * @type {(IApiAxesOffsets | number)}
   * @memberof IApiPopoverOptions
   */
  offsetOpts?: IApiAxesOffsets | number;

  /**
   * @description 不显示箭头
   * @type {boolean}
   * @memberof IApiPopoverOptions
   */
  noArrow?: boolean;

  /**
   * @description 原始飘窗参数
   * @type {O}
   * @memberof IApiPopoverOptions
   */
  options?: O;

  /**
   * @description 自定义飘窗的类名，用来自定义飘窗样式
   * @type {string}
   * @memberof IApiPopoverOptions
   */
  modalClass?: string;

  /**
   * @description 指示 飘窗 的内容将附加在哪一个网页元素上，默认附加到body
   * @type {HTMLElement}
   * @memberof IApiPopoverOptions
   */
  appendTo?: HTMLElement;
}
