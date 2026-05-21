import { IModelDSLGenEngineContext } from '../imodel-dslgen-engine-context';
import { ModelObjectWriter } from '../model-object-writer';

export class LanguageResWriter extends ModelObjectWriter {
  onFillDSL(c: IModelDSLGenEngineContext, s: any, d: any) {
    const _ = this;

    //let iPSLanguageRes = src

    _.w(d, 'codeName', s);
    _.w(d, 'defaultContent', s);
    _.w(d, 'lanResTag', s);
    _.w(d, 'lanResType', s);
    _.w(d, 'refFlag', s);

    super.onFillDSL(c, s, d);
  }
}
