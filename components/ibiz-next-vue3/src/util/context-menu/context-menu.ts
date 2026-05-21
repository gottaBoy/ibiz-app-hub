import { h, resolveComponent } from 'vue';
import { IUIActionGroup, IUIActionGroupDetail } from '@ibiz/model-core';
import { IButtonState, IButtonContainerState } from '@ibiz-template/runtime';
import { MenuItem } from '@imengyu/vue3-context-menu';

/**
 * 上下文菜单
 *
 * @export
 * @return {*}
 */
export function useContextMenu(): {
  calcUiactionGroupDetail(
    detail: IUIActionGroupDetail,
    menuState: IButtonContainerState,
    onUIActionClick?: (_uiaction: IUIActionGroupDetail) => void,
  ): MenuItem;
  calcUiactionGroup(
    uiactionGroup: IUIActionGroup,
    menuState: IButtonContainerState,
    onUIActionClick?: (_uiaction: IUIActionGroupDetail) => void,
  ): MenuItem[];
} {
  const iBizIcon = resolveComponent('IBizIcon');

  // 计算上下文菜单行为组项
  const calcUiactionGroupDetail = (
    detail: IUIActionGroupDetail,
    menuState: IButtonContainerState,
    onUIActionClick?: (_uiaction: IUIActionGroupDetail) => void,
  ) => {
    const detailState: IButtonState = menuState[detail.id!];
    const { sysImage } = detail as IData;
    const uiactionGroup = detail as IData;
    const caption =
      uiactionGroup.refUIActionGroup?.name ||
      uiactionGroup.refUIActionGroup?.id ||
      uiactionGroup.caption;
    const menuItem: MenuItem = {
      label: detail.showCaption ? caption : undefined,
      icon: detail.showIcon ? h(iBizIcon, { icon: sysImage }) : undefined,
      disabled: detailState.disabled,
      clickableWhenHasChildren: true,
      onClick: () => {
        onUIActionClick?.(detail);
      },
    };
    if (
      uiactionGroup.detailType === 'DEUIACTIONGROUP' &&
      uiactionGroup.refUIActionGroup?.dynamicMode === 1 &&
      uiactionGroup.refUIActionGroup?.uiactionGroupDetails?.length
    ) {
      // eslint-disable-next-line no-use-before-define
      menuItem.children = calcSubUiactionGroupDetails(
        uiactionGroup.refUIActionGroup?.uiactionGroupDetails,
        menuState,
        onUIActionClick,
      );
    }
    return menuItem;
  };

  // 计算上下文菜单次级行为组
  const calcSubUiactionGroupDetails = (
    uiactionGroupDetails: IUIActionGroupDetail[],
    menuState: IButtonContainerState,
    onUIActionClick?: (_uiaction: IUIActionGroupDetail) => void,
  ): MenuItem[] => {
    return uiactionGroupDetails
      ?.filter(detail => {
        const detailState: IButtonState = menuState[detail.id!];
        return detailState.visible;
      })
      .map(detail => {
        return calcUiactionGroupDetail(detail, menuState, onUIActionClick);
      });
  };

  // 计算上下文菜单行为组
  const calcUiactionGroup = (
    uiactionGroup: IUIActionGroup,
    menuState: IButtonContainerState,
    onUIActionClick?: (_uiaction: IUIActionGroupDetail) => void,
  ): MenuItem[] => {
    const menuItems = calcSubUiactionGroupDetails(
      uiactionGroup.uiactionGroupDetails!,
      menuState,
      onUIActionClick,
    );
    return menuItems;
  };

  return {
    calcUiactionGroupDetail,
    calcUiactionGroup,
  };
}
