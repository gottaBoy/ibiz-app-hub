import { ILanguageRes } from '../../res/ilanguage-res';
import { IUIActionGroup } from '../../view/iuiaction-group';
import { IUIActionGroupDetail } from '../../view/iuiaction-group-detail';

/**
 *
 * 实体界面行为组成员模型对象接口
 * @export
 * @interface IDEUIActionGroupDetail
 */
export interface IDEUIActionGroupDetail extends IUIActionGroupDetail {
  /**
   * 后置内容
   * @type {string}
   * 来源  getAfterContent
   */
  afterContent?: string;

  /**
   * 后置内容类型
   * @description 值模式 [界面行为成员项附加内容类型] {NONE：无、 RAW：直接内容 }
   * @type {( string | 'NONE' | 'RAW')}
   * @default NONE
   * 来源  getAfterItemType
   */
  afterItemType?: string | 'NONE' | 'RAW';

  /**
   * 后置内容语言资源对象
   *
   * @type {ILanguageRes}
   * 来源  getAfterPSLanguageRes
   */
  afterLanguageRes?: ILanguageRes;

  /**
   * 前置内容
   * @type {string}
   * 来源  getBeforeContent
   */
  beforeContent?: string;

  /**
   * 前置内容类型
   * @description 值模式 [界面行为成员项附加内容类型] {NONE：无、 RAW：直接内容 }
   * @type {( string | 'NONE' | 'RAW')}
   * @default NONE
   * 来源  getBeforeItemType
   */
  beforeItemType?: string | 'NONE' | 'RAW';

  /**
   * 前置内容语言资源对象
   *
   * @type {ILanguageRes}
   * 来源  getBeforePSLanguageRes
   */
  beforeLanguageRes?: ILanguageRes;

  /**
   * 标题语言资源对象
   *
   * @type {ILanguageRes}
   * 来源  getCapPSLanguageRes
   */
  capLanguageRes?: ILanguageRes;

  /**
   * 成员类型
   * @description 值模式 [云平台工具栏项类型（界面行为组成员）] {DEUIACTION：实体界面行为、DEUIACTIONGROUP:实体界面行为分组 }
   * @type {( string | 'DEUIACTION')}
   * 来源  getDetailType
   */
  detailType?: string | 'DEUIACTION' | 'DEUIACTIONGROUP';

  /**
   * 引用界面行为对象
   *
   * @type {IUIActionGroup}
   * 来源  getRefPSUIActionGroup
   */
  refUIActionGroup?: IUIActionGroup;

  /**
   * 提示语言资源对象
   *
   * @type {ILanguageRes}
   * 来源  getTooltipPSLanguageRes
   */
  tooltipLanguageRes?: ILanguageRes;
}
