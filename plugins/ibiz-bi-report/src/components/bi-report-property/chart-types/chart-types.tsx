import { defineComponent, onMounted, ref, watch } from 'vue';
import { useNamespace } from '../../../use';
import { ChartTypes } from '../../../config';
import './chart-types.scss';
import { biReportChartIcon } from '../../../locale';

export default defineComponent({
  name: 'BIChartTypes',
  props: {
    chartType: {
      type: String,
      default: 'NUMBER',
    },
  },
  emits: ['select'],
  setup(props, { emit }) {
    const ns = useNamespace('chart-types');
    const items = ref<IData[]>([]);
    const select = ref('');

    watch(
      () => props.chartType,
      newVal => {
        select.value = newVal;
      },
      { immediate: true },
    );

    onMounted(() => {
      items.value = ChartTypes;
    });

    // 图表类型选择
    const onSelect = (item: IData) => {
      emit('select', item);
    };

    return { ns, items, select, onSelect };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        {this.items.map((item: IData) => {
          return (
            <el-tooltip
              effect='dark'
              content={item.caption}
              placement='top'
              show-after={200}
              hide-after={0}
              popper-class={this.ns.e('tooltip')}
              show-arrow
            >
              {{
                default: () => {
                  return (
                    <div
                      class={[
                        this.ns.e('item'),
                        this.ns.is('selected', this.select === item.type),
                      ]}
                      onClick={() => this.onSelect(item)}
                      v-html={biReportChartIcon(item.icon, item.caption)}
                    ></div>
                  );
                },
              }}
            </el-tooltip>
          );
        })}
      </div>
    );
  },
});
