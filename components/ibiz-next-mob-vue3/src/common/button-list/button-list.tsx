import { computed, defineComponent, PropType, ref, Ref } from 'vue';
import { JSX } from 'vue/jsx-runtime';
import { useNamespace } from '@ibiz-template/vue3-util';
import {
  IPanelButtonList,
  IDEFormButtonList,
  IAppDEUIActionGroupDetail,
} from '@ibiz/model-core';
import { IButtonContainerState } from '@ibiz-template/runtime';
import { convertBtnType } from '../../util';
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

    const showPopover: Ref<boolean> = ref(false);

    /**
     * 按钮组样式
     */
    const buttonListStyle = computed(() => {
      const { itemStyle, detailStyle } = props.model as IModel;
      return itemStyle || detailStyle || 'DEFAULT';
    });

    /**
     * 处理点击
     *
     * @param {MouseEvent} e
     * @param {IAppDEUIActionGroupDetail} item
     */
    const handleClick = (item: IData, e?: MouseEvent): void => {
      emit('click', item.id, e);
    };

    /**
     * 改变Popover显示
     * @param e
     */
    const onChangePopover = (e: MouseEvent) => {
      e.stopPropagation();
      showPopover.value = !showPopover.value;
    };

    /**
     * 按钮组成员
     *
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
     * Popover中的行为项
     *
     */
    const actions = computed(() => {
      return details.value
        .filter(detail => props.buttonsState[detail.id!]?.visible !== false)
        .map(detail => {
          return {
            ...detail,
            disabled: props.buttonsState[detail.id!]?.disabled,
            className: detail.sysCss?.cssName,
          };
        });
    });

    /**
     * 绘制默认行为项
     *
     * @return {*}  {JSX.Element}
     */
    const renderActions = (): JSX.Element => {
      return (
        <div class={ns.e('content')}>
          {details.value.map(item => {
            if (props.buttonsState[item.id!]?.visible === false) return;
            return (
              <van-button
                class={[
                  ns.e('item'),
                  ns.em('item', `${item.id?.toLowerCase()}`),
                  item.sysCss?.cssName,
                ]}
                size='small'
                type={convertBtnType(item.buttonStyle)}
                disabled={
                  props.buttonsState[item.id!]?.disabled || props.disabled
                }
                onClick={(event: MouseEvent) => handleClick(item, event)}
              >
                {(item as IData).showIcon !== false && (
                  <iBizIcon
                    icon={item.sysImage}
                    class={ns.em('item', 'icon')}
                  />
                )}
                {item.showCaption && (
                  <span class={ns.em('item', 'caption')}>{item.caption}</span>
                )}
              </van-button>
            );
          })}
        </div>
      );
    };

    /**
     * 绘制下拉行为项
     *
     * @return {*}  {JSX.Element}
     */
    const renderDropdown = (): JSX.Element => {
      return (
        <van-popover
          class={ns.e('popover')}
          placement='bottom-end'
          actions={actions.value}
          v-model:show={showPopover.value}
          onSelect={(data: IData) => handleClick(data)}
        >
          {{
            action: ({ action }: { action: IData }) => {
              return (
                <span class={ns.em('popover', 'item')}>
                  {action.showIcon !== false && action.sysImage && (
                    <iBizIcon icon={action.sysImage} />
                  )}
                  {action.showCaption && action.caption}
                </span>
              );
            },
            reference: () => {
              const { caption, sysImage, showCaption } = props.model;
              return (
                <van-button
                  size='small'
                  disabled={props.disabled}
                  onClick={onChangePopover}
                  type={convertBtnType(buttonListStyle.value)}
                >
                  {sysImage && (
                    <iBizIcon
                      class={ns.em('popover', 'icon')}
                      icon={sysImage}
                    />
                  )}
                  {showCaption && (
                    <span class={ns.em('popover', 'caption')}>
                      {caption}
                      <ion-icon
                        name='chevron-down-outline'
                        class={ns.em('popover', 'more')}
                      ></ion-icon>
                    </span>
                  )}
                </van-button>
              );
            },
          }}
        </van-popover>
      );
    };
    return { ns, renderDropdown, renderActions };
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
        this.model.buttonListType === 'BUTTONS'
          ? this.renderActions()
          : this.renderDropdown()}
      </div>
    );
  },
});
