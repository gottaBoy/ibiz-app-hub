/**
 * @description 绘制文本
 * @export
 * @param {string} text
 * @param {number} mouseX
 * @param {number} mouseY
 * @param {string} color
 * @param {number} fontSize
 * @param {CanvasRenderingContext2D} context
 */
export function drawText(
  text: string,
  mouseX: number,
  mouseY: number,
  color: string,
  fontSize: number,
  context: CanvasRenderingContext2D,
): void {
  // 开始绘制
  context.save();
  context.lineWidth = 1;
  // 设置字体颜色
  context.fillStyle = color;
  context.textBaseline = 'middle';
  context.font = `bold ${fontSize}px none`;
  context.fillText(text, mouseX, mouseY);
  // 结束绘制
  context.restore();
}
