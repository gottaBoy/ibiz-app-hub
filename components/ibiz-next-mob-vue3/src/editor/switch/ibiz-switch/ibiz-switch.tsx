import { defineComponent, ref, watch } from 'vue';
import {
  getEditorEmits,
  getSwitchProps,
  useFocusAndBlur,
  useNamespace,
  useFilterAttribute,
} from '@ibiz-template/vue3-util';
import './ibiz-switch.scss';
import { SwitchEditorController } from '../switch-editor.controller';

/**
 * 移动端开关部件
 *
 * @description 使用van-switch组件，表示两种相互对立的状态间的切换，多用于触发「开/关」。支持编辑器类型包含：`移动端开关部件`
 * @primary
 * @editorparams {name:readonly,parameterType:boolean,defaultvalue:false,description:设置编辑器是否为只读态}
 * @ignoreprops overflowMode | autoFocus
 * @ignoreemits enter | infoTextChange
 */
export const IBizSwitch = defineComponent({
  name: 'IBizSwitch',
  props: getSwitchProps<SwitchEditorController>(),
  emits: getEditorEmits(),
  setup(props, { emit }) {
    const ns = useNamespace('switch');
    // 当前值
    const currentVal = ref<boolean>(false);

    watch(
      () => props.value,
      (newVal, oldVal) => {
        if (newVal !== oldVal) {
          if (!newVal) {
            currentVal.value = false;
          } else {
            // eslint-disable-next-line eqeqeq
            currentVal.value = props.value == 1;
          }
        }
      },
      { immediate: true },
    );

    const handleChange = (currentValue: boolean) => {
      const emitValue = currentValue === true ? 1 : 0;
      emit('change', emitValue);
    };

    // 聚焦失焦事件
    const { componentRef: editorRef } = useFocusAndBlur(
      () => emit('focus'),
      () => emit('blur'),
    );

    return {
      ns,
      currentVal,
      handleChange,
      editorRef,
    };
  },
  render() {
    return (
      <div class={[this.ns.b()]} ref='editorRef'>
        <van-switch
          v-model={this.currentVal}
          disabled={this.disabled || this.readonly}
          onChange={this.handleChange}
          {...useFilterAttribute(this.$attrs)}
        ></van-switch>
      </div>
    );
  },
});
