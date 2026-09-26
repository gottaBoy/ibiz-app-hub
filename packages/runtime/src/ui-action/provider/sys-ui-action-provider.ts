import { IAppDEUIAction } from '@ibiz/model-core';
import { SysUIActionTag } from '../../constant';
import { IUIActionResult, IUILogicParams } from '../../interface';
import { UIActionProviderBase } from './ui-action-provider-base';

/**
 * 系统预置界面行为适配器
 *
 * @author lxm
 * @date 2022-10-25 15:10:51
 * @export
 * @class SysUIActionProvider
 * @implements {IUIActionProvider}
 */
export class SysUIActionProvider extends UIActionProviderBase {
  private predefinedActionMap: Map<string, string> = new Map([
    ['EDITVIEW_EXITACTION', 'Exit'],
    ['EDITVIEW_SAVEANDEXITACTION', 'SaveAndExit'],
    ['TREEVIEW_REFRESHPARENTACTION', 'RefreshParent'],
    ['GRIDVIEW_EXPORTXMLACTION', 'ExportModel'],
    ['GRIDVIEW_EXPORTACTION', 'ExportExcel'],
    ['EDITVIEW_REMOVEANDEXITACTION', 'RemoveAndExit'],
    ['GRIDVIEW_PRINTACTION', 'Print'],
    ['EDITVIEW_NEXTRECORDACTION', 'NextRecord'],
    ['GRIDVIEW_NEWROWACTION', 'NewRow'],
    ['EDITVIEW_LASTRECORDACTION', 'LastRecord'],
    ['EDITVIEW_PREVRECORDACTION', 'PrevRecord'],
    ['GRIDVIEW_SEARCHBAR', 'ToggleFilter'],
    ['EDITVIEW_SAVEANDSTARTWFACTION', 'SaveAndStart'],
    ['EDITVIEW_NEWACTION', 'New'],
    ['EDITVIEW_PRINTACTION', 'Print'],
    ['EDITVIEW_COPYACTION', 'Copy'],
    ['EDITVIEW_HELPACTION', 'Help'],
    ['EDITVIEW_FIRSTRECORDACTION', 'FirstRecord'],
    ['GRIDVIEW_REFRESHACTION', 'Refresh'],
    ['EDITVIEW_SAVEANDNEWACTION', 'SaveAndNew'],
    ['EDITVIEW_VIEWWFSTEPACTORACTION', 'ViewWFStep'],
    ['EDITVIEW_SAVEACTION', 'Save'],
    ['TREEVIEW_REFRESHALLACTION', 'RefreshAll'],
    ['GRIDVIEW_IMPORTBAR', 'Import'],
    ['GRIDVIEW_ROWEDITACTION', 'ToggleRowEdit'],
    ['GRIDVIEW_NEWACTION', 'New'],
    ['GRIDVIEW_EDITACTION', 'Edit'],
    ['GRIDVIEW_HELPACTION', 'Help'],
    ['EDITVIEW_REFRESHACTION', 'Refresh'],
    ['GRIDVIEW_REMOVEACTION', 'Remove'],
    ['GRIDVIEW_COPYACTION', 'Copy'],
    ['GRIDVIEW_VIEWACTION', 'View'],
    ['GRIDVIEW_SAVEROWACTION', 'SaveRow'],
    ['APP_LOGIN', 'Login'],
    ['APP_LOGOUT', 'logout'],
    ['UTIL_RESET', 'Reset'],
    ['UTIL_SEARCH', 'Search'],
  ]);

  async execAction(
    action: IAppDEUIAction,
    args: IUILogicParams,
  ): Promise<IUIActionResult> {
    const { view } = args!;
    const uIActionTag =
      this.predefinedActionMap.get(action.predefinedType!) ||
      action.uiactionTag!;

    if (uIActionTag === SysUIActionTag.EXIT) {
      return { closeView: true };
    }

    const result = await view.callUIAction(uIActionTag, args);

    return result
      ? { data: Array.isArray(result) ? [...result] : [result] }
      : {};
  }
}
