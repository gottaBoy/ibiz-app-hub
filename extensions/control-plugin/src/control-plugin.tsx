import { useControlController, useNamespace } from '@ibiz-template/vue3-util';
import { IDEEditForm } from '@ibiz/model-core';
import { defineComponent, PropType } from 'vue';
import { IControlProvider } from '@ibiz-template/runtime';
import { ControlPluginController } from './control-plugin.controller';
import './control-plugin.scss';

export const ControlPlugin = defineComponent({
  name: 'IBizControlPlugin',
  props: {
    modelData: {
      type: Object as PropType<IDEEditForm>,
      required: true,
    },
    context: { type: Object as PropType<IContext>, required: true },
    params: { type: Object as PropType<IParams>, default: () => ({}) },
    provider: { type: Object as PropType<IControlProvider> },
    isSimple: { type: Boolean, required: false },
    data: { type: Object as PropType<IData>, required: false },
    loadDefault: { type: Boolean, default: true },
  },
  setup() {
    const c = useControlController(
      (...args) => new ControlPluginController(...args),
    );
    const ns = useNamespace('control-plugin');

    return {
      c,
      ns,
    };
  },
  render() {
    return (
      <iBizFormControl class={this.ns.b()} controller={this.c}>
        {{ ...this.$slots }}
      </iBizFormControl>
    );
  },
});
