import { defineComponent, h, resolveComponent } from 'vue';
import {
  EventBase,
  FormMDCtrlFormController,
  IEditFormController,
} from '@ibiz-template/runtime';
import { useNamespace } from '@ibiz-template/vue3-util';
import './form-mdctrl-form.scss';

export const FormMDCtrlForm = defineComponent({
  name: 'IBizFormMDCtrlForm',
  props: {
    controller: {
      type: FormMDCtrlFormController,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('form-mdctrl-form');

    const onCreated = (id: string, event: EventBase): void => {
      props.controller.setFormController(id, event.ctrl as IEditFormController);
    };

    return { ns, onCreated };
  },
  render() {
    const { state, formProvider, model } = this.controller;

    return (
      <iBizMDCtrlContainer
        class={this.ns.b()}
        items={state.items || []}
        caption={this.controller.model.caption}
        enableCreate={this.controller.enableCreate}
        enableDelete={this.controller.enableDelete}
        onAddClick={(index: number): void => this.controller.create(index)}
        onRemoveClick={(item: IData) => this.controller.remove(item.id)}
      >
        {{
          item: ({ data, index }: { data: IData; index: number }) => {
            if (!formProvider) {
              return (
                <div>
                  {ibiz.i18n.t('control.form.formMDctrlForm.noFindProvider')}
                </div>
              );
            }
            const formComponent = h(resolveComponent(formProvider.component), {
              class: this.ns.be('item', 'form'),
              modelData: model.contentControl!,
              context: data.context,
              key: data.id,
              params: data.params,
              mdCtrlFormIndex: index,
              onCreated: (event: EventBase) => {
                this.onCreated(data.id, event);
              },
            });
            return formComponent;
          },
        }}
      </iBizMDCtrlContainer>
    );
  },
});
