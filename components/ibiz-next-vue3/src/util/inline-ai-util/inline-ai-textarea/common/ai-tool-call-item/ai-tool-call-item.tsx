/* eslint-disable @typescript-eslint/no-explicit-any */
import { PropType, defineComponent, ref, onMounted } from 'vue';
import { useNamespace } from '@ibiz-template/vue3-util';
import { IChatToolCall } from '../../interface';
import { CopyIcon, DownIcon, ErrorIcon, RightIcon } from '../../icon';
import './ai-tool-call-item.scss';

export const AIToolCallItem = defineComponent({
  props: {
    toolCall: {
      type: Object as PropType<IChatToolCall>,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('ai-tool-call-item');

    /**
     * 是否展开
     */
    const isExpanded = ref(false);

    /**
     * @description 处理展开变更
     */
    const handleExpandChange = (): void => {
      isExpanded.value = !isExpanded.value;
    };

    /**
     * @description 拷贝
     */
    const onCopy = (event: MouseEvent): void => {
      event.stopPropagation();
      ibiz.util.text.copy(JSON.stringify(props.toolCall, undefined, 2));
      ibiz.message.success(ibiz.i18n.t('util.inlineAiUtil.copy'));
    };

    /**
     * @description 格式化值
     * @param {unknown} value
     * @returns {*}  {string}
     */
    const formatValue = (value: unknown): string => {
      if (typeof value === 'string') {
        // 检查是否是错误消息
        if (
          value.includes('Failed') ||
          value.includes('Error') ||
          value.includes('ERR_')
        ) {
          return `<span class="${ns.e('error')}">"${value}"</span>`;
        }
        return `<span class="${ns.e('string')}">"${value}"</span>`;
      }
      if (typeof value === 'number') {
        return `<span class="${ns.e('number')}">${value}</span>`;
      }
      if (typeof value === 'boolean') {
        return `<span class="${ns.e('boolean')}">${value}</span>`;
      }
      if (value === null) {
        return `<span class="${ns.e('null')}">null</span>`;
      }
      return '';
    };

    /**
     * @description 递归格式化JSON字符串
     * @param {unknown} data
     * @param {number} [indentLevel=0]
     * @returns {*}
     */
    const formatJSON = (data: unknown, indentLevel: number = 0) => {
      const indent = '  '.repeat(indentLevel);
      const lines = [];

      if (Array.isArray(data)) {
        if (data.length === 0) {
          return [`${indent}<span class="${ns.e('array')}">[]</span>`];
        }

        lines.push(`${indent}<span class="${ns.e('array')}">[</span>`);

        data.forEach((item, index) => {
          const itemLines = formatJSON(item, indentLevel + 1);
          const comma = index < data.length - 1 ? ',' : '';

          if (typeof item === 'object' && item !== null) {
            lines.push(...itemLines.slice(0, -1));
            lines.push(`${itemLines[itemLines.length - 1]}${comma}`);
          } else {
            lines.push(`${itemLines[0]}${comma}`);
          }
        });

        lines.push(`${indent}<span class="${ns.e('array')}">]</span>`);
      } else if (typeof data === 'object' && data !== null) {
        const keys = Object.keys(data);
        if (keys.length === 0) {
          return [`${indent}<span class="${ns.e('property')}">{}</span>`];
        }

        lines.push(`${indent}<span class="${ns.e('property')}">{</span>`);

        keys.forEach((key, index) => {
          const value = (data as Record<string, any>)[key];
          const comma = index < keys.length - 1 ? ',' : '';
          const keyElement = `<span class="${ns.e('json-key')}">"${key}":</span>`;

          if (typeof value === 'object' && value !== null) {
            const valueLines = formatJSON(value, indentLevel + 1);
            lines.push(`${indent}  ${keyElement} ${valueLines[0].trim()}`);

            if (valueLines.length > 1) {
              lines.push(...valueLines.slice(1, -1));
              lines.push(`${valueLines[valueLines.length - 1]}${comma}`);
            }
          } else {
            const valueElement = formatValue(value);
            lines.push(`${indent}  ${keyElement} ${valueElement}${comma}`);
          }
        });

        lines.push(`${indent}<span class="${ns.e('property')}">}</span>`);
      } else {
        lines.push(`${indent}${formatValue(data)}`);
      }

      return lines;
    };

    const lines = ref<string[]>([]);

    const onInit = (): void => {
      const items = formatJSON(props.toolCall, 0);
      lines.value = items.map(
        (item, index) =>
          `<span class="${ns.em('code-line', 'line-number')}">${index + 1}</span>${item}`,
      );
    };

    onMounted(() => {
      onInit();
    });

    return {
      ns,
      lines,
      isExpanded,
      onCopy,
      handleExpandChange,
    };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <div class={this.ns.e('header')} onClick={this.handleExpandChange}>
          <div class={this.ns.e('header-left')}>
            <div class={this.ns.em('header-left', 'caption')}>
              {this.toolCall.name}
            </div>
            <div class={this.ns.em('header-left', 'desc')}>
              {this.toolCall.parameters?.desc}
            </div>
          </div>
          <div class={this.ns.e('header-right')}>
            {this.toolCall.error && (
              <div class={this.ns.em('header-right', 'error')}>
                <span class={this.ns.em('header-right', 'error-text')}>
                  {ibiz.i18n.t('util.inlineAiUtil.error')}
                </span>
                <div class={this.ns.em('header-right', 'icon')}>
                  {ErrorIcon}
                </div>
              </div>
            )}
            <div
              onClick={this.onCopy}
              class={this.ns.em('header-right', 'icon')}
            >
              {CopyIcon}
            </div>
            <div class={this.ns.em('header-right', 'icon')}>
              {this.isExpanded ? DownIcon : RightIcon}
            </div>
          </div>
        </div>
        {this.isExpanded && (
          <div class={this.ns.e('content')}>
            {this.lines.map(line => {
              return <div class={this.ns.e('code-line')} v-html={line}></div>;
            })}
          </div>
        )}
      </div>
    );
  },
});
