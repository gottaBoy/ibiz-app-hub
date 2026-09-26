import {
  flip,
  arrow,
  shift,
  offset,
  autoUpdate,
  computePosition,
  ComputePositionConfig,
} from '@floating-ui/dom';
import {
  ref,
  watch,
  PropType,
  computed,
  onMounted,
  CSSProperties,
  defineComponent,
  onBeforeUnmount,
} from 'vue';
import {
  useNamespace,
  TooltipTrigger,
  TooltipPlacement,
} from '@ibiz-template/vue3-util';
import { NOOP, listenJSEvent } from '@ibiz-template/core';
import './tooltip.scss';

export const IBizTooltip = defineComponent({
  name: 'IBizTooltip',
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    showArrow: {
      type: Boolean,
      default: true,
    },
    offset: {
      type: Number,
      default: 8,
    },
    popperClass: {
      type: String,
      required: false,
    },
    placement: {
      type: String as PropType<TooltipPlacement>,
      default: TooltipPlacement.TOP,
    },
    trigger: {
      type: String as PropType<TooltipTrigger>,
      default: TooltipTrigger.HOVER,
    },
    virtualRef: {
      type: Object as PropType<HTMLElement>,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('tooltip');
    const isShow = ref(false);
    const el = ref<HTMLDivElement>();
    const arrEl = ref<HTMLDivElement>();
    const hasRendered = ref(false);
    let cleanUpAutoUpdate = NOOP;

    let cleanMouseenter = NOOP;

    let cleanMouseleave = NOOP;

    // 关闭定时器
    let closeTimer: NodeJS.Timeout | undefined;

    const popperStyle = computed<CSSProperties>(() => {
      return {
        visibility: isShow.value ? 'visible' : 'hidden',
      };
    });

    /**
     * @description 计算元素位置
     * @returns {*}  {Promise<void>}
     */
    const computePos = async (): Promise<void> => {
      const middlewareArr = [
        offset(props.offset),
        flip(),
        shift({ padding: 12 }),
      ];
      if (props.showArrow) middlewareArr.push(arrow({ element: arrEl.value! }));

      const config: ComputePositionConfig = {
        placement: props.placement,
        strategy: 'absolute',
        middleware: middlewareArr,
      };

      const options = await computePosition(
        props.virtualRef,
        el.value!,
        config,
      );
      {
        const { x, y, placement, middlewareData } = options;
        const { style } = el.value!;
        style.left = `${x}px`;
        style.top = `${y}px`;

        if (props.showArrow) {
          // 箭头位置
          const { x: arrowX, y: arrowY } = middlewareData.arrow!;

          const staticSide: string = (
            {
              top: 'bottom',
              right: 'left',
              bottom: 'top',
              left: 'right',
            } as IData
          )[placement.split('-')[0]];

          Object.assign(arrEl.value!.style, {
            left: arrowX != null ? `${arrowX}px` : '',
            top: arrowY != null ? `${arrowY}px` : '',
            right: '',
            bottom: '',
            [staticSide]: '-4px',
          });
          arrEl.value!.setAttribute('data-placement', placement);
        }
      }
    };

    /**
     * @description 清理定时器
     */
    const clearCloseTimer = (): void => {
      if (closeTimer) {
        clearTimeout(closeTimer);
        closeTimer = undefined;
      }
    };

    /**
     * @description 显示tooltip
     */
    const onShowTooltip = (): void => {
      clearCloseTimer();
      isShow.value = true;
      hasRendered.value = true;
    };

    /**
     * @description 隐藏tooltip
     */
    const onHiddenTooltip = (): void => {
      // 延迟关闭
      clearCloseTimer();
      closeTimer = setTimeout(() => {
        isShow.value = false;
      }, 300);
    };

    watch(
      () => props.virtualRef,
      elment => {
        if (!elment) return;
        cleanMouseenter = listenJSEvent(elment, 'mouseenter', onShowTooltip);
        cleanMouseleave = listenJSEvent(elment, 'mouseleave', onHiddenTooltip);
      },
      {
        immediate: true,
      },
    );

    onMounted(() => {
      cleanUpAutoUpdate = autoUpdate(
        props.virtualRef,
        el.value!,
        () => computePos(),
        {
          animationFrame: true,
        },
      );
    });

    onBeforeUnmount(() => {
      cleanUpAutoUpdate();
      cleanMouseenter();
      cleanMouseleave();
    });

    return {
      ns,
      el,
      arrEl,
      isShow,
      popperStyle,
      hasRendered,
      onShowTooltip,
      onHiddenTooltip,
    };
  },
  render() {
    return (
      <div
        ref='el'
        style={this.popperStyle}
        class={[this.ns.b(), this.popperClass || '']}
        onMouseenter={evt => {
          evt.stopPropagation();
          this.onShowTooltip();
        }}
        onMouseleave={evt => {
          evt.stopPropagation();
          this.onHiddenTooltip();
        }}
        onClick={(e: Event) => {
          e.stopPropagation();
        }}
      >
        {this.showArrow && <div class={this.ns.e('arrow')} ref='arrEl'></div>}
        {this.hasRendered && (
          <div class={this.ns.e('content')}>{this.$slots.default?.()}</div>
        )}
      </div>
    );
  },
});
