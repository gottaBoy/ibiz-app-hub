import { IApiData } from '@ibiz-template/core';

/**
 * @description 视图会话共享变量接口
 * @export
 * @interface IApiViewSession
 */
export interface IApiViewSession {
  /**
   * @description 当前视图作用域数据
   * @type {(IApiData | null)}
   * @default null
   * @memberof IApiViewSession
   */
  srfactiveviewdata: IApiData | null;
}
