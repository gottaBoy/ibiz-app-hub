import { useControlController, useNamespace } from '@ibiz-template/vue3-util';
import {
  ref,
  defineComponent,
  PropType,
  VNode,
  resolveComponent,
  h,
} from 'vue';
import {
  IDEToolbar,
  IDEToolbarItem,
  IDETBGroupItem,
  IDETBUIActionItem,
  IAppDEUIActionGroupDetail,
} from '@ibiz/model-core';
import {
  IControlProvider,
  IExtraButton,
  IToolbarState,
  ToolbarController,
} from '@ibiz-template/runtime';
import { showTitle } from '@ibiz-template/core';
import { IBizExportExcel } from './export-excel/export-excel';
import { IBizShortCutButton } from './short-cut-button/short-cut-button';
import { convertBtnType } from '../../util';
import './toolbar.scss';

const btnContent = (
  item: IDEToolbarItem,
  state?: IToolbarState,
): (string | VNode)[] => {
  const counterNum =
    state && item.counterId ? state.counterData[item.counterId] : undefined;
  const image = item.sysImage;
  const result = [];
  const ns = useNamespace('toolbar-item');
  if (item.showIcon && image) {
    result.push(
      <span class={ns.b('icon')}>
        <iBizIcon icon={image} />
      </span>,
    );
  }
  if (item.showCaption && item.caption) {
    result.push(<span class={ns.b('text')}>{item.caption}</span>);
  }
  if (counterNum) {
    result.push(
      <iBizBadge
        class={ns.b('counter')}
        value={counterNum}
        counterMode={item.counterMode}
      />,
    );
  }

  return result;
};

// 计算系统样式表名称
const calcCssName = (item: IDETBGroupItem | IDETBUIActionItem) => {
  return item?.sysCss?.cssName;
};

export const ToolbarControl = defineComponent({
  name: 'IBizToolbarControl',
  props: {
    /**
     * @description 工具栏模型数据
     */
    modelData: {
      type: Object as PropType<IDEToolbar>,
      required: true,
    },
    /**
     * @description 绘制模式，可选值为DESIGN、RUNTIME，默认值为RUNTIME
     */
    runMode: {
      type: String,
      default: 'RUNTIME',
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
    /**
     * @description 是否手动计算按钮状态,即工具栏自身默认不计算权限
     * @default false
     */
    manualCalcButtonState: { type: Boolean, default: false },
  },
  emits: ['click'],
  setup(props, { emit }) {
    const c = useControlController((...args) => new ToolbarController(...args));
    const ns = useNamespace(`control-${c.model.controlType!.toLowerCase()}`);
    const ns2 = useNamespace(
      `control-${c.model.controlType!.toLowerCase()}-actions`,
    );

    const btnSize = ref('default');
    const toolbarStyle = (c.model as IDEToolbar).toolbarStyle?.toLowerCase();

    // 点击事件
    const handleClick = async (
      item: IDEToolbarItem,
      event: MouseEvent,
      params?: IData,
    ): Promise<void> => {
      if (props.runMode === 'RUNTIME') {
        await c.onItemClick(item, event, params);
      } else {
        emit('click', item);
      }
    };

    // 行为事件点击
    const handleActionClick = async (
      item: IAppDEUIActionGroupDetail,
      event: MouseEvent,
      params?: IData,
    ): Promise<void> => {
      if (props.runMode === 'RUNTIME') {
        const tempItem = {};
        Object.assign(tempItem, { ...item, itemType: item.detailType });
        await handleClick(tempItem as IDEToolbarItem, event, params);
      } else {
        emit('click', item);
      }
    };

    const renderExtraButtons = (extraButtons: IExtraButton[]): VNode[] => {
      return extraButtons.map(button => {
        return (
          <div key={button.id} class={[ns.e('item')]}>
            <el-button
              title={showTitle(button.tooltip)}
              size={btnSize.value}
              onClick={(e: MouseEvent): Promise<void> => handleClick(button, e)}
            >
              {btnContent(button, c.state)}
            </el-button>
          </div>
        );
      });
    };

    // 绘制内嵌界面行为组成员
    const renderEmbedGroupDetail = (
      item: IDETBGroupItem,
      detail: IAppDEUIActionGroupDetail,
    ) => {
      const actionId = (detail as IDETBUIActionItem).uiactionId;
      const visible = c.state.buttonsState[detail.id!]?.visible;
      const provider = c.itemProviders[detail.id!];
      if (!visible) {
        return null;
      }
      if (provider) {
        const component = resolveComponent(provider.component);
        return h(component, {
          key: detail.id,
          class: [ns.e('item')],
          item,
          controller: c,
        });
      }
      const buttonType = (
        detail as IDETBUIActionItem
      ).buttonStyle?.toLowerCase();
      if (actionId === 'exportexcel' || actionId === 'gridview_exportaction') {
        return (
          <IBizExportExcel
            class={[
              ns.e('menu-exportexcel'),
              ns.em('item', buttonType),
              calcCssName(detail),
            ]}
            mode='menu'
            item={detail}
            btnContent={(barItem: IDEToolbarItem) =>
              btnContent(barItem, c.state)
            }
            size={btnSize.value}
            controller={c}
            onExportExcel={(e: MouseEvent, data: IData): void => {
              handleActionClick(detail, e, data);
            }}
          ></IBizExportExcel>
        );
      }
      return (
        <el-menu-item
          class={[
            ns.is('loading', c.state.buttonsState[detail.id!].loading),
            ns.em('item', buttonType),
            calcCssName(detail),
          ]}
          index={`menuitem${detail.id}`}
          disabled={c.state.buttonsState[detail.id!].disabled}
          title={showTitle(detail.caption)}
        >
          <el-button
            loading={c.state.buttonsState[detail.id!].loading}
            onClick={(e: MouseEvent) => {
              if (!detail.uiactionId) return;
              handleActionClick(detail, e);
            }}
          >
            {btnContent(detail, c.state)}
          </el-button>
        </el-menu-item>
      );
    };

    // 绘制行为项按钮
    const renderActionButton = (
      detail: IAppDEUIActionGroupDetail,
      type?: string,
    ) => {
      if (c.state.buttonsState[detail.id!].visible) {
        return (
          <el-button
            size={btnSize.value}
            class={calcCssName(detail)}
            type={type || convertBtnType(detail.buttonStyle)}
            title={showTitle(detail.tooltip || detail.caption)}
            loading={c.state.buttonsState[detail.id!].loading}
            disabled={c.state.buttonsState[detail.id!].disabled}
            onClick={(e: MouseEvent): Promise<void> =>
              handleActionClick(detail, e)
            }
          >
            {btnContent(detail, c.state)}
          </el-button>
        );
      }
      return null;
    };

    // 绘制下拉项
    const renderDropdownItem = (detail: IAppDEUIActionGroupDetail) => {
      if (c.state.buttonsState[detail.id!].visible) {
        const disabled = c.state.buttonsState[detail.id!].disabled;
        return (
          <el-dropdown-item
            class={[
              ns2.be('dropdown-popper', 'dropdown-item'),
              ns2.is('disabled', disabled),
              ns.em('item', convertBtnType(detail.buttonStyle)),
            ]}
          >
            {renderActionButton(detail)}
          </el-dropdown-item>
        );
      }
      return null;
    };

    // 绘制按分组展开
    const renderActionGroupItems = (item: IDETBGroupItem, isEmbed: boolean) => {
      const { uiactionGroup } = item;
      if (uiactionGroup && uiactionGroup.uiactionGroupDetails) {
        const { uiactionGroupDetails } = uiactionGroup;
        const enableDropdown = uiactionGroupDetails.length > 0;
        const groupButtonStyle = (item as IDETBGroupItem).buttonStyle || '';
        if (isEmbed) {
          const curDisabled = c.state.buttonsState[item.id!].disabled;
          const pdisabled =
            curDisabled ||
            uiactionGroupDetails.findIndex(
              item2 => c.state.buttonsState[item2.id!]?.disabled === false,
            ) === -1;
          return (
            <el-sub-menu
              class={[
                ns.b('submenu'),
                ns.be('submenu', 'groupdetails'),
                ns.em('item', groupButtonStyle.toLowerCase()),
                calcCssName(item),
              ]}
              index={item.id}
              disabled={pdisabled}
              title={showTitle(item.tooltip)}
              popper-class={[
                ns.b('submenu-popper'),
                ns.em('submenu-popper', 'groupdetails'),
                ns.bm('submenu-popper', toolbarStyle),
                ns.em('submenu-popper', groupButtonStyle.toLowerCase()),
                ns.bm('submenu-popper', calcCssName(item)),
                calcCssName(item),
              ]}
            >
              {{
                default: () => {
                  return uiactionGroupDetails.map(detail => {
                    return renderEmbedGroupDetail(item, detail);
                  });
                },
                title: () => {
                  return renderEmbedGroupDetail(item, item);
                },
              }}
            </el-sub-menu>
          );
        }
        return (
          <el-dropdown
            popper-class={[
              ns2.b('dropdown-popper'),
              ns2.bm('dropdown-popper', toolbarStyle),
              ns2.em('dropdown-popper', groupButtonStyle.toLowerCase()),
              ns2.bm('dropdown-popper', calcCssName(item)),
            ]}
          >
            {{
              default: () => renderActionButton(item),
              dropdown: () =>
                enableDropdown && (
                  <el-dropdown-menu>
                    {uiactionGroupDetails.map(
                      (detail: IAppDEUIActionGroupDetail) =>
                        renderDropdownItem(detail),
                    )}
                  </el-dropdown-menu>
                ),
            }}
          </el-dropdown>
        );
      }

      return null;
    };

    // 获取首项+分组展开中满足条件的第一个下标
    const getFirstIndex = (
      details: IAppDEUIActionGroupDetail[],
      index: number,
    ): number => {
      const firstItem: IParams = details[index];
      if (firstItem) {
        if (c.state.buttonsState[firstItem.id!].visible) {
          return index;
        }
        return getFirstIndex(details, index + 1);
      }
      return -1;
    };

    // 绘制首项+分组展开
    const renderActionGroupItemx = (item: IDETBGroupItem, isEmbed: boolean) => {
      const { uiactionGroup } = item;
      if (uiactionGroup && uiactionGroup.uiactionGroupDetails) {
        const { uiactionGroupDetails } = uiactionGroup;
        const firstIndex = getFirstIndex(uiactionGroupDetails, 0);
        if (firstIndex !== -1) {
          const firstItem = uiactionGroupDetails[firstIndex];
          const remainders = uiactionGroupDetails
            .slice(firstIndex + 1)
            .filter(_item => !!c.state.buttonsState[_item.id!].visible);
          const enableDropdown = remainders.length > 0;
          let groupButtonStyle = (item as IDETBGroupItem).buttonStyle || '';
          if (isEmbed) {
            groupButtonStyle = (firstItem as IDETBGroupItem).buttonStyle || '';
            return (
              <el-sub-menu
                class={[
                  ns.b('submenu'),
                  ns.be('submenu', 'groupdetails'),
                  ns.em('item', groupButtonStyle.toLowerCase()),
                  calcCssName(firstItem),
                ]}
                index={firstItem.id}
                disabled={c.state.buttonsState[firstItem.id!].disabled}
                title={showTitle(firstItem.tooltip)}
                popper-class={[
                  ns.b('submenu-popper'),
                  ns.be('submenu-popper', 'groupdetails'),
                  ns.bm('submenu-popper', toolbarStyle),
                  ns.em('submenu-popper', groupButtonStyle.toLowerCase()),
                  ns.bm('submenu-popper', calcCssName(firstItem)),
                  calcCssName(firstItem),
                ]}
              >
                {{
                  default: () => {
                    return remainders.map(detail => {
                      return renderEmbedGroupDetail(item, detail);
                    });
                  },
                  title: () => {
                    return renderEmbedGroupDetail(item, firstItem);
                  },
                }}
              </el-sub-menu>
            );
          }
          return (
            <el-dropdown
              split-button={enableDropdown}
              type={convertBtnType(groupButtonStyle)}
              popper-class={[
                ns2.b('dropdown-popper'),
                ns2.bm('dropdown-popper', toolbarStyle),
                ns2.em('dropdown-popper', groupButtonStyle.toLowerCase()),
                ns2.bm('dropdown-popper', calcCssName(item)),
              ]}
            >
              {{
                default: () =>
                  renderActionButton(
                    firstItem,
                    convertBtnType(groupButtonStyle),
                  ),
                dropdown: () =>
                  enableDropdown && (
                    <el-dropdown-menu>
                      {remainders.map((detail: IAppDEUIActionGroupDetail) =>
                        renderDropdownItem(detail),
                      )}
                    </el-dropdown-menu>
                  ),
              }}
            </el-dropdown>
          );
        }
      }

      return null;
    };

    // 绘制按项展开
    const renderActionGroupItem = (item: IDETBGroupItem, isEmbed: boolean) => {
      const { uiactionGroup } = item;
      if (uiactionGroup && uiactionGroup.uiactionGroupDetails) {
        const { uiactionGroupDetails } = uiactionGroup;
        if (isEmbed) {
          return uiactionGroupDetails.map(
            (detail: IAppDEUIActionGroupDetail) => {
              return renderEmbedGroupDetail(item, detail);
            },
          );
        }
        return uiactionGroupDetails.map((detail: IAppDEUIActionGroupDetail) => (
          <div
            class={[
              ns2.e('item-deuiaction'),
              ns.em('item', convertBtnType(detail.buttonStyle)),
            ]}
          >
            {renderActionButton(detail)}
          </div>
        ));
      }
      return null;
    };

    // 绘制行为组展开
    const renderActionGroup = (
      item: IDETBGroupItem,
      isEmbed: boolean = false,
    ) => {
      const { groupExtractMode } = item;

      switch (groupExtractMode) {
        case 'ITEMS':
          return renderActionGroupItems(item, isEmbed);
        case 'ITEMX':
          return renderActionGroupItemx(item, isEmbed);
        case 'ITEM':
        default:
          return renderActionGroupItem(item, isEmbed);
      }
    };

    const renderSubmenu = (item: IDETBGroupItem) => {
      const detoolbarItems = item.detoolbarItems || [];
      const curVisible = c.state.buttonsState[item.id!].visible;
      const curDisabled = c.state.buttonsState[item.id!].disabled;
      if (!curVisible) {
        return null;
      }
      // 子项有一个loading状态，父项也应该呈现loading状态
      const ploading =
        detoolbarItems.findIndex(
          item2 => c.state.buttonsState[item2.id!]?.loading,
        ) !== -1;
      // 子项所有项都隐藏，父项也应该隐藏
      const pvisible =
        detoolbarItems.findIndex(item2 => {
          return c.state.buttonsState[item2.id!]?.visible === true;
        }) !== -1;
      // 当前项禁用或子项所有项都禁用，父项也应该禁用
      const pdisabled =
        curDisabled ||
        detoolbarItems.findIndex(item2 => {
          return c.state.buttonsState[item2.id!]?.disabled === false;
        }) === -1;

      // 当前项存在界面行为组
      if (
        item.uiactionGroup &&
        item.uiactionGroup.uiactionGroupDetails &&
        item.uiactionGroup.uiactionGroupDetails.length > 0
      ) {
        return renderActionGroup(item, true);
      }

      if (!pvisible) {
        return null;
      }
      const groupButtonStyle = item.buttonStyle || '';
      return (
        <el-sub-menu
          class={[
            ns.b('submenu'),
            ns.em('item', groupButtonStyle.toLowerCase()),
            calcCssName(item),
          ]}
          index={item.id}
          disabled={pdisabled}
          title={showTitle(item.tooltip)}
          popper-class={[
            ns.b('submenu-popper'),
            ns.bm('submenu-popper', toolbarStyle),
            ns.em('submenu-popper', groupButtonStyle.toLowerCase()),
            ns.bm('submenu-popper', calcCssName(item)),
            calcCssName(item),
          ]}
        >
          {{
            default: () => {
              return detoolbarItems.map(item2 => {
                const actionId = (item2 as IDETBUIActionItem).uiactionId;
                const visible = c.state.buttonsState[item2.id!]?.visible;
                const provider = c.itemProviders[item2.id!];
                if (!visible) {
                  return null;
                }
                if (provider) {
                  const component = resolveComponent(provider.component);
                  return h(component, {
                    key: item2.id,
                    class: [ns.e('item')],
                    item,
                    controller: c,
                  });
                }
                if (item2.itemType === 'SEPERATOR') {
                  return;
                }
                if (item2.itemType === 'RAWITEM') {
                  return (
                    <el-menu-item
                      index={`menuitem${item2.id}`}
                      title={showTitle(item2.tooltip)}
                    >
                      <iBizRawItem
                        rawItem={item2}
                        content={(item2 as IData).rawItem.content}
                        class={ns.b('submenu-rawitem')}
                        onClick={(e: MouseEvent): Promise<void> =>
                          handleClick(item2, e)
                        }
                      ></iBizRawItem>
                    </el-menu-item>
                  );
                }
                if (item2.itemType === 'DEUIACTION') {
                  const buttonType = (
                    item2 as IDETBUIActionItem
                  ).buttonStyle?.toLowerCase();
                  if (
                    actionId === 'exportexcel' ||
                    actionId === 'gridview_exportaction'
                  ) {
                    return (
                      <IBizExportExcel
                        class={[
                          ns.e('menu-exportexcel'),
                          ns.em('item', buttonType),
                          calcCssName(item2),
                        ]}
                        mode='menu'
                        item={item2}
                        btnContent={(barItem: IDEToolbarItem) =>
                          btnContent(barItem, c.state)
                        }
                        size={btnSize.value}
                        controller={c}
                        onExportExcel={(e: MouseEvent, data: IData): void => {
                          handleClick(item2, e, data);
                        }}
                      ></IBizExportExcel>
                    );
                  }
                  return (
                    <el-menu-item
                      class={[
                        ns.is(
                          'loading',
                          c.state.buttonsState[item2.id!].loading,
                        ),
                        ns.em('item', buttonType),
                        calcCssName(item2),
                      ]}
                      index={`menuitem${item2.id}`}
                      disabled={c.state.buttonsState[item2.id!].disabled}
                      title={showTitle(item2.tooltip)}
                      onClick={(e: MouseEvent): Promise<void> =>
                        handleClick(item2, e)
                      }
                    >
                      <el-button
                        loading={c.state.buttonsState[item2.id!].loading}
                      >
                        {btnContent(item2, c.state)}
                      </el-button>
                    </el-menu-item>
                  );
                }
                if (item2.itemType === 'ITEMS') {
                  return renderSubmenu(item2);
                }
                return null;
              });
            },
            title: () => {
              return (
                <el-button
                  loading={ploading}
                  disabled={pdisabled}
                  type={convertBtnType(groupButtonStyle)}
                >
                  {btnContent(item, c.state)}
                </el-button>
              );
            },
          }}
        </el-sub-menu>
      );
    };

    const renderToolbarItem = (item: IDEToolbarItem): VNode | null => {
      const itemId = item.id!;
      const visible = c.state.buttonsState[itemId]?.visible;
      const provider = c.itemProviders[itemId];
      if (!visible) {
        return null;
      }
      if (provider) {
        const component = resolveComponent(provider.component);
        return h(component, {
          key: itemId,
          class: [ns.e('item')],
          item,
          controller: c,
        });
      }
      if (item.itemType === 'SEPERATOR') {
        if (c.state.hideSeparator.includes(itemId)) {
          return null;
        }
        return (
          <div key={itemId} class={[ns.e('item'), ns.e('item-separator')]}>
            |
          </div>
        );
      }
      if (item.itemType === 'RAWITEM') {
        return (
          <div key={itemId} class={[ns.e('item'), ns.e('item-rawitem')]}>
            <iBizRawItem
              rawItem={item}
              content={(item as IData).rawItem.content}
              onClick={(e: MouseEvent): Promise<void> => handleClick(item, e)}
            ></iBizRawItem>
          </div>
        );
      }
      if (item.itemType === 'DEUIACTION') {
        const actionId = (item as IDETBUIActionItem).uiactionId;
        const buttonStyle = (item as IDETBUIActionItem).buttonStyle;
        if (
          actionId === 'exportexcel' ||
          actionId === 'gridview_exportaction'
        ) {
          return (
            <IBizExportExcel
              class={[
                ns.e('item'),
                ns.e('item-deuiaction'),
                ns.em('item', buttonStyle?.toLowerCase()),
                calcCssName(item),
              ]}
              item={item}
              btnContent={(barItem: IDEToolbarItem) =>
                btnContent(barItem, c.state)
              }
              size={btnSize.value}
              controller={c}
              onExportExcel={(e: MouseEvent, data: IData): void => {
                handleClick(item, e, data);
              }}
            ></IBizExportExcel>
          );
        }
        if (actionId === 'shortcut') {
          return (
            <IBizShortCutButton
              key={itemId}
              class={[
                ns.e('item'),
                ns.e('item-deuiaction'),
                ns.em('item', buttonStyle?.toLowerCase()),
                calcCssName(item),
              ]}
              item={item}
              controller={c}
              size={btnSize.value}
              onClick={(e: MouseEvent): Promise<void> => handleClick(item, e)}
            />
          );
        }
        return (
          <div
            key={itemId}
            class={[
              ns.e('item'),
              ns.e('item-deuiaction'),
              ns.em('item', buttonStyle?.toLowerCase()),
              calcCssName(item),
              ns.is('loading', c.state.buttonsState[itemId].loading),
            ]}
          >
            <el-button
              size={btnSize.value}
              title={showTitle(item.tooltip)}
              type={convertBtnType(buttonStyle)}
              loading={c.state.buttonsState[itemId].loading}
              disabled={c.state.buttonsState[itemId].disabled}
              onClick={(e: MouseEvent): Promise<void> => handleClick(item, e)}
            >
              {btnContent(item, c.state)}
            </el-button>
          </div>
        );
      }
      if (item.itemType === 'ITEMS') {
        const groupItem = item as IDETBGroupItem;
        const groupButtonStyle = groupItem.buttonStyle || '';

        if (groupItem.groupExtractMode && groupItem.uiactionGroup) {
          const extractName = `extract-mode-${
            groupItem.groupExtractMode?.toLowerCase() || 'item'
          }`;
          return (
            <div
              class={[
                ns2.b(),
                ns2.e(extractName),
                ns2.em('item', groupButtonStyle.toLowerCase()),
                calcCssName(item),
              ]}
            >
              {renderActionGroup(item)}
            </div>
          );
        }
        return (
          <el-menu
            mode='horizontal'
            class={[
              ns.e('menu'),
              ns.em('menu', groupButtonStyle.toLowerCase()),
              calcCssName(item),
            ]}
            ellipsis={false}
            menu-trigger='hover'
          >
            {renderSubmenu(item)}
          </el-menu>
        );
      }
      return null;
    };

    return {
      c,
      btnSize,
      ns,
      toolbarStyle,
      handleClick,
      renderExtraButtons,
      renderToolbarItem,
    };
  },
  render() {
    const { state } = this.c;
    let content = null;
    if (state.isCreated) {
      content = [
        // 绘制最前方的额外按钮
        state.extraButtons.before?.length > 0 &&
          this.renderExtraButtons(state.extraButtons.before),
        this.modelData.detoolbarItems?.map((item, index) => {
          const toolbarItemNode = this.renderToolbarItem(item);
          // 绘制指定位置后的额外按钮
          if (state.extraButtons[index]?.length) {
            return [
              toolbarItemNode,
              this.renderExtraButtons(state.extraButtons[index]),
            ];
          }
          return toolbarItemNode;
        }),
        // 绘制最后方的额外按钮
        state.extraButtons.after?.length > 0 &&
          this.renderExtraButtons(state.extraButtons.after),
      ];
    }

    return (
      <iBizControlBase
        controller={this.c}
        class={[
          this.ns.m(state.viewMode.toLowerCase()),
          this.ns.m(this.toolbarStyle),
        ]}
      >
        {content}
      </iBizControlBase>
    );
  },
});
