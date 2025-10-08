import { defineComponent, Ref, ref, watch } from 'vue';
import {
  getEditorEmits,
  getNumberRangeProps,
  useFocusAndBlur,
  useNamespace,
} from '@ibiz-template/vue3-util';
import './ibiz-number-range-picker.scss';
import { toNumber } from 'lodash-es';
import { NumberRangeEditorController } from '../number-range-editor.controller';

/**
 * 移动端数值范围编辑框
 * @primary
 * @description 使用van-field组件，用于指定数值范围的场景。支持编辑器类型包含：`移动端数值范围编辑框`
 * @editorparams {name:maxValue,parameterType:string,defaultvalue:Infinity,description:最大值}
 * @editorparams {name:minValue,parameterType:string,defaultvalue:-Infinity,description:最小值}
 * @editorparams {name:valueSeparator,parameterType:string,defaultvalue:'-',description:值分割符}
 * @editorparams {name:rangeSeparator,parameterType:string,defaultvalue:'~',description:选择范围的分隔符}
 * @editorparams {name:startPlaceHolder,parameterType:string,defaultvalue:'',description:选择范围开始占位提示，van-field组件的placeholder属性}
 * @editorparams {name:endPlaceHolder,parameterType:string,defaultvalue:'',description:选择范围结束占位提示，van-field组件的placeholder属性}
 * @editorparams {name:precision,parameterType:number,defaultvalue:0,description:数值精度}
 * @ignoreprops  autoFocus | overflowMode
 * @ignoreemits  infoTextChange | enter
 */
export const IBizNumberRangePicker = defineComponent({
  name: 'IBizNumberRangePicker',
  props: getNumberRangeProps<NumberRangeEditorController>(),
  emits: getEditorEmits(),
  setup(props, { emit }) {
    const ns = useNamespace('number-range-picker');

    const c = props.controller;

    const editorModel = c.model;

    // 开始是否聚焦
    const startFocus = ref<boolean>(false);
    // 最大值
    let max = Infinity;
    // 最小值
    let min = -Infinity;
    // 数值精度
    let precision = 0;
    // 值分割符
    let valueSeparator = '-';
    // 开始占位提示
    let startPlaceHolder = '';
    // 结束占位提示
    let endPlaceHolder = '';
    // 选择范围时的分隔符
    let rangeSeparator = '~';
    if (editorModel.editorParams) {
      if (editorModel.editorParams.maxValue) {
        max = toNumber(editorModel.editorParams.maxValue);
      }
      if (editorModel.editorParams.minValue) {
        min = toNumber(editorModel.editorParams.minValue);
      }
      if (editorModel.editorParams.precision) {
        precision = toNumber(editorModel.editorParams.precision);
      }
      if (editorModel.editorParams.valueSeparator) {
        valueSeparator = editorModel.editorParams.valueSeparator;
      }
      if (editorModel.editorParams.startPlaceHolder) {
        startPlaceHolder = editorModel.editorParams.startPlaceHolder;
      }
      if (editorModel.editorParams.endPlaceHolder) {
        endPlaceHolder = editorModel.editorParams.endPlaceHolder;
      }
      if (editorModel.editorParams.rangeSeparator) {
        rangeSeparator = editorModel.editorParams.rangeSeparator;
      }
    }

    // 关系表单项集合
    const refFormItem: Ref<string[]> = ref([]);
    const editorItems = editorModel.editorItems;
    if (editorItems && editorItems.length > 0) {
      const editorItemNames: string[] = editorItems.map(
        (item: IData) => item.id,
      );
      refFormItem.value = editorItemNames;
    }

    // 范围最小值
    const minValue = ref<number | null>(null);

    // 范围最大值
    const maxValue = ref<number | null>(null);

    watch(
      () => props.value,
      (newVal, oldVal) => {
        if (newVal !== oldVal && typeof newVal === 'string') {
          minValue.value = newVal.split(valueSeparator)[0]
            ? Number(newVal.split(valueSeparator)[0])
            : null;
          maxValue.value = newVal.split(valueSeparator)[1]
            ? Number(newVal.split(valueSeparator)[1])
            : null;
        }
      },
      { immediate: true },
    );

    // 处理值变化
    const handleChange = (evt: IData, index: number) => {
      const value = evt.target.value;
      if (index === 0) {
        minValue.value = value;
      } else if (index === 1) {
        maxValue.value = value;
      }
      if (
        (minValue.value || Number(maxValue.value) === 0) &&
        (maxValue.value || Number(maxValue.value) === 0)
      ) {
        emit('change', [minValue.value, maxValue.value].join(valueSeparator));
      }
      if (refFormItem.value) {
        const valueName = refFormItem.value[index];
        emit('change', value, valueName);
      }
    };

    const handleFoucs = () => {
      startFocus.value = true;
      emit('focus');
    };

    const handleBlur = () => {
      startFocus.value = false;
      emit('blur');
    };
    // 聚焦失焦事件
    const { componentRef: editorRef } = useFocusAndBlur(
      handleFoucs,
      handleBlur,
    );

    const onClear = () => {
      const evt: IData = {
        target: {
          value: '',
        },
      };
      handleChange(evt, 0);
      handleChange(evt, 1);
    };

    const renderClear = () => {
      if (props.readonly || props.disabled) {
        return null;
      }
      if (
        !minValue.value &&
        minValue.value !== 0 &&
        !maxValue.value &&
        maxValue.value !== 0
      ) {
        return null;
      }
      if (!startFocus.value) return null;
      return (
        <van-icon
          class={ns.e('clear-icon')}
          name='clear'
          onClick={onClear}
        ></van-icon>
      );
    };

    return {
      ns,
      c,
      refFormItem,
      minValue,
      maxValue,
      handleChange,
      max,
      min,
      precision,
      valueSeparator,
      startPlaceHolder,
      endPlaceHolder,
      rangeSeparator,
      editorRef,
      renderClear,
    };
  },
  render() {
    return (
      <div
        class={[
          this.ns.b(),
          this.disabled ? this.ns.m('disabled') : '',
          this.readonly ? this.ns.m('readonly') : '',
        ]}
        ref='editorRef'
      >
        <van-field
          modelValue={this.minValue}
          disabled={this.disabled}
          readonly={this.readonly}
          placeholder={this.startPlaceHolder}
          type='number'
          class={this.ns.e('start')}
          onInput={(val: IData) => this.handleChange(val, 0)}
        ></van-field>
        <div class={this.ns.b('separator')}>{this.rangeSeparator}</div>
        <van-field
          type='number'
          modelValue={this.maxValue}
          disabled={this.disabled}
          readonly={this.readonly}
          placeholder={this.endPlaceHolder}
          class={this.ns.e('end')}
          onInput={(val: IData) => this.handleChange(val, 1)}
        ></van-field>
        {this.renderClear()}
      </div>
    );
  },
});
