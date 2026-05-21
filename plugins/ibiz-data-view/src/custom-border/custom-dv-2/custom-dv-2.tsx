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
import './custom-dv-2.scss';

export const CustomDV2 = defineComponent({
  name: 'CustomDV2',
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
    const customDv2 = ref();
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
          style={`--ibiz-style-2-offsetY:${props.offsetY}px`}
        >
          <polygon
            fill={backgroundColor}
            points={`
            ${7 + padding}, ${7 + padding} 
            ${width.value - 7 - padding}, ${7 + padding} 
            ${width.value - 7 - padding}, ${height.value - 7 - props.offsetY - padding} 
            ${7 + padding}, ${height.value - 7 - padding - props.offsetY}
          `}
          />

          <polyline
            stroke={mergedColor.value[0]}
            points={`
            ${2 + padding}, ${2 + padding} 
            ${width.value - 2 - padding}, ${2 + padding} 
            ${width.value - 2 - padding}, ${height.value - 2 - props.offsetY - padding} 
            ${2 + padding}, ${height.value - 2 - props.offsetY - padding} 
            ${2 + padding}, ${2 + padding}
          `}
          />
          <polyline
            stroke={mergedColor.value[1]}
            points={`
            ${6 + padding}, ${6 + padding} 
            ${width.value - 6 - padding}, ${6 + padding} 
            ${width.value - 6 - padding}, ${height.value - 6 - padding - props.offsetY} 
            ${6 + padding}, ${height.value - 6 - props.offsetY - padding} 
            ${6 + padding}, ${6 + padding}
          `}
          />
          <circle
            fill={mergedColor.value[0]}
            cx={`${11 + padding}`}
            cy={`${11 + padding}`}
            r='1'
          />
          <circle
            fill={mergedColor.value[0]}
            cx={`${width.value - 11 - padding}`}
            cy={`${11 + padding}`}
            r='1'
          />
          <circle
            fill={mergedColor.value[0]}
            cx={`${width.value - 11 - padding}`}
            cy={`${height.value - 11 - padding - props.offsetY}`}
            r='1'
          />
          <circle
            fill={mergedColor.value[0]}
            cx={`${11 + padding}`}
            cy={`${height.value - 11 - padding - props.offsetY}`}
            r='1'
          />
        </svg>
      );
    };
    const initWH = () => {
      nextTick(() => {
        const dom = customDv2.value as Element;
        if (dom) {
          width.value = dom.clientWidth;
          height.value = dom.clientHeight;
        }
      });
    };
    onMounted(() => {
      initWH();
      bindDomResizeCallback(customDv2.value, initWH);
      window.addEventListener('resize', initWH);
    });
    onUnmounted(() => {
      unbindDomResizeCallback(customDv2.value);
      window.removeEventListener('resize', initWH);
    });
    return {
      ns,
      customDv2,
      renderBorder,
    };
  },
  render() {
    return (
      <div ref='customDv2' class={[this.ns.b(), this.ns.is('style-2', true)]}>
        {this.renderBorder()}
        <div class={this.ns.e('content')}>{this.$slots.default?.()}</div>
      </div>
    );
  },
});
