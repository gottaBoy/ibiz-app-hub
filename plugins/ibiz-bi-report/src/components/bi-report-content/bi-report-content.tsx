/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  PropType,
  Ref,
  defineComponent,
  h,
  onUnmounted,
  provide,
  ref,
  resolveComponent,
} from 'vue';
import { ViewController } from '@ibiz-template/runtime';
import { IBizContext } from '@ibiz-template/core';
import { IAppBIReport, IAppView } from '@ibiz/model-core';
import { useNamespace } from '../../use';
import './bi-report-content.scss';
import { BIReportDesignController } from '../../controller';
import { getReportChartProvider } from '../../provider';
import {
  IAppBIDrillDetailData,
  IBIReportChartController,
  IReportChartProvider,
} from '../../interface';
import IBizBIReportChartShell from '../bi-report-chart/bi-report-chart-shell/bi-report-chart-shell';
import IBizBIReportGridShell from '../bi-report-chart/bi-report-grid-shell/bi-report-grid-shell';
import IBizBIReportNumber from '../bi-report-chart/bi-report-number/bi-report-number';

/** BI报表内容组件 */
export default defineComponent({
  name: 'IBizBIReportContent',
  components: {
    IBizBIReportChartShell,
    IBizBIReportGridShell,
    IBizBIReportNumber,
  },
  props: {
    mode: {
      type: String as PropType<'DESIGN' | 'CONTENT'>,
      require: true,
    },
    context: {
      type: Object as PropType<IContext>,
      require: true,
    },
    viewParams: {
      type: Object as PropType<IParams>,
      require: true,
    },
    // 设计态必传
    controller: {
      type: Object as PropType<BIReportDesignController>,
    },
    // 呈现态必传
    config: {
      type: Object as PropType<IAppBIReport>,
    },
  },
  emits: ['reportChartChange', 'init'],
  setup(props, { emit }) {
    const ns = useNamespace(`content`);
    const viewModel: IAppView = {
      name: 'AppView',
      id: 'AppView',
      viewType: 'DECUSTOMVIEW',
      appId: props.context?.srfappid || ibiz.env.appId,
    };
    provide(
      'ctx',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (new ViewController(viewModel, IBizContext.create({})) as any).ctx,
    );

    const provider: Ref<IReportChartProvider | undefined> = ref();

    const c: Ref<IBIReportChartController | undefined> = ref();

    const createDesignController = (tag: string): void => {
      const initProvider = getReportChartProvider(tag);
      provider.value = initProvider;
      const config = { ...props.config! };
      Object.assign(config, {
        selectChartType: tag,
        selectCubeId: props.controller?.state.selectCube!.pssysbicubeid,
      });
      c.value = initProvider?.createController({
        mode: 'DESIGN',
        context: props.context!,
        viewParams: props.viewParams!,
        config: props.config!,
      });
      emit('reportChartChange', c.value);
    };
    // 设计界面
    if (props.mode === 'DESIGN') {
      // 初始化
      createDesignController(props.controller?.state.selectChartType!);
    } else {
      // 呈现界面
      const { reportUIModel } = props.config!;
      let selectChartType = 'NUMBER';
      if (reportUIModel) {
        const reportUIModelObject = JSON.parse(reportUIModel);
        selectChartType = reportUIModelObject.selectChartType || 'NUMBER';
      }
      const initProvider = getReportChartProvider(selectChartType!);
      provider.value = initProvider;
      c.value = initProvider?.createController({
        mode: 'CONTENT',
        context: props.context!,
        viewParams: props.viewParams!,
        config: props.config!,
      });
    }
    emit('init', c.value);

    // 销毁
    onUnmounted(() => {
      if (c.value) {
        c.value.destroyed();
      }
    });

    // 处理反查
    const onDrillDetail = (args: IAppBIDrillDetailData) => {
      c.value?.handleDrillDetail(args);
    };

    return {
      ns,
      c,
      provider,
      onDrillDetail,
    };
  },
  render() {
    return (
      <div
        class={this.ns.b('container')}
        v-loading={this.c && !this.c.state.isCreated}
      >
        {this.c?.state.isCreated &&
          h(resolveComponent(this.provider!.component) as string, {
            c: this.c,
            onDrillDetail: this.onDrillDetail,
          })}
      </div>
    );
  },
});
