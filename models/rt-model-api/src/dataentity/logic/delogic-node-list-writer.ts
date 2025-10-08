import { ModelListWriterBase } from '../../model-list-writer-base';
import { IModelDSLGenEngineContext } from '../../imodel-dslgen-engine-context';

export class DELogicNodeListWriter extends ModelListWriterBase {
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
        c.fillDSL('dataentity.logic.DEAppendParamLogic', src, dst);
        return;
      case 'BEGIN':
        c.fillDSL('dataentity.logic.DEBeginLogic', src, dst);
        return;
      case 'BINDPARAM':
        c.fillDSL('dataentity.logic.DEBindParamLogic', src, dst);
        return;
      case 'COPYPARAM':
        c.fillDSL('dataentity.logic.DECopyParamLogic', src, dst);
        return;
      case 'DEACTION':
        c.fillDSL('dataentity.logic.DEDEActionLogic', src, dst);
        return;
      case 'DEBUGPARAM':
        c.fillDSL('dataentity.logic.DEDebugParamLogic', src, dst);
        return;
      case 'DECISION':
        c.fillDSL('dataentity.logic.DEDecisionLogic', src, dst);
        return;
      case 'DEDATAQUERY':
        c.fillDSL('dataentity.logic.DEDEDataQueryLogic', src, dst);
        return;
      case 'DEDATASET':
        c.fillDSL('dataentity.logic.DEDEDataSetLogic', src, dst);
        return;
      case 'DELOGIC':
        c.fillDSL('dataentity.logic.DEDELogicLogic', src, dst);
        return;
      case 'END':
        c.fillDSL('dataentity.logic.DEEndLogic', src, dst);
        return;
      case 'MEMO':
        c.fillDSL('dataentity.logic.DEMemoLogic', src, dst);
        return;
      case 'PREPAREPARAM':
        c.fillDSL('dataentity.logic.DEPrepareParamLogic', src, dst);
        return;
      case 'RAWSFCODE':
        c.fillDSL('dataentity.logic.DERawCodeLogic', src, dst);
        return;
      case 'RENEWPARAM':
        c.fillDSL('dataentity.logic.DERenewParamLogic', src, dst);
        return;
      case 'RESETPARAM':
        c.fillDSL('dataentity.logic.DEResetParamLogic', src, dst);
        return;
      case 'SORTPARAM':
        c.fillDSL('dataentity.logic.DESortParamLogic', src, dst);
        return;
      case 'STARTWF':
        c.fillDSL('dataentity.logic.DEStartWFLogic', src, dst);
        return;
      case 'THROWEXCEPTION':
        c.fillDSL('dataentity.logic.DEThrowExceptionLogic', src, dst);
        return;
    }

    //super.onFillDSL(context, src, dst)
  }
}
