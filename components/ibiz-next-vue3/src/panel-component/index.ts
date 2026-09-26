import { App } from 'vue';
import {
  IBizPanelContainer,
  IBizPanelCtrlPos,
  IBizScrollContainer,
  IBizNavPos,
  IBizPanelField,
  IBizPanelRawItem,
  IBizGridContainer,
  IBizMultiDataContainer,
  IBizMultiDataContainerRaw,
  IBizSingleDataContainer,
  IBizPanelContainerImage,
  IBizPanelTabPage,
  IBizPanelItemRender,
  IBizTeleportPlaceholder,
  IBizPanelContainerTabs,
  IBizPanelCtrlViewPageCaption,
  IBizAuthWxmpQrcode,
} from '@ibiz-template/vue3-util';
import IBizAuthUserinfo from './auth-userinfo';
import IBizNavPosIndex from './nav-pos-index';
import IBizNavTabs from './nav-tabs';
import IBizNavBreadcrumb from './nav-breadcrumb';
import IBizPanelButton from './panel-button';
import IBizPanelAppTitle from './panel-app-title';
import IBizPanelAppHeader from './panel-app-header';
import IBizPanelViewHeader from './panel-view-header';
import IBizPanelExpHeader from './panel-exp-header';
import IBizPanelViewContent from './panel-view-content';
import IBizPanelTabPanel from './panel-tab-panel';
import IBizSplitContainer from './split-container';
import PanelIndexViewSearch from './panel-index-view-search';
import IBizPanelAppLoginView from './panel-app-login-view';
import IBizPanelRememberMe from './panel-remember-me';
import IBizIndexActions from './index-actions';
import IBizUserMessage from './user-message';
import IBizSearchFormButtons from './searchform-buttons';
import IBizViewMessage from './view-message';
import IBizPanelStaticCarousel from './panel-static-carousel';
import IBizCoopPos from './coop-pos';
import IBizViewMsgPos from './view-msg-pos';
import IBizUserAction from './user-action';
import IBizDataImport from './data-import';
import IBizShortCut from './short-cut';
import IBizAuthCaptcha from './auth-captcha';
import IBizPanelButtonList from './panel-button-list';
import IBizAuthSso from './auth-sso';
import IBizIndexBlankPlaceholder from './index-blank-placeholder';
import IBizGlobalSearch from './global-search';
import IBizAppSwitch from './app-switch';
import IBizAppExtendMenu from './app-extend-menu';
import { IBizPanelContainerGroup } from './panel-container-group';

export * from './auth-userinfo';
export * from './nav-pos-index';
export * from './panel-button';
export * from './panel-app-title';
export * from './panel-tab-panel';
export * from './split-container';
export * from './panel-index-view-search';
export * from './index-actions';
export * from './user-action';

export const IBizPanelComponents = {
  install: (v: App): void => {
    v.use(IBizGlobalSearch);
    v.use(IBizIndexBlankPlaceholder);
    v.use(IBizAuthSso);
    v.use(IBizPanelCtrlViewPageCaption);
    v.use(IBizPanelContainer);
    v.use(IBizPanelCtrlPos);
    v.use(IBizScrollContainer);
    v.use(IBizAuthUserinfo);
    v.use(IBizNavPosIndex);
    v.use(IBizNavTabs);
    v.use(IBizNavBreadcrumb);
    v.use(IBizPanelButton);
    v.use(IBizNavPos);
    v.use(IBizPanelAppTitle);
    v.use(IBizSingleDataContainer);
    v.use(IBizMultiDataContainer);
    v.use(IBizMultiDataContainerRaw);
    v.use(IBizPanelField);
    v.use(IBizPanelAppHeader);
    v.use(IBizPanelViewHeader);
    v.use(IBizPanelExpHeader);
    v.use(IBizPanelRawItem);
    v.use(IBizPanelViewContent);
    v.use(IBizGridContainer);
    v.use(IBizPanelTabPanel);
    v.use(IBizPanelTabPage);
    v.use(IBizSplitContainer);
    v.use(PanelIndexViewSearch);
    v.use(IBizPanelAppLoginView);
    v.use(IBizPanelRememberMe);
    v.use(IBizIndexActions);
    v.use(IBizPanelContainerGroup);
    v.use(IBizUserMessage);
    v.use(IBizPanelContainerImage);
    v.use(IBizSearchFormButtons);
    v.use(IBizPanelItemRender);
    v.use(IBizViewMessage);
    v.use(IBizPanelStaticCarousel);
    v.use(IBizTeleportPlaceholder);
    v.use(IBizPanelContainerTabs);
    v.use(IBizCoopPos);
    v.use(IBizViewMsgPos);
    v.use(IBizUserAction);
    v.use(IBizDataImport);
    v.use(IBizShortCut);
    v.use(IBizAuthCaptcha);
    v.use(IBizPanelButtonList);
    v.use(IBizAuthWxmpQrcode);
    v.use(IBizAppSwitch);
    v.use(IBizAppExtendMenu);
  },
};

export default IBizPanelComponents;
