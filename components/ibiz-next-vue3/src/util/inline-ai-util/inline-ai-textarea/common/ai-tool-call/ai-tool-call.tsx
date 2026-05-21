import { PropType, computed, defineComponent, ref } from 'vue';
import { useNamespace } from '@ibiz-template/vue3-util';
import { IChatToolCall } from '../../interface';
import { AIToolCallItem } from '../ai-tool-call-item/ai-tool-call-item';
import './ai-tool-call.scss';

export const AIToolCall = defineComponent({
  props: {
    toolCalls: {
      type: Object as PropType<IChatToolCall[]>,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('ai-tool-call');

    /**
     * 是否展开
     */
    const isExpanded = ref(false);

    /**
     * 显示切换
     */
    const showToggle = computed(() => {
      return props.toolCalls.length > 4;
    });

    /**
     * 调用工具
     */
    const items = computed(() => {
      return showToggle.value && !isExpanded.value
        ? props.toolCalls.slice(0, 4)
        : props.toolCalls;
    });

    /**
     * @description 处理切换
     */
    const handleToggle = (): void => {
      isExpanded.value = !isExpanded.value;
    };

    return {
      ns,
      items,
      showToggle,
      isExpanded,
      handleToggle,
    };
  },
  render() {
    if (!this.toolCalls.length) return;
    return (
      <div class={this.ns.b()}>
        {this.items.map(item => {
          return <AIToolCallItem toolCall={item} />;
        })}
        {this.showToggle && (
          <div class={this.ns.e('toggle')} onClick={this.handleToggle}>
            {this.isExpanded
              ? ibiz.i18n.t('util.inlineAiUtil.collapseToolCall')
              : ibiz.i18n.t('util.inlineAiUtil.expandToolCall', {
                  number: this.toolCalls.length,
                })}
          </div>
        )}
      </div>
    );
  },
});
