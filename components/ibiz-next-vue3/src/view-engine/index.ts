import { IViewController, ViewEngineBase } from '@ibiz-template/runtime';
import { App } from 'vue';
import { EditViewEngine } from './edit-view.engine';
import { EditView2Engine } from './edit-view2.engine';
import { EditView3Engine } from './edit-view3.engine';
import { EditView4Engine } from './edit-view4.engine';
import { GridViewEngine } from './grid-view.engine';
import { IndexViewEngine } from './index-view.engine';
import { ListViewEngine } from './list-view.engine';
import { DataViewEngine } from './data-view.engine';
import { OptViewEngine } from './opt-view.engine';
import { PickupGridViewEngine } from './pickup-grid-view.engine';
import { PickupViewEngine } from './pickup-view.engine';
import { MPickupViewEngine } from './mpickup-view-engine';
import { TreeViewEngine } from './tree-view.engine';
import { TabExpViewEngine } from './tab-exp-view.engine';
import { GridExpViewEngine } from './grid-exp-view.engine';
import { ListExpViewEngine } from './list-exp-view.engine';
import { DataViewExpViewEngine } from './data-view-exp-view.engine';
import { TreeExpViewEngine } from './tree-exp-view.engine';
import { WizardViewEngine } from './wizard-view-engine';
import { ChartViewEngine } from './chart-view.engine';
import { WFDynaEditViewEngine } from './wf-dyna-edit-view.engine';
import { WFDynaEditView3Engine } from './wf-dyna-edit-view3.engine';
import { WFDynaActionViewEngine } from './wf-dyna-action-view.engine';
import { WFDynaStartViewEngine } from './wf-dyna-start-view.engine';
import { PortalViewEngine } from './portal-view-engine';
import { PanelViewEngine } from './panel-view-engine';
import { CustomViewEngine } from './custom-view.engine';
import { MDCustomViewEngine } from './md-custom-view.engine';
import { PickupTreeViewEngine } from './pickup-tree-view.engine';
import { PickupDataViewEngine } from './pickup-data-view.engine';
import { PickupView2Engine } from './pickup-view2.engine';
import { CalendarViewEngine } from './calendar-view.engine';
import { CalendarExpViewEngine } from './calendar-exp-view.engine';
import { MPickupView2Engine } from './mpickup-view2-engine';
import { KanbanViewEngine } from './kanban-view.engine';
import { FormPickupDataViewEngine } from './form-pickup-data-view.engine';
import { LoginViewEngine } from './login-view.engine';
import { TreeGridExViewEngine } from './tree-grid-ex-view.engine';
import { TreeGridViewEngine } from './tree-grid-view.engine';
import { MEditView9Engine } from './medit-view9.engine';
import { ChartExpViewEngine } from './chart-exp-view.engine';
import { MapViewEngine } from './map-view.engine';
import { ReportViewEngine } from './report-view.engine';
import { GanttViewEngine } from './gantt-view.engine';
import { DEIndexViewEngine } from './de-index-view-engine';
import { SubAppRefViewEngine } from './sub-app-ref-view.engine';
import { TabSearchViewEngine } from './tab-search-view.engine';
import { AppDataUploadViewEngine } from './app-data-upload-view.engine';
import { WFStepDataViewEngine } from './wf-step-data-view.engine';
import { AppStartViewEngine } from './app-start-view.engine';
import { AppWelcomeViewEngine } from './app-welcome-view.engine';

export * from './grid-view.engine';
export * from './index-view.engine';
export * from './data-view.engine';
export * from './opt-view.engine';
export * from './tab-exp-view.engine';
export * from './tree-exp-view.engine';
export * from './app-data-upload-view.engine';
export * from './calendar-exp-view.engine';
export * from './calendar-view.engine';
export * from './chart-exp-view.engine';
export * from './chart-view.engine';
export * from './custom-view.engine';
export * from './md-custom-view.engine';
export * from './data-view-exp-view.engine';
export * from './de-index-view-engine';
export * from './edit-view.engine';
export * from './edit-view2.engine';
export * from './edit-view3.engine';
export * from './edit-view4.engine';
export * from './exp-view.engine';
export * from './form-pickup-data-view.engine';
export * from './gantt-view.engine';
export * from './grid-exp-view.engine';
export * from './kanban-view.engine';
export * from './list-exp-view.engine';
export * from './list-view.engine';
export * from './login-view.engine';
export * from './map-view.engine';
export * from './medit-view9.engine';
export * from './mpickup-view-engine';
export * from './mpickup-view2-engine';
export * from './panel-view-engine';
export * from './pickup-data-view.engine';
export * from './pickup-grid-view.engine';
export * from './pickup-tree-view.engine';
export * from './pickup-view.engine';
export * from './pickup-view2.engine';
export * from './portal-view-engine';
export * from './report-view.engine';
export * from './sub-app-ref-view.engine';
export * from './tab-search-view.engine';
export * from './tree-grid-ex-view.engine';
export * from './tree-grid-view.engine';
export * from './tree-view.engine';
export * from './wf-dyna-action-view.engine';
export * from './wf-dyna-edit-view.engine';
export * from './wf-dyna-edit-view3.engine';
export * from './wf-dyna-start-view.engine';
export * from './wf-step-data-view.engine';
export * from './wizard-view-engine';

export const IBizViewEngine = {
  install: (_v: App): void => {
    ibiz.engine.register(
      'VIEW_APPWFSTEPDATAVIEW',
      (c: IViewController) => new WFStepDataViewEngine(c),
    );
    ibiz.engine.register(
      `VIEW_AppIndexView`,
      (c: IViewController) => new IndexViewEngine(c),
    );
    ibiz.engine.register(
      `VIEW_APPINDEXVIEW`,
      (c: IViewController) => new IndexViewEngine(c),
    );
    ibiz.engine.register(
      'VIEW_GridView',
      (c: IViewController) => new GridViewEngine(c),
    );
    ibiz.engine.register(
      'VIEW_ListView',
      (c: IViewController) => new ListViewEngine(c),
    );
    ibiz.engine.register(
      'VIEW_TreeView',
      (c: IViewController) => new TreeViewEngine(c),
    );
    ibiz.engine.register(
      'VIEW_EditView',
      (c: IViewController) => new EditViewEngine(c),
    );
    ibiz.engine.register(
      'VIEW_EditView2',
      (c: IViewController) => new EditView2Engine(c),
    );
    ibiz.engine.register(
      'VIEW_EditView3',
      (c: IViewController) => new EditView3Engine(c),
    );
    ibiz.engine.register(
      'VIEW_EditView4',
      (c: IViewController) => new EditView4Engine(c),
    );
    ibiz.engine.register(
      'VIEW_DataView',
      (c: IViewController) => new DataViewEngine(c),
    );
    ibiz.engine.register(
      'VIEW_OptionView',
      (c: IViewController) => new OptViewEngine(c),
    );
    ibiz.engine.register(
      'VIEW_PickupGridView',
      (c: IViewController) => new PickupGridViewEngine(c),
    );
    ibiz.engine.register(
      'VIEW_PickupTreeView',
      (c: IViewController) => new PickupTreeViewEngine(c),
    );
    ibiz.engine.register(
      'VIEW_DEPICKUPVIEW2',
      (c: IViewController) => new PickupView2Engine(c),
    );
    ibiz.engine.register(
      'VIEW_PickupView',
      (c: IViewController) => new PickupViewEngine(c),
    );
    ibiz.engine.register(
      'VIEW_MPickupView',
      (c: IViewController) => new MPickupViewEngine(c),
    );
    ibiz.engine.register(
      'VIEW_DEMPICKUPVIEW2',
      (c: IViewController) => new MPickupView2Engine(c),
    );
    ibiz.engine.register(
      'VIEW_TabExpView',
      (c: IViewController) => new TabExpViewEngine(c),
    );
    ibiz.engine.register(
      'VIEW_GridExpView',
      (c: IViewController) => new GridExpViewEngine(c),
    );
    ibiz.engine.register(
      'VIEW_ListExpView',
      (c: IViewController) => new ListExpViewEngine(c),
    );
    ibiz.engine.register(
      'VIEW_DataViewExpView',
      (c: IViewController) => new DataViewExpViewEngine(c),
    );
    ibiz.engine.register(
      'VIEW_ChartView',
      (c: IViewController) => new ChartViewEngine(c),
    );
    ibiz.engine.register(
      'VIEW_TreeExpView',
      (c: IViewController) => new TreeExpViewEngine(c),
    );
    ibiz.engine.register(
      'VIEW_WizardView',
      (c: IViewController) => new WizardViewEngine(c),
    );
    ibiz.engine.register(
      'VIEW_WFDynaEditView',
      (c: IViewController) => new WFDynaEditViewEngine(c),
    );
    ibiz.engine.register(
      'VIEW_DEWFDYNAEDITVIEW3',
      (c: IViewController) => new WFDynaEditView3Engine(c),
    );
    ibiz.engine.register(
      'VIEW_DEWFDYNAACTIONVIEW',
      (c: IViewController) => new WFDynaActionViewEngine(c),
    );
    ibiz.engine.register(
      'VIEW_DEWFDYNASTARTVIEW',
      (c: IViewController) => new WFDynaStartViewEngine(c),
    );
    ibiz.engine.register(
      'VIEW_APPPORTALVIEW',
      (c: IViewController) => new PortalViewEngine(c),
    );
    ibiz.engine.register(
      'VIEW_DEPORTALVIEW',
      (c: IViewController) => new PortalViewEngine(c),
    );
    ibiz.engine.register(
      'VIEW_PortalView9',
      (c: IViewController) => new PortalViewEngine(c),
    );
    ibiz.engine.register(
      'VIEW_PortalView',
      (c: IViewController) => new PortalViewEngine(c),
    );
    ibiz.engine.register(
      'VIEW_DEPANELVIEW',
      (c: IViewController) => new PanelViewEngine(c),
    );
    ibiz.engine.register(
      'VIEW_APPPANELVIEW',
      (c: IViewController) => new PanelViewEngine(c),
    );
    // HtmlViewController owns the URL; use the shared view lifecycle engine.
    ibiz.engine.register(
      'VIEW_HtmlView',
      (c: IViewController) => new ViewEngineBase(c),
    );
    ibiz.engine.register(
      'VIEW_DEHTMLVIEW',
      (c: IViewController) => new ViewEngineBase(c),
    );
    ibiz.engine.register(
      'VIEW_DECUSTOMVIEW',
      (c: IViewController) => new CustomViewEngine(c),
    );
    ibiz.engine.register(
      'VIEW_DEMDCUSTOMVIEW',
      (c: IViewController) => new MDCustomViewEngine(c),
    );
    ibiz.engine.register(
      'VIEW_DEPICKUPDATAVIEW',
      (c: IViewController) => new PickupDataViewEngine(c),
    );
    ibiz.engine.register(
      'VIEW_PickupDataView',
      (c: IViewController) => new PickupDataViewEngine(c),
    );
    ibiz.engine.register(
      'VIEW_DEINDEXPICKUPDATAVIEW',
      (c: IViewController) => new PickupDataViewEngine(c),
    );
    ibiz.engine.register(
      'VIEW_DECALENDARVIEW',
      (c: IViewController) => new CalendarViewEngine(c),
    );
    ibiz.engine.register(
      'VIEW_CalendarExpView',
      (c: IViewController) => new CalendarExpViewEngine(c),
    );
    ibiz.engine.register(
      'VIEW_FormPickupDataView',
      (c: IViewController) => new FormPickupDataViewEngine(c),
    );
    ibiz.engine.register(
      'VIEW_KanBanView',
      (c: IViewController) => new KanbanViewEngine(c),
    );
    ibiz.engine.register(
      'VIEW_APPLOGINVIEW',
      (c: IViewController) => new LoginViewEngine(c),
    );
    ibiz.engine.register(
      'VIEW_TreeGridExView',
      (c: IViewController) => new TreeGridExViewEngine(c),
    );
    ibiz.engine.register(
      'VIEW_DETREEGRIDVIEW',
      (c: IViewController) => new TreeGridViewEngine(c),
    );
    ibiz.engine.register(
      'VIEW_DECHARTEXPVIEW',
      (c: IViewController) => new ChartExpViewEngine(c),
    );
    ibiz.engine.register(
      'VIEW_DEGANTTVIEW',
      (c: IViewController) => new GanttViewEngine(c),
    );
    ibiz.engine.register(
      'VIEW_DESUBAPPREFVIEW',
      (c: IViewController) => new SubAppRefViewEngine(c),
    );
    ibiz.engine.register(
      'VIEW_APPDATAUPLOADVIEW',
      (c: IViewController) => new AppDataUploadViewEngine(c),
    );
    ibiz.engine.register(
      'VIEW_APPSTARTVIEW',
      (c: IViewController) => new AppStartViewEngine(c),
    );
    ibiz.engine.register(
      'VIEW_APPWELCOMEVIEW',
      (c: IViewController) => new AppWelcomeViewEngine(c),
    );

    // 注册部件视图
    ibiz.engine.register(
      'VIEW_GridView9',
      (c: IViewController) => new GridViewEngine(c),
    );
    ibiz.engine.register(
      'VIEW_ListView9',
      (c: IViewController) => new ListViewEngine(c),
    );
    ibiz.engine.register(
      'VIEW_EditView9',
      (c: IViewController) => new EditViewEngine(c),
    );
    ibiz.engine.register(
      'VIEW_DataView9',
      (c: IViewController) => new DataViewEngine(c),
    );
    ibiz.engine.register(
      'VIEW_TreeView9',
      (c: IViewController) => new TreeViewEngine(c),
    );
    ibiz.engine.register(
      'VIEW_DETABEXPVIEW9',
      (c: IViewController) => new TabExpViewEngine(c),
    );
    ibiz.engine.register(
      'VIEW_PortalView9',
      (c: IViewController) => new PortalViewEngine(c),
    );
    ibiz.engine.register(
      'VIEW_DEPORTALVIEW9',
      (c: IViewController) => new PortalViewEngine(c),
    );
    ibiz.engine.register(
      'VIEW_DEMEDITVIEW9',
      (c: IViewController) => new MEditView9Engine(c),
    );
    ibiz.engine.register(
      'VIEW_DEMAPVIEW',
      (c: IViewController) => new MapViewEngine(c),
    );
    ibiz.engine.register(
      'VIEW_DEREPORTVIEW',
      (c: IViewController) => new ReportViewEngine(c),
    );
    ibiz.engine.register(
      'VIEW_DEINDEXVIEW',
      (c: IViewController) => new DEIndexViewEngine(c),
    );
    ibiz.engine.register(
      'VIEW_DETABSEARCHVIEW',
      (c: IViewController) => new TabSearchViewEngine(c),
    );
  },
};
