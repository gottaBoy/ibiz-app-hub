import { IDEActionLogic } from './ideaction-logic';
import { IModelObject } from '../../imodel-object';

/**
 *
 * 实体行为模型对象接口，实体行为模型除了自身逻辑还包括了输入{@link #getPSDEActionInput}及返回{@link #getPSDEActionReturn}模型
 * 子接口类型识别属性[actionType]
 * @export
 * @interface IDEAction
 */
export interface IDEAction extends IModelObject {
  /**
   * 行为持有者
   * @description 值模式 [逻辑所有者] {1：后台、 2：前台、 3：后台及前台 }
   * @type {( number | 1 | 2 | 3)}
   * @default 3
   * 来源  getActionHolder
   */
  actionHolder?: number | 1 | 2 | 3;

  /**
   * 行为模式
   * @description 值模式 [实体行为模式] {CREATE：创建数据、 READ：读取数据、 UPDATE：更新数据、 DELETE：删除数据、 CUSTOM：自定义操作、 GETDRAFT：获取草稿、 GETDRAFTFROM：获取草稿（指定源数据）、 UNKNOWN：未知操作、 MOVEORDER：移动位置、 CHECKKEY：检查主键、 SAVE：保存数据、 COPY：拷贝数据、 USER：用户自定义、 USER2：用户自定义2、 USER3：用户自定义3、 USER4：用户自定义4 }
   * @type {( string | 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'CUSTOM' | 'GETDRAFT' | 'GETDRAFTFROM' | 'UNKNOWN' | 'MOVEORDER' | 'CHECKKEY' | 'SAVE' | 'COPY' | 'USER' | 'USER2' | 'USER3' | 'USER4')}
   * 来源  getActionMode
   */
  actionMode?:
    | string
    | 'CREATE'
    | 'READ'
    | 'UPDATE'
    | 'DELETE'
    | 'CUSTOM'
    | 'GETDRAFT'
    | 'GETDRAFTFROM'
    | 'UNKNOWN'
    | 'MOVEORDER'
    | 'CHECKKEY'
    | 'SAVE'
    | 'COPY'
    | 'USER'
    | 'USER2'
    | 'USER3'
    | 'USER4';

  /**
   * 行为标记
   * @type {string}
   * 来源  getActionTag
   */
  actionTag?: string;

  /**
   * 行为标记2
   * @type {string}
   * 来源  getActionTag2
   */
  actionTag2?: string;

  /**
   * 行为标记3
   * @type {string}
   * 来源  getActionTag3
   */
  actionTag3?: string;

  /**
   * 行为标记4
   * @type {string}
   * 来源  getActionTag4
   */
  actionTag4?: string;

  /**
   * 行为类型
   * @description 值模式 [实体行为类型] {USERCUSTOM：用户自定义、 DELOGIC：实体处理逻辑、 BUILTIN：内置方法、 SELECTBYKEY：通过键值获取、 USERCREATE：用户扩展建立、 USERUPDATE：用户扩展更新、 USERSYSUPDATE：用户扩展系统更新、 SCRIPT：脚本代码、 REMOTE：远程接口行为、 INHERIT：继承行为 }
   * @type {( string | 'USERCUSTOM' | 'DELOGIC' | 'BUILTIN' | 'SELECTBYKEY' | 'USERCREATE' | 'USERUPDATE' | 'USERSYSUPDATE' | 'SCRIPT' | 'REMOTE' | 'INHERIT')}
   * 来源  getActionType
   */
  actionType?:
    | string
    | 'USERCUSTOM'
    | 'DELOGIC'
    | 'BUILTIN'
    | 'SELECTBYKEY'
    | 'USERCREATE'
    | 'USERUPDATE'
    | 'USERSYSUPDATE'
    | 'SCRIPT'
    | 'REMOTE'
    | 'INHERIT';

  /**
   * 执行后附加逻辑集合
   *
   * @type {IDEActionLogic[]}
   * 来源  getAfterPSDEActionLogics
   */
  afterDEActionLogics?: IDEActionLogic[];

  /**
   * 批操作模式
   * @description 值模式 [实体行为批操作模式] {0：不支持、 1：支持、 2：仅支持批操作、 5：支持（事务）、 6：仅支持批操作（事务） }
   * @type {( number | 0 | 1 | 2 | 5 | 6)}
   * @default 0
   * 来源  getBatchActionMode
   */
  batchActionMode?: number | 0 | 1 | 2 | 5 | 6;

  /**
   * 执行前附加逻辑集合
   *
   * @type {IDEActionLogic[]}
   * 来源  getBeforePSDEActionLogics
   */
  beforeDEActionLogics?: IDEActionLogic[];

  /**
   * 检查附加逻辑集合
   *
   * @type {IDEActionLogic[]}
   * 来源  getCheckPSDEActionLogics
   */
  checkDEActionLogics?: IDEActionLogic[];

  /**
   * 代码标识
   * @type {string}
   * 来源  getCodeName
   */
  codeName?: string;

  /**
   * 子系统扩展
   * @description 值模式 [实体扩展模式] {0：无扩展、 2：子系统功能扩展 }
   * @type {( number | 0 | 2)}
   * @default 0
   * 来源  getExtendMode
   */
  extendMode?: number | 0 | 2;

  /**
   * 逻辑名称
   * @type {string}
   * 来源  getLogicName
   */
  logicName?: string;

  /**
   * 行为次序
   * @type {number}
   * @default 99999
   * 来源  getOrderValue
   */
  orderValue?: number;

  /**
   * 前端扩展插件
   *
   * @type {string}
   * 来源  getPSSysPFPlugin
   */
  sysPFPluginId?: string;

  /**
   * 行为参数模式
   * @description 值模式 [实体行为参数模式] {1：默认参数（设置指定参数项值）、 2：指定参数、 3：其它对象、 99：无参数 }
   * @type {( number | 1 | 2 | 3 | 99)}
   * @default 1
   * 来源  getParamMode
   */
  paramMode?: number | 1 | 2 | 3 | 99;

  /**
   * 准备附加逻辑集合
   *
   * @type {IDEActionLogic[]}
   * 来源  getPreparePSDEActionLogics
   */
  prepareDEActionLogics?: IDEActionLogic[];

  /**
   * 临时数据模式
   * @description 值模式 [平台部件处理器临时数据模式] {0：无临时数据模式、 1：主数据模式、 2：从数据模式 }
   * @type {( number | 0 | 1 | 2)}
   * @default 0
   * 来源  getTempDataMode
   */
  tempDataMode?: number | 0 | 1 | 2;

  /**
   * 测试行为模式
   * @description 值模式 [实体行为测试行为模式] {0：无测试行为、 1：有测试行为、 3：公开测试行为 }
   * @type {( number | 0 | 1 | 3)}
   * @default 0
   * 来源  getTestActionMode
   */
  testActionMode?: number | 0 | 1 | 3;

  /**
   * 调用超时
   * @type {number}
   * @default -1
   * 来源  getTimeOut
   */
  timeOut?: number;

  /**
   * 异步操作行为
   * @type {boolean}
   * @default false
   * 来源  isAsyncAction
   */
  asyncAction?: boolean;

  /**
   * 批操作行为
   * @type {boolean}
   * @default false
   * 来源  isBatchAction
   */
  batchAction?: boolean;

  /**
   * 预置行为
   * @type {boolean}
   * @default false
   * 来源  isBuiltinAction
   */
  builtinAction?: boolean;

  /**
   * 自定义行为参数
   * @type {boolean}
   * @default false
   * 来源  isCustomParam
   */
  customParam?: boolean;

  /**
   * 支持后台执行
   * @type {boolean}
   * @default true
   * 来源  isEnableBackend
   */
  enableBackend?: boolean;

  /**
   * 支持前台执行
   * @type {boolean}
   * @default true
   * 来源  isEnableFront
   */
  enableFront?: boolean;

  /**
   * 支持临时数据
   * @type {boolean}
   * @default false
   * 来源  isEnableTempData
   */
  enableTempData?: boolean;

  /**
   * 启用
   * @type {boolean}
   * @default true
   * 来源  isValid
   */
  valid?: boolean;
}
