import {
  defineComponent,
  h,
  PropType,
  ref,
  resolveComponent,
  VNode,
  watch,
} from 'vue';
import { IPanelRawItem } from '@ibiz/model-core';
import { EventBase } from '@ibiz-template/runtime';
import { RouterView, useRoute, useRouter } from 'vue-router';
import { NavPosController } from './nav-pos.controller';
import './nav-pos.scss';
import { useNamespace } from '../../use';
import { getNestedRoutePath } from '../../util';

/**
 * 导航占位
 * @primary
 * @description 面板中的导航视图占位组件，用于绘制导航视图，并存储导航视图信息与缓存。
 * @panelitemparams {name:expcache,parameterType:'CACHE' | 'NO_CACHE',defaultvalue:-,description:当值为NO_CACHE时禁用缓存，即每次导航切换时都是重新绘制新的视图，否则使用keepAlive包裹绘制的导航视图}
 * @panelitemparams {name:ignoreembedkey,parameterType:boolean,defaultvalue:-,description:忽略嵌入视图key参数}
 * @panelitemparams {name:expmode,parameterType:'ROUTE' | 'NO_ROUTE',defaultvalue:-,description:导航模式，ROUTE为路由模式，NO_ROUTE为非路由模式，在路由模式下会通过路由打开视图，在非路由的模式下，则会通过视图模型去绘制视图}
 * @panelitemparams {"name":"routeattributekeys","parameterType":"string","defaultvalue":"-","description":"路由透传参数，参数值为上下文对象的key，多个值用竖线`|`分隔，透传的参数将会在路由组件进行解析，并显示声明在路由上进行传递"}
 * @panelitemparams {"name":"REFCTRL","parameterType":"string","defaultvalue":"-","description":"关联部件标识，可指定关联部件，多个关联部件标识以`;`分隔"}
 */
export const NavPos = defineComponent({
  name: 'IBizNavPos',
  props: {
    /**
     * @description 导航占位模型
     */
    modelData: {
      type: Object as PropType<IPanelRawItem>,
      required: true,
    },
    /**
     * @description 导航占位控制器
     */
    controller: {
      type: NavPosController,
      required: true,
    },
  },
  setup(props) {
    const c = props.controller;
    const ns = useNamespace('nav-pos');
    const onViewCreated = (event: EventBase): void => {
      c.onViewCreated(event);
    };

    const router = useRouter();
    const route = useRoute();

    const isPresetView = ref(false);

    c.setRouter(router);

    if (c.routeDepth) {
      // 计算当前导航视图对应层级路由的路径，删除了srfnav
      const expViewRoutePath = getNestedRoutePath(route, c.routeDepth!);
      watch(
        () => route.fullPath,
        () => {
          const currentRoutePath = getNestedRoutePath(route, c.routeDepth!);
          // 前面路由不是当前导航视图的不走
          // 路由跳转匹配层级不比导航视图层级高的不走。如分页关系的表单对应的事导航视图的路由。
          if (
            expViewRoutePath === currentRoutePath &&
            route.matched.length > c.routeDepth!
          ) {
            if (route.matched.length === c.routeDepth! + 1) {
              isPresetView.value = !!route.name;
              if (isPresetView.value) {
                return;
              }
            }

            c.onRouteChange(route);
          }
        },
        { immediate: true },
      );
    }

    return { ns, c, isPresetView, onViewCreated };
  },
  render() {
    const { viewModals, state } = this.c;
    const { currentKey, cacheKeys, navViewMsgs, cache } = state;
    let content: VNode | null = null;
    if (state.routeOpen) {
      if (this.isPresetView) {
        return <RouterView />;
      }

      content = (
        <iBizRouterView
          manualKey={currentKey}
          modal={viewModals[currentKey]}
          onCreated={this.onViewCreated}
        >
          {({ Component }: { Component: string }): VNode | null => {
            const routerContent =
              currentKey === '' || !Component
                ? null
                : ((<Component />) as VNode);

            return cache ? (
              <keepAlive include={cacheKeys} max={30} isKey>
                {routerContent}
              </keepAlive>
            ) : (
              routerContent
            );
          }}
        </iBizRouterView>
      );
    } else {
      const view =
        currentKey && navViewMsgs[currentKey]
          ? h(resolveComponent('IBizViewShell'), {
              context: navViewMsgs[currentKey].context,
              params: navViewMsgs[currentKey].params,
              key: !this.c.ignoreEmbedKey ? currentKey : undefined,
              viewId: navViewMsgs[currentKey].viewId,
              onCreated: this.onViewCreated,
            })
          : null;
      content = cache ? (
        <keepAlive include={cacheKeys} max={30} isKey>
          {view}
        </keepAlive>
      ) : (
        view
      );
    }

    return (
      <div
        class={[
          this.ns.b(),
          this.ns.m(this.modelData.id),
          ...this.controller.containerClass,
        ]}
        // v-loading={this.c.state.isLoading}
      >
        {content}
      </div>
    );
  },
});
