import { ILayoutPanel, IPanel, IUIActionGroupDetail } from '@ibiz/model-core';
import { computed, defineComponent, ref, VNode } from 'vue';
import {
  useNamespace,
  computedAsync,
  useCodeListListen,
} from '@ibiz-template/vue3-util';
import {
  ValueExUtil,
  CodeListItem,
  GridRowState,
  GridFieldColumnController,
} from '@ibiz-template/runtime';
import { isNotNil } from 'ramda';
import { showTitle } from '@ibiz-template/core';
import './grid-field-column.scss';

export const GridFieldColumn = defineComponent({
  name: 'IBizGridFieldColumn',
  props: {
    controller: {
      type: GridFieldColumnController,
      required: true,
    },
    row: {
      type: GridRowState,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('grid-field-column');

    const zIndex = props.controller.grid.state.zIndex;

    const columnType = props.controller.model.userParam?.columntype;

    /**
     * 单元格点击事件
     *
     * @author lxm
     * @date 2022-09-28 18:09:27
     * @param {MouseEvent} event
     */
    const onCellClick = (event: MouseEvent): void => {
      if (props.controller.hasAction) {
        event.stopPropagation();
        // 阻止触发行点击
        props.controller.triggerAction(props.row, event);
      }
    };

    /**
     * 文本点击事件
     *
     * @author zk
     * @date 2023-07-13 12:07:53
     * @param {MouseEvent} event
     */
    const onTextClick = (event: MouseEvent): void => {
      // 阻止触发行点击
      if (props.controller.isLinkColumn) {
        event.stopPropagation();
        props.controller.openLinkView(props.row, event);
      }
    };

    const CustomHtml = computedAsync(async () => {
      const html = await props.controller.getCustomHtml(props.row);
      return html;
    });

    const fieldValue = computed(
      () => props.row.data[props.controller.fieldName],
    );

    const formatValue = computed(() =>
      props.controller.formatValue(fieldValue.value),
    );

    const percent = computed(() => {
      const { grid, fieldName } = props.controller;
      if (!grid.percentkeys.includes(fieldName)) {
        return '';
      }
      const value = Number(fieldValue.value);
      if (!Number.isNaN(value)) {
        const { totalResult = {} } = grid.state;
        const total = totalResult[fieldName];
        if (total && !Number.isNaN(total)) {
          return ibiz.util.text.format(`${value / total}`, '0.##%');
        }
      }
      return '';
    });

    // 无值隐藏单位
    const hiddenEmpty = computed(() => {
      if (fieldValue.value) {
        if (props.controller.grid.emptyHiddenUnit) {
          if (formatValue.value) {
            return true;
          }
          return false;
        }
        return true;
      }
      return false;
    });

    /**
     * 代码表值
     * - 根据valueType计算当前列的代码表值，之后再传递给代码表翻译
     */
    const codeListValue = computed(() =>
      ValueExUtil.toText(props.controller.model, fieldValue.value),
    );

    // 代码表翻译文本
    const codeListText = ref('');
    const onInfoTextChange = (text: string) => {
      codeListText.value = text;
    };

    // tooltip相关
    const tooltip = computed(() => {
      // ellipsis模式且属性有值的时候显示tooltip
      if (
        props.controller.grid.overflowMode === 'ellipsis' &&
        isNotNil(fieldValue.value) &&
        fieldValue.value !== ''
      ) {
        return props.controller.codeList
          ? codeListText.value
          : formatValue.value + (props.controller.model.unitName || '');
      }
      return undefined;
    });

    const onActionClick = (
      detail: IUIActionGroupDetail,
      event: MouseEvent,
    ): Promise<void> => {
      return props.controller.onActionClick(detail, props.row, event);
    };

    const codeListItems = ref<readonly IData[]>([]);
    if (props.controller.codeList) {
      codeListItems.value = props.controller.codeListItems!;
    }

    const fn = (data: CodeListItem[] | undefined) => {
      if (data) codeListItems.value = data;
    };

    useCodeListListen(
      props.controller.model.appCodeListId,
      props.controller.context.srfappid,
      fn,
    );

    const findLayoutPanel = (): IPanel | undefined => {
      const { controlRenders = [] } = props.controller.model;
      return controlRenders.find(
        renderItem => renderItem.renderType === 'LAYOUTPANEL',
      )?.layoutPanel;
    };

    // 绘制项布局面板
    const renderPanelItemLayout = (
      item: IData,
      modelData: ILayoutPanel,
    ): VNode => {
      const { context, params } = props.controller;
      return (
        <iBizControlShell
          data={item}
          modelData={modelData}
          context={context}
          params={params}
        ></iBizControlShell>
      );
    };

    return {
      ns,
      onCellClick,
      onTextClick,
      onInfoTextChange,
      onActionClick,
      CustomHtml,
      fieldValue,
      formatValue,
      percent,
      codeListValue,
      tooltip,
      zIndex,
      columnType,
      codeListItems,
      hiddenEmpty,
      findLayoutPanel,
      renderPanelItemLayout,
    };
  },
  render() {
    const c = this.controller;

    const actionToolbar = c.model.deuiactionGroup ? (
      <iBizActionToolbar
        class={this.ns.e('toolbar')}
        action-details={c.model.deuiactionGroup.uiactionGroupDetails}
        actions-state={
          this.row.uiActionGroupStates[this.controller.model.codeName!]
        }
        groupLevelKeys={[50, 100]}
        actionCallBack={this.onActionClick}
        zIndex={this.zIndex}
      ></iBizActionToolbar>
    ) : null;

    let content = null;
    const panel = this.findLayoutPanel();
    if (c.isCustomCode) {
      content = (
        <span class={this.ns.e('script')} v-html={this.CustomHtml}></span>
      );
    } else if (panel) {
      content = (
        <iBizControlShell
          data={this.row.data}
          modelData={panel}
          context={c.context}
          params={c.params}
        ></iBizControlShell>
      );
    } else if (c.codeList) {
      content = (
        <iBizCodeList
          class={this.ns.e('text')}
          codeListItems={this.codeListItems}
          codeList={c.codeList}
          value={this.codeListValue}
          onClick={this.onTextClick}
          onInfoTextChange={this.onInfoTextChange}
          title={showTitle(this.tooltip)}
        ></iBizCodeList>
      );
    } else if (this.columnType === 'attachment') {
      content = (
        <iBizAttachmentColumn
          data={this.row.data}
          value={this.fieldValue}
          controller={this.controller}
        />
      );
    } else {
      content = (
        <span
          class={this.ns.e('text')}
          title={showTitle(this.tooltip)}
          onClick={this.onTextClick}
        >
          {this.formatValue}
          {this.hiddenEmpty && c.model.unitName}
          {this.percent && `(${this.percent})`}
        </span>
      );
    }

    return (
      <div
        class={[
          this.ns.b(),
          c.clickable(this.row) && this.ns.m('clickable'),
          this.ns.m(this.controller.grid.overflowMode),
          this.controller.model.cellSysCss?.cssName,
          this.ns.is('has-action', !!c.model.deuiactionGroup),
        ]}
        onClick={this.onCellClick}
      >
        {c.model.deuiactionGroup
          ? [
              <div class={this.ns.b('text-container')}>{content}</div>,
              <div class={this.ns.b('toolbar-container')}>{actionToolbar}</div>,
            ]
          : content}
      </div>
    );
  },
});
export default GridFieldColumn;
