/* eslint-disable @typescript-eslint/no-explicit-any */
import { isNotNil } from 'ramda';
import { defineComponent, h, PropType, VNode, watch } from 'vue';
import { RouteLocationNormalizedLoaded } from 'vue-router';

/**
 * 只会第一次绘制的时候绘制路由相关的内容，后面路由导致的router-view的回调都屏蔽了。
 * 通过变更manualKey,来强制刷新router-view的slot回调。并且吧manualKey传给Component的key，搭配AppKeepAlive可以缓存组件
 */

export const IBizRouterView = defineComponent({
  name: 'IBizRouterView',
  inheritAttrs: false,
  props: {
    name: {
      type: String as PropType<string>,
      default: 'default',
    },
    route: Object as PropType<RouteLocationNormalizedLoaded>,
    manualKey: {
      type: String,
    },
  },
  setup(props, { attrs }) {
    const cache: { type?: VNode['type']; props?: Record<string, any> } = {};

    let isActive = true;

    watch(
      () => props.manualKey,
      (newVal, oldVal) => {
        if (isNotNil(newVal) && newVal !== oldVal) {
          isActive = true;
        }
      },
    );

    const renderComp = (Component: VNode, _route: any): VNode | undefined => {
      // 非激活时返回缓存
      if (!isActive) {
        return cache.type ? h(cache.type as string, cache.props) : undefined;
      }
      isActive = false;
      if (Component) {
        const tempProps = { ...Component.props };
        delete tempProps.onVnodeUnmounted;
        delete tempProps.ref;
        const vnodeProps = {
          ...tempProps,
          ...attrs,
          key: props.manualKey,
        };
        cache.type = Component.type;
        cache.props = vnodeProps;
        return h(Component.type as string, vnodeProps);
      }
      return undefined;
    };

    return { renderComp };
  },
  render() {
    return (
      <router-view name={this.name} route={this.route}>
        {({ Component, route }: any): VNode | VNode[] | undefined => {
          const newComp = this.renderComp(Component, route);
          if (this.$slots.default) {
            return this.$slots.default({ Component: newComp, route });
          }
          return newComp;
        }}
      </router-view>
    );
  },
});
