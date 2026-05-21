import { IAppMethodDTO } from './iapp-method-dto';
import { IAppResource } from './iapp-resource';
import { IAppUtilPage } from './iapp-util-page';
import { IApplicationLogic } from './iapplication-logic';
import { ISubAppRef } from './isub-app-ref';
import { IAppPortlet } from './control/iapp-portlet';
import { IAppPortletCat } from './control/iapp-portlet-cat';
import { IAppDEUIAction } from './dataentity/iapp-deuiaction';
import { IAppFunc } from './func/iapp-func';
import { IAppUILogic } from './logic/iapp-uilogic';
import { IAppMsgTempl } from './msg/iapp-msg-templ';
import { IAppDEFInputTipSet } from './res/iapp-definput-tip-set';
import { IAppPFPluginRef } from './res/iapp-pfplugin-ref';
import { IAppSubViewTypeRef } from './res/iapp-sub-view-type-ref';
import { IAppUITheme } from './theme/iapp-uitheme';
import { IAppUtil } from './util/iapp-util';
import { IAppViewMsg } from './view/iapp-view-msg';
import { IAppViewMsgGroup } from './view/iapp-view-msg-group';
import { IAppWF } from './wf/iapp-wf';
import { IDEOPPriv } from '../dataentity/priv/ideoppriv';
import { ISysImage } from '../res/isys-image';
import { IModelObject } from '../imodel-object';

/**
 *
 * 应用模型对象接口
 * @export
 * @interface IApplication
 */
export interface IApplication extends IModelObject {
  /**
   * 全部资源标识集合
   *
   * 来源 getAllAccessKeys
   */
  accessKeys?: string[];

  /**
   * 应用智能报表体系集合
   *
   * @type {string[]}
   * 来源  getAllPSAppBISchemes
   */
  appBISchemeIds?: string[];

  /**
   * 应用实体属性输入提示集合集合
   *
   * @type {IAppDEFInputTipSet[]}
   * 来源  getAllPSAppDEFInputTipSets
   */
  appDEFInputTipSets?: IAppDEFInputTipSet[];

  /**
   * 应用界面行为集合
   *
   * @type {IAppDEUIAction[]}
   * 来源  getAllPSAppDEUIActions
   */
  appDEUIActions?: IAppDEUIAction[];

  /**
   * 应用功能集合
   *
   * @type {IAppFunc[]}
   * 来源  getAllPSAppFuncs
   */
  appFuncs?: IAppFunc[];

  /**
   * 应用方法DTO集合
   *
   * @type {IAppMethodDTO[]}
   * 来源  getAllPSAppMethodDTOs
   */
  appMethodDTOs?: IAppMethodDTO[];

  /**
   * 应用消息模板集合
   *
   * @type {IAppMsgTempl[]}
   * 来源  getAllPSAppMsgTempls
   */
  appMsgTempls?: IAppMsgTempl[];

  /**
   * 应用前端模板插件引用集合
   *
   * @type {IAppPFPluginRef[]}
   * 来源  getAllPSAppPFPluginRefs
   */
  appPFPluginRefs?: IAppPFPluginRef[];

  /**
   * 应用门户部件分类集合
   *
   * @type {IAppPortletCat[]}
   * 来源  getAllPSAppPortletCats
   */
  appPortletCats?: IAppPortletCat[];

  /**
   * 应用门户部件集合
   *
   * @type {IAppPortlet[]}
   * 来源  getAllPSAppPortlets
   */
  appPortlets?: IAppPortlet[];

  /**
   * 应用预置资源集合
   *
   * @type {IAppResource[]}
   * 来源  getAllPSAppResources
   */
  appResources?: IAppResource[];

  /**
   * 应用视图子类型引用集合
   *
   * @type {IAppSubViewTypeRef[]}
   * 来源  getAllPSAppSubViewTypeRefs
   */
  appSubViewTypeRefs?: IAppSubViewTypeRef[];

  /**
   * 应用预置界面逻辑集合
   *
   * @type {IAppUILogic[]}
   * 来源  getAllPSAppUILogics
   */
  appUILogics?: IAppUILogic[];

  /**
   * 应用界面主题集合
   *
   * @type {IAppUITheme[]}
   * 来源  getAllPSAppUIThemes
   */
  appUIThemes?: IAppUITheme[];

  /**
   * 应用功能页面集合
   *
   * @type {IAppUtilPage[]}
   * 来源  getAllPSAppUtilPages
   */
  appUtilPages?: IAppUtilPage[];

  /**
   * 应用功能组件集合
   *
   * @type {IAppUtil[]}
   * 来源  getAllPSAppUtils
   */
  appUtils?: IAppUtil[];

  /**
   * 应用视图消息组集合
   *
   * @type {IAppViewMsgGroup[]}
   * 来源  getAllPSAppViewMsgGroups
   */
  appViewMsgGroups?: IAppViewMsgGroup[];

  /**
   * 应用视图消息集合
   *
   * @type {IAppViewMsg[]}
   * 来源  getAllPSAppViewMsgs
   */
  appViewMsgs?: IAppViewMsg[];

  /**
   * 应用工作流集合
   *
   * @type {IAppWF[]}
   * 来源  getAllPSAppWFs
   */
  appWFs?: IAppWF[];

  /**
   * 全局实体操作标识集合
   *
   * @type {IDEOPPriv[]}
   * 来源  getAllPSDEOPPrivs
   */
  deopprivs?: IDEOPPriv[];

  /**
   * 子应用引用集合
   *
   * @type {ISubAppRef[]}
   * 来源  getAllPSSubAppRefs
   */
  subAppRefs?: ISubAppRef[];

  /**
   * 应用目录名称
   * @type {string}
   * 来源  getAppFolder
   */
  appFolder?: string;

  /**
   * 应用模式
   * @description 值模式 [应用模式] {DEFAULT：默认应用、 CLOUDHUBAPP：Cloud集成应用、 CLOUDHUBAPP_PLACEHOLDER：Cloud集成应用（占位）、 CLOUDHUBAPP_PROXY：Cloud集成应用（代理）、 CLOUDHUBSUBAPP：Cloud集成子应用、 CLOUDHUBSUBAPP_EMBEDED：Cloud集成子应用（嵌入）、 WFAPP：工作流应用、 USER：用户自定义、 USER2：用户自定义2、 USER3：用户自定义3、 USER4：用户自定义4 }
   * @type {( string | 'DEFAULT' | 'CLOUDHUBAPP' | 'CLOUDHUBAPP_PLACEHOLDER' | 'CLOUDHUBAPP_PROXY' | 'CLOUDHUBSUBAPP' | 'CLOUDHUBSUBAPP_EMBEDED' | 'WFAPP' | 'USER' | 'USER2' | 'USER3' | 'USER4')}
   * 来源  getAppMode
   */
  appMode?:
    | string
    | 'DEFAULT'
    | 'CLOUDHUBAPP'
    | 'CLOUDHUBAPP_PLACEHOLDER'
    | 'CLOUDHUBAPP_PROXY'
    | 'CLOUDHUBSUBAPP'
    | 'CLOUDHUBSUBAPP_EMBEDED'
    | 'WFAPP'
    | 'USER'
    | 'USER2'
    | 'USER3'
    | 'USER4';

  /**
   * 应用标记
   * @type {string}
   * 来源  getAppTag
   */
  appTag?: string;

  /**
   * 应用标记2
   * @type {string}
   * 来源  getAppTag2
   */
  appTag2?: string;

  /**
   * 应用标记3
   * @type {string}
   * 来源  getAppTag3
   */
  appTag3?: string;

  /**
   * 应用标记4
   * @type {string}
   * 来源  getAppTag4
   */
  appTag4?: string;

  /**
   * 应用类型
   * @type {string}
   * 来源  getAppType
   */
  appType?: string;

  /**
   * 应用版本
   * @type {string}
   * 来源  getAppVersion
   */
  appVersion?: string;

  /**
   * 应用下方信息
   * @type {string}
   * 来源  getBottomInfo
   */
  bottomInfo?: string;

  /**
   * 应用标题
   * @type {string}
   * 来源  getCaption
   */
  caption?: string;

  /**
   * 代码标识
   * @type {string}
   * 来源  getCodeName
   */
  codeName?: string;

  /**
   * 默认对象存储分类
   * @type {string}
   * 来源  getDefaultOSSCat
   */
  defaultOSSCat?: string;

  /**
   * 动态系统模式
   * @description 值模式 [动态系统模式] {0：不启用、 1：启用 }
   * @type {( number | 0 | 1)}
   * @default 0
   * 来源  getDynaSysMode
   */
  dynaSysMode?: number | 0 | 1;

  /**
   * 模型引擎版本
   * @type {number}
   * 来源  getEngineVer
   */
  engineVer?: number;

  /**
   * 应用头部信息
   * @type {string}
   * 来源  getHeaderInfo
   */
  headerInfo?: string;

  /**
   * 前端模板样式
   * @type {string}
   * 来源  getPFStyle
   */
  pfstyle?: string;

  /**
   * 前端模板
   * @type {string}
   * 来源  getPFType
   */
  pftype?: string;

  /**
   * 代码包名称
   * @type {string}
   * 来源  getPKGCodeName
   */
  pkgcodeName?: string;

  /**
   * 应用预载逻辑集合
   *
   * @type {IApplicationLogic[]}
   * 来源  getPSApplicationLogics
   */
  applicationLogics?: IApplicationLogic[];

  /**
   * 开发系统标识
   * @type {string}
   * 来源  getPSDevSlnSysId
   */
  devSlnSysId?: string;

  /**
   * 应用默认图标
   *
   * @type {ISysImage}
   * 来源  getPSSysImage
   */
  sysImage?: ISysImage;

  /**
   * 服务代码名称
   * @type {string}
   * 来源  getServiceCodeName
   */
  serviceCodeName?: string;

  /**
   * 子应用访问标识
   * @type {string}
   * 来源  getSubAppAccessKey
   */
  subAppAccessKey?: string;

  /**
   * 应用子标题
   * @type {string}
   * 来源  getSubCaption
   */
  subCaption?: string;

  /**
   * 系统代码标识
   * @type {string}
   * 来源  getSysCodeName
   */
  sysCodeName?: string;

  /**
   * 应用抬头
   * @type {string}
   * 来源  getTitle
   */
  title?: string;

  /**
   * 视图代码标识模式
   * @description 值模式 [代码标识格式] {LOWER_UNDERSCORE：小写（下划线分隔）、 UPPER_UNDERSCORE：大写（下划线分隔）、 LOWER_CAMEL：驼峰（首字母小写）、 UPPER_CAMEL：驼峰（首字母大写）、 LOWER：小写（直接，不做转换）、 UPPER：大写（直接，不做转换）、 LOWER_HYPHEN：小写（中划线分隔）、 NONE：无转换 }
   * @type {( string | 'LOWER_UNDERSCORE' | 'UPPER_UNDERSCORE' | 'LOWER_CAMEL' | 'UPPER_CAMEL' | 'LOWER' | 'UPPER' | 'LOWER_HYPHEN' | 'NONE')}
   * 来源  getViewCodeNameMode
   */
  viewCodeNameMode?:
    | string
    | 'LOWER_UNDERSCORE'
    | 'UPPER_UNDERSCORE'
    | 'LOWER_CAMEL'
    | 'UPPER_CAMEL'
    | 'LOWER'
    | 'UPPER'
    | 'LOWER_HYPHEN'
    | 'NONE';

  /**
   * 启用服务接口DTO
   * @type {boolean}
   * @default false
   * 来源  isEnableServiceAPIDTO
   */
  enableServiceAPIDTO?: boolean;

  /**
   * 启用统一认证登录
   * @type {boolean}
   * 来源  isEnableUACLogin
   */
  enableUACLogin?: boolean;

  /**
   * 启用界面模型增强
   * @type {boolean}
   * @default false
   * 来源  isEnableUIModelEx
   */
  enableUIModelEx?: boolean;

  /**
   * 移动端应用
   * @type {boolean}
   * 来源  isMobileApp
   */
  mobileApp?: boolean;

  /**
   * 使用服务接口
   * @type {boolean}
   * 来源  isUseServiceApi
   */
  useServiceApi?: boolean;

  /**
   * 流程应用模式
   * @type {boolean}
   * 来源  isWFAppMode
   */
  wfappMode?: boolean;
}
