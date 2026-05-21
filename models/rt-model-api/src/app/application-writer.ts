import { IModelDSLGenEngineContext } from '../imodel-dslgen-engine-context';
import { ModelObjectWriter } from '../model-object-writer';

export class ApplicationWriter extends ModelObjectWriter {
  onFillDSL(c: IModelDSLGenEngineContext, s: any, d: any) {
    const _ = this;

    //let iPSApplication = src

    _.w(d, 'accessKeys', s, 'accessKeys');
    _.y(d, 'appBISchemeIds', s, 'getAllPSAppBISchemes');
    _.v(
      d,
      'appDEFInputTipSets',
      c.m('app.res.AppDEFInputTipSet[]', s, 'getAllPSAppDEFInputTipSets'),
    );
    _.v(
      d,
      'appDEUIActions',
      c.m('app.dataentity.AppDEUIAction[]', s, 'getAllPSAppDEUIActions'),
    );
    _.v(d, 'appFuncs', c.m('app.func.AppFunc[]', s, 'getAllPSAppFuncs'));
    _.v(
      d,
      'appMethodDTOs',
      c.m('app.AppMethodDTO[]', s, 'getAllPSAppMethodDTOs'),
    );
    _.v(
      d,
      'appMsgTempls',
      c.m('app.msg.AppMsgTempl[]', s, 'getAllPSAppMsgTempls'),
    );
    _.v(
      d,
      'appPFPluginRefs',
      c.m('app.res.AppPFPluginRef[]', s, 'getAllPSAppPFPluginRefs'),
    );
    _.v(
      d,
      'appPortletCats',
      c.m('app.control.AppPortletCat[]', s, 'getAllPSAppPortletCats'),
    );
    _.v(
      d,
      'appPortlets',
      c.m('app.control.AppPortlet[]', s, 'getAllPSAppPortlets'),
    );
    _.v(d, 'appResources', c.m('app.AppResource[]', s, 'getAllPSAppResources'));
    _.v(
      d,
      'appSubViewTypeRefs',
      c.m('app.res.AppSubViewTypeRef[]', s, 'getAllPSAppSubViewTypeRefs'),
    );
    _.v(
      d,
      'appUILogics',
      c.m('app.logic.AppUILogic[]', s, 'getAllPSAppUILogics'),
    );
    _.v(
      d,
      'appUIThemes',
      c.m('app.theme.AppUITheme[]', s, 'getAllPSAppUIThemes'),
    );
    _.v(d, 'appUtilPages', c.m('app.AppUtilPage[]', s, 'getAllPSAppUtilPages'));
    _.v(d, 'appUtils', c.m('app.util.AppUtil[]', s, 'getAllPSAppUtils'));
    _.v(
      d,
      'appViewMsgGroups',
      c.m('app.view.AppViewMsgGroup[]', s, 'getAllPSAppViewMsgGroups'),
    );
    _.v(
      d,
      'appViewMsgs',
      c.m('app.view.AppViewMsg[]', s, 'getAllPSAppViewMsgs'),
    );
    _.v(d, 'appWFs', c.m('app.wf.AppWF[]', s, 'getAllPSAppWFs'));
    _.v(
      d,
      'deopprivs',
      c.m('dataentity.priv.DEOPPriv[]', s, 'getAllPSDEOPPrivs'),
    );
    _.v(d, 'subAppRefs', c.m('app.SubAppRef[]', s, 'getAllPSSubAppRefs'));
    _.w(d, 'appFolder', s);
    _.w(d, 'appMode', s);
    _.w(d, 'appTag', s);
    _.w(d, 'appTag2', s);
    _.w(d, 'appTag3', s);
    _.w(d, 'appTag4', s);
    _.w(d, 'appType', s);
    _.w(d, 'appVersion', s);
    _.w(d, 'bottomInfo', s);
    _.w(d, 'caption', s);
    _.w(d, 'codeName', s);
    _.w(d, 'defaultOSSCat', s);
    _.w(d, 'dynaSysMode', s, '', 0);
    _.w(d, 'engineVer', s);
    _.w(d, 'headerInfo', s);
    _.w(d, 'pfstyle', s, 'pFStyle');
    _.w(d, 'pftype', s, 'pFType');
    _.w(d, 'pkgcodeName', s, 'pKGCodeName');
    _.v(
      d,
      'applicationLogics',
      c.m('app.ApplicationLogic[]', s, 'getPSApplicationLogics'),
    );
    _.w(d, 'devSlnSysId', s, 'getPSDevSlnSysId');
    _.v(d, 'sysImage', c.s('res.SysImage[]', s, 'getPSSysImage'));
    _.w(d, 'serviceCodeName', s);
    _.w(d, 'subAppAccessKey', s);
    _.w(d, 'subCaption', s);
    _.w(d, 'sysCodeName', s);
    _.w(d, 'title', s);
    _.w(d, 'viewCodeNameMode', s);
    _.w(d, 'enableServiceAPIDTO', s);
    _.w(d, 'enableUACLogin', s);
    _.w(d, 'enableUIModelEx', s);
    _.w(d, 'mobileApp', s);
    _.w(d, 'useServiceApi', s);
    _.w(d, 'wfappMode', s, 'wFAppMode');

    super.onFillDSL(c, s, d);
  }
}
