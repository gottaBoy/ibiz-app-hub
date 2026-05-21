/* eslint-disable camelcase */
import { computed, defineComponent, PropType } from 'vue';
import { IInternalMessage } from '@ibiz-template/core';
import { useNamespace } from '@ibiz-template/vue3-util';
import { InternalMessageHTMLtProvider } from './internal-message-html.provider';
import { parseHtml } from '../../../../util';
import './internal-message-html.scss';

export const InternalMessageHTML = defineComponent({
  name: 'IBizInternalMessageHTML',
  props: {
    message: {
      type: Object as PropType<IInternalMessage>,
      required: true,
    },
    provider: {
      type: Object as PropType<InternalMessageHTMLtProvider>,
      required: true,
    },
  },
  emits: {
    close: () => true,
    read: () => true,
  },
  setup(props) {
    const ns = useNamespace('internal-message-html');
    const msgContent = computed(() => {
      return parseHtml(props.message.content);
    });
    return { ns, msgContent };
  },
  render() {
    return (
      <iBizInternalMessageContainer
        class={[this.ns.b()]}
        message={this.message}
        provider={this.provider}
        onRead={() => this.$emit('read')}
        onClose={() => this.$emit('close')}
      >
        <div class={this.ns.e('content')} v-html={this.msgContent}></div>
      </iBizInternalMessageContainer>
    );
  },
});
