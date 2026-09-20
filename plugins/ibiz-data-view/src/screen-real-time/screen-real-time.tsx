import { defineComponent, onBeforeUnmount, onMounted, ref } from 'vue';
import { getSpanProps, useNamespace } from '@ibiz-template/vue3-util';
import day from 'dayjs';
import { ScreenRealTimeController } from './screen-real-time.controller';
import './screen-real-time.scss';
import { dataViewT } from '../locale';

export const ScreenRealTime = defineComponent({
  name: 'ScreenRealTime',
  props: getSpanProps<ScreenRealTimeController>(),
  setup(props) {
    const ns = useNamespace('screen-real-time');

    const c = props.controller;

    let timerId: NodeJS.Timeout | null = null;

    const weekDays = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];

    const leftText = ref<string>('');
    const week = ref<string>('');
    const rightText = ref<string>('');

    onMounted(() => {
      timerId = setInterval(() => {
        const now = day();

        leftText.value = c.leftTime ? `${now.format(c.leftTime)} ` : '';
        week.value = c.showWeek
          ? `${dataViewT(`week.${weekDays[now.day()]}`)} `
          : '';
        rightText.value = c.rightTime ? now.format(c.rightTime) : '';
      }, 1000);
    });

    onBeforeUnmount(() => {
      if (timerId) {
        clearInterval(timerId);
      }
    });

    return {
      ns,
      c,
      leftText,
      week,
      rightText,
    };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        {this.leftText ? (
          <div class={this.ns.e('left-time')}>{this.leftText}</div>
        ) : null}
        {this.week ? <div class={this.ns.e('week')}>{this.week}</div> : null}

        <div class={this.ns.e('right-time')}>{this.rightText}</div>
      </div>
    );
  },
});
