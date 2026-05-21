import { IModelObject } from '../../imodel-object';

/**
 *
 * 应用实体关系模型对象接口
 * @export
 * @interface IAppDERS
 */
export interface IAppDERS extends IModelObject {
  /**
   * 行为关系模式
   * @description 值模式 [实体接口行为关系模式] {0：无行为、 1：继承行为、 2：指定行为 }
   * @type {( number | 0 | 1 | 2)}
   * 来源  getActionRSMode
   */
  actionRSMode?: number | 0 | 1 | 2;

  /**
   * 代码标识
   * @type {string}
   * 来源  getCodeName
   */
  codeName?: string;

  /**
   * 代码名称2
   * @type {string}
   * 来源  getCodeName2
   */
  codeName2?: string;

  /**
   * 数据关系模式
   * @description 值模式 [实体接口数据关系模式] {1：新建、 2：更新、 4：获取、 8：查询 }
   * @type {( number | 1 | 2 | 4 | 8)}
   * 来源  getDataRSMode
   */
  dataRSMode?: number | 1 | 2 | 4 | 8;

  /**
   * 主实体代码标识
   * @type {string}
   * 来源  getMajorDECodeName
   */
  majorDECodeName?: string;

  /**
   * 主实体代码标识2
   * @type {string}
   * 来源  getMajorDECodeName2
   */
  majorDECodeName2?: string;

  /**
   * 主实体名称
   * @type {string}
   * 来源  getMajorDEName
   */
  majorDEName?: string;

  /**
   * 主应用实体对象
   *
   * @type {string}
   * 来源  getMajorPSAppDataEntity
   */
  majorAppDataEntityId?: string;

  /**
   * 从实体代码标识
   * @type {string}
   * 来源  getMinorDECodeName
   */
  minorDECodeName?: string;

  /**
   * 从实体代码标识2
   * @type {string}
   * 来源  getMinorDECodeName2
   */
  minorDECodeName2?: string;

  /**
   * 从实体名称
   * @type {string}
   * 来源  getMinorDEName
   */
  minorDEName?: string;

  /**
   * 从应用实体对象
   *
   * @type {string}
   * 来源  getMinorPSAppDataEntity
   */
  minorAppDataEntityId?: string;

  /**
   * 嵌套数据结果集
   *
   * @type {string}
   * 来源  getNestedPSAppDEDataSet
   */
  nestedAppDEDataSetId?: string;

  /**
   * 关系项
   * @type {string}
   * 来源  getParentFilter
   */
  parentFilter?: string;

  /**
   * 父关系连接属性
   *
   * @type {string}
   * 来源  getParentPSAppDEField
   */
  parentAppDEFieldId?: string;

  /**
   * 父关系连接文本属性
   *
   * @type {string}
   * 来源  getParentTextPSAppDEField
   */
  parentTextAppDEFieldId?: string;

  /**
   * 删除拒绝消息语言标记
   * @type {string}
   * 来源  getRRMLanResTag
   */
  rrmlanResTag?: string;

  /**
   * 关系模式
   * @description 值模式 [应用实体关系模式] {1：应用自建、 2：实体服务接口关系 }
   * @type {( number | 1 | 2)}
   * 来源  getRSMode
   */
  rsmode?: number | 1 | 2;

  /**
   * 关系类型
   * @description 值模式 [实体关系类型] {DER1N：1:N关系、 DERINHERIT：继承关系、 DERINDEX：索引关系、 DER11：1:1 关系、 DERMULINH：多继承关系、 DERCUSTOM：自定义关系、 DERAGGDATA：聚合数据关系 }
   * @type {( string | 'DER1N' | 'DERINHERIT' | 'DERINDEX' | 'DER11' | 'DERMULINH' | 'DERCUSTOM' | 'DERAGGDATA')}
   * 来源  getRSType
   */
  rstype?:
    | string
    | 'DER1N'
    | 'DERINHERIT'
    | 'DERINDEX'
    | 'DER11'
    | 'DERMULINH'
    | 'DERCUSTOM'
    | 'DERAGGDATA';

  /**
   * 删除方式
   * @description 值模式 [实体1：N关系主实体删除关系实体操作] {0：无操作、 1：同时删除、 2：置空、 3：限制删除 }
   * @type {( number | 0 | 1 | 2 | 3)}
   * @default -1
   * 来源  getRemoveActionType
   */
  removeActionType?: number | 0 | 1 | 2 | 3;

  /**
   * 删除次序
   * @type {number}
   * @default 0
   * 来源  getRemoveOrder
   */
  removeOrder?: number;

  /**
   * 删除拒绝消息
   * @type {string}
   * 来源  getRemoveRejectMsg
   */
  removeRejectMsg?: string;

  /**
   * 临时数据次序
   * @type {number}
   * @default -1
   * 来源  getTempDataOrder
   */
  tempDataOrder?: number;

  /**
   * 数组模式
   * @type {boolean}
   * @default true
   * 来源  isArray
   */
  array?: boolean;

  /**
   * 数据建立关联输出
   * @type {boolean}
   * @default false
   * 来源  isEnableCreateDataRS
   */
  enableCreateDataRS?: boolean;

  /**
   * 数据获取关联输出
   * @type {boolean}
   * @default false
   * 来源  isEnableGetDataRS
   */
  enableGetDataRS?: boolean;

  /**
   * 数据查询关联输出
   * @type {boolean}
   * @default false
   * 来源  isEnableSelectDataRS
   */
  enableSelectDataRS?: boolean;

  /**
   * 数据更新关联输出
   * @type {boolean}
   * @default false
   * 来源  isEnableUpdateDataRS
   */
  enableUpdateDataRS?: boolean;

  /**
   * 主实体主模式
   * @type {boolean}
   * @default true
   * 来源  isMajorDEMajor
   */
  majorDEMajor?: boolean;
}
