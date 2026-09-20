import { App } from 'vue';
import { IBizDigitalFlop } from './digital-flop/index';
import { IBizScreenDashboard } from './screen-dashboard/index';
import { IBizScreenPortlet } from './screen-portlet/index';
import { IBizScreenRadioList } from './screen-radio-list/index';
import { IBizScreenRealTime } from './screen-real-time/index';
import { IBizScreenPortletRealTime } from './screen-portlet-real-time/index';
import { IBizScreenPanelContainer } from './screen-panel-container/index';
import { IBizCarouselList } from './carousel-list';
import { IBizCarouselGrid } from './carousel-grid';
import { IBizPercentPond } from './percent-pond';
import { IBizCustomButton } from './custom-button';
import { IBizWaterLevelPond } from './water-level-pond';
import { IBizCustomSearchBox } from './custom-search-box';
import { IBizTaggedWall } from './tagged-wall';
import { registerDataViewLocale } from './locale';

// 自定义边框
import {
  IBizCustomDV1,
  IBizCustomDV2,
  IBizCustomDV3,
  IBizCustomDV4,
  IBizCustomDV5,
  IBizCustomDV6,
  IBizCustomDV7,
  IBizCustomDV8,
  IBizCustomDV9,
  IBizCustomDV10,
  IBizCustomDV11,
  IBizCustomDV12,
  IBizCustomDV13,
} from './custom-border';
// 装饰器
import {
  IBizCustomDecoration1,
  IBizCustomDecoration2,
  IBizCustomDecoration3,
  IBizCustomDecoration4,
  IBizCustomDecoration5,
  IBizCustomDecoration6,
  IBizCustomDecoration11,
} from './custom-decoration';

// 注入组件
export default {
  install(_app: App): void {
    registerDataViewLocale();
    _app.use(IBizDigitalFlop);
    _app.use(IBizScreenDashboard);
    _app.use(IBizScreenPortlet);
    _app.use(IBizScreenRadioList);
    _app.use(IBizScreenRealTime);
    _app.use(IBizScreenPortletRealTime);
    _app.use(IBizScreenPanelContainer);
    _app.use(IBizCarouselList);
    _app.use(IBizCarouselGrid);
    _app.use(IBizPercentPond);
    _app.use(IBizCustomButton);
    _app.use(IBizWaterLevelPond);
    _app.use(IBizCustomSearchBox);
    _app.use(IBizTaggedWall);

    // 自定义边框
    _app.use(IBizCustomDV1);
    _app.use(IBizCustomDV2);
    _app.use(IBizCustomDV3);
    _app.use(IBizCustomDV4);
    _app.use(IBizCustomDV5);
    _app.use(IBizCustomDV6);
    _app.use(IBizCustomDV7);
    _app.use(IBizCustomDV8);
    _app.use(IBizCustomDV9);
    _app.use(IBizCustomDV10);
    _app.use(IBizCustomDV11);
    _app.use(IBizCustomDV12);
    _app.use(IBizCustomDV13);
    // 装饰器
    _app.use(IBizCustomDecoration1);
    _app.use(IBizCustomDecoration2);
    _app.use(IBizCustomDecoration3);
    _app.use(IBizCustomDecoration4);
    _app.use(IBizCustomDecoration5);
    _app.use(IBizCustomDecoration6);
    _app.use(IBizCustomDecoration11);
  },
};
