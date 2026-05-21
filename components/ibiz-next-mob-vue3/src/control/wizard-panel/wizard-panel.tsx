import { useControlController, useNamespace } from '@ibiz-template/vue3-util';
import { defineComponent, PropType, resolveComponent, h } from 'vue';
import { IDEWizardEditForm, IDEWizardPanel } from '@ibiz/model-core';
import './wizard-panel.scss';
import {
  EventBase,
  IControlProvider,
  WizardPanelController,
} from '@ibiz-template/runtime';
import { showTitle } from '@ibiz-template/core';

export const WizardPanelControl = defineComponent({
  name: 'IBizWizardPanelControl',
  props: {
    /**
     * @description 向导面板模型数据
     */
    modelData: {
      type: Object as PropType<IDEWizardPanel>,
      required: true,
    },
    /**
     * @description 应用上下文对象
     */
    context: { type: Object as PropType<IContext>, required: true },
    /**
     * @description 视图参数对象
     * @default {}
     */
    params: { type: Object as PropType<IParams>, default: () => ({}) },
    /**
     * @description 部件适配器
     */
    provider: { type: Object as PropType<IControlProvider> },
  },
  setup() {
    const c = useControlController(
      (...args) => new WizardPanelController(...args),
    );

    const ns = useNamespace(`control-${c.model.controlType!.toLowerCase()}`);

    return { c, ns };
  },
  render() {
    const { activeFormTag, buttonsState } = this.c.state;
    let stepsTitle = null;
    let formComponent = null;
    let footer = null;

    // 表单绘制
    if (activeFormTag && this.c.activeWizardForm) {
      if (this.c.providers[activeFormTag]) {
        const component = resolveComponent(
          this.c.providers[activeFormTag]!.component,
        );
        const editForm = this.c.model.deeditForms?.find(_editForm => {
          return (
            activeFormTag ===
            (_editForm as IDEWizardEditForm).dewizardForm?.formTag
          );
        });
        formComponent = h(component, {
          class: this.ns.e('form'),
          modelData: editForm,
          context: this.c.context,
          params: this.c.params,
          key: activeFormTag,
          onMounted: (event: EventBase) =>
            this.c.onFormMounted(activeFormTag, event),
          onSaveSuccess: (event: EventBase) => this.c.onFormSaved(event),
        });
      }

      const { dewizard } = this.c.model;
      // 底部按钮
      footer = dewizard && (
        <div key={`${activeFormTag}footer`} class={this.ns.b('footer')}>
          {buttonsState[`${activeFormTag}@PREV`]?.visible && (
            <van-button
              class={this.ns.be('footer', 'prev')}
              onClick={(): void => {
                this.c.onPrevClick();
              }}
            >
              {dewizard.prevCaption
                ? dewizard.prevCaption
                : ibiz.i18n.t('control.wizardPanel.prev')}
            </van-button>
          )}
          {buttonsState[`${activeFormTag}@NEXT`]?.visible && (
            <van-button
              type='primary'
              class={this.ns.be('footer', 'next')}
              onClick={(): void => {
                this.c.onNextClick();
              }}
            >
              {dewizard.nextCaption
                ? dewizard.nextCaption
                : ibiz.i18n.t('control.wizardPanel.next')}
            </van-button>
          )}
          {buttonsState[`${activeFormTag}@FINISH`]?.visible && (
            <van-button
              type='primary'
              class={this.ns.be('footer', 'finish')}
              onClick={(): void => {
                this.c.onFinishClick();
              }}
            >
              {dewizard.finishCaption
                ? dewizard.finishCaption
                : ibiz.i18n.t('control.wizardPanel.finish')}
            </van-button>
          )}
        </div>
      );

      const { dewizardSteps } = dewizard!;
      if (
        this.c.model.showStepBar &&
        dewizardSteps &&
        dewizardSteps.length > 0
      ) {
        const active = this.c.steps.indexOf(
          this.c.stepTags[
            `${
              this.c.model.name
            }_form_${this.c.state.activeFormTag?.toLowerCase()}`
          ],
        );
        stepsTitle = (
          <van-steps active={active}>
            {dewizardSteps.map(step => {
              const _slot = {
                default: () => (
                  <span
                    class={[
                      this.ns.bm('header', 'title'),
                      step.titleSysCss?.cssName,
                    ]}
                  >
                    {showTitle(step.title)}
                  </span>
                ),
              };
              if (step.sysImage) {
                const icon = (
                  <iBizIcon
                    class={this.ns.bm('header', 'step-icon')}
                    icon={step.sysImage}
                  />
                );
                Object.assign(_slot, {
                  'active-icon': icon,
                  'finish-icon': icon,
                  'inactive-icon': icon,
                });
              }
              return <van-step>{_slot}</van-step>;
            })}
          </van-steps>
        );
      }
    }
    return (
      <iBizControlBase
        controller={this.c}
        class={[this.ns.b(), this.ns.is('header', this.c.model.showStepBar)]}
      >
        {stepsTitle}
        {formComponent}
        {footer}
      </iBizControlBase>
    );
  },
});
