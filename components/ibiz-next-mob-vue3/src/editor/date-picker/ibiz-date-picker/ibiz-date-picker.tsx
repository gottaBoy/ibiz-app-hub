/* eslint-disable no-nested-ternary */
import { ref, watch, defineComponent, onMounted, Ref } from 'vue';
import {
  getDatePickerProps,
  getEditorEmits,
  useNamespace,
} from '@ibiz-template/vue3-util';
import './ibiz-date-picker.scss';
import dayjs from 'dayjs';
import RollDate from 'ibiz-mob-rolldate';
import { DatePickerEditorController } from '../date-picker-editor.controller';
import { IBizCommonRightIcon } from '../../common/right-icon/right-icon';
import { usePopstateListener } from '../../../util';

/**
 * 移动端时间选择器
 * @primary
 * @description  基于rolldate的轻量时间选择器，默认时间格式为年月日-时分秒，可通过配置值格式化串来格式化日期。支持编辑器类型包含: `移动端时间选择器`、`移动端时间选择器（YYYY-MM-DD HH）`、`移动端时间选择器（YYYY-MM-DD HH:mm）`、`移动端时间选择器（HH:mm:ss）`、`移动端时间选择器（HH:mm）`、`移动端时间选择器（YYYY-MM-DD）`、`移动端时间选择器（YYYY-MM-DD HH:mm:ss）`
 * @ignoreprops  autoFocus | overflowMode
 * @ignoreemits  infoTextChange | enter
 */
export const IBizDatePicker = defineComponent({
  name: 'IBizDatePicker',
  props: getDatePickerProps<DatePickerEditorController>(),
  emits: getEditorEmits(),
  setup(props, { emit }) {
    const ns = useNamespace('date-picker');
    const c = props.controller;

    const editorModel = c!.model;

    // 当前年
    const currentYear = dayjs().year();

    // 日期开始年份
    const beginYear = currentYear - 100;

    // 日期结束年份
    const endYear = currentYear + 100;

    // 分钟按指定数分隔
    const minStep = 1;

    // 时间选择器实例
    const rollDateInstance: Ref<IData | null> = ref(null);

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

    // 编辑器dom
    const editorRef = ref();

    // 组件所需格式化
    const format = ref('YYYY-MM-DD hh:mm:ss');

    // 值格式化以模型为主
    const valueFormat = c!.valueFormat;
    if (valueFormat) {
      format.value = valueFormat;
    }

    // 格式化后的值
    const formatValue = ref();

    watch(
      () => props.value,
      (newVal, oldVal) => {
        // 空值不转换
        if (newVal) {
          if (newVal !== oldVal) {
            const formatVal = dayjs(newVal).format(format.value);
            if (formatVal !== 'Invalid Date') {
              formatValue.value = formatVal;
            } else {
              formatValue.value = newVal;
            }
          }
        } else {
          formatValue.value = '';
        }
      },
      { immediate: true },
    );

    // 处理值变更
    const onConfirm = (value: string) => {
      emit('change', value);
    };

    // 聚焦
    const onFocus = () => {
      emit('focus');
    };

    // 失焦
    const onBlur = () => {
      emit('blur');
    };

    const onCancel = (event: PointerEvent) => {
      const targetClass = (event?.target as HTMLElement)?.classList.value;
      if (targetClass && targetClass.includes('rolldate-cancel')) {
        // 点击的清除按钮
        emit('change', null);
      }
    };

    // 页面关闭时关闭时间选择抽屉
    const closeDrawer = () => {
      if (rollDateInstance.value) {
        rollDateInstance.value.hide?.();
      }
    };

    // 监听popstate事件
    usePopstateListener(closeDrawer);

    onMounted(() => {
      const el = editorRef.value;
      if (el) {
        rollDateInstance.value = new RollDate({
          el,
          format: format.value,
          beginYear,
          endYear,
          minStep,
          lang,
          trigger: 'click',
          value: formatValue.value,
          confirm: (value: string) => {
            onConfirm(value);
            return value;
          },
          cancel: (event: PointerEvent) => {
            onCancel(event);
          },
          init: () => {
            if (props.disabled || props.readonly) {
              return false;
            }
          },
        });
      }
    });

    return {
      ns,
      c,
      editorModel,
      format,
      formatValue,
      onFocus,
      onBlur,
      editorRef,
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
      >
        {this.readonly
          ? this.formatValue
          : [
              <van-field>
                {{
                  input: (
                    <input
                      ref='editorRef'
                      type='text'
                      value={this.formatValue}
                      placeholder={this.c.placeHolder}
                      onBlur={this.onBlur}
                      onFocus={this.onFocus}
                      disabled={this.disabled}
                      readonly={this.readonly}
                    />
                  ),
                  'right-icon': <IBizCommonRightIcon></IBizCommonRightIcon>,
                }}
              </van-field>,
            ]}
      </div>
    );
  },
});
