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
import { IBizMdCtrlSetting } from './md-ctrl-setting/md-ctrl-setting';
import { IBizPreviewImage } from './preview-image/preview-image';
import { IBizDateRangeCalendar } from './date-range-picker/date-range-picker';
import { IBizCropping } from './cropping/cropping';

export * from './col/col';
export * from './row/row';
export * from './keep-alive/keep-alive';

export const IBizCommonComponents = {
  install: (v: App): void => {
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
    v.component(IBizMdCtrlSetting.name!, IBizMdCtrlSetting);
    v.component(IBizPreviewImage.name!, IBizPreviewImage);
    v.component(IBizCropping.name!, IBizCropping);
    v.component(IBizSignaturePad.name!, IBizSignaturePad);
  },
};

export default IBizCommonComponents;
