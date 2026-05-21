import { useNamespace } from '@ibiz-template/vue3-util';
import { computed, defineComponent } from 'vue';
import './split-trigger.scss';

export const IBizSplitTrigger = defineComponent({
  name: 'IBizSplitTrigger',
  props: {
    mode: String,
  },
  setup(prop) {
    const ns = useNamespace('split-trigger');
    const isVertical = computed(() => prop.mode === 'vertical');
    const classes = computed(() => [
      ns.b(),
      isVertical.value ? ns.m('vertical') : ns.m('horizontal'),
    ]);
    const barConClasses = computed(() => [
      ns.b('bar-con'),
      isVertical.value
        ? ns.bm('bar-con', 'vertical')
        : ns.bm('bar-con', 'horizontal'),
    ]);
    const items = Array(8).fill(0);
    return {
      ns,
      classes,
      barConClasses,
      items,
    };
  },
  render() {
    return (
      <div class={this.classes}>
        <div class={this.barConClasses}>
          {this.items.map((_item, i) => (
            <i class={this.ns.b('bar')} key={`trigger-${i}`}></i>
          ))}
        </div>
      </div>
    );
  },
});
