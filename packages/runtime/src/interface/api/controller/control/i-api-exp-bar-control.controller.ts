import { IExpBar } from '@ibiz/model-core';
import { IApiContext, IApiData, IApiParams } from '@ibiz-template/core';
import { IApiExpBarControlState } from '../../state';
import { IApiControlController } from './i-api-control.controller';
import { IApiMDControlController } from './i-api-md-control.controller';
import { IApiToolbarController } from './i-api-toolbar.controller';

/**
 * 导航栏
 * @description 当在导航栏内重新选中数据时，将切换导航视图，并依据所选中的数据加载对应的导航视图数据。
 * @primary
 * @export
 * @interface IApiExpBarControlController
 * @extends {IApiControlController<T, S>}
 * @ctrlparams {"name":"expcache","title":"是否启用缓存","defaultvalue":"'DEFAULT'","parameterType":"'DEFAULT' | 'CACHE' | 'NO_CACHE'","description":"用于判断导航区占位中显示的导航视图是否缓存。有三种情况，'CACHE' 为缓存；'NO_CACHE' 为不缓存；'DEFAULT' 时匹配当前部件类型是否存在于全局配置参数`expCacheMode`中，存在则缓存，否则不缓存"}
 * @ctrlparams {name:searchphseparator,title:快速搜索提示分隔符,parameterType:string,defaultvalue:'、',description:搜索栏输入框根据该值将所有输入项提示文本进行拼接展示}
 * @template T
 * @template S
 */
export interface IApiExpBarControlController<
  T extends IExpBar = IExpBar,
  S extends IApiExpBarControlState = IApiExpBarControlState,
> extends IApiControlController<T, S> {
  /**
   * @description 多数据部件控制器
   * @type {IMDControlController}
   * @memberof IApiExpBarControlController
   */
  xDataController: IApiMDControlController;

  /**
   * @description 工具栏控制器
   * @type {(IToolbarController | undefined)}
   * @memberof IApiExpBarControlController
   */
  toolbarController: IApiToolbarController | undefined;

  /**
   * @description 导航栏加载
   * @returns {*}  {Promise<IApiData[]>}
   * @memberof IApiExpBarControlController
   */
  load(): Promise<IApiData[]>;

  /**
   * @description 获取导航视图消息
   * @param {IApiData} data
   * @param {IApiContext} context
   * @param {IApiParams} params
   * @returns {*}  {INavViewMsg}
   * @memberof IExpBarControlController
   */
  getNavViewMsg(
    data: IApiData,
    context: IApiContext,
    params: IApiParams,
  ): IApiData;
}
