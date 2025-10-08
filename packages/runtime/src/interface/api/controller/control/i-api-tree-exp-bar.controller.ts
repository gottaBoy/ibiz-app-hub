import { ITreeExpBar } from '@ibiz/model-core';
import { IApiExpBarControlController } from './i-api-exp-bar-control.controller';
import { IApiTreeExpBarState } from '../../state';

/**
 * 树导航栏
 * @description 点击树结构节点可快速切换视图，通过层级清晰的页面导航，方便用户在导航视图中直观查看业务形态。
 * @primary
 * @export
 * @interface IApiTreeExpBarController
 * @ctrlparams {"name":"expcache","title":"是否启用缓存","defaultvalue":"'DEFAULT'","parameterType":"'DEFAULT' | 'CACHE' | 'NO_CACHE'","description":"用于判断导航区占位中显示的导航视图是否缓存。有三种情况，'CACHE' 为缓存；'NO_CACHE' 为不缓存；'DEFAULT' 时匹配当前部件类型是否存在于全局配置参数`expCacheMode`中，存在则缓存，否则不缓存"}
 * @ctrlparams {name:searchphseparator,title:快速搜索提示分隔符,parameterType:string,defaultvalue:'、',description:搜索栏输入框根据该值将所有输入项提示文本进行拼接展示}
 * @extends {IApiExpBarControlController}
 */
export interface IApiTreeExpBarController<
  T extends ITreeExpBar = ITreeExpBar,
  S extends IApiTreeExpBarState = IApiTreeExpBarState,
> extends IApiExpBarControlController<T, S> {}
