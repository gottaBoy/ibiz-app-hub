/**
 * 自动关闭窗口，用于在提问完成时配置窗口关闭模式
 *
 * @export
 * @interface IAutoClose
 */
export interface IAutoClose {
  /**
   * @description 模式
   * - minimize：最小化；close：直接关闭；closetime：定时关闭
   * @type {('minimize' | 'closetime' | 'close')}
   */
  mode: 'minimize' | 'close' | 'closetime';

  /**
   * @description 自动关闭延时时间，该值单位为秒（s），当 mode 值为closetime时生效
   * @default 3
   * @type {number}
   */
  duration?: number;
}

/**
 * 聊天窗口呈现配置
 *
 * @author chitanda
 * @date 2023-10-15 19:10:04
 * @export
 * @interface IChatContainerOptions
 */
export interface IChatContainerOptions {
  /**
   * 窗口 x 坐标
   *
   * @author chitanda
   * @date 2023-10-13 14:10:42
   * @type {number}
   */
  x?: number;
  /**
   * 窗口 y 坐标
   *
   * @author chitanda
   * @date 2023-10-13 14:10:52
   * @type {number}
   */
  y?: number;
  /**
   * 窗口宽度
   *
   * @author chitanda
   * @date 2023-10-13 14:10:56
   * @type {number}
   */
  width?: number;
  /**
   * 窗口高度
   *
   * @author chitanda
   * @date 2023-10-13 14:10:02
   * @type {number}
   */
  height?: number;
  /**
   * 窗口最小宽度
   *
   * @author chitanda
   * @date 2023-10-13 14:10:11
   * @type {number}
   */
  minWidth?: number;
  /**
   * 窗口最小高度
   *
   * @author chitanda
   * @date 2023-10-13 14:10:15
   * @type {number}
   */
  minHeight?: number;

  /**
   * 窗口index
   *
   * @author tony001
   * @date 2025-03-03 16:03:01
   * @type {number}
   */
  zIndex?: number;

  /**
   * 是否允许回填
   *
   * @author tony001
   * @date 2025-03-10 15:03:16
   * @type {boolean}
   */
  enableBackFill?: boolean;

  /**
   * 自动关闭
   *
   * @type {IAutoClose}
   * @memberof IChatContainerOptions
   */
  autoClose?: IAutoClose;

  /**
   * @description AI窗口的打开模式
   * - default：默认；minimize：最小化；autoexpand：自动展开
   * @type {('default' | 'minimize' | 'autoexpand')}
   * @memberof IChatContainerOptions
   */
  openMode?: 'default' | 'minimize' | 'autoexpand';

  /**
   * 是否允许最小化
   *
   * @type {boolean}
   */
  enableAIMinimize?: boolean;
}
