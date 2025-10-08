import {
  useNamespace,
  IBizCustomRender,
  useControlController,
  hasEmptyPanelRenderer,
  useControlPopoverzIndex,
} from '@ibiz-template/vue3-util';
import {
  h,
  ref,
  VNode,
  computed,
  PropType,
  renderSlot,
  watchEffect,
  defineComponent,
  resolveComponent,
  VNodeArrayChildren,
} from 'vue';
import { IDETreeColumn, IDETreeGridEx } from '@ibiz/model-core';
import {
  IControlProvider,
  ITreeNodeData,
  TreeGridExController,
} from '@ibiz-template/runtime';
import { RuntimeError } from '@ibiz-template/core';
import { createUUID } from 'qx-util';
import { useRowEditPopover } from './use-row-edit-popover';
import './tree-grid-ex.scss';

export const TreeGridExControl = defineComponent({
  name: 'IBizTreeGridExControl',
  props: {
    /**
     * @description 树表格增强模型数据
     */
    modelData: { type: Object as PropType<IDETreeGridEx>, required: true },
    /**
     * @description 应用上下文对象
     */
    context: { type: Object as PropType<IContext>, required: true },
    /**
     * @description 视图参数对象
     * @default {}
     */
    params: { type: Object as PropType<IParams>, default: () => ({}) },
    /**
     * @description 部件适配器
     */
    provider: { type: Object as PropType<IControlProvider> },
  },
  setup() {
    const c = useControlController<TreeGridExController>(
      (...args) => new TreeGridExController(...args),
    );

    useControlPopoverzIndex(c);

    const ns = useNamespace(`control-${c.model.controlType!.toLowerCase()}`);

    const renderNoData = (): VNode | false => {
      // 未加载不显示无数据
      const { isLoaded } = c.state;
      const noDataSlots: IParams = {};
      if (hasEmptyPanelRenderer(c)) {
        Object.assign(noDataSlots, {
          customRender: () => (
            <IBizCustomRender controller={c}></IBizCustomRender>
          ),
        });
      }
      return (
        isLoaded && (
          <iBizNoData
            text={c.model.emptyText}
            emptyTextLanguageRes={c.model.emptyTextLanguageRes}
          >
            {noDataSlots}
          </iBizNoData>
        )
      );
    };

    // 实际绘制的表格列
    const renderColumns = computed(() => {
      const columns: IDETreeColumn[] = [];
      c.state.columnStates.forEach(item => {
        if (item.hidden) {
          return;
        }
        const columnModel =
          c.fieldColumns[item.key]?.model || c.uaColumns[item.key]?.model;
        if (columnModel) {
          columns.push(columnModel);
        }
      });
      return columns;
    });

    /**
     * 转换成el的节点形数据（隔离原始数据，避免响应式影响）
     * @author lxm
     * @date 2023-12-20 06:33:10
     * @param {ITreeNodeData[]} nodes
     * @return {*}  {IData[]}
     */
    const toElNodes = (nodes: ITreeNodeData[], noChild = false): IData[] => {
      return nodes.map(node => {
        const temp: IData = {
          id: node._id,
          _uuid: node._uuid,
          hasChildren: !node._leaf,
        };
        if (!noChild && !node._leaf && node._children !== undefined) {
          temp.children = toElNodes(node._children);
        }
        return temp;
      });
    };

    /** 树展示的根数据 */
    const tableRefreshKey = ref(createUUID());
    const treeRootData = computed(() => {
      if (!c.state.isLoaded) {
        return [];
      }
      return c.model.rootVisible
        ? c.state.rootNodes
        : c.state.rootNodes.reduce<ITreeNodeData[]>((result, nodeData) => {
            if (nodeData._children) {
              return result.concat(nodeData._children as ITreeNodeData[]);
            }
            return result;
          }, []);
    });

    /** el组件要的数据 */
    const elTableData = computed(() => {
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      tableRefreshKey.value = createUUID();
      if (treeRootData.value.length === 0) {
        return [];
      }
      // 只给第一层数据，子数据由loadData加载回填
      return toElNodes(treeRootData.value as ITreeNodeData[], true);
    });

    // el-treeUI更新子节点
    c.evt.on('onAfterRefreshParent', () => {
      tableRefreshKey.value = createUUID();
    });

    /**
     * 触发节点加载数据
     * @author lxm
     * @date 2023-05-29 09:16:07
     * @param {IData} item
     * @param {(nodes: IData[]) => void} callback
     */
    const loadData = async (
      item: IData,
      treeNode: unknown,
      callback: (nodes: IData[]) => void,
    ) => {
      let nodes: ITreeNodeData[];
      const nodeData = c.getNodeData(item.id)!;
      if (nodeData._children) {
        nodes = nodeData._children;
      } else {
        nodes = await c.loadNodes(nodeData);
      }
      callback(toElNodes(nodes));
    };

    const tableRef = ref<IData>();
    const { renderPopover } = useRowEditPopover(tableRef, c);

    const onRowClick = async (
      data: IData,
      _column: IData,
      event: MouseEvent,
    ): Promise<void> => {
      const nodeData = c.getNodeData(data.id)!;
      // 单行编辑模式下，行点击会触发
      if (c.editShowMode === 'row' && c.model.enableEdit) {
        const row = c.state.rows[nodeData._uuid];
        if (row && row.showRowEdit !== true) {
          // 开启行编辑
          await c.switchRowEdit(row, true);
        } else {
          throw new RuntimeError(
            ibiz.i18n.t('control.treeGridEx.noFoundMessage', { id: data.id }),
          );
        }
      } else {
        c.onTreeNodeClick(nodeData, event);
      }
    };

    function handleRowClassName({ row }: { row: IData }): string {
      const nodeData = c.getNodeData(row.id);
      if (!nodeData) {
        return '';
      }

      let activeClassName = '';
      if (c.state.selectedData.length > 0) {
        c.state.selectedData.forEach((data: IData) => {
          if (data === nodeData) {
            // current-row用于多选激活样式与单选保持一致，有背景色
            activeClassName = 'current-row';
          }
        });
      }
      const rowState = c.getRowState(nodeData._uuid);
      if (rowState?.showRowEdit) {
        activeClassName += ' editing-row';
      }
      activeClassName += ` id-${nodeData._uuid}`;
      return activeClassName;
    }

    watchEffect(() => {
      if (tableRef.value) {
        const allNodes = tableRef.value.store.states.treeData.value as IData;
        const expandedKeys = c.state.expandedKeys;
        Object.keys(allNodes).forEach(key => {
          if (expandedKeys.includes(key) !== allNodes[key].expanded) {
            const row = toElNodes([c.getNodeData(key)!])[0];
            tableRef.value!.store.loadOrToggle(row);
          }
        });
      }
    });

    const onExpandChange = (row: IData, expanded: boolean) => {
      const nodeData = c.getNodeData(row._uuid);
      if (!nodeData) {
        throw new RuntimeError(
          ibiz.i18n.t('control.common.noFoundNode', { id: row._uuid }),
        );
      }
      c.onExpandChange(nodeData, expanded);
    };

    return {
      c,
      ns,
      tableRef,
      elTableData,
      renderColumns,
      tableRefreshKey,
      renderNoData,
      loadData,
      onRowClick,
      onExpandChange,
      renderPopover,
      handleRowClassName,
    };
  },
  render() {
    const renderColumn = (
      model: IDETreeColumn,
      index: number,
    ): VNode | null => {
      if (this.$slots[model.id!]) {
        return renderSlot(this.$slots, model.id!, {
          model,
          data: this.c.state.items,
        });
      }
      const { codeName: columnName, width } = model;
      const columnC = this.c.columns[columnName!];
      const columnState = this.c.state.columnStates.find(
        item => item.key === columnName,
      )!;

      // 如果没有配置自适应列，则最后一列变为自适应列
      const widthFlexGrow =
        columnC.isAdaptiveColumn ||
        (!this.c.hasAdaptiveColumn && index === this.renderColumns.length - 1);

      const widthName = widthFlexGrow ? 'min-width' : 'width';
      return (
        <el-table-column
          label={model.caption}
          prop={columnName}
          {...{ [widthName]: width }}
          fixed={columnState.fixed}
          sortable={model.enableSort ? 'custom' : false}
          label-class-name={columnC.model.headerSysCss?.cssName}
          align={model.align?.toLowerCase() || 'center'}
        >
          {{
            header: ({ column }: IData) => {
              return (
                <iBizGridColumnHeader
                  key={column.property}
                  controller={columnC}
                />
              );
            },
            default: ({ row }: IData): VNode | null => {
              const rowState = this.c.getRowState(row.id);
              if (rowState) {
                const comp = resolveComponent(
                  this.c.providers[columnName!].component,
                );
                return h(comp, {
                  controller: columnC,
                  row: rowState,
                  key: rowState.data._uuid + columnName,
                });
              }
              return null;
            },
          }}
        </el-table-column>
      );
    };
    return (
      <iBizControlNavigation controller={this.c}>
        <iBizControlBase controller={this.c} class={[this.ns.b()]}>
          {this.c.state.isLoaded && (
            <el-table
              ref={'tableRef'}
              key={this.tableRefreshKey}
              class={this.ns.e('table')}
              border
              row-key='id'
              data={this.elTableData}
              tree-props={{ children: 'children', hasChildren: 'hasChildren' }}
              lazy
              onRowClick={this.onRowClick}
              onExpandChange={this.onExpandChange}
              row-class-name={this.handleRowClassName}
              load={this.loadData}
            >
              {{
                empty: this.renderNoData,
                default: (): VNodeArrayChildren => {
                  return [
                    this.renderColumns.map((model, index) => {
                      return renderColumn(model, index);
                    }),
                  ];
                },
                append: () => {
                  return this.renderPopover();
                },
              }}
            </el-table>
          )}
        </iBizControlBase>
      </iBizControlNavigation>
    );
  },
});
