import { App } from 'vue';
import { registerPanelItemProvider } from '@ibiz-template/runtime';
import { withInstall } from '@ibiz-template/vue3-util';
import { ThemeToggling } from './theme-toggling';
import { ThemeTogglingProvider } from './theme-toggling.provider';

export const IBizThemeToggling = withInstall(ThemeToggling, function (v: App) {
  v.component(ThemeToggling.name!, ThemeToggling);
  registerPanelItemProvider(
    'RAWITEM_THEME_TOGGLING',
    () => new ThemeTogglingProvider(),
  );
});

export default IBizThemeToggling;
