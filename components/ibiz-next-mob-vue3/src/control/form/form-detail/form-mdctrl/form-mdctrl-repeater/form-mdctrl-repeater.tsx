import { defineComponent } from 'vue';
import { FormMDCtrlRepeaterController } from '@ibiz-template/runtime';
import { useNamespace } from '@ibiz-template/vue3-util';
import { RepeaterSingleForm } from './repeater-single-form/repeater-single-form';
import { RepeaterMultiForm } from './repeater-multi-form/repeater-multi-form';
import { RepeaterGrid } from './repeater-grid/repeater-grid';

export const FormMDCtrlRepeater = defineComponent({
  name: 'IBizFormMDCtrlRepeater',
  props: {
    controller: {
      type: FormMDCtrlRepeaterController,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('form-mdctrl-repeater');
    const onDataChange = (data: IData | IData[] | null) => {
      props.controller.setValue(data);
    };
    return { ns, onDataChange };
  },
  render() {
    const classNames = [this.ns.b()];
    switch (this.controller.repeaterStyle) {
      case 'MultiForm':
        return (
          <RepeaterMultiForm
            class={classNames}
            onChange={this.onDataChange}
            controller={this.controller}
          ></RepeaterMultiForm>
        );
      case 'SingleForm':
        return (
          <RepeaterSingleForm
            class={classNames}
            data={this.controller.value as IData}
            controller={this.controller}
            onChange={this.onDataChange}
          ></RepeaterSingleForm>
        );
      case 'Grid':
        return (
          <RepeaterGrid
            class={classNames}
            controller={this.controller}
            onChange={this.onDataChange}
          ></RepeaterGrid>
        );
      default:
        return (
          <div class={classNames}>
            {ibiz.i18n.t('control.form.formMDctrlRepeater.noSupportStyle', {
              repeaterStyle: this.controller.repeaterStyle,
            })}
          </div>
        );
    }
  },
});
