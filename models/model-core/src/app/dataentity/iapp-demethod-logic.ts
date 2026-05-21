import { IModelObject } from '../../imodel-object';

/**
 *
 * 应用实体方法附加逻辑对象接口
 * @export
 * @interface IAppDEMethodLogic
 */
export interface IAppDEMethodLogic extends IModelObject {
  /**
   * 行为逻辑类型
   * @description 值模式 [实体行为附加逻辑类型] {1：内部逻辑、 0：外部行为、 2：脚本代码、 3：实体通知、 4：填充实体主状态、 5：实体数据同步、 6：目标数据操作（指定主关系）、 7：目标数据操作（指定数据集）、 8：系统预置逻辑、 9：属性值转换、 10：属性值序列填充、 11：目标实体逻辑、 50：检查属性值规则、 51：检查数据主状态（处于）、 52：检查数据主状态（不处于）、 53：检查目标数据存在（指定主关系）、 54：检查目标数据不存在（指定主关系）、 55：检查目标数据存在（指定数据集）、 56：检查目标数据不存在（指定数据集） }
   * @type {( number | 1 | 0 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 50 | 51 | 52 | 53 | 54 | 55 | 56)}
   * @default -1
   * 来源  getActionLogicType
   */
  actionLogicType?:
    | number
    | 1
    | 0
    | 2
    | 3
    | 4
    | 5
    | 6
    | 7
    | 8
    | 9
    | 10
    | 11
    | 50
    | 51
    | 52
    | 53
    | 54
    | 55
    | 56;

  /**
   * 附加模式
   * @description 值模式 [实体行为逻辑附加模式] {PREPARE：准备、 CHECK：检查、 BEFORE：执行之前、 AFTER：执行之后 }
   * @type {( string | 'PREPARE' | 'CHECK' | 'BEFORE' | 'AFTER')}
   * 来源  getAttachMode
   */
  attachMode?: string | 'PREPARE' | 'CHECK' | 'BEFORE' | 'AFTER';

  /**
   * 脚本代码
   * @type {string}
   * 来源  getScriptCode
   */
  scriptCode?: string;

  /**
   * 忽略异常
   * @type {boolean}
   * @default false
   * 来源  isIgnoreException
   */
  ignoreException?: boolean;
}
