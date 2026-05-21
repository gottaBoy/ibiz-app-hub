import { PlatformType, registerPlatformProvider } from '@ibiz-template/runtime';
import {
  IBizView,
  IBizPanelControl,
  IBizViewLayoutPanelControl,
  IBizDeRedirectView,
} from '@ibiz-template/vue3-util';
import { App } from 'vue';
import { IBizCommonComponents } from './common';
import {
  IBizAppMenuControl,
  IBizEditFormControl,
  IBizFormControl,
  IBizMDCtrlControl,
  IBizSearchFormControl,
  IBizTabExpPanelControl,
  IBizPickupViewPanelControl,
  IBizListControl,
  IBizToolbarControl,
  IBizSearchBarControl,
  IBizCaptionBarControl,
  IBizDRTabControl,
  IBizTreeControl,
  IBizDataViewControl,
  IBizDashboardControl,
  IBizChartControl,
  IBizCalendarControl,
  IBizWizardPanelControl,
  IBizAppMenuIconViewControl,
  IBizAppMenuListViewControl,
  IBizTreeExpBarControl,
  IBizDRBarControl,
} from './control';
import { iBizI18n } from './locale';
import IBizPanelComponents from './panel-component';
import {
  VueBrowserPlatformProvider,
  DingTalkPlatformProvider,
  IosPlatformProvider,
  WeChatOfficialPlatformProvider,
  AndroidPlatformProvider,
} from './platform';
import { IBizPortalView } from './view/portal-view';
import { IBizViewEngine } from './view-engine';
import IBizEditor from './editor';
import './style/index.scss';

export default {
  install: (v: App): void => {
    ibiz.i18n = iBizI18n;
    ibiz.util.getExcelUtil = () => import('./util/xlsx-util/xlsx-util');
    // vue 浏览器搭载平台
    const browserPlatformProvider = new VueBrowserPlatformProvider();
    const dingTalkPlatformProvider = new DingTalkPlatformProvider();
    const iosPlatformProvider = new IosPlatformProvider();
    const weChatOfficialPlatformProvider = new WeChatOfficialPlatformProvider();
    const androidPlatformProvider = new AndroidPlatformProvider();
    registerPlatformProvider(
      PlatformType.BROWSER,
      () => browserPlatformProvider,
    );
    registerPlatformProvider(
      PlatformType.DINGTALK,
      () => dingTalkPlatformProvider,
    );
    registerPlatformProvider(PlatformType.IOS, () => iosPlatformProvider);
    registerPlatformProvider(
      PlatformType.WECHAT,
      () => weChatOfficialPlatformProvider,
    );
    registerPlatformProvider(
      PlatformType.ANDROID,
      () => androidPlatformProvider,
    );

    v.use(IBizCommonComponents);
    v.use(IBizViewEngine);
    v.use(IBizView);
    v.use(IBizDeRedirectView);
    v.use(IBizViewLayoutPanelControl);
    // 门户视图单独处理
    v.use(IBizPortalView);
    // 部件
    v.use(IBizPanelComponents);
    v.use(IBizMDCtrlControl);
    v.use(IBizPanelControl);
    v.use(IBizAppMenuControl);
    v.use(IBizAppMenuIconViewControl);
    v.use(IBizAppMenuListViewControl);
    v.use(IBizFormControl);
    v.use(IBizSearchFormControl);
    v.use(IBizEditFormControl);
    v.use(IBizPickupViewPanelControl);
    v.use(IBizListControl);
    v.use(IBizTabExpPanelControl);
    v.use(IBizToolbarControl);
    v.use(IBizCaptionBarControl);
    v.use(IBizSearchBarControl);
    v.use(IBizDRTabControl);
    v.use(IBizTreeControl);
    v.use(IBizDataViewControl);
    v.use(IBizDashboardControl);
    v.use(IBizChartControl);
    v.use(IBizCalendarControl);
    v.use(IBizWizardPanelControl);
    v.use(IBizTreeExpBarControl);
    v.use(IBizDRBarControl);
    // 编辑器
    v.use(IBizEditor);
  },
};
