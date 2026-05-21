import { defineComponent, PropType } from 'vue';
import { useNamespace } from '../../use';
import './badge.scss';

export const IBizBadge = defineComponent({
  name: 'IBizBadge',
  props: {
    value: {
      type: Number,
      required: true,
    },
    type: {
      type: String as PropType<
        'primary' | 'success' | 'warning' | 'danger' | 'info'
      >,
      default: 'danger',
    },
    max: {
      type: Number,
      default: 99,
    },
    counterMode: {
      type: Number,
    },
  },
  setup() {
    const ns = useNamespace('badge');
    return { ns };
  },
  render() {
    if (!this.value && this.value !== 0) {
      return;
    }
    if (this.counterMode === 1 && this.value <= 0) {
      return;
    }
    return (
      <div
        class={[
          this.ns.b(),
          this.ns.m(this.type),
          this.ns.is('mob', ibiz.env.isMob),
        ]}
      >
        {this.value > this.max ? `${this.max}+` : this.value}
      </div>
    );
  },
});
