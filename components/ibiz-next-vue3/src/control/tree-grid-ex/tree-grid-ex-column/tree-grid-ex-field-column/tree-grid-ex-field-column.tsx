import { computed, defineComponent, ref } from 'vue';
import { IUIActionGroupDetail } from '@ibiz/model-core';
import { useNamespace } from '@ibiz-template/vue3-util';
import {
  TreeGridExFieldColumnController,
  TreeGridExRowState,
} from '@ibiz-template/runtime';
import { isNotNil } from 'ramda';
import './tree-grid-ex-field-column.scss';
import { showTitle } from '@ibiz-template/core';

export const TreeGridExFieldColumn = defineComponent({
  name: 'IBizTreeGridExFieldColumn',
  props: {
    controller: {
      type: TreeGridExFieldColumnController,
      required: true,
    },
    row: {
      type: TreeGridExRowState,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('tree-grid-ex-field-column');

    const zIndex = props.controller.treeGrid.state.zIndex;

    /** 行数据对应属性列的值 */
    const fieldValue = computed(() => {
      // 非实体节点行的第一列显示文本值
      if (
        props.row.data._nodeType !== 'DE' &&
        props.controller.isFirstShowColumn
      ) {
        return props.row.data._text;
      }
      return (props.row.data as IData)[props.controller.name];
    });

    const nodeColumn = computed(() => {
      return props.controller.nodeColumnControllerMap.get(
        props.row.data._nodeId,
      );
    });

    // 代码表翻译文本
    const codeListText = ref('');
    const onInfoTextChange = (text: string) => {
      codeListText.value = text;
    };

    const showText = computed(() => {
      const nodeColumnC = nodeColumn.value;
      if (nodeColumnC) {
        // 编辑器的文本值
        if (nodeColumnC.nodeEditItem) {
          return undefined;
        }

        // 代码表的文本值
        if (nodeColumnC.codeList) {
          return codeListText.value;
        }

        let text = nodeColumnC.formatValue(fieldValue.value);
        if (props.controller.treeGrid.emptyHiddenUnit) {
          if (text) {
            text +=
              nodeColumnC.unitName || nodeColumnC.nodeColumn?.unitName || '';
          }
        } else {
          text +=
            nodeColumnC.unitName || nodeColumnC.nodeColumn?.unitName || '';
        }
        // 格式化的值
        return text;
      }
      return fieldValue.value;
    });

    // tooltip相关
    const tooltip = computed(() => {
      // ellipsis模式且属性有值的时候显示tooltip
      if (
        props.controller.treeGrid.overflowMode === 'ellipsis' &&
        isNotNil(fieldValue.value) &&
        fieldValue.value !== ''
      ) {
        return showText.value;
      }
      return undefined;
    });

    const clickable = computed(() => {
      return (
        fieldValue.value &&
        nodeColumn.value &&
        (nodeColumn.value.isLinkColumn || nodeColumn.value.hasClickAction)
      );
    });

    /**
     * 列文本点击
     * @author lxm
     * @date 2024-01-09 04:11:39
     * @param {MouseEvent} event
     */
    const onTextClick = (event: MouseEvent): void => {
      nodeColumn.value?.onTextClick(props.row, event);
    };

    /**
     * 列界面行为组点击
     * @author lxm
     * @date 2024-01-11 02:32:48
     * @param {IUIActionGroupDetail} detail
     * @param {MouseEvent} event
     * @return {*}  {Promise<void>}
     */
    const onActionClick = async (
      detail: IUIActionGroupDetail,
      event: MouseEvent,
    ): Promise<void> => {
      await nodeColumn.value?.onActionClick(detail, props.row, event);
    };

    return {
      ns,
      zIndex,
      tooltip,
      showText,
      clickable,
      nodeColumn,
      fieldValue,
      onTextClick,
      onActionClick,
      onInfoTextChange,
    };
  },
  render() {
    let content = null;

    if (this.nodeColumn?.nodeEditItem) {
      content = (
        <iBizTreeGridExEditColumn
          controller={this.nodeColumn}
          row={this.row}
        ></iBizTreeGridExEditColumn>
      );
    } else if (this.nodeColumn?.codeList) {
      content = (
        <iBizCodeList
          class={this.ns.e('text')}
          codeListItems={this.nodeColumn.codeListItems}
          codeList={this.nodeColumn.codeList}
          value={this.fieldValue}
          onClick={this.onTextClick}
          onInfoTextChange={this.onInfoTextChange}
          title={showTitle(this.tooltip)}
        ></iBizCodeList>
      );
    } else {
      content = (
        <span
          class={this.ns.e('text')}
          title={showTitle(this.tooltip)}
          onClick={this.onTextClick}
        >
          {this.showText}
        </span>
      );
    }

    let actions;
    if (this.$slots.actions) {
      actions = this.$slots.actions();
    } else if (this.row.columnActionsStates[this.controller.name]) {
      actions = (
        <iBizActionToolbar
          zIndex={this.zIndex}
          class={this.ns.e('toolbar')}
          action-details={
            this.nodeColumn?.nodeColumn!.deuiactionGroup!.uiactionGroupDetails
          }
          actions-state={this.row.columnActionsStates[this.controller.name]}
          groupLevelKeys={[50, 100]}
          onActionClick={this.onActionClick}
        ></iBizActionToolbar>
      );
    }

    return (
      <div
        class={[
          this.ns.b(),
          this.clickable && this.ns.m('clickable'),
          this.ns.m(this.controller.treeGrid.overflowMode),
          this.controller.model.cellSysCss?.cssName,
          this.ns.is('has-action', !!actions),
        ]}
      >
        <div class={this.ns.b('text-container')}>{content}</div>
        <div class={this.ns.b('toolbar-container')}>{actions}</div>
      </div>
    );
  },
});
export default TreeGridExFieldColumn;
