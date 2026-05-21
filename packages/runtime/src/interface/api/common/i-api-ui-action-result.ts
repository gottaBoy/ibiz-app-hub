import { IApiContext, IApiData, IApiParams } from '@ibiz-template/core';

/**
 * @description 界面行为执行返回值
 * @export
 * @interface IApiUIActionResult
 */
export interface IApiUIActionResult {
  /**
   * @description 是否刷新界面
   * @type {boolean}
   * @memberof IApiUIActionResult
   */
  refresh?: boolean;

  /**
   * @description 刷新引用视图模式，0：无、 1：引用视图或树节点、 2：引用树节点父节点、 3：引用树节点根节点，默认无刷新
   * @type {(number | 0 | 1 | 2 | 3)}
   * @memberof IApiUIActionResult
   */
  refreshMode?: number | 0 | 1 | 2 | 3;

  /**
   * @description 是否关闭界面
   * @type {boolean}
   * @memberof IApiUIActionResult
   */
  closeView?: boolean;

  /**
   * @description 是否中途取消操作
   * @type {boolean}
   * @memberof IApiUIActionResult
   */
  cancel?: boolean;

  /**
   * @description 返回的数据
   * @type {IApiData[]}
   * @memberof IApiUIActionResult
   */
  data?: IApiData[];

  /**
   * @description 后续逻辑使用的上下文参数
   * @type {IApiContext}
   * @memberof IApiUIActionResult
   */
  nextContext?: IApiContext;

  /**
   * @description 后续逻辑使用的视图参数
   * @type {IApiParams}
   * @memberof IApiUIActionResult
   */
  nextParams?: IApiParams;
}
