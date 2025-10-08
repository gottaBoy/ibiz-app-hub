/* eslint-disable camelcase */
// 应用视图
import AppIndexViewLayout_NO_NAV from './app-index-view-layout-no-nav';
import AppIndexViewLayout_TOP_NO_NAV from './app-index-view-layout-top-nonav';
import AppIndexViewLayout_BLANK_MODE from './app-index-view-layout-blank-mode';
import AppIndexViewLayout_CENTER from './app-index-view-layout-center';
import AppIndexViewLayout_TOP from './app-index-view-layout-top';
import AppIndexViewLayout from './app-index-view-layout';
import AppLoginView from './app-login-view';
import AppDataUploadView from './app-data-upload-view';
import AppStartViewLayout from './app-start-view-layout';
import AppWelComeViewLayout from './app-welcome-view-layout';
// 实体视图
import DEChartView from './view-layout-model-repository/view-layout-model-repository-de-chart-view-layout';
import DECalendarExpView from './view-layout-model-repository/view-layout-model-repository-de-calendar-exp-view-layout';
import DECalendarView from './view-layout-model-repository/view-layout-model-repository-de-calendar-view-layout';
import DEDataViewExpView from './view-layout-model-repository/view-layout-model-repository-de-data-view-exp-view-layout';
import DEDataView from './view-layout-model-repository/view-layout-model-repository-de-data-view-layout';
import DEKanbanView from './view-layout-model-repository/view-layout-model-repository-de-kanban-view-layout';
import DEEdit2View from './view-layout-model-repository/view-layout-model-repository-de-edit-view-2-layout';
import DEEdit3View from './view-layout-model-repository/view-layout-model-repository-de-edit-view-3-layout';
import DEEdit4View from './view-layout-model-repository/view-layout-model-repository-de-edit-view-4-layout';
import DEFormPickupDataView from './view-layout-model-repository/view-layout-model-repository-form-pickup-data-view';
import DEEditView from './view-layout-model-repository/view-layout-model-repository-de-edit-view-layout';
import DEGridViewExpView from './view-layout-model-repository/view-layout-model-repository-de-grid-exp-view-layout';
import DEGridView from './view-layout-model-repository/view-layout-model-repository-de-grid-view-layout';
import DEListViewExpView from './view-layout-model-repository/view-layout-model-repository-de-list-exp-view-layout';
import DEListView from './view-layout-model-repository/view-layout-model-repository-de-list-view-layout';
import DEOptView from './view-layout-model-repository/view-layout-model-repository-de-option-view-layout';
import DEPickupGirdView from './view-layout-model-repository/view-layout-model-repository-de-pickup-grid-view-layout';
import DEPickupTreeView from './view-layout-model-repository/view-layout-model-repository-de-pickup-tree-view-layout';
import DEPickupView2 from './view-layout-model-repository/view-layout-model-repository-de-pickup-view-2-layout';
import DEPickupView from './view-layout-model-repository/view-layout-model-repository-de-pickup-view-layout';
import DETabExpView from './view-layout-model-repository/view-layout-model-repository-de-tab-exp-view-layout';
import DETreeViewExpView from './view-layout-model-repository/view-layout-model-repository-de-tree-exp-view-layout';
import DETreeView from './view-layout-model-repository/view-layout-model-repository-de-tree-view-layout';
import DEWizardDView from './view-layout-model-repository/view-layout-model-repository-de-wizard-view-layout';
import DEMPickupView from './view-layout-model-repository/view-layout-model-repository-dem-pickup-view-layout';
import DEMPickupView2 from './view-layout-model-repository/view-layout-model-repository-dem-pickup-view-2-layout';
import DEWFDynaActionView from './view-layout-model-repository/view-layout-model-repository-dewf-dyna-action-view-layout';
import DEWFDynaStartView from './view-layout-model-repository/view-layout-model-repository-dewf-dyna-start-view-layout';
import DEWFDynaEditView3 from './view-layout-model-repository/view-layout-model-repository-dewf-dyna-edit-view-3-layout';
import DEWFDynaEditView from './view-layout-model-repository/view-layout-model-repository-dewf-dyna-edit-view-layout';
import DEPanelView from './view-layout-model-repository/view-layout-model-repository-de-panel-view-layout';
import DEPickupDataView from './view-layout-model-repository/view-layout-model-repository-de-pickup-data-view-layout';
import DEIndexPickupDataView from './view-layout-model-repository/view-layout-model-repository-de-index-pickup-data-view-layout';
import DETreeGridExView from './view-layout-model-repository/view-layout-model-repository-de-tree-grid-ex-view-layout';
import DETreeGridView from './view-layout-model-repository/view-layout-model-repository-de-tree-grid-view-layout';
import DEMEditView9 from './view-layout-model-repository/view-layout-model-repository-dem-edit-view-9-layout';
import DEChartExpView from './view-layout-model-repository/view-layout-model-repository-de-chart-exp-view-layout';
import DEMAPVIEW from './view-layout-model-repository/view-layout-model-repository-de-map-view-layout';
import DEREPORTVIEW from './view-layout-model-repository/view-layout-model-repository-de-report-view-layout';
import DEGANTTVIEW from './view-layout-model-repository/view-layout-model-repository-de-gantt-view-layout';
import DEINDEXVIEW from './view-layout-model-repository/view-layout-model-repository-de-index-view-layout';
import DETABSEARCHVIEW from './view-layout-model-repository/view-layout-model-repository-de-tab-search-view-view-layout';
import DETABEXPVIEW_FLOW from './view-layout-model-repository/view-layout-model-repository-de-tab-exp-view-layout-flow';
import DEMEDITVIEW9_TOP from './view-layout-model-repository/view-layout-model-repository-dem-edit-view-9-layout-top';

// 部件布局面板
import GridExpBar from './control-layout/control-layout-model-repository-grid-exp-bar-layout';
import ListExpBar from './control-layout/control-layout-model-repository-list-exp-bar-layout';
import DataViewExpBar from './control-layout/control-layout-model-repository-data-view-exp-bar-layout';
import TreeExpBar from './control-layout/control-layout-model-repository-tree-exp-bar-layout';
import ChartExpBar from './control-layout/control-layout-model-repository-chart-exp-bar-layout';
import SearchForm from './control-layout/control-layout-model-repository-search-form-layout';
import Tree from './control-layout/control-layout-model-repository-tree-layout';
import DataView from './control-layout/control-layout-model-repository-data-view-layout';
import CalendarExpBar from './control-layout/control-layout-model-repository-calendar-exp-bar-layout';

/**
 * 安装视图默认布局
 *
 * @author chitanda
 * @date 2023-04-28 15:04:37
 * @export
 * @param {(key: string, model: any) => void} callBack
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function install(callBack: (key: string, model: any) => void): void {
  /**
   * 应用视图
   */
  // 应用首页视图
  callBack('APPINDEXVIEW_DEFAULT', AppIndexViewLayout);
  // 应用首页视图_左侧菜单
  callBack('APPINDEXVIEW_DEFAULT_LEFT', AppIndexViewLayout);
  // 应用首页视图_空白模式
  callBack('APPINDEXVIEW_DEFAULT_BLANK_MODE', AppIndexViewLayout_BLANK_MODE);
  // 应用首页视图_中间菜单
  callBack('APPINDEXVIEW_DEFAULT_CENTER', AppIndexViewLayout_CENTER);
  // 应用首页视图_上方菜单
  callBack('APPINDEXVIEW_DEFAULT_TOP', AppIndexViewLayout_TOP);
  // 应用首页视图(无分页导航)
  callBack('APPINDEXVIEW_DEFAULT_NO_NAV', AppIndexViewLayout_NO_NAV);
  // 应用首页视图_左侧菜单(无分页导航)
  callBack('APPINDEXVIEW_DEFAULT_LEFT_NO_NAV', AppIndexViewLayout_NO_NAV);
  // 应用首页视图_上方菜单(无分页导航)
  callBack('APPINDEXVIEW_DEFAULT_TOP_NO_NAV', AppIndexViewLayout_TOP_NO_NAV);
  // 应用登录视图
  callBack('APPLOGINVIEW_DEFAULT', AppLoginView);
  // 应用数据导入视图
  callBack('APPDATAUPLOADVIEW_DEFAULT', AppDataUploadView);
  // 应用启动视图
  callBack('APPSTARTVIEW_DEFAULT', AppStartViewLayout);
  // 应用欢迎视图
  callBack('APPWELCOMEVIEW_DEFAULT', AppWelComeViewLayout);
  /**
   * 实体视图
   */
  // 实体图表视图
  callBack('DECHARTVIEW_DEFAULT', DEChartView);
  // 实体图表视图（部件视图）
  callBack('DECHARTVIEW9_DEFAULT', DEChartView);
  // 实体日历导航视图
  callBack('DECALENDAREXPVIEW_DEFAULT', DECalendarExpView);
  // 实体日历视图
  callBack('DECALENDARVIEW_DEFAULT', DECalendarView);
  // 实体日历视图（部件视图）
  callBack('DECALENDARVIEW9_DEFAULT', DECalendarView);
  // 实体卡片视图导航视图
  callBack('DEDATAVIEWEXPVIEW_DEFAULT', DEDataViewExpView);
  // 实体卡片视图
  callBack('DEDATAVIEW_DEFAULT', DEDataView);
  // 实体卡片视图（部件视图）
  callBack('DEDATAVIEW9_DEFAULT', DEDataView);
  // 实体看板视图
  callBack('DEKANBANVIEW_DEFAULT', DEKanbanView);
  // 实体编辑视图（左右关系）
  callBack('DEEDITVIEW2_DEFAULT', DEEdit2View);
  // 实体编辑视图（分页关系）
  callBack('DEEDITVIEW3_DEFAULT', DEEdit3View);
  // 实体编辑视图（上下关系）
  callBack('DEEDITVIEW4_DEFAULT', DEEdit4View);
  // 实体表单选择数据视图
  callBack('DEFORMPICKUPDATAVIEW_DEFAULT', DEFormPickupDataView);
  // 实体编辑视图
  callBack('DEEDITVIEW_DEFAULT', DEEditView);
  // 实体编辑视图（部件视图）
  callBack('DEEDITVIEW9_DEFAULT', DEEditView);
  // 实体表格导航视图
  callBack('DEGRIDEXPVIEW_DEFAULT', DEGridViewExpView);
  // 实体表格视图
  callBack('DEGRIDVIEW_DEFAULT', DEGridView);
  // 实体表格视图（部件视图）
  callBack('DEGRIDVIEW9_DEFAULT', DEGridView);
  // 实体列表导航视图
  callBack('DELISTEXPVIEW_DEFAULT', DEListViewExpView);
  // 实体列表视图
  callBack('DELISTVIEW_DEFAULT', DEListView);
  // 实体列表视图（部件视图）
  callBack('DELISTVIEW9_DEFAULT', DEListView);
  // 实体选项操作视图
  callBack('DEOPTVIEW_DEFAULT', DEOptView);
  // 实体选择表格视图（部件视图）
  callBack('DEPICKUPGRIDVIEW_DEFAULT', DEPickupGirdView);
  // 实体选择树视图（部件视图）
  callBack('DEPICKUPTREEVIEW_DEFAULT', DEPickupTreeView);
  // 实体数据选择视图(左右关系)
  callBack('DEPICKUPVIEW2_DEFAULT', DEPickupView2);
  // 实体数据选择视图
  callBack('DEPICKUPVIEW_DEFAULT', DEPickupView);
  // 实体分页导航视图
  callBack('DETABEXPVIEW_DEFAULT', DETabExpView);
  // 实体分页导航视图（部件视图）
  callBack('DETABEXPVIEW9_DEFAULT', DETabExpView);
  // 实体树导航视图
  callBack('DETREEEXPVIEW_DEFAULT', DETreeViewExpView);
  // 实体树视图
  callBack('DETREEVIEW_DEFAULT', DETreeView);
  // 实体树视图（部件视图）
  callBack('DETREEVIEW9_DEFAULT', DETreeView);
  // 实体向导视图
  callBack('DEWIZARDVIEW_DEFAULT', DEWizardDView);
  // 实体数据多项选择视图
  callBack('DEMPICKUPVIEW_DEFAULT', DEMPickupView);
  // 实体数据多项选择视图(左右关系)
  callBack('DEMPICKUPVIEW2_DEFAULT', DEMPickupView2);
  // 实体工作流动态操作视图
  callBack('DEWFDYNAACTIONVIEW_DEFAULT', DEWFDynaActionView);
  // 实体工作流动态操作视图
  callBack('DEWFDYNASTARTVIEW_DEFAULT', DEWFDynaStartView);
  // 实体工作流动态视图（分页关系）
  callBack('DEWFDYNAEDITVIEW3_DEFAULT', DEWFDynaEditView3);
  // 实体工作流动态视图
  callBack('DEWFDYNAEDITVIEW_DEFAULT', DEWFDynaEditView);
  // 实体面板视图
  callBack('DEPANELVIEW_DEFAULT', DEPanelView);
  // 实体选择数据视图
  callBack('DEPICKUPDATAVIEW_DEFAULT', DEPickupDataView);
  //  实体索引关系选择数据视图（部件视图）
  callBack('DEINDEXPICKUPDATAVIEW_DEFAULT', DEIndexPickupDataView);
  //  实体树表格视图（增强）
  callBack('DETREEGRIDEXVIEW_DEFAULT', DETreeGridExView);
  //  实体树表格视图
  callBack('DETREEGRIDVIEW_DEFAULT', DETreeGridView);
  // 实体多表单编辑视图（部件视图）
  callBack('DEMEDITVIEW9_DEFAULT', DEMEditView9);
  // 实体图表导航视图
  callBack('DECHARTEXPVIEW_DEFAULT', DEChartExpView);
  // 实体地图视图
  callBack('DEMAPVIEW_DEFAULT', DEMAPVIEW);
  // 实体报表视图
  callBack('DEREPORTVIEW_DEFAULT', DEREPORTVIEW);
  // 实体甘特图视图
  callBack('DEGANTTVIEW_DEFAULT', DEGANTTVIEW);
  // 实体首页视图
  callBack('DEINDEXVIEW_DEFAULT', DEINDEXVIEW);
  // 实体分页搜索视图
  callBack('DETABSEARCHVIEW_DEFAULT', DETABSEARCHVIEW);
  // 实体分页导航视图（流式布局）
  callBack('DETABEXPVIEW_FLOW', DETABEXPVIEW_FLOW);
  // 实体多表单编辑视图（部件视图）（上分页）
  callBack('DEMEDITVIEW9_TOP', DEMEDITVIEW9_TOP);

  // 部件布局面板
  // 表格导航
  callBack('GRIDEXPBAR_DEFAULT', GridExpBar);
  // 列表导航
  callBack('LISTEXPBAR_DEFAULT', ListExpBar);
  // 卡片导航
  callBack('DATAVIEWEXPBAR_DEFAULT', DataViewExpBar);
  // 树导航
  callBack('TREEEXPBAR_DEFAULT', TreeExpBar);
  // 图表导航
  callBack('CHARTEXPBAR_DEFAULT', ChartExpBar);
  // 搜索表单
  callBack('SEARCHFORM_DEFAULT', SearchForm);
  // 树
  callBack('TREEVIEW_DEFAULT', Tree);
  // 数据视图
  callBack('DATAVIEW_DEFAULT', DataView);
    // 日历导航
  callBack('CALENDAREXPBAR_DEFAULT', CalendarExpBar);
}
