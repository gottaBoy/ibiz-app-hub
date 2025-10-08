import { useControlController, useNamespace } from '@ibiz-template/vue3-util';
import { computed, defineComponent, PropType, VNode } from 'vue';
import {
  IDETBGroupItem,
  IDETBUIActionItem,
  IDEToolbar,
  IDEToolbarItem,
} from '@ibiz/model-core';
import {
  IControlProvider,
  IExtraButton,
  IToolbarState,
  ToolbarController,
} from '@ibiz-template/runtime';
import { IBizPopperToolbar } from './popper-toolbar/popper-toolbar';
import { convertBtnType } from '../../util';
import './toolbar.scss';

const btnContent = (
  item: IDEToolbarItem | IExtraButton,
  state?: IToolbarState,
) => {
  const tempItem = item as IDEToolbarItem;
  const counterNum =
    state && tempItem.counterId
      ? state.counterData[tempItem.counterId]
      : undefined;
  const image = (item as IDEToolbarItem).sysImage;
  const result = [];
  const ns = useNamespace('toolbar-item');
  if ((item as IDEToolbarItem).showIcon && image) {
    result.push(<iBizIcon class={ns.b('icon')} icon={image} />);
  }
  // 工作流特殊按钮下 无showCaption 统一显示caption
  if (
    ((item as IDEToolbarItem).showCaption ||
      (item as IExtraButton).buttonType === 'extra') &&
    item.caption
  ) {
    result.push(<span class={ns.b('text')}>{item.caption}</span>);
  }
  if (counterNum) {
    result.push(
      <iBizBadge
        class={ns.b('counter')}
        value={counterNum}
        counterMode={tempItem.counterMode}
      />,
    );
  }
  return result;
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

    // 点击事件
    const handleClick = async (
      item: IDEToolbarItem | IExtraButton,
      event: MouseEvent,
    ) => {
      await c.onItemClick(item, event);
    };

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

    const btnType = (item: IDETBUIActionItem) => {
      if (item.actionLevel && item.actionLevel > 100) return 'primary';
      return convertBtnType(item.buttonStyle);
    };

    const getChildrenActions = (item: IDETBGroupItem) => {
      let result: IData[] = [];
      const visibleItems = item.detoolbarItems?.filter(
        _item => c.state.buttonsState[_item.id!]?.visible,
      );
      if (visibleItems && visibleItems.length > 0) {
        result = visibleItems.map(_item => {
          return {
            ..._item,
            disabled: c.state.buttonsState[_item.id!]?.disabled,
            className: _item.sysCss?.cssName,
          };
        });
      }
      return result;
    };

    const renderExtraButtons = (extraButtons: IExtraButton[]) => {
      return extraButtons.map(button => {
        return (
          <div
            key={button.id}
            class={[ns.e('item'), ns.e('item-extra'), ns.e(`item-${position}`)]}
          >
            <van-button
              title={button.tooltip}
              size={btnSize.value}
              onClick={(e: MouseEvent) => handleClick(button, e)}
            >
              {btnContent(button, c.state)}
            </van-button>
          </div>
        );
      });
    };

    const renderToolbarItem = (item: IDEToolbarItem) => {
      const itemId = item.id!;
      if (['SEPERATOR', 'RAWITEM'].includes(item.itemType!)) {
        ibiz.log.error(
          ibiz.i18n.t('control.toolbar.noSupportType', {
            itemType: item.itemType,
          }),
        );
        return null;
      }
      if (item.itemType === 'ITEMS' && c.state.buttonsState[itemId]?.visible) {
        const placement = position === 'right' ? 'bottom-end' : 'bottom';
        return (
          <div
            key={itemId}
            class={[ns.e('item'), ns.e('item-items'), ns.e(`item-${position}`)]}
          >
            <van-popover
              class={[ns.e('popover'), item.sysCss?.cssName]}
              actions={getChildrenActions(item)}
              placement={placement}
              onSelect={(data: IDETBGroupItem, e: MouseEvent) => {
                handleClick(data, e);
              }}
            >
              {{
                action: ({ action }: { action: IDEToolbarItem }): VNode => {
                  const image = action.sysImage;
                  const counterNum =
                    c.state && item.counterId
                      ? c.state.counterData[item.counterId]
                      : undefined;
                  let icon = null;
                  let text = null;
                  let counter = null;
                  if (action.showIcon) {
                    icon = <iBizIcon class={ns.e('icon')} icon={image} />;
                  }
                  if (action.showCaption) {
                    text = <span class={ns.e('text')}>{action.caption}</span>;
                  }
                  if (counterNum) {
                    counter = (
                      <iBizBadge
                        class={ns.b('counter')}
                        value={counterNum}
                        counterMode={item.counterMode}
                      />
                    );
                  }
                  return (
                    <span class={ns.e('popover-item')}>
                      {icon}
                      {text}
                      {counter}
                    </span>
                  );
                },
                reference: (): VNode => {
                  const image = (item as IDEToolbarItem).sysImage;
                  const counterNum =
                    c.state && item.counterId
                      ? c.state.counterData[item.counterId]
                      : undefined;
                  let icon = null;
                  let text = null;
                  let counter = null;
                  if (item.showIcon) {
                    icon = <iBizIcon class={ns.e('icon')} icon={image} />;
                  }
                  if (item.showCaption) {
                    text = <span class={ns.e('text')}>{item.caption}</span>;
                  }
                  if (counterNum) {
                    counter = (
                      <iBizBadge
                        class={ns.b('counter')}
                        value={counterNum}
                        counterMode={item.counterMode}
                      />
                    );
                  }
                  return (
                    <van-button size={btnSize.value} type={btnType(item)}>
                      {icon}
                      {text}
                      {counter}
                    </van-button>
                  );
                },
              }}
            </van-popover>
          </div>
        );
      }
      if (
        item.itemType === 'DEUIACTION' &&
        c.state.buttonsState[itemId]?.visible
      ) {
        return (
          <div
            key={itemId}
            class={[
              ns.e('item'),
              ns.e('item-deuiaction'),
              ns.e(`item-${position}`),
              item.sysCss?.cssName,
            ]}
          >
            <van-button
              title={item.tooltip}
              size={btnSize.value}
              type={btnType(item)}
              loading={c.state.buttonsState[itemId].loading}
              disabled={c.state.buttonsState[itemId].disabled}
              onClick={(e: MouseEvent) => handleClick(item, e)}
            >
              {btnContent(item, c.state)}
            </van-button>
          </div>
        );
      }

      return null;
    };

    return {
      c,
      ns,
      btnSize,
      position,
      handleClick,
      renderExtraButtons,
      renderToolbarItem,
    };
  },
  render() {
    const { state } = this.c;

    if (this.position === 'popper') {
      return (
        <IBizPopperToolbar
          context={this.context}
          params={this.params}
          controller={this.c}
          modelData={this.modelData}
          class={[
            this.ns.m(state.viewMode.toLowerCase()),
            this.ns.b(this.position),
          ]}
        >
          {{
            btnContent: (item: IDEToolbarItem | IExtraButton) => {
              return btnContent(item, state);
            },
          }}
        </IBizPopperToolbar>
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
