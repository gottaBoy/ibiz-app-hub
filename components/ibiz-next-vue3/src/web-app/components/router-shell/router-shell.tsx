import {
  defineComponent,
  onUnmounted,
  ref,
  watch,
  toRaw,
  h,
  resolveComponent,
  PropType,
} from 'vue';
import {
  IRouteViewData,
  ModelContextError,
  parseRouteViewData,
} from '@ibiz-template/vue3-util';
import { useRoute, useRouter } from 'vue-router';
import { IModal, Modal, RouteConst, ViewMode } from '@ibiz-template/runtime';
import { IBizContext } from '@ibiz-template/core';
import { mergeDeepLeft } from 'ramda';

export const RouterShell = defineComponent({
  name: 'RouterShell',
  props: {
    modal: {
      type: Object as PropType<IModal>,
      required: true,
    },
  },
  setup(props) {
    const route = useRoute();
    const router = useRouter();
    const viewData = ref<IRouteViewData>({});
    const isLoaded = ref(false);
    let loadGeneration = 0;
    let disposed = false;
    const destroyContext = (): void => {
      const { context } = toRaw(viewData.value);
      viewData.value = {};
      if (context) context.destroy();
    };
    const routeDepth = props.modal?.routeDepth;

    // 销毁视图上下文
    onUnmounted(() => {
      disposed = true;
      loadGeneration += 1;
      isLoaded.value = false;
      destroyContext();
    });

    // 根据应用模型解析视图参数
    const calcViewData = async (): Promise<void> => {
      // 获取视图
      if (!routeDepth || disposed) return;
      const generation = ++loadGeneration;
      isLoaded.value = false;
      destroyContext();
      try {
        const _viewData = await parseRouteViewData(route, routeDepth);
        if (disposed || generation !== loadGeneration) return;
        // 封装IBizContext
        const _context = IBizContext.create(_viewData.context);
        viewData.value = {
          ..._viewData,
          context: _context,
        };
        // 确定视图组件
        isLoaded.value = true;
      } catch (error) {
        if (disposed || generation !== loadGeneration) return;
        if (error instanceof ModelContextError) {
          ibiz.util.error.handle(error);
          return;
        }
        router.push({
          name: `errorView${routeDepth}`,
          params: { code: '404' },
        });
      }
    };
    calcViewData();
    watch(
      () => [
        route.params.appContext,
        route.params[`view${routeDepth}`],
        route.fullPath,
      ],
      (current, previous) => {
        // Loaded parent shells keep their context during child navigation.
        if (
          current[0] !== previous[0] ||
          current[1] !== previous[1] ||
          !isLoaded.value
        ) {
          calcViewData();
        }
      },
    );

    const routeModal = new Modal({
      mode: ViewMode.ROUTE,
      routeDepth: (routeDepth || 0) + 1,
    });

    return {
      routeModal,
      route,
      viewData,
      isLoaded,
    };
  },
  render() {
    if (!this.isLoaded) {
      return <div class='ibiz-router-shell' />;
    }
    const { context, params, srfnav, viewConfig } = this.viewData;
    const props = mergeDeepLeft(
      {
        ...this.$props,
        ...this.$attrs,
        context,
        params,
        viewId: viewConfig!.id,
        key: viewConfig!.codeName,
      },
      { state: { srfnav } },
    );

    return (
      <div class='ibiz-router-shell'>
        {h(resolveComponent('IBizViewShell') as string, props, this.$slots)}
        <router-view
          key={viewConfig!.codeName}
          name={RouteConst.ROUTE_MODAL_TAG}
          modal={this.routeModal}
        />
      </div>
    );
  },
});
