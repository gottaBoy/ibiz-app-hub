import {
  IAppCodeList,
  IAppDEACMode,
  IAppMenuModel,
  IAppView,
  IControl,
  IDEDRBar,
  IDEForm,
  IDEFormButtonList,
  IDEFormDetail,
  IDEGrid,
  IDEGridFieldColumn,
  IDETBGroupItem,
  IDEToolbar,
  IDEToolbarItem,
  IDETree,
  ISubAppRef,
  ITabExpPanel,
  IUIActionGroup,
} from '@ibiz/model-core';
import { DSLHelper } from '@ibiz/rt-model-api';
// eslint-disable-next-line import/no-extraneous-dependencies
import { recursiveIterate } from '@ibiz-template/core';
import { mergeAppMenu } from './merge-app-menu';
import { mergeDEDrControl, mergeDETabExpPanel } from './merge-de-drcontrol';
import { mergeAppDEUIActionGroup } from './merge-app-uiaction-group';
import { mergeTreeView } from './merge-treeview';
import {
  getFormdataRelationTags,
  mergeAppDEForm,
  mergeFormDRTabpanel,
} from './merge-de-form';
import { mergeAppCodeList } from './merge-app-codelist';
/**
 * 子应用模型合并对象
 *
 * @author tony001
 * @date 2024-09-26 16:09:56
 * @export
 * @class MergeSubModelHelper
 */
export class MergeSubModelHelper {
  /**
   * dsl解析包
   *
   * @author tony001
   * @date 2024-09-26 16:09:48
   * @protected
   */
  protected dsl = new DSLHelper();

  /**
   * 合并应用主菜单
   *
   * @author tony001
   * @date 2024-09-26 16:09:03
   * @param {(IControl[] | undefined)} controls
   * @param {ISubAppRef[]} subAppRefs
   */
  mergeAppMainMenu(
    view: IAppView,
    controls: IControl[] | undefined,
    subAppRefs: ISubAppRef[],
  ): void {
    // config.common.mergeAppMenu参数值为disable，不处理该应用的菜单合并
    if (
      ibiz.config.common.mergeAppMenu &&
      ibiz.config.common.mergeAppMenu === 'disable'
    ) {
      return;
    }
    const dstAppMenu = controls?.find(item => {
      return item.controlType === 'APPMENU' && item.name === 'appmenu';
    });
    if (dstAppMenu) {
      for (let i = 0; i < subAppRefs.length; i++) {
        const srcAppMenu = subAppRefs[i].appMenuModel;
        if (srcAppMenu) {
          const { userTag } = srcAppMenu as IModel;
          if (userTag) {
            const [userKey, userValue] = userTag.split(':');
            // mergemenutag: 目标菜单代码名称,目标菜单代码名称建议识别正则缺省配置以匹配更多目标
            if (userKey === 'mergemenutag') {
              try {
                const userValueReg = new RegExp(userValue);
                if (!userValueReg.test(dstAppMenu.codeName!)) {
                  continue;
                }
              } catch (error) {
                ibiz.log.warn(
                  `[菜单合并]：无效的正则表达式${userValue},忽略处理`,
                );
                continue;
              }
            }
          }
          mergeAppMenu(dstAppMenu, srcAppMenu);
        }
      }
    }
  }

  /**
   * 合并扩展菜单
   *
   * @author tony001
   * @date 2024-09-26 16:09:27
   * @param {(IControl[] | undefined)} controls
   * @param {ISubAppRef[]} subAppRefs
   * @return {*}  {void}
   */
  mergeSubAppExtendedMenu(
    view: IAppView,
    controls: IControl[] | undefined,
    subAppRefs: ISubAppRef[],
  ): void {
    // config.common.mergeAppMenu参数值为disable，不处理该应用的菜单合并
    if (
      ibiz.config.common.mergeAppMenu &&
      ibiz.config.common.mergeAppMenu === 'disable'
    ) {
      return;
    }
    if (view.viewType !== 'APPINDEXVIEW' || !controls) return;
    const dstAppMenus = controls!.filter(item => {
      return item.controlType === 'APPMENU' && item.name !== 'appmenu';
    });
    if (dstAppMenus && dstAppMenus.length > 0) {
      for (let i = 0; i < dstAppMenus.length; i++) {
        const dstAppMenu = dstAppMenus[i];
        if (dstAppMenu && dstAppMenu.name) {
          for (let j = 0; j < subAppRefs.length; j++) {
            const srcAppMenu = ibiz.hub.getSubAppMenuModel(
              dstAppMenu.name,
              subAppRefs[j].appId,
            );
            if (srcAppMenu) {
              mergeAppMenu(dstAppMenu, srcAppMenu as IAppMenuModel);
            }
          }
        }
      }
    }
  }

  /**
   * 合并DRCtrl
   *
   * @author tony001
   * @date 2024-09-26 16:09:01
   * @param {IAppView} view
   * @param {(IControl[] | undefined)} controls
   * @param {ISubAppRef[]} subAppRefs
   */
  mergeSubAppDRCtrl(
    view: IAppView,
    controls: IControl[] | undefined,
    subAppRefs: ISubAppRef[],
  ): void {
    const dstDRCtrl = controls?.find(item => {
      return (
        item.controlType === 'DRBAR' ||
        item.controlType === 'DRTAB' ||
        item.controlType === 'TABEXPPANEL'
      );
    });
    if (dstDRCtrl) {
      if (dstDRCtrl.controlType === 'TABEXPPANEL') {
        for (let i = 0; i < subAppRefs.length; i++) {
          const srcDRCtrl = ibiz.hub.getSubAppTabExpPanel(
            (dstDRCtrl as ITabExpPanel).uniqueTag!,
            subAppRefs[i].appId,
          );
          if (srcDRCtrl) {
            mergeDETabExpPanel(
              dstDRCtrl as ITabExpPanel,
              srcDRCtrl as ITabExpPanel,
            );
          }
        }
      } else {
        for (let i = 0; i < subAppRefs.length; i++) {
          const srcDRCtrl = ibiz.hub.getSubAppDrControl(
            `${dstDRCtrl.appDataEntityId!.split('.')[1]}_${dstDRCtrl.modelType}_${(dstDRCtrl as IDEDRBar).dataRelationTag}`.toLowerCase(),
            subAppRefs[i].appId,
          );
          if (srcDRCtrl) {
            mergeDEDrControl(dstDRCtrl, srcDRCtrl);
          }
        }
      }
    }
  }

  /**
   * 合并工具栏界面行为组项
   *
   * @author tony001
   * @date 2024-09-26 16:09:23
   * @param {IAppView} view
   * @param {(IControl[] | undefined)} controls
   * @param {ISubAppRef[]} subAppRefs
   */
  mergeSubAppToolbarActionGroup(
    view: IAppView,
    controls: IControl[] | undefined,
    subAppRefs: ISubAppRef[],
  ): void {
    if (!controls) return;
    const dstToolBar = controls.find(item => {
      return item.controlType === 'TOOLBAR';
    });
    if (dstToolBar && (dstToolBar as IDEToolbar).detoolbarItems) {
      const dstToolBarItems = (dstToolBar as IDEToolbar).detoolbarItems;
      this.recursiveMergeSubAppToolbarItemActionGroup(
        dstToolBarItems as IDEToolbarItem[],
        view,
        subAppRefs,
      );
    }
    controls.forEach(control => {
      if (control && (control as IData).controls) {
        this.mergeSubAppToolbarActionGroup(
          view,
          (control as IData).controls,
          subAppRefs,
        );
      }
    });
  }

  /**
   * @description 递归合并工具项界面行为组
   * @param {IDEToolbarItem[]} dstToolBarItems
   * @param {IAppView} view
   * @param {ISubAppRef[]} subAppRefs
   * @memberof MergeSubModelHelper
   */
  recursiveMergeSubAppToolbarItemActionGroup(
    dstToolBarItems: IDEToolbarItem[],
    view: IAppView,
    subAppRefs: ISubAppRef[],
  ): void {
    if (dstToolBarItems && dstToolBarItems.length > 0) {
      for (let i = 0; i < dstToolBarItems.length; i++) {
        const dstToolBarItem = dstToolBarItems[i];
        if (
          dstToolBarItem &&
          (dstToolBarItem as IDETBGroupItem).uiactionGroup
        ) {
          const dstUIActionGroup: IModel = (dstToolBarItem as IDETBGroupItem)
            .uiactionGroup!;
          if (dstUIActionGroup) {
            for (let j = 0; j < subAppRefs.length; j++) {
              if (subAppRefs[j].appId === view.appId) {
                continue;
              }
              const srcAppDEUIActionGroup = ibiz.hub.getSubAppDEUIActionGroups(
                dstUIActionGroup.uniqueTag,
                subAppRefs[j].appId,
              );
              if (srcAppDEUIActionGroup) {
                mergeAppDEUIActionGroup(
                  (dstToolBarItems[i] as IDETBGroupItem).uiactionGroup,
                  srcAppDEUIActionGroup as IUIActionGroup,
                );
              }
            }
          }
        }
        if ((dstToolBarItem as IDETBGroupItem).detoolbarItems) {
          this.recursiveMergeSubAppToolbarItemActionGroup(
            (dstToolBarItem as IDETBGroupItem)
              .detoolbarItems as IDEToolbarItem[],
            view,
            subAppRefs,
          );
        }
      }
    }
  }

  /**
   * 合并树上下文菜单
   *
   * @author tony001
   * @date 2024-09-26 16:09:02
   * @param {IAppView} view
   * @param {(IControl[] | undefined)} controls
   * @param {ISubAppRef[]} subAppRefs
   */
  mergeSubAppTreeContextMenuActionGroup(
    view: IAppView,
    controls: IControl[] | undefined,
    subAppRefs: ISubAppRef[],
  ): void {
    if (!controls) return;
    const dstTree: IDETree | undefined = controls.find(item => {
      return item.controlType === 'TREEVIEW';
    });
    if (dstTree && dstTree.controls && dstTree.controls.length > 0) {
      const dstContextMenus = dstTree.controls?.filter(item => {
        return item.controlType === 'CONTEXTMENU';
      });
      if (dstContextMenus && dstContextMenus.length > 0) {
        for (let k = 0; k < dstContextMenus.length; k++) {
          const dstContextMenu = dstContextMenus[k];
          if (dstContextMenu && (dstContextMenu as IDEToolbar).detoolbarItems) {
            const dstContextMenuItems = (dstContextMenu as IDEToolbar)
              .detoolbarItems;
            if (dstContextMenuItems && dstContextMenuItems.length > 0) {
              for (let i = 0; i < dstContextMenuItems.length; i++) {
                const dstContextMenuItem = dstContextMenuItems[i];
                if (
                  dstContextMenuItem &&
                  (dstContextMenuItem as IDETBGroupItem).uiactionGroup
                ) {
                  const dstUIActionGroup: IModel = (
                    dstContextMenuItem as IDETBGroupItem
                  ).uiactionGroup!;
                  if (dstUIActionGroup) {
                    for (let j = 0; j < subAppRefs.length; j++) {
                      const srcAppDEUIActionGroup =
                        ibiz.hub.getSubAppDEUIActionGroups(
                          dstUIActionGroup.uniqueTag,
                          subAppRefs[j].appId,
                        );
                      if (srcAppDEUIActionGroup) {
                        mergeAppDEUIActionGroup(
                          (dstContextMenuItems[i] as IDETBGroupItem)
                            .uiactionGroup,
                          srcAppDEUIActionGroup as IUIActionGroup,
                        );
                        const targetDeTreeNodes = dstTree.detreeNodes?.filter(
                          treeNode => {
                            return (
                              treeNode.decontextMenu &&
                              treeNode.decontextMenu.modelId ===
                                dstContextMenu.modelId
                            );
                          },
                        );
                        if (targetDeTreeNodes && targetDeTreeNodes.length > 0) {
                          targetDeTreeNodes.forEach(targetDeTreeNode => {
                            targetDeTreeNode.decontextMenu = dstContextMenu;
                          });
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    controls.forEach(control => {
      if (control && (control as IData).controls) {
        this.mergeSubAppTreeContextMenuActionGroup(
          view,
          (control as IData).controls,
          subAppRefs,
        );
      }
    });
  }

  mergeSubAppTreeView(
    view: IAppView,
    controls: IControl[] | undefined,
    subAppRefs: ISubAppRef[],
  ): void {
    if (!controls) return;
    const dstTree: IDETree | undefined = controls.find(item => {
      return item.controlType === 'TREEVIEW';
    });
    if (dstTree) {
      const ids: string[] = dstTree.id!.split('.');
      for (let i = 0; i < subAppRefs.length; i++) {
        const srcTree = ibiz.hub.getSubAppControl(
          ids[1] + ids[2],
          subAppRefs[i].appId,
        );
        if (srcTree) {
          mergeTreeView(dstTree, srcTree as IDETree);
        }
      }
    }
    controls.forEach(control => {
      if (control && (control as IData).controls) {
        this.mergeSubAppTreeView(view, (control as IData).controls, subAppRefs);
      }
    });
  }

  /**
   * 合并表单行为组（按钮组）
   *
   * @author tony001
   * @date 2025-02-10 21:02:47
   * @param {IAppView} view
   * @param {(IControl[] | undefined)} controls
   * @param {ISubAppRef[]} subAppRefs
   */
  mergeSubAppFormActionGroup(
    view: IAppView,
    controls: IControl[] | undefined,
    subAppRefs: ISubAppRef[],
  ): void {
    if (!controls) return;
    const form = controls.find(item => {
      return item.controlType === 'FORM';
    });
    if (form) {
      recursiveIterate(
        form,
        (item: IDEFormDetail) => {
          if (
            item.detailType === 'BUTTONLIST' &&
            (item as IDEFormButtonList).uiactionGroup
          ) {
            const dstUIActionGroup: IModel = (item as IDEFormButtonList)
              .uiactionGroup!;
            for (let j = 0; j < subAppRefs.length; j++) {
              if (subAppRefs[j].appId === view.appId) {
                continue;
              }
              const srcAppDEUIActionGroup = ibiz.hub.getSubAppDEUIActionGroups(
                dstUIActionGroup.uniqueTag,
                subAppRefs[j].appId,
              );
              if (srcAppDEUIActionGroup) {
                mergeAppDEUIActionGroup(
                  (item as IDEFormButtonList).uiactionGroup,
                  srcAppDEUIActionGroup as IUIActionGroup,
                );
              }
            }
          }
        },
        {
          childrenFields: ['deformPages', 'deformTabPages', 'deformDetails'],
        },
      );
    }
  }

  /**
   * 合并表格列行为组
   *
   * @author tony001
   * @date 2025-02-11 18:02:21
   * @param {IAppView} view
   * @param {(IControl[] | undefined)} controls
   * @param {ISubAppRef[]} subAppRefs
   */
  mergeSubAppGridCloumnActionGroup(
    view: IAppView,
    controls: IControl[] | undefined,
    subAppRefs: ISubAppRef[],
  ): void {
    if (!controls) return;
    const grids = controls.filter(item => {
      return item.controlType === 'GRID';
    });
    if (grids && grids.length > 0) {
      grids.forEach((grid: IDEGrid) => {
        if (grid.degridColumns && grid.degridColumns.length > 0) {
          for (let i = 0; i < grid.degridColumns.length; i++) {
            if ((grid.degridColumns[i] as IDEGridFieldColumn).deuiactionGroup) {
              const dstUIActionGroup: IModel = (
                grid.degridColumns[i] as IDEGridFieldColumn
              ).deuiactionGroup!;
              for (let j = 0; j < subAppRefs.length; j++) {
                if (subAppRefs[j].appId === view.appId) {
                  continue;
                }
                const srcAppDEUIActionGroup =
                  ibiz.hub.getSubAppDEUIActionGroups(
                    dstUIActionGroup.uniqueTag,
                    subAppRefs[j].appId,
                  );
                if (srcAppDEUIActionGroup) {
                  mergeAppDEUIActionGroup(
                    (grid.degridColumns[i] as IDEGridFieldColumn)
                      .deuiactionGroup,
                    srcAppDEUIActionGroup as IUIActionGroup,
                  );
                }
              }
            }
          }
        }
      });
    }
  }

  /**
   * @description 合并子应用表单(实体代码标识和表单代码标识一致)
   * @param {IAppView} view
   * @param {(IControl[] | undefined)} controls
   * @param {ISubAppRef[]} subAppRefs
   * @memberof MergeSubModelHelper
   */
  mergeSubAppForm(
    view: IAppView,
    controls: IControl[] | undefined,
    subAppRefs: ISubAppRef[],
  ): void {
    if (!controls) return;
    const forms = controls.filter(item => {
      return item.controlType === 'FORM';
    });
    if (forms.length === 0) return;
    forms.forEach(dstForm => {
      const appDataEntityId = (dstForm as IDEForm).appDataEntityId?.split(
        '.',
      )?.[1];
      const { codeName } = dstForm as IDEForm;
      // 查找源表单存在基于数据关系部件构建的分页部件的数据关系标识
      const dataRelationTags = getFormdataRelationTags(dstForm);
      for (let i = 0; i < subAppRefs.length; i++) {
        const srcForm = ibiz.hub.getSubAppControl(
          appDataEntityId + codeName!,
          subAppRefs[i].appId,
        );
        // 常规表单合并
        if (srcForm) {
          mergeAppDEForm(dstForm, srcForm as IDEForm);
        }
        // 表单分页部件合并（数据关系部件）
        if (dataRelationTags && dataRelationTags.length > 0) {
          for (let j = 0; j < dataRelationTags.length; j++) {
            const dataRelationTag = dataRelationTags[j];
            const dataRelationForm = ibiz.hub.getSubAppControl(
              appDataEntityId + dataRelationTag,
              subAppRefs[i].appId,
            );
            if (dataRelationForm) {
              mergeFormDRTabpanel(
                dataRelationTag,
                dstForm,
                dataRelationForm as IDEForm,
              );
            }
          }
        }
      }
    });
  }

  /**
   * @description 合并子应用代码表(子应用代码表标识和主应用代码表标识一致，包含模块、代码表代码名称2部分内容保持一致)
   * @param codelist
   * @param subAppRefs
   */
  mergeSubAppCodeList(codelist: IAppCodeList, subAppRefs: ISubAppRef[]): void {
    if (!codelist || !subAppRefs || subAppRefs.length === 0) return;
    for (let i = 0; i < subAppRefs.length; i++) {
      const subCodeList = ibiz.hub.getSubAppCodeList(
        codelist.codeListTag!,
        subAppRefs[i].appId,
      );
      if (subCodeList) {
        mergeAppCodeList(codelist, subCodeList);
      }
    }
  }

  /**
   * @description 合并子应用AC自填模式界面行为组
   * @param {(IAppDEACMode[] | undefined)} acModes
   * @param {ISubAppRef[]} subAppRefs
   * @returns {*}  {void}
   * @memberof MergeSubModelHelper
   */
  mergeSubAppDEACModesActionGroup(
    acModes: IAppDEACMode[] | undefined,
    subAppRefs: ISubAppRef[],
  ): void {
    if (!acModes || !acModes.length || !subAppRefs || !subAppRefs.length)
      return;
    for (let index = 0; index < acModes.length; index++) {
      const { deuiactionGroup } = acModes[index];
      if (deuiactionGroup) {
        for (let j = 0; j < subAppRefs.length; j++) {
          const srcAppDEUIActionGroup = ibiz.hub.getSubAppDEUIActionGroups(
            (deuiactionGroup as IModel).uniqueTag,
            subAppRefs[j].appId,
          );
          if (srcAppDEUIActionGroup) {
            mergeAppDEUIActionGroup(
              deuiactionGroup as IUIActionGroup,
              srcAppDEUIActionGroup as IUIActionGroup,
            );
          }
        }
      }
    }
  }
}
