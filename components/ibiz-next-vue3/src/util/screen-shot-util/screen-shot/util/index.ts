/**
 * @description 获取鼠标位置
 * @export
 * @param {MouseEvent} event
 * @returns {*}  {{
 *   mouseX: number;
 *   mouseY: number;
 * }}
 */
export function getMousePosition(event: MouseEvent): {
  mouseX: number;
  mouseY: number;
} {
  const mouseX = event.offsetX > 0 ? event.offsetX : 0;
  const mouseY = event.offsetY > 0 ? event.offsetY : 0;
  return { mouseX, mouseY };
}
