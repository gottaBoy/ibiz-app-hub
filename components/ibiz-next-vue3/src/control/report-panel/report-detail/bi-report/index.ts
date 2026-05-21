import { withInstall } from '@ibiz-template/vue3-util';
import { BIReport } from './bi-report';

export const IBizBIReport = withInstall(BIReport, v => {
  v.component(BIReport.name!, BIReport);
});

export default IBizBIReport;
