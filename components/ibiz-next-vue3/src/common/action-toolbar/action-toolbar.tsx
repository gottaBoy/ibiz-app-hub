/* eslint-disable no-use-before-define */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineComponent, PropType, Ref, ref, VNode } from 'vue';
import { useNamespace, usePopoverVisible } from '@ibiz-template/vue3-util';
import { IButtonContainerState } from '@ibiz-template/runtime';
import { IAppDEUIActionGroupDetail } from '@ibiz/model-core';
import { showTitle } from '@ibiz-template/core';
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
    // 分组的行为级别
    groupLevelKeys: {
      type: Object as PropType<number[]>,
      // eslint-disable-next-line vue/require-valid-default-prop
      default: [50],
    },
    zIndex: {
      type: Number,
      required: true,
    },
    popperClass: String,
    // 行为回调，和action-click事件互斥，二者只有一个生效，actionCallBack优先级大于行为回调
    // 二者区别在于：行为回调为同步执行（主要解决pop打开视图位置异常），action-click为异步执行（不关心执行是否完成）
    actionCallBack: {
      type: Function,
    },
    direction: {
      type: String as PropType<'horizontal' | 'vertical'>,
      default: 'horizontal',
    },
    // 是否将 popover 的下拉列表插入至 body 元素，用于按钮模式下的分组显示
    teleported: { type: Boolean, default: true },
    // popover 出现位置，用于按钮模式下的分组显示
    placement: {
      type: String,
    },
    // 是否不换行，用于按钮模式
    nowrap: {
      type: Boolean,
    },
  },
  setup(props, { emit }) {
    const ns = useNamespace('action-toolbar');
    // 下拉列表ref
    const dropdownRef = ref();
    // 分组ref
    const groupButtonRef = ref<HTMLElement | null>();

    const { popoverVisible, setPopoverVisible } = usePopoverVisible(
      groupButtonRef,
      (ele: IData) => {
        return ele.ref;
      },
    );

    // 转换多语言
    props.actionDetails?.forEach(detail => {
      if (detail.capLanguageRes && detail.capLanguageRes.lanResTag) {
        detail.caption = ibiz.i18n.t(
          detail.capLanguageRes.lanResTag,
          detail.caption,
        );
      }
      if (detail.tooltipLanguageRes && detail.tooltipLanguageRes.lanResTag) {
        detail.tooltip = ibiz.i18n.t(
          detail.tooltipLanguageRes.lanResTag,
          detail.tooltip,
        );
      }
    });

    // 点击事件抛给表格执行
    const handleClick = async (
      detail: IAppDEUIActionGroupDetail,
      e: MouseEvent,
    ): Promise<void> => {
      e.stopPropagation();
      if (props.actionCallBack) {
        await props.actionCallBack(detail, e);
      }
      // 触发事件前先关闭下拉框
      if (props.mode === 'buttons') {
        setPopoverVisible(false);
      } else if (dropdownRef.value) {
        dropdownRef.value.handleClose();
      }
      if (!props.actionCallBack) {
        emit('action-click', detail, e);
      }
    };
    // 平铺行为
    const expandDetails: Ref<IAppDEUIActionGroupDetail[]> = ref([]);

    // 分组行为
    const groupDetails: Ref<IAppDEUIActionGroupDetail[]> = ref([]);

    if (props.actionDetails) {
      props.actionDetails.forEach(detail => {
        if (
          props.groupLevelKeys.findIndex(
            item => item === detail.actionLevel,
          ) !== -1
        ) {
          groupDetails.value.push(detail);
        } else {
          expandDetails.value.push(detail);
        }
      });
    }

    const calcActionItemClass = (item: IAppDEUIActionGroupDetail) => {
      const { actionLevel } = item;
      return [
        ns.e('item'),
        item.sysCss?.codeName,
        ns.em('item', `level-${actionLevel}`),
      ];
    };

    const popoverIndex = props.zIndex;

    /**
     * @description 绘制项内容
     * @param {IAppDEUIActionGroupDetail} detail
     * @returns {*}
     */
    const renderItemContent = (detail: IAppDEUIActionGroupDetail) => {
      const caption =
        detail.refUIActionGroup?.name ||
        detail.refUIActionGroup?.id ||
        detail.caption;
      return [
        <div
          class={[
            ns.em('item', 'icon'),
            ns.is('has-caption', detail.showCaption && !!detail.caption),
            ns.is('has-icon', detail.showIcon && !!detail.sysImage),
          ]}
        >
          {detail.showIcon && detail.sysImage && (
            <iBizIcon icon={detail.sysImage}></iBizIcon>
          )}
        </div>,
        <div
          class={[
            ns.em('item', 'label'),
            ns.is('has-caption', detail.showCaption && !!detail.caption),
            ns.is('has-icon', detail.showIcon && !!detail.sysImage),
          ]}
        >
          {caption}
        </div>,
      ];
    };

    return {
      ns,
      dropdownRef,
      popoverIndex,
      groupDetails,
      expandDetails,
      groupButtonRef,
      popoverVisible,
      handleClick,
      renderItemContent,
      calcActionItemClass,
    };
  },
  render() {
    const details = this.actionDetails || [];

    const renderDivider = (isExpand: boolean) => {
      const ishorizontal = isExpand && this.direction === 'horizontal';
      return (
        <el-divider
          class={this.ns.e('separator')}
          border-style='double'
          direction={ishorizontal ? 'vertical' : 'horizontal'}
        />
      );
    };

    // 绘制引用界面行为组
    const renderActionGroup = (
      detail: IAppDEUIActionGroupDetail,
      isExpand = true,
    ) => {
      const actionGroup = detail.refUIActionGroup;
      if (!actionGroup?.uiactionGroupDetails?.length) return null;
      // 子项所有项都隐藏，父项也应该隐藏
      const pvisible = actionGroup.uiactionGroupDetails.some(item => {
        return this.actionsState[item.id!].visible;
      });
      if (!pvisible) return null;
      const ishorizontal = isExpand && this.direction === 'horizontal';
      return [
        detail.addSeparator && renderDivider(isExpand),
        <el-popover
          trigger='click'
          teleported={ishorizontal}
          popper-class={this.ns.e('popover')}
          placement={ishorizontal ? 'bottom' : 'right-start'}
          popper-options={{
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: [0, 4],
                },
              },
            ],
          }}
          popper-style={`z-index:${this.popoverIndex + 1}`}
        >
          {{
            reference: () => {
              return (
                <el-button
                  text
                  size='small'
                  class={[
                    ...this.calcActionItemClass(detail),
                    this.ns.e('group-item'),
                  ]}
                >
                  <div class={this.ns.em('group-item', 'content')}>
                    <div class={this.ns.em('group-item', 'caption')}>
                      {this.renderItemContent(detail)}
                    </div>
                    <ion-icon
                      class={this.ns.em('group-item', 'icon')}
                      name={
                        ishorizontal
                          ? 'chevron-down-outline'
                          : 'chevron-forward-outline'
                      }
                    ></ion-icon>
                  </div>
                </el-button>
              );
            },
            default: () => {
              return renderActions(
                actionGroup.uiactionGroupDetails || [],
                false,
              );
            },
          }}
        </el-popover>,
      ];
    };

    const renderActions = (
      items: IAppDEUIActionGroupDetail[],
      isExpand = true,
    ): any => {
      return items.map(detail => {
        if (detail.detailType === 'DEUIACTIONGROUP' && detail.refUIActionGroup)
          return renderActionGroup(detail, isExpand);
        const title =
          isExpand && this.nowrap === true
            ? detail.tooltip || detail.caption
            : detail.tooltip;
        if (this.actionsState[detail.id!]?.visible) {
          return [
            detail.addSeparator && renderDivider(isExpand),
            <el-button
              text
              size='small'
              onClick={(e: MouseEvent): Promise<void> =>
                this.handleClick(detail, e)
              }
              title={showTitle(title)}
              disabled={this.actionsState[detail.id!].disabled}
              class={this.calcActionItemClass(detail)}
            >
              {this.renderItemContent(detail)}
            </el-button>,
          ];
        }
        return null;
      });
    };

    const renderGroup = () => {
      if (this.groupDetails.length === 0) return null;
      // 子项所有项都隐藏，父项也应该隐藏
      const pvisible =
        this.groupDetails.findIndex(item => {
          return this.actionsState[item.id!].visible === true;
        }) !== -1;
      if (!pvisible) return null;
      // 当前项禁用或子项所有项都禁用，父项也应该禁用
      const pdisabled =
        this.groupDetails.findIndex(item => {
          return this.actionsState[item.id!].disabled === false;
        }) === -1;
      return [
        <el-button
          size='small'
          text
          disabled={pdisabled}
          ref='groupButtonRef'
          class={[
            this.ns.e('item'),
            this.ns.is('group', true),
            this.ns.is('expand', this.popoverVisible),
          ]}
          onClick={(): void => {
            this.popoverVisible = !this.popoverVisible;
          }}
        >
          {{
            icon: () => (
              <ion-icon
                class={this.ns.e('icon')}
                name='ellipsis-vertical'
                title={showTitle(ibiz.i18n.t('component.actionToolbar.more'))}
              />
            ),
          }}
        </el-button>,
        <el-popover
          placement={this.placement || 'bottom-start'}
          teleported={this.teleported}
          virtual-ref={this.groupButtonRef}
          visible={this.popoverVisible}
          popper-class={this.ns.e('popover')}
          virtual-triggering
          popper-style={`z-index:${this.popoverIndex}`}
        >
          {renderActions(this.groupDetails, false)}
        </el-popover>,
      ];
    };

    if (!this.actionsState?.visible) return;

    if (this.mode === 'buttons') {
      // 按钮模式
      return (
        <div
          class={[
            this.ns.b(),
            this.ns.m('buttons'),
            this.ns.is('nowrap', this.nowrap === true),
          ]}
          onClick={(e): void => e.stopPropagation()}
        >
          {renderActions(this.expandDetails)}
          {renderGroup()}
        </div>
      );
    }
    // 下拉模式
    return (
      <el-dropdown
        ref='dropdownRef'
        onCommand={(command: IAppDEUIActionGroupDetail): Promise<void> =>
          this.handleClick(command, new MouseEvent('click'))
        }
        class={[this.ns.b(), this.ns.m('dropdown')]}
        popper-class={this.popperClass}
      >
        {{
          default: (): VNode => (
            <span class={this.ns.e('caption')}>
              {this.caption}
              <ion-icon
                class={this.ns.e('caption-icon')}
                name='ellipsis-vertical'
              />
            </span>
          ),
          dropdown: (): VNode => (
            <el-dropdown-menu>
              {details.length > 0 &&
                details.map(detail => {
                  if (this.actionsState[detail.id!].visible) {
                    return (
                      <el-dropdown-item
                        command={detail}
                        title={showTitle(detail.tooltip)}
                        class={this.calcActionItemClass(detail)}
                        disabled={this.actionsState[detail.id!].disabled}
                      >
                        {detail.showIcon && detail.sysImage && (
                          <iBizIcon icon={detail.sysImage}></iBizIcon>
                        )}
                        {detail.showCaption ? detail.caption : ''}
                      </el-dropdown-item>
                    );
                  }
                  return null;
                })}
            </el-dropdown-menu>
          ),
        }}
      </el-dropdown>
    );
  },
});
