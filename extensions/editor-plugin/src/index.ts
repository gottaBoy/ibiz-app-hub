import { registerEditorProvider } from '@ibiz-template/runtime';
import { App } from 'vue';
import { EditorPlugin } from './editor-plugin';
import { EditorPluginProvider } from './editor-plugin.provider';

export default {
  install(app: App): void {
    // 全局注册编辑器插件组件
    app.component(EditorPlugin.name!, EditorPlugin);
    // 全局注册编辑器插件适配器，EDITOR_CUSTOMSTYLE是插件类型，R9EditorPluginId是插件标识
    registerEditorProvider(
      'EDITOR_CUSTOMSTYLE_R9EditorPluginId',
      () => new EditorPluginProvider(),
    );
  },
};
