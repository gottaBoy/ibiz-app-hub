import { computed, h, onBeforeUnmount, ref, VNode } from 'vue';
import {
  IAppDEUIActionGroupDetail,
  IDETBGroupItem,
  IDETBUIActionItem,
  IDEToolbarItem,
} from '@ibiz/model-core';
import { Namespace } from '@ibiz-template/core';
import {
  IApiButtonContainerState,
  IExtraButton,
  IModal,
  IModalData,
  IOverlayContainer,
  ToolbarController,
} from '@ibiz-template/runtime';
import { useNamespace } from '@ibiz-template/vue3-util';
import { calcPopoverPlacement, convertBtnType } from '../../util';
import { ToolbarGroupList } from './toolbar-group-list/toolbar-group-list';
import { FloatToolbar } from './float-toolbar/float-toolbar';

/**
 * @description 工具栏项绘制参数
 */
export interface IToolbarItemRenderProps {
  /** 工具栏项模型 */
  itemModel: IDETBUIActionItem | IAppDEUIActionGroupDetail | IDETBGroupItem;
  /** 工具栏项模型标识 */
  key: string;
  /** 样式名称 */
  cssName?: string;
  /** 显示标题 */
  title?: string;
  /** 按钮类型 */
  type?: string;
  /** 是否为界面行为组展开模式绘制 */
  isGroupExtractMode?: boolean;
}

/**
 * @description 判断是否为引用界面行为组
 * @export
 * @param {IAppDEUIActionGroupDetail} detail
 * @return {*}  {boolean}
 */
export function isRefUIActionGroup(detail: IAppDEUIActionGroupDetail): boolean {
  return !!(detail.detailType === 'DEUIACTIONGROUP' && detail.refUIActionGroup);
}

/**
 * @description 获取分组中第一个可见项的索引，用于在"首项+分组展开"模式下，找到分组内第一个可见的行为项
 * @export
 * @param {IAppDEUIActionGroupDetail[]} details 行为组成员模型集合
 * @param {IApiButtonContainerState} buttonsState
 * @param {number} index
 * @return {*}  {number}
 */
export function getGroupItemxFirstIndex(
  details: IAppDEUIActionGroupDetail[],
  buttonsState: IApiButtonContainerState,
  index: number,
): number {
  if (index >= details.length) return -1;
  const firstItem: IParams = details[index];
  if (firstItem) {
    if (isRefUIActionGroup(firstItem as IAppDEUIActionGroupDetail)) {
      return index;
    }
    if (buttonsState[firstItem.id!].visible) {
      return index;
    }
    return getGroupItemxFirstIndex(details, buttonsState, index + 1);
  }
  return -1;
}

/**
 * @description 工具栏项渲染工具函数，提供工具栏项（按钮/分组）的渲染参数生成、内容渲染等能力
 * @export
 * @param {Namespace} ns
 * @param {IData} state
 * @return {*}
 */
export function useToolBarItemRender(
  ns: Namespace,
  state: IData,
): {
  btnType: (_item: IDETBUIActionItem) => string;
  getToolbarItemRenderProps: (
    item: IDETBUIActionItem | IAppDEUIActionGroupDetail | IDETBGroupItem,
    isGroupExtractMode?: boolean,
  ) => IToolbarItemRenderProps;
  renderToolbarItemContent: (_item: IDEToolbarItem | IExtraButton) => VNode;
} {
  // 按钮类型
  const btnType = (item: IDETBUIActionItem) => {
    return convertBtnType(item);
  };

  // 获取工具栏项绘制参数
  const getToolbarItemRenderProps = (
    item: IDETBUIActionItem | IAppDEUIActionGroupDetail | IDETBGroupItem,
    isGroupExtractMode?: boolean,
  ): IToolbarItemRenderProps => {
    return {
      itemModel: item,
      key: item.id!,
      cssName: item?.sysCss?.cssName,
      title: item.tooltip || item.caption,
      type: btnType(item),
      isGroupExtractMode,
    };
  };

  // 绘制工具栏项内容
  const renderToolbarItemContent = (
    item: IDEToolbarItem | IExtraButton,
  ): VNode => {
    const toolbarItem = item as IData;
    const caption =
      toolbarItem.refUIActionGroup?.name ||
      toolbarItem.refUIActionGroup?.id ||
      item.caption;
    const counterNum =
      state.counterData && toolbarItem.counterId
        ? state.counterData[toolbarItem.counterId]
        : null;
    const icon =
      toolbarItem.showIcon && toolbarItem.sysImage
        ? toolbarItem.sysImage
        : null;
    const label =
      (toolbarItem.showCaption ||
        (item as IExtraButton).buttonType === 'extra') &&
      caption
        ? caption
        : null;
    return (
      <iBizInfoItem
        class={ns.b('item')}
        icon={icon}
        label={label}
        badge={counterNum}
        badgeFloat={false}
      />
    );
  };

  return { getToolbarItemRenderProps, btnType, renderToolbarItemContent };
}

/**
 * @description 工具栏分组弹窗处理器，处理工具栏分组项的点击事件，管理弹窗的打开/关闭及回调逻辑
 * @export
 * @param {{
 *   buttonsState: IApiButtonContainerState;
 *   modal?: IModal;
 *   counterData?: IData;
 *   modalCloseCallback?: (
 *     _item: IDETBGroupItem,
 *     _event: MouseEvent,
 *     _isGroupExtractMode?: boolean,
 *   ) => void;
 * }} opts
 * @return {*}
 */
export function useToolbarGroupModalHandler(opts: {
  buttonsState: IApiButtonContainerState;
  modal?: IModal;
  counterData?: IData;
  groupShowMode: 'DEFAULT' | 'ACTIONSHEET';
  direction?: 'horizontal' | 'vertical';
  modalCloseCallback?: (
    _item: IDETBGroupItem,
    _event: MouseEvent,
    _isGroupExtractMode?: boolean,
  ) => void;
}): {
  handleItemClick: (
    _item: IDEToolbarItem,
    _event: MouseEvent,
    _isGroupExtractMode?: boolean,
  ) => void;
  handleGroupItemClick: (
    _item: IDETBGroupItem,
    _event: MouseEvent,
    _isGroupExtractMode?: boolean,
  ) => void;
  handleModalClose: () => void;
} {
  const ns = useNamespace('toolbar-group-modal');
  const {
    buttonsState,
    modal,
    counterData,
    groupShowMode,
    direction = 'vertical',
    modalCloseCallback,
  } = opts;

  let groupModalOverlay: IOverlayContainer | void;

  const handleCurOverlayClose = () => {
    groupModalOverlay?.dismiss();
  };

  const handleModalClose = () => {
    handleCurOverlayClose();
    modal?.dismiss({ ok: false, params: { isModalAllClose: true } });
  };

  const getGroupItems = (
    item: IDETBGroupItem,
    isGroupExtractMode: boolean,
  ): Array<IDEToolbarItem> => {
    let items = item.detoolbarItems;
    if (isGroupExtractMode) {
      const { uiactionGroup, refUIActionGroup, groupExtractMode } =
        item as IData;
      items =
        uiactionGroup?.uiactionGroupDetails ||
        refUIActionGroup?.uiactionGroupDetails;
      if (groupExtractMode === 'ITEMX') {
        if (!items?.length) return [];

        const firstIndex = getGroupItemxFirstIndex(items, buttonsState, 0);
        items = items
          .slice(firstIndex + 1)
          .filter(_item => !!buttonsState[_item.id!].visible);
      }
    }
    return items || [];
  };

  // 监听当前弹框或子弹框行为项点击，点击后则关闭当前弹框并且将点击的行为项数据向上层组件传递，最终由工具栏组件处理
  const handleActionItemClick = (
    item: IDEToolbarItem,
    event: MouseEvent,
    isGroupExtractMode?: boolean,
  ): void => {
    handleCurOverlayClose();
    modal?.dismiss({
      ok: true,
      data: [
        {
          event,
          action: item,
          isGroupExtractMode,
        },
      ],
    });
  };

  const openPopover = (
    _event: MouseEvent,
    _groupItems: IDEToolbarItem[],
    _isGroupExtractMode: boolean,
  ): IOverlayContainer => {
    const placement = calcPopoverPlacement(
      ns,
      _event.currentTarget as HTMLElement,
      _groupItems.length,
      direction,
      {
        width: '8rem',
        // 3rem为弹框内分组每项的高度
        height: '3rem',
      },
    );
    const overlay = ibiz.overlay.createPopover(
      (_modal: IModal) => {
        return h(ToolbarGroupList, {
          modal: _modal,
          groupItems: _groupItems,
          counterData,
          buttonsState,
          groupShowMode,
          isGroupExtractMode: _isGroupExtractMode,
        });
      },
      {},
      {
        width: '8rem',
        height: 'auto',
        modalClass: `${ns.b('popover')}`,
        placement,
      } as IData,
    );
    overlay.present(_event.currentTarget as HTMLElement);

    return overlay;
  };

  const openDrawer = (
    _groupItems: IDEToolbarItem[],
    _isGroupExtractMode: boolean,
  ): IOverlayContainer => {
    const overlay = ibiz.overlay.createDrawer(
      (_modal: IModal) => {
        return h(ToolbarGroupList, {
          modal: _modal,
          groupItems: _groupItems,
          counterData,
          buttonsState,
          groupShowMode,
          isGroupExtractMode: _isGroupExtractMode,
        });
      },
      {},
      {
        width: 100,
        height: 'auto',
        attrs: {
          position: 'bottom',
          overlayClass: `${ns.b('drawer')}`,
          closeable: false,
          round: true,
        },
      } as IData,
    );
    overlay.present();

    return overlay;
  };

  // 分组点击事件
  const handleGroupItemClick = async (
    _item: IDETBGroupItem,
    _event: MouseEvent,
    _isGroupExtractMode = false,
  ) => {
    handleCurOverlayClose();

    const groupItems = getGroupItems(_item, _isGroupExtractMode);
    // 分组没有数据时，不应该弹框弹出
    if (!groupItems.length) return;

    // 分组以弹框方式弹出，打开弹出组件，维护弹出层级，考虑分组嵌套的场景
    groupModalOverlay =
      groupShowMode === 'ACTIONSHEET'
        ? openDrawer(groupItems, _isGroupExtractMode)
        : openPopover(_event, groupItems, _isGroupExtractMode);

    const res: IData = await groupModalOverlay.onWillDismiss();
    if (res?.params?.isModalAllClose) {
      handleModalClose();
      return;
    }

    const item = res?.data?.[0];
    // 弹框关闭时，存在返回值则为行为项点击
    if (item) {
      const { action, event, isGroupExtractMode } = item;
      handleActionItemClick(action, event, isGroupExtractMode);
      modalCloseCallback?.(action, event, isGroupExtractMode);
    }
  };

  // 点击事件
  const handleItemClick = async (
    item: IDEToolbarItem,
    event: MouseEvent,
    isGroupExtractMode?: boolean,
  ) => {
    const detail = item as IAppDEUIActionGroupDetail;
    const itemType = item.itemType || detail.detailType;
    if (itemType === 'ITEMS' || isRefUIActionGroup(item)) {
      handleGroupItemClick(item, event);
      return;
    }
    // 当前弹框内行为项点击
    if (itemType === 'DEUIACTION' || isGroupExtractMode) {
      handleActionItemClick(item, event, isGroupExtractMode);
    }
  };

  onBeforeUnmount(() => {
    handleCurOverlayClose();
  });

  return {
    handleItemClick,
    handleGroupItemClick,
    handleModalClose,
  };
}

/**
 * @description 工具栏气泡及弹窗项的渲染工具函数，提供工具栏项或行为项的渲染参数生成、内容渲染等能力
 * @export
 * @param {Namespace} ns
 * @param {{
 *   buttonsState: IApiButtonContainerState;
 *   modal?: IModal;
 *   counterData?: IData;
 *   modalCloseCallback?: (
 *     _item: IDETBGroupItem,
 *     _event: MouseEvent,
 *     _isGroupExtractMode?: boolean,
 *   ) => void;
 * }} opts
 * @return {*}
 */
export function useToolbarModalItemRender(
  ns: Namespace,
  opts: {
    buttonsState: IApiButtonContainerState;
    modal?: IModal;
    counterData?: IData;
    groupShowMode: 'DEFAULT' | 'ACTIONSHEET';
    isFloatToolbar?: boolean;
    direction?: 'horizontal' | 'vertical';
  },
): {
  handleModalClose: () => void;
  renderToolbarItem: (_item: IDEToolbarItem) => VNode | VNode[] | null;
} {
  const {
    buttonsState,
    modal,
    counterData,
    groupShowMode,
    isFloatToolbar,
    direction,
  } = opts;

  const { getToolbarItemRenderProps, renderToolbarItemContent } =
    useToolBarItemRender(ns, {
      counterData,
    });

  const { handleItemClick, handleModalClose, handleGroupItemClick } =
    useToolbarGroupModalHandler({
      modal,
      counterData,
      buttonsState,
      groupShowMode,
      direction,
    });

  // 绘制分组项箭头
  const renderGroupItemArrow = () => {
    return (
      <div class={ns.e('item-arrow')}>
        <van-icon name='arrow' />
      </div>
    );
  };

  // 绘制分组项
  const renderGroupItem = (_opts: IToolbarItemRenderProps): VNode => {
    const { itemModel, key, isGroupExtractMode } = _opts;
    return (
      <div
        key={key}
        class={[ns.e('group-item')]}
        onClick={(e: MouseEvent) =>
          handleGroupItemClick(itemModel, e, isGroupExtractMode)
        }
      >
        <div class={ns.em('group-item', 'wrapper')}>
          {renderToolbarItemContent(itemModel)}
          {!isFloatToolbar ? renderGroupItemArrow() : null}
        </div>
      </div>
    );
  };

  // 绘制工具栏行为项
  const renderActionItem = (_opts: IToolbarItemRenderProps): VNode | null => {
    const { itemModel, isGroupExtractMode } = _opts;
    if (isRefUIActionGroup(itemModel)) {
      return renderGroupItem(_opts);
    }

    const itemId = itemModel.id!;
    const visible = buttonsState[itemId]?.visible;
    let disabled = buttonsState[itemId].disabled;

    if (!visible) return null;

    // 工具栏分组项始终不禁用
    const toolbarItem = itemModel as IDETBGroupItem;
    if (toolbarItem.itemType === 'ITEMS') disabled = false;
    return (
      <div
        class={[ns.e('item'), ns.is('disabled', disabled)]}
        onClick={(_e: MouseEvent) =>
          !disabled && handleItemClick(itemModel, _e, isGroupExtractMode)
        }
      >
        <div class={ns.em('item', 'wrapper')}>
          {renderToolbarItemContent(itemModel)}
        </div>
      </div>
    );
  };

  // 绘制按分组展开
  const renderActionGroupItems = (item: IDETBGroupItem): VNode | null => {
    const { uiactionGroup } = item;
    if (uiactionGroup && uiactionGroup.uiactionGroupDetails) {
      return renderGroupItem(getToolbarItemRenderProps(item, true));
    }

    return null;
  };

  // 绘制首项+分组展开
  const renderActionGroupItemx = (item: IDETBGroupItem): VNode | null => {
    const { uiactionGroup } = item;
    if (uiactionGroup && uiactionGroup.uiactionGroupDetails) {
      const { uiactionGroupDetails } = uiactionGroup;
      const firstIndex = getGroupItemxFirstIndex(
        uiactionGroupDetails,
        buttonsState,
        0,
      );
      if (firstIndex !== -1) {
        const firstItem = uiactionGroupDetails[
          firstIndex
        ] as IAppDEUIActionGroupDetail;
        return (
          <div key={item.id} class={[ns.e('group-itemx')]}>
            <div class={ns.em('group-itemx', 'wrapper')}>
              {renderActionItem(getToolbarItemRenderProps(firstItem, true))}
              <div
                onClick={(e: MouseEvent) => handleGroupItemClick(item, e, true)}
              >
                {renderGroupItemArrow()}
              </div>
            </div>
          </div>
        );
      }
    }

    return null;
  };

  // 绘制按项展开
  const renderActionGroupItem = (
    item: IDETBGroupItem,
  ): VNode | VNode[] | null => {
    const { uiactionGroup } = item;
    if (uiactionGroup && uiactionGroup.uiactionGroupDetails) {
      const { uiactionGroupDetails } = uiactionGroup;
      return uiactionGroupDetails.map(
        (detail: IAppDEUIActionGroupDetail) =>
          renderActionItem(getToolbarItemRenderProps(detail, true)) as VNode,
      );
    }
    return null;
  };

  // 绘制行为组展开模式
  const renderActionGroup = (item: IDETBGroupItem): VNode | VNode[] | null => {
    const { groupExtractMode } = item;

    if (isFloatToolbar) {
      switch (groupExtractMode) {
        case 'ITEMS':
        case 'ITEMX':
          return renderActionGroupItems(item);
        case 'ITEM':
        default:
          return renderActionGroupItem(item);
      }
    }

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

  // 绘制工具栏项
  const renderToolbarItem = (item: IDEToolbarItem): VNode | VNode[] | null => {
    const itemId = item.id!;
    const visible = buttonsState[itemId]?.visible;
    if (!visible) return null;

    const detail = item as IAppDEUIActionGroupDetail;
    const itemType = item.itemType || detail.detailType;
    if (itemType === 'ITEMS' || isRefUIActionGroup(item)) {
      const groupItem = item as IDETBGroupItem;
      if (groupItem.groupExtractMode && groupItem.uiactionGroup) {
        return renderActionGroup(item);
      }
      return renderGroupItem(
        getToolbarItemRenderProps(item, isRefUIActionGroup(item)),
      );
    }
    if (itemType === 'DEUIACTION') {
      return renderActionItem(
        getToolbarItemRenderProps(item, !!detail.detailType),
      );
    }

    return null;
  };

  return { handleModalClose, renderToolbarItem };
}

/**
 * @description 自定义工具栏渲染工具函数，提供自定义场景下浮动工具栏的渲染及交互逻辑
 * @export
 * @param {Namespace} ns
 * @param {IData} props
 * @param {ToolbarController} c
 * @param {(
 *     _item: IDETBGroupItem,
 *     _event: MouseEvent,
 *     _isGroupExtractMode?: boolean,
 *   ) => void} modalCloseCallback
 * @return {*}
 */
export function useCustomToolBarRender(
  ns: Namespace,
  props: IData,
  c: ToolbarController,
  modalCloseCallback: (
    _item: IDETBGroupItem,
    _event: MouseEvent,
    _isGroupExtractMode?: boolean,
  ) => void,
): {
  renderFloatButton: () => VNode | null;
} {
  const floatToolbarOverlay = ref();

  // 气泡弹出位置
  const modalPlacement = computed(() => {
    let placement = '';
    // 水平方向位置计算
    switch (c.placement) {
      case 'LEFTSTART':
      case 'LEFT':
      case 'LEFTEND':
        placement = 'right'; // 按钮在左，弹窗在右
        break;
      case 'RIGHTSTART':
      case 'RIGHT':
      case 'RIGHTEND':
      default:
        placement = 'left'; // 按钮在右，弹窗在左
        break;
    }

    // 垂直方向时调整位置（带起始点标识）
    if (c.direction === 'VERTICAL') {
      switch (c.placement) {
        case 'LEFTSTART':
        case 'LEFT':
          placement = 'right-start'; // 垂直排列时，弹窗从右侧起始点开始
          break;
        case 'LEFTEND':
          placement = 'right-end'; // 垂直排列时，弹窗从右侧结束点开始
          break;
        case 'RIGHTEND':
          placement = 'left-end'; // 垂直排列时，弹窗从左侧结束点开始
          break;
        case 'RIGHTSTART':
        case 'RIGHT':
        default:
          placement = 'left-start'; // 垂直排列时，弹窗从左侧起始点开始
          break;
      }
    }

    return placement;
  });

  // 绘制浮动工具栏
  const renderFloatToolbar = (modal?: IModal, immediateFloat = true) => {
    return h(FloatToolbar, {
      modal,
      modelData: props.modelData,
      state: c.state,
      buttonsState: c.state.buttonsState,
      counterData: c.state.counterData,
      placement: c.placement,
      direction: c.direction,
      groupShowMode: c.groupShowMode,
      immediateFloat,
    });
  };

  // 处理弹框关闭后续逻辑
  const handleDismiss = async (_res?: IModalData): Promise<boolean> => {
    const item = _res?.data?.[0];
    // 弹框关闭时，存在返回值则为行为项点击
    if (item) {
      const { action, event } = item;
      modalCloseCallback(action, event);
    }
    return false;
  };

  // 处理悬浮按钮的点击事件
  const onFloatBtnClick = async (
    _event: MouseEvent,
    _currentTarget: HTMLElement,
  ) => {
    if (floatToolbarOverlay.value) {
      await floatToolbarOverlay.value.dismiss();
      return;
    }
    floatToolbarOverlay.value = ibiz.overlay.createPopover(
      (modal: IModal) => renderFloatToolbar(modal, false),
      {},
      {
        width: 'auto',
        height: 'auto',
        noArrow: true,
        placement: modalPlacement.value,
        modalClass: `${ns.b('float-toolbar-modal')}`,
      } as IData,
    );
    floatToolbarOverlay.value.present(_currentTarget);
    const res: IData = await floatToolbarOverlay.value.onWillDismiss();
    handleDismiss(res as IModalData);
    floatToolbarOverlay.value = undefined;
  };

  onBeforeUnmount(() => {
    floatToolbarOverlay.value = undefined;
  });

  // 绘制悬浮按钮
  const renderFloatButton = () => {
    if (c.showMode === 'COLLAPSIBLE') {
      const slot = {} as IParams;
      // 若浮层已打开，显示关闭图标
      if (floatToolbarOverlay.value)
        Object.assign(slot, {
          icon: (): VNode => <van-icon name='cross' />,
        });

      return (
        <iBizFloatButton align={c.placement} onClick={onFloatBtnClick}>
          {slot}
        </iBizFloatButton>
      );
    }

    return (
      <iBizFloatButton align={c.placement} renderMode='DIV'>
        {renderFloatToolbar({
          dismiss: handleDismiss,
        } as IModal)}
      </iBizFloatButton>
    );
  };

  return {
    renderFloatButton,
  };
}
