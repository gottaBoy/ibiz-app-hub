import { IApiData } from '@ibiz-template/core';

/**
 * @description html2canvas配置项
 * @export
 * @interface IApiHtml2canvasOption
 */
export interface IApiHtml2canvasOption {
  /**
   * @description 导出文件名称
   * @type {string}
   * @memberof IApiHtml2canvasOption
   */
  fileName?: string;

  /**
   * @description 是否允许不同源的图片污染画布
   * @type {boolean}
   * @memberof IApiHtml2canvasOption
   */
  allowTaint?: boolean;

  /**
   * @description 画布背景颜色，如果 DOM 中没有指定，则默认为白色。设置 null 则为透明
   * @type {string}
   * @memberof IApiHtml2canvasOption
   */
  backgroudColor?: string;

  /**
   * @description现有的 canvas 元素，用作绘图的基础
   * @type {(HTMLCanvasElement)}
   * @memberof IApiHtml2canvasOption
   */
  canvas?: HTMLCanvasElement;

  /**
   * @description 如果浏览器支持 ForeignObject rendering，是否使用它
   * @type {boolean}
   * @memberof IApiHtml2canvasOption
   */
  foreignObjectRendering?: boolean;

  /**
   * @description 加载图片超时（毫秒）。设置 0 关闭超时
   * @type {number}
   * @memberof IApiHtml2canvasOption
   */
  imageTimeout?: number;

  /**
   * @description 布尔函数，用于从渲染中删除匹配元素。
   * @memberof IApiHtml2canvasOption
   */
  ignoreElements?: (element: Element) => boolean;

  /**
   * @description 启用日志记录以进行调试
   * @type {boolean}
   * @memberof IApiHtml2canvasOption
   */
  logging?: boolean;

  /**
   * @description 在克隆文档流进行渲染时调用的回调函数，可用于修改将在不影响原始源文档流的情况下呈现的内容
   * @memberof IApiHtml2canvasOption
   */
  onclone?: () => IApiData | null;

  /**
   * @description Url 到代理，用于加载跨域图片资源。如果留空，则不会加载跨域图片。
   * @type {(string)}
   * @memberof IApiHtml2canvasOption
   */
  proxy?: string;

  /**
   * @description 是否清理克隆的 DOM 元素，html2canvas 暂时创建。
   * @type {boolean}
   * @memberof IApiHtml2canvasOption
   */
  removeContainer?: boolean;

  /**
   * @description 用于渲染的比例，默认为浏览器设备像素比率。
   * @type {number}
   * @memberof IApiHtml2canvasOption
   */
  scale?: number;

  /**
   * @description 是否尝试使用 CORS 从服务器加载图片
   * @type {boolean}
   * @memberof IApiHtml2canvasOption
   */
  useCORS?: boolean;

  /**
   * @description canvas 画布宽度
   * @type {number}
   * @memberof IApiHtml2canvasOption
   */
  width?: number;

  /**
   * @description canvas 画布高度
   * @type {number}
   * @memberof IApiHtml2canvasOption
   */
  height?: number;

  /**
   * @description 裁剪画布 x 坐标
   * @type {number}
   * @memberof IApiHtml2canvasOption
   */
  x?: number;

  /**
   * @description 裁剪画布 y 坐标
   * @type {number}
   * @memberof IApiHtml2canvasOption
   */
  y?: number;

  /**
   * @description 渲染元素时使用的 X 滚动位置（比如元素使用 position: fixed）
   * @type {number}
   * @memberof IApiHtml2canvasOption
   */
  scrollX?: number;

  /**
   * @description 渲染元素时使用的 Y 滚动位置（比如元素使用 position: fixed）
   * @type {number}
   * @memberof IApiHtml2canvasOption
   */
  scrollY?: number;

  /**
   * @description 渲染 Element 时要使用的窗口宽度，这可能会影响媒体查询等内容
   * @type {number}
   * @memberof IApiHtml2canvasOption
   */
  windowWidth?: number;

  /**
   * @description 渲染 Element 时要使用的窗口高度，这可能会影响媒体查询等内容
   * @type {number}
   * @memberof IApiHtml2canvasOption
   */
  windowHeight?: number;
}

/**
 * @description html2canvas工具类
 * @export
 * @interface IApiHtml2canvasUtil
 */
export interface IApiHtml2canvasUtil {
  /**
   * @description 导出canvas
   * @param {HTMLElement} dom 元素
   * @param {IApiHtml2canvasOption} [option] html2canvas配置
   * @returns {*}  {Promise<void>}
   * @memberof IApiHtml2canvasUtil
   */
  exportCanvas(dom: HTMLElement, option?: IApiHtml2canvasOption): Promise<void>;

  /**
   * @description 获取节点转化的canvas
   * @param {HTMLElement} dom 元素
   * @param {IApiHtml2canvasOption} [option] html2canvas配置
   * @returns {*}  {Promise<HTMLCanvasElement>}
   * @memberof IApiHtml2canvasUtil
   */
  getCanvas(
    dom: HTMLElement,
    option?: IApiHtml2canvasOption,
  ): Promise<HTMLCanvasElement>;
}
