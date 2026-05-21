import { IViewController, IMobViewController } from '@ibiz-template/runtime';
import { IndexViewEngine } from './index-view.engine';
import { MobEditViewEngine } from './mob-edit-view.engine';
import { MobEditView3Engine } from './mob-edit-view3.engine';
import { MobMDViewEngine } from './mob-md-view-engine';
import { MobMPickupViewEngine } from './mob-mpickup-view-engine';
import { MobPickupTreeViewEngine } from './mob-pickup-tree-view.engine';
import { MobPickupViewEngine } from './mob-pickup-view.engine';
import { MobTabExpViewEngine } from './mob-tab-exp-view.engine';
import { MobTreeViewEngine } from './mob-tree-view.engine';
import { MobWFDynaActionViewEngine } from './mob-wf-dyna-action-view.engine';
import { MobWFDynaEditViewEngine } from './mob-wf-dyna-edit-view.engine';
import { MobWFDynaEditView3Engine } from './mob-wf-dyna-edit-view3.engine';
import { MobWFDynaStartViewEngine } from './mob-wf-dyna-start-view.engine';
import { WFStepTraceViewEngine } from './wf-step-trace-view.engine';
import { MobDataViewEngine } from './mob-data-view-engine';
import { PortalViewEngine } from './portal-view.engine';
import { PickupMDViewEngine } from './mob-pickup-md-view.engine';
import { MobCustomViewEngine } from './mob-custom-view.engine';
import { MobOptViewEngine } from './mob-opt-view.engine';
import { MobChartViewEngine } from './mob-chart-view.engine';
import { MobCalendarViewEngine } from './mob-calendar-view.engine';
import { MobWizardViewEngine } from './mob-wizard-view-engine';
import { MobTreeExpViewEngine } from './mob-tree-exp-view.engine';
import { MobTabSearchViewEngine } from './mob-tab-search-view.engine';
import { LoginViewEngine } from './login-view.engine';

export const IBizViewEngine = {
  install: (): void => {
    ibiz.engine.register(
      'VIEW_APPLOGINVIEW',
      (c: IMobViewController) => new LoginViewEngine(c),
    );
    ibiz.engine.register(
      'VIEW_MobTreeExpView',
      (c: IMobViewController) => new MobTreeExpViewEngine(c),
    );

    ibiz.engine.register(
      `VIEW_APPINDEXVIEW`,
      (c: IViewController) => new IndexViewEngine(c),
    );
    ibiz.engine.register(
      `VIEW_MobEditView`,
      (c: IViewController) => new MobEditViewEngine(c),
    );
    ibiz.engine.register(
      `VIEW_MobEditView3`,
      (c: IViewController) => new MobEditView3Engine(c),
    );
    ibiz.engine.register(
      `VIEW_MobMDView`,
      (c: IMobViewController) => new MobMDViewEngine(c),
    );
    ibiz.engine.register(
      `VIEW_MobPickupView`,
      (c: IMobViewController) => new MobPickupViewEngine(c),
    );
    ibiz.engine.register(
      `VIEW_MobMPickupView`,
      (c: IMobViewController) => new MobMPickupViewEngine(c),
    );
    ibiz.engine.register(
      `VIEW_MobPickupMDView`,
      (c: IMobViewController) => new PickupMDViewEngine(c),
    );
    ibiz.engine.register(
      `VIEW_DEMOBWFDYNAEDITVIEW`,
      (c: IMobViewController) => new MobWFDynaEditViewEngine(c),
    );
    ibiz.engine.register(
      `VIEW_DEMOBWFDYNAEDITVIEW3`,
      (c: IMobViewController) => new MobWFDynaEditView3Engine(c),
    );
    ibiz.engine.register(
      `VIEW_DEMOBWFDYNAACTIONVIEW`,
      (c: IMobViewController) => new MobWFDynaActionViewEngine(c),
    );
    ibiz.engine.register(
      `VIEW_DEMOBWFDYNASTARTVIEW`,
      (c: IMobViewController) => new MobWFDynaStartViewEngine(c),
    );
    ibiz.engine.register(
      `VIEW_MobTabExpView`,
      (c: IMobViewController) => new MobTabExpViewEngine(c),
    );
    ibiz.engine.register(
      `VIEW_MobTreeView`,
      (c: IMobViewController) => new MobTreeViewEngine(c),
    );
    ibiz.engine.register(
      `VIEW_MobPickupTreeView`,
      (c: IMobViewController) => new MobPickupTreeViewEngine(c),
    );
    ibiz.engine.register(
      `VIEW_APPWFSTEPTRACEVIEW`,
      (c: IMobViewController) => new WFStepTraceViewEngine(c),
    );
    ibiz.engine.register(
      `VIEW_DEMOBLISTVIEW`,
      (c: IMobViewController) => new MobMDViewEngine(c),
    );
    ibiz.engine.register(
      `VIEW_DEMOBDATAVIEW`,
      (c: IMobViewController) => new MobDataViewEngine(c),
    );
    ibiz.engine.register(
      `VIEW_APPPORTALVIEW`,
      (c: IMobViewController) => new PortalViewEngine(c),
    );
    ibiz.engine.register(
      `VIEW_DEMOBPORTALVIEW`,
      (c: IMobViewController) => new PortalViewEngine(c),
    );
    ibiz.engine.register(
      `VIEW_DEMOBPORTALVIEW9`,
      (c: IMobViewController) => new PortalViewEngine(c),
    );
    ibiz.engine.register(
      `VIEW_MobPortalView`,
      (c: IMobViewController) => new PortalViewEngine(c),
    );
    ibiz.engine.register(
      `VIEW_DEMOBCUSTOMVIEW`,
      (c: IMobViewController) => new MobCustomViewEngine(c),
    );
    ibiz.engine.register(
      `VIEW_MobOptionView`,
      (c: IMobViewController) => new MobOptViewEngine(c),
    );
    ibiz.engine.register(
      `VIEW_MobChartView`,
      (c: IMobViewController) => new MobChartViewEngine(c),
    );
    ibiz.engine.register(
      `VIEW_MobCalendarView`,
      (c: IMobViewController) => new MobCalendarViewEngine(c),
    );
    // 部件视图
    ibiz.engine.register(
      `VIEW_MobEditView9`,
      (c: IMobViewController) => new MobEditViewEngine(c),
    );
    ibiz.engine.register(
      `VIEW_MobMDView9`,
      (c: IMobViewController) => new MobMDViewEngine(c),
    );
    ibiz.engine.register(
      `VIEW_MobTabExpView9`,
      (c: IMobViewController) => new MobTabExpViewEngine(c),
    );
    ibiz.engine.register(
      `VIEW_MobCalendarView9`,
      (c: IMobViewController) => new MobCalendarViewEngine(c),
    );
    ibiz.engine.register(
      `VIEW_MobChartView9`,
      (c: IMobViewController) => new MobChartViewEngine(c),
    );
    ibiz.engine.register(
      `VIEW_MobWizardView`,
      (c: IMobViewController) => new MobWizardViewEngine(c),
    );
    ibiz.engine.register(
      'VIEW_DEMOBTABSEARCHVIEW',
      (c: IViewController) => new MobTabSearchViewEngine(c),
    );
  },
};
