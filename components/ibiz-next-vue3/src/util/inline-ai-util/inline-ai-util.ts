/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { App, createApp, h } from 'vue';
import ContextMenu, { MenuItem } from '@imengyu/vue3-context-menu';
import { IAppDEACMode } from '@ibiz/model-core';
import { IInLineAiChatOptions, IInLineAIUtil } from '@ibiz-template/runtime';
import { useNamespace } from '@ibiz-template/vue3-util';
import { InlineAITextArea } from './inline-ai-textarea/inline-ai-textarea';

/**
 * 内联AI工具类
 *
 * @export
 * @class InLineAIUtil
 * @implements {IInLineAIUtil}
 */
export class InLineAIUtil implements IInLineAIUtil {
  private currentApp: App | null = null;

  private container: HTMLElement | null = null;

  private ns = useNamespace('inline-ai-container');

  /**
   * Creates an instance of InLineAIUtil.
   * @memberof InLineAIUtil
   */
  constructor() {}

  /**
   * 计算上下文菜单
   * @param deACMode
   * @param clickCallBack
   * @returns
   */
  calcContextMenus(
    deACMode: IAppDEACMode | undefined,
    clickCallBack: (tag: string) => void,
  ): MenuItem[] {
    const menus: MenuItem[] = [];
    if (
      !deACMode ||
      !deACMode.deuiactionGroup ||
      !deACMode.deuiactionGroup.uiactionGroupDetails
    )
      return menus;
    deACMode.deuiactionGroup?.uiactionGroupDetails?.forEach((item: IModel) => {
      const menuItem: MenuItem | undefined = {};
      if (
        item.detailType === 'DEUIACTION' &&
        item.uiactionId?.startsWith('inline')
      ) {
        if (item.showCaption && item.caption) {
          menuItem.label = item.caption;
        }
        if (item.sysImage && item.showIcon) {
          menuItem.icon = h('iBizIcon', {
            icon: item.sysImage,
          });
        }
        menuItem.clickClose = true;
        const { uiactionId } = item;
        if (uiactionId) {
          menuItem.onClick = () => {
            clickCallBack(uiactionId);
          };
        }
        menus.push(menuItem);
      } else if (
        item.detailType === 'DEUIACTIONGROUP' &&
        item.refUIActionGroup &&
        item.refUIActionGroup.id?.startsWith('inline')
      ) {
        menuItem.label = item.refUIActionGroup.name;
        const menuItems = item.refUIActionGroup.uiactionGroupDetails
          ?.filter((detail: IModel) => {
            return (
              detail.detailType === 'DEUIACTION' &&
              detail.uiactionId?.startsWith('inline')
            );
          })
          .map((detail: IModel) => {
            return {
              label: detail.showCaption ? detail.caption : undefined,
              icon:
                detail.showIcon && detail.sysImage
                  ? h('iBizIcon', {
                      icon: detail.sysImage,
                    })
                  : undefined,
              clickableWhenHasChildren: true,
              onClick: () => {
                ContextMenu.closeContextMenu();
                clickCallBack(detail.uiactionId!);
              },
            };
          });
        menuItem.children = menuItems;
        menus.push(menuItem);
      }
    });
    return menus;
  }

  /**
   * 显示上下文菜单
   * @param x 距离左侧距离
   * @param y 距离上方距离
   * @param menus 菜单集合
   */
  showContextMenus(
    x: number,
    y: number,
    menus: IData[],
    options: IData = {},
  ): void {
    ContextMenu.showContextMenu({
      x,
      y,
      customClass: this.ns.b('context-menu'),
      items: menus,
      ...options,
    });
  }

  /**
   * 销毁组件实例
   */
  private destroyInlineAIComponent(): void {
    // 卸载Vue应用
    if (this.currentApp && this.container) {
      this.currentApp.unmount();
      this.currentApp = null;
    }

    // 移除DOM元素
    if (this.container && document.body.contains(this.container)) {
      document.body.removeChild(this.container);
      this.container = null;
    }
  }

  /**
   *  显示AI聊天组件
   * @param selectText
   * @param options
   * @returns
   */
  showAIChat(
    context: IContext,
    params: IParams,
    data: IData,
    selectText: string,
    deACMode: IAppDEACMode,
    options: IInLineAiChatOptions,
  ): void {
    // 如果已有实例存在，先清理
    this.destroyInlineAIComponent();

    // 创建容器元素
    this.container = document.createElement('div');
    this.container.id = this.ns.b();
    this.container.className = this.ns.b();
    document.body.appendChild(this.container);

    // 准备回调参数
    const { editor } = params;
    const { insertText, replaceSelectionText, restoreSelection, editorParams } =
      editor;
    delete params.editor;
    const unMountAIChat = () => {
      this.destroyInlineAIComponent();
    };

    // 创建Vue应用实例
    this.currentApp = createApp(InlineAITextArea, {
      context,
      params,
      data,
      editorParams,
      content: selectText,
      deACMode,
      options,
      insertText: insertText.bind(editor),
      replaceSelectionText: replaceSelectionText.bind(editor),
      restoreSelection: restoreSelection.bind(editor),
      unMountAIChat,
    });

    // 挂载组件
    this.currentApp.mount(this.container);
  }

  /**
   * 隐藏AI聊天组件
   */
  public hideAIChat(): void {
    this.destroyInlineAIComponent();
  }
}
