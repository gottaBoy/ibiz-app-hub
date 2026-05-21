/* eslint-disable no-nested-ternary */
import {
  ref,
  Ref,
  PropType,
  computed,
  onMounted,
  defineComponent,
  onBeforeUnmount,
} from 'vue';
import { useUIStore, useNamespace } from '@ibiz-template/vue3-util';
import { IUIActionGroupDetail } from '@ibiz/model-core';
import {
  IKanbanSwimlane,
  IDragChangeInfo,
  KanbanController,
  IKanbanGroupState,
} from '@ibiz-template/runtime';
import draggable from 'vuedraggable';
import { NOOP, listenJSEvent, showTitle } from '@ibiz-template/core';
import './swimlane-kanban.scss';

/**
 * 泳道看板
 */
export const SwimlaneKanban = defineComponent({
  name: 'IBizSwimlaneKanban',
  components: {
    draggable,
  },
  props: {
    controller: {
      type: Object as PropType<KanbanController>,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('swimlane-kanban');
    const c = props.controller;
    const { zIndex } = useUIStore();
    const isFull: Ref<boolean> = ref(false);
    /**
     * popper样式
     */
    const popperStyle = { zIndex: zIndex.increment() };

    /**
     * 展开所有
     */
    const expandAll = ref<boolean>(true);

    /**
     * dropdownKey展开key
     */
    const dropdownKey = ref();

    const swimlaneKanban = ref();

    let cleanup = NOOP;

    onMounted(() => {
      cleanup = listenJSEvent(window, 'resize', () => {
        isFull.value = c.getFullscreen();
      });
    });

    onBeforeUnmount(() => {
      if (cleanup !== NOOP) cleanup();
    });

    /**
     * 是否禁止拖拽
     */
    const disabled = computed(() => {
      return (
        !c.state.draggable ||
        c.draggableMode === 0 ||
        c.state.updating ||
        c.state.readonly
      );
    });

    /**
     * 宽度
     */
    const width = computed(() => {
      const { groupWidth, cardWidth } = c.model;
      return groupWidth || cardWidth || 320;
    });

    /**
     * 批操作分组标记
     */
    const batchKey = computed(() => {
      return c.state.batching ? c.state.selectGroupKey : '';
    });

    /**
     * 快速工具栏
     */
    const quickToolbarModel = c.model.controls?.find(item => {
      return (
        item.name === `${c.model.name!}_quicktoolbar` ||
        item.name === `${c.model.name!}_groupquicktoolbar`
      );
    });

    /**
     * 批操作工具栏
     */
    const batchToolbarModel = c.model.controls?.find(item => {
      return item.name === `${c.model.name!}_batchtoolbar`;
    });

    /**
     * 缓存
     */
    let cacheInfo: Partial<IDragChangeInfo> | null = null;

    /**
     * @description 全屏
     */
    const onFullScreen = () => {
      const container = swimlaneKanban.value;
      isFull.value = c.onFullScreen(container);
    };

    /**
     * @description 拖拽改变
     * @param {IData} evt
     * @param {string | number} groupKey
     * @param {string} laneKey
     */
    const onDraggableChange = (
      evt: IData,
      groupKey: string | number,
      laneKey?: string,
    ) => {
      if (evt.moved)
        c.onDragChange({
          from: groupKey,
          to: groupKey,
          fromIndex: evt.moved.oldIndex,
          toIndex: evt.moved.newIndex,
          fromLane: laneKey,
          toLane: laneKey,
        });
      // 分组变更时会先触发added后触发removed，因此需提前缓存added的参数
      if (evt.added)
        cacheInfo = {
          to: groupKey,
          toLane: laneKey,
          toIndex: evt.added.newIndex,
        };
      if (evt.removed) {
        if (cacheInfo) {
          Object.assign(cacheInfo, {
            from: groupKey,
            fromLane: laneKey,
            fromIndex: evt.removed.oldIndex,
          });
          c.onDragChange(cacheInfo as IDragChangeInfo);
        }
        cacheInfo = null;
      }
    };

    /**
     * @description 处理选中所有
     * @param {IKanbanGroupState} group
     * @param {boolean} invert
     */
    const handleCheckAllGroup = (group: IKanbanGroupState, invert: boolean) => {
      const selectedData = group.selectedData || [];
      if (invert) {
        selectedData.forEach((item: IData) => {
          c.onRowClick(item);
        });
      } else {
        const items: IData[] = group.children.filter(
          (item: IData) => !selectedData.includes(item),
        );
        items.forEach(item => {
          c.onRowClick(item);
        });
      }
    };

    /**
     * @description 是否选中
     * @param {IData} item
     * @returns {*}  {boolean}
     */
    const isSelected = (item: IData): boolean => {
      return (
        c.state.selectedData.findIndex(data => {
          return data.srfkey === item.srfkey;
        }) !== -1
      );
    };

    /**
     * @description 获取拖拽分组标识
     * @param {(string| number)} groupKey
     * @param {string} [laneKey]
     * @returns {*}  {string}
     */
    const getGroupKey = (
      groupKey: string | number,
      laneKey?: string,
    ): string => {
      return c.draggableMode === 1
        ? groupKey.toString()
        : c.draggableMode === 2
          ? laneKey || 'custom'
          : c.model.id!;
    };

    /**
     * @description 处理展开所有
     */
    const handleExpandAll = (): void => {
      expandAll.value = !expandAll.value;
      c.state.swimlanes.forEach(lane => {
        lane.isExpand = expandAll.value;
      });
    };

    /**
     * @description 显示改变
     * @param {boolean} val
     * @param {string | number} key
     */
    const onVisibleChange = (val: boolean, key: string | number): void => {
      dropdownKey.value = val ? key : undefined;
    };

    /**
     * @description 绘制头部工具栏
     * @param {IKanbanGroupState} group
     * @returns {*}
     */
    const renderHeaderToolbar = (group: IKanbanGroupState) => {
      const showActionBar =
        (c.model.groupUIActionGroup && group.groupActionGroupState) ||
        batchToolbarModel;
      if (group.isExpand === false) return null;
      if (batchKey.value === group.key)
        return (
          <div class={[ns.em('cell', 'right'), ns.em('header', 'actions')]}>
            <el-button text onClick={() => c.closeBatch()}>
              {ibiz.i18n.t('app.complete')}
            </el-button>
          </div>
        );
      return (
        <div class={[ns.em('cell', 'right'), ns.em('header', 'actions')]}>
          <el-button
            text
            circle
            class={ns.em('header', 'action')}
            onClick={() => {
              group.isExpand = false;
            }}
          >
            <ion-icon
              name='chevron-back-outline'
              title={ibiz.i18n.t('control.kanban.collapsed')}
            ></ion-icon>
          </el-button>
          {showActionBar && (
            <el-dropdown
              trigger='click'
              teleported={false}
              style={popperStyle}
              class={[
                ns.em('header', 'action'),
                ns.is('visible', group.key === dropdownKey.value),
              ]}
              popper-class={ns.em('header', 'popper')}
              onVisibleChange={(val: boolean) =>
                onVisibleChange(val, group.key)
              }
            >
              {{
                default: () => (
                  <el-button text circle>
                    <ion-icon
                      title={showTitle(ibiz.i18n.t('app.more'))}
                      name='ellipsis-horizontal'
                    ></ion-icon>
                  </el-button>
                ),
                dropdown: () => (
                  <div class={ns.em('header', 'toolbar')}>
                    {c.model.groupUIActionGroup && (
                      <iBizActionToolbar
                        direction='vertical'
                        placement='right-start'
                        teleported={false}
                        zIndex={c.state.zIndex}
                        actionDetails={
                          c.model.groupUIActionGroup.uiactionGroupDetails
                        }
                        actionsState={group.groupActionGroupState}
                        onActionClick={(
                          detail: IUIActionGroupDetail,
                          event: MouseEvent,
                        ) => {
                          c.onGroupToolbarClick(detail, event, group);
                        }}
                      ></iBizActionToolbar>
                    )}
                    {batchToolbarModel && (
                      <el-button
                        size='small'
                        onClick={() => {
                          c.openBatch(group.key);
                        }}
                      >
                        <ion-icon name='checkmark-sharp'></ion-icon>
                        {ibiz.i18n.t('control.kanban.natchOperation')}
                      </el-button>
                    )}
                  </div>
                ),
              }}
            </el-dropdown>
          )}
        </div>
      );
    };

    /**
     * @description 绘制头部单元格
     * @param {IKanbanGroupState} group
     */
    const renderHeaderCell = (group: IKanbanGroupState) => {
      return (
        <div
          class={[
            ns.e('cell'),
            ns.em('header', 'cell'),
            ns.is('collapsed', group.isExpand === false),
          ]}
        >
          <div class={ns.em('cell', 'content')}>
            <div class={ns.em('cell', 'left')}>
              <div class={ns.em('cell', 'caption')}>
                {group.caption}
                <span class={ns.em('cell', 'separator')}>·</span>
                {group.children.length}
              </div>
              {group.isExpand === false && (
                <el-button
                  text
                  circle
                  onClick={() => {
                    group.isExpand = true;
                  }}
                >
                  <ion-icon
                    title={ibiz.i18n.t('control.kanban.expand')}
                    name='chevron-forward-outline'
                  ></ion-icon>
                </el-button>
              )}
            </div>
            {renderHeaderToolbar(group)}
          </div>
        </div>
      );
    };

    /**
     * @description 绘制头部
     * @returns {*}
     */
    const renderHeader = () => {
      return (
        <div class={ns.e('header')}>
          <div class={ns.em('header', 'row')}>
            <div class={[ns.e('cell'), ns.em('header', 'cell')]}>
              <div class={ns.em('cell', 'content')}>
                <div class={ns.em('cell', 'left')}>
                  <ion-icon
                    onClick={handleExpandAll}
                    class={ns.em('cell', 'expand-icon')}
                    title={
                      expandAll.value
                        ? ibiz.i18n.t('control.kanban.allCollapsed')
                        : ibiz.i18n.t('control.kanban.allExpand')
                    }
                    name={
                      expandAll.value
                        ? 'chevron-collapse-outline'
                        : 'chevron-expand-outline'
                    }
                  ></ion-icon>
                  <div class={ns.em('cell', 'caption')}>
                    {ibiz.i18n.t('control.kanban.lane')}
                  </div>
                </div>
                <div class={ns.em('cell', 'right')}>
                  {c.enableGroupHidden && (
                    <iBizKanbanSetting
                      buttonStyle={{ circle: true, type: 'text' }}
                      controller={props.controller}
                    />
                  )}
                  {c.enableFullScreen && (
                    <el-button
                      type='text'
                      circle={true}
                      onClick={onFullScreen}
                      title={
                        isFull.value
                          ? ibiz.i18n.t('app.cancelFullscreen')
                          : ibiz.i18n.t('app.fullscreen')
                      }
                    >
                      <ion-icon
                        name={
                          isFull.value ? 'contract-outline' : 'expand-outline'
                        }
                      ></ion-icon>
                    </el-button>
                  )}
                </div>
              </div>
            </div>
            {c.state.groups.map(group => {
              if (group.hidden) return undefined;
              return renderHeaderCell(group);
            })}
          </div>
        </div>
      );
    };

    /**
     * @description 绘制项布局面板
     * @param {IKanbanSwimlane} lane
     * @param {IData} item
     * @returns {*}
     */
    const renderPanelItemLayout = (lane: IKanbanSwimlane, item: IData) => {
      const { context, params } = c;
      const { itemLayoutPanel } = c.model;
      if (!itemLayoutPanel) return;
      return (
        <iBizControlShell
          data={item}
          params={params}
          context={context}
          class={ns.e('panel-item')}
          modelData={itemLayoutPanel}
        />
      );
    };

    /**
     * @description 绘制默认项
     * @param {IKanbanSwimlane} lane
     * @param {IData} item
     * @param {IKanbanGroupState} group
     */
    const renderDefaultItem = (
      lane: IKanbanSwimlane,
      item: IData,
      group: IKanbanGroupState,
    ) => {
      const actionModel = c.getOptItemModel();
      return (
        <div class={ns.e('default-item')}>
          <div class={ns.em('default-item', 'header')}>{item.srfmajortext}</div>
          <div class={ns.em('default-item', 'content')}>{item.content}</div>
          {actionModel.length ? (
            <div class={ns.em('default-item', 'footer')}>
              <iBizActionToolbar
                zIndex={c.state.zIndex}
                class={ns.em('default-item', 'actions')}
                action-details={actionModel}
                actions-state={c.state.uaState[item.srfkey]}
                onActionClick={(
                  detail: IUIActionGroupDetail,
                  event: MouseEvent,
                ): Promise<void> =>
                  c.onGroupActionClick(detail, item, event, group, lane)
                }
              ></iBizActionToolbar>
            </div>
          ) : null}
        </div>
      );
    };

    /**
     * @description 绘制内容区单元格工具栏
     * @param {IKanbanSwimlane} lane
     * @param {IKanbanGroupState} group
     * @returns {*}
     */
    const renderBodyCellToolber = (
      lane: IKanbanSwimlane,
      group: IKanbanGroupState,
    ) => {
      const { swimlaneAppDEFieldId } = c.model;
      const items = group.children.filter(
        item => item[swimlaneAppDEFieldId!] === lane.key,
      );
      return (
        <div class={ns.em('cell', 'toolbar')}>
          {c.enableNew && !c.state.readonly && (
            <el-button
              text
              class={ns.em('cell', 'action')}
              onClick={(event: MouseEvent) => {
                c.onClickNew(event, group.key, lane);
              }}
            >
              <ion-icon name='add-outline'></ion-icon>
              {ibiz.i18n.t('app.newlyBuild')}
            </el-button>
          )}
          {quickToolbarModel && items.length === 0 && (
            <iBizControlShell
              class={ns.e('quicktoolbar')}
              modelData={{
                ...quickToolbarModel,
                name: `${quickToolbarModel.name}_${group.key}`,
              }}
              context={c.context}
              params={c.params}
            ></iBizControlShell>
          )}
        </div>
      );
    };

    /**
     * @description 绘制批操作工具栏
     * @param {IKanbanGroupState} group
     * @returns {*}
     */
    const renderBatchToolBar = (group: IKanbanGroupState) => {
      if (!batchToolbarModel || batchKey.value !== group.key) return;
      const selectedData = group.selectedData || [];
      const checkAll = selectedData.length === group.children.length;
      const isIndeterminate =
        selectedData.length > 0 && selectedData.length < group.children.length;
      return (
        <div class={ns.e('batch')}>
          <iBizControlShell
            modelData={{
              ...batchToolbarModel,
              name: `${batchToolbarModel.name}_${group.key}`,
            }}
            class={ns.em('batch', 'toolbar')}
            context={c.context}
            params={c.params}
          ></iBizControlShell>
          <div class={ns.em('batch', 'check')}>
            <el-checkbox
              model-value={checkAll}
              indeterminate={isIndeterminate}
              onChange={() => handleCheckAllGroup(group, checkAll)}
            >
              {ibiz.i18n.t('control.kanban.selectAll')}
            </el-checkbox>
            <span
              class={ns.em('batch', 'info')}
              v-html={ibiz.i18n.t('control.kanban.selectedDataCount', {
                length: selectedData.length,
              })}
            ></span>
          </div>
        </div>
      );
    };

    /**
     * @description 绘制内容区单元格
     * @param {number} index
     * @param {IKanbanSwimlane} lane
     * @param {IKanbanGroupState} group
     * @returns {*}
     */
    const renderBodyCell = (
      index: number,
      lane: IKanbanSwimlane,
      group: IKanbanGroupState,
    ) => {
      const { swimlaneAppDEFieldId } = c.model;
      return (
        <div
          class={[
            ns.e('cell'),
            ns.em('body', 'cell'),
            ns.is('collapsed', group.isExpand === false),
          ]}
        >
          {index === 0 && renderBatchToolBar(group)}
          {group.isExpand !== false ? (
            <div class={ns.em('cell', 'content')}>
              {lane.isExpand ? (
                [
                  <draggable
                    itemKey='srfkey'
                    disabled={disabled.value}
                    modelValue={group.children}
                    handle={`.${ns.e('drag-icon')}`}
                    class={ns.em('cell', 'draggable')}
                    group={getGroupKey(group.key, lane.key)}
                    onChange={(evt: IData) =>
                      onDraggableChange(evt, group.key, lane.key)
                    }
                  >
                    {{
                      item: ({ element }: { element: IData }) => {
                        if (
                          !swimlaneAppDEFieldId ||
                          element[swimlaneAppDEFieldId] !== lane.key
                        )
                          return null;
                        return (
                          <el-card
                            shadow='hover'
                            class={[
                              ns.e('card'),
                              ns.is('selected', isSelected(element)),
                              ns.is(
                                'disabled',
                                c.state.draggable && c.state.updating,
                              ),
                            ]}
                            onClick={() => c.onRowClick(element)}
                            onDblclick={() => c.onDbRowClick(element)}
                          >
                            <div class={ns.em('card', 'content')}>
                              {c.state.draggable &&
                                !c.state.readonly &&
                                c.draggableMode !== 0 && (
                                  <svg
                                    viewBox='0 0 16 16'
                                    xmlns='http://www.w3.org/2000/svg'
                                    height='1em'
                                    width='1em'
                                    class={ns.e('drag-icon')}
                                    preserveAspectRatio='xMidYMid meet'
                                    focusable='false'
                                  >
                                    <g stroke-width='1' fill-rule='evenodd'>
                                      <g
                                        transform='translate(5 1)'
                                        fill-rule='nonzero'
                                      >
                                        <path d='M1 2a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2zM1 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm-4 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm-4 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2z'></path>
                                      </g>
                                    </g>
                                  </svg>
                                )}
                              {c.model.itemLayoutPanel
                                ? renderPanelItemLayout(lane, element)
                                : renderDefaultItem(lane, element, group)}
                            </div>
                          </el-card>
                        );
                      },
                    }}
                  </draggable>,
                  renderBodyCellToolber(lane, group),
                ]
              ) : (
                <div class={ns.em('cell', 'left')}>
                  <span class={ns.em('cell', 'description')}>{`${
                    group.children.filter(
                      child =>
                        swimlaneAppDEFieldId &&
                        child[swimlaneAppDEFieldId] === lane.key,
                    ).length
                  } 个${group.caption}`}</span>
                </div>
              )}
            </div>
          ) : null}
        </div>
      );
    };

    /**
     * @description 绘制内容
     * @returns {*}
     */
    const renderBody = () => {
      return (
        <div class={ns.e('body')}>
          {c.state.swimlanes.map((lane, index) => {
            return (
              <div
                class={[ns.em('body', 'row'), ns.is('expand', lane.isExpand)]}
              >
                <div class={[ns.e('cell'), ns.em('body', 'cell')]}>
                  <div class={ns.em('cell', 'content')}>
                    <div class={ns.em('cell', 'left')}>
                      <ion-icon
                        class={ns.em('cell', 'expand-icon')}
                        name={
                          lane.isExpand
                            ? 'chevron-down-outline'
                            : 'chevron-forward-outline'
                        }
                        onClick={() => {
                          lane.isExpand = !lane.isExpand;
                        }}
                      ></ion-icon>
                      <div class={ns.em('cell', 'caption')}>{lane.caption}</div>
                    </div>
                    <div class={ns.em('cell', 'right')}>
                      <span
                        class={ns.em('cell', 'description')}
                      >{`${lane.count} 个${c.laneDescription}`}</span>
                    </div>
                  </div>
                </div>
                {c.state.groups.map(group => {
                  if (group.hidden) return undefined;
                  return renderBodyCell(index, lane, group);
                })}
              </div>
            );
          })}
        </div>
      );
    };
    return { ns, swimlaneKanban, width, renderHeader, renderBody };
  },
  render() {
    return (
      <div
        ref='swimlaneKanban'
        class={[
          this.ns.b(),
          this.ns.e(this.controller.model.groupStyle?.toLowerCase()),
        ]}
        style={{ '--ibiz-swimlane-kanban-width': `${this.width}px` }}
      >
        <div class={this.ns.e('table')}>
          {this.renderHeader()}
          {this.renderBody()}
        </div>
      </div>
    );
  },
});
