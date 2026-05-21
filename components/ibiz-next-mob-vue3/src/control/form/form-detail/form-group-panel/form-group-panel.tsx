import { FormGroupPanelController } from '@ibiz-template/runtime';
import { useNamespace } from '@ibiz-template/vue3-util';
import { IDEFormGroupPanel, IUIActionGroupDetail } from '@ibiz/model-core';
import { computed, defineComponent, PropType, ref, VNode } from 'vue';
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
    const isCollapse = ref(!props.controller.defaultExpansion);

    const changeCollapse = () => {
      if (!props.controller.disableClose) {
        isCollapse.value = !isCollapse.value;
      }
    };

    // 点击工具栏处理
    const onActionClick = async (
      detail: IUIActionGroupDetail,
      event: MouseEvent,
    ) => {
      await props.controller.onActionClick(detail, event);
    };

    const captionText = computed(() => {
      const { captionItemName } = props.modelData;
      if (captionItemName) {
        return props.controller.data[captionItemName];
      }
      return props.modelData.caption;
    });

    return { ns, isCollapse, captionText, changeCollapse, onActionClick };
  },
  render() {
    const { state } = this.controller;
    const { enableAnchor } = this.modelData;
    const defaultSlots: VNode[] = this.$slots.default?.() || [];
    const content = (
      <iBizRow slot='content' layout={this.modelData.layout}>
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
    const { detailStyle = 'DEFAULT' } = this.modelData;
    const classArr: string[] = [
      this.ns.b(),
      this.ns.m(this.modelData.codeName),
      this.ns.m(detailStyle.toLowerCase()),
      ...this.controller.containerClass,
    ];
    if (this.modelData.showCaption === true) {
      classArr.push(this.ns.m('show-header'));
      classArr.push(this.ns.b('collapse'));
      classArr.push(this.ns.is('collapse', this.isCollapse));
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
        <div class={[this.ns.b('header')]} onClick={this.changeCollapse}>
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
          {this.modelData.uiactionGroup && (
            <div class={[this.ns.be('header', 'right')]}>
              <iBizActionToolbar
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
            </div>
          )}
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
            onClick={() => {
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
        class={[classArr, this.ns.is('loading', this.controller.state.loading)]}
        onClick={(event: MouseEvent) => this.controller.onClick(event)}
      >
        {enableAnchor ? (
          <van-index-anchor index={this.captionText}>{header}</van-index-anchor>
        ) : (
          header
        )}
        <div class={[this.ns.e('content')]}>{content}</div>
        {footer}
        {this.controller.state.loading ? (
          <van-loading
            class={this.ns.e('loading')}
            type='spinner'
            vertical={true}
          >{`${ibiz.i18n.t('util.loading')}...`}</van-loading>
        ) : null}
      </div>
    );
  },
});
export default FormGroupPanel;
