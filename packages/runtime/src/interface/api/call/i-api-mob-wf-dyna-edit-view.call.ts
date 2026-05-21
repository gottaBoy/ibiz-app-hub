import { IApiMobEditViewCall } from './i-api-mob-edit-view.call';

/**
 * @description 实体移动端工作流动态编辑视图能力
 * @export
 * @interface IApiMobWFDynaEditViewCall
 * @extends {IApiMobEditViewCall}
 */
export interface IApiMobWFDynaEditViewCall extends IApiMobEditViewCall {
  /**
   * @description 工作流启动，id：工作流按钮标识
   * @type {{
   *     args: { id: string };
   *   }}
   * @memberof IApiMobWFDynaEditViewCall
   */
  WFAction: {
    args: { id: string };
  };
}
