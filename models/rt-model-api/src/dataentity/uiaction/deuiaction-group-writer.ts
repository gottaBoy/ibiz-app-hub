import { IModelDSLGenEngineContext } from '../../imodel-dslgen-engine-context';
import { ModelObjectWriter } from '../../model-object-writer';

export class DEUIActionGroupWriter extends ModelObjectWriter {
  onFillDSL(c: IModelDSLGenEngineContext, s: any, d: any) {
    const _ = this;

    //let iPSDEUIActionGroup = src

    _.w(d, 'dynamicMode', s, '', 0);
    _.w(d, 'groupTag', s);
    _.w(d, 'groupTag2', s);
    _.w(d, 'groupTag3', s);
    _.w(d, 'groupTag4', s);
    _.v(
      d,
      'uiactionGroupDetails',
      c.m('view.UIActionGroupDetail[]', s, 'getPSUIActionGroupDetails'),
    );

    //let iPSAppDEUIActionGroup = src

    _.x(d, 'actionLevelAppDEFieldId', s, 'getActionLevelPSAppDEField');
    _.x(d, 'buttonStyleAppDEFieldId', s, 'getButtonStylePSAppDEField');
    _.x(d, 'clsAppDEFieldId', s, 'getClsPSAppDEField');
    _.x(d, 'detailAppDEDataSetId', s, 'getDetailPSAppDEDataSet');
    _.x(d, 'detailAppDataEntityId', s, 'getDetailPSAppDataEntity');
    _.x(d, 'enableScriptAppDEFieldId', s, 'getEnableScriptPSAppDEField');
    _.x(d, 'iconClsAppDEFieldId', s, 'getIconClsPSAppDEField');
    _.x(d, 'appDataEntityId', s, 'getPSAppDataEntity');
    _.x(d, 'textAppDEFieldId', s, 'getTextPSAppDEField');
    _.x(d, 'tipsAppDEFieldId', s, 'getTipsPSAppDEField');
    _.x(d, 'uiactionTagAppDEFieldId', s, 'getUIActionTagPSAppDEField');
    _.w(d, 'uniqueTag', s);
    _.x(d, 'visibleScriptAppDEFieldId', s, 'getVisibleScriptPSAppDEField');

    super.onFillDSL(c, s, d);
  }
}
