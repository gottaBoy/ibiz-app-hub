import { defineComponent, PropType, VNode } from 'vue';
import { useNamespace } from '@ibiz-template/vue3-util';
import { isNil } from 'ramda';
import { ISysImage } from '@ibiz/model-core';
import './info-item.scss';

/**
 * @description 通用信息项组件，用于展示「图标 + 文本 + 计数器」组合结构
 */
export const IBizInfoItem = defineComponent({
  name: 'IBizInfoItem',
  props: {
    /**
     * @description 文本值
     */
    label: {
      type: String,
    },
    /**
     * @description 计数器数值
     */
    badge: {
      type: Number,
    },
    /**
     * @description 图标资源信息
     */
    icon: {
      type: Object as PropType<ISysImage>,
    },
    /**
     * @description 布局模式，vertical为垂直布局，horizontal为水平布局
     */
    layoutMode: {
      type: String as PropType<'vertical' | 'horizontal'>,
      default: 'horizontal',
    },
    /**
     * @description 计数器是否浮动显示
     */
    badgeFloat: {
      type: Boolean,
      default: true,
    },
  },
  setup(props) {
    const ns = useNamespace('info-item');

    const renderBadge = (): VNode | null => {
      if (isNil(props.badge)) return null;
      return <iBizBadge class={ns.e('badge')} value={props.badge} />;
    };

    const renderIcon = (): VNode | null => {
      if (isNil(props.icon)) return null;
      return <iBizIcon class={ns.e('icon')} icon={props.icon}></iBizIcon>;
    };
    const renderLabel = (): VNode | null => {
      if (isNil(props.label)) return null;
      return <span class={ns.e('label')}>{props.label}</span>;
    };

    const renderIconWrapper = (): VNode => {
      return (
        <div class={ns.e('icon-wrapper')}>
          {renderIcon()}
          {renderBadge()}
        </div>
      );
    };

    return { ns, renderBadge, renderIcon, renderLabel, renderIconWrapper };
  },
  render() {
    let content = [this.renderIcon(), this.renderLabel(), this.renderBadge()];
    if (this.layoutMode === 'vertical') {
      content = [this.renderIconWrapper(), this.renderLabel()];
    }
    return (
      <div
        class={[
          this.ns.b(),
          this.ns.is('badge-float', this.badgeFloat),
          this.ns.is(this.layoutMode, !!this.layoutMode),
        ]}
      >
        {content}
      </div>
    );
  },
});
