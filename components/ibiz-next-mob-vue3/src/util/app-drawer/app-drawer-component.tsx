import { defineComponent, PropType, reactive, ref, VNode } from 'vue';
import {
  OverlayContainer,
  useNamespace,
  useUIStore,
} from '@ibiz-template/vue3-util';
import {
  IDrawerOptions,
  IModalData,
  IOverlayContainer,
  Modal,
  ViewMode,
} from '@ibiz-template/runtime';
import { calcOpenModeStyle } from '@ibiz-template/core';
import { isNumber } from 'lodash-es';

export const AppDrawerComponent = defineComponent({
  props: {
    opts: {
      type: Object as PropType<IDrawerOptions>,
      default: () => ({}),
    },
  },
  setup(props, ctx) {
    const ns = useNamespace('drawer');

    const isShow = ref(false);

    const { zIndex } = useUIStore();
    const drawerZIndex = zIndex.increment();

    const modal = new Modal({
      mode: ViewMode.DRAWER,
      viewUsage: 2,
      dismiss: (data: IModalData) => {
        zIndex.decrement();
        ctx.emit('dismiss', data);
      },
    });

    // 自身的所有关闭方式最终都走这个
    const onBeforeClose = async (done: () => void) => {
      const isClose = await modal.dismiss();
      if (isClose) {
        done();
      }
    };

    // 外部函数式调用
    const dismiss = (data?: IModalData) => {
      modal.dismiss(data);
    };

    const present = () => {
      isShow.value = true;
    };

    let direction = '';

    if (props.opts.placement) {
      switch (props.opts.placement) {
        case 'left':
          direction = 'left';
          break;
        case 'top':
          direction = 'top';
          break;
        case 'bottom':
          direction = 'bottom';
          break;
        default:
          direction = 'right';
      }
    }

    // 处理自定义样式
    const customStyle = reactive<IData>({ height: '80%' });
    // 左右抽屉高度默认100%
    if (['left', 'right'].includes(direction)) {
      customStyle.height = '100%';
    }
    const { width, height } = props.opts;
    if (width) {
      if (isNumber(width)) {
        customStyle.width = calcOpenModeStyle(width, 'modal');
      } else {
        customStyle.width = width;
      }
    }
    if (height) {
      if (isNumber(height)) {
        customStyle.height = calcOpenModeStyle(height, 'modal');
      } else {
        customStyle.height = height;
      }
    }

    return {
      ns,
      isShow,
      direction,
      drawerZIndex,
      modal,
      dismiss,
      present,
      onBeforeClose,
      customStyle,
    };
  },
  render() {
    return (
      <van-popup
        v-model:show={this.isShow}
        lock-scroll={false}
        round
        close-on-popstate={true}
        close-icon-position='top-left'
        class={this.ns.b()}
        style={this.customStyle}
        position={this.direction}
        z-index={this.drawerZIndex}
        before-close={this.onBeforeClose}
        {...this.opts.attrs}
      >
        {this.$slots.default?.(this.modal)}
      </van-popup>
    );
  },
});

/**
 * 创建抽屉
 *
 * @author chitanda
 * @date 2022-12-29 15:12:57
 * @export
 * @param {() => VNode} render
 * @param {(IDrawerOptions | undefined)} [opts]
 * @return {*}  {IOverlayContainer}
 */
export function createDrawer(
  render: () => VNode,
  opts?: IDrawerOptions | undefined,
): IOverlayContainer {
  return new OverlayContainer(AppDrawerComponent, render, opts);
}
