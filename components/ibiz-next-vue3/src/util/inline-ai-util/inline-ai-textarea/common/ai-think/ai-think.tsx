import { defineComponent } from 'vue';
import { useNamespace } from '@ibiz-template/vue3-util';
import { DownIcon, LoadingIcon, ThinkSuccessIcon, UpIcon } from '../../icon';
import './ai-think.scss';

export const AIThink = defineComponent({
  props: {
    think: {
      type: String,
    },
    isLoading: {
      type: Boolean,
      required: true,
    },
    isCollapse: {
      type: Boolean,
      required: true,
    },
  },
  emits: {
    collapseChange: (_value: boolean) => true,
  },
  setup(props, { emit }) {
    const ns = useNamespace('ai-think');

    /**
     * @description 折叠变更
     */
    const onCollapseChange = (): void => {
      emit('collapseChange', !props.isCollapse);
    };

    return {
      ns,
      onCollapseChange,
    };
  },
  render() {
    if (!this.think) return;
    return (
      <div class={this.ns.b()}>
        <div class={this.ns.e('header')} onClick={this.onCollapseChange}>
          <div
            class={[
              this.ns.em('header', 'state-icon'),
              this.ns.is('loading', this.isLoading),
            ]}
          >
            {this.isLoading ? LoadingIcon : ThinkSuccessIcon}
          </div>
          <div class={this.ns.em('header', 'title')}>
            {this.isLoading
              ? ibiz.i18n.t('util.inlineAiUtil.thinking')
              : ibiz.i18n.t('util.inlineAiUtil.thinked')}
          </div>
          <div class={this.ns.em('header', 'collapse-icon')}>
            {this.isCollapse ? DownIcon : UpIcon}
          </div>
        </div>
        {!this.isCollapse && (
          <div class={this.ns.e('content')}>{this.think}</div>
        )}
      </div>
    );
  },
});
