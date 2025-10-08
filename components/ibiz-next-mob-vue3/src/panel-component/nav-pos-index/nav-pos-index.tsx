import {
  defineComponent,
  onActivated,
  onDeactivated,
  PropType,
  ref,
  VNode,
} from 'vue';
import { useNamespace, onRouteChange } from '@ibiz-template/vue3-util';
import { IPanelRawItem } from '@ibiz/model-core';
import { useRoute, useRouter } from 'vue-router';
import { NavPosIndexController } from './nav-pos-index.controller';
import './nav-pos-index.scss';

/**
 * 首页导航占位
 * @primary
 * @description 首页中视图导航组件，存储导航视图信息与缓存。
 * @panelitemparams {name:expcache,parameterType:string,defaultvalue:-,description:当值为NO_CACHE时禁用缓存，即每次导航切换时都是重新绘制新的视图，否则使用keepAlive包裹绘制的导航视图}
 */
export const NavPosIndex = defineComponent({
  name: 'IBizNavPosIndex',
  props: {
    /**
     * @description 首页导航占位模型数据
     */
    modelData: {
      type: Object as PropType<IPanelRawItem>,
      required: true,
    },
    /**
     * @description 首页导航占位控制器
     */
    controller: {
      type: NavPosIndexController,
      required: true,
    },
  },
  setup(props) {
    const c = props.controller;
    const ns = useNamespace('nav-pos-index');
    const router = useRouter();
    c.setRouter(router);
    const isActivated = ref(true);

    // 路由绘制的时候要做的事情
    if (c.routeDepth) {
      onRouteChange(args => {
        c.onRouteChange(args);
      }, c.routeDepth + 1);
      // 当首页且没有标签页的时候，首页菜单点击清空历史记录
      if (c.panel.view.model.viewType === 'APPINDEXVIEW') {
        const route = useRoute();
        let cacheFullPath = '';
        c.appmenu?.evt.on('onClick', () => {
          cacheFullPath = route.fullPath;
        });

        router.beforeEach((to, from, next) => {
          if (from.fullPath === cacheFullPath) {
            c.clearCache();
          }
          next();
        });
      }
    }

    onActivated(() => {
      isActivated.value = true;
    });

    onDeactivated(() => {
      isActivated.value = false;
    });

    return { ns, c, isActivated };
  },
  render() {
    const { state, viewModals } = this.c;
    const { currentKey, cacheKeys } = state;

    if (!this.isActivated) {
      return;
    }

    return (
      <div
        class={[
          this.ns.b(),
          this.ns.m(this.modelData.id),
          ...this.controller.containerClass,
        ]}
      >
        {this.c.routeDepth ? (
          <iBizRouterView manualKey={currentKey} modal={viewModals[currentKey]}>
            {({ Component }: { Component: string }): VNode | null => {
              if (this.c.noCache) {
                return Component ? <Component /> : null;
              }
              return (
                <keepAlive include={cacheKeys} max={30} isKey>
                  {Component && <Component />}
                </keepAlive>
              );
            }}
          </iBizRouterView>
        ) : (
          <div>{ibiz.i18n.t('panelComponent.navPosIndex.noSupportPrompt')}</div>
        )}
      </div>
    );
  },
});
