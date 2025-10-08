import { defineComponent, ref, watch } from 'vue';
import {
  getEditorEmits,
  getColorPickerProps,
  useNamespace,
} from '@ibiz-template/vue3-util';
import './ibiz-color-picker.scss';
import { ColorPickerEditorController } from '../color-picker-editor.controller';

/**
 * 移动端颜色选择器
 * @primary
 * @description  使用van-field组件，轻量化的颜色选择器，支持色板选取、RGB 格式输入及实时预览，满足高效精准的色彩配置需求。支持编辑器类型包含：`移动端颜色选择器`
 * @ignoreprops  autoFocus | overflowMode
 * @ignoreemits  infoTextChange | enter
 */
export const IBizColorPicker = defineComponent({
  name: 'IBizColorPicker',
  props: getColorPickerProps<ColorPickerEditorController>(),
  emits: getEditorEmits(),
  setup(props, { emit }) {
    const ns = useNamespace('color-picker');

    const c = props.controller;

    const currentVal = ref<string | null>('');

    watch(
      () => props.value,
      (newVal, oldVal) => {
        if (newVal !== oldVal) {
          if (!newVal) {
            currentVal.value = '';
          } else {
            currentVal.value = newVal;
          }
        }
      },
      { immediate: true },
    );

    const handleChange = (e: IData) => {
      if (!e) {
        return;
      }
      const { target } = e;
      if (!target) {
        return;
      }
      const { value } = target;
      emit('change', value);
    };

    const inputRef = ref();

    // 聚焦
    const onFocus = () => {
      emit('focus');
    };

    // 失焦
    const onBlur = () => {
      emit('blur');
    };

    return {
      ns,
      c,
      currentVal,
      handleChange,
      inputRef,
      onFocus,
      onBlur,
    };
  },
  render() {
    let content = null;
    if (this.readonly) {
      // 只读显示
      content = `${this.currentVal || ''}`;
    } else {
      // 编辑态显示
      content = [
        <van-field
          class={[this.ns.e('item')]}
          v-model={this.currentVal}
          disabled={this.disabled}
          placeholder={this.c.placeHolder}
          onFocus={this.onFocus}
          onBlur={this.onBlur}
          readonly
        ></van-field>,
        <van-field
          class={[this.ns.e('item'), this.ns.e('picker')]}
          v-model={this.currentVal}
          disabled={this.disabled}
          placeholder={this.c.placeHolder}
          onInput={this.handleChange}
          onFocus={this.onFocus}
          onBlur={this.onBlur}
          type='color'
        ></van-field>,
      ];
    }

    return (
      <div
        class={[
          this.ns.b(),
          this.disabled ? this.ns.m('disabled') : '',
          this.readonly ? this.ns.m('readonly') : '',
        ]}
        style={{ color: this.currentVal || '' }}
      >
        {content}
      </div>
    );
  },
});
