import { registerControlProvider, ControlType } from '@ibiz-template/runtime';
import { withInstall } from '@ibiz-template/vue3-util';
import { App } from 'vue';
import { ReportPanelControl } from './report-panel';
import { ReportPanelProvider } from './report-panel.provider';
import {
  IBizBIReport,
  IBizBIReportPanel,
  IBizUser2ReportPanel,
  IBizUserReportPanel,
} from './report-detail';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const IBizReportPanelControl: any = withInstall(
  ReportPanelControl,
  function (v: App) {
    v.use(IBizBIReport);
    v.use(IBizUserReportPanel);
    v.use(IBizUser2ReportPanel);
    v.use(IBizBIReportPanel);
    v.component(ReportPanelControl.name, ReportPanelControl);
    registerControlProvider(
      ControlType.REPORT_PANEL,
      () => new ReportPanelProvider(),
    );
  },
);

export default IBizReportPanelControl;
