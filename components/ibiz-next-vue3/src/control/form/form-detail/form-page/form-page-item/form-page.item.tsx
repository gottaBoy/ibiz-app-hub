import { FormPageController } from '@ibiz-template/runtime';
import { useNamespace } from '@ibiz-template/vue3-util';
import { IDEFormPage } from '@ibiz/model-core';
import { defineComponent, PropType, VNode } from 'vue';

export const IBizFormPageItem = defineComponent({
  name: 'IBizFormPageItem',
  props: {
    modelData: {
      type: Object as PropType<IDEFormPage>,
      required: true,
    },
    controller: {
      type: FormPageController,
      required: true,
    },
  },
  setup() {
    const ns = useNamespace('form-page-item');
    return { ns };
  },
  render() {
    const defaultSlots: VNode[] = this.$slots.default?.() || [];
    defaultSlots.forEach(item => {
      const data = item.component?.data;
      if (data) {
        data.class = { [this.ns.b('child')]: true };
      }
    });
    return (
      <iBizRow
        class={[
          this.ns.b(),
          this.ns.m(this.modelData.id),
          ...this.controller.containerClass,
        ]}
        layout={this.modelData.layout}
        v-loading={this.controller.state.loading}
      >
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
  },
});
