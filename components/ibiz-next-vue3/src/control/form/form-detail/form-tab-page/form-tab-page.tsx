import { defineComponent, PropType, VNode } from 'vue';
import { useController, useNamespace } from '@ibiz-template/vue3-util';
import './form-tab-page.scss';
import { IDEFormTabPage } from '@ibiz/model-core';
import { FormTabPageController } from '@ibiz-template/runtime';

export const FormTabPage = defineComponent({
  name: 'IBizFormTabPage',
  props: {
    modelData: {
      type: Object as PropType<IDEFormTabPage>,
      required: true,
    },
    controller: {
      type: FormTabPageController,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('form-tab-page');
    useController(props.controller);

    return {
      ns,
    };
  },
  render() {
    const defaultSlots: VNode[] = this.$slots.default?.() || [];
    return (
      <iBizRow
        class={[
          this.ns.b(),
          this.ns.m(this.modelData.codeName),
          ...this.controller.containerClass,
        ]}
        layout={this.modelData.layout}
        v-loading={this.controller.state.loading}
        onClick={(event: MouseEvent) => this.controller.onClick(event)}
      >
        {defaultSlots.map(slot => {
          const props = slot.props as IData;
          if (!props || !props.controller) {
            return slot;
          }
          const c = props.controller;
          return (
            <iBizCol layoutPos={c.model.layoutPos} state={c.state}>
              {slot}
            </iBizCol>
          );
        })}
      </iBizRow>
    );
  },
});
export default FormTabPage;
