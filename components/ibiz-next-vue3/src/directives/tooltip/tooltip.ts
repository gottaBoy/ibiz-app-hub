/* eslint-disable no-restricted-syntax */
import {
  h,
  App,
  render,
  createVNode,
  DirectiveBinding,
  type VNode,
  type Directive,
} from 'vue';
import {
  TooltipContent,
  TooltipOptions,
  TooltipPlacement,
  useNamespace,
} from '@ibiz-template/vue3-util';
import { IBizTooltip } from '../common';

// 保存应用
let APP: App | null = null;

export function setApp(app: App): void {
  APP = app;
}

/**
 * @description 扩展 HTMLElement 以存储 tooltip 实例信息
 */
interface TooltipElement extends HTMLElement {
  _tooltip?: {
    id: string;
    options: TooltipOptions;
    container: HTMLDivElement;
    vnode: VNode | null;
    cleanup: () => void;
  };
}

/**
 * @description 指令绑定值类型
 */
interface TooltipBindings
  extends DirectiveBinding<TooltipContent | TooltipOptions> {
  value: TooltipContent | TooltipOptions;
}

/**
 * @description 断是否为有效的 Placement modifier
 * @param {string} key
 * @returns {*}  {key is TooltipPlacement}
 */
function isValidPlacement(key: string): key is TooltipPlacement {
  return Object.values(TooltipPlacement).includes(key as TooltipPlacement);
}

/**
 * @description 标准化选项配置
 * @param {(TooltipContent | TooltipOptions)} value
 * @param {string} [arg]
 * @param {Partial<Record<string, boolean>>} [modifiers]
 * @returns {*}  {TooltipOptions}
 */
function normalizeOptions(
  value: TooltipContent | TooltipOptions,
  _arg?: string,
  modifiers?: Partial<Record<string, boolean>>,
): TooltipOptions {
  const options: TooltipOptions =
    typeof value === 'string' || !('content' in value)
      ? {
          content: value,
        }
      : (value as TooltipOptions);
  // 处理 modifiers (优先级最高，用于覆盖 placement)
  if (modifiers) {
    for (const key in modifiers) {
      if (modifiers[key] && isValidPlacement(key)) {
        options.placement = key as TooltipPlacement;
        // 找到第一个有效的 placement 即停止
        break;
      }
    }
  }
  return options;
}

/**
 * @description 创建tooltip VNode
 * @returns {*}  {VNode}
 */
function createTooltipVNode(
  triggerEl: HTMLElement,
  options: TooltipOptions,
): VNode {
  const { content, ...args } = options;
  const ns = useNamespace('tooltip');

  const props = {
    args,
    virtualRef: triggerEl,
  };

  return createVNode(IBizTooltip, props, {
    default: () => {
      if (typeof content === 'string')
        return h('div', {
          class: `${ns.e('custom')}`,
          innerHTML: content,
        });
      return content;
    },
  });
}

/**
 * @description 销毁Tooltip
 * @param {TooltipElement} el
 */
function destroyTooltip(el: TooltipElement) {
  if (el._tooltip) {
    el._tooltip.cleanup();
    delete el._tooltip;
  }
}

/**
 * @description 初始化Tooltip
 * @param {TooltipElement} el
 * @param {TooltipBindings} binding
 */
function initTooltip(el: TooltipElement, binding: TooltipBindings): void {
  // 1. 销毁旧实例
  if (el._tooltip) destroyTooltip(el);

  // 2. 解析选项参数
  const options = normalizeOptions(
    binding.value,
    binding.arg,
    binding.modifiers,
  );

  // 2. 处理禁用
  if (options.disabled) return;

  // 3. 创建容器
  const container = document.createElement('div');
  document.body.appendChild(container);

  // 4. 生成 VNode
  const vnode = createTooltipVNode(el, options);

  // 5. 设置应用上下文
  if (APP) vnode.appContext = APP._context;

  // 5. 渲染
  render(vnode, container);

  // 6. 绑定数据到元素
  el._tooltip = {
    id: `tooltip-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    options,
    container,
    vnode,
    cleanup: () => {
      if (container && container.parentNode) {
        render(null, container);
        container.parentNode.removeChild(container);
      }
    },
  };
}

export const VTooltip: Directive<
  TooltipElement,
  TooltipContent | TooltipOptions
> = {
  mounted(el, binding: TooltipBindings) {
    initTooltip(el, binding);
  },

  updated(el, binding: TooltipBindings) {
    initTooltip(el, binding);
  },

  unmounted(el) {
    if (el._tooltip) {
      el._tooltip.cleanup();
      delete el._tooltip;
    }
  },
};

export default VTooltip;
