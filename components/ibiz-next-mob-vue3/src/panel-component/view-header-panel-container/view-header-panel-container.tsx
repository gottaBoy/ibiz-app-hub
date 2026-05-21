import { PropType, defineComponent, computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { IPanelContainer } from '@ibiz/model-core';
import { IMobPlatformProvider } from '@ibiz-template/runtime';
import {
  useNamespace,
  PanelContainerController,
} from '@ibiz-template/vue3-util';
import { useViewStack } from '../../util';
import './view-header-panel-container.scss';

/**
 * 面板容器（视图头部）
 * @primary
 * @description 用于绘制视图头部内容。
 */
export const ViewHeaderPanelContainer = defineComponent({
  name: 'IBizViewHeaderPanelContainer',
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
    const ns = useNamespace('view-header');
    const route = useRoute();
    const { viewStack } = useViewStack();
    const backButtonVisible = ref(false);
    const initButtonVisible = () => {
      if (
        (props.controller.panel.view.modal.viewUsage === 1 &&
          viewStack.cacheKeys.length > 1 &&
          route.meta.home) ||
        props.controller.panel.view.modal.viewUsage === 2
      ) {
        backButtonVisible.value = true;
      }
    };
    if (
      (ibiz.platform as unknown as IMobPlatformProvider).getShowPresetBack()
    ) {
      initButtonVisible();
    }
    const view = props.controller.panel.view;
    // 嵌入视图模式判断 暂时注释
    // const isEmbed = view.modal.mode === ViewMode.EMBED || view.modal.routeDepth! > 2;
    const { id } = props.modelData;
    const classArr = computed(() => {
      let result: Array<string | false> = [ns.b(), ns.m(id)];
      result = [
        ...result,
        ...props.controller.containerClass,
        ns.is('hidden', !props.controller.state.visible),
      ];
      return result;
    });

    const showHeader = computed(() => {
      const { appViewParams } = view.model;
      const value: string | undefined = appViewParams?.find(
        (item: IData) => item.id!.toLowerCase() === 'mobshowviewheader',
      )?.value;
      const mobShowViewHeader = value
        ? Object.is(value, 'true')
        : (
            ibiz.platform as unknown as IMobPlatformProvider
          ).getShowViewHeader();
      return mobShowViewHeader;
    });
    return { ns, classArr, backButtonVisible, view, showHeader };
  },
  render() {
    if (this.controller.state.visible === false) {
      return;
    }
    const defaultSlots = this.$slots.default?.() || [];
    // 嵌入视图模式判断 暂时注释
    // return this.isEmbed ? (
    //   // 嵌入
    //   <div class={[this.ns.b()]}>
    //     {defaultSlots.map(slot => {
    //       const props = slot.props as IData;
    //       if (!props || !props.controller) {
    //         return slot;
    //       }
    //       return (
    //         <iBizCol
    //           layoutPos={props.modelData.layoutPos}
    //           state={props.controller.state}
    //         >
    //           {slot}
    //         </iBizCol>
    //       );
    //     })}
    //   </div>
    // ) : (
    const style: IData = {};
    if (!this.showHeader) {
      style.display = 'none';
    }
    return (
      <iBizRow
        class={this.classArr}
        style={style}
        layout={this.modelData.layout}
      >
        <iBizPresetViewBack view={this.view}></iBizPresetViewBack>
        {defaultSlots.map((slot, index) => {
          const props = slot.props as IData;
          if (!props || !props.controller) {
            return slot;
          }
          return (
            <iBizCol
              class={{
                [this.ns.m('precut-back')]:
                  index === 0 && this.backButtonVisible,
              }}
              layoutPos={props.modelData.layoutPos}
              state={props.controller.state}
            >
              {slot}
            </iBizCol>
          );
        })}
      </iBizRow>
    );
    // );
  },
});
