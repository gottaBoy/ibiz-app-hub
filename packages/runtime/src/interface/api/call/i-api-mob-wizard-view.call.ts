import { IApiViewCall } from './i-api-view.call';

/**
 * @description 移动端向导视图能力
 * @export
 * @interface IApiMobWizardViewCall
 * @extends {IApiViewCall}
 */
export interface IApiMobWizardViewCall extends IApiViewCall {
  /**
   * @description 视图刷新
   * @type {{
   *     args: undefined;
   *   }}
   * @memberof IApiMobWizardViewCall
   */
  Refresh: {
    args: undefined;
  };
}
