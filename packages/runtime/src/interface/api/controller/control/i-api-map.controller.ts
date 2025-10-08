import { ISysMap } from '@ibiz/model-core';
import { EChartsType } from 'echarts';
import { IApiMapState } from '../../state';
import { IApiMDControlController } from './i-api-md-control.controller';

/**
 * 地图
 * @description 采用交互式地图组件实现地理数据可视化，支持区域渲染、动态标注与多级缩放，提供空间数据分析能力。
 * @primary
 * @export
 * @interface IMapController
 * @extends {IApiMDControlController<T, S>}
 * @ctrlparams { name:defaultareacode,title:默认地区编码,parameterType:string | number,defaultvalue:100000,description:若设置该值，地图初始化时将根据此编码显示指定地图区域，未设置时默认显示全国}
 * @ctrlparams { name:strareacode,title:区域编码是否是字符串,parameterType:boolean,defaultvalue:false,description:该值为true时，将默认地区编码 `defaultareacode` 值转为字符串类型，默认转为数值类型}
 * @ctrlparams { name:jsonbaseurl,title:地图json数据基础路径,parameterType:string,defaultvalue:'./assets/json/map',description:获取地图地理数据的请求路径}
 * @ctrlparams { name:enableddrilldown,title:是否允许下钻,parameterType:boolean,defaultvalue:true,description:自定义样式下，是否启用地图下钻功能，默认开启}
 * @ctrlparams { name:enabledfullscreen,title:是否允许全屏,parameterType:boolean,defaultvalue:false,description:自定义样式下，是否启用地图全屏功能，默认关闭}
 * @ctrlparams { name:defaultopts,title:地图默认参数,parameterType:string,description:自定义样式下，配置该参数可调整地图呈现模式，参数为IAPiMapOptions}
 * @template T
 * @template S
 */
export interface IApiMapController<
  T extends ISysMap = ISysMap,
  S extends IApiMapState = IApiMapState,
> extends IApiMDControlController<T, S> {
  /**
   * @description echarts对象
   * @type {EChartsType}
   * @memberof IApiMapController
   */
  chart?: EChartsType;

  /**
   * @description 下钻
   * @param {(string | number)} areaCode
   * @memberof IApiMapController
   */
  drillDown(areaCode: string | number): void;

  /**
   * @description 返回
   * @memberof IApiMapController
   */
  back(): void;
}
