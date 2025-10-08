import {
  defineComponent,
  h,
  PropType,
  reactive,
  ref,
  resolveComponent,
  VNode,
} from 'vue';
import {
  OverlayContainer,
  useNamespace,
  useUIStore,
} from '@ibiz-template/vue3-util';
import { isNumber } from 'lodash-es';
import {
  EventBase,
  IModalData,
  IModalOptions,
  IOverlayContainer,
  IViewController,
  Modal,
  SysUIActionTag,
  ViewMode,
  ViewShellHooks,
} from '@ibiz-template/runtime';
import './app-modal-component.scss';
import { calcOpenModeStyle } from '@ibiz-template/core';
import { ArrowLeftBold, ArrowRightBold } from '../icon/icon';

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
    let modalView: IViewController | undefined;

    // 处理自定义样式
    const customStyle = reactive<IData>({});
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

    // 合并options
    const options = ref<IModalOptions>({ footerHide: true, modalClass: '' });
    if (props.opts) {
      Object.assign(options.value, props.opts);
    }

    const modal = new Modal({
      mode: options.value.isRouteModal ? ViewMode.ROUTE_MODAL : ViewMode.MODAL,
      viewUsage: 2,
      dismiss: (data: IData) => {
        zIndex.decrement();
        isShow.value = false;
        ctx.emit('dismiss', data);
      },
    });

    const viewShellHooks = new ViewShellHooks();

    viewShellHooks.hooks.viewCreated.tapPromise(
      async (_event: EventBase): Promise<void> => {
        modalView = _event.view;
      },
    );

    const handleViewCreated = (event: EventBase) => {
      modalView = event.view;
    };

    // Modal自身的所有关闭方式最终都走这个
    const onBeforeClose = async (done: () => void) => {
      const isClose = await modal.dismiss();
      if (isClose) {
        done();
      }
    };

    // 外部函数式调用
    const dismiss = (_data?: IModalData) => {
      modal.dismiss(_data);
    };

    const present = () => {
      isShow.value = true;
    };

    // 上一条
    const prevRecord = () => {
      modalView?.call(SysUIActionTag.PREV_RECORD);
    };
    // 下一条
    const nextRecord = () => {
      modalView?.call(SysUIActionTag.NEXT_RECORD);
    };

    return {
      ns,
      isShow,
      options,
      modalZIndex,
      customStyle,
      modal,
      viewShellHooks,
      present,
      dismiss,
      onBeforeClose,
      prevRecord,
      nextRecord,
      handleViewCreated,
    };
  },
  render() {
    return h(
      resolveComponent('el-dialog'),
      {
        modelValue: this.isShow,
        alignCenter: true,
        class: [
          this.ns.b(),
          this.options.placement && this.ns.m(this.options.placement),
          this.options.modalClass,
        ],
        style: this.customStyle,
        zIndex: this.modalZIndex,
        beforeClose: this.onBeforeClose,
        ...this.options,
      },
      [
        // eslint-disable-next-line vue/no-multiple-slot-args
        this.$slots.default?.(this.modal, this.viewShellHooks),
        this.options.openIndicator && (
          <div class={this.ns.e('record')}>
            <el-button
              class={this.ns.em('record', 'prev')}
              title={ibiz.i18n.t('util.appModal.prev')}
              onClick={this.prevRecord}
            >
              {ArrowLeftBold()}
            </el-button>
            <el-button
              class={this.ns.em('record', 'next')}
              title={ibiz.i18n.t('util.appModal.next')}
              onClick={this.nextRecord}
            >
              {ArrowRightBold()}
            </el-button>
          </div>
        ),
      ],
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
