/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable no-param-reassign */
/* eslint-disable default-param-last */
import { isNumber, isObject, throttle } from 'lodash-es';
import { Bezier } from './bezier';
import { IBasicPoint, Point } from './point';

/**
 * @description 签名事件对象接口，封装签名相关的事件信息
 * @export
 * @interface ISignatureEvent
 */
export interface ISignatureEvent {
  /** 原始事件对象（鼠标、触摸或指针事件） */
  event: MouseEvent | TouchEvent | PointerEvent;
  /** 事件类型（如'mousedown'、'touchmove'等） */
  type: string;
  /** 事件发生时的X坐标 */
  x: number;
  /** 事件发生时的Y坐标 */
  y: number;
  /** 压力值（如触摸或绘图设备的压力感应值） */
  pressure: number;
}

/**
 * @description 从数据加载签名时的配置选项接口
 * @export
 * @interface IFromDataOptions
 */
export interface IFromDataOptions {
  /** 是否在加载前清除现有签名，默认true */
  clear?: boolean;
}

/**
 * @description 导出为SVG格式时的配置选项接口
 * @export
 * @interface IToSVGOptions
 */
export interface IToSVGOptions {
  /** 是否在SVG中包含背景色，默认false */
  includeBackgroundColor?: boolean;
}

/**
 * @description 点组的样式配置选项接口，用于定义签名线条/点的绘制样式
 * @export
 * @interface IPointGroupOptions
 */
export interface IPointGroupOptions {
  /** 点的大小（像素） */
  dotSize: number;
  /** 线条最小宽度（像素） */
  minWidth: number;
  /** 线条最大宽度（像素） */
  maxWidth: number;
  /** 画笔颜色（CSS颜色格式） */
  penColor: string;
  /** 速度过滤权重（用于平滑线条粗细变化） */
  velocityFilterWeight: number;
  /** 合成操作（遵循Canvas的globalCompositeOperation规范） */
  compositeOperation: GlobalCompositeOperation;
}

/**
 * @description SignaturePad的初始化配置选项接口，继承点组样式配置并支持部分可选扩展
 * @export
 * @interface ISignaturePadOptions
 * @extends {Partial<IPointGroupOptions>}
 */
export interface ISignaturePadOptions extends Partial<IPointGroupOptions> {
  /** 连续点之间的最小距离（像素），小于此值则不记录新点 */
  minDistance?: number;
  /** 画布背景色（CSS颜色格式） */
  backgroundColor?: string;
  /** 事件节流时间（毫秒），限制绘制事件触发频率 */
  throttle?: number;
  /** Canvas 2D上下文的初始化配置 */
  canvasContextOptions?: CanvasRenderingContext2DSettings;
}

/**
 * @description 点组接口，包含一组点及对应的绘制样式配置，用于记录签名的一段轨迹
 * @export
 * @interface IPointGroup
 * @extends {IPointGroupOptions}
 */
export interface IPointGroup extends IPointGroupOptions {
  /** 该组包含的点集合（基础点信息） */
  points: IBasicPoint[];
}

export default class SignaturePad {
  /**
   * @description 点的大小，默认值为0（单位：像素）。控制点击画布时生成的点的尺寸。0表示根据线条宽度自动计算点的大小
   * @type {number}
   * @memberof SignaturePad
   */

  public dotSize: number;

  /**
   * @description 画笔最小宽度，默认值为0.5（单位：像素）。控制签名线条的最细宽度，绘制速度越快，线条越接近此值
   * @type {number}
   * @memberof SignaturePad
   */
  public minWidth: number;

  /**
   * @description 画笔最大宽度，默认值为2.5（单位：像素）。控制签名线条的最粗宽度，绘制速度越慢，线条越接近此值。
   * @type {number}
   * @memberof SignaturePad
   */
  public maxWidth: number;

  /**
   * @description 画笔颜色，默认值为'black'。签名轨迹的颜色，可接受 CSS 颜色格式（如#ff0000、rgb(255,0,0)等）。
   * @type {string}
   * @memberof SignaturePad
   */
  public penColor: string;

  /**
   * @description 最小绘制距离，默认值为5（单位：像素）。当连续两个绘制点的距离小于此值时，不会记录新点，用于减少冗余数据并优化绘制流畅度。
   * @type {number}
   * @memberof SignaturePad
   */
  public minDistance: number;

  /**
   * @description 速度过滤权重，默认值为0.7。用于平滑处理绘制速度的计算，影响线条粗细随速度的变化幅度。值越接近 1，当前速度对线条粗细的影响越大；值越小，线条过渡越平滑
   * @type {number}
   * @memberof SignaturePad
   */
  public velocityFilterWeight: number;

  /**
   * @description 合成操作，默认值为'source-over'。控制新绘制的线条与已有内容的混合方式，遵循 Canvas 的globalCompositeOperation属性规范
   * @type {GlobalCompositeOperation}
   * @memberof SignaturePad
   */
  public compositeOperation: GlobalCompositeOperation;

  /**
   * @description 画布背景色，默认值为'rgba(0,0,0,0)'（透明）。签名画布的背景颜色，导出图片时会包含此背景。
   * @type {string}
   * @memberof SignaturePad
   */
  public backgroundColor: string;

  /**
   * @description 节流时间，默认值为16（单位：毫秒）。限制绘制事件的触发频率，避免高频操作导致性能问题。??运算符确保0值会被正常应用（而||会忽略0）
   * @type {number}
   * @memberof SignaturePad
   */
  public throttle: number;

  /**
   * @description Canvas 上下文配置，默认值为{}。用于初始化 Canvas 2D 上下文的额外配置项（如alpha、willReadFrequently等）
   * @type {CanvasRenderingContext2DSettings}
   * @memberof SignaturePad
   */
  public canvasContextOptions: CanvasRenderingContext2DSettings;

  /**
   * @description  Canvas 2D 渲染上下文，用于实际绘制签名轨迹
   * @private
   * @type {CanvasRenderingContext2D}
   * @memberof SignaturePad
   */
  private _ctx: CanvasRenderingContext2D;

  /**
   * @description 是否正在绘制中（笔触未抬起）
   * @private
   * @memberof SignaturePad
   */
  private _drawingStroke = false;

  /**
   * @description 签名是否为空（未绘制任何内容）
   * @private
   * @memberof SignaturePad
   */
  private _isEmpty = true;

  /**
   * @description 是否重新绘制过签名（用于判断是否从数据恢复过签名）
   * @private
   * @memberof SignaturePad
   */
  private _isRedrawn = false;

  /**
   * @description 上一次从DataURL加载的签名图片地址，用于撤销操作时恢复
   * @private
   * @memberof SignaturePad
   */
  private _oldFromDataURL = '';

  /**
   * @description 存储最近的点（最多4个），用于生成新的贝塞尔曲线
   * @private
   * @type {Point[]}
   * @memberof SignaturePad
   */
  private _lastPoints: Point[] = [];

  /**
   * @description 存储所有签名数据（按轨迹分组，每组包含一段连续绘制的点及样式配置）
   * @private
   * @type {IPointGroup[]}
   * @memberof SignaturePad
   */
  private _data: IPointGroup[] = [];

  /**
   * @description 上一次计算的绘制速度（用于平滑线条宽度变化）
   * @private
   * @memberof SignaturePad
   */
  private _lastVelocity = 0;

  /**
   * @description 上一次绘制的线条宽度（用于平滑过渡到当前宽度）
   * @private
   * @memberof SignaturePad
   */
  private _lastWidth = 0;

  /**
   * @description 节流处理后的笔触移动更新函数（根据配置的throttle值决定是否节流）
   * @private
   * @memberof SignaturePad
   */
  private _strokeMoveUpdate: (event: ISignatureEvent) => void;

  /**
   * @description 当前活跃的指针事件ID（用于区分多指针设备的不同笔触）
   * @private
   * @type {(number | undefined)}
   * @memberof SignaturePad
   */
  private _strokePointerId: number | undefined;

  constructor(
    private canvas: HTMLCanvasElement,
    options: ISignaturePadOptions = {},
  ) {
    this.velocityFilterWeight = options.velocityFilterWeight || 0.7;
    this.minWidth = options.minWidth || 2;
    this.maxWidth = options.maxWidth || 2;

    // We need to handle 0 value, so use `??` instead of `||`
    this.throttle = options.throttle ?? 16; // in milliseconds
    this.minDistance = options.minDistance ?? 5; // in pixels
    this.dotSize = options.dotSize || 0;
    this.penColor = options.penColor || 'black';
    this.backgroundColor = options.backgroundColor || 'rgba(0,0,0,0)';
    this.compositeOperation = options.compositeOperation || 'source-over';
    this.canvasContextOptions = options.canvasContextOptions ?? {};

    this._strokeMoveUpdate = this.throttle
      ? throttle(SignaturePad.prototype._strokeUpdate, this.throttle)
      : SignaturePad.prototype._strokeUpdate;

    this._handleMouseDown = this._handleMouseDown.bind(this);
    this._handleMouseMove = this._handleMouseMove.bind(this);
    this._handleMouseUp = this._handleMouseUp.bind(this);
    this._handleTouchStart = this._handleTouchStart.bind(this);
    this._handleTouchMove = this._handleTouchMove.bind(this);
    this._handleTouchEnd = this._handleTouchEnd.bind(this);
    this._handlePointerDown = this._handlePointerDown.bind(this);
    this._handlePointerMove = this._handlePointerMove.bind(this);
    this._handlePointerUp = this._handlePointerUp.bind(this);

    this._ctx = canvas.getContext(
      '2d',
      this.canvasContextOptions,
    ) as CanvasRenderingContext2D;

    this.clear();

    this.on();
  }

  public clear(): void {
    const { _ctx: ctx, canvas } = this;

    // 使用背景颜色清除画布
    ctx.fillStyle = this.backgroundColor;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    this._data = [];
    this._reset(this._getPointGroupOptions());
    this._isEmpty = true;
    this._strokePointerId = undefined;
    this._oldFromDataURL = '';
  }

  /**
   * 从数据URL加载图像并绘制到签名画布上
   * 支持对图像进行旋转、缩放和偏移等处理，适用于恢复保存的签名图像
   * @param {string} dataUrl - 图像的DataURL（如base64编码的图片数据）
   * @param {Object} [options={}] - 加载配置选项
   * @returns {Promise<void>} - 加载完成的Promise（成功时resolve，失败时reject）
   */
  public async fromDataURL(
    dataUrl: string,
    options: {
      // 设备像素比，用于适配高清屏幕
      ratio?: number;
      // 图像绘制宽度（默认适应画布宽度）
      width?: number;
      // 图像绘制高度（默认适应画布高度）
      height?: number;
      //  图像绘制的X轴偏移量（相对于画布左上角）
      xOffset?: number;
      // 图像绘制的Y轴偏移量（相对于画布左上角）
      yOffset?: number;
      // 图像旋转角度（度数，顺时针方向）
      rotation?: number;
    } = {},
  ): Promise<void> {
    let _tempDataUrl = dataUrl;
    // 如果需要旋转且旋转角度不为0，先处理图像旋转
    if (isNumber(options.rotation) && options.rotation !== 0) {
      _tempDataUrl = await this.rotateDataURL(
        _tempDataUrl,
        options.rotation, // 顺时针旋转指定角度
        'image/png',
      );
    }
    // 返回Promise，封装图像加载和绘制过程
    return new Promise((resolve, reject) => {
      const image = new Image();
      // 计算设备像素比（默认使用window.devicePixelRatio，无则为1）
      const ratio = options.ratio || window.devicePixelRatio || 1;
      // 计算图像绘制宽度（默认按比例适应画布宽度）
      const width = options.width || this.canvas.width / ratio;
      // 计算图像绘制高度（默认按比例适应画布高度）
      const height = options.height || this.canvas.height / ratio;
      // 图像X轴偏移量（默认0）
      const xOffset = options.xOffset || 0;
      // 图像Y轴偏移量（默认0）
      const yOffset = options.yOffset || 0;

      // 重置绘制状态
      this._reset(this._getPointGroupOptions());

      // 图像加载完成回调
      image.onload = (): void => {
        // 将图像绘制到画布指定位置和大小
        this._ctx.drawImage(image, xOffset, yOffset, width, height);
        resolve(); // 通知加载完成
      };
      // 图像加载失败回调
      image.onerror = (error): void => {
        reject(error); // 通知加载失败
      };
      // 允许跨域图像加载
      image.crossOrigin = 'anonymous';
      // 设置图像源为处理后的DataURL
      image.src = _tempDataUrl;

      // 记录当前加载的DataURL（用于撤销操作）
      this._oldFromDataURL = _tempDataUrl;
      // 标记画布不为空
      this._isEmpty = false;
    });
  }

  /**
   * @description 将已有的 DataURL 旋转指定角度后，返回新的 DataURL
   * @private
   * @param {string} dataUrl - 原始图片的DataURL
   * @param {number} rotation - 旋转角度（度数，顺时针），默认0
   * @param {string} type - 图片格式，默认'image/png'
   * @param {number} [encoderOptions] - 图片质量（0-1），仅适用于jpeg等格式
   * @returns {*}  {Promise<string>}
   * @memberof SignaturePad
   */
  private rotateDataURL(
    dataUrl: string,
    rotation: number = 0,
    type: string = 'image/png',
    encoderOptions?: number,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        const radians = (rotation * Math.PI) / 180;

        const width = image.width;
        const height = image.height;

        // 创建临时 canvas
        const tmpCanvas = document.createElement('canvas');
        const ctx = tmpCanvas.getContext('2d')!;

        // 判断旋转后宽高（90/270度需交换宽高）
        if (rotation % 180 === 0) {
          tmpCanvas.width = width;
          tmpCanvas.height = height;
        } else {
          tmpCanvas.width = height;
          tmpCanvas.height = width;
        }

        // 平移到中心 -> 旋转 -> 绘制图片
        ctx.translate(tmpCanvas.width / 2, tmpCanvas.height / 2);
        ctx.rotate(radians);
        ctx.drawImage(image, -width / 2, -height / 2);

        // 输出新的 dataURL
        resolve(tmpCanvas.toDataURL(type, encoderOptions));
      };

      image.onerror = reject;
      image.crossOrigin = 'anonymous';
      image.src = dataUrl;
    });
  }

  /**
   * @description 撤销上一步
   * @returns {*}  {void}
   * @memberof SignaturePad
   */
  public undoLastStep(): void {
    const tempData = [...this._data];
    const tempFromDataURL = this._oldFromDataURL;
    this.clear();

    this._isRedrawn = true;
    // 没有可撤销的操作
    if (tempData.length === 0) {
      this._oldFromDataURL = '';
      return;
    }
    // 移除最后一笔数据
    tempData.pop();
    // 重新渲染剩余数据
    this.fromDataURL(tempFromDataURL);
    this.fromData(tempData, { clear: false });
    this._isEmpty = tempData.length <= 0;
  }

  /**
   * @description 封装获取当前旋转方位的方法
   * @returns {*}  {IData} 包含屏幕状态、旋转角度和方向的对象
   * @memberof SignaturePad
   */
  getCurrentOrientation(): IData {
    // 获取屏幕方向
    const { screen } = window as IData;
    const screenOrientation =
      screen.orientation || screen.mozOrientation || screen.msOrientation;
    let angle = 0;

    if (screenOrientation) {
      angle = screenOrientation.angle;
    }

    // 方向文本映射

    const orientationText: IData = {
      '0': 'DEFAULT',
      '90': 'Rotated right',
      '-90': 'Rotated left',
      '180': 'Upside down',
    };

    // 判断是否横屏
    const isLandscape = window.innerWidth > window.innerHeight;
    const status = isLandscape ? '横屏' : '竖屏';

    // 确定方向文本
    const orientation = orientationText[`${angle}`] || `未知 (${angle}°)`;

    return {
      isLandscape,
      status,
      angle,
      orientation,
    };
  }

  /**
   * @description 将签名图像作为数据 URL 返回
   * @param {string} [type='image/png']
   * @param {{
   *       rotation?: number;
   *       quality?: number;
   *       encoderOptions?: IToSVGOptions;
   *     }} [options={}]
   * @returns {*}  {string}
   * @memberof SignaturePad
   */
  public toDataURL(
    type: string = 'image/png',
    options: {
      rotation?: number;
      quality?: number;
      encoderOptions?: IToSVGOptions;
    } = {},
  ): string {
    switch (type) {
      case 'image/svg+xml':
        if (isObject(options?.encoderOptions)) {
          options.encoderOptions = undefined;
        }
        return `data:image/svg+xml;base64,${btoa(
          this.toSVG(options?.encoderOptions as unknown as IToSVGOptions),
        )}`;
      default:
        return this.toCanvasDataURL(
          type,
          options.encoderOptions as number,
          options.rotation as number,
        );
    }
  }

  /**
   * @description 导出为 Canvas DataURL（支持旋转）
   * @private
   * @param {string} [type='image/png'] 图片格式
   * @param {number} [encoderOptions] 图片质量（0-1）
   * @param {number} [rotation] 旋转角度（度数）
   * @returns {*}  {string}
   * @memberof SignaturePad
   */
  private toCanvasDataURL(
    type: string = 'image/png',
    encoderOptions?: number,
    rotation?: number, // 单位：度
  ): string {
    if (typeof encoderOptions !== 'number') {
      encoderOptions = undefined;
    }

    if (isNumber(rotation) && rotation !== 0) {
      // 旋转逻辑
      const radians = (rotation * Math.PI) / 180;
      const tmpCanvas = document.createElement('canvas');
      const ctx = tmpCanvas.getContext('2d')!;

      const width = this.canvas.width;
      const height = this.canvas.height;

      // 旋转 90/270 度时，需要交换宽高
      if (rotation % 180 === 0) {
        tmpCanvas.width = width;
        tmpCanvas.height = height;
      } else {
        tmpCanvas.width = height;
        tmpCanvas.height = width;
      }

      ctx.translate(tmpCanvas.width / 2, tmpCanvas.height / 2);
      ctx.rotate(radians);
      ctx.drawImage(this.canvas, -width / 2, -height / 2);

      return tmpCanvas.toDataURL(type, encoderOptions as number);
    }
    // 不旋转直接导出
    return this.canvas.toDataURL(type, encoderOptions as number);
  }

  /**
   * @description 启用签名功能的事件监听，配置画布样式以禁用默认的触摸行为（如平移、缩放），并根据设备类型绑定相应的事件处理器
   * @memberof SignaturePad
   */
  public on(): void {
    // 禁用画布元素的触摸平移/缩放行为
    this.canvas.style.touchAction = 'none';
    // 针对IE浏览器设置触摸行为（兼容性处理）
    (
      this.canvas.style as CSSStyleDeclaration & {
        msTouchAction: string | null;
      }
    ).msTouchAction = 'none';
    // 禁用画布上的文本选择
    this.canvas.style.userSelect = 'none';

    // 判断是否为iOS设备（通过用户代理和触摸事件支持检测）
    const isIOS =
      /Macintosh/.test(navigator.userAgent) && 'ontouchstart' in document;

    // iOS的"Scribble"功能会拦截指针事件，快速点击时可能丢失部分事件
    // 因此对iOS设备使用触摸事件，其他支持指针事件的设备使用指针事件
    if (window.PointerEvent && !isIOS) {
      this._handlePointerEvents();
    } else {
      this._handleMouseEvents();

      // 如果浏览器支持触摸事件，绑定触摸事件处理器
      if ('ontouchstart' in window) {
        this._handleTouchEvents();
      }
    }
  }

  /**
   * @description 禁用签名功能的事件监听，恢复画布默认样式（允许平移、缩放等），并移除所有已绑定的事件处理器
   * @memberof SignaturePad
   */
  public off(): void {
    // 恢复画布的默认触摸行为（允许平移/缩放）
    this.canvas.style.touchAction = 'auto';
    // 恢复IE浏览器的默认触摸行为
    (
      this.canvas.style as CSSStyleDeclaration & {
        msTouchAction: string | null;
      }
    ).msTouchAction = 'auto';
    // 恢复画布上的文本选择功能
    this.canvas.style.userSelect = 'auto';

    // 移除画布上的各类起始事件监听器
    this.canvas.removeEventListener('pointerdown', this._handlePointerDown);
    this.canvas.removeEventListener('mousedown', this._handleMouseDown);
    this.canvas.removeEventListener('touchstart', this._handleTouchStart);

    // 移除所有移动和结束事件的监听器（如mousemove、mouseup等）
    this._removeMoveUpEventListeners();
  }

  /**
   * @description 获取事件监听器的工具函数（适配不同文档上下文的窗口）
   * @private
   * @returns {*} 包含addEventListener和removeEventListener的对象
   * @memberof SignaturePad
   */
  private _getListenerFunctions() {
    const canvasWindow =
      window.document === this.canvas.ownerDocument
        ? window
        : this.canvas.ownerDocument.defaultView ?? this.canvas.ownerDocument;

    return {
      addEventListener: canvasWindow.addEventListener.bind(
        canvasWindow,
      ) as typeof window.addEventListener,
      removeEventListener: canvasWindow.removeEventListener.bind(
        canvasWindow,
      ) as typeof window.removeEventListener,
    };
  }

  /**
   * @description 移除所有移动和抬起事件的监听器（清理事件绑定）
   * @private
   * @memberof SignaturePad
   */
  private _removeMoveUpEventListeners(): void {
    const { removeEventListener } = this._getListenerFunctions();
    removeEventListener('pointermove', this._handlePointerMove);
    removeEventListener('pointerup', this._handlePointerUp);

    removeEventListener('mousemove', this._handleMouseMove);
    removeEventListener('mouseup', this._handleMouseUp);

    removeEventListener('touchmove', this._handleTouchMove);
    removeEventListener('touchend', this._handleTouchEnd);
  }

  /**
   * @description 判断签名画布是否为空（未绘制任何内容）
   * @returns {*}  {boolean}
   * @memberof SignaturePad
   */
  public isEmpty(): boolean {
    return this._isEmpty;
  }

  /**
   * @description 判断签名是否经过重新绘制（如从数据恢复签名、执行撤销后重新渲染等场景）
   * @returns {*}  {boolean}
   * @memberof SignaturePad
   */
  public isRedrawn(): boolean {
    return this._isRedrawn;
  }

  /**
   * @description 从点组数据加载并渲染签名，可根据配置决定是否先清空现有签名，再基于传入的点组数据重新绘制曲线和点
   * @param {IPointGroup[]} pointGroups - 签名点组数据数组，每个点组包含一段签名的点集合及对应的样式配置
   * @param {IFromDataOptions} [options={ clear: true }] - 加载配置项，默认清空现有签名
   * @memberof SignaturePad
   */
  public fromData(
    pointGroups: IPointGroup[],
    { clear = true }: IFromDataOptions = {},
  ): void {
    if (clear) {
      this.clear(); // 若配置需要清空，则先执行清空操作
    }

    // 调用内部方法，传入点组数据及绘制曲线、点的工具方法，完成签名渲染
    this._fromData(
      pointGroups,
      this._drawCurve.bind(this), // 绑定当前实例上下文的曲线绘制方法
      this._drawDot.bind(this), // 绑定当前实例上下文的点绘制方法
    );

    // 将加载的点组数据合并到当前签名数据中，更新数据记录
    this._data = this._data.concat(pointGroups);
  }

  /**
   * @description 导出当前签名的点组数据，用于保存签名原始数据，后续可通过fromData方法恢复签名
   * @returns {*}  {IPointGroup[]}
   * @memberof SignaturePad
   */
  public toData(): IPointGroup[] {
    return this._data;
  }

  /**
   * @description 判断鼠标左键是否按下（支持判断是否仅左键按下）
   * @private
   * @param {MouseEvent} event - 鼠标事件对象
   * @param {boolean} [only] - 是否要求仅左键按下
   * @returns {*}  {boolean}
   * @memberof SignaturePad
   */
  private _isLeftButtonPressed(event: MouseEvent, only?: boolean): boolean {
    if (only) {
      return event.buttons === 1;
    }

    // eslint-disable-next-line no-bitwise
    return (event.buttons & 1) === 1;
  }

  /**
   * @description 将鼠标/指针事件转换为签名事件对象
   * @private
   * @param {(MouseEvent | PointerEvent)} event - 原始事件对象
   * @returns {*}  {ISignatureEvent}
   * @memberof SignaturePad
   */
  private _pointerEventToSignatureEvent(
    event: MouseEvent | PointerEvent,
  ): ISignatureEvent {
    return {
      event,
      type: event.type,
      x: event.clientX,
      y: event.clientY,
      pressure: 'pressure' in event ? event.pressure : 0,
    };
  }

  /**
   * @description 将触摸事件转换为签名事件对象
   * @private
   * @param {TouchEvent} event - 原始触摸事件
   * @returns {*}  {ISignatureEvent}
   * @memberof SignaturePad
   */
  private _touchEventToSignatureEvent(event: TouchEvent): ISignatureEvent {
    const touch = event.changedTouches[0];
    return {
      event,
      type: event.type,
      x: touch.clientX,
      y: touch.clientY,
      pressure: touch.force,
    };
  }

  /**
   * @description 处理鼠标按下事件，当左键按下且未正在绘制时，开始新的笔触
   * @private
   * @param {MouseEvent} event
   * @returns {*}  {void}
   * @memberof SignaturePad
   */
  private _handleMouseDown(event: MouseEvent): void {
    // 若不是左键单独按下，或正在绘制中，则不处理
    if (!this._isLeftButtonPressed(event, true) || this._drawingStroke) {
      return;
    }
    // 将鼠标事件转换为签名事件，并开始笔触
    this._strokeBegin(this._pointerEventToSignatureEvent(event));
  }

  /**
   * @description 处理鼠标移动事件，当左键持续按下且正在绘制时，更新笔触；否则结束笔触
   * @private
   * @param {MouseEvent} event
   * @returns {*}  {void}
   * @memberof SignaturePad
   */
  private _handleMouseMove(event: MouseEvent): void {
    // 若不是左键单独按下，或不在绘制状态，则结束笔触
    if (!this._isLeftButtonPressed(event, true) || !this._drawingStroke) {
      // 当未按主按钮或按了多个按钮时停止绘制
      this._strokeEnd(this._pointerEventToSignatureEvent(event), false);
      return;
    }

    // 更新笔触（带节流处理）
    this._strokeMoveUpdate(this._pointerEventToSignatureEvent(event));
  }

  /**
   * @description 处理鼠标抬起事件，当左键抬起时，结束当前笔触
   * @private
   * @param {MouseEvent} event
   * @returns {*}  {void}
   * @memberof SignaturePad
   */
  private _handleMouseUp(event: MouseEvent): void {
    // 若左键仍按下，则不处理
    if (this._isLeftButtonPressed(event)) {
      return;
    }

    // 结束笔触
    this._strokeEnd(this._pointerEventToSignatureEvent(event));
  }

  /**
   * @description 处理触摸开始事件，当单点触摸且不在绘制状态时，开始新的笔触，并阻止页面滚动
   * @private
   * @param {TouchEvent} event
   * @returns {*}  {void}
   * @memberof SignaturePad
   */
  private _handleTouchStart(event: TouchEvent): void {
    // 若不是单点触摸，或正在绘制中，则不处理
    if (event.targetTouches.length !== 1 || this._drawingStroke) {
      return;
    }

    // 阻止页面滚动
    if (event.cancelable) {
      event.preventDefault();
    }

    // 将触摸事件转换为签名事件，并开始笔触
    this._strokeBegin(this._touchEventToSignatureEvent(event));
  }

  /**
   * @description 处理触摸移动事件，当单点触摸且正在绘制时，更新笔触；否则结束笔触，并阻止页面滚动
   * @private
   * @param {TouchEvent} event
   * @returns {*}  {void}
   * @memberof SignaturePad
   */
  private _handleTouchMove(event: TouchEvent): void {
    // 若不是单点触摸，则不处理
    if (event.targetTouches.length !== 1) {
      return;
    }

    // 阻止页面滚动
    if (event.cancelable) {
      event.preventDefault();
    }

    // 若不在绘制状态，则结束笔触
    if (!this._drawingStroke) {
      this._strokeEnd(this._touchEventToSignatureEvent(event), false);
      return;
    }

    // 更新笔触（带节流处理）
    this._strokeMoveUpdate(this._touchEventToSignatureEvent(event));
  }

  /**
   * @description 处理触摸结束事件，当所有触摸点离开时，结束当前笔触，并阻止默认行为
   * @private
   * @param {TouchEvent} event
   * @returns {*}  {void}
   * @memberof SignaturePad
   */
  private _handleTouchEnd(event: TouchEvent): void {
    // 若仍有触摸点未离开，则不处理
    if (event.targetTouches.length !== 0) {
      return;
    }

    // 阻止默认行为（如点击事件冒泡）
    if (event.cancelable) {
      event.preventDefault();
    }

    // 结束笔触
    this._strokeEnd(this._touchEventToSignatureEvent(event));
  }

  /**
   * @description 获取指针事件的唯一ID（优先使用persistentDeviceId，兼容旧设备用pointerId）
   * @private
   * @param {PointerEvent} event
   * @returns {*} {number}
   * @memberof SignaturePad
   */
  private _getPointerId(event: PointerEvent): number {
    return (event as IData)?.persistentDeviceId || event.pointerId;
  }

  /**
   * @description 判断当前指针事件的ID是否为当前活跃的笔触ID
   * @private
   * @param {PointerEvent} event - 指针事件对象
   * @param {boolean} [allowUndefined] - 是否允许当前无活跃ID（初始状态）
   * @returns {*}  {boolean}
   * @memberof SignaturePad
   */
  private _allowPointerId(
    event: PointerEvent,
    allowUndefined = false,
  ): boolean {
    if (typeof this._strokePointerId === 'undefined') {
      return allowUndefined;
    }

    return this._getPointerId(event) === this._strokePointerId;
  }

  /**
   * @description 处理指针按下事件（兼容鼠标、触摸等多种输入设备）
   * @private
   * @param {PointerEvent} event
   * @returns {*}  {void}
   * @memberof SignaturePad
   */
  private _handlePointerDown(event: PointerEvent): void {
    // 若正在绘制中，或左键未按下，或指针ID不合法，则不处理
    if (
      this._drawingStroke ||
      !this._isLeftButtonPressed(event) ||
      !this._allowPointerId(event, true)
    ) {
      return;
    }

    // 记录当前活跃的指针ID（用于区分多指针操作）
    this._strokePointerId = this._getPointerId(event);

    // 阻止默认行为（如页面滚动、文本选择等）
    event.preventDefault();

    // 将指针事件转换为签名事件，并开始笔触
    this._strokeBegin(this._pointerEventToSignatureEvent(event));
  }

  /**
   * @description 处理指针移动事件，当指针ID有效、左键持续按下且正在绘制时，更新笔触；否则结束笔触
   * @private
   * @param {PointerEvent} event
   * @returns {*}  {void}
   * @memberof SignaturePad
   */
  private _handlePointerMove(event: PointerEvent): void {
    // 若指针ID不匹配当前活跃ID，则不处理
    if (!this._allowPointerId(event)) {
      return;
    }

    // 若左键未单独按下，或不在绘制状态，则结束笔触
    if (!this._isLeftButtonPressed(event, true) || !this._drawingStroke) {
      // 当主按钮未按下或按下多个按钮时停止绘制
      this._strokeEnd(this._pointerEventToSignatureEvent(event), false);
      return;
    }

    // 阻止默认行为
    event.preventDefault();

    // 更新笔触（带节流处理）
    this._strokeMoveUpdate(this._pointerEventToSignatureEvent(event));
  }

  /**
   * @description 处理指针抬起事件，当左键抬起且指针ID有效时，结束当前笔触
   * @private
   * @param {PointerEvent} event
   * @returns {*}  {void}
   * @memberof SignaturePad
   */
  private _handlePointerUp(event: PointerEvent): void {
    // 若左键仍按下，或指针ID不匹配当前活跃ID，则不处理
    if (this._isLeftButtonPressed(event) || !this._allowPointerId(event)) {
      return;
    }

    // 阻止默认行为
    event.preventDefault();

    // 结束笔触
    this._strokeEnd(this._pointerEventToSignatureEvent(event));
  }

  /**
   * @description 获取点组的样式配置（优先使用点组自身配置，否则用全局配置）
   * @private
   * @param {IPointGroup} [group] - 点组对象（可选）
   * @returns {*}  {IPointGroupOptions}
   * @memberof SignaturePad
   */
  private _getPointGroupOptions(group?: IPointGroup): IPointGroupOptions {
    return {
      penColor: group && 'penColor' in group ? group.penColor : this.penColor,
      dotSize: group && 'dotSize' in group ? group.dotSize : this.dotSize,
      minWidth: group && 'minWidth' in group ? group.minWidth : this.minWidth,
      maxWidth: group && 'maxWidth' in group ? group.maxWidth : this.maxWidth,
      velocityFilterWeight:
        group && 'velocityFilterWeight' in group
          ? group.velocityFilterWeight
          : this.velocityFilterWeight,
      compositeOperation:
        group && 'compositeOperation' in group
          ? group.compositeOperation
          : this.compositeOperation,
    };
  }

  /**
   * @description 开始绘制笔触（初始化事件监听和绘制状态）
   * @private
   * @param {ISignatureEvent} event - 签名事件对象
   * @memberof SignaturePad
   */
  private _strokeBegin(event: ISignatureEvent): void {
    const { addEventListener } = this._getListenerFunctions();
    switch (event.event.type) {
      case 'mousedown':
        addEventListener('mousemove', this._handleMouseMove, {
          passive: false,
        });
        addEventListener('mouseup', this._handleMouseUp, { passive: false });
        break;
      case 'touchstart':
        addEventListener('touchmove', this._handleTouchMove, {
          passive: false,
        });
        addEventListener('touchend', this._handleTouchEnd, { passive: false });
        break;
      case 'pointerdown':
        addEventListener('pointermove', this._handlePointerMove, {
          passive: false,
        });
        addEventListener('pointerup', this._handlePointerUp, {
          passive: false,
        });
        break;
      default:
      // do nothing
    }

    this._drawingStroke = true;

    const pointGroupOptions = this._getPointGroupOptions();

    const newPointGroup: IPointGroup = {
      ...pointGroupOptions,
      points: [],
    };

    this._data.push(newPointGroup);
    this._reset(pointGroupOptions);
    this._strokeUpdate(event);
  }

  /**
   * @description 更新绘制（处理新点并绘制曲线/点）
   * @private
   * @param {ISignatureEvent} event
   * @returns {*}  {void}
   * @memberof SignaturePad
   */
  private _strokeUpdate(event: ISignatureEvent): void {
    if (!this._drawingStroke) {
      return;
    }

    if (this._data.length === 0) {
      // 如果在签名仍在进行时调用 clear（） ，则可能会发生这种情况，
      // 或者，如果启动/更新事件之间存在争用条件。
      this._strokeBegin(event);
      return;
    }

    const point = this._createPoint(event.x, event.y, event.pressure);
    const lastPointGroup = this._data[this._data.length - 1];
    const lastPoints = lastPointGroup.points;
    const lastPoint =
      lastPoints.length > 0 && lastPoints[lastPoints.length - 1];
    const isLastPointTooClose = lastPoint
      ? point.distanceTo(lastPoint) <= this.minDistance
      : false;
    const pointGroupOptions = this._getPointGroupOptions(lastPointGroup);

    // 如果它与上一个点太近，跳过这一点
    if (!lastPoint || !(lastPoint && isLastPointTooClose)) {
      const curve = this._addPoint(point, pointGroupOptions);

      if (!lastPoint) {
        this._drawDot(point, pointGroupOptions);
      } else if (curve) {
        this._drawCurve(curve, pointGroupOptions);
      }

      lastPoints.push({
        time: point.time,
        x: point.x,
        y: point.y,
        pressure: point.pressure,
      });
    }
  }

  /**
   * @description 结束绘制笔触（清理事件监听和绘制状态）
   * @private
   * @param {ISignatureEvent} event - 签名事件对象
   * @param {boolean} [shouldUpdate=true] - 是否在结束前更新绘制
   * @returns {*}  {void}
   * @memberof SignaturePad
   */
  private _strokeEnd(event: ISignatureEvent, shouldUpdate = true): void {
    this._removeMoveUpEventListeners();

    if (!this._drawingStroke) {
      return;
    }

    if (shouldUpdate) {
      this._strokeUpdate(event);
    }

    this._drawingStroke = false;
    this._strokePointerId = undefined;
  }

  /**
   * @description 初始化指针事件处理（绑定指针按下事件）
   * @private
   * @memberof SignaturePad
   */
  private _handlePointerEvents(): void {
    this._drawingStroke = false;

    this.canvas.addEventListener('pointerdown', this._handlePointerDown, {
      passive: false,
    });
  }

  /**
   * @description 初始化鼠标事件处理（绑定鼠标按下事件）
   * @private
   * @memberof SignaturePad
   */
  private _handleMouseEvents(): void {
    this._drawingStroke = false;

    this.canvas.addEventListener('mousedown', this._handleMouseDown, {
      passive: false,
    });
  }

  /**
   * @description 初始化触摸事件处理（绑定触摸开始事件）
   * @private
   * @memberof SignaturePad
   */
  private _handleTouchEvents(): void {
    this.canvas.addEventListener('touchstart', this._handleTouchStart, {
      passive: false,
    });
  }

  /**
   * @description 重置绘制状态（清空最近点、重置速度和宽度等）
   * @private
   * @param {IPointGroupOptions} options - 点组样式配置
   * @memberof SignaturePad
   */
  private _reset(options: IPointGroupOptions): void {
    this._lastPoints = [];
    this._lastVelocity = 0;
    this._lastWidth = (options.minWidth + options.maxWidth) / 2;
    this._ctx.fillStyle = options.penColor;
    this._ctx.globalCompositeOperation = options.compositeOperation;
  }

  /**
   * @description 创建点对象（转换坐标为画布相对坐标）
   * @private
   * @param {number} x - 原始X坐标（相对于视口）
   * @param {number} y - 原始Y坐标（相对于视口）
   * @param {number} pressure - 压力值
   * @returns {*}  {Point}
   * @memberof SignaturePad
   */
  private _createPoint(x: number, y: number, pressure: number): Point {
    const rect = this.canvas.getBoundingClientRect();

    return new Point(
      x - rect.left,
      y - rect.top,
      pressure,
      new Date().getTime(),
    );
  }

  /**
   * @description 添加点到最近点列表，并在点足够时生成贝塞尔曲线
   * @private
   * @param {Point} point - 新点
   * @param {IPointGroupOptions} options - 样式配置
   * @returns {*}  {(Bezier | null)}
   * @memberof SignaturePad
   */
  private _addPoint(point: Point, options: IPointGroupOptions): Bezier | null {
    const { _lastPoints } = this;

    _lastPoints.push(point);

    if (_lastPoints.length > 2) {
      // 初始时用3个点生成曲线，通过复制第一个点到开头凑齐4个点
      if (_lastPoints.length === 3) {
        _lastPoints.unshift(_lastPoints[0]);
      }

      // 此时_lastPoints一定有4个点，用于生成曲线
      const widths = this._calculateCurveWidths(
        _lastPoints[1],
        _lastPoints[2],
        options,
      );
      const curve = Bezier.fromPoints(_lastPoints, widths);

      // 移除第一个点，保持列表最多4个点
      _lastPoints.shift();

      return curve;
    }

    return null;
  }

  /**
   * @description 计算曲线的起始和结束宽度（基于速度动态调整）
   * @private
   * @param {Point} startPoint - 曲线起点
   * @param {Point} endPoint - 曲线终点
   * @param {IPointGroupOptions} options - 样式配置
   * @returns {*}  {{ start: number; end: number }}
   * @memberof SignaturePad
   */
  private _calculateCurveWidths(
    startPoint: Point,
    endPoint: Point,
    options: IPointGroupOptions,
  ): { start: number; end: number } {
    const velocity =
      options.velocityFilterWeight * endPoint.velocityFrom(startPoint) +
      (1 - options.velocityFilterWeight) * this._lastVelocity;

    const newWidth = this._strokeWidth(velocity, options);

    const widths = {
      end: newWidth,
      start: this._lastWidth,
    };

    this._lastVelocity = velocity;
    this._lastWidth = newWidth;

    return widths;
  }

  /**
   * @description 根据速度计算线条宽度（速度越快，宽度越接近最小宽度）
   * @private
   * @param {number} velocity - 绘制速度
   * @param {IPointGroupOptions} options - 样式配置
   * @returns {*}  {number}
   * @memberof SignaturePad
   */
  private _strokeWidth(velocity: number, options: IPointGroupOptions): number {
    return Math.max(options.maxWidth / (velocity + 1), options.minWidth);
  }

  /**
   * @description 绘制曲线片段（以点为中心的圆，用于模拟线条）
   * @private
   * @param {number} x - 片段X坐标
   * @param {number} y - 片段Y坐标
   * @param {number} width - 片段宽度（圆的半径）
   * @memberof SignaturePad
   */
  private _drawCurveSegment(x: number, y: number, width: number): void {
    const ctx = this._ctx;

    ctx.moveTo(x, y);
    ctx.arc(x, y, width, 0, 2 * Math.PI, false);
    this._isEmpty = false;
    this._isRedrawn = true;
  }

  /**
   * @description 绘制贝塞尔曲线（通过分段绘制多个圆模拟平滑线条）
   * @private
   * @param {Bezier} curve - 贝塞尔曲线对象
   * @param {IPointGroupOptions} options - 样式配置
   * @memberof SignaturePad
   */
  private _drawCurve(curve: Bezier, options: IPointGroupOptions): void {
    const ctx = this._ctx;
    const widthDelta = curve.endWidth - curve.startWidth;
    // '2'是经验值，仅用长度计算会导致曲线段之间有间隙
    const drawSteps = Math.ceil(curve.length()) * 2;

    ctx.beginPath();
    ctx.fillStyle = options.penColor;

    for (let i = 0; i < drawSteps; i += 1) {
      // 计算当前步骤在曲线上的坐标
      const t = i / drawSteps;
      const tt = t * t;
      const ttt = tt * t;
      const u = 1 - t;
      const uu = u * u;
      const uuu = uu * u;

      let x = uuu * curve.startPoint.x;
      x += 3 * uu * t * curve.control1.x;
      x += 3 * u * tt * curve.control2.x;
      x += ttt * curve.endPoint.x;

      let y = uuu * curve.startPoint.y;
      y += 3 * uu * t * curve.control1.y;
      y += 3 * u * tt * curve.control2.y;
      y += ttt * curve.endPoint.y;

      const width = Math.min(
        curve.startWidth + ttt * widthDelta,
        options.maxWidth,
      );
      this._drawCurveSegment(x, y, width);
    }

    ctx.closePath();
    ctx.fill();
  }

  /**
   * @description 绘制点（用于笔触起始或单点点击）
   * @private
   * @param {IBasicPoint} point - 点对象
   * @param {IPointGroupOptions} options - 样式配置
   * @memberof SignaturePad
   */
  private _drawDot(point: IBasicPoint, options: IPointGroupOptions): void {
    const ctx = this._ctx;
    const width =
      options.dotSize > 0
        ? options.dotSize
        : (options.minWidth + options.maxWidth) / 2;

    ctx.beginPath();
    this._drawCurveSegment(point.x, point.y, width);
    ctx.closePath();
    ctx.fillStyle = options.penColor;
    ctx.fill();
  }

  /**
   * @description 从点组数据绘制签名（用于从保存的数据恢复签名）
   * @private
   * @param {IPointGroup[]} pointGroups - 点组数据数组
   * @param {Function} drawCurve - 绘制曲线的函数
   * @param {Function} drawDot - 绘制点的函数
   * @memberof SignaturePad
   */
  private _fromData(
    pointGroups: IPointGroup[],
    drawCurve: SignaturePad['_drawCurve'],
    drawDot: SignaturePad['_drawDot'],
  ): void {
    for (const group of pointGroups) {
      const { points } = group;
      const pointGroupOptions = this._getPointGroupOptions(group);

      if (points.length > 1) {
        for (let j = 0; j < points.length; j += 1) {
          const basicPoint = points[j];
          const point = new Point(
            basicPoint.x,
            basicPoint.y,
            basicPoint.pressure,
            basicPoint.time,
          );

          if (j === 0) {
            this._reset(pointGroupOptions);
          }

          const curve = this._addPoint(point, pointGroupOptions);

          if (curve) {
            drawCurve(curve, pointGroupOptions);
          }
        }
      } else {
        this._reset(pointGroupOptions);

        drawDot(points[0], pointGroupOptions);
      }
    }
  }

  /**
   * @description 返回 svg 字符串而不转换为 base64
   * @param {IToSVGOptions} [{ includeBackgroundColor = false }={}] includeBackgroundColor值为true时将背景颜色添加到 SVG 输出
   * @returns {*}  {string}
   * @memberof SignaturePad
   */
  public toSVG({ includeBackgroundColor = false }: IToSVGOptions = {}): string {
    const pointGroups = this._data;
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const minX = 0;
    const minY = 0;
    const maxX = this.canvas.width / ratio;
    const maxY = this.canvas.height / ratio;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
    svg.setAttribute('viewBox', `${minX} ${minY} ${maxX} ${maxY}`);
    svg.setAttribute('width', maxX.toString());
    svg.setAttribute('height', maxY.toString());

    if (includeBackgroundColor && this.backgroundColor) {
      const rect = document.createElement('rect');
      rect.setAttribute('width', '100%');
      rect.setAttribute('height', '100%');
      rect.setAttribute('fill', this.backgroundColor);

      svg.appendChild(rect);
    }

    this._fromData(
      pointGroups,

      (curve, { penColor }) => {
        const path = document.createElement('path');

        // 检查曲线是否有无效值（绘制不连续线条时可能出现）
        if (
          !Number.isNaN(curve.control1.x) &&
          !Number.isNaN(curve.control1.y) &&
          !Number.isNaN(curve.control2.x) &&
          !Number.isNaN(curve.control2.y)
        ) {
          const attr =
            `M ${curve.startPoint.x.toFixed(3)},${curve.startPoint.y.toFixed(
              3,
            )} ` +
            `C ${curve.control1.x.toFixed(3)},${curve.control1.y.toFixed(3)} ` +
            `${curve.control2.x.toFixed(3)},${curve.control2.y.toFixed(3)} ` +
            `${curve.endPoint.x.toFixed(3)},${curve.endPoint.y.toFixed(3)}`;
          path.setAttribute('d', attr);
          path.setAttribute('stroke-width', (curve.endWidth * 2.25).toFixed(3));
          path.setAttribute('stroke', penColor);
          path.setAttribute('fill', 'none');
          path.setAttribute('stroke-linecap', 'round');

          svg.appendChild(path);
        }
      },

      (point, { penColor, dotSize, minWidth, maxWidth }) => {
        const circle = document.createElement('circle');
        const size = dotSize > 0 ? dotSize : (minWidth + maxWidth) / 2;
        circle.setAttribute('r', size.toString());
        circle.setAttribute('cx', point.x.toString());
        circle.setAttribute('cy', point.y.toString());
        circle.setAttribute('fill', penColor);

        svg.appendChild(circle);
      },
    );

    return svg.outerHTML;
  }

  /**
   * @description 将Blob对象转换为DataURL
   * @param {Blob} blob - 要转换的Blob对象
   * @returns {*}  {Promise<string>}
   * @memberof SignaturePad
   */
  public blobToDataURL(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      // 创建FileReader实例
      const reader = new FileReader();

      // 读取完成时的回调
      reader.onload = () => {
        // result属性包含DataURL
        resolve(reader.result as string);
      };

      // 处理错误
      reader.onerror = () => {
        reject(new Error('无法转换Blob为DataURL'));
      };

      // 以DataURL格式读取Blob
      reader.readAsDataURL(blob);
    });
  }

  /**
   * @description 处理图片加载并计算加载时间（通过回调通知完成状态）
   * @param {string} imageUrl
   * @param {() => void} _callBack
   * @memberof SignaturePad
   */
  public loadImage(imageUrl: string, _callBack: () => void): void {
    const img = new Image();
    img.onload = () => _callBack();
    img.onerror = () => _callBack;

    // 开始加载图片
    img.src = imageUrl;
  }
}
