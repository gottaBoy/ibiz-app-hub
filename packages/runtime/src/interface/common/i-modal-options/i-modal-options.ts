export interface IModalOptions {
  /**
   * 宽度 数字0-100的时候算百分比，100以上算像素px，字符串原样设置
   *
   * @author lxm
   * @date 2022-09-12 20:09:20
   * @type {string | number}
   */
  width?: string | number;
  /**
   * 高度 数字0-100的时候算百分比，100以上算像素px，字符串原样设置
   *
   * @author lxm
   * @date 2022-09-12 20:09:22
   * @type {string | number}
   */
  height?: string | number;
  /**
   * 是否隐藏底部按钮（默认false)
   *
   * @author lxm
   * @date 2022-09-12 20:09:23
   * @type {boolean}
   */
  footerHide?: boolean;

  /**
   * 显示位置
   *
   * @author lxm
   * @date 2022-11-08 16:11:38
   * @type {'center'}
   */
  placement?: 'center';

  /**
   * 自定义模态的类名，用来自定义模态样式
   *
   * @author lxm
   * @date 2022-11-21 15:11:29
   * @type {string}
   */
  modalClass?: string;

  /**
   * 是否为路由模态模式
   *
   * @author chitanda
   * @date 2024-02-29 10:02:00
   * @type {boolean}
   */
  isRouteModal?: boolean;

  /**
   * @description 是否开启数据切换指示器
   * @type {boolean}
   * @memberof IModalOptions
   */
  openIndicator?: boolean;
}
