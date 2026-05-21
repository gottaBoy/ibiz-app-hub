/* eslint-disable no-return-assign */
import { computed, defineComponent, PropType, ref, Ref } from 'vue';
import { JSX } from 'vue/jsx-runtime';
import { useNamespace, useUIStore } from '@ibiz-template/vue3-util';
import {
  IPanelButtonList,
  IDEFormButtonList,
  IAppDEUIActionGroupDetail,
} from '@ibiz/model-core';
import { IButtonContainerState } from '@ibiz-template/runtime';
import { calcPopoverPlacement, convertBtnType } from '../../util';
import './button-list.scss';

/**
 * 面板按钮组和表单按钮组的基础组件
 */
export const IBizButtonList = defineComponent({
  name: 'IBizButtonList',
  props: {
    model: {
      type: Object as PropType<IPanelButtonList | IDEFormButtonList>,
      required: true,
    },
    buttonsState: {
      type: Object as PropType<IButtonContainerState>,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: {
    click: (_id: string, _e?: MouseEvent) => true,
  },
  setup(props, { emit }) {
    const ns = useNamespace('button-list');

    const { zIndex } = useUIStore();
    const dropdownZIndex = zIndex.zIndex + 1;

    const showPopover: Ref<boolean> = ref(false);

    /**
     * 按钮ref
     */
    const buttonRef = ref();

    /**
     * 子popover是否显示
     */
    const childPopover = ref(false);

    /**
     * 按钮组成员
     */
    const details = computed(() => {
      const { buttonListType, uiactionGroup } = props.model;
      if (buttonListType === 'UIACTIONGROUP')
        return (
          (uiactionGroup?.uiactionGroupDetails as IAppDEUIActionGroupDetail[]) ||
          []
        );
      return (
        (props.model as IPanelButtonList).panelButtons ||
        (props.model as IDEFormButtonList).deformButtons ||
        []
      );
    });

    /**
     * 可见行为首项下标
     */
    const firstIndex = computed(() => {
      const index = details.value.findIndex(
        item => props.buttonsState[item.id!]?.visible !== false,
      );
      return index === undefined ? -1 : index;
    });

    /**
     * 弹出位置
     */
    const placement = ref('bottom');

    /**
     * 按钮组样式
     */
    const buttonListStyle = computed(() => {
      const { itemStyle, detailStyle, userTag } = props.model as IModel;
      return userTag || itemStyle || detailStyle || 'DEFAULT';
    });

    /**
     * 处理点击
     *
     * @param {MouseEvent} e
     * @param {IAppDEUIActionGroupDetail} item
     */
    const handleClick = (item: IData, e?: MouseEvent): void => {
      e?.stopPropagation();
      emit('click', item.id, e);
    };

    /**
     * 改变Popover显示
     * @param e
     */
    const onChangePopover = (e: MouseEvent) => {
      e.stopPropagation();
      placement.value = calcPopoverPlacement(
        ns,
        buttonRef.value.$el,
        details.value.length,
        'vertical',
      );
      showPopover.value = !showPopover.value;
    };

    /**
     * @description 绘制分隔符
     * @param {boolean} [visible]
     * @returns {*}
     */
    const renderSeparator = (visible?: boolean) => {
      if (visible) return <div class={ns.e('separator')}></div>;
    };

    /**
     * 绘制行为项
     *
     * @param {IAppDEUIActionGroupDetail} item
     * @param {('horizontal' | 'vertical')} direction
     * @return {*}
     */
    const renderActionItem = (
      item: IAppDEUIActionGroupDetail,
      direction: 'horizontal' | 'vertical',
    ) => {
      const showSeparator = direction === 'vertical';
      if (item.detailType === 'DEUIACTIONGROUP')
        return [
          renderSeparator(item.addSeparator && showSeparator),
          <iBizActionGroup
            actionDetail={item}
            onActionClick={handleClick}
            actionsState={props.buttonsState}
            popoverClassName={ns.b('action-group')}
            onPopoverVisibleChange={(visible: boolean) =>
              (childPopover.value = visible)
            }
            direction={direction === 'horizontal' ? 'vertical' : 'horizontal'}
          />,
        ];
      if (props.buttonsState[item.id!]?.visible)
        return [
          renderSeparator(item.addSeparator && showSeparator),
          <van-button
            size='small'
            class={[
              ns.e('item'),
              ns.em('item', `${item.id?.toLowerCase()}`),
              item.sysCss?.cssName,
            ]}
            type={convertBtnType(item)}
            disabled={props.buttonsState[item.id!]?.disabled || props.disabled}
            onClick={(event: MouseEvent) => handleClick(item, event)}
          >
            {(item as IData).showIcon !== false && (
              <iBizIcon icon={item.sysImage} class={ns.em('item', 'icon')} />
            )}
            {item.showCaption && (
              <span class={ns.em('item', 'caption')}>{item.caption}</span>
            )}
          </van-button>,
        ];
      return null;
    };

    /**
     * @description 绘制默认展示的行为组
     * @param {('horizontal' | 'vertical')} direction
     * @returns {*}
     */
    const renderActions = (direction: 'horizontal' | 'vertical') => {
      return details.value.map((item: IAppDEUIActionGroupDetail) =>
        renderActionItem(item, direction),
      );
    };

    /**
     * 绘制下拉行为项
     *
     * @return {*}  {JSX.Element}
     */
    const renderDropdown = (): JSX.Element => {
      if (props.model.actionGroupExtractMode === 'ITEMX') {
        const firstitem: IAppDEUIActionGroupDetail =
          details.value![firstIndex.value];
        return (
          <div class={[ns.e('group-itemx')]}>
            {renderActionItem(firstitem, 'horizontal')}
            <van-popover
              class={ns.e('popover')}
              placement={placement.value}
              v-model:show={showPopover.value}
              close-on-click-outside={!childPopover.value}
              style={{ zIndex: dropdownZIndex }}
            >
              {{
                reference: () => {
                  return (
                    <van-button
                      size='small'
                      type={convertBtnType(firstitem)}
                      icon={'arrow-down'}
                    />
                  );
                },
                default: () => {
                  return details.value.map(
                    (item: IAppDEUIActionGroupDetail, index: number) => {
                      if (
                        !(props.buttonsState[item.id!]?.visible === false) &&
                        index !== firstIndex.value
                      ) {
                        return renderActionItem(item, 'vertical');
                      }
                      return null;
                    },
                  );
                },
              }}
            </van-popover>
          </div>
        );
      }

      return (
        <van-popover
          class={ns.e('popover')}
          placement={placement.value}
          v-model:show={showPopover.value}
          close-on-click-outside={!childPopover.value}
          style={{ zIndex: dropdownZIndex }}
        >
          {{
            reference: () => {
              const { caption, sysImage } = props.model;
              return (
                <van-button
                  size='small'
                  ref='buttonRef'
                  class={ns.e('button')}
                  disabled={props.disabled}
                  onClick={onChangePopover}
                  type={buttonListStyle.value.toLowerCase()}
                >
                  {sysImage && (
                    <iBizIcon class={ns.em('button', 'icon')} icon={sysImage} />
                  )}
                  {caption && (
                    <span class={ns.em('button', 'caption')}>
                      {caption}
                      <ion-icon
                        name='chevron-down-outline'
                        class={ns.em('button', 'more')}
                      ></ion-icon>
                    </span>
                  )}
                </van-button>
              );
            },
            default: () => {
              return renderActions('vertical');
            },
          }}
        </van-popover>
      );
    };
    return { ns, buttonRef, renderDropdown, renderActions };
  },
  render() {
    return (
      <div
        class={[
          this.ns.b(),
          this.ns.m(this.model.id),
          this.ns.m(this.model.actionGroupExtractMode?.toLowerCase()),
        ]}
        style={this.model.cssStyle}
      >
        {this.model.actionGroupExtractMode === 'ITEM' ||
        this.model.buttonListType === 'BUTTONS' ? (
          <div class={this.ns.e('content')}>
            {this.renderActions('horizontal')}
          </div>
        ) : (
          this.renderDropdown()
        )}
      </div>
    );
  },
});
