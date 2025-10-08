/* eslint-disable no-new */
import { computed, defineComponent, onMounted, Ref, ref } from 'vue';
import {
  getEditorEmits,
  getDateRangeProps,
  useNamespace,
} from '@ibiz-template/vue3-util';
import './ibiz-date-range-picker.scss';
import RollDate from 'ibiz-mob-rolldate';
import dayjs from 'dayjs';
import { DateRangeEditorController } from '../date-range-editor.controller';
import { usePopstateListener } from '../../../util';
import { IBizDateRangeCalendar } from '../../../common/date-range-picker/date-range-picker';

/**
 * 移动端时间范围选择器
 * @primary
 * @description  基于rolldate的轻量时间范围选择器，类型为CALENDAR时，使用van-calendar组件，默认支持年月日的时间范围选择。支持编辑器类型包含: `移动端时间范围选择器`、`移动端时间范围选择器（YYYY-MM-DD）`
 * @editorparams {name:SHOWMODE,parameterType:'DEFAULT' | 'CALENDAR',defaultvalue:'DEFALUIT',description:显示模式，值为CALENDAR时，使用日历组件来选择日期范围，值为DEFAULT时，绘制两个时间选择器来绘制日期范围}
 * @editorparams {name:rangeSeparator,parameterType:string,defaultvalue:'~',description:选择范围时的分隔符}
 * @editorparams {name:valueSeparator,parameterType:string,defaultvalue:'',description:值分割符}
 * @editorparams {name:startPlaceHolder,parameterType:string,defaultvalue:'',description:选择范围开始占位提示}
 * @editorparams {name:endPlaceHolder,parameterType:string,defaultvalue:'',description:选择范围结束占位提示}
 * @ignoreprops  autoFocus | overflowMode
 * @ignoreemits  infoTextChange | enter
 */
export const IBizDateRangePicker = defineComponent({
  name: 'IBizDateRangePicker',
  props: getDateRangeProps<DateRangeEditorController>(),
  emits: getEditorEmits(),
  setup(props, { emit }) {
    const ns = useNamespace('date-range-picker');

    const c = props.controller;

    const editorModel = c.model;
    // 当前年
    const currentYear = dayjs().year();

    // 日期开始年份
    const beginYear = currentYear - 100;

    // 日期结束年份
    const endYear = currentYear + 100;

    // 分钟按指定数分隔
    const minStep = 1;
    // 数据
    let items: string[] = [];
    // 时间选择器文本
    const lang = {
      title: ibiz.i18n.t('editor.datePicker.title'),
      cancel: ibiz.i18n.t('editor.datePicker.clear'),
      confirm: ibiz.i18n.t('editor.datePicker.confirm'),
      year: ibiz.i18n.t('editor.datePicker.year'),
      month: ibiz.i18n.t('editor.datePicker.month'),
      day: ibiz.i18n.t('editor.datePicker.day'),
      hour: ibiz.i18n.t('editor.datePicker.hour'),
      min: ibiz.i18n.t('editor.datePicker.min'),
      sec: ibiz.i18n.t('editor.datePicker.sec'),
    };
    // 值分割符
    let valueSeparator = ',';

    // 开始占位提示
    let startPlaceHolder = '';
    // 结束占位提示
    let endPlaceHolder = '';
    // 选择范围时的分隔符
    let rangeSeparator = '~';

    // 开始时间
    const startDate = ref('');

    // 显示模式
    const showmode = c.showmode;

    // 日历选择模态是否显示
    const show = ref(false);

    // 编辑器dom
    const startEditorRef = ref();
    const endEditorRef = ref();

    if (editorModel.editorParams) {
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

    // 格式
    const format = ref('YYYY-MM-DD');
    // 值格式化
    const valueFormat = c!.valueFormat;
    if (valueFormat) {
      format.value = valueFormat;
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
    // 开始时间、结束时间 数组
    const valueArray = computed(() => {
      if (refFormItem.value && refFormItem.value.length > 0) {
        const array = refFormItem.value.map((name: string) => {
          return props.data[name] || '';
        });
        return array;
      }
      if (props.value && typeof props.value === 'string') {
        items = props.value.split(valueSeparator);
        return props.value.split(valueSeparator);
      }
      return [];
    });
    // 开始值
    const startFormatValue = computed(() => {
      return valueArray.value?.[0] || startDate.value || '';
    });

    // 结束值
    const endFormatValue = computed(() => {
      return valueArray.value?.[1] || '';
    });

    // 拼接开始和结束值
    const rangeText = computed(() => {
      if (valueArray.value[0] === '' && valueArray.value[1] === '') {
        return '';
      }
      return valueArray.value.join(' ~ ');
    });

    // 聚焦
    const onFocus = () => {
      emit('focus');
    };

    // 失焦
    const onBlur = () => {
      emit('blur');
    };

    // 处理值变更
    const onConfirm = (value: string, index: number) => {
      const formatVal = dayjs(value).format(format.value);
      if (format.value && formatVal !== 'Invalid Date') {
        items[index] = formatVal;
      } else {
        items[index] = value;
      }
      startDate.value = items[0];
      if (items.length === 2) {
        emit('change', items.join(valueSeparator));
      }
      if (refFormItem.value) {
        const valueName = refFormItem.value[index];
        if (valueName) {
          emit('change', value, valueName);
        }
      }
    };

    // 取消
    const onCancel = (event: PointerEvent, index: number) => {
      const targetClass = (event?.target as HTMLElement)?.classList.value;
      if (targetClass && targetClass.includes('rolldate-cancel')) {
        // 点击的清除按钮
        onConfirm('', index);
      }
    };

    onMounted(() => {
      const rollDateOpt = {
        format: format.value,
        beginYear,
        endYear,
        minStep,
        lang,
        trigger: 'click',
        init: () => {
          if (props.disabled || props.readonly) {
            return false;
          }
        },
      };
      const el = startEditorRef.value;
      if (el) {
        new RollDate({
          el,
          value: startFormatValue.value,
          confirm: (value: string) => {
            onConfirm(value, 0);
            return value;
          },
          cancel: (event: PointerEvent) => {
            onCancel(event, 0);
          },
          ...rollDateOpt,
        });
      }
      const el2 = endEditorRef.value;
      if (el2) {
        new RollDate({
          el: el2,
          value: endFormatValue.value,
          confirm: (value: string) => {
            onConfirm(value, 1);
            return value;
          },
          cancel: (event: PointerEvent) => {
            onCancel(event, 1);
          },
          ...rollDateOpt,
        });
      }
    });

    const closeDrawer = () => {
      startEditorRef.value?.hide?.();
      endEditorRef.value?.hide?.();
    };

    // 监听popstate事件
    usePopstateListener(closeDrawer);

    // 绘制隐藏元素，用于撑开父元素高度，使输入框根据父元素自适应宽度
    const expandHidden = (text: string) => {
      return <span class={ns.e('expand-hidden')}>{text}</span>;
    };

    // 取消
    const onClose = () => {
      show.value = false;
    };
    const onSave = (valueArr: string[]) => {
      // 保存
      valueArr.forEach((value: string, index: number) => {
        onConfirm(value, index);
      });
      show.value = false;
    };

    // 绘制模态打开
    const renderCalendarMode = () => {
      return (
        <van-popup
          v-model:show={show.value}
          position='left'
          style={{ height: '100%' }}
        >
          {{
            default: () => {
              return (
                <IBizDateRangeCalendar
                  value={valueArray.value}
                  onCancel={onClose}
                  onSave={onSave}
                ></IBizDateRangeCalendar>
              );
            },
          }}
        </van-popup>
      );
    };

    // 打开日历选择
    const openCalendar = () => {
      show.value = true;
    };

    return {
      ns,
      c,
      refFormItem,
      format,
      valueSeparator,
      startPlaceHolder,
      endPlaceHolder,
      rangeSeparator,
      startEditorRef,
      endEditorRef,
      endFormatValue,
      startFormatValue,
      rangeText,
      showmode,
      openCalendar,
      renderCalendarMode,
      onFocus,
      onBlur,
      expandHidden,
    };
  },
  render() {
    if (this.showmode === 'CALENDAR') {
      return (
        <div
          class={[
            this.ns.b(),
            this.disabled ? this.ns.m('disabled') : '',
            this.readonly ? this.ns.m('readonly') : '',
          ]}
        >
          <van-field
            class={this.ns.e('calendar-input')}
            disabled={this.disabled}
            type='text'
            v-model={this.rangeText}
            readonly
            placeholder={this.c.placeHolder}
            onClick={this.openCalendar}
          ></van-field>
          {this.renderCalendarMode()}
        </div>
      );
    }
    return (
      <div
        class={[
          this.ns.b(),
          this.disabled ? this.ns.m('disabled') : '',
          this.readonly ? this.ns.m('readonly') : '',
        ]}
      >
        <div class={[this.ns.e('content'), this.ns.is('start', true)]}>
          {this.expandHidden(this.startFormatValue || this.startPlaceHolder)}
          <van-field class={this.ns.e('input')}>
            {{
              input: (
                <input
                  ref='startEditorRef'
                  type='text'
                  value={this.startFormatValue}
                  placeholder={this.startPlaceHolder}
                  onBlur={this.onBlur}
                  onFocus={this.onFocus}
                  disabled={this.disabled}
                  readonly={this.readonly}
                />
              ),
            }}
          </van-field>
        </div>
        <div class={this.ns.b('separator')}>{this.rangeSeparator}</div>
        <div class={[this.ns.e('content'), this.ns.is('end', true)]}>
          {this.expandHidden(this.endFormatValue || this.endPlaceHolder)}
          <van-field class={this.ns.e('input')}>
            {{
              input: (
                <input
                  ref='endEditorRef'
                  type='text'
                  value={this.endFormatValue}
                  placeholder={this.endPlaceHolder}
                  onBlur={this.onBlur}
                  onFocus={this.onFocus}
                  disabled={this.disabled}
                  readonly={this.readonly}
                />
              ),
            }}
          </van-field>
        </div>
      </div>
    );
  },
});
