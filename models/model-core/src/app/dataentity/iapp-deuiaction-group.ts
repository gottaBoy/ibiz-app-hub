import { IDEUIActionGroup } from '../../dataentity/uiaction/ideuiaction-group';

/**
 *
 * 应用实体界面行为组模型对象接口
 * @export
 * @interface IAppDEUIActionGroup
 */
export interface IAppDEUIActionGroup extends IDEUIActionGroup {
  /**
   * 成员行为级别应用实体属性对象
   *
   * @type {string}
   * 来源  getActionLevelPSAppDEField
   */
  actionLevelAppDEFieldId?: string;

  /**
   * 成员按钮样式应用实体属性对象
   *
   * @type {string}
   * 来源  getButtonStylePSAppDEField
   */
  buttonStyleAppDEFieldId?: string;

  /**
   * 成员样式表提示应用实体属性对象
   *
   * @type {string}
   * 来源  getClsPSAppDEField
   */
  clsAppDEFieldId?: string;

  /**
   * 成员数据应用实体数据集对象
   *
   * @type {string}
   * 来源  getDetailPSAppDEDataSet
   */
  detailAppDEDataSetId?: string;

  /**
   * 成员数据应用实体对象
   *
   * @type {string}
   * 来源  getDetailPSAppDataEntity
   */
  detailAppDataEntityId?: string;

  /**
   * 成员启用脚本应用实体属性对象
   *
   * @type {string}
   * 来源  getEnableScriptPSAppDEField
   */
  enableScriptAppDEFieldId?: string;

  /**
   * 成员图标样式表应用实体属性对象
   *
   * @type {string}
   * 来源  getIconClsPSAppDEField
   */
  iconClsAppDEFieldId?: string;

  /**
   * 应用实体
   *
   * @type {string}
   * 来源  getPSAppDataEntity
   */
  appDataEntityId?: string;

  /**
   * 成员文本应用实体属性对象
   *
   * @type {string}
   * 来源  getTextPSAppDEField
   */
  textAppDEFieldId?: string;

  /**
   * 成员提示应用实体属性对象
   *
   * @type {string}
   * 来源  getTipsPSAppDEField
   */
  tipsAppDEFieldId?: string;

  /**
   * 成员界面行为标记应用实体属性对象
   *
   * @type {string}
   * 来源  getUIActionTagPSAppDEField
   */
  uiactionTagAppDEFieldId?: string;

  /**
   * 唯一标记
   * @type {string}
   * 来源  getUniqueTag
   */
  uniqueTag?: string;

  /**
   * 成员显示脚本应用实体属性对象
   *
   * @type {string}
   * 来源  getVisibleScriptPSAppDEField
   */
  visibleScriptAppDEFieldId?: string;
}
