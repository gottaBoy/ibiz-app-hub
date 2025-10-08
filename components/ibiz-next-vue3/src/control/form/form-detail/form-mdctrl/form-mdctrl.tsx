import { defineComponent, PropType } from 'vue';
import { useController, useNamespace } from '@ibiz-template/vue3-util';
import { IDEFormMDCtrl, IUIActionGroupDetail } from '@ibiz/model-core';
import { FormMDCtrlController } from '@ibiz-template/runtime';
import './form-mdctrl.scss';

export const FormMDCtrl = defineComponent({
  name: 'IBizFormMDCtrl',
  props: {
    modelData: {
      type: Object as PropType<IDEFormMDCtrl>,
      required: true,
    },
    controller: {
      type: FormMDCtrlController,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('form-mdctrl');
    useController(props.controller);

    const c = props.controller;
    const zIndex = props.controller.form.state.zIndex;
    const hasCaption = c.model.showCaption && !!c.model.caption;
    const hasHeader = hasCaption || c.model.uiactionGroup;

    // 是否处于设计预览状态
    const isDesignPreview = c.context?.srfrunmode === 'DESIGN';

    const onActionClick = async (
      detail: IUIActionGroupDetail,
      event: MouseEvent,
    ): Promise<void> => {
      await props.controller.onActionClick(detail, event);
    };

    return {
      c,
      ns,
      zIndex,
      hasHeader,
      hasCaption,
      isDesignPreview,
      onActionClick,
    };
  },
  render() {
    if (this.isDesignPreview) {
      return (
        <div class={this.ns.b()}>
          <div class={this.ns.b('preview-content')}>
            {ibiz.i18n.t('control.form.formMDctrl.defaultText')}
          </div>
        </div>
      );
    }
    const { model } = this.c;
    let content;

    // 根据内容类型绘制内容组件
    switch (model.contentType) {
      case 'GRID':
      case 'LIST':
      case 'DATAVIEW':
        content = <iBizFormMDCtrlMD controller={this.c} />;
        break;
      case 'FORM':
        content = <iBizFormMDCtrlForm controller={this.c} />;
        break;
      case 'REPEATER':
        content = <iBizFormMDCtrlRepeater controller={this.c} />;
        break;
      default:
        <div>{ibiz.i18n.t('app.noSupport')}</div>;
        break;
    }
    return (
      <div
        class={[
          this.ns.b(),
          this.ns.m(this.modelData.codeName),
          ...this.controller.containerClass,
          this.hasCaption ? this.ns.m('show-caption') : '',
        ]}
      >
        {this.hasHeader && (
          <div class={this.ns.b('header')}>
            <div class={this.ns.e('title')}>
              {this.hasCaption ? this.c.model.caption : ''}
            </div>
            {model.uiactionGroup && (
              <iBizActionToolbar
                zIndex={this.zIndex}
                class={this.ns.e('toolbar')}
                action-details={model.uiactionGroup.uiactionGroupDetails}
                actions-state={this.controller.state.actionGroupState}
                onActionClick={this.onActionClick}
              ></iBizActionToolbar>
            )}
          </div>
        )}
        {content}
      </div>
    );
  },
});

export default FormMDCtrl;
