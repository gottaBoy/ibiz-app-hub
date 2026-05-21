import { IApiData } from '@ibiz-template/core';
import { IApiUIMapField } from './i-api-ui-map-field';

/**
 * @description 部件UI显示层数据转换接口
 * @export
 * @interface IApiControlVO
 */
export interface IApiControlVO {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string | symbol]: any;

  /**
   * @description 原始后台数据
   * @type {IApiData}
   * @memberof IApiControlVO
   */
  $origin: IApiData;

  /**
   * @description 属性映射集合
   * @type {Map<string, IApiUIMapField>}
   * @memberof IApiControlVO
   */
  $dataUIMap: Map<string, IApiUIMapField>;

  /**
   * @description 是否是新建数据，0为新建
   * @type {Srfuf}
   * @memberof IApiControlVO
   */
  srfuf: 0 | 1;

  /**
   * @description 主键
   * @type {string}
   * @memberof IApiControlVO
   */
  srfkey?: string;

  /**
   * @description 临时主键
   * @type {string}
   * @memberof IApiControlVO
   */
  tempsrfkey: string;

  /**
   * @description 主信息
   * @type {string}
   * @memberof IApiControlVO
   */
  srfmajortext?: string;

  /**
   * @description 实体模型标识
   * @type {string}
   * @memberof IApiControlVO
   */
  srfdeid: string;

  /**
   * @description 实体模型代码名称
   * @type {string}
   * @memberof IApiControlVO
   */
  srfdecodename: string;

  /**
   * @description 实体主键属性
   * @type {string}
   * @memberof IApiControlVO
   */
  srfkeyfield: string;

  /**
   * @description 实体主信息属性
   * @type {string}
   * @memberof IApiControlVO
   */
  srfmajorfield: string;

  /**
   * @description 获取原始数据
   * @returns {*}  {IApiData}
   * @memberof IApiControlVO
   */
  getOrigin(): IApiData;

  /**
   * @description 设置原始数据
   * @param {(IApiData | IApiControlVO)} data 原始数据
   * @memberof IApiControlVO
   */
  setOrigin(data: IApiData | IApiControlVO): void;

  /**
   * @description 克隆新的vo数据
   * @returns {*}  {IApiControlVO}
   * @memberof IApiControlVO
   */
  clone(): IApiControlVO;
}
