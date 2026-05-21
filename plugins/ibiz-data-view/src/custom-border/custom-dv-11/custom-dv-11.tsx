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
  fade,
  getThemeVar,
  bindDomResizeCallback,
  unbindDomResizeCallback,
} from '../../util';
import './custom-dv-11.scss';

export const CustomDV11 = defineComponent({
  name: 'CustomDV11',
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
    titleWidth: {
      type: Number,
      default: 250,
    },
    title: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const ns = useNamespace('custom-border');
    const id = createUUID();
    const defaultColor = [getThemeVar() || '#0095ee', '#95d8f8'];
    const filterId = ref(`${ns.b()}-filterId-${id}`);
    const customDv11 = ref();
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
        >
          <defs>
            <filter
              id={filterId.value}
              height='150%'
              width='150%'
              x='-25%'
              y='-25%'
            >
              <feMorphology
                operator='dilate'
                radius='2'
                in='SourceAlpha'
                result='thicken'
              />
              <feGaussianBlur in='thicken' stdDeviation='3' result='blurred' />
              <feFlood flood-color={mergedColor.value[1]} result='glowColor' />
              <feComposite
                in='glowColor'
                in2='blurred'
                operator='in'
                result='softGlowColored'
              />
              <feMerge>
                <feMergeNode in='softGlowColored' />
                <feMergeNode in='SourceGraphic' />
              </feMerge>
            </filter>
          </defs>

          <polygon
            fill={backgroundColor}
            points={`
        20, 32 ${width.value * 0.5 - props.titleWidth / 2}, 32 ${
          width.value * 0.5 - props.titleWidth / 2 + 20
        }, 53
        ${width.value * 0.5 + props.titleWidth / 2 - 20}, 53 ${
          width.value * 0.5 + props.titleWidth / 2
        }, 32
        ${width.value - 20}, 32 ${width.value - 8}, 48 ${width.value - 8}, ${
          height.value - 25
        } ${width.value - 20}, ${height.value - 8}
        20, ${height.value - 8} 8, ${height.value - 25} 8, 50
      `}
          />

          <polyline
            stroke={mergedColor.value[0]}
            filter={`url(#${filterId.value})`}
            points={`
    ${(width.value - props.titleWidth) / 2 + padding}, ${30 + padding}
    ${20 + padding}, ${30 + padding}
    ${7 + padding}, ${50 + padding} 
    ${7 + padding}, ${50 + (height.value - 167) / 2 + padding}
    ${13 + padding}, ${55 + (height.value - 167) / 2 + padding}
    ${13 + padding}, ${135 + (height.value - 167) / 2 + padding}
    ${7 + padding}, ${140 + (height.value - 167) / 2 + padding} 
    ${7 + padding}, ${height.value - 27 - padding}
    ${20 + padding}, ${height.value - 7 - padding} 
    ${width.value - 20 - padding}, ${height.value - 7 - padding} 
    ${width.value - 7 - padding}, ${height.value - 27 - padding}
    ${width.value - 7 - padding}, ${140 + (height.value - 167) / 2 + padding} 
    ${width.value - 13 - padding}, ${135 + (height.value - 167) / 2 + padding}
    ${width.value - 13 - padding}, ${55 + (height.value - 167) / 2 + padding} 
    ${width.value - 7 - padding}, ${50 + (height.value - 167) / 2 + padding}
    ${width.value - 7 - padding}, ${50 + padding}  ${width.value - 20 - padding},  ${30 + padding} 
     ${(width.value + props.titleWidth) / 2}, ${30 + padding}
     ${(width.value + props.titleWidth) / 2 - 20}, ${7 + padding} 
     ${(width.value - props.titleWidth) / 2 + 20}, ${7 + padding} 
     ${(width.value - props.titleWidth) / 2}, ${30 + padding}
     ${(width.value - props.titleWidth) / 2 + 20}, ${52 + padding} 
     ${(width.value + props.titleWidth) / 2 - 20}, ${52 + padding} 
     ${(width.value + props.titleWidth) / 2}, ${30 + padding}
          
          `}
          />

          <polygon
            stroke={mergedColor.value[0]}
            fill='transparent'
            points={`
          ${(width.value + props.titleWidth) / 2 - 5}, ${30 + padding} ${
            (width.value + props.titleWidth) / 2 - 21
          }, ${11 + padding}
          ${(width.value + props.titleWidth) / 2 - 27}, ${11 + padding} ${
            (width.value + props.titleWidth) / 2 - 8
          }, ${34 + padding}
        `}
          />

          <polygon
            stroke={mergedColor.value[0]}
            fill='transparent'
            points={`
          ${(width.value - props.titleWidth) / 2 + 5}, ${30 + padding} ${
            (width.value - props.titleWidth) / 2 + 22
          }, ${49 + padding}
          ${(width.value - props.titleWidth) / 2 + 28}, ${49 + padding} ${
            (width.value - props.titleWidth) / 2 + 8
          }, ${26 + padding}
        `}
          />

          <polygon
            stroke={mergedColor.value[0]}
            fill={fade(mergedColor.value[1] || defaultColor[1], 30) || ''}
            filter={`url(#${filterId.value})`}
            points={`
        ${(width.value + props.titleWidth) / 2 - 11}, ${37 + padding} ${
          (width.value + props.titleWidth) / 2 - 32
        }, ${11 + padding}
        ${(width.value - props.titleWidth) / 2 + 23}, ${11 + padding} ${
          (width.value - props.titleWidth) / 2 + 11
        }, ${23 + padding}
        ${(width.value - props.titleWidth) / 2 + 33}, ${49 + padding} ${
          (width.value + props.titleWidth) / 2 - 22
        }, ${49 + padding}
      `}
          />

          <polygon
            filter={`url(#${filterId.value})`}
            fill={mergedColor.value[0]}
            opacity='1'
            points={`
          ${(width.value - props.titleWidth) / 2 - 10}, ${37 + padding} ${
            (width.value - props.titleWidth) / 2 - 31
          }, ${37 + padding}
          ${(width.value - props.titleWidth) / 2 - 25}, ${46 + padding} ${
            (width.value - props.titleWidth) / 2 - 4
          }, ${46 + padding}
        `}
          >
            <animate
              attributeName='opacity'
              values='1;0.7;1'
              dur='2s'
              begin='0s'
              repeatCount='indefinite'
            />
          </polygon>

          <polygon
            filter={`url(#${filterId.value})`}
            fill={mergedColor.value[0]}
            opacity='0.7'
            points={`
          ${(width.value - props.titleWidth) / 2 - 40}, ${37 + padding} ${
            (width.value - props.titleWidth) / 2 - 61
          }, ${37 + padding}
          ${(width.value - props.titleWidth) / 2 - 55}, ${46 + padding} ${
            (width.value - props.titleWidth) / 2 - 34
          }, ${46 + padding}
        `}
          >
            <animate
              attributeName='opacity'
              values='0.7;0.4;0.7'
              dur='2s'
              begin='0s'
              repeatCount='indefinite'
            />
          </polygon>

          <polygon
            filter={`url(#${filterId.value})`}
            fill={mergedColor.value[0]}
            opacity='0.5'
            points={`
          ${(width.value - props.titleWidth) / 2 - 70}, ${37 + padding} ${
            (width.value - props.titleWidth) / 2 - 91
          }, ${37 + padding}
          ${(width.value - props.titleWidth) / 2 - 85}, ${46 + padding} ${
            (width.value - props.titleWidth) / 2 - 64
          }, ${46 + padding}
        `}
          >
            <animate
              attributeName='opacity'
              values='0.5;0.2;0.5'
              dur='2s'
              begin='0s'
              repeatCount='indefinite'
            />
          </polygon>

          <polygon
            filter={`url(#${filterId.value})`}
            fill={mergedColor.value[0]}
            opacity='1'
            points={`
          ${(width.value + props.titleWidth) / 2 + 30}, ${37 + padding} ${
            (width.value + props.titleWidth) / 2 + 9
          }, ${37 + padding}
          ${(width.value + props.titleWidth) / 2 + 3}, ${46 + padding} ${
            (width.value + props.titleWidth) / 2 + 24
          }, ${46 + padding}
        `}
          >
            <animate
              attributeName='opacity'
              values='1;0.7;1'
              dur='2s'
              begin='0s'
              repeatCount='indefinite'
            />
          </polygon>

          <polygon
            filter={`url(#${filterId.value})`}
            fill={mergedColor.value[0]}
            opacity='0.7'
            points={`
          ${(width.value + props.titleWidth) / 2 + 60}, ${37 + padding} ${
            (width.value + props.titleWidth) / 2 + 39
          }, ${37 + padding}
          ${(width.value + props.titleWidth) / 2 + 33}, ${46 + padding} ${
            (width.value + props.titleWidth) / 2 + 54
          }, ${46 + padding}
        `}
          >
            <animate
              attributeName='opacity'
              values='0.7;0.4;0.7'
              dur='2s'
              begin='0s'
              repeatCount='indefinite'
            />
          </polygon>

          <polygon
            filter={`url(#${filterId.value})`}
            fill={mergedColor.value[0]}
            opacity='0.5'
            points={`
        ${(width.value + props.titleWidth) / 2 + 90}, ${37 + padding} ${
          (width.value + props.titleWidth) / 2 + 69
        }, ${37 + padding}
        ${(width.value + props.titleWidth) / 2 + 63}, ${46 + padding} ${
          (width.value + props.titleWidth) / 2 + 84
        }, ${46 + padding}
      `}
          >
            <animate
              attributeName='opacity'
              values='0.5;0.2;0.5'
              dur='2s'
              begin='0s'
              repeatCount='indefinite'
            />
          </polygon>

          <text
            class='dv-border-box-11-title'
            x={`${width.value / 2}`}
            y='32'
            fill='#fff'
            font-size='18'
            text-anchor='middle'
            dominant-baseline='middle'
          >
            {props.title}
          </text>

          <polygon
            fill={mergedColor.value[0]}
            filter={`url(#${filterId.value})`}
            points={`
          ${7 + padding}, ${53 + (height.value - 167) / 2} ${11 + padding}, ${
            57 + (height.value - 167) / 2
          }
          ${11 + padding}, ${133 + (height.value - 167) / 2} ${7 + padding}, ${
            137 + (height.value - 167) / 2
          }
        `}
          />

          <polygon
            fill={mergedColor.value[0]}
            filter={`url(#${filterId.value})`}
            points={`
          ${width.value - 7 - padding}, ${53 + (height.value - 167) / 2} ${
            width.value - 11 - padding
          }, ${57 + (height.value - 167) / 2}
          ${width.value - 11 - padding}, ${133 + (height.value - 167) / 2} ${
            width.value - 7 - padding
          }, ${137 + (height.value - 167) / 2}
        `}
          />
        </svg>
      );
    };
    const initWH = () => {
      nextTick(() => {
        const dom = customDv11.value as Element;
        if (dom) {
          width.value = dom.clientWidth;
          height.value = dom.clientHeight;
        }
      });
    };
    onMounted(() => {
      initWH();
      bindDomResizeCallback(customDv11.value, initWH);
      window.addEventListener('resize', initWH);
    });
    onUnmounted(() => {
      unbindDomResizeCallback(customDv11.value);
      window.removeEventListener('resize', initWH);
    });
    return {
      ns,
      customDv11,
      renderBorder,
    };
  },
  render() {
    return (
      <div ref='customDv11' class={[this.ns.b(), this.ns.is('style-11', true)]}>
        {this.renderBorder()}
        <div class={this.ns.e('content')}>{this.$slots.default?.()}</div>
      </div>
    );
  },
});
