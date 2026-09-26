import { IApiMaskOption } from '../../controller';
import { IApiControllerState } from '../common/i-api-controller.state';

/**
 * @primary
 * @description 部件UI状态接口
 * @export
 * @interface IApiControlState
 * @extends {IApiControllerState}
 */
export interface IApiControlState extends IApiControllerState {
  /**
   * @description popover层级
   * @type {number}
   * @memberof IApiControlState
   */
  zIndex?: number;
  /**
   * @description 当前部件是否为激活状态(缓存下的激活状态，一般与框架的生命周期相同)
   * @type {boolean}
   * @default false
   * @memberof IApiControlState
   */
  activated: boolean;

  /**
   * @description 是否是简单模式,简单模式下不加载数据，而是由父组件传值
   * @type {boolean}
   * @default false
   * @memberof IApiControlState
   */
  isSimple: boolean;

  /**
   * @description 部件是否正在加载
   * @type {boolean}
   * @default false
   * @memberof IApiControlState
   */
  isLoading: boolean;

  /**
   * @description 部件加载时的提示文本
   * @type {string}
   * @memberof IApiControlState
   */
  loadingText: string;

  /**
   * @description 是否默认加载数据
   * @type {boolean}
   * @default true
   * @memberof IApiControlState
   */
  loadDefault: boolean;

  /**
   * @description 部件禁用状态
   * @type {boolean}
   * @default false
   * @memberof IApiControlState
   */
  disabled: boolean;

  /**
   * @description 部件遮罩参数
   * @type {IApiMaskOption}
   * @memberof IApiControlState
   */
  maskOption: IApiMaskOption;

  /**
   * @description 是否禁用计数器
   * @type {boolean}
   * @memberof IApiControllerState
   */
  isCounterDisabled: boolean;
}
