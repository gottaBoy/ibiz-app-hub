import { IModelDSLGenEngineContext } from '../../imodel-dslgen-engine-context';
import { ModelObjectWriter } from '../../model-object-writer';

export class AppDEFieldWriter2 extends ModelObjectWriter {
  onFillDSL(c: IModelDSLGenEngineContext, s: any, d: any) {
    const _ = this;

    //let iPSAppDEField = src

    _.w(d, 'codeName', s);
    _.x(d, 'computeAppDEFLogicId', s, 'getComputePSAppDEFLogic');
    _.w(d, 'defaultValue', s);
    _.x(d, 'defaultValueAppDEFLogicId', s, 'getDefaultValuePSAppDEFLogic');
    _.w(d, 'defaultValueType', s);
    _.v(d, 'lnlanguageRes', c.s('res.LanguageRes[]', s, 'getLNPSLanguageRes'));
    _.w(d, 'logicName', s);
    _.w(d, 'maxValueString', s);
    _.w(d, 'minStringLength', s, '', 0);
    _.w(d, 'minValueString', s);
    _.x(d, 'onChangeAppDEFLogicId', s, 'getOnChangePSAppDEFLogic');
    _.w(d, 'precision', s, '', 0);
    _.w(d, 'predefinedType', s, '', 'NONE');
    _.v(
      d,
      'qsphlanguageRes',
      c.s('res.LanguageRes[]', s, 'getQSPHPSLanguageRes'),
    );
    _.w(d, 'quickSearchPlaceHolder', s);
    _.w(d, 'scale', s);
    _.w(d, 'stdDataType', s);
    _.w(d, 'stringLength', s, '', 0);
    _.w(d, 'valueFormat', s);
    _.w(d, 'enableQuickSearch', s);

    super.onFillDSL(c, s, d);
  }
}
