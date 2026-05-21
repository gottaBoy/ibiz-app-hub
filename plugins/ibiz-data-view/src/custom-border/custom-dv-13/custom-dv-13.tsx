/* eslint-disable vue/require-prop-types */
import {
  defineComponent,
  onMounted,
  onUnmounted,
  ref,
  nextTick,
  computed,
  PropType,
} from 'vue';
import { useNamespace } from '@ibiz-template/vue3-util';
import {
  deepMerge,
  getThemeVar,
  bindDomResizeCallback,
  unbindDomResizeCallback,
} from '../../util';
import './custom-dv-13.scss';

export const CustomDV13 = defineComponent({
  name: 'CustomDV13',
  props: {
    offsetX: {
      style: Number,
      default: 0,
    },
    offsetY: {
      style: Number,
      default: 0,
    },
    color: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
  },
  setup(props) {
    const ns = useNamespace('custom-border');
    const defaultColor = [getThemeVar() || '#0095ee', '#95d8f8'];
    const customDv13 = ref();
    const width = ref<number>(0);
    const height = ref<number>(0);
    const mergedColor = computed(() => {
      return deepMerge(defaultColor, props.color || []) as string[];
    });
    const backgroundColor = `var(${ns.cssVarName('screen-dashboard-custom-dv-bg')})`;
    /**
     * 绘制边框svg
     */
    const renderBorder = () => {
      const _width = width.value - props.offsetX;
      const _height = height.value - props.offsetY;
      const padding = 8;
      return (
        <svg
          class={[ns.em('border-svg', 'container')]}
          width={_width}
          height={_height}
          style={`--ibiz-style-13-offsetY:${props.offsetY}px`}
        >
          <path
            fill={backgroundColor}
            stroke={mergedColor.value[0]}
            d={`
            M ${5 + padding} ${20 + padding} L ${5 + padding} ${10 + padding} L ${12 + padding} ${3 + padding} 
            L ${60 - padding} ${3 + padding} L ${68 - padding} ${10 + padding}
            L ${width.value - 20 - padding} ${10 + padding} L ${width.value - 5 - padding} ${25 + padding}
            L ${width.value - 5 - padding} ${_height - 5 - padding} L ${20 + padding} ${_height - 5 - padding}
            L ${5 + padding} ${_height - 20 - padding} L ${5 + padding} ${20 + padding}
          `}
          />

          <path
            fill='transparent'
            stroke-width='3'
            stroke-linecap='round'
            stroke-dasharray='10, 5'
            stroke={mergedColor.value[0]}
            d={`M ${16 + padding} ${9 + padding} L ${61 - padding} ${9 + padding}`}
          />

          <path
            fill='transparent'
            stroke={mergedColor.value[1]}
            d={`M ${5 + padding} ${20 + padding} L ${5 + padding} ${10 + padding} L ${12 + padding} ${3 + padding} 
            L ${60 - padding} ${3 + padding} L ${68 - padding} ${10 + padding}`}
          />

          <path
            fill='transparent'
            stroke={mergedColor.value[1]}
            d={`M ${width.value - 5 - padding} ${_height - 30 - padding} L ${width.value - 5 - padding} ${_height - 5 - padding} L ${width.value - 30 - padding} ${_height - 5 - padding}`}
          />
        </svg>
      );
    };
    const initWH = () => {
      nextTick(() => {
        const dom = customDv13.value as Element;
        if (dom) {
          width.value = dom.clientWidth;
          height.value = dom.clientHeight;
        }
      });
    };
    onMounted(() => {
      initWH();
      bindDomResizeCallback(customDv13.value, initWH);
      window.addEventListener('resize', initWH);
    });
    onUnmounted(() => {
      unbindDomResizeCallback(customDv13.value);
      window.removeEventListener('resize', initWH);
    });
    return {
      ns,
      customDv13,
      renderBorder,
    };
  },
  render() {
    return (
      <div ref='customDv13' class={[this.ns.b(), this.ns.is('style-13', true)]}>
        {this.renderBorder()}
        <div class={this.ns.e('content')}>{this.$slots.default?.()}</div>
      </div>
    );
  },
});
