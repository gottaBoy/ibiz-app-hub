import { IPanelRawItem } from '@ibiz/model-core';
import { PropType, defineComponent, h, onMounted, onUnmounted, ref } from 'vue';
import { useNamespace } from '../../use';
import { BIReportPanelContentController } from './bi-report-panel-content.controller';
import { IBIReportChartController } from '../../interface';
import './bi-report-panel-content.scss';
import { biReportT } from '../../locale';
import {
  IFilterNodeField,
  IFilterNodeGroup,
  IModal,
  IOverlayPopoverContainer,
} from '@ibiz-template/runtime';
import BIReportPanelFilter from '../../components/common/bi-filter/bi-filter';

export default defineComponent({
  name: 'BIReportPanelContent',
  props: {
    modelData: {
      type: Object as PropType<IPanelRawItem>,
      required: true,
    },
    controller: {
      type: BIReportPanelContentController,
      required: true,
    },
  },
  setup(prop) {
    const ns = useNamespace('bi-report-panel-content');
    const c = prop.controller;

    // 折叠面板展开项
    const value = ref(['chart', 'grid']);

    // 是否显示合计
    const showAgg = ref(false);

    // 是否显示百分比
    const showPercent = ref(false);

    showAgg.value = !!c.state.gridPropertyData?.style?.agg?.show;

    // 功能设置列表
    const list = c.state.gridPropertyData?.style?.function?.function;

    if (Array.isArray(list)) {
      showPercent.value = list.includes('showPercent');
    }

    // 处理显示合计改变
    const handleShowAggChange = async (value: boolean) => {
      if (!c.state.gridPropertyData.style) {
        c.state.gridPropertyData.style = {};
      }
      if (!c.state.gridPropertyData.style.agg) {
        c.state.gridPropertyData.style.agg = {};
      }
      c.state.gridPropertyData.style.agg.show = value;
      c.updateGridReportModel();
    };

    // 处理显示百分比改变
    const handleShowPercentChange = (value: boolean) => {
      if (!c.state.gridPropertyData.style) {
        c.state.gridPropertyData.style = {};
      }
      if (!c.state.gridPropertyData.style.function) {
        c.state.gridPropertyData.style.function = {};
      }
      if (!Array.isArray(c.state.gridPropertyData.style.function.function)) {
        c.state.gridPropertyData.style.function.function = [];
      }
      const fnList: string[] = c.state.gridPropertyData.style.function.function;
      const index = fnList.indexOf('showPercent');
      if (value && index === -1) {
        fnList.push('showPercent');
      }
      if (!value && index !== -1) {
        fnList.splice(index, 1);
      }
      c.updateGridReportModel();
    };

    // 处理表格控制器初始化
    const handleGridInit = (grid: IBIReportChartController) => {
      c.setGrid(grid);
    };

    // 处理图表控制器初始化
    const handleChartInit = (chart: IBIReportChartController) => {
      c.setChart(chart);
    };

    // 图表容器
    const chartRef = ref();

    // 容器大小变化监听器
    let resizeObserver: ResizeObserver;

    onMounted(() => {
      if (chartRef.value && ResizeObserver) {
        resizeObserver = new ResizeObserver(() => {
          c.chart?.chartController?.resizeChart?.();
        });
        resizeObserver.observe(chartRef.value);
      }
    });

    onUnmounted(() => {
      resizeObserver?.disconnect();
    });

    // 是否打开popover
    const isActive = ref(false);

    // 处理重置按钮点击
    const handleReset = () => {
      c.resetModel();
      showAgg.value = !!c.state.gridPropertyData?.style?.agg?.show;
      const list = c.state.gridPropertyData?.style?.function?.function;
      if (Array.isArray(list)) {
        showPercent.value = list.includes('showPercent');
      } else {
        showPercent.value = false;
      }
    };

    // 处理确认按钮点击
    const handleConfirm = (data: IData) => {
      const type: string = data.type;
      c.state.filterMode = type;
      if (type === 'default') {
        const cond: IFilterNodeGroup = data.cond;
        c.state.cond = cond;
        if (cond) {
          const children = cond.children as IFilterNodeField[];
          if (Array.isArray(children) && children.length) {
            const groupLogicType = cond.logicType;
            const filter = children.map(child => {
              return {
                ...c.state.conditionFieldMap.get(child.field!),
                groupLogicType,
                condition: {
                  value: child.value,
                  valueOP: child.valueOP,
                  nodeType: 'FIELD',
                  field: child.field,
                },
              };
            });
            c.updateFilter(filter);
            return;
          }
        }
        c.updateFilter([]);
      }
      if (type === 'pql') {
        c.updateCustomCond(data.customCond);
      }
    };

    // popover容器
    let overlay: IOverlayPopoverContainer | undefined;

    // 打开过滤popover容器
    const openFilterPopover = async (e: MouseEvent) => {
      e.stopPropagation();
      if (overlay) {
        return;
      }
      if (!c.state.isLoadedSchema) {
        c.loadSchema();
      }
      overlay = ibiz.overlay.createPopover(
        (modal: IModal) => {
          return h(BIReportPanelFilter, {
            modal,
            state: c.state,
            context: c.panel.context,
            params: c.panel.params,
            onConfirm: handleConfirm,
            onReset: handleReset,
          });
        },
        undefined,
        {
          placement: 'bottom-start',
          autoClose: true,
          noArrow: true,
          width: 800,
        },
      );
      await overlay.present(e.target as HTMLElement);
      isActive.value = true;
      await overlay.onWillDismiss();
      isActive.value = false;
      overlay = undefined;
    };

    onUnmounted(() => {
      overlay?.dismiss();
    });

    return {
      ns,
      c,
      value,
      showAgg,
      showPercent,
      chartRef,
      isActive,
      handleShowAggChange,
      handleShowPercentChange,
      handleGridInit,
      handleChartInit,
      openFilterPopover,
    };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <el-collapse v-model={this.value}>
          {this.c.state.reportModel && (
            <el-collapse-item name='chart'>
              {{
                title: () => {
                  return (
                    <div class={this.ns.b('item-header')}>
                      <div class={this.ns.b('item-header-left')}>
                        {biReportT('chart')}
                      </div>
                    </div>
                  );
                },
                default: () => {
                  return (
                    <div class={this.ns.b('chart')} ref='chartRef'>
                      <iBizBIReportContent
                        mode='CONTENT'
                        context={this.c.context}
                        viewParams={this.c.panel.params}
                        config={this.c.state.reportModel}
                        onInit={this.handleChartInit}
                      ></iBizBIReportContent>
                    </div>
                  );
                },
              }}
            </el-collapse-item>
          )}
          {this.c.state.gridReportModel && (
            <el-collapse-item name='grid'>
              {{
                title: () => {
                  return (
                    <div class={this.ns.b('item-header')}>
                      <div class={this.ns.b('item-header-left')}>
                        {this.c.gridType.includes(this.c.config.selectChartType)
                          ? biReportT('chart')
                          : biReportT('data')}
                      </div>
                      <div
                        class={[
                          this.ns.b('filter'),
                          this.ns.is('active', this.isActive),
                        ]}
                        onClick={this.openFilterPopover}
                      >
                        <svg
                          class={this.ns.be('filter', 'icon')}
                          viewBox='0 0 16 16'
                          xmlns='http://www.w3.org/2000/svg'
                          height='1em'
                          width='1em'
                          preserveAspectRatio='xMidYMid meet'
                          focusable='false'
                        >
                          <g stroke-width='1' fill-rule='evenodd'>
                            <path d='M1.6 2h12.8a.6.6 0 0 1 0 1.2H1.6a.6.6 0 1 1 0-1.2zm2.5 5.393h7.8a.6.6 0 0 1 0 1.2H4.1a.6.6 0 1 1 0-1.2zm2.5 5.416h2.8a.6.6 0 0 1 0 1.2H6.6a.6.6 0 1 1 0-1.2z'></path>
                          </g>
                        </svg>
                        <div class={this.ns.be('filter', 'text')}>
                          {biReportT('filter')}
                        </div>
                        {!!this.c.state.condNum && (
                          <div class={this.ns.be('filter', 'badge')}>
                            {this.c.state.condNum}
                          </div>
                        )}
                      </div>
                      <div
                        class={this.ns.b('item-header-right')}
                        onClick={e => {
                          e.stopPropagation();
                        }}
                      >
                        <el-checkbox
                          v-model={this.showAgg}
                          onChange={this.handleShowAggChange}
                          label={biReportT('showTotal')}
                          size='large'
                        />
                        <el-checkbox
                          v-model={this.showPercent}
                          onChange={this.handleShowPercentChange}
                          label={biReportT('showPercent')}
                          size='large'
                        />
                      </div>
                    </div>
                  );
                },
                default: () => {
                  return (
                    <div class={this.ns.b('grid')}>
                      <iBizBIReportContent
                        mode='CONTENT'
                        context={this.c.context}
                        viewParams={this.c.panel.params}
                        config={this.c.state.gridReportModel}
                        onInit={this.handleGridInit}
                      ></iBizBIReportContent>
                    </div>
                  );
                },
              }}
            </el-collapse-item>
          )}
        </el-collapse>
      </div>
    );
  },
});
