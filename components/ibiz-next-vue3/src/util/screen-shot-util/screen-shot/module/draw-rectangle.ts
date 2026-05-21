/**
 * @description 绘制矩形
 * @export
 * @param {number} mouseX
 * @param {number} mouseY
 * @param {number} width
 * @param {number} height
 * @param {string} color 边框颜色
 * @param {number} borderWidth 边框大小
 * @param {CanvasRenderingContext2D} context 需要进行绘制的canvas画布
 */
export function drawRectangle(
  mouseX: number,
  mouseY: number,
  width: number,
  height: number,
  color: string,
  borderWidth: number,
  context: CanvasRenderingContext2D,
): void {
  context.save();
  // 设置边框颜色
  context.strokeStyle = color;
  // 设置边框大小
  context.lineWidth = borderWidth;
  context.beginPath();
  // 绘制矩形
  context.rect(mouseX, mouseY, width, height);
  context.stroke();
  // 绘制结束
  context.restore();
}
