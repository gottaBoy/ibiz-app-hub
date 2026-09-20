import { PropType, computed, defineComponent, ref } from 'vue';
import { IChartConfig } from '../../../interface';
import { useNamespace } from '../../../use';
import './content-caption.scss';
import { BIReportDesignController } from '../../../controller';
import { biReportT } from '../../../locale';

export default defineComponent({
  name: 'BIContentCaption',
  props: {
    config: {
      type: Object as PropType<IChartConfig>,
      default: () => {},
    },
    controller: {
      type: Object as PropType<BIReportDesignController>,
    },
  },
  setup(props) {
    const ns = useNamespace('bi-content-caption');

    const controllerCaption = computed(() => {
      return props.controller?.state.propertyData?.caption;
    });

    const uiState = ref({
      chartCaption: controllerCaption.value, // 图表名称
      isFocus: false, // 是否聚焦
    });

    // 聚焦
    const onFocus = () => {
      uiState.value.isFocus = true;
      uiState.value.chartCaption =
        props.controller?.state.propertyData?.caption;
    };

    // 更改值
    const onChange = () => {
      uiState.value.isFocus = false;
      props.controller?.setData('caption', uiState.value.chartCaption);
    };

    // 处理键盘点击enter
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e && e.code === 'Enter') {
        onChange();
      } else if (e && e.code === 'Escape') {
        e.stopPropagation();
        uiState.value.isFocus = false;
        uiState.value.chartCaption =
          props.controller?.state.propertyData.caption;
      }
    };

    const caption = computed(() => {
      return (
        props.controller?.state.propertyData.caption || biReportT('unnamed')
      );
    });

    return { ns, caption, uiState, onFocus, onChange, handleKeyDown };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <div
          class={[
            this.ns.e('caption'),
            this.ns.is('focus', this.uiState.isFocus),
          ]}
        >
          <div class={this.ns.e('label')}>
            <span>{this.caption}</span>
            <svg
              viewBox='0 0 16 16'
              xmlns='http://www.w3.org/2000/svg'
              height='1em'
              width='1em'
              focusable='false'
            >
              <g id='aiwaction/edit' stroke-width='1' fill-rule='evenodd'>
                <path
                  d='M2 8.34L10.71 0 15 4.17 6.538 13H2V8.34zm1.2.512V11.8h2.826l7.283-7.6-2.606-2.533L3.2 8.852zM0 16v-1.2h16V16H0z'
                  id='aiw编辑'
                ></path>
              </g>
            </svg>
          </div>
          <el-input
            class={this.ns.e('input')}
            v-model={this.uiState.chartCaption}
            placeholder={biReportT('reportNamePlaceholder')}
            onFocus={this.onFocus}
            onKeydown={this.handleKeyDown}
            onBlur={this.onChange}
          ></el-input>
        </div>
        <div class={this.ns.e('data-total')}>
          <span class={this.ns.e('size')}>
            {biReportT('recordCount', {
              count:
                this.controller?.state.reportChart?.state?.items.length || 0,
            })}
          </span>
        </div>
      </div>
    );
  },
});
