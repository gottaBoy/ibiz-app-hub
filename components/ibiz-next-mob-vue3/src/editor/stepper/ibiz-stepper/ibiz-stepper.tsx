import { computed, defineComponent, ref } from 'vue';
import {
  getEditorEmits,
  getStepperProps,
  useNamespace,
} from '@ibiz-template/vue3-util';
import { toNumber } from 'lodash-es';
import { StepperEditorController } from '../stepper-editor.controller';
import './ibiz-stepper.scss';

/**
 * 移动端步进器
 *
 * @description 使用van-stepper组件，用于在一定范围内调整数字的场景。支持编辑器类型包含：`移动端步进器`
 * @primary
 * @editorparams {name:stepValue,parameterType:number,defaultvalue:1,description:设置递增或递减的步长，van-stepper组件的step属性}
 * @editorparams {name:precision,parameterType:number,defaultvalue:0,description:设置数值精度，van-stepper组件的decimal-length属性}
 * @editorparams {name:maxValue,parameterType:number,defaultvalue:Infinity,description:设置步进器允许的最大值，van-stepper组件的max属性}
 * @editorparams {name:minValue,parameterType:number,defaultvalue:-Infinity,description:设置步进器允许的最小值，van-stepper组件的min属性}
 * @ignoreprops autoFocus | overflowMode
 * @ignoreemits enter | infoTextChange
 */
export const IBizStepper = defineComponent({
  name: 'IBizStepper',
  props: getStepperProps<StepperEditorController>(),
  emits: getEditorEmits(),
  setup(props, { emit }) {
    const ns = useNamespace('stepper');

    const c = props.controller;

    const editorModel = c.model;

    // const currentVal = ref<number | null>(null);

    const currentVal = computed(() => {
      return props.value;
    });

    // 步进器步长
    let step = 1;
    // 数值精度
    let precision = 0;
    // 设置步进器允许的最大值
    let max = Infinity;
    // 设置步进器允许的最小值
    let min = -Infinity;
    if (editorModel.editorParams) {
      if (editorModel.editorParams.stepValue) {
        step = toNumber(editorModel.editorParams.stepValue);
      }
      if (editorModel.editorParams.precision) {
        precision = toNumber(editorModel.editorParams.precision);
      }
      if (editorModel.editorParams.maxValue) {
        max = toNumber(editorModel.editorParams.maxValue);
      }
      if (editorModel.editorParams.minValue) {
        min = toNumber(editorModel.editorParams.minValue);
      }
    }

    // watch(
    //   () => props.value,
    //   (newVal, oldVal) => {
    //     if (newVal !== oldVal) {
    //       currentVal.value = newVal;
    //     }
    //   },
    //   { immediate: true },
    // );

    const handleChange = (e: number | null) => {
      // eslint-disable-next-line eqeqeq
      if (e == props.value) {
        return;
      }
      emit('change', e);
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
      step,
      precision,
      max,
      min,
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
        <van-stepper
          ref='inputRef'
          modelValue={this.currentVal}
          placeholder={this.c.placeHolder}
          decimal-length={this.precision}
          min={this.min}
          max={this.max}
          step={this.step}
          disabled={this.disabled}
          onChange={this.handleChange}
          onFocus={this.onFocus}
          onBlur={this.onBlur}
          {...this.$attrs}
        ></van-stepper>,
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
