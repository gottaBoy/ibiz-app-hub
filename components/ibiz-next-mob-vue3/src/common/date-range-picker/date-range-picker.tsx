/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-param-reassign */
import {
  computed,
  defineComponent,
  nextTick,
  onMounted,
  PropType,
  Ref,
  ref,
  watch,
} from 'vue';
import { useNamespace, useFilterAttribute } from '@ibiz-template/vue3-util';
import dayjs from 'dayjs';
import './date-range-picker.scss';
import { RangePicker } from './components/range-picker/range-picker';
import { SinglePicker } from './components/single-picker/single-picker';

export const IBizDateRangeCalendar = defineComponent({
  name: 'IBizDateRangeCalendar',
  components: {
    RangePicker,
    SinglePicker,
  },
  props: {
    type: {
      // range 表示是日期范围选择，single表示是单个日期选择，两种方式抛出值的时候如果无值，抛的就是undefined,有值的话抛的都是数组
      type: String as PropType<'range' | 'single'>,
      default: 'range',
    },
    // 回显值
    value: {
      type: Array<string>,
      default: null,
    },
    // 格式化串，会将格式化之后的值返回回去
    format: {
      type: String,
      default: 'YYYY-MM-DD',
    },
    // 时间选择范围，默认前后10年
    range: {
      type: Number,
      default: 10,
    },
    // 允许编辑模式
    enableEdit: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['cancel', 'save'],
  setup(props, { emit }) {
    const ns = useNamespace('calendar-date-range-picker');
    // 最大可选时间-当前时间往后10年
    const maxDate = new Date(`${new Date().getFullYear() + props.range}`);
    // 最小可选时间-当前时间往前10年
    const minDate = new Date(`${new Date().getFullYear() - props.range}`);

    // 范围选择时选中值
    const select: Ref<string[]> = ref([]);

    // 允许保存
    const allowSave = ref(false);

    // 日历实例
    const calendarRef = ref();

    // 是否编辑态-可手动输入
    const isEditable = ref(false);

    // 取消，不返回数据
    const onCancel = () => {
      emit('cancel');
    };

    // 保存，抛出当前选择值
    const onSave = () => {
      if (!allowSave.value) {
        return;
      }
      emit('save', select.value);
    };

    // 日历完整选择数据后抛出事件
    const onConfirm = (value: Date | Date[]) => {
      allowSave.value = true;
      if (Array.isArray(value)) {
        select.value = value.map((_item: Date) => {
          return dayjs(_item).format(props.format);
        });
      }
      if (!props.enableEdit) {
        onSave();
      }
    };

    /**
     * 日历点击选中一个日期时触发
     *
     * @param {(Date | Date[])} value
     */
    const onSelect = (_value: Date | Date[]) => {
      if (props.type === 'range') {
        // 范围选择时单击清空select.value
        allowSave.value = false;
        select.value = [];
      } else {
        allowSave.value = true;
        select.value = [dayjs(_value as Date).format(props.format)];
      }
    };

    watch(
      () => props.value,
      () => {
        if (
          !props.value ||
          !Array.isArray(props.value) ||
          props.value.length === 0
        ) {
          allowSave.value = false;
          select.value = [];
        } else {
          select.value = props.value;
          allowSave.value = true;
        }
      },
      {
        immediate: true,
        deep: true,
      },
    );

    /**
     * 计算默认选中
     *
     * @return {*}
     */
    const calcDefaultSelect = computed(() => {
      if (props.type === 'range') {
        if (
          !select.value ||
          !Array.isArray(select.value) ||
          select.value.length === 0 ||
          select.value[0] === '' ||
          select.value[1] === ''
        ) {
          return null;
        }
        return select.value.map((_item: string) => {
          return new Date(dayjs(_item).format('YYYY/M/D'));
        });
      }
      if (select.value && select.value[0]) {
        return new Date(dayjs(select.value[0]).format('YYYY/M/D'));
      }
      return null;
    });

    /**
     * 格式化开始时间
     *
     * @return {*}
     */
    const formatStartDate = () => {
      if (!select.value[0]) {
        return ibiz.i18n.t('component.dateRangePicker.startDate');
      }
      return dayjs(select.value[0]).format(props.format);
    };

    /**
     * 格式化结束时间
     *
     * @return {*}
     */
    const formatEndDate = () => {
      if (!select.value[1]) {
        return ibiz.i18n.t('component.dateRangePicker.endDate');
      }
      return dayjs(select.value[1]).format(props.format);
    };

    /**
     * 切换编辑态
     *
     */
    const switchEdit = () => {
      isEditable.value = !isEditable.value;
      if (!isEditable.value) {
        nextTick(() => {
          if (calendarRef.value) {
            if (!select.value[0]) {
              calendarRef.value.scrollToDate(new Date());
            } else {
              calendarRef.value.scrollToDate(
                new Date(dayjs(select.value[0]).format('YYYY/M/D')),
              );
            }
          }
        });
      }
    };

    // 值抛出
    const onChange = (value: string[]) => {
      select.value = value;
    };

    /**
     * 格式化单选日期
     *
     */
    const formatSingleDate = () => {
      if (!select.value[0]) {
        return ibiz.i18n.t('component.dateRangePicker.noSelect');
      }
      return dayjs(select.value[0]).format(props.format);
    };

    /**
     * 绘制可手动输入日期的input
     *
     * @return {*}
     */
    const renderCalendarInput = () => {
      if (props.type === 'range') {
        return (
          <RangePicker
            value={select.value}
            range={props.range}
            format={props.format}
            onChange={onChange}
          ></RangePicker>
        );
      }
      return (
        <SinglePicker
          value={select.value}
          range={props.range}
          format={props.format}
          onChange={onChange}
        ></SinglePicker>
      );
    };

    /**
     * 格式化日历时间，标记出今天
     *
     * @param {IData} day
     * @return {*}
     */
    const formatter = (day: IData) => {
      const year = day.date.getFullYear();
      const month = day.date.getMonth() + 1;
      const date = day.date.getDate();

      const curDate = new Date();
      const curYear = curDate.getFullYear();
      const curMonth = curDate.getMonth() + 1;
      const curday = curDate.getDate();

      if (year === curYear && month === curMonth && date === curday) {
        day.text = (
          <div class={ns.be('calendar', 'today')}>
            <span class={ns.bem('calendar', 'today', 'date')}>{curday}</span>
            <div class={ns.bem('calendar', 'today', 'bottom-info')}>
              {ibiz.i18n.t('component.dateRangePicker.today')}
            </div>
          </div>
        );
      }

      return day;
    };

    onMounted(() => {
      nextTick(() => {
        if (calendarRef.value) {
          if (!select.value[0]) {
            calendarRef.value.scrollToDate(new Date());
          } else {
            // 跳转到开始时间
            calendarRef.value.scrollToDate?.(
              new Date(dayjs(select.value[0]).format('YYYY/M/D')),
            );
          }
        }
      });
    });

    // 清除
    const onClear = () => {
      if (props.type === 'range') {
        select.value = ['', ''];
      } else {
        select.value = [];
      }
    };

    // 绘制单个显示
    const renderSingleText = () => {
      return (
        <div class={ns.e('single-text')}>
          <span class={ns.em('single-text', 'placeholder')}>
            {ibiz.i18n.t('component.dateRangePicker.selectDate')}
          </span>
          <div class={ns.em('single-text', 'date')}>
            <div class={ns.em('single-text', 'date-text')}>
              <span>{formatSingleDate()}</span>
            </div>
            <div class={ns.em('single-text', 'icons')}>
              <span onClick={onClear}>
                <van-icon name='close' />
              </span>
              <span onClick={switchEdit}>
                {!isEditable.value ? (
                  <van-icon name='edit' />
                ) : (
                  <van-icon name='calendar-o' />
                )}
              </span>
            </div>
          </div>
        </div>
      );
    };

    // 绘制范围选择显示
    const renderSelectRange = () => {
      if (props.type === 'range') {
        return (
          <div class={ns.e('select')}>
            <span class={ns.em('select', 'placeholder')}>
              {ibiz.i18n.t('component.dateRangePicker.headerPlaceholder')}
            </span>
            <div class={ns.em('select', 'range')}>
              <div class={ns.em('select', 'range-date')}>
                <span>{formatStartDate()}</span>
                <span>~</span>
                <span>{formatEndDate()}</span>
              </div>
              <div class={ns.em('select', 'icons')}>
                <span onClick={onClear}>
                  <van-icon name='close' />
                </span>
                <span onClick={switchEdit}>
                  {!isEditable.value ? (
                    <van-icon name='edit' />
                  ) : (
                    <van-icon name='calendar-o' />
                  )}
                </span>
              </div>
            </div>
          </div>
        );
      }
      return renderSingleText();
    };

    return {
      ns,
      calendarRef,
      maxDate,
      minDate,
      allowSave,
      isEditable,
      formatter,
      onCancel,
      calcDefaultSelect,
      onSave,
      onSelect,
      onConfirm,
      formatStartDate,
      formatEndDate,
      switchEdit,
      onClear,
      renderCalendarInput,
      renderSelectRange,
    };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        {this.enableEdit && (
          <div class={this.ns.e('header')}>
            <div class={this.ns.e('actions')}>
              <div class={this.ns.em('actions', 'close')}>
                <van-icon name='cross' onClick={this.onCancel} />
              </div>
              <div
                class={[
                  this.ns.em('actions', 'save'),
                  this.ns.is('select', this.allowSave),
                ]}
              >
                <span onClick={this.onSave}>
                  {ibiz.i18n.t('component.dateRangePicker.confirm')}
                </span>
              </div>
            </div>
            {this.renderSelectRange()}
          </div>
        )}
        {!this.isEditable ? (
          <div class={this.ns.e('calendar-container')}>
            <van-calendar
              ref='calendarRef'
              class={this.ns.b('calendar')}
              poppable={false}
              formatter={this.formatter}
              type={this.type}
              show-title={!this.enableEdit}
              show-confirm={!this.enableEdit}
              show-subtitle={false}
              first-day-of-week={1}
              default-date={this.calcDefaultSelect}
              min-date={this.minDate}
              max-date={this.maxDate}
              onSelect={this.onSelect}
              onConfirm={this.onConfirm}
              {...useFilterAttribute(this.$attrs)}
            >
              {{
                title: () => {
                  return (
                    <div class={this.ns.e('custom-header')}>
                      <div class={this.ns.em('custom-header', 'title')}>
                        {ibiz.i18n.t('component.dateRangePicker.selectDate')}
                      </div>
                      <div
                        class={this.ns.em('custom-header', 'close')}
                        onClick={this.onCancel}
                      >
                        <van-icon name='cross' onClick={this.onCancel} />
                      </div>
                    </div>
                  );
                },
              }}
            </van-calendar>
          </div>
        ) : (
          this.renderCalendarInput()
        )}
      </div>
    );
  },
});
