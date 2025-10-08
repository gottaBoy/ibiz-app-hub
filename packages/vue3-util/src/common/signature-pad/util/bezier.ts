/* eslint-disable no-empty-function */
/* eslint-disable no-useless-constructor */
import { IBasicPoint, Point } from './point';

/**
 * @description 用于创建和计算三次贝塞尔曲线，支持从点数组生成曲线实例
 * @export
 * @class Bezier
 */
export class Bezier {
  /**
   * 从点数组创建贝塞尔曲线
   * @param points 点数组，至少需要4个点来计算曲线
   * @param widths 包含起点和终点宽度的对象
   * @returns 新创建的贝塞尔曲线实例
   */
  public static fromPoints(
    points: Point[],
    widths: { start: number; end: number },
  ): Bezier {
    // 计算控制点：使用前三个点计算第二个控制点，使用后三个点计算第一个控制点
    const c2 = this.calculateControlPoints(points[0], points[1], points[2]).c2;
    const c3 = this.calculateControlPoints(points[1], points[2], points[3]).c1;

    // 创建并返回贝塞尔曲线实例
    return new Bezier(points[1], c2, c3, points[2], widths.start, widths.end);
  }

  /**
   * 计算贝塞尔曲线的控制点
   * @param s1 第一个点
   * @param s2 第二个点（中间点）
   * @param s3 第三个点
   * @returns 包含两个控制点的对象
   */
  private static calculateControlPoints(
    s1: IBasicPoint,
    s2: IBasicPoint,
    s3: IBasicPoint,
  ): {
    c1: IBasicPoint;
    c2: IBasicPoint;
  } {
    // 计算点之间的差值
    const dx1 = s1.x - s2.x;
    const dy1 = s1.y - s2.y;
    const dx2 = s2.x - s3.x;
    const dy2 = s2.y - s3.y;

    // 计算中点
    const m1 = { x: (s1.x + s2.x) / 2.0, y: (s1.y + s2.y) / 2.0 };
    const m2 = { x: (s2.x + s3.x) / 2.0, y: (s2.y + s3.y) / 2.0 };

    // 计算线段长度
    const l1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
    const l2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

    // 计算中点之间的差值
    const dxm = m1.x - m2.x;
    const dym = m1.y - m2.y;

    // 计算比例系数
    const k = l1 + l2 === 0 ? 0 : l2 / (l1 + l2);
    const cm = { x: m2.x + dxm * k, y: m2.y + dym * k };

    // 计算偏移量
    const tx = s2.x - cm.x;
    const ty = s2.y - cm.y;

    // 计算并返回控制点
    return {
      c1: new Point(m1.x + tx, m1.y + ty),
      c2: new Point(m2.x + tx, m2.y + ty),
    };
  }

  /**
   * 贝塞尔曲线构造函数
   * @param startPoint 起始点
   * @param control2 第二个控制点
   * @param control1 第一个控制点
   * @param endPoint 结束点
   * @param startWidth 起始点宽度
   * @param endWidth 结束点宽度
   */
  constructor(
    public startPoint: Point,
    public control2: IBasicPoint,
    public control1: IBasicPoint,
    public endPoint: Point,
    public startWidth: number,
    public endWidth: number,
  ) {}

  /**
   * 计算贝塞尔曲线的近似长度
   * @returns 曲线的近似长度
   */
  public length(): number {
    const steps = 10; // 分段数量，用于近似计算
    let length = 0; // 总长度
    let px: number | undefined; // 上一个点的x坐标
    let py: number | undefined; // 上一个点的y坐标

    // 分段计算曲线
    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps; // 参数t，范围从0到1

      // 计算当前t值对应的x和y坐标
      const cx = this.point(
        t,
        this.startPoint.x,
        this.control1.x,
        this.control2.x,
        this.endPoint.x,
      );
      const cy = this.point(
        t,
        this.startPoint.y,
        this.control1.y,
        this.control2.y,
        this.endPoint.y,
      );

      // 从第二个点开始计算与上一个点之间的距离，并累加到总长度
      if (i > 0) {
        const xdiff = cx - (px as number);
        const ydiff = cy - (py as number);

        length += Math.sqrt(xdiff * xdiff + ydiff * ydiff);
      }

      // 保存当前点坐标，作为下一次迭代的上一个点
      px = cx;
      py = cy;
    }

    return length;
  }

  /**
   * 计算三次贝塞尔曲线在参数t处的x或y坐标值
   * @param t 参数t，范围0到1
   * @param start 起始点的坐标值（x或y）
   * @param c1 第一个控制点的坐标值（x或y）
   * @param c2 第二个控制点的坐标值（x或y）
   * @param end 结束点的坐标值（x或y）
   * @returns 计算得到的坐标值
   */
  private point(
    t: number,
    start: number,
    c1: number,
    c2: number,
    end: number,
  ): number {
    // 三次贝塞尔曲线公式
    // prettier-ignore
    return (       start * (1.0 - t) * (1.0 - t)  * (1.0 - t))
         + (3.0 *  c1    * (1.0 - t) * (1.0 - t)  * t)
         + (3.0 *  c2    * (1.0 - t) * t          * t)
         + (       end   * t         * t          * t);
  }
}
