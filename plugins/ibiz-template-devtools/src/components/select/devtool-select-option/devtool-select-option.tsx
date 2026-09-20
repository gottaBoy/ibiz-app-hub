import { defineComponent, PropType, inject } from 'vue';
import { useNamespace } from '@ibiz-template/vue3-util';
import './devtool-select-option.scss';

export const OptionComponent = defineComponent({
  props: {
    label: {
      type: String as PropType<string>,
    },
    value: {
      type: String as PropType<string>,
    },
  },
  setup(props) {
    const ns = useNamespace('devtool-select-option');

    const select = inject('select') as IData;

    const clickItem = (event: MouseEvent): void => {
      event.stopPropagation();
      select.curValue.value = props.value;
      select.curLabel.value = props.label;
      select.showOption();
    };

    return {
      ns,
      clickItem,
    };
  },
  render() {
    return (
      <div id='option' class={this.ns.b()}>
        <div
          class={this.ns.e('content')}
          onClick={(event: MouseEvent) => this.clickItem(event)}
        >
          {this.label}
        </div>
      </div>
    );
  },
});

export default OptionComponent;
