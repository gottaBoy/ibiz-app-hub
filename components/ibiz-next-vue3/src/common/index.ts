import { App, defineAsyncComponent } from 'vue';
import {
  IBizCodeList,
  IBizControlBase,
  IBizControlShell,
  IBizIcon,
  IBizRouterView,
  IBizViewShell,
  IBizBadge,
  IBizSignaturePad,
} from '@ibiz-template/vue3-util';
import { IBizActionToolbar } from './action-toolbar/action-toolbar';
import { IBizCol } from './col/col';
import { IBizRow } from './row/row';
import { IBizRawItem } from './rawitem/rawitem';
import { IBizNoData } from './no-data/no-data';
import { IBizSplit } from './split/split';
import { IBizSplitTrigger } from './split-trigger/split-trigger';
import { IBizExtendActionTimeLine } from './extend-action-timeline/extend-action-timeline';
import { ViewMessage } from './view-message/view-message';
import { IBizPagination } from './pagination/pagination';
import { IBizSortBar } from './sort-bar/sort-bar';
import { DataImport } from './data-import/data-import';
import { DataImport2 } from './data-import2/data-import2';
import { DataImport2Table } from './data-import2-table/data-import2-table';
import { DataImport2Select } from './data-import2-select/data-import2-select';
import { IBizGridSetting } from './grid-setting/grid-setting';
import { DoingNotice } from './doing-notice/doing-notice';
import { IBizCarouselComponent } from './carousel/carousel';
import { IBizCoopAlert } from './coop-alert/coop-alert';
import { CustomTheme } from './custom-theme/custom-theme';
import { IBizCarouselCard } from './carousel-card/carousel-card';
import { IBizEmojiSelect } from './emoji-select/emoji-select';
import { IBizQuickEdit } from './quick-edit/quick-edit';
import { IBizFullscreenToolbar } from './fullscreen-toolbar/fullscreen-toolbar';
import { IBizPqlEditor } from './pql-editor/pql-editor';
import { IBizCustomFilterCondition } from './custom-filter-condition/custom-filter-condition';
import { IBizAnchorContainer } from './anchor-container/anchor-container';
import { IBizButtonList } from './button-list/button-list';
import { IBizControlNavigation } from './control-navigation/control-navigation';
import { IBizGanttSetting } from './gantt-setting/gantt-setting';
import { IBizNavSplit } from './nav-split/nav-split';
import { IBizCropping } from './cropping/cropping';
import { IBizEditorEmptyText } from './editor-empty-text/editor-empty-text';
import { IBizKanbanSetting } from './kanben-setting/kanben-setting';

export * from './col/col';
export * from './row/row';
export * from './action-toolbar/action-toolbar';
export * from './rawitem/rawitem';
export * from './split/split';
export * from './split-trigger/split-trigger';
export * from './sort-bar/sort-bar';
export type { MapOptions } from './map-chart/map-chart.util';
export { DoingNotice } from './doing-notice/doing-notice';

export const IBizCommonComponents = {
  install: (v: App): void => {
    v.component(IBizKanbanSetting.name, IBizKanbanSetting);
    v.component(IBizEditorEmptyText.name, IBizEditorEmptyText);
    v.component(IBizCropping.name, IBizCropping);
    v.component(IBizControlBase.name, IBizControlBase);
    v.component(IBizQuickEdit.name, IBizQuickEdit);
    v.component(IBizEmojiSelect.name, IBizEmojiSelect);
    v.component(IBizIcon.name, IBizIcon);
    v.component(DoingNotice.name, DoingNotice);
    v.component(IBizRow.name, IBizRow);
    v.component(IBizCol.name, IBizCol);
    v.component(IBizRouterView.name, IBizRouterView);
    v.component(IBizActionToolbar.name, IBizActionToolbar);
    v.component(IBizViewShell.name, IBizViewShell);
    v.component(IBizControlShell.name, IBizControlShell);
    v.component(IBizRawItem.name, IBizRawItem);
    v.component(IBizCodeList.name, IBizCodeList);
    v.component(IBizNoData.name, IBizNoData);
    v.component(IBizSplit.name, IBizSplit);
    v.component(IBizSplitTrigger.name, IBizSplitTrigger);
    v.component(IBizExtendActionTimeLine.name, IBizExtendActionTimeLine);
    v.component(ViewMessage.name, ViewMessage);
    v.component(IBizPagination.name, IBizPagination);
    v.component(IBizSortBar.name, IBizSortBar);
    v.component(DataImport.name, DataImport);
    v.component(DataImport2.name, DataImport2);
    v.component(DataImport2Table.name, DataImport2Table);
    v.component(DataImport2Select.name, DataImport2Select);
    v.component(IBizGridSetting.name, IBizGridSetting);
    v.component(
      'IBizMapChart',
      defineAsyncComponent({
        loader: () => import('./map-chart/map-chart'),
      }),
    );
    v.component(
      'IBizMapChartUser',
      defineAsyncComponent({
        loader: () => import('./map-chart-user/map-chart-user'),
      }),
    );
    v.component(IBizBadge.name, IBizBadge);
    v.component(IBizCarouselComponent.name, IBizCarouselComponent);
    v.component(IBizCoopAlert.name, IBizCoopAlert);
    v.component(CustomTheme.name, CustomTheme);
    v.component(IBizCarouselCard.name, IBizCarouselCard);
    v.component(IBizFullscreenToolbar.name, IBizFullscreenToolbar);
    v.component(IBizPqlEditor.name, IBizPqlEditor);
    v.component(IBizCustomFilterCondition.name, IBizCustomFilterCondition);
    v.component(IBizAnchorContainer.name, IBizAnchorContainer);
    v.component(IBizButtonList.name, IBizButtonList);
    v.component(IBizControlNavigation.name, IBizControlNavigation);
    v.component(IBizGanttSetting.name, IBizGanttSetting);
    v.component(IBizNavSplit.name, IBizNavSplit);
    v.component(IBizSignaturePad.name, IBizSignaturePad);
  },
};

export default IBizCommonComponents;
