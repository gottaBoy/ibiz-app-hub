/* eslint-disable no-nested-ternary */
/* eslint-disable no-shadow */
/* eslint-disable no-plusplus */
/* eslint-disable no-restricted-syntax */
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
 * @editorparams {name:valueseparator,parameterType:string,defaultvalue:'-',description:值分隔符}
 * @editorparams {name:rangeseparator,parameterType:string,defaultvalue:'~',description:选择范围时的分隔符}
 * @editorparams {name:startplaceholder,parameterType:string,defaultvalue:'',description:选择范围开始占位提示，van-field组件的placeholder属性}
 * @editorparams {name:endplaceholder,parameterType:string,defaultvalue:'',description:选择范围结束占位提示，van-field组件的placeholder属性}
 * @editorparams {"name":"triggermode","parameterType":"'blur' | 'input'","defaultvalue":"'blur'","description":"指定编辑器触发 `change` 值变更事件的模式，input: 输入框输入时触发事件，blur：输入框blur时触发事件"}
 * @editorparams {name:readonly,parameterType:boolean,defaultvalue:false,description:设置编辑器是否为只读态}
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
      if (editorModel.editorParams.maxvalue) {
        max = toNumber(editorModel.editorParams.maxvalue);
      }
      if (editorModel.editorParams.minValue) {
        min = toNumber(editorModel.editorParams.minValue);
      }
      if (editorModel.editorParams.minvalue) {
        min = toNumber(editorModel.editorParams.minvalue);
      }
      if (editorModel.editorParams.precision) {
        precision = toNumber(editorModel.editorParams.precision);
      }
      if (editorModel.editorParams.valueSeparator) {
        valueSeparator = editorModel.editorParams.valueSeparator;
      }
      if (editorModel.editorParams.valueseparator) {
        valueSeparator = editorModel.editorParams.valueseparator;
      }
      if (editorModel.editorParams.startPlaceHolder) {
        startPlaceHolder = editorModel.editorParams.startPlaceHolder;
      }
      if (editorModel.editorParams.startplaceholder) {
        startPlaceHolder = editorModel.editorParams.startplaceholder;
      }
      if (editorModel.editorParams.endPlaceHolder) {
        endPlaceHolder = editorModel.editorParams.endPlaceHolder;
      }
      if (editorModel.editorParams.endplaceholder) {
        endPlaceHolder = editorModel.editorParams.endplaceholder;
      }
      if (editorModel.editorParams.rangeSeparator) {
        rangeSeparator = editorModel.editorParams.rangeSeparator;
      }
      if (editorModel.editorParams.rangeseparator) {
        rangeSeparator = editorModel.editorParams.rangeseparator;
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
    const minValue = ref<number | null | string>(null);

    // 范围最大值
    const maxValue = ref<number | null | string>(null);

    let blurCacheMinValue: number | null;
    let blurCacheMaxValue: number | null;

    const numberToString = (num: string | number | null) => {
      if (num === null) return null;
      // 核心判断：-0 的特征是 数值为0 且 1/num === -Infinity
      if (num === 0 && 1 / num === -Infinity) {
        return '-0';
      }
      // 其他数值正常转字符串
      return String(num);
    };

    const getCurValue = (): string => {
      const value = [
        `${numberToString(minValue.value)}`,
        `${numberToString(maxValue.value)}`,
      ].join(valueSeparator);
      return value === valueSeparator ? '' : value;
    };

    const getCacheValue = (): string => {
      const value = [
        `${numberToString(blurCacheMinValue)}`,
        `${numberToString(blurCacheMaxValue)}`,
      ].join(valueSeparator);
      return value === valueSeparator ? '' : value;
    };

    const formatValue = (value: string): [number | null, number | null] => {
      const trimmed = value.trim();

      if (!trimmed) return [null, null];

      // 获取所有 分隔符 的位置
      const dashIndices: number[] = [];
      for (let i = 0; i < trimmed.length; i++) {
        if (trimmed[i] === valueSeparator) {
          dashIndices.push(i);
        }
      }

      // 如果没有 分隔符，无效
      if (dashIndices.length === 0) {
        return [null, null];
      }

      const parsePart = (s: string): number | null => {
        s = s.trim();
        if (s === 'null' || s === '') return null;
        const num = Number(s);
        return Number.isNaN(num) ? null : num;
      };

      const isValidPart = (s: string): boolean => {
        const parsed = parsePart(s);
        return parsed !== null || s.trim() === 'null' || s.trim() === '';
      };

      let validSplitIndex: number | null = null;
      let validCount = 0;

      // 尝试每个分隔符
      for (const idx of dashIndices) {
        const left = trimmed.slice(0, idx);
        const right = trimmed.slice(idx + 1);

        if (isValidPart(left) && isValidPart(right)) {
          validCount++;
          validSplitIndex = idx;
          // 如果已经找到多个合法分割点，提前退出
          if (validCount > 1) break;
        }
      }

      // 必须有且仅有一个合法分隔符
      if (validCount !== 1 || validSplitIndex === null) {
        return [null, null];
      }

      const min = parsePart(trimmed.slice(0, validSplitIndex));
      const max = parsePart(trimmed.slice(validSplitIndex + 1));

      return [min, max];
    };

    watch(
      () => props.value,
      (newVal, oldVal) => {
        if (newVal !== oldVal && typeof newVal === 'string') {
          const [tempMin, tempMax] = formatValue(newVal);
          minValue.value = tempMin;
          maxValue.value = tempMax;
          blurCacheMinValue = minValue.value;
          blurCacheMaxValue = maxValue.value;
        }
      },
      { immediate: true },
    );

    const onEmit = (
      value: number | string | null,
      valueName?: string,
      eventName: string = 'blur',
    ) => {
      if (eventName === c.triggerMode) {
        emit('change', value, valueName);
      }
    };

    // 处理值变化
    const handleChange = (evt: IData, index: number) => {
      const value =
        evt.target.value === ''
          ? null
          : evt.target.value === '-'
            ? evt.target.value
            : Number(evt.target.value);
      if (index === 0) {
        minValue.value = value;
      } else if (index === 1) {
        maxValue.value = value;
      }

      if (getCurValue() !== getCacheValue()) {
        onEmit(getCurValue(), undefined, 'input');
      }

      // 缓存值相同
      if (
        (index === 0 && value === blurCacheMinValue) ||
        (index === 1 && value === blurCacheMaxValue)
      )
        return;

      // 值项触发事件
      const valueName = refFormItem.value[index];
      if (valueName) {
        onEmit(value, valueName, 'input');
      }

      // 缓存值
      if (index === 0) {
        blurCacheMinValue = value;
      } else if (index === 1) {
        blurCacheMaxValue = value;
      }
    };

    const handleFoucs = () => {
      startFocus.value = true;
      emit('focus');
    };

    const handleBlur = () => {
      if (getCurValue() !== props.value) {
        onEmit(getCurValue(), undefined);
      }
      const [minValueName, maxValueName] = refFormItem.value;
      if (minValueName && minValue.value !== props.data[minValueName]) {
        let tempMinValue = minValue.value;
        if (minValue.value === '-') {
          tempMinValue = null;
        }
        onEmit(tempMinValue, minValueName);
      }
      if (maxValueName && maxValue.value !== props.data[maxValueName]) {
        let tempMaxValue = maxValue.value;
        if (maxValue.value === '-') {
          tempMaxValue = null;
        }
        onEmit(tempMaxValue, maxValueName);
      }

      startFocus.value = false;
      emit('blur');
    };
    // 聚焦失焦事件
    const { componentRef: editorRef } = useFocusAndBlur(
      handleFoucs,
      handleBlur,
    );

    const onClear = () => {
      onEmit('', undefined, c.triggerMode);
      const [minValueName, maxValueName] = refFormItem.value;
      if (minValueName) {
        onEmit(null, minValueName, c.triggerMode);
      }
      if (maxValueName) {
        onEmit(null, maxValueName, c.triggerMode);
      }
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
      numberToString,
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
          modelValue={this.numberToString(this.minValue)}
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
          modelValue={this.numberToString(this.maxValue)}
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
