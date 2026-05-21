import { h } from 'vue';
import { ISysImage } from '@ibiz/model-core';
import { AppMenuController, IModal } from '@ibiz-template/runtime';
import { MenuDesign } from './custom-menu-design/custom-menu-design';

/**
 * 菜单项未配置图标时，默认显示的图标
 *
 * @export
 * @return {*}  {(ISysImage | void)}
 */
export function getDefaultIconVal(): ISysImage | void {
  return { cssClass: 'fa fa-th-large' } as ISysImage;
}

/**
 * 菜单绘制工具
 *
 * @export
 * @param {AppMenuController} c
 * @param {Namespace} ns
 * @return {*}  {{
 *   renderCustomized: () => VNode;
 * }}
 */
export function useMenuRender(c: AppMenuController): {
  onCustomizedClick: () => Promise<void>;
} {
  // 是否为标准菜单
  const isDefaultMenu = !c.model.appMenuStyle;
  const showMode = isDefaultMenu ? 'LIST' : 'TREE';
  // 定制按钮点击
  const onCustomizedClick = async (): Promise<void> => {
    await ibiz.overlay.drawer(
      (modal: IModal) => {
        return h(MenuDesign, {
          modal,
          controller: c,
          showMode,
        });
      },
      {},
      {
        width: 100,
        height: 80,
        attrs: {
          position: 'bottom',
          closeable: false,
          round: true,
        },
      },
    );
  };

  return { onCustomizedClick };
}
