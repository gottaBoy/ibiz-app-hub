/**
 * @description 模态配置
 * @export
 * @interface IApiModalOptions
 */
export interface IApiModalOptions {
  /**
   * @description 宽度 数字0-100的时候算百分比，100以上算像素px，字符串原样设置
   * @type {(string | number)}
   * @memberof IApiModalOptions
   */
  width?: string | number;

  /**
   * @description 高度 数字0-100的时候算百分比，100以上算像素px，字符串原样设置
   * @type {(string | number)}
   * @memberof IApiModalOptions
   */
  height?: string | number;

  /**
   * @description 是否隐藏底部按钮（默认false)
   * @type {boolean}
   * @memberof IApiModalOptions
   */
  footerHide?: boolean;

  /**
   * @description 显示位置
   * @type {string}
   * @memberof IApiModalOptions
   */
  placement?: string;

  /**
   * @description 自定义模态的类名，用来自定义模态样式
   * @type {string}
   * @memberof IApiModalOptions
   */
  modalClass?: string;

  /**
   * @description 是否为路由模态模式
   * @type {boolean}
   * @memberof IApiModalOptions
   */
  isRouteModal?: boolean;

  /**
   * @description 是否开启数据切换指示器
   * @type {boolean}
   * @memberof IApiModalOptions
   */
  openIndicator?: boolean;
}
