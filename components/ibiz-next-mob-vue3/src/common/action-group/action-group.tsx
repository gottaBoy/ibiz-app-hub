/* eslint-disable no-shadow */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable no-return-assign */
import { computed, defineComponent, PropType, ref } from 'vue';
import { useNamespace } from '@ibiz-template/vue3-util';
import { IButtonContainerState } from '@ibiz-template/runtime';
import { IAppDEUIActionGroupDetail } from '@ibiz/model-core';
import { calcPopoverPlacement, convertBtnType } from '../../util';
import './action-group.scss';

export const IBizActionGroup = defineComponent({
  name: 'IBizActionGroup',
  props: {
    actionDetail: {
      type: Object as PropType<IAppDEUIActionGroupDetail>,
      required: true,
    },
    actionsState: {
      type: Object as PropType<IButtonContainerState>,
      required: true,
    },
    popoverClassName: {
      type: String,
    },
    direction: {
      type: String as PropType<'horizontal' | 'vertical'>,
      default: 'horizontal',
    },
  },
  emits: {
    actionClick: (detail: IAppDEUIActionGroupDetail, event: MouseEvent) => true,
    popoverVisibleChange: (visible: boolean) => true,
  },
  setup(props, { emit }) {
    const ns = useNamespace('action-group');

    /**
     * 是否显示popover
     */
    const showPopover = ref(false);

    /**
     * 按钮ref
     */
    const buttonRef = ref();

    /**
     * 子popover是否显示
     */
    const childPopover = ref(false);

    /**
     * 成员集合
     */
    const details = computed(() => {
      if (
        props.actionDetail.detailType === 'DEUIACTIONGROUP' &&
        props.actionDetail.refUIActionGroup
      )
        return props.actionDetail.refUIActionGroup.uiactionGroupDetails || [];
      return [];
    });

    /**
     * 是否显示分组
     */
    const visible = computed(() => {
      const result = details.value.some(item => {
        return props.actionsState?.[item.id!]?.visible;
      });
      return result;
    });

    /**
     * 标题
     */
    const caption = computed(() => {
      return (
        props.actionDetail.refUIActionGroup?.name ||
        props.actionDetail.refUIActionGroup?.id
      );
    });

    /**
     * 弹出位置
     */
    const placement = ref(
      props.direction === 'horizontal' ? 'right' : 'bottom',
    );

    /**
     * 改变Popover显示
     */
    const onChangePopover = (e: MouseEvent) => {
      e.stopPropagation();
      placement.value = calcPopoverPlacement(
        ns,
        buttonRef.value.$el,
        details.value.length,
        props.direction,
      );
      showPopover.value = !showPopover.value;
    };

    /**
     * @description 处理点击
     * @param {IAppDEUIActionGroupDetail} detail
     * @param {MouseEvent} event
     */
    const handleClick = async (
      detail: IAppDEUIActionGroupDetail,
      event: MouseEvent,
      closePopover: boolean = false,
    ) => {
      if (closePopover) showPopover.value = false;
      emit('actionClick', detail, event);
    };

    /**
     * @description Popover 显示状态改变
     */
    const onPopoverVisibleChange = (visible: boolean) => {
      emit('popoverVisibleChange', visible);
    };

    /**
     * @description 绘制分隔符
     * @returns {*}
     */
    const renderSeparator = (visible?: boolean) => {
      if (visible) return <div class={ns.e('separator')}></div>;
    };

    /**
     * @description 绘制行为
     * @returns {*}
     */
    const renderActions = () => {
      return details.value?.map((detail: IAppDEUIActionGroupDetail) => {
        if (detail.detailType === 'DEUIACTIONGROUP')
          return [
            renderSeparator(detail.addSeparator),
            <iBizActionGroup
              actionDetail={detail}
              onActionClick={handleClick}
              actionsState={props.actionsState}
              popoverClassName={props.popoverClassName}
              onPopoverVisibleChange={(visible: boolean) =>
                (childPopover.value = visible)
              }
            />,
          ];
        const slots = {};
        if (detail.showIcon && detail.sysImage) {
          Object.assign(slots, {
            icon: () => {
              return <iBizIcon icon={detail.sysImage}></iBizIcon>;
            },
          });
        }
        if (props.actionsState?.[detail.id!]?.visible)
          return [
            renderSeparator(detail.addSeparator),
            <van-button
              size='small'
              type={convertBtnType(detail)}
              text={detail.showCaption ? detail.caption : ''}
              onClick={(e: MouseEvent) => handleClick(detail, e, true)}
              disabled={props.actionsState[detail.id!].disabled}
              class={[ns.e('item'), detail.sysCss?.codeName]}
            >
              {slots}
            </van-button>,
          ];
        return null;
      });
    };

    return {
      ns,
      visible,
      caption,
      buttonRef,
      placement,
      showPopover,
      childPopover,
      renderActions,
      onPopoverVisibleChange,
      onChangePopover,
    };
  },
  render() {
    if (this.visible)
      return (
        <van-popover
          placement={this.placement}
          v-model:show={this.showPopover}
          close-on-click-outside={!this.childPopover}
          class={[this.ns.b(), this.popoverClassName]}
          onOpen={() => this.onPopoverVisibleChange(true)}
          onClose={() => this.onPopoverVisibleChange(false)}
        >
          {{
            reference: () => {
              const solts = {
                default: () => {
                  return [
                    <div class={this.ns.em('button', 'text')}>
                      {this.actionDetail.showCaption ? this.caption : ''}
                    </div>,
                    <ion-icon
                      class={this.ns.em('button', 'icon')}
                      name={
                        this.direction === 'horizontal'
                          ? 'chevron-forward-outline'
                          : 'chevron-down-outline'
                      }
                    />,
                  ];
                },
              };
              if (this.actionDetail.showIcon && this.actionDetail.sysImage) {
                Object.assign(solts, {
                  icon: () => {
                    return (
                      <iBizIcon icon={this.actionDetail.sysImage}></iBizIcon>
                    );
                  },
                });
              }
              return (
                <van-button
                  size='small'
                  ref='buttonRef'
                  class={this.ns.e('button')}
                  type={convertBtnType(this.actionDetail)}
                  onClick={this.onChangePopover}
                >
                  {solts}
                </van-button>
              );
            },
            default: () => {
              return this.renderActions();
            },
          }}
        </van-popover>
      );
    return undefined;
  },
});
