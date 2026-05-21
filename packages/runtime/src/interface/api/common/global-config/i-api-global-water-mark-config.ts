/**
 * @description 应用水印配置参数
 * @export
 * @interface IApiGlobalWaterMarkConfig
 */
export interface IApiGlobalWaterMarkConfig {
  /**
   * @description 是否启用
   * @type {boolean}
   * @platform web
   * @platform mob
   * @memberof IApiGlobalWaterMarkConfig
   * @default false
   */
  enable: boolean;

  /**
   * @description 水印内容：字符串表示单行文本，数组表示多行文本
   * @type {(string | string[])}
   * @platform web
   * @platform mob
   * @memberof IApiGlobalWaterMarkConfig
   */
  text: string | string[];

  /**
   * @description 字体大小（单位：CSS 像素）
   * @type {number}
   * @platform web
   * @platform mob
   * @memberof IApiGlobalWaterMarkConfig
   * @default 14
   */
  fontSize: number;

  /**
   * @description 字体族（遵循 CSS 字体族语法）
   * @type {string}
   * @platform web
   * @platform mob
   * @memberof IApiGlobalWaterMarkConfig
   * @default Microsoft YaHei
   */
  fontFamily: string;

  /**
   * @description 字体粗细（遵循 CSS 字体粗细语法，如 'bold'、400）
   * @type {(string | number)}
   * @platform web
   * @platform mob
   * @memberof IApiGlobalWaterMarkConfig
   * @default 400
   */
  fontWeight: string | number;

  /**
   * @description 字体样式，仅支持 'normal'（正常）、'italic'（斜体）、'oblique'（倾斜）
   * @type {string}
   * @platform web
   * @platform mob
   * @memberof IApiGlobalWaterMarkConfig
   * @default normal
   */
  fontStyle: string;
  /**
   * @description 字体颜色（支持 CSS 颜色格式，如 '#fff'、'rgba(0,0,0,0.5)'）
   * @type {string}
   * @platform web
   * @platform mob
   * @memberof IApiGlobalWaterMarkConfig
   * @default rgba(0,0,0,0.5)
   */
  color: string;

  /**
   * @description 水印整体透明度（范围：0 - 1，0 完全透明，1 完全不透明）
   * @type {number}
   * @platform web
   * @platform mob
   * @memberof IApiGlobalWaterMarkConfig
   * @default 0.15
   */
  opacity: number;

  /**
   * @description 水印顺时针旋转角度,负数即为逆时针（单位：度数）
   * @type {number}
   * @platform web
   * @platform mob
   * @memberof IApiGlobalWaterMarkConfig
   * @default -30
   */
  rotate: number;

  /**
   * @description 水印平铺时 x、y 方向的间距（单位：CSS 像素），数组第一项为 x 方向，第二项为 y 方向
   * @type {[number, number]}
   * @platform web
   * @platform mob
   * @memberof IApiGlobalWaterMarkConfig
   * @default [90, 90]
   */
  gap: [number, number];

  /**
   * @description 水印背景的偏移量（单位：CSS 像素），数组第一项为 x 方向偏移，第二项为 y 方向偏移
   * @type {[number, number]}
   * @platform web
   * @platform mob
   * @memberof IApiGlobalWaterMarkConfig
   * @default [0, 0]
   */
  offset: [number, number];

  /**
   * @description 水印图块大小（单位：CSS 像素）：未设置时根据文本自适应；设置时按指定宽高固定图块尺寸,（0 表示自适应）
   * @type {{ width: number; height: number }}
   * @platform web
   * @platform mob
   * @memberof IApiGlobalWaterMarkConfig
   * @default `{ width: 0, height: 0 }`
   */
  tileSize: { width: number; height: number };

  /**
   * @description 水印层的 z-index 值（控制层级显示顺序）
   * @type {number}
   * @platform web
   * @platform mob
   * @memberof IApiGlobalWaterMarkConfig
   * @default 9999
   */
  zIndex: number;

  /**
   * @description 是否使用 Shadow DOM 隔离水印样式：开启后可避免页面样式污染水印，增强样式稳定性
   * @type {boolean}
   * @platform web
   * @platform mob
   * @memberof IApiGlobalWaterMarkConfig
   * @default true
   */
  useShadowDom: boolean;

  /**
   * @description 是否启用防篡改保护：开启后通过 MutationObserver 监听，自动恢复被修改的水印节点和关键样式
   * @type {boolean}
   * @platform web
   * @platform mob
   * @memberof IApiGlobalWaterMarkConfig
   * @default true
   */
  protect: boolean;
  /**
   * @description 是否允许文本选择穿透水印层
   * @type {boolean}
   * @platform web
   * @platform mob
   * @memberof IApiGlobalWaterMarkConfig
   * @default false
   */
  allowSelect: boolean;
  /**
   * @description 是否开启严格保护：开启后除 MutationObserver 监听外，将通过定时器（每 2000ms）做额外检查，进一步防止水印被篡改
   * @type {boolean}
   * @platform web
   * @platform mob
   * @memberof IApiGlobalWaterMarkConfig
   * @default false
   */
  strictProtect: boolean;

  /**
   * @description 当容器不是 body 时，是否自动将容器设置为 relative 定位（避免水印因容器定位缺失导致错位）
   * @type {boolean}
   * @platform web
   * @platform mob
   * @memberof IApiGlobalWaterMarkConfig
   * @default true
   */
  ensureRelative: boolean;
}
