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
 * @viewparams {"name":"checkstrictly","title":"是否严格的遵循穿梭空左右互相关联","parameterType":"boolean","defaultvalue":"false","description":"特殊视图参数，在数据多项选择视图，数据多项选择视图（左右关系）中使用，用于控制选择面板左右数据是否相互关联"}
 * @viewparams {"name":"srfdataaccaction","title":"是否允许请求数据权限","parameterType":"boolean","defaultvalue":"false","description":"特殊视图参数，值为'true'时，请求实体数据权限"}
 * @viewparams {"name":"srfmarkopendatakey","title":"标记打开数据服务标识","parameterType":"string","defaultvalue":"-","description":"特殊视图参数，指定视图发送的站内信标识"}
 * @viewparams {"name":"srfshowbacktop","title":"是否允许显示返回顶部按钮","parameterType":"boolean","defaultvalue":"-","description":"特殊视图参数，用于决定视图内部是否显示返回顶部按钮","effectPlatform":"mob"}
 * @viewparams {"name":"srfmobshowpresetback","title":"是否显示视图顶部预置返回按钮","parameterType":"boolean","defaultvalue":"-","description":"特殊视图参数，用于决定是否显示视图顶部预置返回按钮","effectPlatform":"mob"}
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
   * @description 父视图数据
   * @type {IApiData[]}
   * @memberof IApiViewController
   */
  parentData?: IApiData[];

  /**
   * @description 关闭视图
   * @param {IApiModalData} [modalData] 返回数据
   * @returns {*}  {Promise<void>}
   * @memberof IApiViewController
   */
  closeView(modalData?: IApiModalData): Promise<void>;

  /**
   * @description 重绘视图
   * @param {IApiRedrawData} redrawData 重绘数据
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
