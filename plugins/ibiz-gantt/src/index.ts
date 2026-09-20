import type { App, Plugin } from 'vue';
import XGantt from './exports/root';
import XGanttColumn from './exports/column';
import XGanttSlider from './exports/slider';
import './styles/index.scss';
import { registerGanttLocale } from './locale';

const components: Record<string, Plugin> = {
  XGantt,
  XGanttColumn,
  XGanttSlider,
};

export { XGantt, XGanttColumn, XGanttSlider, registerGanttLocale };

const install = (app: App, options?: Record<string, unknown>) => {
  registerGanttLocale();
  for (const key of Object.keys(components)) {
    app.use(components[key], options);
  }
};

export default {
  install,
};
