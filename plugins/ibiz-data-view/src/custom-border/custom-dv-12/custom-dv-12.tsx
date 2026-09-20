/* eslint-disable vue/require-prop-types */
import {
  ComponentInternalInstance,
  PropType,
  Ref,
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
import { debounce, observerDomResize, getThemeVar } from '../../util';
import './custom-dv-12.scss';
import { dataViewT } from '../../locale';

export const CustomDV12 = defineComponent({
  name: 'CustomDV12',
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
    const width = ref(0);
    const height = ref(0);
    const myElement = ref();
    const mergedColor: Ref<Array<string>> = ref([]);
    let debounceInitWHFun:
      | MutationCallback
      | EventListenerOrEventListenerObject;
    let domObserver: MutationObserver | null;
    const id = createUUID();
    const filterId = `borderr-box-12-filterId-${id}`;
    const backgroundColor = `var(${ns.cssVarName('screen-dashboard-custom-dv-bg')})`;
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

      window.addEventListener(
        'resize',
        debounceInitWHFun as EventListenerOrEventListenerObject,
      );
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
      window.removeEventListener(
        'resize',
        debounceInitWHFun as EventListenerOrEventListenerObject,
      );
    };

    /**
     *  合并自定义颜色与默认颜色
     * @returns
     */
    const mergeColor = () => {
      if (!Array.isArray(props.color)) {
        console.warn(dataViewT('warnings.invalidColorArray'));
        mergedColor.value = [getThemeVar() || '#123afc', '#0000FF'];
        return;
      }
      mergedColor.value = [];
      const defaultColors = [getThemeVar() || '#123afc', '#0000FF'];
      if (props.color.length > 0) {
        for (let i = 0; i < props.color.length; i++) {
          mergedColor.value[i] = props.color[i] as string;
        }
        if (mergedColor.value.length < 2) {
          mergedColor.value.push('#0000FF');
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
          style={`--ibiz-style-12-offsetY:${props.offsetY}px`}
        >
          <defs>
            <filter id={filterId} height='150%' width='150%' x='-25%' y='-25%'>
              <feMorphology
                operator='dilate'
                radius='1'
                in='SourceAlpha'
                result='thicken'
              />
              <feGaussianBlur in='thicken' stdDeviation='2' result='blurred' />
              <feFlood
                flood-color={`rgba(${
                  mergedColor.value[1] || props.color[1]
                },0.7)`}
                result='glowColor'
              >
                <animate
                  attributeName='flood-color'
                  values={`
                rgba(${mergedColor.value[1] || props.color[1]},0.7);
                rgba(${mergedColor.value[1] || props.color[1]},0.3);
                rgba(${mergedColor.value[1] || props.color[1]},0.7);
              `}
                  dur='3s'
                  begin='0s'
                  repeatCount='indefinite'
                />
              </feFlood>
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
          {_width && _height ? (
            <path
              fill={backgroundColor}
              stroke-width={2}
              stroke={mergedColor.value[0]}
              d={`
        M ${15 + padding} 5 L ${_width - 15 - padding} 5 Q ${_width - 5 - padding} 5, ${_width - 5 - padding} 15
        L ${_width - 5 - padding} ${_height - 15 - padding} Q ${_width - 5 - padding} ${_height - 5 - padding}, ${_width - 15 - padding} ${_height - 5 - padding}
        L ${15 + padding}, ${_height - 5 - padding} Q ${5 + padding} ${_height - 5 - padding} ${5 + padding} ${_height - 15 - padding} L ${5 + padding} 15
        Q ${5 + padding} 5 ${15 + padding} 5
      `}
            />
          ) : null}

          <path
            stroke-width={2}
            fill='transparent'
            stroke-linecap='round'
            filter={`url(#${filterId})`}
            stroke={mergedColor.value[1]}
            d={`M ${20 + padding} 5 L ${15 + padding} 5 Q ${5 + padding} 5 ${5 + padding} 15 L ${5 + padding} ${_height - 5 - padding}`}
          />

          <path
            stroke-width={2}
            fill='transparent'
            stroke-linecap='round'
            filter={`url(#${filterId})`}
            stroke={mergedColor.value[1]}
            d={`M ${_width - 20 - padding} 5 L ${_width - 15 - padding} 5 Q ${_width - 5 - padding} 5 ${_width - 5 - padding} 15 L ${_width - 5 - padding} ${_height - 5 - padding}`}
          />

          <path
            stroke-width={2}
            fill='transparent'
            stroke-linecap='round'
            filter={`url(#${filterId})`}
            stroke={mergedColor.value[1]}
            d={`M ${_width - 20 - padding} ${_height - 5 - padding} L ${_width - 15 - padding} ${_height - 5 - padding} Q ${_width - 5 - padding} ${_height - 5 - padding} ${_width - 5 - padding} ${_height - 15 - padding} L ${_width - 5 - padding} ${_height - 20 - padding}`}
          />

          <path
            stroke-width={2}
            fill='transparent'
            stroke-linecap='round'
            filter={`url(#${filterId})`}
            stroke={mergedColor.value[1]}
            d={`M ${20 + padding} ${_height - 5 - padding} L ${15 + padding} ${_height - 5 - padding} Q ${5 + padding} ${_height - 5 - padding} ${5 + padding} ${_height - 15 - padding} L ${5 + padding} ${_height - 20 - padding}`}
          />
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
        class={[this.ns.b(), this.ns.is('style-12', true)]}
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
