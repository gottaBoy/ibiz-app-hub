import { IModelDSLGenEngineContext } from '../../imodel-dslgen-engine-context';
import { EditorWriter } from '../editor-writer';

export class ArrayWriter extends EditorWriter {
  onFillDSL(c: IModelDSLGenEngineContext, s: any, d: any) {
    const _ = this;

    //let iPSArray = src

    _.w(d, 'dataType', s, '', 'STRING');
    _.w(d, 'maxLength', s);
    _.w(d, 'maxValue', s);
    _.w(d, 'minLength', s, '', 0);
    _.w(d, 'minValue', s);
    _.x(d, 'appCodeListId', s, 'getPSAppCodeList');
    _.v(
      d,
      'sysValueRule',
      c.s('valuerule.SysValueRule[]', s, 'getPSSysValueRule'),
    );
    _.w(d, 'precision', s);
    _.w(d, 'scale', s);
    _.w(d, 'showMaxLength', s);

    super.onFillDSL(c, s, d);
  }
}
