import { PropType, defineComponent, onUnmounted, ref, toRaw } from 'vue';
import {
  IRouteViewData,
  createOverlayView,
  parseRouteViewData,
  route2routePath,
  routerCallback,
} from '@ibiz-template/vue3-util';
import {
  RouteLocationNormalized,
  onBeforeRouteUpdate,
  useRoute,
  useRouter,
} from 'vue-router';
import { IBizContext } from '@ibiz-template/core';
import {
  IModal,
  IModalData,
  IOverlayContainer,
  IViewConfig,
  RouteConst,
} from '@ibiz-template/runtime';
import { isEmpty } from 'ramda';
import qs from 'qs';
import { View404 } from '../../../view';

export const ModalRouterShell = defineComponent({
  name: 'ModalRouterShell',
  props: {
    modal: {
      type: Object as PropType<IModal>,
      required: true,
    },
  },
  setup(props) {
    const routeObj = useRoute();
    const router = useRouter();
    const isDestroyed = ref(false);
    const viewData = ref<IRouteViewData>({});
    const pathHistory: string[] = [];
    const destroyContext = (): void => {
      if (viewData.value.context) {
        const { context } = toRaw(viewData.value);
        if (context) context.destroy();
      }
    };
    const routeDepth = props.modal.routeDepth!;

    let overlay: IOverlayContainer | null = null;

    // 销毁视图上下文
    onUnmounted(() => {
      isDestroyed.value = true;
      if (overlay) {
        overlay.dismiss();
        overlay = null;
      }
      destroyContext();
    });

    const openView = async (route: RouteLocationNormalized): Promise<void> => {
      viewData.value = await parseRouteViewData(route, routeDepth, true);
      if (isDestroyed.value) {
        return;
      }
      if (!(viewData.value.context instanceof IBizContext)) {
        viewData.value.context = IBizContext.create(viewData.value.context);
      }

      // 当前模态打开的视图名称
      const appViewId = route.params.modalView as string;
      // 路由参数
      const paramsStr = route.params.modalParams as string;
      if (paramsStr && paramsStr !== '-') {
        const params = qs.parse(paramsStr, {
          strictNullHandling: true,
          delimiter: ';',
        }) as IParams;
        // 解析路由参数中的上下文
        if (params.srfnavctx) {
          const srfnavctx = JSON.parse(
            decodeURIComponent(params.srfnavctx as string),
          );
          Object.assign(viewData.value.context, srfnavctx!);
          delete params.srfnavctx;
        }
        if (params.srfnav) {
          viewData.value.srfnav = params.srfnav as string;
          delete params.srfnav;
        }
        if (!isEmpty(params)) {
          if (viewData.value.params) {
            Object.assign(viewData.value.params, params!);
          } else {
            viewData.value.params = params;
          }
        }
      }
      // 解析后不存在上下文时，创建一个空的上下文
      if (!viewData.value.context) {
        const _context = IBizContext.create({});
        viewData.value.context = _context;
      }

      let appView: IViewConfig | undefined = viewData.value.viewConfig;
      let component: unknown;
      try {
        // 打开模态视图

        if (!appView) {
          appView = await ibiz.hub.config.view.get(appViewId!);
        }

        component = createOverlayView({
          context: viewData.value.context,
          params: viewData.value.params,
          viewId: appView.id,
        });
      } catch (error) {
        component = View404;
      }
      // 设置默认的modal参数
      const opts = {
        width: appView?.width || '100%',
        height: appView?.height || '100%',
        footerHide: true,
        isRouteModal: true,
        // 不显示关闭按钮
        showClose: false,
      };
      overlay = ibiz.overlay.createModal(component, undefined, opts);
      overlay.present();
      pathHistory.push(route.fullPath);
      const result = await overlay.onWillDismiss<IModalData>();
      overlay = null;
      if (isDestroyed.value === false) {
        if (window.history.state?.back) {
          router.back();
        } else {
          const path = route.path;
          const index = path.indexOf(`/${RouteConst.ROUTE_MODAL_TAG}/`);
          router.replace(path.substring(0, index));
        }
        routerCallback.close(
          router.currentRoute.value.fullPath,
          result || { ok: false },
        );
      }
    };

    onBeforeRouteUpdate(
      (to: RouteLocationNormalized, from: RouteLocationNormalized) => {
        // 当前组件激活、当前视图已经打开、路由历史中原有路径存在（说明跳转过），目标路径不存在（没有跳转）
        if (
          !isDestroyed.value &&
          pathHistory.length > 0 &&
          pathHistory.indexOf(from.fullPath) !== -1 &&
          pathHistory.indexOf(to.fullPath) === -1
        ) {
          // 模态视图才执行该逻辑
          const pathNodes = route2routePath(to).pathNodes;
          const lastNode = pathNodes[pathNodes.length - 1];
          if (lastNode && lastNode.viewName === RouteConst.ROUTE_MODAL_TAG) {
            openView(to);
          }
        }
      },
    );

    openView(routeObj);
    return {};
  },
  render() {
    return <div style='position: absolute;width: 0;height: 0;'></div>;
  },
});
