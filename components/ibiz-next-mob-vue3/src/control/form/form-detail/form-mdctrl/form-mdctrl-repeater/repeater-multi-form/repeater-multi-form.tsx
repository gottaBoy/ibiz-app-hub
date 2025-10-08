import { defineComponent } from 'vue';
import { FormMDCtrlRepeaterController } from '@ibiz-template/runtime';
import { useNamespace } from '@ibiz-template/vue3-util';
import { RepeaterSingleForm } from '../repeater-single-form/repeater-single-form';

export const RepeaterMultiForm = defineComponent({
  name: 'IBizRepeaterMultiForm',
  props: {
    controller: {
      type: FormMDCtrlRepeaterController,
      required: true,
    },
  },
  emits: {
    change: (_value: IData[]) => true,
  },
  setup(props, { emit }) {
    const ns = useNamespace('repeater-multi-form');

    const onValueChange = (value: IData, index: number) => {
      const arrData = [...(props.controller.value as IData[])];
      arrData[index] = value;
      emit('change', arrData);
    };

    const removeClick = async (index: number) => {
      const confirm = await ibiz.modal.confirm({
        title: ibiz.i18n.t('control.form.repeaterMultiForm.confirmTitle'),
        desc: ibiz.i18n.t('control.form.repeaterMultiForm.confirmDesc'),
      });
      if (confirm) {
        props.controller.remove(index);
      }
    };
    return { ns, onValueChange, removeClick };
  },
  render() {
    const items = (this.controller.value as IData[]) || [];
    return (
      <iBizMDCtrlContainer
        class={this.ns.b()}
        items={items}
        caption={this.controller.model.caption}
        enableCreate={this.controller.enableCreate}
        enableDelete={this.controller.enableDelete}
        onAddClick={(index: number): void => this.controller.create(index)}
        onRemoveClick={(_item: IData, index: number): void => {
          this.removeClick(index);
        }}
      >
        {{
          item: ({ data, index }: { data: IData; index: number }) => {
            return (
              <RepeaterSingleForm
                key={index}
                data={data}
                simpleDataIndex={index}
                controller={this.controller}
                onChange={(value: IData) => {
                  this.onValueChange(value, index);
                }}
              ></RepeaterSingleForm>
            );
          },
        }}
      </iBizMDCtrlContainer>
    );
  },
});
