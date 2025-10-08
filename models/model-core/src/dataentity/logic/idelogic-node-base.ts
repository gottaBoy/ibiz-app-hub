import { IModelObject } from '../../imodel-object';

/**
 *
 * 实体逻辑节点模型基础对象接口
 * @export
 * @interface IDELogicNodeBase
 */
export interface IDELogicNodeBase extends IModelObject {
  /**
   * 代码标识
   * @type {string}
   * 来源  getCodeName
   */
  codeName?: string;

  /**
   * 高度
   * @type {number}
   * @default 0
   * 来源  getHeight
   */
  height?: number;

  /**
   * 左侧位置
   * @type {number}
   * @default 0
   * 来源  getLeftPos
   */
  leftPos?: number;

  /**
   * 逻辑节点类型
   * @description 值模式 [实体逻辑处理节点类型] {BEGIN：开始、 DEACTION：实体行为、 PREPAREPARAM：准备参数、 RESETPARAM：重置参数、 COPYPARAM：拷贝参数、 BINDPARAM：绑定参数、 APPENDPARAM：附加到数组参数、 SORTPARAM：排序数组参数、 RENEWPARAM：重新建立参数、 FILTERPARAM：过滤数组参数、 FILTERPARAM2：过滤数组参数2、 MERGEPARAM：合并数组参数、 AGGREGATEPARAM：聚合数组参数、 LOOPSUBCALL：循环子调用、 RAWSQLCALL：直接SQL调用、 RAWSQLANDLOOPCALL：直接SQL并循环调用、 RAWWEBCALL：直接Web调用、 STARTWF：启动流程、 CANCELWF：取消流程、 SUBMITWF：提交流程操作、 THROWEXCEPTION：抛出异常、 SFPLUGIN：系统服务插件、 RAWSFCODE：直接后台代码、 SYSLOGIC：系统逻辑处理、 SYSUTIL：系统功能组件处理、 PREPAREJSPARAM：准备参数、 VIEWCTRLINVOKE：视图部件调用、 RAWJSCODE：直接前台代码、 MSGBOX：消息弹窗、 PFPLUGIN：前端插件调用、 DEUIACTION：实体界面行为调用、 MAINSTATE：主状态、 DEDATASET：实体数据集、 DENOTIFY：实体通知、 DELOGIC：实体逻辑、 COMMIT：提交事务、 ROLLBACK：回滚事务、 DEBUGPARAM：调试逻辑参数、 DEDATAQUERY：实体数据查询、 DEPRINT：实体打印、 DEREPORT：实体报表、 DEDTSQUEUE：实体异步处理队列、 DEDATASYNC：实体数据同步、 DEDATAIMP：实体数据导入、 DEDATAEXP：实体数据导出、 DEDATAAUDIT：实体访问审计、 SUBSYSSAMETHOD：外部服务接口方法、 SYSDATASYNCAGENTOUT：系统数据同步代理输出、 SYSDBTABLEACTION：系统数据库表操作、 SYSBDTABLEACTION：系统大数据表操作、 SYSSEARCHDOCACTION：系统检索文档操作、 SYSBIREPORT：系统智能报表、 SYSAICHATAGENT：系统AI交谈、 SYSAIPIPELINEAGENT：系统AI生产线、 DECISION：决策、 MEMO：备注、 END：结束 }
   * @type {( string | 'BEGIN' | 'DEACTION' | 'PREPAREPARAM' | 'RESETPARAM' | 'COPYPARAM' | 'BINDPARAM' | 'APPENDPARAM' | 'SORTPARAM' | 'RENEWPARAM' | 'FILTERPARAM' | 'FILTERPARAM2' | 'MERGEPARAM' | 'AGGREGATEPARAM' | 'LOOPSUBCALL' | 'RAWSQLCALL' | 'RAWSQLANDLOOPCALL' | 'RAWWEBCALL' | 'STARTWF' | 'CANCELWF' | 'SUBMITWF' | 'THROWEXCEPTION' | 'SFPLUGIN' | 'RAWSFCODE' | 'SYSLOGIC' | 'SYSUTIL' | 'PREPAREJSPARAM' | 'VIEWCTRLINVOKE' | 'RAWJSCODE' | 'MSGBOX' | 'PFPLUGIN' | 'DEUIACTION' | 'MAINSTATE' | 'DEDATASET' | 'DENOTIFY' | 'DELOGIC' | 'COMMIT' | 'ROLLBACK' | 'DEBUGPARAM' | 'DEDATAQUERY' | 'DEPRINT' | 'DEREPORT' | 'DEDTSQUEUE' | 'DEDATASYNC' | 'DEDATAIMP' | 'DEDATAEXP' | 'DEDATAAUDIT' | 'SUBSYSSAMETHOD' | 'SYSDATASYNCAGENTOUT' | 'SYSDBTABLEACTION' | 'SYSBDTABLEACTION' | 'SYSSEARCHDOCACTION' | 'SYSBIREPORT' | 'SYSAICHATAGENT' | 'SYSAIPIPELINEAGENT' | 'DECISION' | 'MEMO' | 'END')}
   * 来源  getLogicNodeType
   */
  logicNodeType?:
    | string
    | 'BEGIN'
    | 'DEACTION'
    | 'PREPAREPARAM'
    | 'RESETPARAM'
    | 'COPYPARAM'
    | 'BINDPARAM'
    | 'APPENDPARAM'
    | 'SORTPARAM'
    | 'RENEWPARAM'
    | 'FILTERPARAM'
    | 'FILTERPARAM2'
    | 'MERGEPARAM'
    | 'AGGREGATEPARAM'
    | 'LOOPSUBCALL'
    | 'RAWSQLCALL'
    | 'RAWSQLANDLOOPCALL'
    | 'RAWWEBCALL'
    | 'STARTWF'
    | 'CANCELWF'
    | 'SUBMITWF'
    | 'THROWEXCEPTION'
    | 'SFPLUGIN'
    | 'RAWSFCODE'
    | 'SYSLOGIC'
    | 'SYSUTIL'
    | 'PREPAREJSPARAM'
    | 'VIEWCTRLINVOKE'
    | 'RAWJSCODE'
    | 'MSGBOX'
    | 'PFPLUGIN'
    | 'DEUIACTION'
    | 'MAINSTATE'
    | 'DEDATASET'
    | 'DENOTIFY'
    | 'DELOGIC'
    | 'COMMIT'
    | 'ROLLBACK'
    | 'DEBUGPARAM'
    | 'DEDATAQUERY'
    | 'DEPRINT'
    | 'DEREPORT'
    | 'DEDTSQUEUE'
    | 'DEDATASYNC'
    | 'DEDATAIMP'
    | 'DEDATAEXP'
    | 'DEDATAAUDIT'
    | 'SUBSYSSAMETHOD'
    | 'SYSDATASYNCAGENTOUT'
    | 'SYSDBTABLEACTION'
    | 'SYSBDTABLEACTION'
    | 'SYSSEARCHDOCACTION'
    | 'SYSBIREPORT'
    | 'SYSAICHATAGENT'
    | 'SYSAIPIPELINEAGENT'
    | 'DECISION'
    | 'MEMO'
    | 'END';

  /**
   * 上方位置
   * @type {number}
   * @default 0
   * 来源  getTopPos
   */
  topPos?: number;

  /**
   * 宽度
   * @type {number}
   * @default 0
   * 来源  getWidth
   */
  width?: number;

  /**
   * 平行输出
   * @type {boolean}
   * @default false
   * 来源  isParallelOutput
   */
  parallelOutput?: boolean;
}
