import { defineComponent } from 'vue';
import { useNamespace } from '@ibiz-template/vue3-util';
import { GridRowState } from '@ibiz-template/runtime';
import { GridColumnPluginController } from './grid-column-plugin.controller';
import { gridColumnT } from './locale';
import './grid-column-plugin.scss';

export const GridColumnPlugin = defineComponent({
  name: 'IBizGridColumnPlugin',
  props: {
    controller: {
      type: GridColumnPluginController,
      required: true,
    },
    row: {
      type: GridRowState,
      required: true,
    },
  },
  setup() {
    const ns = useNamespace('grid-column-plugin');

    return {
      ns,
    };
  },
  render() {
    const content = () => {
      if (this.controller.model.columnType === 'UAGRIDCOLUMN') {
        return (
          <iBizGridUAColumn
            controller={this.controller}
            row={this.row}
          ></iBizGridUAColumn>
        );
      }
      if (this.controller.model.enableRowEdit) {
        return (
          <iBizGridFieldEditColumn
            controller={this.controller}
            row={this.row}
          ></iBizGridFieldEditColumn>
        );
      }
      return (
        <iBizGridFieldColumn
          controller={this.controller}
          row={this.row}
        ></iBizGridFieldColumn>
      );
    };

    return (
      <div class={this.ns.b()}>
        {gridColumnT('pluginContent')}
        {content()}
      </div>
    );
  },
});
