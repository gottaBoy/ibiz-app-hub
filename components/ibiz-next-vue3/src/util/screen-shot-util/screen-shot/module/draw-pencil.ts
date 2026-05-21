/**
 * @description 初始化画笔
 * @export
 * @param {CanvasRenderingContext2D} context
 * @param {number} mouseX
 * @param {number} mouseY
 */
export function initPencil(
  context: CanvasRenderingContext2D,
  mouseX: number,
  mouseY: number,
): void {
  // 开始||清空一条路径
  context.beginPath();
  // 移动画笔位置
  context.moveTo(mouseX, mouseY);
}

/**
 * @description 绘制画笔
 * @export
 * @param {CanvasRenderingContext2D} context
 * @param {number} mouseX
 * @param {number} mouseY
 * @param {number} size
 * @param {string} color
 */
export function drawPencil(
  context: CanvasRenderingContext2D,
  mouseX: number,
  mouseY: number,
  size: number,
  color: string,
): void {
  // 开始绘制
  context.save();
  // 设置边框大小
  context.lineWidth = size;
  // 设置边框颜色
  context.strokeStyle = color;
  context.lineTo(mouseX, mouseY);
  context.stroke();
  // 绘制结束
  context.restore();
}
