import { PropType, defineComponent } from 'vue';
import { EditorController } from '@ibiz-template/runtime';
import { useNamespace } from '@ibiz-template/vue3-util';
import './ac-item-plugin.scss';

export const AcItemPlugin = defineComponent({
  name: 'IBizAcItemPlugin',
  props: {
    item: {
      type: Object as PropType<IData>,
      required: true,
    },
    controller: {
      type: EditorController,
      required: true,
    },
  },

  setup() {
    const ns = useNamespace('ac-item-plugin');
    return {
      ns,
    };
  },
  render() {
    const quantity = Number(this.item.quantity);
    return (
      <div
        class={this.ns.b()}
        style={{
          color:
            !quantity || quantity <= 100
              ? 'red'
              : quantity >= 200
                ? 'green'
                : '',
        }}
      >
        {this.item.srfmajortext || this.item.text || ''}[
        {this.item.quantity || ''}]
      </div>
    );
  },
});
