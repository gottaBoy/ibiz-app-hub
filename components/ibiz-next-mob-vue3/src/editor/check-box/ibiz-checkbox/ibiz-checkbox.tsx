import { computed, defineComponent } from 'vue';
import {
  getCheckboxProps,
  getEditorEmits,
  useFocusAndBlur,
  useNamespace,
} from '@ibiz-template/vue3-util';
import { CheckBoxEditorController } from '../check-box-editor.controller';
import './ibiz-checkbox.scss';

/**
 * 选项框
 * @primary
 * @description 使用van-checkbox组件，用于选中或取消选项场景。支持编辑器类型包含：`选项框`
 * @editorparams {name:selectValue,title:选中时抛出的值,parameterType:number,defaultvalue:1,description:选中时抛出的值}
 * @editorparams {name:nullValue,title:取消选中时抛出的值,parameterType:number,defaultvalue:0,description:取消选中时抛出的值}
 * @ignoreprops  autoFocus | overflowMode
 * @ignoreemits  infoTextChange | enter
 */
export const IBizCheckbox = defineComponent({
  name: 'IBizCheckbox',
  props: getCheckboxProps<CheckBoxEditorController>(),
  emits: getEditorEmits(),
  setup(props, { emit }) {
    const ns = useNamespace('checkbox');

    const c = props.controller;

    const editorModel = c.model;

    let selectValue = 1;

    let nullValue = 0;

    if (editorModel.editorParams?.selectValue) {
      selectValue = editorModel.editorParams.selectValue;
    }
    if (editorModel.editorParams?.nullValue) {
      nullValue = editorModel.editorParams.nullValue;
    }

    // 当前值
    const currentVal = computed({
      get() {
        if (props.value === selectValue) {
          return true;
        }
        return false;
      },
      set(val: boolean) {
        let value;
        if (val) {
          value = selectValue;
        } else {
          value = nullValue;
        }
        emit('change', value);
      },
    });

    // 聚焦失焦事件
    const { componentRef: editorRef } = useFocusAndBlur(
      () => emit('focus'),
      () => emit('blur'),
    );

    return {
      ns,
      editorModel,
      currentVal,
      editorRef,
    };
  },
  render() {
    return (
      <div class={[this.ns.b()]} ref='editorRef'>
        <van-checkbox
          v-model={this.currentVal}
          disabled={this.disabled || this.readonly}
          {...this.$attrs}
        ></van-checkbox>
      </div>
    );
  },
});
