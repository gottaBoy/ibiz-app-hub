import { defineComponent, ref, watch } from 'vue';
import { useNamespace, getSliderProps } from '@ibiz-template/vue3-util';
import './percent-pond.scss';
import { PercentPondController } from './percent-pond.controller';

export const PercentPond = defineComponent({
  name: 'PercentPond',
  props: getSliderProps<PercentPondController>(),
  setup(props) {
    const ns = useNamespace('percent-pond');
    const c = props.controller;
    const total = ref(100);

    const useCover = () => {
      const tempValue = Number(props.value) || 0;
      return `${total.value === 0 ? 0 : Math.round((tempValue / total.value) * 100) || 0}%`;
    };

    if (c.totalField) {
      watch(
        () => props.data[c.totalField],
        newVal => {
          if (newVal || newVal === 0) {
            total.value = newVal;
          }
        },
        {
          immediate: true,
        },
      );
    }

    return { ns, useCover, total };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <div class={this.ns.e('slider')}>
          <div class={this.ns.em('slider', 'line')}></div>
          <div class={this.ns.em('slider', 'cover-slider')}>
            <div
              class={this.ns.em('slider', 'use-cover')}
              style={{ width: this.useCover() }}
            ></div>
            <i
              class={['fa fa-caret-down', this.ns.em('slider', 'slider-arrow')]}
              style={{ left: `calc(${this.useCover()} - 5px)` }}
              aria-hidden='true'
            ></i>
          </div>
        </div>
        <div class={this.ns.e('value')}>
          <div class={this.ns.em('value', 'current')}>{this.value}</div>
          <div class={this.ns.em('value', 'total')}>/{this.total}</div>
        </div>
      </div>
    );
  },
});
