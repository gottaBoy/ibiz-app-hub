import { IModelDSLGenEngineContext } from '../../imodel-dslgen-engine-context';
import { ModelObjectWriter } from '../../model-object-writer';

export class DEUIActionGroupDetailWriter extends ModelObjectWriter {
  onFillDSL(c: IModelDSLGenEngineContext, s: any, d: any) {
    const _ = this;

    //let iPSDEUIActionGroupDetail = src

    _.w(d, 'actionLevel', s, '', 100);
    _.w(d, 'afterContent', s);
    _.w(d, 'afterItemType', s, '', 'NONE');
    _.v(
      d,
      'afterLanguageRes',
      c.s('res.LanguageRes[]', s, 'getAfterPSLanguageRes'),
    );
    _.w(d, 'beforeContent', s);
    _.w(d, 'beforeItemType', s, '', 'NONE');
    _.v(
      d,
      'beforeLanguageRes',
      c.s('res.LanguageRes[]', s, 'getBeforePSLanguageRes'),
    );
    _.w(d, 'buttonStyle', s, '', 'DEFAULT');
    _.v(
      d,
      'capLanguageRes',
      c.s('res.LanguageRes[]', s, 'getCapPSLanguageRes'),
    );
    _.w(d, 'caption', s);
    _.w(d, 'codeName', s);
    _.w(d, 'detailTag', s);
    _.w(d, 'detailTag2', s);
    _.w(d, 'detailType', s);
    _.w(d, 'enableScriptCode', s);
    _.x(d, 'sysPFPluginId', s, 'getPSSysPFPlugin');
    _.x(d, 'uiactionId', s, 'getPSUIAction');
    _.v(
      d,
      'refUIActionGroup',
      c.s('view.UIActionGroup[]', s, 'getRefPSUIActionGroup'),
    );
    _.w(d, 'tooltip', s);
    _.v(
      d,
      'tooltipLanguageRes',
      c.s('res.LanguageRes[]', s, 'getTooltipPSLanguageRes'),
    );
    _.w(d, 'uiactionParamJO', s, 'uIActionParamJO');
    _.w(d, 'visibleScriptCode', s);
    _.w(d, 'addSeparator', s);
    _.w(d, 'showCaption', s);
    _.w(d, 'showIcon', s);

    //let iPSAppDEUIActionGroupDetail = src

    _.v(d, 'afterSysCss', c.s('res.SysCss[]', s, 'getAfterPSSysCss'));
    _.v(d, 'beforeSysCss', c.s('res.SysCss[]', s, 'getBeforePSSysCss'));
    _.v(d, 'sysCss', c.s('res.SysCss[]', s, 'getPSSysCss'));
    _.v(d, 'sysImage', c.s('res.SysImage[]', s, 'getPSSysImage'));

    super.onFillDSL(c, s, d);
  }
}
