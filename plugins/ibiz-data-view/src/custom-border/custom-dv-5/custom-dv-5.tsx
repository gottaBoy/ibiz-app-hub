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
import './custom-dv-5.scss';
import { dataViewT } from '../../locale';

export const CustomDV5 = defineComponent({
  name: 'CustomDV5',
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
        console.warn(dataViewT('warnings.invalidColorArray'));
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
          style={`--ibiz-style-5-offsetY:${props.offsetY}px`}
        >
          <polygon
            fill={backgroundColor}
            points={`
            ${10 + padding}, ${22 + padding} 
            ${width.value - 22 - padding}, ${22 + padding} 
            ${width.value - 22 - padding}, ${height.value - 86 - props.offsetY + padding} 
            ${width.value - 84 - padding}, ${height.value - 24 - props.offsetY + padding} 
            ${10 + padding}, ${height.value - 24 - props.offsetY + padding}
          `}
          />
          <polyline
            class='dv-bb5-line-1'
            stroke={mergedColor.value[0]}
            points={`
            ${8 + padding}, ${5 + padding} 
            ${width.value - 5 - padding}, ${5 + padding} 
            ${width.value - 5 - padding}, ${height.value - 100 - padding} 
            ${width.value - 100 - padding}, ${height.value - 5 - props.offsetY - padding} 
            ${8 + padding}, ${height.value - 5 - props.offsetY - padding} 
            ${8 + padding}, ${5 + padding}
          `}
          />
          <polyline
            class='dv-bb5-line-2'
            stroke={mergedColor.value[1]}
            points={`
            ${3 + padding}, ${5 + padding} 
            ${width.value - 20 - padding}, ${5 + padding} 
            ${width.value - 20 - padding}, ${height.value - 60 - props.offsetY - padding} 
            ${width.value - 74 - padding}, ${height.value - 5 - props.offsetY - padding} 
            ${3 + padding}, ${height.value - 5 - props.offsetY - padding} 
            ${3 + padding}, ${5 + padding}
          `}
          />
          <polyline
            class='dv-bb5-line-3'
            stroke={mergedColor.value[1]}
            points={`
            ${50 + padding}, ${13 + padding} 
            ${width.value - 35 - padding}, ${13 + padding}
          `}
          />
          <polyline
            class='dv-bb5-line-4'
            stroke={mergedColor.value[1]}
            points={`
            ${15 + padding}, ${20 + padding} 
            ${width.value - 35 - padding}, ${20 + padding}
          `}
          />
          <polyline
            class='dv-bb5-line-5'
            stroke={mergedColor.value[1]}
            points={`
            ${15 + padding}, ${height.value - 20 - props.offsetY - padding} 
            ${width.value - 110 - padding}, ${height.value - 20 - props.offsetY - padding}
          `}
          />
          <polyline
            class='dv-bb5-line-6'
            stroke={mergedColor.value[1]}
            points={`
            ${15 + padding}, ${height.value - 13 - props.offsetY - padding} 
            ${width.value - 110 - padding}, ${height.value - 13 - props.offsetY - padding}
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
        class={[this.ns.b(), this.ns.is('style-5', true)]}
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
