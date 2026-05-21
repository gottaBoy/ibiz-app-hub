import { IUIActionGroup } from '../../view/iuiaction-group';

/**
 *
 * 实体界面行为组模型对象接口
 * @export
 * @interface IDEUIActionGroup
 */
export interface IDEUIActionGroup extends IUIActionGroup {
  /**
   * 动态模式
   * @description 值模式 [AI代理动态模式] {0：静态内容、 1：实体数据集 }
   * @type {( number | 0 | 1)}
   * @default 0
   * 来源  getDynamicMode
   */
  dynamicMode?: number | 0 | 1;
}
