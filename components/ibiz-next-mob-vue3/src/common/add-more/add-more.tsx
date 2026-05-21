import { defineComponent } from 'vue';
import { useNamespace } from '@ibiz-template/vue3-util';
import './add-more.scss';

export const IBizAddMore = defineComponent({
  name: 'IBizAddMore',
  setup() {
    const ns = useNamespace('add-more');
    return { ns };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <van-button class={this.ns.e('button')}>
          {ibiz.i18n.t('control.common.loadMore')}
        </van-button>
      </div>
    );
  },
});
