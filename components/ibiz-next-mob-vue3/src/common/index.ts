import {
  IBizCodeList,
  IBizViewShell,
  IBizIcon,
  IBizControlBase,
  IBizRouterView,
  IBizControlShell,
  IBizBadge,
  IBizSignaturePad,
} from '@ibiz-template/vue3-util';
import { App } from 'vue';
import { IBizActionToolbar } from './action-toolbar/action-toolbar';
import { IBizCarousel } from './carousel/carousel';
import { IBizCol } from './col/col';
import { IBizKeepAlive } from './keep-alive/keep-alive';
import { IBizNoData } from './no-data/no-data';
import { IBizRawItem } from './rawitem/rawitem';
import { IBizRow } from './row/row';
import { IBizPresetViewBack } from './preset-view-back/preset-view-back';
import { IBizPresetViewHeader } from './preset-view-header/preset-view-header';
import { IBizFullscreenHeader } from './fullscreen-header/fullscreen-header';
import { IBizButtonList } from './button-list/button-list';
import { IBizEmojiSelect } from './emoji-select/emoji-select';
import { IBizPreviewImage } from './preview-image/preview-image';
import { IBizDateRangeCalendar } from './date-range-picker/date-range-picker';
import { IBizCropping } from './cropping/cropping';
import { IBizActionGroup } from './action-group/action-group';
import { ViewMessage } from './view-message/view-message';
import { IBizMdSortSetting } from './md-sort-setting/md-sort-setting';
import { IBizSplit } from './split/split';
import { IBizSplitTrigger } from './split-trigger/split-trigger';
import { IBizMdAdvanedSearchfrom } from './md-advaned-searchform/md-advaned-searchform';
import { IBizAddBtn } from './add-btn/add-btn';
import { IBizAddMore } from './add-more/add-more';
import { FloatButton } from './float-button/float-button';
import { IBizInfoItem } from './info-item/info-item';
import { IBizTabLayout } from './tab-layout/tab-layout';
import { IBizAIButton } from './ai-button/ai-button';

export * from './col/col';
export * from './row/row';
export * from './keep-alive/keep-alive';
export * from './md-sort-setting/md-sort-setting';
export * from './md-advaned-searchform/md-advaned-searchform';
export * from './add-btn/add-btn';
export * from './add-more/add-more';

export const IBizCommonComponents = {
  install: (v: App): void => {
    v.component(IBizAddBtn.name!, IBizAddBtn);
    v.component(FloatButton.name!, FloatButton);
    v.component(IBizInfoItem.name!, IBizInfoItem);
    v.component(IBizAddMore.name!, IBizAddMore);
    v.component(IBizMdAdvanedSearchfrom.name!, IBizMdAdvanedSearchfrom);
    v.component(IBizSplit.name!, IBizSplit);
    v.component(IBizSplitTrigger.name!, IBizSplitTrigger);
    v.component(IBizActionGroup.name!, IBizActionGroup);
    v.component(IBizDateRangeCalendar.name!, IBizDateRangeCalendar);
    v.component(IBizViewShell.name!, IBizViewShell);
    v.component(IBizRow.name!, IBizRow);
    v.component(IBizCol.name!, IBizCol);
    v.component(IBizIcon.name!, IBizIcon);
    v.component(IBizControlBase.name, IBizControlBase);
    v.component(IBizKeepAlive.name, IBizKeepAlive);
    v.component(IBizRouterView.name!, IBizRouterView);
    v.component(IBizActionToolbar.name!, IBizActionToolbar);
    v.component(IBizNoData.name!, IBizNoData);
    v.component(IBizControlShell.name!, IBizControlShell);
    v.component(IBizRawItem.name!, IBizRawItem);
    v.component(IBizCarousel.name!, IBizCarousel);
    v.component(IBizPresetViewBack.name!, IBizPresetViewBack);
    v.component(IBizPresetViewHeader.name!, IBizPresetViewHeader);
    v.component(IBizCodeList.name!, IBizCodeList);
    v.component(IBizFullscreenHeader.name!, IBizFullscreenHeader);
    v.component(IBizButtonList.name!, IBizButtonList);
    v.component(IBizEmojiSelect.name!, IBizEmojiSelect);
    v.component(IBizBadge.name!, IBizBadge);
    v.component(IBizPreviewImage.name!, IBizPreviewImage);
    v.component(IBizCropping.name!, IBizCropping);
    v.component(IBizSignaturePad.name!, IBizSignaturePad);
    v.component(ViewMessage.name!, ViewMessage);
    v.component(IBizMdSortSetting.name!, IBizMdSortSetting);
    v.component(IBizTabLayout.name!, IBizTabLayout);
    v.component(IBizAIButton.name!, IBizAIButton);
  },
};

export default IBizCommonComponents;
