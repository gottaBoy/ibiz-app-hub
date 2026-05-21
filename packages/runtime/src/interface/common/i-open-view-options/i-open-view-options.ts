import { CTX } from '../../../controller';

/**
 * 打开视图额外参数
 * @author lxm
 * @date 2023-08-14 11:46:55
 * @export
 * @interface IOpenViewOptions
 */
export interface IOpenViewOptions {
  /**
   * 打开方式
   * @author lxm
   * @date 2023-08-14 01:40:27
   * @type {string}
   */
  openMode?: string;

  /**
   * 不等待路由打开
   * @author lxm
   * @date 2023-07-28 02:23:13
   * @type {boolean}
   */
  noWaitRoute?: boolean;

  /**
   * 数据集合
   * @author lxm
   * @date 2023-08-14 01:40:14
   * @type {IData[]}
   */
  data?: IData[];

  /**
   * 原生js事件
   * @author lxm
   * @date 2023-08-14 04:22:06
   * @type {MouseEvent}
   */
  event?: MouseEvent;

  /**
   * 模态参数
   *
   * @author zk
   * @date 2024-02-01 02:02:21
   * @type {IData}
   * @memberof IOpenViewOptions
   */
  modalOption?: IData;

  /**
   * 上下文环境对象
   *
   * @author tony001
   * @date 2025-03-24 17:03:53
   * @type {CTX}
   */
  ctx?: CTX;

  /**
   * @description 父视图数据
   * @type {IData[]}
   * @memberof IOpenViewOptions
   */
  parentData?: IData[];
}
