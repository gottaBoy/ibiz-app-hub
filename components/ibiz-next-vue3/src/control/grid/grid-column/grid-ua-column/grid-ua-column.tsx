import { IUIActionGroupDetail } from '@ibiz/model-core';
import { defineComponent } from 'vue';
import { useNamespace } from '@ibiz-template/vue3-util';
import './grid-ua-column.scss';
import { GridUAColumnController, GridRowState } from '@ibiz-template/runtime';

export const GridUAColumn = defineComponent({
  name: 'IBizGridUAColumn',
  props: {
    controller: {
      type: GridUAColumnController,
      required: true,
    },
    row: {
      type: GridRowState,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('grid-ua-column');
    const onStopPropagation = (e: MouseEvent): void => {
      e.stopPropagation();
    };
    const onActionClick = async (
      detail: IUIActionGroupDetail,
      event: MouseEvent,
    ): Promise<void> => {
      await props.controller.onActionClick(detail, props.row, event);
    };

    return { ns, onStopPropagation, onActionClick };
  },
  render() {
    return (
      <div class={[this.ns.b(), this.controller.model.cellSysCss?.cssName]}>
        {this.controller.model.deuiactionGroup?.uiactionGroupDetails
          ?.length && (
          <iBizActionToolbar
            zIndex={this.controller.grid.state.zIndex}
            onDblclick={this.onStopPropagation}
            onClick={this.onStopPropagation}
            action-details={
              this.controller.model.deuiactionGroup.uiactionGroupDetails
            }
            actions-state={
              this.row.uaColStates[this.controller.model.codeName!]
            }
            onActionClick={this.onActionClick}
          ></iBizActionToolbar>
        )}
      </div>
    );
  },
});
export default GridUAColumn;
