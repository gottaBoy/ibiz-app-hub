import { defineComponent, PropType } from 'vue';
import {
  ControlVO,
  EventBase,
  FormMDCtrlRepeaterController,
} from '@ibiz-template/runtime';
import { RuntimeError } from '@ibiz-template/core';
import { useNamespace } from '@ibiz-template/vue3-util';
import './repeater-single-form.scss';

export const RepeaterSingleForm = defineComponent({
  name: 'IBizRepeaterSingleForm',
  props: {
    data: {
      type: Object as PropType<IData>,
      required: true,
    },
    controller: {
      type: FormMDCtrlRepeaterController,
      required: true,
    },
    simpleDataIndex: {
      type: Number,
    },
  },
  emits: {
    change: (_value: IData) => true,
    created: (_value: EventBase) => true,
  },
  setup(props, { emit }) {
    const ns = useNamespace('repeater-single-form');

    const onFormDataChange = (event: EventBase) => {
      const item = event.data[0];
      const formData =
        item instanceof ControlVO ? item.getOrigin() : { ...item };
      // 隔离抛出不一样的对象
      const cloneData: IData = {};
      if (formData && Object.keys(formData).length > 0) {
        Object.keys(formData).forEach(key => {
          cloneData[key] = formData[key];
        });
      }
      emit('change', cloneData);
    };

    const onCreated = (event: EventBase): void => {
      emit('created', event);
    };

    return { ns, onFormDataChange, onCreated };
  },
  render() {
    if (!this.controller.repeatedForm) {
      throw new RuntimeError(
        ibiz.i18n.t('control.form.repeaterSingleForm.errorMessage'),
      );
    }
    return (
      <iBizControlShell
        class={this.ns.b()}
        context={this.controller.context}
        params={this.controller.params}
        modelData={this.controller.repeatedForm}
        isSimple={true}
        simpleDataIndex={this.simpleDataIndex}
        data={this.data}
        onFormDataChange={this.onFormDataChange}
        onCreated={this.onCreated}
      ></iBizControlShell>
    );
  },
});
