import { IUIActionGroupDetail } from '@ibiz/model-core';
import { defineComponent } from 'vue';
import { useNamespace } from '@ibiz-template/vue3-util';
import './tree-grid-ex-ua-column.scss';
import {
  TreeGridExUAColumnController,
  TreeGridExRowState,
} from '@ibiz-template/runtime';

export const TreeGridExUAColumn = defineComponent({
  name: 'IBizTreeGridExUAColumn',
  props: {
    controller: {
      type: TreeGridExUAColumnController,
      required: true,
    },
    row: {
      type: TreeGridExRowState,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('tree-grid-ex-ua-column');
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
    const uiactionGroup = this.controller.getUIActionGroup(this.row);

    return (
      <div
        class={[this.ns.b(), this.controller.model.cellSysCss?.cssName]}
        onDblclick={this.onStopPropagation}
        onClick={this.onStopPropagation}
      >
        {uiactionGroup?.uiactionGroupDetails?.length && (
          <iBizActionToolbar
            zIndex={this.controller.treeGrid.state.zIndex}
            action-details={uiactionGroup.uiactionGroupDetails}
            actions-state={
              this.row.columnActionsStates[this.controller.model.codeName!]
            }
            onActionClick={this.onActionClick}
          ></iBizActionToolbar>
        )}
      </div>
    );
  },
});
export default TreeGridExUAColumn;
