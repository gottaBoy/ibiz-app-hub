/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from 'preact/hooks';
import { useComputed, useSignal } from '@preact/signals';
import { aiChatT, Namespace } from '../../../utils';
import { IChatToolCall } from '../../../interface';
import { CopyPasteSvg, CopyingSvg, ErrorSvg, ExpandSvg } from '../../../icons';
import './default-tool-call.scss';

export interface DefaultToolCallProps {
  item: IChatToolCall;
  className?: string;
}

// 默认工具调用
export const DefaultToolCall = (props: DefaultToolCallProps) => {
  const ns = new Namespace('default-tool-call');
  // 是否展开
  const isExpand = useSignal<boolean>(false);
  // 是否正在拷贝
  const isCopying = useSignal<boolean>(false);
  // 定时器ID
  let timerId: NodeJS.Timeout | undefined;

  // 处理折叠
  const onCollapse = () => {
    isExpand.value = !isExpand.value;
  };

  // 处理复制
  const onCopy = (event: MouseEvent) => {
    event.stopPropagation();
    if (isCopying.value) return;
    if (timerId) clearTimeout(timerId);
    isCopying.value = true;
    navigator.clipboard.writeText(JSON.stringify(props.item, undefined, 2));
    (window as any).ibiz.message.success(aiChatT('copied'));
    timerId = setTimeout(() => {
      isCopying.value = false;
    }, 2000);
  };

  // 添加 useEffect 来处理组件销毁时的清理，空依赖数组表示只在组件挂载和销毁时执行
  useEffect(() => {
    // 返回清理函数，在组件销毁时执行
    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, []);

  // 格式化基本类型的值
  const formatValue = (value: unknown): string => {
    if (typeof value === 'string') {
      // 检查是否是错误消息
      if (
        value.includes('Failed') ||
        value.includes('Error') ||
        value.includes('ERR_')
      ) {
        return `<span class="error">"${value}"</span>`;
      }
      return `<span class="string">"${value}"</span>`;
    }
    if (typeof value === 'number') {
      return `<span class="number">${value}</span>`;
    }
    if (typeof value === 'boolean') {
      return `<span class="boolean">${value}</span>`;
    }
    if (value === null) {
      return `<span class="null">null</span>`;
    }
    return '';
  };

  // 递归格式化JSON数据
  const formatJSON = (data: unknown, indentLevel: number = 0) => {
    const indent = '  '.repeat(indentLevel);
    const lines = [];

    if (Array.isArray(data)) {
      if (data.length === 0) {
        return [`${indent}<span class="array">[]</span>`];
      }

      lines.push(`${indent}<span class="array">[</span>`);

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

      lines.push(`${indent}<span class="array">]</span>`);
    } else if (typeof data === 'object' && data !== null) {
      const keys = Object.keys(data);
      if (keys.length === 0) {
        return [`${indent}<span class="property">{}</span>`];
      }

      lines.push(`${indent}<span class="property">{</span>`);

      keys.forEach((key, index) => {
        const value = (data as Record<string, any>)[key];
        const comma = index < keys.length - 1 ? ',' : '';
        const keyElement = `<span class="json-key">"${key}":</span>`;

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

      lines.push(`${indent}<span class="property">}</span>`);
    } else {
      lines.push(`${indent}${formatValue(data)}`);
    }

    return lines;
  };

  const lines = useComputed(() => {
    const items = formatJSON(props.item, 0);
    return items.map(
      (item, index) => `<span class="line-number">${index + 1}</span>${item}`,
    );
  });

  return (
    <div className={`${ns.b()} ${props.className || ''}`}>
      <div className={ns.e('header')} onClick={() => onCollapse()}>
        <div className={ns.e('header-left')}>
          <div className={ns.em('header-left', 'caption')}>
            {props.item.name}
          </div>
          <div
            className={ns.em('header-left', 'desc')}
            title={props.item.parameters?.desc || ''}
          >
            {props.item.parameters?.desc || ''}
          </div>
        </div>
        <div className={ns.e('header-right')}>
          {props.item.error && (
            <span style='color: red;'>{aiChatT('error')}</span>
          )}
          {props.item.error && ErrorSvg}
          <span
            title={aiChatT('copy')}
            className={ns.e('copy')}
            onClick={(event: MouseEvent) => onCopy(event)}
          >
            {isCopying.value ? CopyingSvg : CopyPasteSvg}
          </span>
          <ExpandSvg
            style={{
              'margin-left': ' 6px',
              transform: isExpand.value ? 'rotate(90deg)' : 'rotate(0deg)',
            }}
          />
        </div>
      </div>
      {isExpand.value && (
        <div className={ns.e('content')}>
          {lines.value.map((line, index) => {
            return (
              <div
                key={index}
                className='code-line'
                dangerouslySetInnerHTML={{ __html: line }}
              ></div>
            );
          })}
        </div>
      )}
    </div>
  );
};
