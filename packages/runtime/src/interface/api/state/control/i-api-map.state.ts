import { IApiData } from '@ibiz-template/core';
import { IApiMDControlState } from './i-api-md-control.state';

/**
 * @description 地图部件状态接口
 * @primary
 * @export
 * @interface IMapState
 * @extends {IApiMDControlState}
 */
export interface IApiMapState extends IApiMDControlState {
  /**
   * @description 地图数据
   * @type {IMapData[]}
   * @default []
   * @memberof IMapState
   */
  items: IApiMapData[];

  /**
   * @description 点的数据
   * @type {IMapData[]}
   * @default []
   * @memberof IMapState
   */
  pointData: IApiMapData[];

  /**
   * @description 区域的数据
   * @type {IMapData[]}
   * @default []
   * @memberof IMapState
   */
  areaData: IApiMapData[];

  /**
   * @description 行政等级
   * @type {number}
   * @memberof IApiMapState
   */
  areaLevel: string;

  /**
   * @description 区域编码是否是字符串
   * @type {boolean}
   * @default false
   * @memberof IMapState
   */
  strAreaCode: boolean;

  /**
   * @description 默认显示的区域代码
   * @type {(string | number)}
   * @default ''
   * @memberof IMapState
   */
  defaultAreaCode: string | number;

  /**
   * @description 当前区域代码
   * @type {(string | number)}
   * @default ''
   * @memberof IMapState
   */
  areaCode: string | number;

  /**
   * @description 地图json数据基础路径
   * @type {string}
   * @default ''
   * @memberof IMapState
   */
  jsonBaseUrl?: string;

  /**
   * @description 地图信息
   * @type {IApiData}
   * @default {}
   * @memberof IMapState
   */
  mapInfo: IApiData;

  /**
   * @description 是否允许下钻
   * @type {boolean}
   * @default {}
   * @memberof IMapState
   */
  enabledDrillDown: boolean;

  /**
   * @description 是否允许全屏
   * @type {boolean}
   * @memberof IApiMapState
   */
  enabledFullScreen: boolean;
}

/**
 * @description 地图数据格式接口
 * @export
 * @interface IApiMapData
 */
export interface IApiMapData {
  /**
   * @description 唯一标识
   * @type {string}
   * @memberof IApiMapData
   */
  _id: string;

  /**
   * @description 呈现样式
   * @type {string}
   * @memberof IApiMapData
   */
  _itemStyle: string;

  /**
   * @description 地图项id
   * @type {string}
   * @memberof IApiMapData
   */
  _mapItemId: string;

  /**
   * @description 实体数据
   * @type {IApiData}
   * @memberof IApiMapData
   */
  _deData: IApiData;

  /**
   * @description 经度
   * @type {string}
   * @memberof IApiMapData
   */
  _longitude?: string;

  /**
   * @description 纬度
   * @type {string}
   * @memberof IApiMapData
   */
  _latitude?: string;

  /**
   * @description 区域标识
   * @type {string}
   * @memberof IApiMapData
   */
  _areaCode?: string;

  /**
   * @description 提示信息
   * @type {string}
   * @memberof IApiMapData
   */
  _tooltip?: string;

  /**
   * @description 统计数据值
   * @type {number}
   * @memberof IApiMapData
   */
  _value?: number;

  /**
   * @description 文本值
   * @type {string}
   * @memberof IApiMapData
   */
  _text?: string;

  /**
   * @description 图标
   * @type {string}
   * @memberof IApiMapData
   */
  _symbol?: string;

  /**
   * @description 弹框字体颜色
   * @type {string}
   * @memberof IApiMapData
   */
  _color?: string;

  /**
   * @description 弹框背景样式
   * @type {string}
   * @memberof IApiMapData
   */
  _bgcolor?: string;

  /**
   * @description 弹框边框颜色
   * @type {string}
   * @memberof IApiMapData
   */
  _borderColor?: string;

  /**
   * @description 弹框边框宽度
   * @type {number}
   * @memberof IApiMapData
   */
  _borderWidth?: number;

  /**
   * @description 弹框样式名称
   * @type {string}
   * @memberof IApiMapData
   */
  _className?: string;
}
