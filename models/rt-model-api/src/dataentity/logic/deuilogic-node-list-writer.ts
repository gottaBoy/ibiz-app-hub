import { ModelListWriterBase } from '../../model-list-writer-base';
import { IModelDSLGenEngineContext } from '../../imodel-dslgen-engine-context';

export class DEUILogicNodeListWriter extends ModelListWriterBase {
  onFillDSLList(c: IModelDSLGenEngineContext, src: any[], dst: any[]): void {
    const _ = this;
    src.forEach(item => {
      const dsl = {};
      _.fillDSL(c, item, dsl);
      dst.push(dsl);
    });
    //super.onFillDSLList(context, src, dst)
  }

  onFillDSL(c: IModelDSLGenEngineContext, src: any, dst: any): void {
    switch (src['logicNodeType']) {
      case 'APPENDPARAM':
        c.fillDSL('dataentity.logic.DEUIAppendParamLogic', src, dst);
        return;
      case 'BEGIN':
        c.fillDSL('dataentity.logic.DEUIBeginLogic', src, dst);
        return;
      case 'BINDPARAM':
        c.fillDSL('dataentity.logic.DEUIBindParamLogic', src, dst);
        return;
      case 'COPYPARAM':
        c.fillDSL('dataentity.logic.DEUICopyParamLogic', src, dst);
        return;
      case 'DEACTION':
        c.fillDSL('dataentity.logic.DEUIDEActionLogic', src, dst);
        return;
      case 'DEBUGPARAM':
        c.fillDSL('dataentity.logic.DEUIDebugParamLogic', src, dst);
        return;
      case 'DECISION':
        c.fillDSL('dataentity.logic.DEUIDecisionLogic', src, dst);
        return;
      case 'DEDATASET':
        c.fillDSL('dataentity.logic.DEUIDEDataSetLogic', src, dst);
        return;
      case 'DELOGIC':
        c.fillDSL('dataentity.logic.DEUIDELogicLogic', src, dst);
        return;
      case 'DEUIACTION':
        c.fillDSL('dataentity.logic.DEUIActionLogic', src, dst);
        return;
      case 'END':
        c.fillDSL('dataentity.logic.DEUIEndLogic', src, dst);
        return;
      case 'MEMO':
        c.fillDSL('dataentity.logic.DEUIMemoLogic', src, dst);
        return;
      case 'MSGBOX':
        c.fillDSL('dataentity.logic.DEUIMsgBoxLogic', src, dst);
        return;
      case 'PFPLUGIN':
        c.fillDSL('dataentity.logic.DEUIPFPluginLogic', src, dst);
        return;
      case 'RAWJSCODE':
        c.fillDSL('dataentity.logic.DEUIRawCodeLogic', src, dst);
        return;
      case 'RENEWPARAM':
        c.fillDSL('dataentity.logic.DEUIRenewParamLogic', src, dst);
        return;
      case 'RESETPARAM':
        c.fillDSL('dataentity.logic.DEUIResetParamLogic', src, dst);
        return;
      case 'SORTPARAM':
        c.fillDSL('dataentity.logic.DEUISortParamLogic', src, dst);
        return;
      case 'THROWEXCEPTION':
        c.fillDSL('dataentity.logic.DEUIThrowExceptionLogic', src, dst);
        return;
      case 'VIEWCTRLFIREEVENT':
        c.fillDSL('dataentity.logic.DEUICtrlFireEventLogic', src, dst);
        return;
      case 'VIEWCTRLINVOKE':
        c.fillDSL('dataentity.logic.DEUICtrlInvokeLogic', src, dst);
        return;
    }
    c.fillDSL('dataentity.logic.DEUILogicNode', src, dst);
    //super.onFillDSL(context, src, dst)
  }
}
