import { defineComponent, h, PropType, resolveComponent } from 'vue';
import { useNamespace } from '@ibiz-template/vue3-util';
import './form-item.scss';
import { IDEFormItem } from '@ibiz/model-core';
import { FormItemController } from '@ibiz-template/runtime';

export const FormItem = defineComponent({
  name: 'IBizFormItem',
  props: {
    modelData: {
      type: Object as PropType<IDEFormItem>,
      required: true,
    },
    controller: {
      type: FormItemController,
      required: true,
    },
    attrs: {
      type: Object as PropType<IData>,
      required: false,
    },
  },
  setup(props) {
    const ns = useNamespace('form-item');
    const c = props.controller;
    const onValueChange = (val: unknown, name?: string) => {
      props.controller.setDataValue(val, name);
    };
    return { ns, c, onValueChange };
  },
  render() {
    if (!this.c.state.visible) {
      return null;
    }

    // 编辑器内容
    let editor = null;
    const editMode = this.controller.editor?.model?.editorParams?.editMode;
    const editorProps = {
      style: this.controller.editor?.style,
      value: this.controller.value,
      data: this.controller.data,
      controller: this.controller.editor,
      disabled: this.controller.state.disabled,
      readonly: this.controller.state.readonly,
      onChange: this.onValueChange,
      controlParams: editMode
        ? { ...this.controller.form.controlParams, editmode: editMode }
        : this.controller.form.controlParams,
      onFocus: (event: MouseEvent) => this.c.onFocus(event),
      onBlur: (event: MouseEvent) => this.c.onBlur(event),
      onEnter: (event: MouseEvent) => this.controller.onEnter(event),
      onClick: (event: MouseEvent, params: IParams) =>
        this.controller.onClick(event, params),
      ...this.attrs,
    };
    if (this.c.form.state.isLoaded) {
      if (this.$slots.default) {
        editor = this.$slots.default(editorProps);
      } else if (this.controller.editorProvider) {
        const component = resolveComponent(
          this.controller.editorProvider.formEditor,
        );
        editor = h(component, {
          ...editorProps,
        });
      } else {
        editor = <notSupportedEditor modelData={this.modelData.editor} />;
      }
    }

    return (
      <iBizFormItemContainer
        class={[
          this.ns.b(),
          this.ns.m(this.modelData.id),
          { [this.ns.m('disabled')]: this.c.state.disabled },
          { [this.ns.m('readonly')]: this.controller.model.editor!.readOnly },
          ...this.controller.containerClass,
        ]}
        controller={this.c}
        onClick={(event: MouseEvent) => this.c.onClick(event)}
      >
        {editor}
      </iBizFormItemContainer>
    );
  },
});
export default FormItem;
