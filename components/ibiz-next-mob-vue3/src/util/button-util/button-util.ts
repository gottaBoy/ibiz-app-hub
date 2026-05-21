import { Namespace } from '@ibiz-template/core';

/**
 * 转换按钮类型
 *
 * @export
 * @param {string} [buttonStyle]
 * @return {*}  {string}
 */
export function convertBtnType(detail: IData): string {
  const { buttonStyle, actionLevel } = detail;
  let buttonType = 'default';
  if (buttonStyle) buttonType = buttonStyle.toLowerCase();
  // 样式2为主要色
  if (buttonStyle === 'STYLE2') {
    buttonType = 'primary';
  }
  // 样式3为反向色
  if (buttonStyle === 'STYLE3') {
    buttonType = 'inverse';
  }
  // 样式4为危险色
  if (buttonStyle === 'STYLE4') {
    buttonType = 'danger';
  }
  // 关键操作
  if (actionLevel === 250) {
    buttonType = 'danger';
  }
  // 常用操作
  if (actionLevel === 200) {
    buttonType = 'primary';
  }
  // 不常用操作
  if (actionLevel === 50) {
    buttonType = 'inverse';
  }
  return buttonType;
}

/**
 * @description 在指定容器中创建临时DOM元素，计算并返回其ClientRectList
 * @param {Namespace} ns css 命名空间
 * @param {IParams} style 临时元素的自定义样式（会覆盖默认样式）
 * @returns {*} 临时元素的DOMRectList
 */
export function getTempDomRect(ns: Namespace, style = {}): DOMRect {
  const dom = document.createElement('div');
  dom.classList.add(ns.b());
  Object.assign(dom.style, {
    position: 'absolute',
    left: '-9999px',
    width: `var(${ns.cssVarBlockName('width-van-button')})`,
    height: `var(${ns.cssVarBlockName('height-van-button')})`,
    ...style,
  });
  document.body.appendChild(dom);
  const domRectList = dom.getBoundingClientRect();
  document.body.removeChild(dom);
  return domRectList;
}

/**
 * @description 计算气泡的弹出位置
 * @param {Namespace} ns css 命名空间
 * @param {HTMLElement} curDom 当前点击的临时元素
 * @param {number} listNum 列表数量，用于模拟计算出绘制后的整体高度
 * @param {('horizontal' | 'vertical')} [direction='horizontal'] 列表的排列方向
 * @return {*}  {string} 弹出位置
 */
export function calcPopoverPlacement(
  ns: Namespace,
  curDom: HTMLElement,
  listNum: number,
  direction: 'horizontal' | 'vertical' = 'horizontal',
  style = {},
): string {
  if (!curDom) return direction === 'horizontal' ? 'right' : 'bottom';
  const { innerWidth, innerHeight } = window;
  const rect = getTempDomRect(ns, style);

  const { x, y, width } = curDom.getBoundingClientRect();
  const centerX = innerWidth - width - rect.width;
  const centerY = listNum
    ? innerHeight - listNum * rect.height
    : innerHeight / 2;
  if (y > centerY) {
    if (direction === 'horizontal')
      return x > centerX ? 'left-end' : 'right-end';
    return x > centerX ? 'top-end' : 'top-start';
  }
  if (direction === 'horizontal')
    return x > centerX ? 'left-start' : 'right-start';
  return x > centerX ? 'bottom-end' : 'bottom-start';
}
