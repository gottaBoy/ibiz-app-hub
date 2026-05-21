import { App } from 'vue';
import {
  IBizPanelContainer,
  IBizPanelCtrlPos,
  IBizNavPos,
  IBizPanelField,
  IBizGridContainer,
  IBizPanelRawItem,
  IBizMultiDataContainer,
  IBizMultiDataContainerRaw,
  IBizPanelTabPage,
  IBizPanelContainerGroup,
  IBizSingleDataContainer,
  IBizScrollContainer,
  IBizPanelContainerImage,
  IBizPanelItemRender,
  IBizAuthWxmpQrcode,
  IBizTeleportPlaceholder,
  IBizPanelCtrlViewPageCaption,
} from '@ibiz-template/vue3-util';
import IBizViewContentPanelContainer from './view-content-panel-container';
import IBizViewHeaderPanelContainer from './view-header-panel-container';
import IBizViewFooterPanelContainer from './view-footer-panel-container';
import IBizPanelButton from './panel-button';
import IBizWFActionButton from './wf-action-button';
import IBizWFStepTrace from './wf-step-trace';
import IBizNavPosIndex from './nav-pos-index';
import IBizPanelTabPanel from './panel-tab-panel';
import IBizPanelCarouse from './panel-carousel';
import IBizPanelVideoPlayer from './panel-video-player';
import IBizAuthUserinfo from './auth-userinfo';
import IBizMobUserMessage from './user-message';
import IBizMobAsyncAction from './async-action';
import IBizPanelButtonList from './panel-button-list';
import IBizAuthSso from './auth-sso';
import IBizPanelAppTitle from './panel-app-title';
import IBizIndexBlankPlaceholder from './index-blank-placeholder';
import IBizViewMessage from './view-message';
import IBizViewMsgPos from './view-msg-pos';
import IBizSettingContainer from './setting-container';
import IBizSplitContainer from './split-container';
import IBizThemeToggling from './theme-toggling';

export const IBizPanelComponents = {
  install: (v: App): void => {
    v.use(IBizThemeToggling);
    v.use(IBizSplitContainer);
    v.use(IBizPanelCtrlViewPageCaption);
    v.use(IBizPanelContainer);
    v.use(IBizPanelCtrlPos);
    v.use(IBizNavPosIndex);
    v.use(IBizViewContentPanelContainer);
    v.use(IBizViewHeaderPanelContainer);
    v.use(IBizViewFooterPanelContainer);
    v.use(IBizPanelButton);
    v.use(IBizNavPos);
    v.use(IBizPanelField);
    v.use(IBizWFStepTrace);
    v.use(IBizGridContainer);
    v.use(IBizPanelRawItem);
    v.use(IBizWFActionButton);
    v.use(IBizSingleDataContainer);
    v.use(IBizMultiDataContainer);
    v.use(IBizMultiDataContainerRaw);
    v.use(IBizPanelTabPage);
    v.use(IBizPanelTabPanel);
    v.use(IBizPanelContainerGroup);
    v.use(IBizPanelContainerImage);
    v.use(IBizScrollContainer);
    v.use(IBizPanelCarouse);
    v.use(IBizPanelVideoPlayer);
    v.use(IBizAuthUserinfo);
    v.use(IBizPanelItemRender);
    v.use(IBizMobUserMessage);
    v.use(IBizMobAsyncAction);
    v.use(IBizPanelButtonList);
    v.use(IBizAuthSso);
    v.use(IBizAuthWxmpQrcode);
    v.use(IBizTeleportPlaceholder);
    v.use(IBizPanelAppTitle);
    v.use(IBizIndexBlankPlaceholder);
    v.use(IBizViewMessage);
    v.use(IBizViewMsgPos);
    v.use(IBizSettingContainer);
  },
};

export default IBizPanelComponents;
