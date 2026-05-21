import { computed, defineComponent, ref, watch } from 'vue';
import {
  getEditorEmits,
  getSliderProps,
  useFocusAndBlur,
  useNamespace,
  useFilterAttribute,
} from '@ibiz-template/vue3-util';
import { toNumber } from 'lodash-es';
import { SliderEditorController } from '../slider-editor.controller';
import './ibiz-slider.scss';

/**
 * 移动端滑动输入条
 * @primary
 * @description 使用van-slider组件，用于在给定的范围内选择一个值的场景。支持编辑器类型包含：`移动端滑动输入条`
 * @editorparams {name:stepvalue,parameterType:number,defaultvalue:1,description:步长，van-slider组件的step属性}
 * @editorparams {name:maxvalue,parameterType:number,defaultvalue:100,description:最大值，van-slider组件的max属性}
 * @editorparams {name:minvalue,parameterType:number,defaultvalue:0,description:最小值，van-slider组件的min属性}
 * @editorparams {name:range,parameterType:boolean,defaultvalue:false,description:是否开启双滑块模式，van-slider组件的range属性}
 * @editorparams {name:type,parameterType:'line' | 'circle',defaultvalue:'line',description:进度条类型，可选值为line（线形）或circle（环形）}
 * @editorparams {name:textitem,parameterType:string,description:环形时显示的文本属性}
 * @editorparams {name:showtext,parameterType:boolean,defaultvalue:false,description:环形时是否显示文本}
 * @editorparams {name:format,parameterType:string,defaultvalue:'0%',description:环形时显示文本的格式化规则}
 * @editorparams {name:readonly,parameterType:boolean,defaultvalue:false,description:设置编辑器是否为只读态}
 * @ignoreprops  autoFocus | overflowMode
 * @ignoreemits  blur | focus | infoTextChange | enter
 */
export const IBizSlider = defineComponent({
  name: 'IBizSlider',
  props: getSliderProps<SliderEditorController>(),
  emits: getEditorEmits(),
  setup(props, { emit }) {
    const ns = useNamespace('slider');
    const c = props.controller;
    const editorModel = c.model;
    const { valueFormat } = c.parent;
    // 步长
    let step = 1;
    // 设置滑动输入条允许的最大值
    let max = 100;
    // 设置滑动输入条允许的最小值
    let min = 0;
    // 是否开启选择范围
    let range = false;
    // 文本显示属性
    let textItem = '';
    // 是否显示百分比
    let showText = false;
    // 格式化
    let format = valueFormat || '0%';
    // 进度条类型
    let type = 'line';
    // 环状进度条直径，仅type等于circle时有效
    const circleSize = 40;
    // 环形进度条动画值
    const currtval = ref(0);
    if (editorModel.editorParams) {
      if (editorModel.editorParams.stepValue) {
        step = toNumber(editorModel.editorParams.stepValue);
      }
      if (editorModel.editorParams.stepvalue) {
        step = toNumber(editorModel.editorParams.stepvalue);
      }
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
      if (editorModel.editorParams.range) {
        range = c.toBoolean(editorModel.editorParams.range);
      }
      if (editorModel.editorParams.type) {
        type = editorModel.editorParams.type;
      }
      if (editorModel.editorParams.textItem) {
        textItem = editorModel.editorParams.textItem;
      }
      if (editorModel.editorParams.textitem) {
        textItem = editorModel.editorParams.textitem;
      }
      if (editorModel.editorParams.showText) {
        showText = c.toBoolean(editorModel.editorParams.showText);
      }
      if (editorModel.editorParams.showtext) {
        showText = c.toBoolean(editorModel.editorParams.showtext);
      }
      if (editorModel.editorParams.format) {
        format = editorModel.editorParams.format;
      }
      // if (editorModel.editorParams.circleSize) {
      //   circleSize = toNumber(editorModel.editorParams.circleSize);
      // }
    }

    // 当前值
    const currentVal = ref<number | Array<number>>(0);

    // 聚焦失焦事件
    const { componentRef: editorRef } = useFocusAndBlur(
      () => emit('focus'),
      () => emit('blur'),
    );

    // 处理线型进度条数据
    const handleLineVal = (val: string | number) => {
      // 如果是范围解析JSON成数组
      // eslint-disable-next-line no-lonely-if
      if (range) {
        return JSON.parse(val as string);
      }
      return Number(val) as number;
    };

    // 处理当前值
    const handleCurVal = (val: string | number) => {
      switch (type) {
        case 'line':
          return handleLineVal(val);
        default:
          return val;
      }
    };

    watch(
      () => props.value,
      (newVal, oldVal) => {
        if (newVal !== oldVal) {
          if (newVal === null || newVal === undefined) {
            // 如果是范围给数组
            if (range) {
              currentVal.value = [0, 1];
            } else {
              currentVal.value = 0;
            }
          } else {
            // 如果是范围解析JSON成数组
            currentVal.value = handleCurVal(newVal);
          }
        }
      },
      { immediate: true },
    );

    // 计算文本显示值
    const textVal = computed(() => {
      if (textItem) {
        const data = props.data || {};
        if (data[textItem]) {
          return ibiz.util.text.format(`${data[textItem]}`, format);
        }
      }
      const tempCurVal = Number(currentVal.value);
      const value = Number(tempCurVal / max);
      const formatValue = ibiz.util.text.format(`${value}`, format);
      return formatValue;
    });

    // 处理值改变
    const handleChange = (currentValue: number | undefined | Array<number>) => {
      if (Array.isArray(currentValue)) {
        emit('change', JSON.stringify(currentValue));
      } else {
        emit('change', currentValue);
      }
    };

    return {
      ns,
      currentVal,
      handleChange,
      step,
      type,
      max,
      min,
      textItem,
      currtval,
      range,
      textVal,
      showText,
      editorRef,
      circleSize,
    };
  },
  render() {
    let content = null;
    if (this.type === 'line') {
      content = (
        <van-slider
          v-model={this.currentVal}
          disabled={this.disabled || this.readonly}
          step={this.step}
          max={this.max}
          min={this.min}
          range={this.range}
          onChange={this.handleChange}
          {...useFilterAttribute(this.$attrs)}
        >
          {{
            button: () => {
              return <div class={this.ns.b('button')}>{this.currentVal}</div>;
            },
            'left-button': () => {
              return (
                <div class={this.ns.b('button')}>
                  {Array.isArray(this.currentVal)
                    ? this.currentVal[0]
                    : this.currentVal}
                </div>
              );
            },
            'right-button': () => {
              return (
                <div class={this.ns.b('button')}>
                  {Array.isArray(this.currentVal)
                    ? this.currentVal[1]
                    : this.currentVal}
                </div>
              );
            },
          }}
        </van-slider>
      );
    }
    if (this.type === 'circle') {
      content = (
        <van-circle
          v-model:current-rate={this.currtval}
          rate={this.currentVal} // 显示值
          size={this.circleSize} // 显示直径
          layer-color='lightgray'
          stroke-width='100'
          {...useFilterAttribute(this.$attrs)}
        >
          {{
            default: () => {
              if (!this.showText) {
                return '';
              }
              let text = String(this.currentVal as number);
              if (this.textItem) {
                text = this.textVal;
              }
              return <div class={this.ns.em('circle', 'text')}>{text}</div>;
            },
          }}
        </van-circle>
      );
    }
    return (
      <div class={[this.ns.b(), this.ns.e(this.type)]} ref='editorRef'>
        {content}
      </div>
    );
  },
});
