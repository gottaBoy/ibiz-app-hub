import {
  h,
  defineComponent,
  resolveComponent,
  ref,
  computed,
  PropType,
  nextTick,
  renderSlot,
} from 'vue';
import { useNamespace } from '@ibiz-template/vue3-util';
import { RuntimeError } from '@ibiz-template/core';
import {
  GridFieldEditColumnController,
  GridRowState,
} from '@ibiz-template/runtime';
import { isNil } from 'ramda';
import { useCellEdit } from './cell-edit';
import { useRowEdit } from './row-edit';
import { useAllEdit } from './all-edit';
import './grid-field-edit-column.scss';

export const GridFieldEditColumn = defineComponent({
  name: 'IBizGridFieldEditColumn',
  props: {
    controller: {
      type: GridFieldEditColumnController,
      required: true,
    },
    row: {
      type: GridRowState,
      required: true,
    },
    attrs: {
      type: Object as PropType<IData>,
      required: false,
    },
  },
  setup(props) {
    const ns = useNamespace('grid-field-edit-column');
    const componentRef = ref();

    const c = props.controller;

    const useByShowMode = (): {
      gridEditItemProps: IData;
      editorProps: IData;
    } => {
      switch (c.grid.editShowMode) {
        case 'cell':
          return useCellEdit(props, componentRef);
        case 'row':
          return useRowEdit(props, componentRef);
        case 'all':
          return useAllEdit(props, componentRef);
        default:
          throw new RuntimeError(
            ibiz.i18n.t('control.common.noSupportItem', {
              name: c.grid.editShowMode,
            }),
          );
      }
    };
    const { gridEditItemProps, editorProps } = useByShowMode();

    // 编辑器值变更事件
    const rowDataChange = async (
      val: unknown,
      name?: string,
      ignore: boolean = false,
    ): Promise<void> => {
      ibiz.log.debug(`${c.fieldName}值变更`, val);
      const { isEscOut } = gridEditItemProps;
      if (isEscOut) {
        gridEditItemProps.isEscOut = false;
        const rowData = props.row.data;
        // 手动刷新，防止组件缓存未改变
        const oldValue = rowData[c.fieldName];
        rowData[c.fieldName] = null;
        nextTick(() => {
          rowData[c.fieldName] = oldValue;
        });
        return;
      }
      await c.setRowValue(props.row, val, name, ignore);
    };

    const infoText = ref<string | undefined>(undefined);
    const onInfoTextChange = (text: string) => {
      infoText.value = text;
    };
    const tooltip = computed<string | undefined>(() => {
      // 非信息态不显示tooltip
      if (!editorProps.readonly) {
        return undefined;
      }
      if (isNil(infoText.value)) {
        const val = props.row.data[c.fieldName];
        return c.formatValue(val);
      }
      return infoText.value;
    });

    return {
      ns,
      c,
      componentRef,
      tooltip,
      rowDataChange,
      onInfoTextChange,
      gridEditItemProps,
      editorProps,
    };
  },
  render() {
    const val = this.row.data[this.c.fieldName];
    let content = null;
    const editorSlot = `${this.controller.model.codeName}_editor`;
    if (this.$slots[editorSlot]) {
      content = renderSlot(this.$slots, editorSlot!, {
        class: this.ns.e('editor'),
        value: val,
        data: this.row.data,
        controller: this.c.editor,
        overflowMode: this.c.grid.overflowMode,
        onChange: this.rowDataChange,
        onInfoTextChange: this.onInfoTextChange,
        title: this.tooltip,
        ...this.editorProps,
        ...this.attrs,
      });
    } else if (this.c.editorProvider) {
      content = h(resolveComponent(this.c.editorProvider.gridEditor), {
        class: this.ns.e('editor'),
        value: val,
        data: this.row.data,
        controller: this.c.editor,
        overflowMode: this.c.grid.overflowMode,
        onChange: this.rowDataChange,
        onInfoTextChange: this.onInfoTextChange,
        title: this.tooltip,
        ...this.editorProps,
        ...this.attrs,
      });
    }

    return (
      <iBizGridEditItem
        {...{
          ref: 'componentRef',
          required: !this.c.editItem.allowEmpty,
          error: this.row.errors[this.c.fieldName],
          overflowMode: this.c.grid.overflowMode,
          class: [
            this.ns,
            this.ns.m(this.c.grid.overflowMode),
            this.controller.model.cellSysCss?.cssName,
          ],
          ...this.gridEditItemProps,
        }}
      >
        {content}
      </iBizGridEditItem>
    );
  },
});
export default GridFieldEditColumn;
