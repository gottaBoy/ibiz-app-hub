import { App } from 'vue';
import { IBizTooltip } from './tooltip/tooltip';

export { IBizTooltip };

export const IBizCommon = {
  install: (v: App): void => {
    v.component(IBizTooltip.name!, IBizTooltip);
  },
};
