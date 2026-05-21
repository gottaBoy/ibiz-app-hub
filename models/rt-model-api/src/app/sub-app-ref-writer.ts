import { IModelDSLGenEngineContext } from '../imodel-dslgen-engine-context';
import { ModelObjectWriter } from '../model-object-writer';

export class SubAppRefWriter extends ModelObjectWriter {
  onFillDSL(c: IModelDSLGenEngineContext, s: any, d: any) {
    const _ = this;

    //let iPSSubAppRef = src

    _.w(d, 'accessKey', s);
    _.y(d, 'appDEUIActionGroupIds', s, 'getAllPSAppDEUIActionGroups');
    _.y(d, 'appMenuModelIds', s, 'getAllPSAppMenuModels');
    _.y(d, 'appPFPluginRefIds', s, 'getAllPSAppPFPluginRefs');
    _.y(d, 'appPortletIds', s, 'getAllPSAppPortlets');
    _.y(d, 'appViewRefIds', s, 'getAllPSAppViewRefs');
    _.y(d, 'appViewIds', s, 'getAllPSAppViews');
    _.y(d, 'controlIds', s, 'getAllPSControls');
    _.y(d, 'dedrcontrolIds', s, 'getAllPSDEDRControls');
    _.w(d, 'modelStamp', s);
    _.v(
      d,
      'appMenuModel',
      c.s('app.appmenu.AppMenuModel[]', s, 'getPSAppMenuModel'),
    );
    _.w(d, 'devSlnSysId', s, 'getPSDevSlnSysId');
    _.w(d, 'refParam', s);
    _.w(d, 'refParam2', s);
    _.w(d, 'serviceId', s);
    _.w(d, 'sysRefType', s);

    super.onFillDSL(c, s, d);
  }
}
