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
  },
  setup(_props, { emit }) {
    const ns = useNamespace('repeater-single-form');

    const getFilteredData = (data: ControlVO): IData => {
      const tempData: IData = {};
      // 处理界面上的属性数据
      data.$dataUIMap.forEach(dataUI => {
        if (data[dataUI.dataKey] !== undefined) {
          tempData[dataUI.dataKey] = data[dataUI.dataKey];
        }
      });

      return tempData;
    };

    const onFormDataChange = (event: EventBase) => {
      // 隔离抛出不一样的对象
      const data = getFilteredData(event.data[0] as ControlVO);
      emit('change', data);
    };

    return { ns, onFormDataChange };
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
        simpleDataIndex={this.simpleDataIndex}
        isSimple={true}
        data={this.data}
        onFormDataChange={this.onFormDataChange}
      ></iBizControlShell>
    );
  },
});
