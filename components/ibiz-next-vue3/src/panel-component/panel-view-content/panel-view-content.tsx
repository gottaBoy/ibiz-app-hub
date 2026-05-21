import { useNamespace } from '@ibiz-template/vue3-util';
import { IPanelContainer } from '@ibiz/model-core';
import { computed, defineComponent, PropType, ref, VNode } from 'vue';
import { PanelContainerController } from '@ibiz-template/runtime';
import './panel-view-content.scss';

/**
 * 面板容器（视图内容）
 * @primary
 * @description 用于视图内容区的绘制。
 * @export
 * @class PanelViewContent
 */
export const PanelViewContent = defineComponent({
  name: 'IBizPanelViewContent',
  props: {
    /**
     * @description  容器模型数据
     */
    modelData: {
      type: Object as PropType<IPanelContainer>,
      required: true,
    },
    /**
     * @description  容器控制器
     */
    controller: {
      type: PanelContainerController,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('panel-view-content');
    const { showCaption, titleBarCloseMode, id } = props.modelData;
    const collapsible = titleBarCloseMode !== 0;
    const isCollapse = ref(titleBarCloseMode === 2);
    const changeCollapse = (): void => {
      if (collapsible) {
        isCollapse.value = !isCollapse.value;
      }
    };

    // 类名控制
    const classArr = computed(() => {
      let result: Array<string | false> = [ns.b(), ns.m(id)];
      const { view } = props.controller.panel;
      if (view.model.viewType) {
        result.push(ns.m(view.model.viewType.toLowerCase()));
      }
      result.push(ns.is('no-caption', !view.model.showCaptionBar));
      if (showCaption === true) {
        result = [
          ...result,
          ...props.controller.containerClass,
          ns.is('collapse', collapsible && isCollapse.value),
          ns.is('hidden', !props.controller.state.visible),
        ];
      }
      return result;
    });

    return { ns, isCollapse, classArr, changeCollapse };
  },
  render() {
    // 内容区默认插槽处理，封装app-col
    const defaultSlots: VNode[] = this.$slots.default?.() || [];
    const content = (
      <iBizRow layout={this.modelData.layout}>
        {defaultSlots.map(slot => {
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

    return (
      <div class={this.classArr} v-loading={this.controller.state.loading}>
        {content}
      </div>
    );
  },
});
