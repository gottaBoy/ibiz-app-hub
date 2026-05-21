import { domToCanvas } from 'modern-screenshot';
import { ScreenShotStore } from './screen-shot.store';
import { IMousePosition, IBrushOption, ToolbarItemType } from '../type';
import {
  drawText,
  DrawArrow,
  drawCircle,
  drawMosaic,
  drawPencil,
  initPencil,
  drawRectangle,
} from '../module';
import { getMousePosition } from '../util';

/**
 * @description 控制器
 * @export
 * @class ScreenShotController
 */
export class ScreenShotController {
  /**
   * @description 状态对象
   * @type {ScreenShotState}
   * @memberof ScreenShotController
   */
  readonly store: ScreenShotStore;

  /**
   * @description 画笔配置
   * @private
   * @type {IBrushOption}
   * @memberof ScreenShotController
   */
  private brushOption?: IBrushOption;

  /**
   * @description 画布上下文
   * @private
   * @type {(CanvasRenderingContext2D | undefined)}
   * @memberof ScreenShotController
   */
  private canvasCtx: CanvasRenderingContext2D | undefined | null;

  /**
   * @description 绘制状态
   * @private
   * @type {boolean}
   * @memberof ScreenShotController
   */
  private drawing: boolean = false;

  /**
   * @description 最大可撤销次数
   * @private
   * @type {number}
   * @memberof ScreenShotController
   */
  private maxUndoNum: number = 15;

  /**
   * @description 文本输入框位置
   * @private
   * @type {IMousePosition}
   * @memberof ScreenShotController
   */
  private textInputInfo: IMousePosition & IBrushOption = {
    mouseX: 0,
    mouseY: 0,
    size: 14,
    color: '#F53340',
  };

  /**
   * @description 图形位置参数
   * @private
   * @type {IMousePosition}
   * @memberof ScreenShotController
   */
  private drawGraphPosition: IMousePosition = {
    mouseX: 0,
    mouseY: 0,
  };

  /**
   * @description 递增变粗箭头的实现
   * @private
   * @memberof ScreenShotController
   */
  private drawArrow = new DrawArrow();

  /**
   * @description 前进历史栈 - 存储被撤销的操作
   * @private
   * @type {Array<{ data: ImageData }>}
   * @memberof ScreenShotController
   */
  private redoHistory: Array<{ data: ImageData }> = [];

  /**
   * Creates an instance of ScreenShotController.
   * @memberof ScreenShotController
   */
  constructor() {
    this.store = new ScreenShotStore();
  }

  /**
   * @description 显示最新的画布状态
   * @private
   * @memberof ScreenShotController
   */
  private showLastHistory(): void {
    if (!this.canvasCtx) return;
    if (this.store.history.value.length <= 0) this.addHistory();
    const data =
      this.store.history.value[this.store.history.value.length - 1].data;
    this.canvasCtx.putImageData(data, 0, 0);
  }

  /**
   * @description 添加历史
   * @private
   * @memberof ScreenShotController
   */
  private addHistory(): void {
    if (!this.store.canvasElement.value || !this.canvasCtx) return;
    // 历史记录超过最大撤销次数时，删除最早的一条记录
    if (this.store.history.value.length > this.maxUndoNum)
      this.store.history.value.shift();
    const controller = this.store.canvasElement.value;
    // 保存当前画布状态
    this.store.history.value.push({
      data: this.canvasCtx.getImageData(
        0,
        0,
        controller.width,
        controller.height,
      ),
    });

    // 新增操作时清空前进栈
    this.redoHistory = [];
  }

  /**
   * @description 回退历史
   * @private
   * @memberof ScreenShotController
   */
  goBackToHistory(): void {
    if (this.store.history.value.length <= 1) return;
    // 结束文本编辑
    this.endTextEditing();
    // 弹出最后一条历史并保存到前进栈
    const poppedHistory = this.store.history.value.pop();
    if (poppedHistory) {
      this.redoHistory.push(poppedHistory);
    }
    const data =
      this.store.history.value[this.store.history.value.length - 1]?.data;
    if (this.canvasCtx && data) this.canvasCtx.putImageData(data, 0, 0);
  }

  /**
   * @description 前进历史（重做）
   * @memberof ScreenShotController
   */
  goForwardToHistory(): void {
    // 前进栈为空时直接返回
    if (!this.redoHistory.length) return;
    // 结束文本编辑
    this.endTextEditing();
    // 从前进栈弹出最后一条记录
    const forwardHistory = this.redoHistory.pop();
    if (!forwardHistory || !this.canvasCtx) return;

    // 将前进记录添加回撤销栈
    this.store.history.value.push(forwardHistory);
    // 恢复画布状态
    this.canvasCtx.putImageData(forwardHistory.data, 0, 0);
  }

  /**
   * @description 启用文本编辑
   * @private
   * @param {number} X
   * @param {number} Y
   * @returns {*}  {void}
   * @memberof ScreenShotController
   */
  private enableTextEditing(event: MouseEvent): void {
    const element = this.store.textInputElement.value;
    if (!this.canvasCtx || !element || !this.brushOption) return;
    this.showLastHistory();
    this.store.textStatus.value = true;
    const { clientX, clientY } = event;
    const { mouseX, mouseY, size, color } = this.textInputInfo;
    const position = getMousePosition(event);
    if (
      element.innerText &&
      mouseX !== 0 &&
      mouseY !== 0 &&
      mouseX !== position.mouseX &&
      mouseY !== position.mouseY
    ) {
      drawText(
        element.innerText,
        this.textInputInfo.mouseX,
        this.textInputInfo.mouseY,
        color,
        size,
        this.canvasCtx,
      );
      element.innerText = '';
      this.addHistory();
    }

    element.style.fontFamily = 'none';
    element.style.left = `${clientX}px`;
    element.style.fontSize = `${this.brushOption.size}px`;
    element.style.color = this.brushOption.color;

    setTimeout(() => {
      // 获取输入框容器的高度
      const containerHeight = element.offsetHeight;
      // 输入框容器y轴的位置需要在坐标的基础上再加上容器高度的一半，容器的位置就正好居中于光标
      // canvas渲染的时候就不会出现位置不一致的问题了
      element.style.top = `${clientY - Math.floor(containerHeight / 2)}px`;
      // 获取焦点
      element.focus();
      // 记录当前输入框位置
      this.textInputInfo = {
        mouseX: position.mouseX,
        mouseY: position.mouseY,
        size: this.brushOption!.size,
        color: this.brushOption!.color,
      };
    });
  }

  /**
   * @description 结束文本编辑
   * @private
   * @returns {*}  {void}
   * @memberof ScreenShotController
   */
  private endTextEditing(): void {
    const element = this.store.textInputElement.value;
    if (!element || !this.canvasCtx) return;
    if (element.innerText) {
      const { mouseX, mouseY, size, color } = this.textInputInfo;
      drawText(element.innerText, mouseX, mouseY, color, size, this.canvasCtx);
      // 添加历史记录
      this.addHistory();
    }
    element.innerHTML = '';
    this.store.textStatus.value = false;
  }

  /**
   * @description DOM生成Canvas
   * @param {HTMLElement} el DOM元素
   * @param {{ container?: HTMLElement; itemClassName?: string }} opts 如果需针对dom内部滚动容器截图，则需配置：滚动容器，滚动容器项类名，用以排除非可视区元素
   * @returns {*}  {Promise<void>}
   * @memberof ScreenShotController
   */
  async domToCanvas(
    el: HTMLElement,
    opts: { container?: HTMLElement; itemClassName?: string },
  ): Promise<void> {
    this.store.isLoading.value = true;
    const { container, itemClassName } = opts;
    // 滚动容器 Rect
    const containerRect = container?.getBoundingClientRect();
    // 生成 canvas
    const canvas = await domToCanvas(el, {
      scale: window.devicePixelRatio || 1,
      quality: 1,
      filter: node => {
        if (containerRect && itemClassName) {
          const element = node as HTMLElement;
          // 项是否在指定容器内，在指定容器可视区域的才绘制
          if (
            container?.contains(element) &&
            element.classList?.contains(itemClassName)
          ) {
            const elementRect = element.getBoundingClientRect?.();
            if (elementRect)
              return (
                elementRect.bottom > containerRect.top &&
                elementRect.top < containerRect.bottom &&
                elementRect.right > containerRect.left &&
                elementRect.left < containerRect.right
              );
          }
        }
        return true;
      },
    });
    this.canvasCtx = this.store.canvasElement.value?.getContext('2d');
    if (this.canvasCtx) {
      this.store.canvasElement.value!.width = canvas.width;
      this.store.canvasElement.value!.height = canvas.height;
      this.store.canvasElement.value!.style.top = `${el.offsetTop}px`;
      this.store.canvasElement.value!.style.left = `${el.offsetLeft}px`;
      this.canvasCtx.drawImage(canvas, 0, 0);
    }
    this.store.isLoading.value = false;
    this.store.toolbarStatus.value = true;
  }

  /**
   * @description 工具点击
   * @param {ToolbarItemType} toolName
   * @param {IBrushOption} opt
   * @memberof ScreenShotController
   */
  onToolClick(toolName: ToolbarItemType, opt: IBrushOption): void {
    if (toolName === ToolbarItemType.DRAWDOWN) this.goBackToHistory();
    this.brushOption = opt;
    this.store.toolbarName.value = toolName;
    this.endTextEditing();
  }

  /**
   * @description 鼠标按下
   * @param {MouseEvent} event
   * @memberof ScreenShotController
   */
  mouseDownEvent(event: MouseEvent): void {
    // 非鼠标左键按下则终止或者没有激活工具和无画布时
    if (
      event.button !== 0 ||
      !this.store.toolbarName.value ||
      this.store.toolbarName.value === ToolbarItemType.DRAWDOWN ||
      !this.canvasCtx
    )
      return;
    this.drawing = true;
    const { mouseX, mouseY } = getMousePosition(event);
    Object.assign(this.drawGraphPosition, {
      mouseX,
      mouseY,
    });
    switch (this.store.toolbarName.value) {
      case ToolbarItemType.BRUSH:
        initPencil(this.canvasCtx, mouseX, mouseY);
        break;
      case ToolbarItemType.TEXT:
        this.enableTextEditing(event);
        break;
      default:
        break;
    }
  }

  /**
   * @description 鼠标移动
   * @param {MouseEvent} event
   * @returns {*}  {void}
   * @memberof ScreenShotController
   */
  mouseMoveEvent(event: MouseEvent): void {
    if (
      !this.store.toolbarName.value ||
      !this.drawing ||
      !this.canvasCtx ||
      !this.brushOption
    )
      return;
    const { mouseX, mouseY } = getMousePosition(event);
    const { mouseX: startX, mouseY: startY } = this.drawGraphPosition;
    // 当前操作的不是马赛克则显示最后一次画布绘制时的状态
    if (this.store.toolbarName.value !== ToolbarItemType.MOSAIC)
      this.showLastHistory();
    switch (this.store.toolbarName.value) {
      case ToolbarItemType.BRUSH:
        drawPencil(
          this.canvasCtx,
          mouseX,
          mouseY,
          this.brushOption.size,
          this.brushOption.color,
        );
        break;
      case ToolbarItemType.RECT:
        drawRectangle(
          startX,
          startY,
          mouseX - startX,
          mouseY - startY,
          this.brushOption.color,
          this.brushOption.size,
          this.canvasCtx,
        );
        break;
      case ToolbarItemType.CIRCLE:
        drawCircle(
          this.canvasCtx,
          mouseX,
          mouseY,
          startX,
          startY,
          this.brushOption.size,
          this.brushOption.color,
        );
        break;
      case ToolbarItemType.ARROW:
        this.drawArrow.draw(
          this.canvasCtx,
          startX,
          startY,
          mouseX,
          mouseY,
          this.brushOption.color,
        );
        break;
      case ToolbarItemType.MOSAIC:
        drawMosaic(
          mouseX - 10,
          mouseY - 10,
          this.brushOption.size,
          5,
          this.canvasCtx,
        );
        break;
      default:
        break;
    }
  }

  /**
   * @description 鼠标抬起
   * @returns {*}  {void}
   * @memberof ScreenShotController
   */
  mouseUpEvent(): void {
    this.drawing = false;
    if (
      !this.store.toolbarName.value ||
      this.store.toolbarName.value === ToolbarItemType.DRAWDOWN ||
      this.store.toolbarName.value === ToolbarItemType.TEXT ||
      !this.canvasCtx
    )
      return;

    this.addHistory();
  }
}
