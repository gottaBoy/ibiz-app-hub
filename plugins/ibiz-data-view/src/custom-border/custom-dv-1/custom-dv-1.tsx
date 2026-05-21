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
import './custom-dv-1.scss';

export const CustomDV1 = defineComponent({
  name: 'CustomDV1',
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
    const border = ['left-top', 'right-top', 'left-bottom', 'right-bottom'];
    const customDv1 = ref();
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
        <div class={[ns.e('border-box')]}>
          <svg class={[ns.e('border')]} width={_width} height={_height}>
            <polygon
              fill={backgroundColor}
              points={`10, 27 10, ${height.value - 27 - props.offsetY} 13, ${
                height.value - 24 - props.offsetY
              } 13, ${height.value - 21 - props.offsetY} 24, ${height.value - 11 - props.offsetY}
        38, ${height.value - 11 - props.offsetY} 41, ${height.value - 8 - props.offsetY} 73, ${
          height.value - 8 - props.offsetY
        } 75, ${height.value - 10 - props.offsetY} 81, ${height.value - 10 - props.offsetY}
        85, ${height.value - 6 - props.offsetY} ${width.value - 85}, ${height.value - 6 - props.offsetY} ${
          width.value - 81
        }, ${height.value - 10 - props.offsetY} ${width.value - 75}, ${height.value - 10 - props.offsetY}
        ${width.value - 73}, ${height.value - 8 - props.offsetY} ${width.value - 41}, ${
          height.value - 8 - props.offsetY
        } ${width.value - 38}, ${height.value - 11 - props.offsetY}
        ${width.value - 24}, ${height.value - 11 - props.offsetY} ${width.value - 13}, ${
          height.value - 21 - props.offsetY
        } ${width.value - 13}, ${height.value - 24 - props.offsetY}
        ${width.value - 10}, ${height.value - 27 - props.offsetY} ${width.value - 10}, 27 ${
          width.value - 13
        }, 25 ${width.value - 13}, 21
        ${width.value - 24}, 11 ${width.value - 38}, 11 ${
          width.value - 41
        }, 8 ${width.value - 73}, 8 ${width.value - 75}, 10
        ${width.value - 81}, 10 ${
          width.value - 85
        }, 6 85, 6 81, 10 75, 10 73, 8 41, 8 38, 11 24, 11 13, 21 13, 24`}
            />
          </svg>
          {border.map((item: string) => {
            return (
              <svg key={item} class={[ns.e(item), ns.e('border')]}>
                <polygon
                  fill={mergedColor.value[0]}
                  points={`
                  ${6 + padding},${66 + padding} ${6 + padding},${18 + padding} ${12 + padding},${12 + padding} ${18 + padding},${12 + padding} ${24 + padding},${6 + padding} ${27 + padding},${6 + padding} ${30 + padding},${9 + padding} ${36 + padding},${9 + padding} ${39 + padding},${6 + padding} ${84 + padding},${6 + padding} ${81 + padding},${9 + padding} ${75 + padding},${9 + padding} ${73.2 + padding},${7 + padding} ${40.8 + padding},${7 + padding} ${37.8 + padding},${10.2 + padding} ${24 + padding},${10.2 + padding} ${12 + padding},${21 + padding} ${12 + padding},${24 + padding} ${9 + padding},${27 + padding} ${9 + padding},${51 + padding} ${7.8 + padding},${54 + padding} ${7.8 + padding},${63 + padding}
                `}
                >
                  <animate
                    attributeName='fill'
                    values={`${mergedColor.value[0]};${mergedColor.value[1]};${mergedColor.value[0]}`}
                    dur='0.5s'
                    begin='0s'
                    repeatCount='indefinite'
                  />
                </polygon>
                <polygon
                  fill={mergedColor.value[1]}
                  points={`
                  ${27.6 + padding},${4.8 + padding} ${38.4 + padding},${4.8 + padding} ${35.4 + padding},${7.8 + padding} ${30.6 + padding},${7.8 + padding}
                `}
                >
                  <animate
                    attributeName='fill'
                    values={`${mergedColor.value[1]};${mergedColor.value[0]};${mergedColor.value[1]}`}
                    dur='0.5s'
                    begin='0s'
                    repeatCount='indefinite'
                  />
                </polygon>
                <polygon
                  fill={mergedColor.value[0]}
                  points={`
                  ${9 + padding},${54 + padding} ${9 + padding},${63 + padding} ${7.2 + padding},${66 + padding} ${7.2 + padding},${75 + padding} ${7.8 + padding},${78 + padding} ${7.8 + padding},${110 + padding} ${8.4 + padding},${110 + padding} ${8.4 + padding},${66 + padding} ${9.6 + padding},${66 + padding} ${9.6 + padding},${54 + padding}
                `}
                >
                  <animate
                    attributeName='fill'
                    values={`${mergedColor.value[0]};${mergedColor.value[1]};transparent`}
                    dur='1s'
                    begin='0s'
                    repeatCount='indefinite'
                  />
                </polygon>
              </svg>
            );
          })}
        </div>
      );
    };
    const initWH = () => {
      nextTick(() => {
        const dom = customDv1.value as Element;
        if (dom) {
          width.value = dom.clientWidth;
          height.value = dom.clientHeight;
        }
      });
    };
    onMounted(() => {
      initWH();
      bindDomResizeCallback(customDv1.value, initWH);
      window.addEventListener('resize', initWH);
    });
    onUnmounted(() => {
      unbindDomResizeCallback(customDv1.value);
      window.removeEventListener('resize', initWH);
    });
    return {
      ns,
      customDv1,
      renderBorder,
    };
  },
  render() {
    return (
      <div
        ref='customDv1'
        class={[this.ns.b(), this.ns.is('style-1', true)]}
        style={`--ibiz-style-1-offsetY:${this.offsetY}px`}
      >
        <div class={this.ns.e('wrapper')}>{this.renderBorder()}</div>
        <div class={this.ns.e('content')}>{this.$slots.default?.()}</div>
      </div>
    );
  },
});
