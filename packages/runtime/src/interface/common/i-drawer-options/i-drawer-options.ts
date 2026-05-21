export interface IDrawerOptions {
  /**
   * 抽屉宽度
   * 左、右方向时可用。0-100的时候算百分比，100以上算像素px
   *
   * @author lxm
   * @date 2022-09-12 20:09:20
   * @type {number}
   */
  width?: number;
  /**
   * 抽屉高度
   * 上、下方向时可用。0-100的时候算百分比，100以上算像素px
   *
   * @author lxm
   * @date 2022-09-12 20:09:22
   * @type {number}
   */
  height?: number;
  /**
   * 抽屉的方向
   *
   * @author lxm
   * @date 2022-09-15 14:09:13
   * @type {('left' | 'right' | 'top' | 'bottom')}
   */
  placement?: 'left' | 'right' | 'top' | 'bottom';
  /**
   * @description 抽屉的透传属性配置
   * @type {IParams}
   * @memberof IDrawerOptions
   */
  attrs?: IParams;
}
