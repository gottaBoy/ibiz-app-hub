/* eslint-disable no-param-reassign */
import { EditorController } from '@ibiz-template/runtime';
import { ISlider } from '@ibiz/model-core';
import { toNumber } from 'lodash-es';
import { useNamespace } from '@ibiz-template/vue3-util';
import Wave from './wave';
import { fade } from '../util';
import { dataViewT } from '../locale';

/**
 * 水位图控制器
 *
 * @export
 * @class WaterLevelPondController
 * @extends {EditorController}
 */
export class WaterLevelPondController extends EditorController<ISlider> {
  /**
   * @description canvas对象
   * @type {HTMLCanvasElement}
   * @memberof WaterLevelPondController
   */
  public canvas!: HTMLCanvasElement;

  /**
   * @description canvas宽度
   * @type {number}
   * @memberof WaterLevelPondController
   */
  public canvasWidth: number = 0;

  /**
   * @description canvas高度
   * @type {number}
   * @memberof WaterLevelPondController
   */
  public canvasHeight: number = 0;

  /**
   * @description 当前范围
   * @type {number}
   * @memberof WaterLevelPondController
   */
  public nowRange: number = 0;

  /**
   * @description 当前范围值
   * @type {number}
   * @memberof WaterLevelPondController
   */
  public rangeValue: number = 0;

  /**
   * @description 波浪对象
   * @type {(Wave | null)}
   * @memberof WaterLevelPondController
   */
  public wave: Wave | null = null;

  /**
   * @description 动画id
   * @type {number}
   * @memberof WaterLevelPondController
   */
  public requestID: number = 0;

  /**
   * @description 形状
   * @type {string}
   * @memberof WaterLevelPondController
   */
  public shape: string = 'circle';

  /**
   * @description 波浪数量
   * @type {number}
   * @memberof WaterLevelPondController
   */
  public waveNum: number = 3;

  /**
   * @description 波浪宽度
   * @type {number}
   * @memberof WaterLevelPondController
   */
  public waveWidth: number = 5;

  /**
   * @description 波浪高度
   * @type {number}
   * @memberof WaterLevelPondController
   */
  public waveHeight: number = 6;

  /**
   * @description 波浪透明度
   * @type {number}
   * @memberof WaterLevelPondController
   */
  public waveOpacity: number = 40;

  /**
   * @description 动画速度
   * @type {number}
   * @memberof WaterLevelPondController
   */
  public speed: number = 4;

  /**
   * @description 最大值项名称
   * @type {string}
   * @memberof WaterLevelPondController
   */
  public maxItem: string = '';

  /**
   * @description 样式名
   * @memberof WaterLevelPondController
   */
  public ns = useNamespace('water-level-pond');

  protected async onInit(): Promise<void> {
    super.onInit();
    if (this.model.precision) {
      ibiz.log.warn(dataViewT('warnings.unsupportedPrecision'));
    }
    const {
      SHAPE,
      WAVENUM,
      WAVEWIDTH,
      WAVEHEIGHT,
      WAVEOPACITY,
      SPEED,
      MAXITEM,
    } = this.editorParams;
    if (SHAPE) {
      this.shape = SHAPE;
    }
    if (WAVENUM) {
      this.waveNum = toNumber(WAVENUM);
    }
    if (WAVEWIDTH) {
      this.waveWidth = toNumber(WAVEWIDTH);
    }
    if (WAVEHEIGHT) {
      this.waveHeight = toNumber(WAVEHEIGHT);
    }
    if (WAVEOPACITY) {
      this.waveOpacity = toNumber(WAVEOPACITY);
    }
    if (SPEED) {
      this.speed = toNumber(SPEED);
    }
    if (MAXITEM) {
      this.maxItem = MAXITEM;
    }
  }

  /**
   * @description 绘制canvas
   * @param {HTMLCanvasElement} canvas
   * @memberof WaterLevelPondController
   */
  public drawCanvas(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.canvasWidth = canvas.scrollWidth;
    this.canvasHeight = canvas.offsetHeight;
    canvas.height = this.canvasHeight;
    canvas.width = this.canvasWidth;
    // 高清适配
    this.calcScale(canvas);
    this.nowRange = 0;
    const primaryColor = this.getThemeVar(this.ns.cssVarName('color-primary'));
    const color = fade(primaryColor, this.waveOpacity);
    this.wave = new Wave({
      canvasWidth: this.canvasWidth, // 轴长
      canvasHeight: this.canvasHeight, // 轴高
      waveWidth: this.waveWidth, // 波浪宽度,数越小越宽
      waveHeight: this.waveHeight, // 波浪高度,数越大越高
      color, // 波浪颜色
      xOffset: 0, // 初始偏移
      speed: this.speed, // 速度
    });
    this.startDraw(canvas);
  }

  /**
   * @description 开始绘制
   * @param {HTMLCanvasElement} canvas
   * @memberof WaterLevelPondController
   */
  startDraw(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
    this.drawContainer(ctx);
    if (this.nowRange <= this.rangeValue) {
      this.nowRange += 1;
    }
    if (this.nowRange > this.rangeValue) {
      this.nowRange -= 1;
    }
    this.wave!.update({
      nowRange: this.nowRange,
    });
    this.wave!.draw(ctx);
    this.requestID = window.requestAnimationFrame(() => this.startDraw(canvas));
  }

  /**
   * @description 取消动画
   * @memberof WaterLevelPondController
   */
  cancelAnimation() {
    window.cancelAnimationFrame(this.requestID);
  }

  /**
   * @description 刷新
   * @memberof WaterLevelPondController
   */
  refresh() {
    this.canvasWidth = this.canvas.offsetWidth;
    this.canvasHeight = this.canvas.offsetHeight;
    this.canvas.height = this.canvasHeight;
    this.canvas.width = this.canvasWidth;
    if (this.wave) {
      this.wave.canvasHeight = this.canvasHeight;
      this.wave.canvasWidth = this.canvasWidth;
    }
  }

  /**
   * @description 绘制容器
   * @param {CanvasRenderingContext2D} ctx
   * @memberof WaterLevelPondController
   */
  drawContainer(ctx: CanvasRenderingContext2D) {
    const shape = this.shape;
    if (shape === 'circle') {
      this.drawCircle(ctx);
    } else if (shape === 'rect') {
      this.drawRect(ctx);
    }
  }

  /**
   * @description 绘制圆
   * @param {CanvasRenderingContext2D} ctx
   * @memberof WaterLevelPondController
   */
  drawCircle(ctx: CanvasRenderingContext2D) {
    const size = Math.min(this.canvasHeight, this.canvasWidth);
    const r = size / 2;
    const lineWidth = 4;
    const cR = r - lineWidth;
    const borderColor = this.getThemeVar(this.ns.cssVarName('color-border'));
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.arc(this.canvasWidth / 2, this.canvasHeight / 2, cR, 0, 2 * Math.PI);
    ctx.strokeStyle = borderColor;
    ctx.stroke();
    ctx.clip();
  }

  /**
   * @description 绘制矩形
   * @param {CanvasRenderingContext2D} ctx
   * @memberof WaterLevelPondController
   */
  drawRect(ctx: CanvasRenderingContext2D) {
    const padding = 10;
    ctx.beginPath();
    ctx.rect(
      padding,
      padding,
      this.canvasWidth - 2 * padding,
      this.canvasHeight - 2 * padding,
    );
    const borderColor = this.getThemeVar(this.ns.cssVarName('color-border'));
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    ctx.closePath();
    ctx.stroke();
    ctx.clip();
  }

  /**
   * @description 计算缩放
   * @param {IData} canvas
   * @memberof WaterLevelPondController
   */
  calcScale(canvas: IData) {
    const ctx = canvas.getContext('2d') as IData;
    const devicePixelRatio = window.devicePixelRatio || 1;
    const backingStorePixelRatio =
      ctx.webkitBackingStorePixelRatio ||
      ctx.mozBackingStorePixelRatio ||
      ctx.msBackingStorePixelRatio ||
      ctx.oBackingStorePixelRatio ||
      ctx.backingStorePixelRatio ||
      1;
    const ratio = devicePixelRatio / backingStorePixelRatio;
    if (devicePixelRatio !== backingStorePixelRatio) {
      const oldWidth = canvas.width;
      const oldHeight = canvas.height;

      canvas.width = oldWidth * ratio;
      canvas.height = oldHeight * ratio;

      canvas.style.width = `${oldWidth}px`;
      canvas.style.height = `${oldHeight}px`;
      ctx.scale(ratio, ratio);
    }
  }

  /**
   * @description 获取主题色
   * @param {string} name
   * @memberof WaterLevelPondController
   */
  public getThemeVar = (name: string) => {
    const style = getComputedStyle(this.canvas);
    const primary = style.getPropertyValue(name);
    return primary;
  };

  /**
   * @description 设置值
   * @param {number} value
   * @memberof WaterLevelPondController
   */
  public setDate(value: number) {
    this.rangeValue = value * 100;
  }
}
