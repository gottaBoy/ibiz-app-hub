import { defineComponent, ref, watch } from 'vue';
import {
  getEditorEmits,
  getInputNumberProps,
  useNamespace,
  useFilterAttribute,
} from '@ibiz-template/vue3-util';
import './ibiz-input-number.scss';
import { floor, isNil } from 'lodash-es';
import { TextBoxEditorController } from '../text-box-editor.controller';

/**
 * 移动端数值框
 *
 * @description 使用van-field组件，用于仅允许输入标准的数字值的场景。支持编辑器类型包含：`移动端数值框`
 * @primary
 * @editorparams {name:precision,parameterType:number,description:设置数值精度}
 * @editorparams {"name":"triggermode","parameterType":"'blur' | 'input'","defaultvalue":"'blur'","description":"指定编辑器触发 `change` 值变更事件的模式，input: 输入框输入时触发事件，blur：输入框blur时触发事件"}
 * @editorparams {name:readonly,parameterType:boolean,defaultvalue:false,description:设置编辑器是否为只读态}
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

    const currentVal = ref<number | null>(null);
    let blurCacheValue: number | null = null;

    const show = ref(false);

    watch(
      () => props.value,
      (newVal: unknown, oldVal) => {
        if (newVal !== oldVal) {
          const number = isNil(newVal) || newVal === '' ? null : Number(newVal);
          currentVal.value = Number.isNaN(number) ? null : number;
          blurCacheValue = currentVal.value;
        }
      },
      { immediate: true },
    );

    const onEmit = (val: number | null, eventName: string = 'blur') => {
      if (eventName === c.triggerMode) {
        emit('change', val);
      }
    };

    const handleChange = (evt: IData) => {
      const value = evt.target.value === '' ? null : Number(evt.target.value);

      const emitValue =
        c.precision && value !== null ? floor(value, c.precision) : value;
      if (emitValue === blurCacheValue) {
        return;
      }
      onEmit(emitValue, 'input');
      blurCacheValue = emitValue;
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
      if (blurCacheValue !== props.value) {
        onEmit(blurCacheValue);
      }
      emit('blur');
    };

    const onClear = () => {
      onEmit(null, c.triggerMode);
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
          type='number'
          inputmode='decimal'
          disabled={this.disabled}
          clearable
          onClear={this.onClear}
          onFocus={this.onFocus}
          onBlur={this.onBlur}
          onInput={this.handleChange}
          {...useFilterAttribute(this.$attrs)}
        ></van-field>,
        unitName && <span class={this.ns.e('unit')}>{unitName}</span>,
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
