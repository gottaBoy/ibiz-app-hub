import { Srfuf } from '../../../service';

/**
 * 应用数据实体接口
 *
 * @author chitanda
 * @date 2023-05-16 17:05:28
 * @export
 * @interface IDataEntity
 */
export interface IDataEntity {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string | symbol]: any;

  /**
   * 实体模型标识
   *
   * @author chitanda
   * @date 2023-05-16 17:05:14
   * @type {string}
   */
  srfdeid: string;

  /**
   * 实体模型代码名称
   *
   * @author chitanda
   * @date 2023-05-16 17:05:22
   * @type {string}
   */
  srfdecodename: string;

  /**
   * 实体主键属性
   *
   * @author chitanda
   * @date 2023-05-16 17:05:23
   * @type {string}
   */
  srfkeyfield: string;

  /**
   * 实体主文本属性
   *
   * @author chitanda
   * @date 2023-05-16 17:05:30
   * @type {string}
   */
  srfmajorfield: string;

  /**
   * 父对象主键
   *
   * @author chitanda
   * @date 2023-12-18 10:12:50
   * @type {string}
   */
  srfpkey?: string;

  /**
   * 实体主键值
   *
   * @author chitanda
   * @date 2023-05-16 17:05:42
   * @type {string}
   */
  srfkey: string;

  /**
   * 临时实体主键值
   *
   * @author chitanda
   * @date 2023-05-16 17:05:42
   * @type {string}
   */
  tempsrfkey: string;

  /**
   * 实体主文本值
   *
   * @author chitanda
   * @date 2023-05-16 17:05:49
   * @type {string}
   */
  srfmajortext: string;

  /**
   * 前端排序
   *
   * @type {number}
   * @memberof IDataEntity
   */
  srfordervalue: number;

  /**
   * @description 联合主键（存在联合主键属性集合才有值）
   * @type {(string)}
   * @memberof IDataEntity
   */
  srfunionkey: string;

  /**
   * 是否是新建数据，0为新建
   *
   * @author lxm
   * @date 2022-09-06 22:09:24
   * @type {Srfuf}
   */
  srfuf: Srfuf;

  /**
   * 提供当前数据克隆操作，返回克隆后的当前实例
   *
   * @author chitanda
   * @date 2023-05-16 17:05:58
   * @return {*}  {IDataEntity}
   */
  clone(): IDataEntity;

  /**
   * 将指定的数据对象或者实体数据对象的属性值赋值到当前实体
   *
   * @author chitanda
   * @date 2023-05-16 17:05:26
   * @param {(IData | IDataEntity)} data
   * @return {*}  {IDataEntity}
   */
  assign(data: IData | IDataEntity): IDataEntity;
}
