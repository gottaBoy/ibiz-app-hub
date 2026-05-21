import { FormGroupPanelController } from '@ibiz-template/runtime';
import { useNamespace } from '@ibiz-template/vue3-util';
import { IDEFormGroupPanel, IUIActionGroupDetail } from '@ibiz/model-core';
import { computed, defineComponent, PropType, VNode } from 'vue';
import './form-group-panel.scss';

export const FormGroupPanel = defineComponent({
  name: 'IBizFormGroupPanel',
  props: {
    modelData: {
      type: Object as PropType<IDEFormGroupPanel>,
      required: true,
    },
    controller: {
      type: FormGroupPanelController,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('form-group');
    const c = props.controller;

    const zIndex = props.controller.form.state.zIndex;

    const changeCollapse = (): void => {
      if (!c.disableClose) {
        c.state.collapse = !c.state.collapse;
      }
    };

    // 点击工具栏处理
    const onActionClick = async (
      detail: IUIActionGroupDetail,
      event: MouseEvent,
    ): Promise<void> => {
      const tempParams = { srfgroupid: props.modelData.codeName };
      await props.controller.onActionClick(detail, event, tempParams);
    };

    const captionText = computed(() => {
      const { captionItemName, caption } = props.modelData;
      if (captionItemName) {
        return props.controller.data[captionItemName];
      }
      return caption;
    });

    return { ns, zIndex, captionText, changeCollapse, onActionClick };
  },
  render() {
    const { state } = this.controller;
    const defaultSlots: VNode[] = this.$slots.default?.() || [];
    const content = (
      <iBizRow
        class={this.ns.be('content', 'row')}
        layout={this.modelData.layout}
      >
        {defaultSlots.map(slot => {
          const props = slot.props as IData;
          if (!props || !props.controller) {
            return slot;
          }

          return (
            <iBizCol
              layoutPos={props.modelData.layoutPos}
              state={props.controller.state}
            >
              {slot}
            </iBizCol>
          );
        })}
      </iBizRow>
    );
    const classArr: string[] = [
      this.ns.b(),
      this.ns.m(this.modelData.codeName),
      this.modelData.detailStyle
        ? this.ns.m(this.modelData.detailStyle.toLowerCase())
        : '',
      ...this.controller.containerClass,
    ];
    if (this.modelData.showCaption === true) {
      classArr.push(this.ns.m('show-header'));
      classArr.push(this.ns.b('collapse'));
      classArr.push(this.ns.is('collapse', this.controller.state.collapse));
      if (this.controller.disableClose) {
        classArr.push(this.ns.bm('collapse', 'disable-close'));
      }
      if (this.modelData.showMoreMode === 2) {
        classArr.push(this.ns.m('show-more'));
      }
    }

    // 头部绘制
    let header: unknown = null;
    if (this.modelData.showCaption) {
      header = (
        <div
          class={[this.ns.b('header')]}
          onClick={this.changeCollapse}
          style={this.controller.model.labelCssStyle}
        >
          <div class={[this.ns.be('header', 'left')]}>
            <div class={[this.ns.e('caption'), ...this.controller.labelClass]}>
              {this.modelData.sysImage && (
                <iBizIcon
                  class={this.ns.em('caption', 'icon')}
                  icon={this.modelData.sysImage}
                ></iBizIcon>
              )}
              {this.captionText}
            </div>
          </div>
          <div class={[this.ns.be('header', 'right')]}>
            {this.modelData.uiactionGroup && (
              <iBizActionToolbar
                zIndex={this.zIndex}
                class={this.ns.e('toolbar')}
                action-details={
                  this.modelData.uiactionGroup.uiactionGroupDetails
                }
                actions-state={state.actionGroupState}
                onActionClick={this.onActionClick}
                caption={this.modelData.uiactionGroup.name}
                mode={
                  this.modelData.actionGroupExtractMode === 'ITEMS'
                    ? 'dropdown'
                    : 'buttons'
                }
              ></iBizActionToolbar>
            )}
            {this.modelData.titleBarCloseMode !== undefined &&
              this.modelData.titleBarCloseMode !== 0 &&
              (this.controller.state.collapse ? (
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 1024 1024'
                  width='1em'
                  height='1em'
                  class={this.ns.be('header', 'icon')}
                >
                  <title>{ibiz.i18n.t('control.form.formGroup.unfold')}</title>
                  <path
                    fill='currentColor'
                    d='M340.864 149.312a30.592 30.592 0 0 0 0 42.752L652.736 512 340.864 831.872a30.592 30.592 0 0 0 0 42.752 29.12 29.12 0 0 0 41.728 0L714.24 534.336a32 32 0 0 0 0-44.672L382.592 149.376a29.12 29.12 0 0 0-41.728 0z'
                  ></path>
                </svg>
              ) : (
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 1024 1024'
                  width='1em'
                  height='1em'
                  class={this.ns.be('header', 'icon')}
                >
                  <title>{ibiz.i18n.t('control.form.formGroup.fold')}</title>
                  <path
                    fill='currentColor'
                    d='M831.872 340.864 512 652.672 192.128 340.864a30.592 30.592 0 0 0-42.752 0 29.12 29.12 0 0 0 0 41.6L489.664 714.24a32 32 0 0 0 44.672 0l340.288-331.712a29.12 29.12 0 0 0 0-41.728 30.592 30.592 0 0 0-42.752 0z'
                  ></path>
                </svg>
              ))}
          </div>
        </div>
      );
    }

    // 底部绘制
    let footer: unknown = null;
    if (this.modelData.showMoreMode === 2) {
      footer = (
        <div class={[this.ns.b('footer')]}>
          <div
            class={this.ns.be('footer', 'show-more-button')}
            onClick={(): void => {
              state.isShowMore = !state.isShowMore;
            }}
          >
            {!state.isShowMore
              ? ibiz.i18n.t('control.form.formGroupPanel.showMore')
              : ibiz.i18n.t('app.retract')}
          </div>
        </div>
      );
    }

    return (
      <div
        class={classArr}
        v-loading={this.controller.state.loading}
        id={`${this.controller.form.view.model.codeName}_${this.controller.form.model.codeName}_${this.modelData.codeName}`}
        onClick={(event: MouseEvent) => this.controller.onClick(event)}
      >
        {header}
        <div
          class={this.ns.b('content')}
          style={this.controller.model.cssStyle}
        >
          {content}
        </div>
        {footer}
      </div>
    );
  },
});
export default FormGroupPanel;
