import { IAppDEMethod } from './iapp-demethod';

/**
 *
 * 应用实体行为模型对象接口
 * @export
 * @interface IAppDEAction
 */
export interface IAppDEAction extends IAppDEMethod {
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
   * 行为标识
   * @type {string}
   * 来源  getActionName
   */
  actionName?: string;

  /**
   * 行为标识
   * @type {string}
   * 来源  getActionTag
   */
  actionTag?: string;

  /**
   * 行为类型
   * @description 值模式 [实体行为类型] {USERCUSTOM：用户自定义、 DELOGIC：实体处理逻辑、 BUILTIN：内置方法、 SELECTBYKEY：通过键值获取、 USERCREATE：用户扩展建立、 USERUPDATE：用户扩展更新、 USERSYSUPDATE：用户扩展系统更新、 SCRIPT：脚本代码、 REMOTE：远程接口行为、 INHERIT：继承行为 }
   * @type {( string | 'USERCUSTOM' | 'DELOGIC' | 'BUILTIN' | 'SELECTBYKEY' | 'USERCREATE' | 'USERUPDATE' | 'USERSYSUPDATE' | 'SCRIPT' | 'REMOTE' | 'INHERIT')}
   * @default REMOTE
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
   * 执行之后代码
   * @type {string}
   * 来源  getAfterCode
   */
  afterCode?: string;

  /**
   * 批操作模式
   * @description 值模式 [实体行为批操作模式] {0：不支持、 1：支持、 2：仅支持批操作、 5：支持（事务）、 6：仅支持批操作（事务） }
   * @type {( number | 0 | 1 | 2 | 5 | 6)}
   * @default 0
   * 来源  getBatchActionMode
   */
  batchActionMode?: number | 0 | 1 | 2 | 5 | 6;

  /**
   * 执行之前代码
   * @type {string}
   * 来源  getBeforeCode
   */
  beforeCode?: string;

  /**
   * 实体处理逻辑
   *
   * @type {string}
   * 来源  getPSAppDELogic
   */
  appDELogicId?: string;

  /**
   * 脚本代码
   * @type {string}
   * 来源  getScriptCode
   */
  scriptCode?: string;

  /**
   * 异步操作行为
   * @type {boolean}
   * @default false
   * 来源  isAsyncAction
   */
  asyncAction?: boolean;

  /**
   * 自定义代码
   * @type {boolean}
   * @default false
   * 来源  isCustomCode
   */
  customCode?: boolean;

  /**
   * 批操作行为
   * @type {boolean}
   * @default false
   * 来源  isEnableBatchAction
   */
  enableBatchAction?: boolean;

  /**
   * 启用判断执行方法
   * @type {boolean}
   * @default false
   * 来源  isEnableTestMethod
   */
  enableTestMethod?: boolean;
}
