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
import './custom-dv-3.scss';

export const CustomDV3 = defineComponent({
  name: 'CustomDV3',
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
    const customDv3 = ref();
    const width = ref<number>(0);
    const height = ref<number>(0);
    const mergedColor = computed(() => {
      return deepMerge(defaultColor, props.color || []) as string[];
    });
    const backgroundColor = `var(${ns.cssVarName('screen-dashboard-custom-dv-bg')})`; /**
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
          style={`--ibiz-style-3-offsetY:${props.offsetY}px`}
        >
          <polygon
            fill={backgroundColor}
            points={`
            ${23 + padding}, ${23 + padding} 
            ${width.value - 24 - padding}, ${23 + padding} 
            ${width.value - 24 - padding}, ${height.value - 24 - props.offsetY - padding} 
            ${23 + padding}, ${height.value - 24 - props.offsetY - padding}
          `}
          />

          <polyline
            class={[ns.e('bb3-line1')]}
            stroke={mergedColor.value[0]}
            points={`
            ${4 + padding}, ${4 + padding} 
            ${width.value - 22 - padding}, ${4 + padding} 
            ${width.value - 22 - padding}, ${height.value - 22 - props.offsetY - padding} 
            ${4 + padding}, ${height.value - 22 - props.offsetY - padding} 
            ${4 + padding}, ${4 + padding}
          `}
          />
          <polyline
            class={[ns.e('bb3-line2')]}
            stroke={mergedColor.value[1]}
            points={`
            ${10 + padding}, ${10 + padding} 
            ${width.value - 16 - padding}, ${10 + padding} 
            ${width.value - 16 - padding}, ${height.value - 16 - props.offsetY - padding} 
            ${10 + padding}, ${height.value - 16 - props.offsetY - padding} 
            ${10 + padding}, ${10 + padding}
          `}
          />
          <polyline
            class={[ns.e('bb3-line2')]}
            stroke={mergedColor.value[1]}
            points={`
            ${16 + padding}, ${16 + padding} 
            ${width.value - 10 - padding}, ${16 + padding} 
            ${width.value - 10 - padding}, ${height.value - 10 - props.offsetY - padding} 
            ${16 + padding}, ${height.value - 10 - props.offsetY - padding} 
            ${16 + padding}, ${16 + padding}
          `}
          />
          <polyline
            class={[ns.e('bb3-line2')]}
            stroke={mergedColor.value[1]}
            points={`
            ${22 + padding}, ${22 + padding} 
            ${width.value - 4 - padding}, ${22 + padding} 
            ${width.value - 4 - padding}, ${height.value - 4 - props.offsetY - padding} 
            ${22 + padding}, ${height.value - 4 - props.offsetY - padding} 
            ${22 + padding}, ${22 + padding}
          `}
          />
        </svg>
      );
    };
    const initWH = () => {
      nextTick(() => {
        const dom = customDv3.value as Element;
        if (dom) {
          width.value = dom.clientWidth;
          height.value = dom.clientHeight;
        }
      });
    };
    onMounted(() => {
      initWH();
      bindDomResizeCallback(customDv3.value, initWH);
      window.addEventListener('resize', initWH);
    });
    onUnmounted(() => {
      unbindDomResizeCallback(customDv3.value);
      window.removeEventListener('resize', initWH);
    });
    return {
      ns,
      customDv3,
      renderBorder,
    };
  },
  render() {
    return (
      <div ref='customDv3' class={[this.ns.b(), this.ns.is('style-3', true)]}>
        {this.renderBorder()}
        <div class={this.ns.e('content')}>{this.$slots.default?.()}</div>
      </div>
    );
  },
});
