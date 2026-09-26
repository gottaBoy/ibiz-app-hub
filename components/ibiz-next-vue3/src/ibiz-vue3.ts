import { App } from 'vue';

import {
  IBizView,
  IBizPortalView,
  IBizPanelControl,
  IBizViewLayoutPanelControl,
  IBizDeRedirectView,
  IBizHtmlView,
} from '@ibiz-template/vue3-util';
import { registerErrorViewProvider } from '@ibiz-template/runtime';
import IBizCommonComponents from './common';
import IBizPanelComponents from './panel-component';
import {
  IBizAppMenuControl,
  IBizGridControl,
  IBizToolbarControl,
  IBizEditFormControl,
  IBizFormControl,
  IBizSearchFormControl,
  IBizListControl,
  IBizCaptionBarControl,
  IBizDataViewControl,
  IBizTreeControl,
  IBizPickupViewPanelControl,
  IBizTabExpPanelControl,
  IBizListExpBarControl,
  IBizGridExpBarControl,
  IBizDataViewExpBarControl,
  IBizTreeExpBarControl,
  IBizSearchBarControl,
  IBizWizardPanelControl,
  IBizChartControl,
  IBizDRBarControl,
  IBizDRTabControl,
  IBizDashboardControl,
  IBizAppMenuIconViewControl,
  IBizCalendarControl,
  IBizCalendarExpBarControl,
  IBizKanbanControl,
  IBizTreeGridExControl,
  IBizTreeGridControl,
  IBizMEditViewPanelControl,
  IBizChartExpBarControl,
  IBizMapControl,
  IBizReportPanelControl,
  IBizGanttControl,
  IBizContextMenuControl,
  IBizViewPanelControl,
} from './control';
import IBizEditor from './editor';
import {
  IBizWFStepTraceView,
  IBizSubAppRefView,
  View404,
  View403,
} from './view';
import { iBizI18n } from './locale';
import { IBizDirectives } from './directives';
import { IBizViewEngine } from './view-engine';

export default {
  install: (v: App): void => {
    // 公共组件
    ibiz.i18n = iBizI18n;
    ibiz.util.getExcelUtil = () => import('./util/xlsx-util/xlsx-util');

    // 注册404错误视图
    registerErrorViewProvider('404', () => ({ component: View404 }));
    registerErrorViewProvider('403', () => ({ component: View403 }));

    v.use(IBizCommonComponents);
    v.use(IBizPanelComponents);
    v.use(IBizViewEngine);
    v.use(IBizView);
    v.use(IBizPortalView);
    v.use(IBizHtmlView);
    v.use(IBizWFStepTraceView);
    v.use(IBizDeRedirectView);
    v.use(IBizSubAppRefView);
    // 部件
    v.use(IBizDataViewControl);
    v.use(IBizTreeControl);
    v.use(IBizAppMenuControl);
    v.use(IBizAppMenuIconViewControl);
    v.use(IBizGridControl);
    v.use(IBizTreeGridControl);
    v.use(IBizListControl);
    v.use(IBizChartControl);
    v.use(IBizPickupViewPanelControl);
    v.use(IBizToolbarControl);
    v.use(IBizViewLayoutPanelControl);
    v.use(IBizPanelControl);
    v.use(IBizFormControl);
    v.use(IBizListExpBarControl);
    v.use(IBizDataViewExpBarControl);
    v.use(IBizGridExpBarControl);
    v.use(IBizSearchFormControl);
    v.use(IBizEditFormControl);
    v.use(IBizCaptionBarControl);
    v.use(IBizTabExpPanelControl);
    v.use(IBizTreeExpBarControl);
    v.use(IBizSearchBarControl);
    v.use(IBizWizardPanelControl);
    v.use(IBizDRBarControl);
    v.use(IBizDRTabControl);
    v.use(IBizDashboardControl);
    v.use(IBizCalendarControl);
    v.use(IBizCalendarExpBarControl);
    v.use(IBizKanbanControl);
    v.use(IBizTreeGridExControl);
    v.use(IBizMEditViewPanelControl);
    v.use(IBizChartExpBarControl);
    v.use(IBizMapControl);
    v.use(IBizReportPanelControl);
    v.use(IBizGanttControl);
    v.use(IBizContextMenuControl);
    v.use(IBizViewPanelControl);
    // 编辑器
    v.use(IBizEditor);
    v.use(IBizDirectives);
  },
};
