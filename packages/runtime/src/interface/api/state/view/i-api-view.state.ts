import { IApiControllerState } from '../common/i-api-controller.state';
import { IApiViewSession } from './i-api-view-session';
/**
 * @description 视图UI状态
 * @export
 * @interface IApiViewState
 * @extends {IApiControllerState}
 * @extends {IApiViewSession}
 * @primary
 */
export interface IApiViewState extends IApiControllerState, IApiViewSession {
  /**
   * @description 当前视图是否为激活状态(缓存下的激活状态，一般与框架的生命周期相同)
   * @type {boolean}
   * @default true
   * @memberof IApiViewState
   */
  activated: boolean;

  /**
   * @description 视图标题
   * @type {string}
   * @memberof IApiViewState
   */
  caption: string;

  /**
   * @description 视图是否正在加载
   * @type {boolean}
   * @default false
   * @memberof IApiViewState
   */
  isLoading: boolean;

  /**
   * @description 视图加载时的提示文本
   * @type {string}
   * @memberof IApiViewState
   */
  loadingText: string;

  /**
   * @description 默认不加载
   * @type {boolean}
   * @memberof IApiViewState
   */
  noLoadDefault: boolean;

  /**
   * @description 当前视图是否出现错误
   * @type {boolean}
   * @default false
   * @memberof IApiViewState
   */
  hasError: boolean;

  /**
   * @description 关闭视图时返回给外面的状态
   * @type {boolean}
   * @memberof IApiViewState
   */
  closeOK?: boolean;

  /**
   * @description 视图正在关闭（用于阻止一些视图关闭后仍在继续的逻辑，比如表单保存时的通知）
   * @type {boolean}
   * @default false
   * @memberof IApiViewState
   */
  isClosing: boolean;
}
