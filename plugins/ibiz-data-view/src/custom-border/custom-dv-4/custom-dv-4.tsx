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
import { debounce, getThemeVar, observerDomResize } from '../../util';
import './custom-dv-4.scss';

export const CustomDV4 = defineComponent({
  name: 'CustomDV4',
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
    const backgroundColor = `var(${ns.cssVarName('screen-dashboard-custom-dv-bg')})`;    /**
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
          class={[
            ns.e('svg-container'),
            { [ns.e('de-reverse')]: props.reverse },
          ]}
          width={_width}
          height={_height}
          style={`--ibiz-style-4-offsetY:${props.offsetY}px`}
        >
          <polygon
            fill={backgroundColor}
            points={`
            ${width.value - 15 - padding}, ${22 + padding} 
            ${170 - padding}, ${22 + padding} 
            ${150 - padding}, ${7 + padding} 
            ${40 - padding}, ${7 + padding} 
            ${40 - padding}, ${28 + padding} 
            ${21 - padding}, ${32 + padding} 
            ${16 - padding}, ${42 + padding} 
            ${16 - padding}, ${height.value - 32 - props.offsetY + padding} 
            ${41 - padding}, ${height.value - 7 - props.offsetY + padding} 
            ${width.value - 15 - padding}, ${height.value - 7 - props.offsetY + padding}
          `}
          />

          <polyline
            class='dv-bb4-line-1'
            stroke={mergedColor.value[0]}
            points={`
            ${145 - padding}, ${height.value - 5 - props.offsetY + padding} 
            ${40 - padding}, ${height.value - 5 - props.offsetY + padding} 
            ${10 - padding}, ${height.value - 35 - props.offsetY + padding} 
            ${10 - padding}, ${40 + padding} 
            ${40 - padding}, ${5 + padding} 
            ${150 - padding}, ${5 + padding} 
            ${170 - padding}, ${20 + padding} 
            ${width.value - 15 - padding}, ${20 + padding}
          `}
          />
          <polyline
            stroke={mergedColor.value[1]}
            class='dv-bb4-line-2'
            points={`
            ${245 - padding}, ${height.value - 1 - props.offsetY + padding} 
            ${36 - padding}, ${height.value - 1 - props.offsetY + padding} 
            ${14 - padding}, ${height.value - 23 - props.offsetY + padding} 
            ${14 - padding}, ${height.value - 100 - props.offsetY + padding}
          `}
          />

          <polyline
            class='dv-bb4-line-3'
            stroke={mergedColor.value[0]}
            points={`
            ${7 - padding}, ${height.value - 40 - props.offsetY + padding} 
            ${7 - padding}, ${height.value - 75 - props.offsetY + padding}
          `}
          />
          <polyline
            class='dv-bb4-line-4'
            stroke={mergedColor.value[0]}
            points={`
            ${28 - padding}, ${24 + padding} 
            ${13 - padding}, ${41 + padding} 
            ${13 - padding}, ${64 + padding}
          `}
          />
          <polyline
            class='dv-bb4-line-5'
            stroke={mergedColor.value[0]}
            points={`
            ${5 - padding}, ${45 + padding} 
            ${5 - padding}, ${140 + padding}
          `}
          />
          <polyline
            class='dv-bb4-line-6'
            stroke={mergedColor.value[1]}
            points={`
            ${14 - padding}, ${75 + padding} 
            ${14 - padding}, ${100 + padding}
          `}
          />
          <polyline
            class='dv-bb4-line-7'
            stroke={mergedColor.value[1]}
            points={`
            ${55 - padding}, ${11 + padding} 
            ${147 - padding}, ${11 + padding} 
            ${167 - padding}, ${26 + padding} 
            ${250 - padding}, ${26 + padding}
          `}
          />
          <polyline
            class='dv-bb4-line-8'
            stroke={mergedColor.value[1]}
            points={`
            ${158 - padding}, ${5 + padding} 
            ${173 - padding}, ${16 + padding}
          `}
          />
          <polyline
            class='dv-bb4-line-9'
            stroke={mergedColor.value[0]}
            points={`
            ${200 - padding}, ${17 + padding} 
            ${width.value - 10 - padding}, ${17 + padding}
          `}
          />
          <polyline
            class='dv-bb4-line-10'
            stroke={mergedColor.value[1]}
            points={`
            ${385 - padding}, ${17 + padding} 
            ${width.value - 10 - padding}, ${17 + padding}
          `}
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
        class={[this.ns.b(), this.ns.is('style-4', true)]}
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
