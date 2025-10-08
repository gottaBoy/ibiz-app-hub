import { ICalendarExpBar } from '@ibiz/model-core';
import { IApiExpBarControlController } from './i-api-exp-bar-control.controller';
import { IApiCalendarExpBarState } from '../../state';

/**
 * 日历导航栏
 * @description 允许用户通过直观的日历控件选择日期或时间段，实现快速视图切换。其核心功能包括日程可视化展示、动态高亮标记、响应式点击事件及与数据层的联动，支持跨月/年浏览，并可通过自定义样式适配不同业务场景，提升用户的时间导航效率。
 * @primary
 * @export
 * @interface IApiCalendarExpBarController
 * @extends {IApiExpBarControlController<T, S>}
 * @ctrlparams {"name":"expcache","title":"是否启用缓存","defaultvalue":"'DEFAULT'","parameterType":"'DEFAULT' | 'CACHE' | 'NO_CACHE'","description":"用于判断导航区占位中显示的导航视图是否缓存。有三种情况，'CACHE' 为缓存；'NO_CACHE' 为不缓存；'DEFAULT' 时匹配当前部件类型是否存在于全局配置参数`expCacheMode`中，存在则缓存，否则不缓存"}
 * @ctrlparams {name:searchphseparator,title:快速搜索提示分隔符,parameterType:string,defaultvalue:'、',description:搜索栏输入框根据该值将所有输入项提示文本进行拼接展示}
 * @template T
 * @template S
 */
export interface IApiCalendarExpBarController<
  T extends ICalendarExpBar = ICalendarExpBar,
  S extends IApiCalendarExpBarState = IApiCalendarExpBarState,
> extends IApiExpBarControlController<T, S> {}
