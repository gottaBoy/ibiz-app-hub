import { IModelDSLGenEngineContext } from '../../imodel-dslgen-engine-context';
import { CodeListEditorWriter } from './code-list-editor-writer';

export class SpanWriter extends CodeListEditorWriter {
  onFillDSL(c: IModelDSLGenEngineContext, s: any, d: any) {
    const _ = this;

    //let iPSSpan = src

    _.w(d, 'halign', s, 'hAlign', 'LEFT');
    _.x(d, 'linkAppViewId', s, 'getLinkPSAppView');
    _.w(d, 'precision', s);
    _.w(d, 'renderMode', s);
    _.w(d, 'scale', s);
    _.w(d, 'valign', s, 'vAlign', 'MIDDLE');
    _.w(d, 'wrapMode', s, '', 'NOWRAP');
    _.w(d, 'enableLinkView', s);

    super.onFillDSL(c, s, d);
  }
}
