import { ControlType, registerControlProvider } from '@ibiz-template/runtime';
import { App } from 'vue';
import { withInstall } from '@ibiz-template/vue3-util';
import { ToolbarControl } from './toolbar';
import { IBizExportExcel } from './export-excel/export-excel';
import { IBizShortCutButton } from './short-cut-button/short-cut-button';
import { ToolbarProvider } from './toolbar.provider';

export const IBizToolbarControl = withInstall(
  ToolbarControl,
  function (v: App) {
    v.component(ToolbarControl.name!, ToolbarControl);
    v.component(IBizExportExcel.name!, IBizExportExcel);
    v.component(IBizShortCutButton.name!, IBizShortCutButton);
    registerControlProvider(ControlType.TOOLBAR, () => new ToolbarProvider());
  },
);

export default IBizToolbarControl;
