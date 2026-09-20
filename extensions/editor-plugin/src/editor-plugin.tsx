import { defineComponent } from 'vue';
import {
  getEditorEmits,
  getSpanProps,
  useNamespace,
} from '@ibiz-template/vue3-util';
import { EditorPluginController } from './editor-plugin.controller';
import { editorT } from './locale';
import './editor-plugin.scss';

export const EditorPlugin = defineComponent({
  name: 'IBizEditorPlugin',
  props: getSpanProps<EditorPluginController>() as IData,
  emits: getEditorEmits(),
  setup(props) {
    const ns = useNamespace('editor-plugin');
    const c = props.controller;

    return {
      c,
      ns,
    };
  },
  render() {
    return (
      <div
        class={[
          this.ns.b(),
          this.disabled ? this.ns.m('disabled') : '',
          this.readonly ? this.ns.m('readonly') : '',
        ]}
      >
        {editorT('pluginContent')}
      </div>
    );
  },
});
