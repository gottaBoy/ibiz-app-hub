import { IAppMenuModel } from './appmenu/iapp-menu-model';
import { IModelObject } from '../imodel-object';

/**
 *
 * @export
 * @interface ISubAppRef
 */
export interface ISubAppRef extends IModelObject {
  /**
   * 访问标识
   * @type {string}
   * 来源  getAccessKey
   */
  accessKey?: string;

  /**
   *  应用实体界面行为组集合
   *
   * @type {string[]}
   * 来源  getAllPSAppDEUIActionGroups
   */
  appDEUIActionGroupIds?: string[];

  /**
   *  合并菜单集合（除默认菜单）
   *
   * @type {string[]}
   * 来源  getAllPSAppMenuModels
   */
  appMenuModelIds?: string[];

  /**
   *  应用插件集合
   *
   * @type {string[]}
   * 来源  getAllPSAppPFPluginRefs
   */
  appPFPluginRefIds?: string[];

  /**
   *  应用门户部件集合
   *
   * @type {string[]}
   * 来源  getAllPSAppPortlets
   */
  appPortletIds?: string[];

  /**
   *  合并视图引用集合
   *
   * @type {string[]}
   * 来源  getAllPSAppViewRefs
   */
  appViewRefIds?: string[];

  /**
   * 应用视图集合
   *
   * @type {string[]}
   * 来源  getAllPSAppViews
   */
  appViewIds?: string[];

  /**
   *  合并部件集合（除关系部件）
   *
   * @type {string[]}
   * 来源  getAllPSControls
   */
  controlIds?: string[];

  /**
   *  应用实体关系部件集合
   *
   * @type {string[]}
   * 来源  getAllPSDEDRControls
   */
  dedrcontrolIds?: string[];

  /**
   * 模型戳
   * @type {string}
   * 来源  getModelStamp
   */
  modelStamp?: string;

  /**
   * 应用菜单模型
   *
   * @type {IAppMenuModel}
   * 来源  getPSAppMenuModel
   */
  appMenuModel?: IAppMenuModel;

  /**
   * 引用参数
   * @type {string}
   * 来源  getRefParam
   */
  refParam?: string;

  /**
   * 引用参数2
   * @type {string}
   * 来源  getRefParam2
   */
  refParam2?: string;

  /**
   * 应用服务标识
   * @type {string}
   * 来源  getServiceId
   */
  serviceId?: string;

  /**
   * 系统引用类型
   * @description 值模式 [系统引用类型] {SUBSYS：平台子系统、 DEVSYS：开发系统组件、 EXTENSION_DEVSYS：开发系统组件（扩展）、 EXTENSION_DEVSYS_PSMODELTOOL：开发系统组件（模型工具）、 EXTENSION_DEVSYS_WORKFLOW：开发系统组件（工作流）、 MERGENCE_DEVSYS：开发系统组件（合并）、 DEVSYSCLOUD：开发系统云服务、 CLOUDHUBSUBAPP：Cloud集成子应用、 ETLEXTRACT：ETL展开逻辑、 ETLTRANSFORM：ETL转换逻辑、 ETLLOAD：ETL加载逻辑、 ETLSOURCE：ETL数据源（模型同步）、 ETLMODEL：ETL模型（模型同步）、 USER：用户自定义、 USER2：用户自定义2、 USER3：用户自定义3、 USER4：用户自定义4 }
   * @type {( string | 'SUBSYS' | 'DEVSYS' | 'EXTENSION_DEVSYS' | 'EXTENSION_DEVSYS_PSMODELTOOL' | 'EXTENSION_DEVSYS_WORKFLOW' | 'MERGENCE_DEVSYS' | 'DEVSYSCLOUD' | 'CLOUDHUBSUBAPP' | 'ETLEXTRACT' | 'ETLTRANSFORM' | 'ETLLOAD' | 'ETLSOURCE' | 'ETLMODEL' | 'USER' | 'USER2' | 'USER3' | 'USER4')}
   * 来源  getSysRefType
   */
  sysRefType?:
    | string
    | 'SUBSYS'
    | 'DEVSYS'
    | 'EXTENSION_DEVSYS'
    | 'EXTENSION_DEVSYS_PSMODELTOOL'
    | 'EXTENSION_DEVSYS_WORKFLOW'
    | 'MERGENCE_DEVSYS'
    | 'DEVSYSCLOUD'
    | 'CLOUDHUBSUBAPP'
    | 'ETLEXTRACT'
    | 'ETLTRANSFORM'
    | 'ETLLOAD'
    | 'ETLSOURCE'
    | 'ETLMODEL'
    | 'USER'
    | 'USER2'
    | 'USER3'
    | 'USER4';
}
