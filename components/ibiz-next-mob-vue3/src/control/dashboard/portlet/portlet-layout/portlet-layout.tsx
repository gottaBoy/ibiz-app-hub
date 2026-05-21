/* eslint-disable no-nested-ternary */
import { useNamespace } from '@ibiz-template/vue3-util';
import { computed, defineComponent } from 'vue';
import { IControlRender, IUIActionGroupDetail } from '@ibiz/model-core';
import './portlet-layout.scss';
import { PortletPartController, ScriptFactory } from '@ibiz-template/runtime';

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
  },
  setup(props) {
    const ns = useNamespace('portlet-layout');
    const c = props.controller;
    // 处理标题
    const isShowHeader = computed(() => {
      if (c.model.portletType === 'RAWITEM') {
        return false;
      }
      return (
        (c.model.showTitleBar && (c.model.title || c.model.sysImage)) ||
        c.model.uiactionGroup
      );
    });

    // 点击工具栏处理
    const onActionClick = async (
      detail: IUIActionGroupDetail,
      event: MouseEvent,
    ) => {
      await props.controller.onActionClick(detail, event);
    };

    // 部件绘制器
    const controlRenders = c.dashboard.model.controlRenders;

    // 头部绘制器
    const header = controlRenders?.find(
      item => `dashboard_${item.id}` === `${c.model.name}_mob_header`,
    );

    // 头部标题绘制器
    const headerCaption = controlRenders?.find(
      item => `dashboard_${item.id}` === `${c.model.name}_mob_header_caption`,
    );

    // 头部背景绘制器
    const headerBg = controlRenders?.find(
      item => `dashboard_${item.id}` === `${c.model.name}_mob_header_bg`,
    );

    // 头部行为组绘制器
    const headerAction = controlRenders?.find(
      item => `dashboard_${item.id}` === `${c.model.name}_mob_header_action`,
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
      ns,
      isShowHeader,
      header,
      headerCaption,
      headerBg,
      headerAction,
      renderContent,
      onActionClick,
    };
  },
  render() {
    const { model, state } = this.$props.controller;
    const isCustom = !!(
      this.header ||
      this.headerCaption ||
      this.headerBg ||
      this.headerAction
    );
    let headerRender = null;
    if (this.isShowHeader) {
      if (this.header) {
        headerRender = (
          <div
            key='header'
            class={[this.ns.b('header'), this.ns.is('custom', isCustom)]}
          >
            {this.renderContent(this.header)}
          </div>
        );
      } else {
        headerRender = (
          <div
            key='header'
            class={[this.ns.b('header'), this.ns.is('custom', isCustom)]}
          >
            {this.headerBg && (
              <div class={this.ns.be('header', 'bg')}>
                {this.renderContent(this.headerBg)}
              </div>
            )}
            <div class={this.ns.be('header', 'left')}>
              {model.showTitleBar &&
                (this.headerCaption ? (
                  this.renderContent(this.headerCaption)
                ) : (
                  <div class={this.ns.e('caption')}>
                    <iBizIcon
                      class={this.ns.e('caption-icon')}
                      icon={model.sysImage}
                    ></iBizIcon>
                    <div class={this.ns.e('caption-text')} title={model.title}>
                      {model.title}
                    </div>
                  </div>
                ))}
            </div>
            <div class={this.ns.be('header', 'right')}>
              {this.controller.model.portletType === 'ACTIONBAR'
                ? null
                : this.headerAction
                  ? this.renderContent(this.headerAction)
                  : model.uiactionGroup && (
                      <iBizActionToolbar
                        class={this.ns.e('toolbar')}
                        action-details={
                          model.uiactionGroup.uiactionGroupDetails
                        }
                        actions-state={state.actionGroupState}
                        onActionClick={this.onActionClick}
                      ></iBizActionToolbar>
                    )}
            </div>
          </div>
        );
      }
    }
    if (
      model.enableAnchor &&
      this.controller.dashboard.model.showDashboardNavBar
    ) {
      headerRender = (
        <van-index-anchor index={model.title || model.id}>
          {headerRender}
        </van-index-anchor>
      );
    }
    return (
      <div class={[this.ns.b(), this.ns.is('no-header', !this.isShowHeader)]}>
        {headerRender}
        <div key='content' class={this.ns.b('content')}>
          {this.$slots.default?.()}
        </div>
      </div>
    );
  },
});
