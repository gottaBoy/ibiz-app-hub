import { computed, defineComponent } from 'vue';
import { getSpanProps, useNamespace } from '@ibiz-template/vue3-util';
import { DigitalFlopController } from './digital-flop.controller';
import './digital-flop.scss';

export const DigitalFlop = defineComponent({
  name: 'DigitalFlop',
  props: getSpanProps<DigitalFlopController>(),
  setup(props) {
    const ns = useNamespace('digital-flop');

    const c = props.controller;

    const curValue = computed(() => {
      if (props.value) {
        return props.value.toString();
      }
      return '';
    });

    const styles = computed(() => {
      return {
        [ns.cssVarBlockName('font-size')]: `${c.fontSize}px`,
        [ns.cssVarBlockName('width')]: `${c.size}px`,
        [ns.cssVarBlockName('height')]: `${c.size}px`,
      };
    });

    return {
      ns,
      c,
      curValue,
      styles,
    };
  },
  render() {
    return (
      <div class={this.ns.b()} style={this.styles}>
        {this.curValue.split('').map((value: string) => {
          return (
            <div
              class={[
                this.ns.e('item'),
                this.ns.is('symbol', Number.isNaN(Number(value))),
              ]}
            >
              {value}
            </div>
          );
        })}
      </div>
    );
  },
});
