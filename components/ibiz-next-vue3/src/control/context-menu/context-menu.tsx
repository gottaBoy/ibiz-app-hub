/* eslint-disable no-use-before-define */
import { defineComponent, PropType, Ref, ref, VNode, watch } from 'vue';
import {
  useControlController,
  useNamespace,
  usePopoverzIndex,
  usePopoverVisible,
} from '@ibiz-template/vue3-util';
import {
  IAppDEUIActionGroupDetail,
  IDEContextMenu,
  IDETBGroupItem,
  IDETBUIActionItem,
  IDETreeNode,
} from '@ibiz/model-core';
import './context-menu.scss';
import { ContextMenuController, ITreeNodeData } from '@ibiz-template/runtime';
import { showTitle } from '@ibiz-template/core';

export const ContextMenuControl = defineComponent({
  name: 'IBizContextMenuControl',
  props: {
    /**
     * @description 上下文菜单模型数据
     */
    modelData: {
      type: Object as PropType<IDEContextMenu>,
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
     * @description 模式，值为dropdown:下拉模式，buttons:按钮组模式
     * @default buttons
     */
    mode: {
      type: String as PropType<'dropdown' | 'buttons'>,
      default: 'buttons',
    },
    /**
     * @description 分组的行为级别
     * @default [50]
     */
    groupLevelKeys: {
      type: Object as PropType<number[]>,
      // eslint-disable-next-line vue/require-valid-default-prop
      default: [50],
    },
    /**
     * @description 节点数据
     */
    nodeData: {
      type: Object as PropType<ITreeNodeData>,
      required: true,
    },
    /**
     * @description 节点模型
     */
    nodeModel: {
      type: Object as PropType<IDETreeNode>,
      required: true,
    },
    /**
     * @description 点击菜单项时的回调函数，存在此参数时不抛出action-click事件
     */
    actionCallBack: {
      type: Function,
    },
  },
  setup(props, { emit }) {
    const c = useControlController(
      (...args) => new ContextMenuController(...args),
    );

    const ns = useNamespace('context-menu');

    const actionDetails = props.modelData.detoolbarItems as IDETBUIActionItem[];

    // 平铺行为
    const expandDetails: Ref<IDETBUIActionItem[]> = ref([]);

    // 分组行为
    const groupDetails: Ref<IDETBUIActionItem[]> = ref([]);

    // 分组ref
    const groupButtonRef = ref<HTMLElement | null>();

    const { popoverVisible, setPopoverVisible } = usePopoverVisible(
      groupButtonRef,
      (ele: IData) => {
        return ele.ref;
      },
    );

    // 下拉列表ref
    const dropdownRef = ref();

    const { popoverid, setPopoverZIndex } = usePopoverzIndex();

    // 是否为引用界面行为组
    const isRefUIActionGroup = (detail: IAppDEUIActionGroupDetail): boolean => {
      return !!(
        detail.detailType === 'DEUIACTIONGROUP' && detail.refUIActionGroup
      );
    };

    // 转换多语言
    const transformLanguage = (items?: IDETBUIActionItem[]) => {
      if (!Array.isArray(items)) {
        return;
      }
      items.forEach(detail => {
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
        transformLanguage(detail.detoolbarItems);
      });
    };

    if (actionDetails) {
      // 转换多语言
      transformLanguage(actionDetails);

      // 根据level分组
      actionDetails.forEach(detail => {
        if (
          !detail.actionLevel ||
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

    const calcActionItemClass = (item: IDETBUIActionItem) => {
      const { actionLevel } = item;
      return [
        ns.e('item'),
        `${item?.sysCss?.cssName}`,
        ns.em('item', `level-${actionLevel}`),
        ns.is('disabled', c.state.buttonsState[item.id!].disabled),
      ];
    };

    watch(
      () => props.nodeData,
      async (newVal, oldVal) => {
        if (newVal !== oldVal) {
          await c.calcButtonState(
            newVal._deData || (newVal.srfkey ? newVal : undefined),
            props.nodeModel.appDataEntityId,
          );
        }
      },
    );

    c.evt.on('onCreated', async () => {
      await c.calcButtonState(
        props.nodeData._deData ||
          (props.nodeData.srfkey ? props.nodeData : undefined),
        props.nodeModel.appDataEntityId,
      );
    });

    /**
     * 处理行为点击
     *
     * @param {IDETBUIActionItem} detail
     * @param {MouseEvent} e
     * @return {*}  {Promise<void>}
     */
    const handleClick = async (
      detail: IDETBUIActionItem,
      e: MouseEvent,
    ): Promise<void> => {
      e.stopPropagation();
      if (!detail.uiactionId) {
        setPopoverVisible(false);
        return;
      }
      if (props.actionCallBack) {
        await props.actionCallBack(detail, e);
      }
      if (props.mode === 'buttons') {
        setPopoverVisible(false);
      } else if (dropdownRef.value) {
        dropdownRef.value.handleClose();
      }
      if (!props.actionCallBack) {
        emit('action-click', detail, e);
      }
    };

    // 获取行为名称
    const calcDetailCaption = (detail: IAppDEUIActionGroupDetail) => {
      return (
        detail.refUIActionGroup?.name ||
        detail.refUIActionGroup?.id ||
        detail.caption
      );
    };

    /**
     * @description 绘制项内容
     * @param {IAppDEUIActionGroupDetail} detail
     * @returns {*}
     */
    const renderItemContent = (detail: IAppDEUIActionGroupDetail) => {
      return [
        detail.showIcon && detail.sysImage && (
          <div class={ns.e('action-content-icon')}>
            <iBizIcon icon={detail.sysImage}></iBizIcon>
          </div>
        ),
        detail.showCaption ? (
          <div
            class={[
              ns.e('action-content-caption'),
              ns.e('action-content-group-caption'),
            ]}
          >
            {calcDetailCaption(detail)}
          </div>
        ) : null,
      ];
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
        return c.state.buttonsState[item.id!].visible;
      });
      if (!pvisible) return null;
      const ishorizontal = isExpand;
      return [
        detail.addSeparator && renderDivider(isExpand),
        <el-popover
          teleported={false}
          popper-class={ns.e('popover')}
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
        >
          {{
            reference: () => {
              return (
                <el-button
                  text
                  size='small'
                  class={[...calcActionItemClass(detail), ns.e('group-item')]}
                >
                  <div class={ns.em('group-item', 'content')}>
                    <div class={ns.em('group-item', 'caption')}>
                      {renderItemContent(detail)}
                    </div>
                    <ion-icon
                      class={ns.em('group-item', 'icon')}
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

    /**
     * 绘制分隔符
     *
     * @param {boolean} isExpand
     * @return {*}
     */
    const renderDivider = (isExpand: boolean) => {
      return (
        <el-divider
          class={ns.e('separator')}
          border-style='double'
          direction={isExpand ? 'vertical' : 'horizontal'}
        />
      );
    };

    const renderActionButton = (
      detail: IAppDEUIActionGroupDetail,
      isExpand = true,
    ) => {
      if (c.state.buttonsState[detail.id!].visible) {
        return [
          detail.addSeparator && renderDivider(isExpand),
          <el-button
            text
            size='small'
            title={showTitle(detail.tooltip)}
            class={calcActionItemClass(detail)}
            disabled={c.state.buttonsState[detail.id!].disabled}
            onClick={(e: MouseEvent) => handleClick(detail, e)}
          >
            <div class={ns.e('action-content')}>
              {detail.showIcon && detail.sysImage && (
                <div class={ns.e('action-content-icon')}>
                  <iBizIcon icon={detail.sysImage}></iBizIcon>
                </div>
              )}
              {detail.showCaption ? (
                <div class={ns.e('action-content-caption')}>
                  {calcDetailCaption(detail)}
                </div>
              ) : (
                ''
              )}
            </div>
          </el-button>,
        ];
      }
      return null;
    };

    /**
     * 绘制分组项
     *
     * @param {IDETBGroupItem} item
     * @param {boolean} [isExpand=true]
     * @return {*}
     */
    const renderGroupItem = (item: IDETBGroupItem, isExpand = true) => {
      const { groupExtractMode, uiactionGroup } = item;
      let detail: IAppDEUIActionGroupDetail = item as IAppDEUIActionGroupDetail;
      // 绘制按项展开界面行为组
      if (uiactionGroup && groupExtractMode === 'ITEM') {
        return uiactionGroup?.uiactionGroupDetails?.map(_item => {
          if (isRefUIActionGroup(_item))
            return renderActionGroup(_item, isExpand);

          return renderActionButton(_item, isExpand);
        });
      }
      const details = item.uiactionGroup?.uiactionGroupDetails?.filter(
        _item => c.state.buttonsState[_item.id!].visible,
      );
      if (uiactionGroup && groupExtractMode === 'ITEMX' && details) {
        detail = details[0];

        if (isRefUIActionGroup(detail))
          return renderActionGroup(detail, isExpand);
      }

      if (detail) {
        return (
          <el-popover
            placement='right-start'
            popper-class={ns.e('popover')}
            teleported={false}
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
          >
            {{
              reference: () => {
                return (
                  <el-button
                    text
                    size='small'
                    onClick={(e: MouseEvent) => handleClick(detail, e)}
                    title={showTitle(detail.tooltip)}
                    class={calcActionItemClass(detail)}
                    disabled={c.state.buttonsState[detail.id!].disabled}
                  >
                    <div class={ns.e('action-content')}>
                      {detail.showIcon && detail.sysImage && (
                        <div class={ns.e('action-content-icon')}>
                          <iBizIcon icon={detail.sysImage}></iBizIcon>
                        </div>
                      )}

                      {detail.showCaption ? (
                        <div
                          class={[
                            ns.e('action-content-caption'),
                            ns.e('action-content-group-caption'),
                          ]}
                        >
                          {calcDetailCaption(detail)}
                        </div>
                      ) : (
                        ''
                      )}
                      <ion-icon
                        class={ns.e('action-content-group-icon')}
                        name='chevron-forward-outline'
                      ></ion-icon>
                    </div>
                  </el-button>
                );
              },
              default: () => {
                if (uiactionGroup) {
                  return details?.map((_item, index) => {
                    if (groupExtractMode === 'ITEMX' && index === 0) {
                      return null;
                    }

                    if (isRefUIActionGroup(_item))
                      return renderActionGroup(_item, isExpand);

                    return renderActionButton(_item, isExpand);
                  });
                }
                return renderActions(item.detoolbarItems || [], isExpand);
              },
            }}
          </el-popover>
        );
      }
    };

    /**
     * 绘制工具栏项
     *
     * @param {IDETBUIActionItem[]} items
     * @param {boolean} [isExpand=true]
     * @return {*}
     */
    const renderActions = (items: IDETBUIActionItem[], isExpand = true) => {
      return items.map(detail => {
        if (!c.state.buttonsState[detail.id!]?.visible) {
          return null;
        }
        if (detail.itemType === 'SEPERATOR') {
          return renderDivider(isExpand);
        }
        if (detail.itemType === 'DEUIACTION') {
          return renderActionButton(detail, isExpand);
        }
        if (detail.itemType === 'ITEMS') {
          return renderGroupItem(detail, isExpand);
        }
        if (isRefUIActionGroup(detail))
          return renderActionGroup(detail, isExpand);

        return null;
      });
    };

    return {
      c,
      ns,
      popoverid,
      expandDetails,
      groupDetails,
      groupButtonRef,
      dropdownRef,
      popoverVisible,
      handleClick,
      renderActions,
      renderActionButton,
      calcActionItemClass,
      calcDetailCaption,
      setPopoverZIndex,
      actionDetails,
    };
  },
  render() {
    const details = this.actionDetails || [];

    const renderGroup = () => {
      if (this.groupDetails.length === 0) {
        return null;
      }
      // 子项所有项都隐藏，父项也应该隐藏
      const pvisible =
        this.groupDetails.findIndex(item => {
          return this.c.state.buttonsState[item.id!].visible === true;
        }) !== -1;
      if (!pvisible) {
        return null;
      }
      // 当前项禁用或子项所有项都禁用，父项也应该禁用
      const pdisabled =
        this.groupDetails.findIndex(item => {
          return this.c.state.buttonsState[item.id!].disabled === false;
        }) === -1;
      return [
        <el-button
          size='small'
          text
          disabled={pdisabled}
          ref='groupButtonRef'
          class={[this.ns.e('item'), this.ns.is('expand', this.popoverVisible)]}
          onClick={(): void => {
            this.popoverVisible = !this.popoverVisible;
          }}
        >
          {{
            icon: () => (
              <ion-icon class={this.ns.e('icon')} name='ellipsis-vertical' />
            ),
          }}
        </el-button>,
        <el-popover
          placement='bottom-start'
          virtual-ref={this.groupButtonRef}
          visible={this.popoverVisible}
          popper-class={[
            this.popoverid,
            this.ns.e('popover'),
            this.ns.e('transfer'),
          ]}
          virtual-triggering
          transition='none'
          onBefore-enter={() =>
            this.setPopoverZIndex(
              `--${this.ns.namespace}-context-menu-transfer-zindex`,
            )
          }
        >
          {this.renderActions(this.groupDetails, false)}
        </el-popover>,
      ];
    };

    if (!this.c.state.buttonsState.visible) {
      return;
    }

    if (this.mode === 'buttons') {
      // 按钮模式
      return (
        <div
          class={[this.ns.b(), this.ns.m('buttons')]}
          onClick={(e): void => e.stopPropagation()}
        >
          {this.renderActions(this.expandDetails)}
          {renderGroup()}
        </div>
      );
    }
    // 下拉模式
    return (
      <el-dropdown
        ref='dropdownRef'
        onCommand={(command: IAppDEUIActionGroupDetail) =>
          this.handleClick(command, new MouseEvent('click'))
        }
        onVisible-change={() =>
          this.setPopoverZIndex(
            `--${this.ns.namespace}-context-menu-transfer-zindex`,
          )
        }
        popper-class={[this.popoverid, this.ns.e('transfer')]}
        class={[this.ns.b(), this.ns.m('dropdown')]}
      >
        {{
          default: (): VNode => (
            <span class={this.ns.e('caption')}>
              <ion-icon
                class={this.ns.e('caption-icon')}
                name='ibiz-arrow-down'
              />
            </span>
          ),
          dropdown: (): VNode => (
            <el-dropdown-menu>
              {details.length > 0 &&
                details.map(detail => {
                  if (this.c.state.buttonsState[detail.id!]?.visible) {
                    return (
                      <el-dropdown-item
                        class={[
                          this.ns.e('item'),
                          this.ns.is('disabled', false),
                        ]}
                        title={showTitle(detail.tooltip)}
                        disabled={
                          this.c.state.buttonsState[detail.id!].disabled
                        }
                        command={detail}
                      >
                        {detail.showIcon && detail.sysImage && (
                          <iBizIcon icon={detail.sysImage}></iBizIcon>
                        )}
                        {detail.showCaption
                          ? this.calcDetailCaption(detail)
                          : ''}
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
