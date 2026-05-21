import { IModelObject } from '../../imodel-object';

/**
 *
 * 实体关系模型对象接口
 * 子接口类型识别属性[dERType]
 * @export
 * @interface IDERBase
 */
export interface IDERBase extends IModelObject {
  /**
   * 代码标识
   * @type {string}
   * 来源  getCodeName
   */
  codeName?: string;

  /**
   * 关系标记
   * @type {string}
   * 来源  getDERTag
   */
  dertag?: string;

  /**
   * 关系标记2
   * @type {string}
   * 来源  getDERTag2
   */
  dertag2?: string;

  /**
   * 关系类型
   * @description 值模式 [实体关系类型] {DER1N：1:N关系、 DERINHERIT：继承关系、 DERINDEX：索引关系、 DER11：1:1 关系、 DERMULINH：多继承关系、 DERCUSTOM：自定义关系、 DERAGGDATA：聚合数据关系 }
   * @type {( string | 'DER1N' | 'DERINHERIT' | 'DERINDEX' | 'DER11' | 'DERMULINH' | 'DERCUSTOM' | 'DERAGGDATA')}
   * 来源  getDERType
   */
  dertype?:
    | string
    | 'DER1N'
    | 'DERINHERIT'
    | 'DERINDEX'
    | 'DER11'
    | 'DERMULINH'
    | 'DERCUSTOM'
    | 'DERAGGDATA';

  /**
   * 逻辑名称
   * @type {string}
   * 来源  getLogicName
   */
  logicName?: string;

  /**
   * 关系数据代码标识
   * @type {string}
   * 来源  getMinorCodeName
   */
  minorCodeName?: string;

  /**
   * 从逻辑名称
   * @type {string}
   * 来源  getMinorLogicName
   */
  minorLogicName?: string;

  /**
   * 关系数据服务代码标识
   * @type {string}
   * 来源  getMinorServiceCodeName
   */
  minorServiceCodeName?: string;

  /**
   * 排序值
   * @type {number}
   * 来源  getOrderValue
   */
  orderValue?: number;

  /**
   * 服务代码标识
   * @type {string}
   * 来源  getServiceCodeName
   */
  serviceCodeName?: string;
}
