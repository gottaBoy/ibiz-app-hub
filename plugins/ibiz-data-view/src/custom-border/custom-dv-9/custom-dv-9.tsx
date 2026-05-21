/* eslint-disable vue/require-prop-types */
import { createUUID } from 'qx-util';
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
import './custom-dv-9.scss';

export const CustomDV9 = defineComponent({
  name: 'CustomDV9',
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
    const id = createUUID();
    const gradientId = ref(`border-box-9-gradient-${id}`);
    const maskId = ref(`border-box-9-mask-${id}`);
    const defaultColor = [getThemeVar() || '#0095ee', '#95d8f8'];
    const customDv9 = ref();
    const width = ref<number>(0);
    const height = ref<number>(0);
    const mergedColor = computed(() => {
      return deepMerge(defaultColor, props.color || []) as string[];
    });
    const backgroundColor = `var(${ns.cssVarName('screen-dashboard-custom-dv-bg')})`;    /**
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
          style={`--ibiz-style-9-offsetY:${props.offsetY}px`}
        >
          <defs>
            <linearGradient
              id={gradientId.value}
              x1='0%'
              y1='0%'
              x2='100%'
              y2='100%'
            >
              <animate
                attributeName='x1'
                values='0%;100%;0%'
                dur='10s'
                begin='0s'
                repeatCount='indefinite'
              />

              <animate
                attributeName='x2'
                values='100%;0%;100%'
                dur='10s'
                begin='0s'
                repeatCount='indefinite'
              />

              <stop offset='0%' stop-color={mergedColor.value[0]}>
                <animate
                  attributeName='stop-color'
                  values={`${mergedColor.value[0]};${mergedColor.value[1]};${mergedColor.value[0]}`}
                  dur='10s'
                  begin='0s'
                  repeatCount='indefinite'
                />
              </stop>
              <stop offset='100%' stop-color={mergedColor.value[1]}>
                <animate
                  attributeName='stop-color'
                  values={`${mergedColor.value[1]};${mergedColor.value[0]};${mergedColor.value[1]}`}
                  dur='10s'
                  begin='0s'
                  repeatCount='indefinite'
                />
              </stop>
            </linearGradient>

            <mask id={maskId.value}>
              <polyline
                stroke='#fff'
                stroke-width='3'
                fill='transparent'
                points={`${8 + padding}, ${_height * 0.4 + padding} ${8 + padding}, ${3 + padding}, ${width.value * 0.4 + 7 + padding}, ${3 + padding}`}
              />
              <polyline
                fill='#fff'
                points={`${8 + padding}, ${_height * 0.15 + padding} ${8 + padding}, ${3 + padding}, ${width.value * 0.1 + 7 + padding}, ${3 + padding}
              ${width.value * 0.1 + padding}, ${8 + padding} ${14 + padding}, ${8 + padding} ${14 + padding}, ${_height * 0.15 - 7 + padding}
            `}
              />

              <polyline
                stroke='#fff'
                stroke-width='3'
                fill='transparent'
                points={`${width.value * 0.5 - padding}, ${3 + padding} ${width.value - 3 - padding}, ${3 + padding}, ${
                  width.value - 3 - padding
                }, ${_height * 0.25 + padding}`}
              />
              <polyline
                fill='#fff'
                points={`
              ${width.value * 0.52}, ${3 + padding} ${width.value * 0.58}, ${3 + padding}
              ${width.value * 0.58 - 7}, ${9 + padding} ${width.value * 0.52 + 7}, ${9 + padding}
            `}
              />
              <polyline
                fill='#fff'
                points={`
              ${width.value * 0.9 - padding}, ${3 + padding} 
              ${width.value - 3 - padding}, ${3 + padding} 
              ${width.value - 3 - padding}, ${_height * 0.1 + padding}
              ${width.value - 9 - padding}, ${_height * 0.1 - 7 + padding}
               ${width.value - 9 - padding}, ${9 + padding}
                ${width.value * 0.9 + 7 - padding}, ${9 + padding}
            `}
              />

              <polyline
                stroke='#fff'
                stroke-width='3'
                fill='transparent'
                points={`${8 + padding}, ${_height * 0.5} ${8 + padding}, ${_height - 3 - padding} ${
                  width.value * 0.3 + 7
                }, ${_height - 3 - padding}`}
              />
              <polyline
                fill='#fff'
                points={`
              ${8 + padding}, ${_height * 0.55} ${8 + padding}, ${_height * 0.7}
              ${2 + padding}, ${_height * 0.7 - 7} ${2 + padding}, ${_height * 0.55 + 7}
            `}
              />

              <polyline
                stroke='#fff'
                stroke-width='3'
                fill='transparent'
                points={`${width.value * 0.35 - padding}, ${_height - 3 - padding} ${
                  width.value - 3 - padding
                }, ${_height - 3 - padding} ${width.value - 3 - padding}, ${_height * 0.35 - padding}`}
              />
              <polyline
                fill='#fff'
                points={`
              ${width.value * 0.92 - padding}, ${_height - 3 - padding}
               ${width.value - 3 - padding}, ${
                 _height - 3 - padding
               } ${width.value - 3 - padding}, ${_height * 0.8 - padding}
              ${width.value - 9 - padding}, ${_height * 0.8 + 7 - padding} ${
                width.value - 9 - padding
              }, ${_height - 9 - padding} ${width.value * 0.92 + 7 - padding}, ${_height - 9 - padding}
            `}
              />
            </mask>
          </defs>

          <polygon
            fill={backgroundColor}
            points={`
        15, 9 ${width.value * 0.1 + 1}, 9 ${width.value * 0.1 + 4}, 6 ${
          width.value * 0.52 + 2
        }, 6
        ${width.value * 0.52 + 6}, 10 ${width.value * 0.58 - 7}, 10 ${
          width.value * 0.58 - 2
        }, 6
        ${width.value * 0.9 + 2}, 6 ${width.value * 0.9 + 6}, 10 ${
          width.value - 10
        }, 10 ${width.value - 10}, ${_height * 0.1 - 6}
        ${width.value - 6}, ${_height * 0.1 - 1} ${width.value - 6}, ${
          _height * 0.8 + 1
        } ${width.value - 10}, ${_height * 0.8 + 6}
        ${width.value - 10}, ${_height - 10} ${width.value * 0.92 + 7}, ${
          _height - 10
        }  ${width.value * 0.92 + 2}, ${_height - 6}
        11, ${_height - 6} 11, ${_height * 0.15 - 2} 15, ${_height * 0.15 - 7}
      `}
          />

          <rect
            x='0'
            y='0'
            width={width.value}
            height={_height}
            fill={`url(#${gradientId.value})`}
            mask={`url(#${maskId.value})`}
          />
        </svg>
      );
    };
    const initWH = () => {
      nextTick(() => {
        const dom = customDv9.value as Element;
        if (dom) {
          width.value = dom.clientWidth;
          height.value = dom.clientHeight;
        }
      });
    };
    onMounted(() => {
      initWH();
      bindDomResizeCallback(customDv9.value, initWH);
      window.addEventListener('resize', initWH);
    });
    onUnmounted(() => {
      unbindDomResizeCallback(customDv9.value);
      window.removeEventListener('resize', initWH);
    });
    return {
      ns,
      customDv9,
      renderBorder,
    };
  },
  render() {
    return (
      <div ref='customDv9' class={[this.ns.b(), this.ns.is('style-9', true)]}>
        {this.renderBorder()}
        <div class={this.ns.e('content')}>{this.$slots.default?.()}</div>
      </div>
    );
  },
});
