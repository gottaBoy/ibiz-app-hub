import { defineComponent, PropType, reactive, ref, VNode } from 'vue';
import {
  OverlayContainer,
  useNamespace,
  useUIStore,
} from '@ibiz-template/vue3-util';
import { isNumber } from 'lodash-es';
import {
  IModalData,
  IModalOptions,
  IOverlayContainer,
  Modal,
  ViewMode,
} from '@ibiz-template/runtime';
import { calcOpenModeStyle } from '@ibiz-template/core';
import './app-modal-component.scss';

export const AppModalComponent = defineComponent({
  props: {
    opts: {
      type: Object as PropType<IModalOptions>,
      default: () => ({}),
    },
  },
  setup(props, ctx) {
    const ns = useNamespace('modal');

    const isShow = ref(false);

    const { zIndex } = useUIStore();
    const modalZIndex = zIndex.increment();

    // 处理自定义样式,添加z-index变量
    const customStyle = reactive<IData>({
      [ns.cssVarBlockName('z-index')]: modalZIndex,
    });
    const { width, height } = props.opts;
    if (width) {
      customStyle.width = isNumber(width)
        ? calcOpenModeStyle(width, 'modal')
        : width;
    } else {
      // 默认全屏
      customStyle.width = '100vw';
    }
    if (height) {
      customStyle.height = isNumber(height)
        ? calcOpenModeStyle(height, 'modal')
        : height;
    } else {
      // 默认全屏
      customStyle.height = '100vh';
    }

    // 合并options
    const options = ref<IParams>({
      footerHide: true,
      modalClass: '',
      // 不显示关闭按钮
      showClose: false,
      // 是否显示遮罩，默认显示
      overlay: true,
    });
    if (props.opts) {
      Object.assign(options.value, props.opts);
    }

    const modal = new Modal({
      mode: ViewMode.MODAL,
      viewUsage: 2,
      dismiss: (data: IData) => {
        zIndex.decrement();
        ctx.emit('dismiss', data);
      },
    });

    // Modal自身的所有关闭方式最终都走这个
    const onBeforeClose = async () => {
      await modal.dismiss();
    };

    // 外部函数式调用
    const dismiss = (data?: IModalData) => {
      modal.dismiss(data);
    };

    const present = () => {
      isShow.value = true;
    };

    // 弹框关闭
    const onDialogClose = () => {
      isShow.value = false;
      onBeforeClose();
    };

    return {
      ns,
      isShow,
      options,
      modalZIndex,
      customStyle,
      modal,
      present,
      dismiss,
      onBeforeClose,
      onDialogClose,
    };
  },
  render() {
    const slots: IData = {
      default: () => this.$slots.default?.(this.modal),
    };
    if (this.options.showClose) {
      slots.title = () => {
        return (
          <van-button
            class={this.ns.e('close')}
            plain
            style={{ zIndex: this.modalZIndex }}
            onClick={this.onDialogClose}
          >
            <van-icon name='cross' />
          </van-button>
        );
      };
    }
    return (
      <van-dialog
        show={this.isShow}
        lockScroll={false}
        close-on-popstate={true}
        showConfirmButton={false}
        class={[
          this.ns.b(),
          this.options.placement && this.ns.m(this.options.placement),
          this.options.modalClass,
        ]}
        style={this.customStyle}
        overlay={this.options.overlay}
        close-on-click-overlay={true}
        before-close={this.onBeforeClose}
        {...this.options}
      >
        {slots}
      </van-dialog>
    );
  },
});

/**
 * 创建模态框
 *
 * @author chitanda
 * @date 2022-12-29 15:12:50
 * @export
 * @param {() => VNode} render
 * @param {(IModalOptions | undefined)} [opts]
 * @return {*}  {IOverlayContainer}
 */
export function createModal(
  render: () => VNode,
  opts?: IModalOptions | undefined,
): IOverlayContainer {
  return new OverlayContainer(AppModalComponent, render, opts);
}
