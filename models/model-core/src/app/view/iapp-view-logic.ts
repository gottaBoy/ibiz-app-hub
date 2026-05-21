import { IAppUILogic } from '../logic/iapp-uilogic';
import { IModelObject } from '../../imodel-object';

/**
 *
 * 应用视图逻辑模型对象接口
 * @export
 * @interface IAppViewLogic
 */
export interface IAppViewLogic extends IModelObject {
  /**
   * 内建应用逻辑
   */
  builtinAppUILogic?: IAppUILogic;

  /**
   * 注入属性名称
   * @type {string}
   * 来源  getAttrName
   */
  attrName?: string;

  /**
   * 事件参数
   * @type {string}
   * 来源  getEventArg
   */
  eventArg?: string;

  /**
   * 事件参数2
   * @type {string}
   * 来源  getEventArg2
   */
  eventArg2?: string;

  /**
   * 事件名称
   * @type {string}
   * 来源  getEventNames
   */
  eventNames?: string;

  /**
   * 子项名称
   * @type {string}
   * 来源  getItemName
   */
  itemName?: string;

  /**
   * 逻辑标记
   * @type {string}
   * 来源  getLogicParam
   */
  logicParam?: string;

  /**
   * 逻辑标记2
   * @type {string}
   * 来源  getLogicParam2
   */
  logicParam2?: string;

  /**
   * 逻辑触发
   * @description 值模式 [视图逻辑类型] {TIMER：定时器触发、 VIEWEVENT：视图事件触发、 CTRLEVENT：部件事件触发、 ITEMVISIBLE：项显示逻辑、 ITEMENABLE：项启用逻辑、 ITEMBLANK：项空输入逻辑、 ITEMDYNACLASS：项动态样式表、 RENDER：绘制器、 ATTRIBUTE：注入属性、 CUSTOM：只挂接（外部调用）、 VUE_DIRECTIVE：VUE指令 }
   * @type {( string | 'TIMER' | 'VIEWEVENT' | 'CTRLEVENT' | 'ITEMVISIBLE' | 'ITEMENABLE' | 'ITEMBLANK' | 'ITEMDYNACLASS' | 'RENDER' | 'ATTRIBUTE' | 'CUSTOM' | 'VUE_DIRECTIVE')}
   * 来源  getLogicTrigger
   */
  logicTrigger?:
    | string
    | 'TIMER'
    | 'VIEWEVENT'
    | 'CTRLEVENT'
    | 'ITEMVISIBLE'
    | 'ITEMENABLE'
    | 'ITEMBLANK'
    | 'ITEMDYNACLASS'
    | 'RENDER'
    | 'ATTRIBUTE'
    | 'CUSTOM'
    | 'VUE_DIRECTIVE';

  /**
   * 触发逻辑类型
   * @description 值模式 [部件逻辑目标类型] {APPDEUILOGIC：应用实体界面逻辑、 APPDEUIACTION：应用实体界面行为、 APPUILOGIC：应用预置界面逻辑、 APPVIEWLOGIC：视图逻辑、 APPVIEWENGINE：视图引擎、 PFPLUGIN：前端扩展插件、 SCRIPT：脚本代码、 DEUILOGIC：实体界面逻辑（兼容）、 DEUIACTION：实体界面行为（兼容）、 SYSVIEWLOGIC：系统预置界面逻辑（兼容） }
   * @type {( string | 'APPDEUILOGIC' | 'APPDEUIACTION' | 'APPUILOGIC' | 'APPVIEWLOGIC' | 'APPVIEWENGINE' | 'PFPLUGIN' | 'SCRIPT' | 'DEUILOGIC' | 'DEUIACTION' | 'SYSVIEWLOGIC')}
   * 来源  getLogicType
   */
  logicType?:
    | string
    | 'APPDEUILOGIC'
    | 'APPDEUIACTION'
    | 'APPUILOGIC'
    | 'APPVIEWLOGIC'
    | 'APPVIEWENGINE'
    | 'PFPLUGIN'
    | 'SCRIPT'
    | 'DEUILOGIC'
    | 'DEUIACTION'
    | 'SYSVIEWLOGIC';

  /**
   * 部件容器
   * @type {IModel}
   * 来源  getOwner
   */
  owner?: IModel;

  /**
   * 应用实体界面行为对象
   *
   * @type {string}
   * 来源  getPSAppDEUIAction
   */
  appDEUIActionId?: string;

  /**
   * 应用实体界面逻辑对象
   *
   * @type {string}
   * 来源  getPSAppDEUILogic
   */
  appDEUILogicId?: string;

  /**
   * 应用实体对象
   *
   * @type {string}
   * 来源  getPSAppDataEntity
   */
  appDataEntityId?: string;

  /**
   * 应用预置界面逻辑
   *
   * @type {string}
   * 来源  getPSAppUILogic
   */
  appUILogicId?: string;

  /**
   * 视图界面引擎
   *
   * @type {string}
   * 来源  getPSAppViewEngine
   */
  appViewEngineId?: string;

  /**
   * 调用视图逻辑
   *
   * @type {string}
   * 来源  getPSAppViewLogic
   */
  appViewLogicId?: string;

  /**
   * 应用前端插件
   *
   * @type {string}
   * 来源  getPSSysPFPlugin
   */
  sysPFPluginId?: string;

  /**
   * 部件名称
   * @type {string}
   * 来源  getPSViewCtrlName
   */
  ctrlName?: string;

  /**
   * 脚本代码
   * @type {string}
   * 来源  getScriptCode
   */
  scriptCode?: string;

  /**
   * 定时间隔（ms）
   * @type {number}
   * @default 0
   * 来源  getTimer
   */
  timer?: number;

  /**
   * 内建逻辑
   * @type {boolean}
   * @default true
   * 来源  isBuiltinLogic
   */
  builtinLogic?: boolean;
}
