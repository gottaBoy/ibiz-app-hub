import { IModelDSLGenEngineContext } from '../../imodel-dslgen-engine-context';
import { ModelObjectWriter } from '../../model-object-writer';

export class DELogicWriter extends ModelObjectWriter {
  onFillDSL(c: IModelDSLGenEngineContext, s: any, d: any) {
    const _ = this;

    //let iPSDELogic = src

    _.w(d, 'codeName', s);
    _.w(d, 'debugMode', s, '', 0);
    _.w(d, 'defaultParamName', s);
    _.w(d, 'eventModel', s);
    _.w(d, 'events', s);
    _.w(d, 'logicName', s);
    _.w(d, 'logicSubType', s, '', 'NONE');
    _.w(d, 'logicTag', s);
    _.w(d, 'logicTag2', s);
    _.w(d, 'logicTag3', s);
    _.w(d, 'logicTag4', s);
    _.v(
      d,
      'delogicNodes',
      c.m('dataentity.logic.DELogicNode[]', s, 'getPSDELogicNodes'),
    );
    _.v(
      d,
      'delogicParams',
      c.m('dataentity.logic.DELogicParam[]', s, 'getPSDELogicParams'),
    );
    _.w(d, 'scriptCode', s);
    _.x(d, 'startDELogicNodeId', s, 'getStartPSDELogicNode');
    _.w(d, 'threadMode', s, '', 0);
    _.w(d, 'customCode', s);
    _.w(d, 'enableBackend', s);
    _.w(d, 'enableFront', s);
    _.w(d, 'ignoreException', s);
    _.w(d, 'template', s);
    _.w(d, 'valid', s, '', true);

    super.onFillDSL(c, s, d);
  }
}
