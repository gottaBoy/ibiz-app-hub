/* eslint-disable camelcase */
import { defineComponent, PropType } from 'vue';
import { IInternalMessage } from '@ibiz-template/core';
import { useNamespace } from '@ibiz-template/vue3-util';
import { IInternalMessageProvider } from '@ibiz-template/runtime';
import './internal-message-default.scss';

const stateTexts = {
  READ: '已阅读',
  SENT: '已发送',
  RECEIVED: '已接收',
  REPLIED: '已回复',
  SEND_FAILED: '发送失败',
  NOT_SENT: '未发送',
  DELETED: '已删除',
};

const stateType = {
  READ: '',
  SENT: 'success',
  RECEIVED: 'success',
  REPLIED: 'warning',
  SEND_FAILED: 'danger',
  NOT_SENT: 'info',
  DELETED: 'info',
};

export const InternalMessageDefault = defineComponent({
  name: 'IBizInternalMessageDefault',
  props: {
    message: {
      type: Object as PropType<IInternalMessage>,
      required: true,
    },
    provider: {
      type: Object as PropType<IInternalMessageProvider>,
      required: true,
    },
  },
  emits: {
    close: () => true,
    read: () => true,
  },
  setup() {
    const ns = useNamespace('internal-message');
    return { ns };
  },
  render() {
    const { title, create_time, content: msgContent, status } = this.message;

    // 内容区
    const content = <div class={this.ns.e('short-content')}>{msgContent}</div>;

    return (
      <iBizInternalMessageContainer
        class={[this.ns.b()]}
        message={this.message}
        provider={this.provider}
        onRead={() => this.$emit('read')}
        onClose={() => this.$emit('close')}
      >
        <div class={this.ns.b('left')}>
          <ion-icon name='list-outline'></ion-icon>
        </div>
        <div class={this.ns.b('center')}>
          <div class={this.ns.e('caption')}>
            <el-tag class={this.ns.e('status')} type={stateType[status]}>
              {stateTexts[status]}
            </el-tag>
            {title}
          </div>
          {content}
          <div class={this.ns.e('create-time')}>{create_time}</div>
        </div>
      </iBizInternalMessageContainer>
    );
  },
});
