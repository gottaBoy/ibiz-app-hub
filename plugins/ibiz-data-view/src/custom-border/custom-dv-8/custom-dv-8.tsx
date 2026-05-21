/* eslint-disable vue/require-prop-types */
import {
  ComponentInternalInstance,
  PropType,
  Ref,
  computed,
  defineComponent,
  getCurrentInstance,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue';
import { useNamespace } from '@ibiz-template/vue3-util';
import { createUUID } from 'qx-util';
import { debounce, getThemeVar, observerDomResize } from '../../util';
import './custom-dv-8.scss';

export const CustomDV8 = defineComponent({
  name: 'CustomDV8',
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
    reverse: {
      type: Boolean,
      default: false,
    },
    dur: {
      // 单次动画时长，单位秒，默认为3秒
      type: Number,
      default: 3,
    },
  },
  setup(props) {
    const ns = useNamespace('custom-border');
    const width = ref(0);
    const height = ref(0);
    const myElement = ref();
    const mergedColor: Ref<Array<string>> = ref([]);
    let debounceInitWHFun:
      | MutationCallback
      | EventListenerOrEventListenerObject;
    let domObserver: MutationObserver | null;

    const id = createUUID();
    const path = `border-box-8-path-${id}`;
    const gradient = `border-box-8-gradient-${id}`;
    const mask = `border-box-8-mask-${id}`;
    const backgroundColor = `var(${ns.cssVarName('screen-dashboard-custom-dv-bg')})`;    const length = computed(() => {
      return (width.value + height.value - props.offsetY - 5) * 2;
    });

    const pathD = (padding: number) => {
      const borderWidth = 0.5;
      if (props.reverse) {
        // 当reverse为true时，从左上角开始，逆时针方向绘制
        return `M ${borderWidth + padding},${borderWidth + padding} L ${borderWidth + padding},${height.value - borderWidth - props.offsetY - padding} L ${width.value - borderWidth - padding},${height.value - borderWidth - props.offsetY - padding} L ${width.value - borderWidth - padding},${borderWidth + padding} Z`;
      }
      // 当reverse为false时，从左上角开始，顺时针方向绘制
      return `M ${borderWidth + padding},${borderWidth + padding} L ${width.value - borderWidth - padding},${borderWidth + padding} L ${width.value - borderWidth - padding},${height.value - borderWidth - props.offsetY - padding} L ${borderWidth + padding},${height.value - borderWidth - props.offsetY - padding} Z`;
    };

    /**
     *  初始化宽高
     * @param resize
     * @returns
     */
    const initWH = () => {
      return new Promise((resolve: Function) => {
        nextTick(() => {
          const dom = myElement.value;
          width.value = dom ? dom.offsetWidth : 0;
          height.value = dom ? dom.offsetHeight : 0;
          if (!dom) {
            console.warn(
              'DataV: Failed to get dom node, component rendering may be abnormal!',
            );
          } else if (!width.value || !height.value) {
            console.warn(
              'DataV: Component width or height is 0px, rendering abnormality may occur!',
            );
          }
          resolve();
        });
      });
    };

    /**
     * 重绘宽高防抖
     */
    const getDebounceInitWHFun = () => {
      debounceInitWHFun = debounce(
        100,
        initWH,
        getCurrentInstance() as ComponentInternalInstance,
        null,
      );
    };

    /**
     * 绑定dom重绘回调
     */
    const bindDomResizeCallback = () => {
      const dom = myElement.value;
      domObserver = observerDomResize(
        dom,
        debounceInitWHFun as MutationCallback,
      );

      window.addEventListener('resize', debounceInitWHFun as EventListener);
    };

    /**
     *  解绑dom重绘回调
     * @returns
     */
    const unbindDomResizeCallback = () => {
      if (!domObserver) return;

      domObserver.disconnect();
      domObserver.takeRecords();
      domObserver = null;
      window.removeEventListener('resize', debounceInitWHFun as EventListener);
    };

    /**
     *  合并自定义颜色与默认颜色
     * @returns
     */
    const mergeColor = () => {
      if (!Array.isArray(props.color)) {
        console.warn('颜色配置错误，需要一个数组');
        mergedColor.value = [getThemeVar() || '#123afc', 'rgba(0,0,255,0.7)'];
        return;
      }
      mergedColor.value = [];
      const defaultColors = [getThemeVar() || '#123afc', 'rgba(0,0,255,0.7)'];
      if (props.color.length > 0) {
        for (let i = 0; i < props.color.length; i++) {
          mergedColor.value[i] = props.color[i] as string;
        }
        if (mergedColor.value.length < 2) {
          mergedColor.value.push('rgba(0,0,255,0.7)');
        }
      } else {
        mergedColor.value = defaultColors;
      }
    };

    /**
     * 监听颜色
     */
    watch(
      () => props.color,
      () => {
        mergeColor();
      },
      {
        deep: true,
        immediate: true,
      },
    );

    /**
     * 绘制边框
     */
    const renderBorder = () => {
      const _width = width.value - props.offsetX;
      const _height = height.value - props.offsetY;
      const padding = 8;
      return (
        <svg
          class={[ns.e('svg-container')]}
          width={_width}
          height={_height}
          style={`--ibiz-style-8-offsetY:${props.offsetY}px`}
        >
          <defs>
            <path id={path} d={pathD(padding)} fill='transparent' />
            <radialGradient id={gradient} cx='50%' cy='50%' r='50%'>
              <stop offset='0%' stop-color='#fff' stop-opacity='1' />
              <stop offset='100%' stop-color='#fff' stop-opacity='0' />
            </radialGradient>

            <mask id={mask}>
              <path id='myPath' d={pathD(padding)} stroke='black' fill='none' />
              <circle cx='0' cy='0' r='150' fill={`url(#${gradient})`}>
                <animateMotion
                  dur={`${props.dur}s`}
                  rotate='auto'
                  repeatCount='indefinite'
                >
                  <mpath href='#myPath' />
                </animateMotion>
              </circle>
            </mask>
          </defs>

          <polygon
            fill={backgroundColor}
            points={`${0}, ${padding} ${width.value}, ${padding} ${width.value}, ${height.value - props.offsetY - padding} ${0}, ${height.value - props.offsetY - padding}`}
          />

          <use
            stroke={mergedColor.value[0]}
            stroke-width='1'
            xlinkHref={`#${path}`}
          />

          <use
            stroke={mergedColor.value[1]}
            stroke-width='3'
            xlinkHref={`#${path}`}
            mask={`url(#${mask})`}
          >
            <animate
              attributeName='stroke-dasharray'
              from={`0, ${length.value}`}
              to={`${length.value}, 0`}
              dur={`${props.dur}s`}
              repeatCount='indefinite'
            />
          </use>
        </svg>
      );
    };

    /**
     * 初始化
     */
    const autoResizeMixinInit = async () => {
      await initWH();

      getDebounceInitWHFun();

      bindDomResizeCallback();

      const _vm = getCurrentInstance();

      if (
        _vm &&
        typeof (_vm as IParams).afterAutoResizeMixinInit === 'function'
      )
        (_vm as IParams).afterAutoResizeMixinInit();
    };

    onMounted(() => {
      mergeColor();
      autoResizeMixinInit();
    });

    onBeforeUnmount(() => {
      unbindDomResizeCallback();
    });

    return {
      renderBorder,
      ns,
      myElement,
    };
  },
  render() {
    return (
      <div
        class={[this.ns.b(), this.ns.is('style-8', true)]}
        ref={el => {
          this.myElement = el;
        }}
      >
        {this.renderBorder()}
        <div class={this.ns.e('content')}>{this.$slots.default?.()}</div>
      </div>
    );
  },
});
