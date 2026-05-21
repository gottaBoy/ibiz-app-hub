import {
  AppHooks,
  onRouteChange,
  routerCallback,
} from '@ibiz-template/vue3-util';
import { Modal, ViewMode } from '@ibiz-template/runtime';
import {
  defineComponent,
  onBeforeUnmount,
  onMounted,
  onUnmounted,
  ref,
} from 'vue';
import { useViewStack } from '../util';
import './App.scss';

export default defineComponent({
  setup() {
    const { viewStack, on, off } = useViewStack();
    const transitionName = ref('forward');
    const onViewStackChange = (type: 'push' | 'pop') => {
      transitionName.value = type === 'push' ? 'forward' : 'back';
    };

    ibiz.platform.init();

    on('onBeforeStackChange', onViewStackChange);

    onUnmounted(() => {
      off('onBeforeStackChange', onViewStackChange);
      ibiz.platform.destroyed();
      AppHooks.destoryApp.call(null);
    });

    const viewModals = new Map<string, Modal>();

    const getViewModal = (key: string) => {
      if (!viewModals.has(key)) {
        viewModals.set(
          key,
          new Modal({
            mode: ViewMode.ROUTE,
            viewUsage: 1,
            routeDepth: 1,
            dismiss: modal => {
              routerCallback.close(key, modal);
              ibiz.platform.back();
              viewModals.delete(key);
            },
          }),
        );
      }
      return viewModals.get(key);
    };

    // 水印销毁方法
    let watermarkDestroy: void | null | (() => void);
    onMounted(() => {
      AppHooks.initedApp.tapPromise(async ({ context }) => {
        watermarkDestroy?.();
        // 挂载应用水印，默认将水印挂载到body下
        watermarkDestroy = ibiz.util.watermark.mount(
          ibiz.config.watermark,
          undefined,
          { ...context, ...ibiz.appData?.context } as IContext,
        );
      });
      const parentWindow = window.parent;
      if (parentWindow && parentWindow.postMessage) {
        onRouteChange(() => {
          parentWindow.postMessage(
            {
              type: 'onRouteChange',
              url: window.location.href,
            },
            '*',
          );
        }, 1);
      }
    });

    onBeforeUnmount(() => {
      watermarkDestroy?.();
    });

    return {
      viewStack,
      getViewModal,
      transitionName,
    };
  },
  render() {
    return (
      <iBizRouterView
        manualKey={this.viewStack.currentKey}
        modal={this.getViewModal(this.viewStack.currentKey)}
      >
        {({ Component }: { Component: string }) => {
          return Component ? <Component /> : null;
        }}
      </iBizRouterView>
    );
  },
});
