/* eslint-disable camelcase */
import { computed, defineComponent, PropType } from 'vue';
import { IInternalMessage } from '@ibiz-template/core';
import { useNamespace } from '@ibiz-template/vue3-util';
import './internal-message-json.scss';
import { InternalMessageJSONtProvider } from './internal-message-json.provider';

export const InternalMessageJSON = defineComponent({
  name: 'IBizInternalMessageJSON',
  props: {
    message: {
      type: Object as PropType<IInternalMessage>,
      required: true,
    },
    provider: {
      type: Object as PropType<InternalMessageJSONtProvider>,
      required: true,
    },
  },
  emits: {
    close: () => true,
  },
  setup(props, { emit }) {
    const ns = useNamespace('internal-message-json');

    const jsonContent = computed(() => {
      if (props.message.content && props.message.content_type === 'JSON') {
        return JSON.parse(props.message.content) as IData;
      }
      return null;
    });

    // 没有短内容和长内容不一致时, 显示点击
    const redirectUrl = computed(() => {
      const url = ibiz.env.isMob ? props.message.mobile_url : props.message.url;
      return url || jsonContent.value?.redirecturl;
    });

    const toolbarItems = computed(() => {
      if (!redirectUrl.value) {
        return undefined;
      }
      return [
        {
          icon: 'link-outline',
          key: 'openRedirectView',
          tooltip: ibiz.i18n.t(
            'panelComponent.userMessage.internalMessageJson.jumpToView',
          ),
        },
      ];
    });

    const onToolbarClick = (key: string) => {
      if (key === 'openRedirectView') {
        props.provider.openRedirectView(props.message, redirectUrl.value!);
        emit('close');
      }
    };

    return { ns, jsonContent, toolbarItems, redirectUrl, onToolbarClick };
  },
  render() {
    // 内容区
    let content = null;
    if (this.jsonContent?.html) {
      content = (
        <div class={this.ns.e('content')} v-html={this.jsonContent.html}></div>
      );
    } else if (this.jsonContent?.todoid) {
      content = (
        <div class={this.ns.e('content')}>
          <div class={this.ns.e('card')}>
            <div class={this.ns.em('card', 'avatar')}>
              {this.jsonContent.createmanname.substring(0, 2)}
            </div>
            <div class={this.ns.em('card', 'content')}>
              <div class={[this.ns.e('todo'), this.ns.em('todo', 'header')]}>
                <span class={this.ns.em('todo', 'person')}>
                  {this.jsonContent.createmanname}
                </span>
                <span class={this.ns.em('todo', 'action')}>
                  {this.jsonContent.todostate === 'ACTIVE'
                    ? ibiz.i18n.t(
                        'panelComponent.userMessage.internalMessageJson.todo',
                      )
                    : ibiz.i18n.t(
                        'panelComponent.userMessage.internalMessageJson.done',
                      )}
                </span>
              </div>
              <div class={[this.ns.e('todo'), this.ns.em('todo', 'content')]}>
                <span class={this.ns.em('todo', 'title')}>
                  {this.jsonContent.title}
                </span>
                <span class={this.ns.em('todo', 'step')}>
                  {this.jsonContent.param05}
                </span>
                <van-tag type='primary' class={this.ns.em('todo', 'state')}>
                  {this.jsonContent.todostatetext}
                </van-tag>
              </div>
              <div class={[this.ns.e('todo'), this.ns.em('todo', 'footer')]}>
                <span class={this.ns.em('todo', 'date')}>
                  {this.jsonContent.todostate === 'ACTIVE'
                    ? this.jsonContent.createdate
                    : this.jsonContent.processdate}
                </span>
                <span class={this.ns.em('todo', 'separate')}>·</span>
                <span class={this.ns.em('todo', 'name')}>
                  {this.jsonContent.param04}
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      content = (
        <div class={this.ns.e('content')}>
          {ibiz.i18n.t(
            'panelComponent.userMessage.internalMessageJson.missingHtml',
          )}
        </div>
      );
    }

    return (
      <iBizInternalMessageContainer
        class={[this.ns.b()]}
        message={this.message}
        provider={this.provider}
        clickable={!!this.redirectUrl}
        toolbarItems={this.toolbarItems}
        onToolbarClick={this.onToolbarClick}
        onClose={() => this.$emit('close')}
      >
        {content}
      </iBizInternalMessageContainer>
    );
  },
});
