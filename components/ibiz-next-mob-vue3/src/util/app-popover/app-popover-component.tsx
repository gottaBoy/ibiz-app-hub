/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  arrow,
  computePosition,
  autoUpdate,
  flip,
  offset,
  shift,
  ComputePositionConfig,
} from '@floating-ui/dom';
import {
  IModalData,
  IPopoverOptions,
  Modal,
  ViewMode,
} from '@ibiz-template/runtime';
import {
  OverlayPopoverContainer,
  useNamespace,
  useUIStore,
} from '@ibiz-template/vue3-util';
import {
  defineComponent,
  onMounted,
  onUnmounted,
  PropType,
  reactive,
  ref,
  VNode,
} from 'vue';
import './app-popover-component.scss';
import { isNumber } from 'lodash-es';
import { calcOpenModeStyle } from '@ibiz-template/core';

// 飘窗组件配置
export type FloatingUIConfig = Partial<ComputePositionConfig>;

/**
 * 计算飘窗显示
 *
 * @author ljx
 * @date 2024-11-01 17:11:18
 * @param {HTMLElement} element
 * @param {HTMLElement} el
 * @param {HTMLElement} arrEl
 * @param {IPopoverOptions<FloatingUIConfig>} opts
 * @return {*}  {Promise<void>}
 */
async function computePos(
  element: HTMLElement,
  el: HTMLElement,
  arrEl: HTMLElement,
  opts: IPopoverOptions<FloatingUIConfig>,
): Promise<void> {
  const middlewareArr = [offset(opts.offsetOpts || 6), flip(), shift()];
  if (!opts.noArrow) {
    middlewareArr.push(arrow({ element: arrEl! }));
  }

  const config: FloatingUIConfig = {
    placement: opts.placement,
    strategy: 'absolute',
    middleware: middlewareArr,
  };

  if (opts.options) {
    Object.assign(config, opts.options);
  }

  const options = await computePosition(element, el, config);
  {
    const { x, y, placement, middlewareData } = options;
    const { style } = el;
    style.left = `${x}px`;
    style.top = `${y}px`;

    if (!opts.noArrow) {
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

      Object.assign(arrEl.style, {
        left: arrowX != null ? `${arrowX}px` : '',
        top: arrowY != null ? `${arrowY}px` : '',
        right: '',
        bottom: '',
        [staticSide]: '-4px',
      });
    }
  }
}

const AppPopoverComponent = defineComponent({
  props: {
    opts: {
      type: Object as PropType<IPopoverOptions<FloatingUIConfig>>,
      default: () => ({}),
    },
  },
  setup(props, ctx) {
    // 样式命名空间
    const ns = useNamespace('popover');
    // 是否显示
    const isShow = ref(false);
    // 跟 dom 元素
    const el = ref<HTMLDivElement>();
    // arrow dom 元素
    const arrEl = ref<HTMLDivElement>();

    const { zIndex } = useUIStore();
    const popoverZIndex = zIndex.increment();

    // 处理自定义样式
    const customStyle = reactive<IData>({});
    const { width, height } = props.opts;
    if (width) {
      customStyle.width = isNumber(width)
        ? calcOpenModeStyle(width, 'modal')
        : width;
    } else {
      // 默认半屏
      customStyle.width = '60%';
    }
    if (height) {
      customStyle.height = isNumber(height)
        ? calcOpenModeStyle(height, 'modal')
        : height;
    } else {
      // 默认半屏
      customStyle.height = '30%';
    }
    customStyle.zIndex = popoverZIndex;

    const modal = new Modal({
      mode: ViewMode.POPOVER,
      viewUsage: 2,
      dismiss: (data: IModalData) => {
        zIndex.decrement();
        ctx.emit('dismiss', data);
      },
    });

    // 点击容器关闭飘窗
    async function dismiss(data?: IModalData) {
      await modal.dismiss(data);
    }

    // 清除自动更新方法
    let cleanUpAutoUpdate = () => {};

    // 关闭飘窗
    const closeCurrentPopover = () => {
      modal?.dismiss();
    };

    onMounted(() => {
      window.addEventListener('popstate', closeCurrentPopover);
    });

    onUnmounted(() => {
      cleanUpAutoUpdate();
      window.removeEventListener('popstate', closeCurrentPopover);
    });

    /**
     * 飘窗显示并计算位置
     *
     * @author ljx
     * @date 2024-11-01 17:11:18
     * @param {HTMLElement} target
     * @return {*}  {Promise<void>}
     */
    async function present(target: HTMLElement): Promise<void> {
      isShow.value = true;
      const updatePosition = () => {
        return computePos(target, el.value!, arrEl.value!, props.opts);
      };
      cleanUpAutoUpdate = autoUpdate(target, el.value!, updatePosition);
    }

    const onMaskClick = () => {
      if (props.opts.autoClose === true) {
        dismiss();
      }
    };

    return {
      ns,
      el,
      arrEl,
      isShow,
      modal,
      popoverZIndex,
      onMaskClick,
      present,
      dismiss,
      customStyle,
    };
  },
  render() {
    const content = (
      <div
        class={[
          this.ns.b(),
          this.ns.is('show', this.isShow),
          this.opts.modalClass || '',
        ]}
        ref='el'
        style={this.customStyle}
        onClick={(e: Event) => {
          e.stopPropagation();
        }}
      >
        {!this.opts.noArrow && (
          <div class={[this.ns.e('arrow')]} ref='arrEl'></div>
        )}
        {this.$slots.default?.(this.modal)}
      </div>
    );

    if (this.opts.autoClose === true) {
      return (
        <div
          class={[this.ns.e('overlay')]}
          style={{ zIndex: this.popoverZIndex }}
          onClick={() => {
            this.onMaskClick();
          }}
        >
          {content}
        </div>
      );
    }
    return content;
  },
});

/**
 * 创建飘窗
 *
 * @author ljx
 * @date 2024-11-01 17:11:18
 * @export
 * @param {() => VNode} render
 * @param {IPopoverOptions<FloatingUIConfig>} [opts]
 * @return {*}  {OverlayPopoverContainer}
 */
export function createPopover(
  render: () => VNode,
  opts?: IPopoverOptions<FloatingUIConfig>,
): OverlayPopoverContainer {
  return new OverlayPopoverContainer(AppPopoverComponent, render as any, opts);
}
