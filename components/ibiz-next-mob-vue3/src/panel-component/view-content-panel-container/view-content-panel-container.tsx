import {
  useMobCtx,
  useNamespace,
  PanelContainerController,
} from '@ibiz-template/vue3-util';
import { IPanelContainer } from '@ibiz/model-core';
import { Component, PropType, defineComponent, ref, computed, Ref } from 'vue';
import { SysUIActionTag } from '@ibiz-template/runtime';
import { useRoute } from 'vue-router';
import './view-content-panel-container.scss';

/**
 * 面板容器（视图内容区）
 * @primary
 * @description 用于视图内容区的绘制。
 */
export const ViewContentPanelContainer: Component = defineComponent({
  name: 'IBizViewContentPanelContainer',
  props: {
    /**
     * @description 容器模型数据
     */
    modelData: {
      type: Object as PropType<IPanelContainer>,
      required: true,
    },
    /**
     * @description 容器控制器
     */
    controller: {
      type: PanelContainerController,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('view-content');

    const isRefreshing = ref(false);

    const ctx = useMobCtx();
    const { view } = ctx;
    const viewModel = view.model;
    const route = useRoute();

    let isScrollable = false;
    // 嵌入视图不出
    if (view.modal.viewUsage === 4) {
      isScrollable = false;
    } else if (view.modal.viewUsage === 1) {
      // 路由视图得判断是否是首页视图下的视图 或者是 home页下的
      if (
        (view.modal.routeDepth === 1 &&
          view.model.viewType !== 'APPINDEXVIEW') ||
        (view.modal.routeDepth === 2 &&
          (view.parentView?.model?.viewType === 'APPINDEXVIEW' ||
            route.meta.home))
      ) {
        isScrollable = true;
      }
      // 模态视图直接出滚动条
    } else if (view.modal.viewUsage === 2) {
      isScrollable = true;
    }

    // 调用预置的界面行为刷新界面
    const refresh = async () => {
      try {
        isRefreshing.value = true;
        await view.call(SysUIActionTag.REFRESH);
      } finally {
        isRefreshing.value = false;
      }
    };
    const { id } = props.modelData;
    const classArr = computed(() => {
      let result: Array<string | false> = [ns.b(), ns.m(id)];
      result = [
        ...result,
        ...props.controller.containerClass,
        // 只有这个scroll 样式才出滚动条
        ns.is('scroll', isScrollable),
        ns.is('embed', view.modal.viewUsage === 4),
        ns.is('hidden', !props.controller.state.visible),
      ];
      return result;
    });
    const contentRef: Ref<IData | undefined> = ref();
    return {
      ns,
      viewModel,
      isRefreshing,
      isScrollable,
      classArr,
      contentRef,
      refresh,
    };
  },
  render() {
    // 内容区默认插槽处理，封装app-col
    const defaultSlots = this.$slots.default?.() || [];
    const content = (
      <iBizRow
        class={this.classArr}
        layout={this.modelData.layout}
        ref='contentRef'
      >
        {this.isScrollable && this.contentRef && (
          <van-back-top teleport={this.contentRef.$el} />
        )}
        {defaultSlots.map((slot: { props: IData }) => {
          const props = slot.props as IData;
          if (!props || !props.controller) {
            return slot;
          }
          return (
            <iBizCol
              layoutPos={props.modelData.layoutPos}
              state={props.controller.state}
            >
              {slot}
            </iBizCol>
          );
        })}
      </iBizRow>
    );
    if (this.viewModel.enablePullDownRefresh === true) {
      return (
        <van-pull-refresh
          class={this.ns.b('refresh')}
          v-model={this.isRefreshing}
          onRefresh={this.refresh}
        >
          {content}
        </van-pull-refresh>
      );
    }
    return content;
  },
});
