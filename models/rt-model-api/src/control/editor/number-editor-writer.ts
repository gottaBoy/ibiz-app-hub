import { IModelDSLGenEngineContext } from '../../imodel-dslgen-engine-context';
import { EditorWriter } from '../editor-writer';

export class NumberEditorWriter extends EditorWriter {
  onFillDSL(c: IModelDSLGenEngineContext, s: any, d: any) {
    const _ = this;

    //let iPSNumberEditor = src

    _.w(d, 'maxValue', s);
    _.w(d, 'minValue', s);
    _.v(
      d,
      'sysValueRule',
      c.s('valuerule.SysValueRule[]', s, 'getPSSysValueRule'),
    );
    _.w(d, 'precision', s);
    _.w(d, 'scale', s);

    super.onFillDSL(c, s, d);
  }
}
