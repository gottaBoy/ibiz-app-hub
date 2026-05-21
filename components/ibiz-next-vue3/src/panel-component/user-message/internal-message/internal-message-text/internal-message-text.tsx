/* eslint-disable camelcase */
import { defineComponent, PropType } from 'vue';
import { IInternalMessage } from '@ibiz-template/core';
import { useNamespace } from '@ibiz-template/vue3-util';
import { InternalMessageTextProvider } from './internal-message-text.provider';
import './internal-message-text.scss';

export const InternalMessageText = defineComponent({
  name: 'IBizInternalMessageText',
  props: {
    message: {
      type: Object as PropType<IInternalMessage>,
      required: true,
    },
    provider: {
      type: Object as PropType<InternalMessageTextProvider>,
      required: true,
    },
  },
  emits: {
    close: () => true,
    read: () => true,
  },
  setup() {
    const ns = useNamespace('internal-message-text');
    return { ns };
  },
  render() {
    const { title, create_time, content: msgContent } = this.message;
    return (
      <iBizInternalMessageContainer
        class={[this.ns.b()]}
        message={this.message}
        provider={this.provider}
        onRead={() => this.$emit('read')}
        onClose={() => this.$emit('close')}
      >
        <div class={this.ns.e('caption')}>{title}</div>
        {!!msgContent && <div class={this.ns.e('content')}>{msgContent}</div>}
        <div class={this.ns.e('create-time')}>{create_time}</div>
      </iBizInternalMessageContainer>
    );
  },
});
