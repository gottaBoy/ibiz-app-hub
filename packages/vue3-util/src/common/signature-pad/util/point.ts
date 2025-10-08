/**
 * @description 基础点接口，定义了点的基本属性
 * @export
 * @interface IBasicPoint
 */
export interface IBasicPoint {
  /** X坐标 */
  x: number;
  /** Y坐标 */
  y: number;
  /** 压力值（例如绘画时的笔触压力） */
  pressure: number;
  /** 时间戳（记录点创建的时间） */
  time: number;
}

/**
 * @description 点类，实现了BasicPoint接口，提供了点的常用操作方法
 * @export
 * @class Point
 * @implements {IBasicPoint}
 */
export class Point implements IBasicPoint {
  // X坐标
  public x: number;

  // Y坐标
  public y: number;

  // 压力值
  public pressure: number;

  // 时间戳
  public time: number;

  /**
   * 构造函数，创建一个Point实例
   * @param x X坐标
   * @param y Y坐标
   * @param pressure 压力值，可选，默认为0
   * @param time 时间戳，可选，默认为当前时间
   * @throws 如果x或y是NaN，抛出错误
   */
  constructor(x: number, y: number, pressure?: number, time?: number) {
    // 检查坐标是否有效
    if (Number.isNaN(x) || Number.isNaN(y)) {
      throw new Error(
        ibiz.i18n.t('vue3Util.common.invalidPointCoordinates', {
          x,
          y,
        }),
      );
    }
    // 确保转换为数字类型
    this.x = +x;
    this.y = +y;
    this.pressure = pressure || 0;
    this.time = time || Date.now();
  }

  /**
   * 计算当前点到另一个点的直线距离
   * @param start 起始点（另一个点）
   * @returns 两点之间的距离
   */
  public distanceTo(start: IBasicPoint): number {
    // 使用勾股定理计算距离
    return Math.sqrt((this.x - start.x) ** 2 + (this.y - start.y) ** 2);
  }

  /**
   * 判断当前点是否与另一个点相等
   * @param other 要比较的另一个点
   * @returns 如果所有属性都相等则返回true，否则返回false
   */
  public equals(other: IBasicPoint): boolean {
    return (
      this.x === other.x &&
      this.y === other.y &&
      this.pressure === other.pressure &&
      this.time === other.time
    );
  }

  /**
   * 计算从起始点到当前点的移动速度
   * @param start 起始点
   * @returns 速度值（距离/时间），如果时间相同则返回0
   */
  public velocityFrom(start: IBasicPoint): number {
    // 避免除以零，如果时间相同则速度为0
    return this.time !== start.time
      ? this.distanceTo(start) / (this.time - start.time)
      : 0;
  }
}
