import { App } from 'vue';
import { registerControlProvider } from '@ibiz-template/runtime';
import { EntityFieldGrid } from './entity-field-grid';
import { EntityFieldGridProvider } from './entity-field-grid.provider';
import { registerEntityFieldGridLocale } from './locale';

export default {
  install(app: App): void {
    registerEntityFieldGridLocale();
    // 全局注册表格插件组件
    app.component(EntityFieldGrid.name!, EntityFieldGrid);
    // 全局注册表格插件适配器，GRID_RENDER是插件类型，ENTITY_FIELD_GRID是插件标识
    registerControlProvider(
      'GRID_RENDER_ENTITY_FIELD_GRID',
      () => new EntityFieldGridProvider(),
    );
  },
};

export {
  entityFieldGridEn,
  entityFieldGridLocale,
  entityFieldGridT,
  entityFieldGridZhCN,
  normalizeEntityFieldGridLocale,
  registerEntityFieldGridLocale,
} from './locale';
