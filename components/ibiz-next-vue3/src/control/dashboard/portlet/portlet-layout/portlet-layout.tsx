import { useNamespace } from '@ibiz-template/vue3-util';
import { computed, defineComponent, PropType } from 'vue';
import { IUIActionGroupDetail } from '@ibiz/model-core';
import { PortletPartController } from '@ibiz-template/runtime';
import { showTitle } from '@ibiz-template/core';
import './portlet-layout.scss';

/**
 * 门户控件布局
 */
export const PortletLayout = defineComponent({
  name: 'IBizPortletLayout',
  props: {
    controller: {
      type: PortletPartController,
      required: true,
    },
    linkAction: {
      type: Object as PropType<IUIActionGroupDetail>,
    },
  },
  setup(props) {
    const ns = useNamespace('portlet-layout');
    const portletType = `portlet-${props.controller.model.portletType?.toLowerCase()}`;
    const c = props.controller;
    const zIndex = props.controller.dashboard.state.zIndex;
    const popperClass = computed(() => {
      const classNames = [ns.em('toolbar', `${portletType}-${c.model.id}`)];
      const { codeName } = c.dashboard.view.model;
      classNames.push(ns.em('toolbar', codeName));
      return classNames;
    });

    // 处理标题
    const isShowHeader = computed(() => {
      return (
        (c.model.showTitleBar && (c.model.title || c.model.sysImage)) ||
        c.model.uiactionGroup
      );
    });

    // 点击工具栏处理
    const onActionClick = async (
      detail: IUIActionGroupDetail,
      event: MouseEvent,
    ): Promise<void> => {
      await props.controller.onActionClick(detail, event);
    };

    // 打开标题链接
    const openLink = (event: MouseEvent) => {
      if (props.linkAction) {
        props.controller.onActionClick(props.linkAction, event);
      }
    };

    const clickPorlet = (event: MouseEvent, position: string) => {
      event.stopPropagation();
      c.dashboard.view.evt.emit('onPorletClick', {
        data: {
          tag: c.model.codeName,
          position,
        },
      });
    };

    return {
      c,
      ns,
      zIndex,
      popperClass,
      portletType,
      isShowHeader,
      openLink,
      clickPorlet,
      onActionClick,
    };
  },
  render() {
    const { model, state } = this.controller;
    return (
      <div
        class={[
          this.ns.b(),
          this.ns.is('no-header', !this.isShowHeader),
          this.ns.is('hight-light', state.hightLight),
        ]}
      >
        {this.isShowHeader && (
          <div key='header' class={this.ns.b('header')}>
            <div
              class={this.ns.be('header', 'left')}
              onClick={(event: MouseEvent) => this.clickPorlet(event, 'title')}
            >
              {model.showTitleBar && (
                <div
                  class={[
                    this.ns.e('caption'),
                    this.ns.is('link', !!this.linkAction),
                  ]}
                  onClick={this.openLink}
                >
                  <iBizIcon
                    class={this.ns.e('caption-icon')}
                    icon={model.sysImage}
                  ></iBizIcon>
                  <span
                    class={this.ns.e('caption-text')}
                    title={showTitle(state.title)}
                  >
                    {state.title}
                  </span>
                </div>
              )}
            </div>
            <div class={this.ns.be('header', 'right')}>
              {model.portletType !== 'ACTIONBAR' && model.uiactionGroup && (
                <iBizActionToolbar
                  zIndex={this.zIndex}
                  class={this.ns.e('toolbar')}
                  action-details={model.uiactionGroup.uiactionGroupDetails}
                  actions-state={state.actionGroupState}
                  mode={
                    model.actionGroupExtractMode === 'ITEMS'
                      ? 'dropdown'
                      : 'buttons'
                  }
                  popperClass={this.popperClass}
                  onActionClick={this.onActionClick}
                ></iBizActionToolbar>
              )}
            </div>
          </div>
        )}
        <div
          key='content'
          class={this.ns.b('content')}
          onClick={(event: MouseEvent) => this.clickPorlet(event, 'content')}
        >
          {this.$slots.default?.()}
        </div>
      </div>
    );
  },
});
