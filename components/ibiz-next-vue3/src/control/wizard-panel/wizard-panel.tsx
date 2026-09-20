import {
  IBizIcon,
  useControlController,
  useNamespace,
} from '@ibiz-template/vue3-util';
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
    let content = null;

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
          context: Object.assign(this.c.context, { srfsilent: true }),
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
            <el-button
              onClick={(): void => {
                this.c.onPrevClick();
              }}
            >
              {dewizard.prevCaption
                ? dewizard.prevCaption
                : ibiz.i18n.t('control.common.retreat')}
            </el-button>
          )}
          {buttonsState[`${activeFormTag}@NEXT`]?.visible && (
            <el-button
              onClick={(): void => {
                this.c.onNextClick();
              }}
            >
              {dewizard.nextCaption
                ? dewizard.nextCaption
                : ibiz.i18n.t('control.common.forward')}
            </el-button>
          )}
          {buttonsState[`${activeFormTag}@FINISH`]?.visible && (
            <el-button
              onClick={(): void => {
                this.c.onFinishClick();
              }}
            >
              {dewizard.finishCaption
                ? dewizard.finishCaption
                : ibiz.i18n.t('app.complete')}
            </el-button>
          )}
        </div>
      );

      const { dewizardSteps } = dewizard!;
      if (
        this.c.model.showStepBar &&
        dewizardSteps &&
        dewizardSteps.length > 0
      ) {
        let active = this.c.steps.indexOf(
          this.c.stepTags[
            `${
              this.c.model.name
            }_form_${this.c.state.activeFormTag?.toLowerCase()}`
          ],
        );
        if (active === -1) active = 0;

        stepsTitle = (
          <el-steps
            class={this.ns.b('header')}
            align-center
            finish-status='success'
            active={active}
          >
            {dewizardSteps.map(step => {
              const _slot = {
                title: () => (
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
                Object.assign(_slot, {
                  icon: () => (
                    <IBizIcon
                      class={this.ns.bm('header', 'step-icon')}
                      icon={step.sysImage}
                    />
                  ),
                });
              }
              return <el-step>{_slot}</el-step>;
            })}
          </el-steps>
        );
      }

      // Keep the dynamic form and footer under one stable element. Form
      // providers may render fragments while switching steps, which is
      // unsafe when they are siblings of other dynamic slot children.
      content = (
        <div key={`${activeFormTag}content`} class={this.ns.e('content')}>
          {formComponent}
          {footer}
        </div>
      );
    }
    return (
      <iBizControlBase
        controller={this.c}
        class={[this.ns.b(), this.ns.is('header', this.c.model.showStepBar)]}
      >
        {stepsTitle}
        {content}
      </iBizControlBase>
    );
  },
});
