import { App } from 'vue';
import { VTooltip, setApp } from './tooltip/tooltip';
import { IBizCommon } from './common';

export const IBizDirectives = {
  install: (v: App): void => {
    v.use(IBizCommon);
    v.directive('tooltip', VTooltip);
    setApp(v);
  },
};
