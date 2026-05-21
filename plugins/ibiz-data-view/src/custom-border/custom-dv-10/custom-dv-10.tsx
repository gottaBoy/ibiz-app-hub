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
import './custom-dv-10.scss';

export const CustomDV10 = defineComponent({
  name: 'CustomDV10',
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
    const border = ['left-top', 'right-top', 'left-bottom', 'right-bottom'];
    const defaultColor = [getThemeVar() || '#0095ee', '#95d8f8'];
    const customDv10 = ref();
    const width = ref<number>(0);
    const height = ref<number>(0);
    const mergedColor = computed(() => {
      return deepMerge(defaultColor, props.color || []) as string[];
    });
    const backgroundColor = `var(${ns.cssVarName('screen-dashboard-custom-dv-bg')})`;    const offsety = ref(props.offsetY);
    const padding = ref(8);
    /**
     * 绘制边框svg
     */
    const renderBorder = () => {
      return (
        <div class={[ns.e('border-box')]}>
          {border.map((item: string) => (
            <svg
              width='150px'
              height={`${150 - props.offsetY / 2}px`}
              key={item}
              class={[ns.e(item), ns.em('border-svg', 'container')]}
            >
              <polygon
                fill={mergedColor.value[1]}
                points={`
               ${40 + padding.value}, ${0 + padding.value} 
               ${5 + padding.value}, ${0 + padding.value} 
               ${0 + padding.value}, ${5 + padding.value} 
               ${0 + padding.value}, ${16 + padding.value} 
               ${3 + padding.value}, ${19 + padding.value} 
               ${3 + padding.value}, ${7 + padding.value} 
               ${7 + padding.value}, ${3 + padding.value} 
               ${35 + padding.value}, ${3 + padding.value}
             `}
              />
            </svg>
          ))}
        </div>
      );
    };
    const initWH = () => {
      nextTick(() => {
        const dom = customDv10.value as Element;
        if (dom) {
          width.value = dom.clientWidth;
          height.value = dom.clientHeight;
        }
      });
    };
    onMounted(() => {
      initWH();
      bindDomResizeCallback(customDv10.value, initWH);
      window.addEventListener('resize', initWH);
    });
    onUnmounted(() => {
      unbindDomResizeCallback(customDv10.value);
      window.removeEventListener('resize', initWH);
    });
    return {
      ns,
      customDv10,
      mergedColor,
      renderBorder,
      backgroundColor,
      padding,
      offsety,
    };
  },
  render() {
    return (
      <div
        ref='customDv10'
        class={[this.ns.b(), this.ns.is('style-10', true)]}
        style={`--ibiz-style-10-offsetY:${this.offsety}px;--ibiz-style-10-padding:${this.padding}px`}
      >
        <div class={this.ns.e('wrapper')}>{this.renderBorder()}</div>
        <div
          class={this.ns.e('mask')}
          style={`box-shadow: inset 0 0 25px 3px ${this.mergedColor[0]};background-color: ${this.backgroundColor};`}
        ></div>
        <div class={this.ns.e('content')}>{this.$slots.default?.()}</div>
      </div>
    );
  },
});
