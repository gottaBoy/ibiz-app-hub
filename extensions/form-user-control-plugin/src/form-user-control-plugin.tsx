import { defineComponent, PropType } from 'vue';
import { useNamespace } from '@ibiz-template/vue3-util';
import { IDEFormDetail } from '@ibiz/model-core';
import { FormUserControlPluginController } from './form-user-control-plugin.controller';
import './form-user-control-plugin.scss';

export const FormUserControlPlugin = defineComponent({
  name: 'IBizFormUserControlPlugin',
  props: {
    modelData: {
      type: Object as PropType<IDEFormDetail>,
      required: true,
    },
    controller: {
      type: FormUserControlPluginController,
      required: true,
    },
  },
  setup() {
    const ns = useNamespace('form-user-control-plugin');

    return { ns };
  },
  render() {
    return (
      <div
        class={[
          this.ns.b(),
          this.ns.m(this.modelData.codeName),
          ...this.controller.containerClass,
        ]}
      >
        表单成员插件内容
      </div>
    );
  },
});
