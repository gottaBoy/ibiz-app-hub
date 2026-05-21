import { IApiContext, IApiData, IApiParams } from '@ibiz-template/core';
import { IApiViewCall } from './i-api-view.call';

/**
 * @description 实体多数据自定义视图能力
 * @export
 * @interface IApiMDCustomViewCall
 * @extends {IApiViewCall}
 */
export interface IApiMDCustomViewCall extends IApiViewCall {
  /**
   * @description 视图刷新
   * @type {{
   *     args: undefined;
   *   }}
   * @memberof IApiMDCustomViewCall
   */
  Refresh: {
    args: undefined;
  };
  /**
   * @description 打开编辑数据视图，data: 实体数据，event: 鼠标事件，context: 上下文参数，params: 视图参数
   * @type {{
   *     args: {
   *       data: IApiData[];
   *       event?: MouseEvent;
   *       context?: IApiContext;
   *       params?: IApiParams;
   *     };
   *   }}
   * @memberof IApiMDCustomViewCall
   */
  Edit: {
    args: {
      data: IApiData[];
      event?: MouseEvent;
      context?: IApiContext;
      params?: IApiParams;
    };
  };
  /**
   * @description 查看，data: 实体数据，event: 鼠标事件，context: 上下文参数，params: 视图参数
   * @type {{
   *     args: {
   *       data: IApiData[];
   *       event?: MouseEvent;
   *       context?: IApiContext;
   *       params?: IApiParams;
   *     };
   *   }}
   * @memberof IApiMDCustomViewCall
   */
  View: {
    args: {
      data: IApiData[];
      event?: MouseEvent;
      context?: IApiContext;
      params?: IApiParams;
    };
  };
  /**
   * @description 打开新建数据视图，data: 实体数据，event: 鼠标事件，copyMode: 是否是拷贝模式
   * @type {{
   *     args: {
   *       data: IApiData[];
   *       event?: MouseEvent;
   *       copyMode?: boolean;
   *     };
   *   }}
   * @memberof IApiMDCustomViewCall
   */
  New: {
    args: {
      data: IApiData[];
      event?: MouseEvent;
      copyMode?: boolean;
    };
  };
}
