/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { defineComponent, PropType, ref, VNode } from 'vue';
import { useController, useNamespace } from '@ibiz-template/vue3-util';
import './form-tab-panel.scss';
import { IDEFormTabPanel } from '@ibiz/model-core';
import {
  FormTabPanelController,
  FormTabPageController,
} from '@ibiz-template/runtime';

export const FormTabPanel = defineComponent({
  name: 'IBizFormTabPanel',
  props: {
    modelData: {
      type: Object as PropType<IDEFormTabPanel>,
      required: true,
    },
    controller: {
      type: FormTabPanelController,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('form-tab-panel');
    useController(props.controller);
    const popoverVisible = ref(false);

    const triggerClick = (key: string, event: MouseEvent) => {
      // 触发对应FormTabPage的点击事件
      const pageC = props.controller.form.details[key] as FormTabPageController;
      if (pageC) {
        pageC.onClick(event);
      }
    };

    const onTabClick = (tabIns: IData, event: MouseEvent) => {
      props.controller.onTabChange(tabIns.props.name);
      triggerClick(tabIns.props.name, event);
    };

    const onPopoverClick = (key: string, event: MouseEvent) => {
      props.controller.selectTab(key);
      popoverVisible.value = false;
      triggerClick(key, event);
    };

    const renderAllTabContent = () => {
      return (
        <div class={ns.be('tab-panel-container-style2', 'content')}>
          {props.modelData.deformTabPages?.map(page => {
            return (
              <div
                class={[
                  ns.be('tab-panel-container-style2', 'tab-item-content'),
                  ns.is('active', page.id === props.controller.state.activeTab),
                ]}
                onClick={(event: MouseEvent) =>
                  onPopoverClick(page.codeName!, event)
                }
                title={page.caption}
              >
                {page.caption}
              </div>
            );
          })}
        </div>
      );
    };

    return {
      ns,
      popoverVisible,
      onTabClick,
      renderAllTabContent,
    };
  },
  render() {
    const isStyle2 = this.modelData.detailStyle === 'STYLE2';
    const defaultSlots: VNode[] = this.$slots.default?.() || [];
    const renderItemText = (c: FormTabPageController) => {
      return (
        <span class={[this.ns.b('tab-item-content'), ...c.labelClass]}>
          {c.model.sysImage && <iBizIcon icon={c.model.sysImage} />}
          {c.model.showCaption && c.model.caption}
        </span>
      );
    };
    const tabContent = (
      <el-tabs
        class={[
          this.ns.b(),
          this.ns.m(this.modelData.codeName),
          this.modelData.detailStyle
            ? this.ns.m(this.modelData.detailStyle.toLowerCase())
            : '',
          ...this.controller.containerClass,
        ]}
        model-value={this.controller.state.activeTab}
        v-loading={this.controller.state.loading && !isStyle2}
        onTabClick={this.onTabClick}
      >
        {defaultSlots.map(slot => {
          const props = slot.props as IData;
          if (!props || !props.controller) {
            return slot;
          }
          const c = props.controller as FormTabPageController;
          // 不显示且不用保活时直接不绘制
          if (!c.state.visible && !c.state.keepAlive) {
            return null;
          }
          return (
            <el-tab-pane
              class={this.ns.b('tab-item')}
              label={c.model.caption}
              name={c.model.id}
              lazy
            >
              {{
                default: (): VNode => slot,
                label: (): JSX.Element => {
                  const value = c.model.counterId
                    ? this.controller.state.counterData[c.model.counterId]
                    : undefined;
                  return c.model.counterId ? (
                    <el-badge
                      class={[
                        this.ns.e('badge'),
                        this.ns.is(
                          'no-counter',
                          (!value && value !== 0) ||
                            (c.model.counterMode === 1 && value <= 0),
                        ),
                      ]}
                      data-value={value}
                      value={value}
                      hidden={
                        (!value && value !== 0) ||
                        (c.model.counterMode === 1 && value <= 0)
                      }
                      max={99}
                    >
                      {renderItemText(c)}
                    </el-badge>
                  ) : (
                    renderItemText(c)
                  );
                },
              }}
            </el-tab-pane>
          );
        })}
      </el-tabs>
    );
    if (this.modelData.detailStyle === 'STYLE2') {
      return (
        <div
          class={this.ns.b('tab-panel-container-style2')}
          v-loading={this.controller.state.loading}
        >
          {tabContent}
          <el-popover
            trigger='click'
            placement='top-end'
            v-model:visible={this.popoverVisible}
            popper-class={this.ns.be('tab-panel-container-style2', 'popover')}
          >
            {{
              reference: () => {
                return (
                  <div
                    class={this.ns.be('tab-panel-container-style2', 'select')}
                  >
                    <div
                      class={this.ns.bem(
                        'tab-panel-container-style2',
                        'select',
                        'title',
                      )}
                    >
                      {ibiz.i18n.t('control.form.formTabPnel.all')}
                    </div>
                    <ion-icon name='caret-down-outline'></ion-icon>
                  </div>
                );
              },
              default: () => {
                return this.renderAllTabContent();
              },
            }}
          </el-popover>
        </div>
      );
    }
    return tabContent;
  },
});
export default FormTabPanel;
