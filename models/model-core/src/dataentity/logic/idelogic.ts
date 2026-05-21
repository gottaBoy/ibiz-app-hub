import { IDELogicBase } from './idelogic-base';
import { IDELogicNode } from './idelogic-node';
import { IDELogicParam } from './idelogic-param';

/**
 *
 * 实体处理逻辑模型对象接口
 * 子接口类型识别属性[logicSubType]
 * @export
 * @interface IDELogic
 */
export interface IDELogic extends IDELogicBase {
  /**
   * 调试模式
   * @description 值模式 [实体逻辑调试模式] {0：不启用、 1：信息输出 }
   * @type {( number | 0 | 1)}
   * @default 0
   * 来源  getDebugMode
   */
  debugMode?: number | 0 | 1;

  /**
   * 默认参数名称
   * @type {string}
   * 来源  getDefaultParamName
   */
  defaultParamName?: string;

  /**
   * 监控事件模型
   * @type {string}
   * 来源  getEventModel
   */
  eventModel?: string;

  /**
   * 监控事件
   * @type {string}
   * 来源  getEvents
   */
  events?: string;

  /**
   * 逻辑子类
   * @description 值模式 [实体处逻辑子类] {NONE：无、 DEFIELD：属性逻辑、 DEOPPRIV：实体操作标识计算逻辑、 AICHAT：AI交谈逻辑、 ATTACHTODEACTION：附加到行为（运行时支持）、 ATTACHTODEDATASET：附加到数据集（运行时支持）、 WEBHOOK：WebHook（运行时支持）、 TIMERTASK：定时作业（运行时支持）、 EVENTHOOK：事件处理（运行时支持）、 FIELDCHANGEHOOK：属性变化处理（运行时支持）、 USER：用户自定义、 USER2：用户自定义2、 USER3：用户自定义3、 USER4：用户自定义4 }
   * @type {( string | 'NONE' | 'DEFIELD' | 'DEOPPRIV' | 'AICHAT' | 'ATTACHTODEACTION' | 'ATTACHTODEDATASET' | 'WEBHOOK' | 'TIMERTASK' | 'EVENTHOOK' | 'FIELDCHANGEHOOK' | 'USER' | 'USER2' | 'USER3' | 'USER4')}
   * @default NONE
   * 来源  getLogicSubType
   */
  logicSubType?:
    | string
    | 'NONE'
    | 'DEFIELD'
    | 'DEOPPRIV'
    | 'AICHAT'
    | 'ATTACHTODEACTION'
    | 'ATTACHTODEDATASET'
    | 'WEBHOOK'
    | 'TIMERTASK'
    | 'EVENTHOOK'
    | 'FIELDCHANGEHOOK'
    | 'USER'
    | 'USER2'
    | 'USER3'
    | 'USER4';

  /**
   * 逻辑标记
   * @type {string}
   * 来源  getLogicTag
   */
  logicTag?: string;

  /**
   * 逻辑标记2
   * @type {string}
   * 来源  getLogicTag2
   */
  logicTag2?: string;

  /**
   * 逻辑标记3
   * @type {string}
   * 来源  getLogicTag3
   */
  logicTag3?: string;

  /**
   * 逻辑标记4
   * @type {string}
   * 来源  getLogicTag4
   */
  logicTag4?: string;

  /**
   * 逻辑处理集合
   *
   * @type {IDELogicNode[]}
   * 来源  getPSDELogicNodes
   */
  delogicNodes?: IDELogicNode[];

  /**
   * 逻辑参数集合
   *
   * @type {IDELogicParam[]}
   * 来源  getPSDELogicParams
   */
  delogicParams?: IDELogicParam[];

  /**
   * 脚本代码
   * @type {string}
   * 来源  getScriptCode
   */
  scriptCode?: string;

  /**
   * 开始处理节点
   *
   * @type {string}
   * 来源  getStartPSDELogicNode
   */
  startDELogicNodeId?: string;

  /**
   * 线程模式
   * @description 值模式 [实体逻辑线程运行模式] {0：不启用、 1：线程执行 }
   * @type {( number | 0 | 1)}
   * @default 0
   * 来源  getThreadMode
   */
  threadMode?: number | 0 | 1;

  /**
   * 自定义脚本代码
   * @type {boolean}
   * @default false
   * 来源  isCustomCode
   */
  customCode?: boolean;

  /**
   * 支持后台执行
   * @type {boolean}
   * 来源  isEnableBackend
   */
  enableBackend?: boolean;

  /**
   * 支持前台执行
   * @type {boolean}
   * 来源  isEnableFront
   */
  enableFront?: boolean;

  /**
   * 忽略异常
   * @type {boolean}
   * @default false
   * 来源  isIgnoreException
   */
  ignoreException?: boolean;

  /**
   * 模板逻辑
   * @type {boolean}
   * @default false
   * 来源  isTemplate
   */
  template?: boolean;

  /**
   * 启用
   * @type {boolean}
   * @default true
   * 来源  isValid
   */
  valid?: boolean;
}
