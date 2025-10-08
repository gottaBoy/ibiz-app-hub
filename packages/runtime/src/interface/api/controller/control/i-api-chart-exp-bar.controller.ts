import { IChartExpBar } from '@ibiz/model-core';
import { IApiChartExpBarState } from '../../state';
import { IApiExpBarControlController } from './i-api-exp-bar-control.controller';

/**
 * 图表导航栏
 * @description 通过点击图表内的数据节点，实现视图的快速切换，方便用户快速查看业务形态。
 * @primary
 * @export
 * @interface IApiChartExpBarController
 * @extends {IApiExpBarControlController<T, S>}
 * @ctrlparams {"name":"expcache","title":"是否启用缓存","defaultvalue":"'DEFAULT'","parameterType":"'DEFAULT' | 'CACHE' | 'NO_CACHE'","description":"用于判断导航区占位中显示的导航视图是否缓存。有三种情况，'CACHE' 为缓存；'NO_CACHE' 为不缓存；'DEFAULT' 时匹配当前部件类型是否存在于全局配置参数`expCacheMode`中，存在则缓存，否则不缓存"}
 * @ctrlparams {name:searchphseparator,title:快速搜索提示分隔符,parameterType:string,defaultvalue:'、',description:搜索栏输入框根据该值将所有输入项提示文本进行拼接展示}
 * @template T
 * @template S
 */
export interface IApiChartExpBarController<
  T extends IChartExpBar = IChartExpBar,
  S extends IApiChartExpBarState = IApiChartExpBarState,
> extends IApiExpBarControlController<T, S> {}
