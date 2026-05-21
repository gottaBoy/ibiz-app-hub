import { IBizIcon, useNamespace } from '@ibiz-template/vue3-util';
import {
  ref,
  PropType,
  defineComponent,
  watch,
  onUnmounted,
  computed,
} from 'vue';
import { showTitle } from '@ibiz-template/core';
import { FormItemController } from '@ibiz-template/runtime';
import './form-item-container.scss';

export const IBizFormItemContainer = defineComponent({
  name: 'IBizFormItemContainer',
  props: {
    controller: {
      type: Object as PropType<FormItemController>,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('form-item-container');
    const c = props.controller;
    const visible = ref(false);
    const { sysImage, enableInputTip, labelPos } = c.model;

    watch(
      () => visible.value,
      () => {
        if (visible.value) c.loadInputTip();
      },
    );

    onUnmounted(() => c.clearTipsCache());

    const showError = computed(() => {
      const { validateMode } = c.form;
      return validateMode === 'default';
    });

    const renderTipContent = () => {
      const { inputTip } = c.state;
      switch (ibiz.config.tooltiprendermode) {
        case 'none':
          return <span class={ns.m('text')}>{inputTip}</span>;
        case 'html':
          return <div class={ns.m('html')} v-html={inputTip}></div>;
        case 'md':
        default:
          return <iBizMarkDown value={inputTip} disabled={true}></iBizMarkDown>;
      }
    };

    const renderTipsIcon = () => {
      return (
        <el-tooltip
          effect='light'
          v-model:visible={visible.value}
          popper-class={[
            ns.e('popper'),
            ns.is(ibiz.config.tooltiprendermode.toLowerCase(), true),
          ]}
          disabled={!enableInputTip}
          placement={labelPos === 'RIGHT' ? 'right' : 'left'}
        >
          {{
            default: () => {
              return (
                <ion-icon
                  name='bulb-outline'
                  class={ns.em('label', 'icon')}
                ></ion-icon>
              );
            },
            content: () => {
              return (
                <div class={ns.em('popper', 'content')}>
                  <div class={ns.em('popper', 'tooltip')}>
                    {renderTipContent()}
                  </div>
                  {c.state.inputTipUrl && (
                    <a
                      target='_blank'
                      href={c.state.inputTipUrl}
                      title={ibiz.i18n.t('component.formItemContainer.more')}
                    >
                      {ibiz.i18n.t('component.formItemContainer.more')}
                    </a>
                  )}
                </div>
              );
            },
          }}
        </el-tooltip>
      );
    };

    const renderLabelWithoutTips = () => {
      return (
        <el-tooltip
          effect='light'
          v-model:visible={visible.value}
          popper-class={[
            ns.e('popper'),
            ns.is(ibiz.config.tooltiprendermode.toLowerCase(), true),
          ]}
          disabled={!enableInputTip}
          placement={labelPos === 'RIGHT' ? 'right' : 'left'}
        >
          {{
            default: () => {
              return (
                <div
                  class={[
                    ns.em('label', 'content'),
                    ns.is('tooltip', enableInputTip),
                  ]}
                >
                  {sysImage && (
                    <IBizIcon
                      class={ns.em('label', 'icon')}
                      icon={sysImage}
                    ></IBizIcon>
                  )}
                  <div
                    class={ns.em('label', 'text')}
                    title={
                      enableInputTip ? undefined : showTitle(c.labelCaption)
                    }
                  >
                    {c.labelCaption}
                  </div>
                </div>
              );
            },
            content: () => {
              return (
                <div class={ns.em('popper', 'content')}>
                  <div class={ns.em('popper', 'tooltip')}>
                    {renderTipContent()}
                  </div>
                  {c.state.inputTipUrl && (
                    <a
                      target='_blank'
                      href={c.state.inputTipUrl}
                      title={ibiz.i18n.t('component.formItemContainer.more')}
                    >
                      {ibiz.i18n.t('component.formItemContainer.more')}
                    </a>
                  )}
                </div>
              );
            },
          }}
        </el-tooltip>
      );
    };
    const renderLabel = () => {
      const form = props.controller.form;
      const showTipsIcon = enableInputTip && form.showTipsIcon;
      return (
        <div class={[ns.e('label'), ...(c.labelClass || [])]}>
          {showTipsIcon && (
            <div
              class={[
                ns.em('label', 'content'),
                ns.is('tooltip', enableInputTip),
              ]}
            >
              {renderTipsIcon()}
              {sysImage && (
                <IBizIcon
                  class={ns.em('label', 'icon')}
                  icon={sysImage}
                ></IBizIcon>
              )}
              <div
                class={ns.em('label', 'text')}
                title={showTitle(c.labelCaption)}
              >
                {c.labelCaption}
              </div>
            </div>
          )}
          {!showTipsIcon && renderLabelWithoutTips()}
        </div>
      );
    };

    return { ns, showError, renderLabel };
  },
  render() {
    const { labelPos, labelWidth } = this.controller.model;
    // 内容区，包含编辑器和错误消息
    const content = (
      <div
        class={[
          this.ns.e('content'),
          this.ns.em('content', `label-${labelPos?.toLowerCase()}`),
        ]}
      >
        <div class={[this.ns.e('editor')]}>{this.$slots.default?.()}</div>
        {this.showError && this.controller.state.error ? (
          <div
            title={showTitle(this.controller.state.error)}
            class={[this.ns.e('error')]}
          >
            {this.controller.state.error}
          </div>
        ) : null}
      </div>
    );

    return (
      <div
        class={[
          this.ns.b(),
          this.ns.m(labelPos?.toLowerCase()),
          this.ns.is('required', this.controller.state.required),
          this.ns.is('error', !!this.controller.state.error),
        ]}
        style={this.ns.cssVarBlock({
          'label-width': `${labelWidth || 130}px`,
        })}
      >
        {labelPos && ['LEFT', 'TOP'].includes(labelPos) && this.renderLabel()}
        {content}
        {labelPos &&
          ['RIGHT', 'BOTTOM'].includes(labelPos) &&
          this.renderLabel()}
      </div>
    );
  },
});
