import { defineComponent, PropType } from 'vue';
import { useNamespace } from '@ibiz-template/vue3-util';
import './devtool-button.scss';

const DevtoolButton = defineComponent({
  name: 'DevtoolButton',
  props: {
    title: {
      type: String as PropType<string>,
      default: '',
    },
  },
  emits: ['click'],
  setup(props, { emit }) {
    const ns = useNamespace('devtool-button');
    const click = (event: MouseEvent): void => {
      event.stopPropagation();
      emit('click', event);
    };
    return { ns, click };
  },
  render() {
    return (
      <button
        title={this.title ? this.title : undefined}
        class={this.ns.b()}
        onClick={(event: MouseEvent) => this.click(event)}
      >
        {this.$slots.default?.()}
      </button>
    );
  },
});

export default DevtoolButton;
