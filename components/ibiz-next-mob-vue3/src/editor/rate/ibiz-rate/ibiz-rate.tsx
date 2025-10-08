import { defineComponent, ref, watch } from 'vue';
import {
  getEditorEmits,
  getRateProps,
  useFocusAndBlur,
  useNamespace,
} from '@ibiz-template/vue3-util';
import { toNumber } from 'lodash-es';
import { RateEditorController } from '../rate-editor.controller';
import './ibiz-rate.scss';

/**
 * 移动端评分器
 * @primary
 * @description 使用van-rate组件，用于给某些东西进行评分。支持编辑器类型包含：`移动端评分器`
 * @editorparams {name:maxValue,parameterType:number,defaultvalue:5,description:设置最大评分值，van-rate组件的count属性}
 * @ignoreprops  autoFocus | overflowMode
 * @ignoreemits  infoTextChange | enter
 */
export const IBizRate = defineComponent({
  name: 'IBizRate',
  props: getRateProps<RateEditorController>(),
  emits: getEditorEmits(),
  setup(props, { emit }) {
    const ns = useNamespace('rate');
    // 当前值
    const currentVal = ref<number>();

    const c = props.controller;

    const editorModel = c.model;

    // 设置允许的最大值
    let max = 5;
    if (editorModel.editorParams) {
      if (editorModel.editorParams.maxValue) {
        max = toNumber(editorModel.editorParams.maxValue);
      }
    }

    watch(
      () => props.value,
      (newVal, oldVal) => {
        if (newVal !== oldVal) {
          if (!newVal) {
            currentVal.value = 0;
          } else {
            currentVal.value = newVal as number;
          }
        }
      },
      { immediate: true },
    );

    const handleChange = (currentValue: number | undefined) => {
      emit('change', currentValue);
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
      max,
      editorRef,
    };
  },
  render() {
    return (
      <div class={[this.ns.b()]} ref='editorRef'>
        <van-rate
          v-model={this.currentVal}
          disabled={this.disabled || this.readonly}
          count={this.max}
          onChange={this.handleChange}
          {...this.$attrs}
        ></van-rate>
      </div>
    );
  },
});
