/* eslint-disable @typescript-eslint/no-explicit-any */
import { IAppView } from '@ibiz/model-core';
import { IApiData } from '@ibiz-template/core';
import { IApiViewState } from '../../state';
import { IApiController } from '../common/i-api.controller';
import { IApiControlMapping, IApiViewMapping } from '../common';
import { IApiViewLayoutPanelController } from '../control';
import { IApiModalData, IApiRedrawData } from '../../common';

/**
 * 通用视图
 * @description 应用中基于特定业务场景的可视化界面单元，通过组合数据、交互逻辑与UI组件实现用户目标任务的完整功能界面。
 * @viewparams {"name":"srfrenewsession","title":"强制重新构建界面域","parameterType":"string","defaultvalue":"-","description":"特殊视图参数，值为'true'时，强制重新构建界面域"}
 * @viewparams {"name":"modalOption","title":"模态、抽屉额外注入参数","parameterType":"Object","defaultvalue":"-","description":"定义视图通过模态或者抽屉方式打开，给模态和抽屉注入额外参数，相关参数可参考element plus官方文档"}
 * @viewparams {"name":"waterMarkOption","title":"视图水印相关参数","parameterType":"Object","defaultvalue":"-","description":"定义水印相关参数，相关参数参见IApiGlobalWaterMarkConfig接口"}
 * @export
 * @interface IApiViewController
 * @extends {IApiController<T, S>}
 * @template T
 * @template S
 * @primary
 */
export interface IApiViewController<
  T extends IAppView = IAppView,
  S extends IApiViewState = IApiViewState,
> extends IApiController<T, S> {
  /**
   * @description 视图级共享数据对象
   * @type {IApiData}
   * @memberof IApiViewController
   */
  session: IApiData;
  /**
   * @description 视图错误信息
   * @type {IApiData}
   * @memberof IApiViewController
   */
  error: IApiData;

  /**
   * @description 上层视图控制器对象，顶层视图没有父
   * @type {((IApiViewController & IApiData) | undefined)}
   * @memberof IApiViewController
   */
  readonly parentView: (IApiViewController & IApiData) | undefined;

  /**
   * @description 视图是否处于激活状态
   * @type {boolean}
   * @memberof IApiViewController
   */
  readonly isActive: boolean;

  /**
   * @description 视图布局面板
   * @type {(IApiViewLayoutPanelController & IApiData)}
   * @memberof IApiViewController
   */
  layoutPanel?: IApiViewLayoutPanelController & IApiData;

  /**
   * @description 关闭视图
   * @param {IApiModalData} [modalData]
   * @returns {*}  {Promise<void>}
   * @memberof IApiViewController
   */
  closeView(modalData?: IApiModalData): Promise<void>;

  /**
   * @description 重绘视图
   * @param {IRedrawData} redrawData
   * @memberof IApiViewController
   */
  redrawView(redrawData: IApiRedrawData): void;

  /**
   * @description 执行视图的能力，不同类型视图能力不同，详情请参见[视图清单](../../appendix/view)
   * @template A
   * @param {string} key 视图能力的唯一标识
   * @param {A} [args] 视图能力需要的参数
   * @returns {*}  {Promise<any>}
   * @memberof IApiViewController
   */
  call(key: string, args?: any): Promise<any>;

  /**
   * @description 开启视图loading
   * @memberof IApiViewController
   */
  startLoading(): void;

  /**
   * @description 关闭视图loading
   * @memberof IApiViewController
   */
  endLoading(): void;

  /**
   * @description 获取当前实例，视图类型参数请参见[视图清单](../../appendix/view)
   * @template K
   * @param {K} type 视图类型
   * @returns {*}  {IApiViewMapping[K]}
   * @memberof IApiViewController
   */
  getCurrentInstance<K extends keyof IApiViewMapping>(
    type: K,
  ): IApiViewMapping[K];

  /**
   * @description  获取部件实例，部件类型参数请参见[部件清单](../../appendix/ctrl)
   * @template K
   * @param {K} type 部件类型
   * @param {string} name 部件名称
   * @param {boolean} [traceRoot] 是否跨越视图作用域，一路向根上找
   * @returns {*}  {IApiControlMapping[K]}
   * @memberof IApiViewController
   */
  getCtrl<K extends keyof IApiControlMapping>(
    type: K,
    name: string,
    traceRoot?: boolean,
  ): IApiControlMapping[K];
}
