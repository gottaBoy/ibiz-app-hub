/* eslint-disable no-nested-ternary */
import { MDControlController } from '@ibiz-template/runtime';
import { useNamespace } from '@ibiz-template/vue3-util';
import { IControlNavigatable } from '@ibiz/model-core';
import {
  h,
  ref,
  Ref,
  watch,
  PropType,
  computed,
  onMounted,
  defineComponent,
  resolveComponent,
} from 'vue';
import { getNavigationProvider } from './provider';
import './control-navigation.scss';

/**
 * 部件内容导航组件
 */
export const IBizControlNavigation = defineComponent({
  name: 'IBizControlNavigation',
  props: {
    controller: {
      type: Object as PropType<MDControlController>,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('control-navigation');

    const provider = getNavigationProvider(props.controller);

    const outerWrapper: Ref<HTMLDivElement | null> = ref(null);

    // 内置导航视图是否是重定向视图
    const isEmbedCtrlNav: Ref<boolean> = ref(false);

    const {
      navViewPos,
      controlParam,
      navViewWidth,
      navViewHeight,
      navViewMinWidth,
      navViewMaxWidth,
      navViewMinHeight,
      navViewMaxHeight,
    } = props.controller.model as IControlNavigatable;

    const navStyle = {
      minWidth: navViewMinWidth
        ? navViewMinWidth > 0
          ? `${navViewMinWidth}px`
          : navViewMinWidth
        : undefined,
      maxWidth: navViewMaxWidth
        ? navViewMaxWidth > 0
          ? `${navViewMaxWidth}px`
          : navViewMaxWidth
        : undefined,
      minHeight: navViewMinHeight
        ? navViewMinHeight > 0
          ? `${navViewMinHeight}px`
          : navViewMinHeight
        : undefined,
      maxHeight: navViewMaxHeight
        ? navViewMaxHeight > 0
          ? `${navViewMaxHeight}px`
          : navViewMaxHeight
        : undefined,
    };

    const navViewMsg: Ref<
      | { key?: string; context?: IContext; params?: IParams; viewId?: string }
      | undefined
    > = ref();

    const navRenderMode: 'RELOAD' | 'REDRAW' = controlParam?.ctrlParams
      ?.navRenderMode
      ? controlParam.ctrlParams.navRenderMode
      : 'RELOAD';

    const splitValue: Ref<number | string> = ref(0.5);

    const splitMode: Ref<'horizontal' | 'vertical'> = ref(
      ['BOTTOM', 'ANY_BOTTOM'].includes(navViewPos!)
        ? 'vertical'
        : 'horizontal',
    );

    // 特殊处理地图上下导航样式，防止地图样式异常
    const style = computed(() => {
      const { controlType, height } = props.controller.model;
      if (controlType === 'MAP' && splitMode.value === 'vertical')
        return {
          height: `${
            height ? height + (navViewMaxHeight || navViewHeight || 400) : 1000
          }px`,
        };
      return undefined;
    });

    watch(
      () => provider.navViewMsg.value,
      async (newVal, oldVal) => {
        // 如果是重绘模式或导航视图改变 则重绘
        if (
          navRenderMode === 'REDRAW' ||
          !newVal ||
          (oldVal && newVal.viewId !== oldVal.viewId)
        ) {
          navViewMsg.value = newVal;
        } else {
          const viewModel = await ibiz.hub.getAppView(newVal.viewId!);
          if (viewModel && viewModel.viewType === 'DEREDIRECTVIEW') {
            isEmbedCtrlNav.value = true;
          }
          navViewMsg.value = {
            context: newVal.context,
            params: newVal.params,
            viewId: newVal.viewId,
          };
        }
      },
      {
        deep: true,
        immediate: true,
      },
    );

    onMounted(() => {
      if (outerWrapper.value) {
        const offsetSize =
          splitMode.value === 'horizontal' ? 'offsetWidth' : 'offsetHeight';
        const size = outerWrapper.value[offsetSize];
        const viewSize =
          splitMode.value === 'horizontal' ? navViewWidth : navViewHeight;
        if (viewSize) {
          if (viewSize > 0 && viewSize < 1) {
            splitValue.value = 1 - viewSize;
          } else {
            splitValue.value = `${size - viewSize}px`;
          }
        }
      }
    });

    const renderNavView = () => {
      if (!navViewMsg.value?.viewId) return;
      return h(resolveComponent('IBizViewShell'), {
        ...navViewMsg.value,
        isEmbedCtrlNav: isEmbedCtrlNav.value,
        class: ns.e('nav-view'),
      });
    };

    return {
      ns,
      style,
      navStyle,
      provider,
      splitMode,
      splitValue,
      outerWrapper,
      renderNavView,
    };
  },
  render() {
    const { state, model } = this.controller;
    return (
      <div
        ref={'outerWrapper'}
        style={this.style}
        class={[this.ns.b(), this.ns.e(model.controlType?.toLowerCase())]}
      >
        {state.enableNavView ? (
          state.showNavView ? (
            <iBizNavSplit
              v-model={this.splitValue}
              mode={this.splitMode}
              min={
                this.splitMode === 'horizontal'
                  ? this.navStyle.minWidth
                  : this.navStyle.minHeight
              }
              max={
                this.splitMode === 'horizontal'
                  ? this.navStyle.maxWidth
                  : this.navStyle.maxHeight
              }
            >
              {{
                left: () => this.$slots.default?.(),
                right: () => this.renderNavView(),
                top: () => this.$slots.default?.(),
                bottom: () => this.renderNavView(),
              }}
            </iBizNavSplit>
          ) : (
            this.$slots.default?.()
          )
        ) : (
          this.$slots.default?.()
        )}
      </div>
    );
  },
});
