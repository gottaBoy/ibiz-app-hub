import { IModelDSLGenEngineContext } from '../../imodel-dslgen-engine-context';
import { ModelObjectWriter } from '../../model-object-writer';

export class SysSearchBarItemWriterBase extends ModelObjectWriter {
  onFillDSL(c: IModelDSLGenEngineContext, s: any, d: any) {
    const _ = this;

    //let iPSSysSearchBarItem = src

    _.v(
      d,
      'capLanguageRes',
      c.s('res.LanguageRes[]', s, 'getCapPSLanguageRes'),
    );
    _.w(d, 'caption', s);
    _.w(d, 'counterId', s);
    _.w(d, 'counterMode', s, '', 0);
    _.w(d, 'cssStyle', s);
    _.w(d, 'data', s);
    _.w(d, 'dynaClass', s);
    _.w(d, 'itemType', s);
    _.w(d, 'labelCssStyle', s);
    _.w(d, 'labelDynaClass', s);
    _.v(d, 'labelSysCss', c.s('res.SysCss[]', s, 'getLabelPSSysCss'));
    _.x(d, 'appCounterRefId', s, 'getPSAppCounterRef');
    _.x(d, 'appDEFieldId', s, 'getPSAppDEField');
    _.v(
      d,
      'controlAttributes',
      c.m('control.ControlAttribute[]', s, 'getPSControlAttributes'),
    );
    _.v(
      d,
      'controlLogics',
      c.m('control.ControlLogic[]', s, 'getPSControlLogics'),
    );
    _.v(
      d,
      'controlRenders',
      c.m('control.ControlRender[]', s, 'getPSControlRenders'),
    );
    _.v(d, 'sysCss', c.s('res.SysCss[]', s, 'getPSSysCss'));
    _.v(d, 'sysImage', c.s('res.SysImage[]', s, 'getPSSysImage'));

    super.onFillDSL(c, s, d);
  }
}
