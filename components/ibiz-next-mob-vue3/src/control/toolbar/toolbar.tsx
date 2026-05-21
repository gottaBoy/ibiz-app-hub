import { useControlController, useNamespace } from '@ibiz-template/vue3-util';
import { computed, defineComponent, PropType } from 'vue';
import {
  IAppDEUIActionGroupDetail,
  IDETBGroupItem,
  IDEToolbar,
  IDEToolbarItem,
} from '@ibiz/model-core';
import {
  IControlProvider,
  IExtraButton,
  ToolbarController,
} from '@ibiz-template/runtime';
import {
  getGroupItemxFirstIndex,
  IToolbarItemRenderProps,
  useCustomToolBarRender,
  useToolBarItemRender,
  useToolbarGroupModalHandler,
  isRefUIActionGroup,
} from './toolbar-render-util';
import './toolbar.scss';

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
     * @description 部件适配器
     */
    provider: { type: Object as PropType<IControlProvider> },
    /**
     * @description 应用上下文对象
     */
    context: { type: Object as PropType<IContext>, required: true },
    /**
     * @description 视图参数对象
     * @default {}
     */
    params: { type: Object as PropType<IParams>, default: () => ({}) },
  },
  setup(props) {
    const c = useControlController((...args) => new ToolbarController(...args));
    const ns = useNamespace(`control-${c.model.controlType!.toLowerCase()}`);

    let position = '';

    switch (props.modelData.toolbarStyle) {
      case 'MOBNAVRIGHTMENU':
        position = 'right';
        break;
      case 'MOBNAVLEFTMENU':
        position = 'left';
        break;
      case 'MOBBOTTOMMENU':
        position = 'bottom';
        break;
      case 'USER':
        position = 'popper';
        break;
      default:
        break;
    }

    const btnSize = computed(() => {
      return position === 'bottom' ? 'normal' : 'small';
    });

    // 点击事件
    const handleClick = async (
      item: IDEToolbarItem | IExtraButton,
      event: MouseEvent,
      isGroupExtractMode?: boolean,
    ) => {
      const tempItem = { ...item };
      if (isGroupExtractMode) {
        Object.assign(tempItem, {
          ...item,
          itemType: (item as IAppDEUIActionGroupDetail).detailType,
        });
      }
      await c.onItemClick(tempItem, event);
    };

    // 工具栏通用绘制项
    const { btnType, getToolbarItemRenderProps, renderToolbarItemContent } =
      useToolBarItemRender(ns, c.state);

    // 工具栏绘制分组的模态框
    const { handleGroupItemClick } = useToolbarGroupModalHandler({
      buttonsState: c.state.buttonsState,
      counterData: c.state.counterData,
      groupShowMode: c.groupShowMode,
      modalCloseCallback: handleClick.bind(this),
    });

    // 用户自定义
    const { renderFloatButton } = useCustomToolBarRender(
      ns,
      props,
      c,
      handleClick.bind(this),
    );

    // 绘制分组项
    const renderGroupItem = (_opts: IToolbarItemRenderProps) => {
      const { itemModel, key, type, isGroupExtractMode } = _opts;
      return (
        <div key={key} class={[ns.e('group')]}>
          <van-button
            size={btnSize.value}
            type={type}
            onClick={(e: MouseEvent) =>
              handleGroupItemClick(itemModel, e, isGroupExtractMode)
            }
          >
            {renderToolbarItemContent(itemModel)}
          </van-button>
        </div>
      );
    };

    // 绘制工具栏行为项
    const renderActionItem = (_opts: IToolbarItemRenderProps) => {
      const { itemModel, key, cssName, title, type, isGroupExtractMode } =
        _opts;

      if (isRefUIActionGroup(itemModel)) {
        return renderGroupItem(_opts);
      }

      return (
        <div key={key} class={[ns.e('item'), cssName]}>
          <van-button
            title={title}
            size={btnSize.value}
            type={type}
            loading={c.state.buttonsState[key].loading}
            disabled={c.state.buttonsState[key].disabled}
            onClick={(e: MouseEvent) =>
              handleClick(itemModel, e, isGroupExtractMode)
            }
          >
            {renderToolbarItemContent(itemModel)}
          </van-button>
        </div>
      );
    };

    // 绘制按分组展开
    const renderActionGroupItems = (item: IDETBGroupItem) => {
      const { uiactionGroup } = item;
      if (uiactionGroup && uiactionGroup.uiactionGroupDetails) {
        return renderGroupItem(getToolbarItemRenderProps(item, true));
      }

      return null;
    };

    // 绘制首项+分组展开
    const renderActionGroupItemx = (item: IDETBGroupItem) => {
      const { uiactionGroup } = item;
      if (uiactionGroup && uiactionGroup.uiactionGroupDetails) {
        const { uiactionGroupDetails } = uiactionGroup;
        const firstIndex = getGroupItemxFirstIndex(
          uiactionGroupDetails,
          c.state.buttonsState,
          0,
        );
        if (firstIndex !== -1) {
          const firstItem = uiactionGroupDetails[
            firstIndex
          ] as IAppDEUIActionGroupDetail;
          return (
            <div key={item.id} class={[ns.e('group-itemx')]}>
              {renderActionItem(getToolbarItemRenderProps(firstItem, true))}
              <van-button
                size={btnSize.value}
                type={btnType(item)}
                icon={'arrow-down'}
                onClick={(e: MouseEvent) => handleGroupItemClick(item, e, true)}
              ></van-button>
            </div>
          );
        }
      }

      return null;
    };

    // 绘制按项展开
    const renderActionGroupItem = (item: IDETBGroupItem) => {
      const { uiactionGroup } = item;
      if (uiactionGroup && uiactionGroup.uiactionGroupDetails) {
        const { uiactionGroupDetails } = uiactionGroup;
        return uiactionGroupDetails.map((detail: IAppDEUIActionGroupDetail) =>
          renderActionItem(getToolbarItemRenderProps(detail, true)),
        );
      }
      return null;
    };

    // 绘制行为组展开模式
    const renderActionGroup = (item: IDETBGroupItem) => {
      const { groupExtractMode } = item;

      switch (groupExtractMode) {
        case 'ITEMS':
          return renderActionGroupItems(item);
        case 'ITEMX':
          return renderActionGroupItemx(item);
        case 'ITEM':
        default:
          return renderActionGroupItem(item);
      }
    };

    // 绘制扩展按钮
    const renderExtraButtons = (extraButtons: IExtraButton[]) => {
      return extraButtons.map(button => {
        return (
          <div key={button.id} class={[ns.e('item'), ns.e('item-extra')]}>
            <van-button
              title={button.tooltip}
              size={btnSize.value}
              onClick={(e: MouseEvent) => handleClick(button, e)}
            >
              {renderToolbarItemContent(button)}
            </van-button>
          </div>
        );
      });
    };

    // 绘制工具栏项
    const renderToolbarItem = (item: IDEToolbarItem) => {
      const itemId = item.id!;
      const visible = c.state.buttonsState[itemId]?.visible;
      if (['SEPERATOR', 'RAWITEM'].includes(item.itemType!)) {
        ibiz.log.error(
          ibiz.i18n.t('control.toolbar.noSupportType', {
            itemType: item.itemType,
          }),
        );
        return null;
      }
      if (item.itemType === 'ITEMS' && visible) {
        const groupItem = item as IDETBGroupItem;
        if (groupItem.groupExtractMode && groupItem.uiactionGroup) {
          return renderActionGroup(item);
        }
        return renderGroupItem(getToolbarItemRenderProps(item));
      }
      if (item.itemType === 'DEUIACTION' && visible) {
        return renderActionItem(getToolbarItemRenderProps(item));
      }

      return null;
    };

    return {
      c,
      ns,
      btnSize,
      position,
      handleClick,
      renderFloatButton,
      renderToolbarItemContent,
      renderExtraButtons,
      renderToolbarItem,
    };
  },
  render() {
    const { state } = this.c;

    if (!state.isCreated) return null;

    if (this.position === 'popper') {
      return (
        <iBizControlBase
          ref='contentRef'
          controller={this.c}
          class={[this.ns.b(), this.ns.b(this.position)]}
        >
          {this.renderFloatButton()}
        </iBizControlBase>
      );
    }

    return (
      <iBizControlBase
        controller={this.c}
        class={[
          this.ns.m(state.viewMode.toLowerCase()),
          this.ns.b(this.position),
        ]}
      >
        {/*  绘制最前方的额外按钮 */}
        {state.extraButtons.before?.length > 0 &&
          this.renderExtraButtons(state.extraButtons.before)}
        {this.modelData.detoolbarItems?.map((item, index) => {
          const toolbarItemNode = this.renderToolbarItem(item);
          // 绘制指定位置后的额外按钮
          if (state.extraButtons[index]?.length) {
            return [
              toolbarItemNode,
              this.renderExtraButtons(state.extraButtons[index]),
            ];
          }
          return toolbarItemNode;
        })}
        {/* 绘制最后方的额外按钮 */}
        {state.extraButtons.after?.length > 0 &&
          this.renderExtraButtons(state.extraButtons.after)}
      </iBizControlBase>
    );
  },
});
