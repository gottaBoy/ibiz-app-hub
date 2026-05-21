import { defineComponent, PropType } from 'vue';
import { useNamespace } from '@ibiz-template/vue3-util';
import { IButtonContainerState } from '@ibiz-template/runtime';
import { IAppDEUIActionGroupDetail } from '@ibiz/model-core';
import { convertBtnType } from '../../util';
import './action-toolbar.scss';

export const IBizActionToolbar = defineComponent({
  name: 'IBizActionToolbar',
  props: {
    actionDetails: {
      type: Array<IAppDEUIActionGroupDetail>,
      required: true,
    },
    actionsState: {
      type: Object as PropType<IButtonContainerState>,
      required: true,
    },
    caption: String,
    mode: {
      type: String as PropType<'dropdown' | 'buttons'>,
      default: 'buttons',
    },
  },
  setup(props, { emit }) {
    const ns = useNamespace('action-toolbar');

    const handleClick = async (
      detail: IAppDEUIActionGroupDetail,
      event: MouseEvent,
    ) => {
      // 阻止事件冒泡 移动端
      event.stopPropagation();
      emit('action-click', detail, event);
    };

    const renderSeparator = () => {
      return <div class={ns.e('separator')}></div>;
    };

    return { ns, handleClick, renderSeparator };
  },
  render() {
    const details = this.actionDetails || [];
    // 按钮模式
    if (this.mode === 'buttons')
      return (
        <div class={[this.ns.b(), this.ns.m('buttons')]}>
          {details.length > 0 &&
            details.map(detail => {
              if (detail.detailType === 'DEUIACTIONGROUP')
                return [
                  detail.addSeparator && this.renderSeparator(),
                  <iBizActionGroup
                    direction='vertical'
                    actionDetail={detail}
                    actionsState={this.actionsState}
                    onActionClick={this.handleClick}
                    popoverClassName={this.ns.b('action-group')}
                  />,
                ];
              if (this.actionsState?.[detail.id!]?.visible) {
                const slots = {};
                if (detail.showIcon && detail.sysImage) {
                  Object.assign(slots, {
                    icon: () => {
                      return <iBizIcon icon={detail.sysImage}></iBizIcon>;
                    },
                  });
                }
                return [
                  detail.addSeparator && this.renderSeparator(),
                  <van-button
                    size='small'
                    text={detail.showCaption ? detail.caption : ''}
                    type={convertBtnType(detail)}
                    onClick={(e: MouseEvent) => this.handleClick(detail, e)}
                    disabled={this.actionsState[detail.id!].disabled}
                    class={[
                      this.ns.e('item'),
                      this.ns.is('disabled', false),
                      detail.sysCss?.codeName,
                    ]}
                  >
                    {slots}
                  </van-button>,
                ];
              }
              return null;
            })}
        </div>
      );
    // 下拉模式
    return (
      <div>{ibiz.i18n.t('component.actionToolbar.noSupportDropDown')}</div>
    );
  },
});
