import { defineComponent } from 'vue';
import { useNamespace } from '@ibiz-template/vue3-util';
import { AddBtnEvent } from './add-btn-event';
import './add-btn.scss';

export const IBizAddBtn = defineComponent({
  name: 'IBizAddBtn',
  props: {
    addCaption: {
      type: String,
      default: () => ibiz.i18n.t('control.common.addbtn'),
    },
  },
  emits: AddBtnEvent,
  setup(props, { emit }) {
    const ns = useNamespace('add-btn');
    // 点击添加按钮
    const onAddClick = (event: PointerEvent) => {
      emit('addClick', event);
    };
    return { ns, onAddClick };
  },
  render() {
    return (
      <van-button
        class={this.ns.b()}
        icon='plus'
        onClick={(event: PointerEvent) => this.onAddClick(event)}
      >
        {this.addCaption}
      </van-button>
    );
  },
});
