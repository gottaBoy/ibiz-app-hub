/**
 * @description 绘制圆形
 * @export
 * @param {CanvasRenderingContext2D} context 需要进行绘制的画布
 * @param {number} mouseX 当前鼠标x轴坐标
 * @param {number} mouseY 当前鼠标y轴坐标
 * @param {number} mouseStartX 鼠标按下时的x轴坐标
 * @param {number} mouseStartY 鼠标按下时的y轴坐标
 * @param {number} borderWidth 边框宽度
 * @param {string} color 边框颜色
 */
export function drawCircle(
  context: CanvasRenderingContext2D,
  mouseX: number,
  mouseY: number,
  mouseStartX: number,
  mouseStartY: number,
  borderWidth: number,
  color: string,
): void {
  // 坐标边界处理，解决反向绘制椭圆时的报错问题
  const startX = mouseX < mouseStartX ? mouseX : mouseStartX;
  const startY = mouseY < mouseStartY ? mouseY : mouseStartY;
  const endX = mouseX >= mouseStartX ? mouseX : mouseStartX;
  const endY = mouseY >= mouseStartY ? mouseY : mouseStartY;
  // 计算圆的半径
  const radiusX = (endX - startX) * 0.5;
  const radiusY = (endY - startY) * 0.5;
  // 计算圆心的x、y坐标
  const centerX = startX + radiusX;
  const centerY = startY + radiusY;
  // 开始绘制
  context.save();
  context.beginPath();
  context.lineWidth = borderWidth;
  context.strokeStyle = color;

  if (typeof context.ellipse === 'function') {
    // 绘制圆，旋转角度与起始角度都为0，结束角度为2*PI
    context.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
  } else {
    throw new Error('你的浏览器不支持ellipse，无法绘制椭圆');
  }
  context.stroke();
  context.closePath();
  // 结束绘制
  context.restore();
}
