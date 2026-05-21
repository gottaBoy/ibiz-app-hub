import { defineComponent, PropType } from 'vue';
import { useNamespace } from '@ibiz-template/vue3-util';
import {
  ReportPanelController,
  BIReportPanelGenerator,
} from '@ibiz-template/runtime';
import { IBizBINumberReport } from './commons';
import './bi-report.scss';

export const BIReport = defineComponent({
  name: 'IBizBIReport',
  props: {
    controller: {
      type: Object as PropType<ReportPanelController>,
      required: true,
    },
  },
  setup(props) {
    const c = props.controller;
    const ns = useNamespace('bi-report');

    const generator = c.generator as BIReportPanelGenerator;

    const reportType = generator.reportType;

    return {
      c,
      ns,
      reportType,
    };
  },
  render() {
    if (!this.c.state.biReport) return;
    return (
      <div class={this.ns.b()}>
        {this.reportType === 'NUMBER' ? (
          <IBizBINumberReport
            model={this.c.state.biReport.model}
            data={this.c.state.biReport.data}
          />
        ) : (
          <iBizControlShell
            isSimple={true}
            context={this.c.context}
            data={this.c.state.biReport.data}
            modelData={this.c.state.biReport.model}
            style={this.c.state.biReport.options.vars}
            class={this.c.state.biReport.options.classList}
          />
        )}
      </div>
    );
  },
});
