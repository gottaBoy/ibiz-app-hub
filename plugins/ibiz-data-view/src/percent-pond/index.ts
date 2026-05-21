import { App } from 'vue';
import { withInstall } from '@ibiz-template/vue3-util';
import { registerEditorProvider } from '@ibiz-template/runtime';
import { PercentPond } from './percent-pond';
import { PercentPondProvider } from './percent-pond.provider';

export const IBizPercentPond = withInstall(PercentPond, function (v: App) {
  v.component(PercentPond.name, PercentPond);
  registerEditorProvider(
    'SLIDER_SCREEN_PROGRESS',
    () => new PercentPondProvider(),
  );
});
