import { defineComponent, ref, watch } from 'vue';
import {
  getEditorEmits,
  getInputNumberProps,
  useNamespace,
} from '@ibiz-template/vue3-util';
import './ibiz-input-number.scss';
import { floor } from 'lodash-es';
import { TextBoxEditorController } from '../text-box-editor.controller';

/**
 * 移动端数值框
 *
 * @description 使用van-field组件，用于仅允许输入标准的数字值的场景。支持编辑器类型包含：`移动端数值框`
 * @primary
 * @editorparams {name:precision,parameterType:number,description:设置数值精度，van-field组件的precision属性}
 * @ignoreprops overflowMode
 * @ignoreemits infoTextChange | enter
 */
export const IBizInputNumber = defineComponent({
  name: 'IBizInputNumber',
  props: getInputNumberProps<TextBoxEditorController>(),
  emits: getEditorEmits(),
  setup(props, { emit }) {
    const ns = useNamespace('input-number');

    const c = props.controller;

    const currentVal = ref<number | undefined>(undefined);

    const show = ref(false);

    const oldEmitVal = ref<number | undefined>(undefined);

    watch(
      () => props.value,
      (newVal, oldVal) => {
        if (newVal !== oldVal) {
          const number = Number(newVal);
          currentVal.value = Number.isNaN(number) ? undefined : number;
        }
      },
      { immediate: true },
    );

    const handleChange = (evt: IData) => {
      const value = Number(evt.target.value);

      const emitValue = c.precision ? floor(value, c.precision) : value;
      if (emitValue === oldEmitVal.value) {
        return;
      }
      emit('change', emitValue);
      oldEmitVal.value = Number(emitValue);
    };

    const inputRef = ref();

    if (props.autoFocus) {
      watch(inputRef, newVal => {
        if (newVal) {
          const input = newVal.$el.getElementsByTagName('input')[0];
          input.focus();
        }
      });
    }

    // 聚焦
    const onFocus = () => {
      emit('focus');
    };

    // 失焦
    const onBlur = () => {
      emit('blur');
    };

    const onClear = () => {
      emit('change', undefined);
    };

    return {
      ns,
      c,
      currentVal,
      handleChange,
      inputRef,
      onFocus,
      onBlur,
      show,
      onClear,
    };
  },
  render() {
    const { unitName } = this.c.parent;

    let content = null;
    if (this.readonly) {
      // 只读显示
      content = `${this.currentVal || ''}`;
      // 当有值且单位存在时才显示单位
      if (content && unitName) {
        content += unitName;
      }
    } else {
      // 编辑态显示
      content = [
        <van-field
          ref='inputRef'
          modelValue={this.currentVal}
          placeholder={this.c.placeHolder}
          precision={this.c.model.precision}
          type='number'
          disabled={this.disabled}
          clearable
          onClear={this.onClear}
          onFocus={this.onFocus}
          onBlur={this.onBlur}
          onInput={this.handleChange}
          {...this.$attrs}
        ></van-field>,
        unitName && <i class={this.ns.e('unit')}>{unitName}</i>,
      ];
    }

    return (
      <div
        class={[
          this.ns.b(),
          this.disabled ? this.ns.m('disabled') : '',
          this.readonly ? this.ns.m('readonly') : '',
        ]}
      >
        {content}
      </div>
    );
  },
});
