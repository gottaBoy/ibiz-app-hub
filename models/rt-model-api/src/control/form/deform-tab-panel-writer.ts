import { IModelDSLGenEngineContext } from '../../imodel-dslgen-engine-context';
import { DEFormDetailWriter } from './deform-detail-writer';

export class DEFormTabPanelWriter extends DEFormDetailWriter {
  onFillDSL(c: IModelDSLGenEngineContext, s: any, d: any) {
    const _ = this;

    //let iPSDEFormTabPanel = src

    _.w(d, 'dataRelationTag', s);
    _.v(
      d,
      'deformTabPages',
      c.m('control.form.DEFormTabPage[]', s, 'getPSDEFormTabPages'),
    );

    super.onFillDSL(c, s, d);
  }
}
