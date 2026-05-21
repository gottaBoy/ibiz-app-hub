import { App } from 'vue';

// 组件
import {
  BIReportDesign,
  BIReportContent,
  BIReportDrillShell,
} from './components';
import { registerAllChartProvider } from './provider';
import plugins from './plugins';

export default {
  install(_app: App): void {
    _app.component(BIReportDesign.name!, BIReportDesign);
    _app.component(BIReportContent.name!, BIReportContent);
    _app.component(BIReportDrillShell.name, BIReportDrillShell);
    registerAllChartProvider();
    _app.use(plugins);
  },
};
