/* eslint-disable no-nested-ternary */
// eslint-disable no-unneeded-ternary
import { useNamespace } from '@ibiz-template/vue3-util';
import { computed, defineComponent, PropType } from 'vue';
import { IControlRender, IUIActionGroupDetail } from '@ibiz/model-core';
import { PortletPartController, ScriptFactory } from '@ibiz-template/runtime';
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

    // 部件绘制器
    const controlRenders = c.dashboard.model.controlRenders;

    // 头部绘制器
    const header = controlRenders?.find(
      item => `dashboard_${item.id}` === `${c.model.name}_header`,
    );

    // 头部标题绘制器
    const headerCaption = controlRenders?.find(
      item => `dashboard_${item.id}` === `${c.model.name}_header_caption`,
    );

    // 头部背景绘制器
    const headerBg = controlRenders?.find(
      item => `dashboard_${item.id}` === `${c.model.name}_header_bg`,
    );

    // 头部行为组绘制器
    const headerAction = controlRenders?.find(
      item => `dashboard_${item.id}` === `${c.model.name}_header_action`,
    );

    // 渲染绘制器内容
    const renderContent = (model: IControlRender) => {
      if (model.renderType === 'LAYOUTPANEL_MODEL' && model.layoutPanelModel) {
        const htmlCode = ScriptFactory.execScriptFn(
          {
            params: c.params,
            context: c.context,
          },
          model.layoutPanelModel,
          { isAsync: false },
        ) as string;
        return <div class={ns.b('header-render')} v-html={htmlCode}></div>;
      }
      if (model.renderType === 'LAYOUTPANEL' && model.layoutPanel) {
        return (
          <iBizControlShell
            class={ns.b('header-render')}
            params={c.params}
            context={c.context}
            modelData={model.layoutPanel}
          ></iBizControlShell>
        );
      }
    };

    return {
      c,
      ns,
      zIndex,
      popperClass,
      portletType,
      isShowHeader,
      header,
      headerCaption,
      headerBg,
      headerAction,
      renderContent,
      openLink,
      clickPorlet,
      onActionClick,
    };
  },
  render() {
    const { model, state } = this.controller;
    const isCustom = !!(
      this.header ||
      this.headerCaption ||
      this.headerBg ||
      this.headerAction
    );
    return (
      <div
        class={[
          this.ns.b(),
          this.ns.is('no-header', !this.isShowHeader),
          this.ns.is('hight-light', state.hightLight),
        ]}
      >
        {this.isShowHeader ? (
          this.header ? (
            <div
              key='header'
              class={[this.ns.b('header'), this.ns.is('custom', isCustom)]}
            >
              {this.renderContent(this.header)}
            </div>
          ) : (
            <div
              key='header'
              class={[this.ns.b('header'), this.ns.is('custom', isCustom)]}
            >
              {this.headerBg && (
                <div class={this.ns.be('header', 'bg')}>
                  {this.renderContent(this.headerBg)}
                </div>
              )}
              <div
                class={this.ns.be('header', 'left')}
                onClick={(event: MouseEvent) =>
                  this.clickPorlet(event, 'title')
                }
              >
                {model.showTitleBar &&
                  (this.headerCaption ? (
                    this.renderContent(this.headerCaption)
                  ) : (
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
                  ))}
              </div>
              <div class={this.ns.be('header', 'right')}>
                {this.headerAction
                  ? this.renderContent(this.headerAction)
                  : model.portletType !== 'ACTIONBAR' &&
                    model.uiactionGroup && (
                      <iBizActionToolbar
                        zIndex={this.zIndex}
                        class={this.ns.e('toolbar')}
                        action-details={
                          model.uiactionGroup.uiactionGroupDetails
                        }
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
          )
        ) : null}
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
