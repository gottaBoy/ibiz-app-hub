/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  useNamespace,
  IBizCustomRender,
  useControlController,
  hasEmptyPanelRenderer,
  useControlPopoverzIndex,
} from '@ibiz-template/vue3-util';
import {
  ref,
  Ref,
  VNode,
  watch,
  PropType,
  computed,
  onMounted,
  StyleValue,
  defineComponent,
  onBeforeUnmount,
} from 'vue';
import draggable from 'vuedraggable';
import {
  IDEKanban,
  ILayoutPanel,
  IUIActionGroupDetail,
} from '@ibiz/model-core';
import {
  ControlVO,
  IDragChangeInfo,
  IControlProvider,
  KanbanController,
  IKanbanGroupState,
} from '@ibiz-template/runtime';
import { NOOP, listenJSEvent } from '@ibiz-template/core';
import { SwimlaneKanban } from './swimlane-kanban/swimlane-kanban';
import { usePagination } from '../../util';
import './kanban.scss';

export const KanbanControl = defineComponent({
  name: 'IBizKanbanControl',
  components: {
    draggable,
  },
  props: {
    /**
     * @description 数据看板模型数据
     */
    modelData: { type: Object as PropType<IDEKanban>, required: true },
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
    /**
     * @description 部件行数据默认激活模式，值为0:不激活，值为1：单击激活，值为2：双击激活
     */
    mdctrlActiveMode: { type: Number, default: undefined },
    /**
     * @description 是否单选
     */
    singleSelect: { type: Boolean, default: undefined },
    /**
     * @description 是否是简单模式，即直接传入数据，不加载数据
     */
    isSimple: { type: Boolean, required: false },
    /**
     * @description 简单模式下传入的数据
     */
    data: { type: Array<IData>, required: false },
    /**
     * @description 是否默认加载数据
     * @default true
     */
    loadDefault: { type: Boolean, default: true },
  },
  setup(props) {
    const c: KanbanController = useControlController(
      (...args) => new KanbanController(...args),
    );
    useControlPopoverzIndex(c);
    const ns = useNamespace(`control-${c.model.controlType!.toLowerCase()}`);
    const kanban = ref();
    const isFull: Ref<boolean> = ref(false);

    const { onPageChange, onPageRefresh, onPageSizeChange } = usePagination(c);

    // 本地数据模式
    const initSimpleData = (): void => {
      if (!props.data) {
        return;
      }
      c.state.items = (props.data as IData[]).map(item => new ControlVO(item));
      c.afterLoad({}, c.state.items);
    };

    c.evt.on('onCreated', async () => {
      if (props.isSimple) {
        initSimpleData();
        c.state.isSimple = true;
        c.state.isLoaded = true;
      }
    });

    watch(
      () => props.data,
      () => {
        if (props.isSimple) initSimpleData();
      },
      {
        deep: true,
      },
    );

    const batchKey = computed(() => {
      return c.state.batching ? c.state.selectGroupKey : '';
    });

    const quickToolbarModel = c.model.controls?.find(item => {
      return (
        item.name === `${c.model.name!}_quicktoolbar` ||
        item.name === `${c.model.name!}_groupquicktoolbar`
      );
    });

    const batchToolbarModel = c.model.controls?.find(item => {
      return item.name === `${c.model.name!}_batchtoolbar`;
    });

    const groupClass = c.model.groupSysCss?.cssName || ''; // 分组样式表

    const collapseMap: Ref<IData> = ref({});

    let cleanup = NOOP;

    // 分组的行内样式
    const groupStyle: StyleValue = {};
    switch (c.model.groupLayout) {
      case 'ROW':
        groupStyle.width = `${c.model.groupWidth || 300}px`;
        groupStyle.height = '100%';
        break;
      case 'COLUMN':
        groupStyle.width = '100%';
        groupStyle.height = `${c.model.groupHeight || 500}px`;
        break;
      default:
    }

    const stopPropagation = (event: MouseEvent) => {
      event.stopPropagation();
    };

    const onCollapse = (group: IKanbanGroupState, event: MouseEvent) => {
      stopPropagation(event);
      const key = String(group.key);
      collapseMap.value[key] = !collapseMap.value[key];
    };

    // 行单击事件
    const onRowClick = (item: IData, event: MouseEvent): Promise<void> => {
      stopPropagation(event);
      return c.onRowClick(item);
    };

    // 行双击事件
    const onDbRowClick = (item: IData, event: MouseEvent): Promise<void> => {
      stopPropagation(event);
      return c.onDbRowClick(item);
    };

    // 新建
    const onClickNew = (event: MouseEvent, group: string | number) => {
      stopPropagation(event);
      return c.onClickNew(event, group);
    };

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

    onMounted(() => {
      cleanup = listenJSEvent(window, 'resize', () => {
        isFull.value = c.getFullscreen();
      });
    });

    // 组件销毁前销毁监听
    onBeforeUnmount(() => {
      if (cleanup !== NOOP) cleanup();
    });

    // 绘制项布局面板
    const renderPanelItemLayout = (
      item: IData,
      modelData: ILayoutPanel,
    ): VNode => {
      const { context, params } = c;
      return (
        <iBizControlShell
          data={item}
          class={ns.e('panel-item')}
          modelData={modelData}
          context={context}
          params={params}
        ></iBizControlShell>
      );
    };

    // 绘制操作项行为
    const renderItemAction = (item: IData, group: IKanbanGroupState): VNode => {
      return (
        <iBizActionToolbar
          zIndex={c.state.zIndex}
          class={ns.bem('item', 'bottom', 'actions')}
          action-details={c.getOptItemModel()}
          actions-state={c.state.uaState[item.srfkey]}
          onActionClick={(
            detail: IUIActionGroupDetail,
            event: MouseEvent,
          ): Promise<void> => c.onGroupActionClick(detail, item, event, group)}
        ></iBizActionToolbar>
      );
    };

    // 绘制快速工具栏行为
    const renderQuickToolBar = (
      group: IKanbanGroupState,
    ): VNode | undefined => {
      if (!quickToolbarModel) return;
      return (
        <iBizControlShell
          class={ns.e('quicktoolbar')}
          modelData={{
            ...quickToolbarModel,
            name: `${quickToolbarModel.name}_${group.key}`,
          }}
          context={c.context}
          params={c.params}
        ></iBizControlShell>
      );
    };

    const renderBatchToolBar = (
      group: IKanbanGroupState,
    ): VNode | undefined => {
      if (!batchToolbarModel) return;
      return (
        <div class={ns.be('batch', 'toolbar')}>
          <iBizControlShell
            modelData={{
              ...batchToolbarModel,
              name: `${batchToolbarModel.name}_${group.key}`,
            }}
            context={c.context}
            params={c.params}
          ></iBizControlShell>
        </div>
      );
    };

    const renderBatchCheck = (group: IKanbanGroupState) => {
      const selectedData = group.selectedData || [];
      const checkAll = selectedData.length === group.children.length;
      const isIndeterminate =
        selectedData.length > 0 && selectedData.length < group.children.length;
      return (
        <div class={ns.be('batch', 'check')}>
          <el-checkbox
            model-value={checkAll}
            indeterminate={isIndeterminate}
            onChange={() => handleCheckAllGroup(group, checkAll)}
          >
            {ibiz.i18n.t('control.kanban.selectAll')}
          </el-checkbox>
          <span
            class={ns.be('batch', 'info')}
            v-html={ibiz.i18n.t('control.kanban.selectedDataCount', {
              length: selectedData.length,
            })}
          ></span>
        </div>
      );
    };

    const renderBatchContainer = (
      group: IKanbanGroupState,
    ): VNode | undefined => {
      if (batchKey.value !== group.key) return;
      return (
        <div class={ns.b('batch')}>
          {renderBatchToolBar(group)}
          {renderBatchCheck(group)}
        </div>
      );
    };

    // 绘制默认项
    const renderDefaultItem = (item: IData, group: IKanbanGroupState) => {
      const actionModel = c.getOptItemModel();
      return (
        <div class={ns.e('default-item')}>
          <div class={ns.be('item', 'top')}>
            <div class={ns.bem('item', 'top', 'title')}>
              {item.srfmajortext}
            </div>
            <div class={ns.bem('item', 'top', 'description')}>
              {item.content}
            </div>
          </div>
          {actionModel.length ? (
            <div class={ns.be('item', 'bottom')}>
              {renderItemAction(item, group)}
            </div>
          ) : null}
        </div>
      );
    };

    // 绘制卡片
    const renderCard = (item: IData, group: IKanbanGroupState): VNode => {
      // 是否选中数据
      const findIndex = c.state.selectedData.findIndex(data => {
        return data.srfkey === item.srfkey;
      });
      const cardClass = [
        ns.b('item'),
        ns.is('selected', findIndex !== -1),
        // 数据更新时不允许拖拽，鼠标变为禁用
        ns.is('disabled', c.state.draggable && c.state.updating),
      ];
      const cardStyle: StyleValue = {};
      if (c.model.cardWidth) {
        cardStyle.width = `${c.model.cardWidth}px`;
      }
      if (c.model.cardHeight) {
        cardStyle.height = `${c.model.cardHeight}px`;
      }

      // 项布局面板
      const panel = props.modelData.itemLayoutPanel;

      return (
        <el-card
          shadow='hover'
          class={cardClass}
          body-style={cardStyle}
          onClick={(event: MouseEvent): Promise<void> =>
            onRowClick(item, event)
          }
          onDblclick={(event: MouseEvent): Promise<void> =>
            onDbRowClick(item, event)
          }
        >
          <div class={ns.be('item', 'content')}>
            {c.state.draggable && !c.state.readonly && (
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
                  <g transform='translate(5 1)' fill-rule='nonzero'>
                    <path d='M1 2a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2zM1 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm-4 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm-4 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2z'></path>
                  </g>
                </g>
              </svg>
            )}
            {panel
              ? renderPanelItemLayout(item, panel)
              : renderDefaultItem(item, group)}
          </div>
        </el-card>
      );
    };

    /**
     * 绘制无数据
     * @author lxm
     * @date 2023-08-30 03:53:21
     * @return {*}  {(VNode | undefined)}
     */
    const renderNoData = (): VNode | undefined => {
      // 未加载不显示无数据
      if (!c.state.isLoaded) {
        return;
      }
      const noDataSlots: IParams = {};
      if (hasEmptyPanelRenderer(c)) {
        Object.assign(noDataSlots, {
          customRender: () => (
            <IBizCustomRender controller={c}></IBizCustomRender>
          ),
        });
      }
      return (
        <iBizNoData
          text={c.model.emptyText}
          emptyTextLanguageRes={c.model.emptyTextLanguageRes}
        >
          {noDataSlots}
        </iBizNoData>
      );
    };

    let cacheInfo: Partial<IDragChangeInfo> | null = null;

    /**
     * @description 拖拽变更
     * @param {IData} evt
     * @param {(string | number)} groupKey
     */
    const onDraggableChange = (evt: IData, groupKey: string | number) => {
      if (evt.moved) {
        // 排序
        c.onDragChange({
          from: groupKey,
          to: groupKey,
          fromIndex: evt.moved.oldIndex,
          toIndex: evt.moved.newIndex,
        });
      }
      // 分组变更时会先触发added后触发removed，因此需提前缓存added的参数
      if (evt.added) {
        cacheInfo = {
          to: groupKey,
          toIndex: evt.added.newIndex,
        };
      }
      if (evt.removed) {
        if (cacheInfo) {
          cacheInfo.from = groupKey;
          cacheInfo.fromIndex = evt.removed.oldIndex;
          c.onDragChange(cacheInfo as IDragChangeInfo);
        }
        cacheInfo = null;
      }
    };

    // 全屏
    const onFullScreen = () => {
      const container = kanban.value.$el;
      isFull.value = c.onFullScreen(container);
    };

    const renderGroupToolbar = (group: IKanbanGroupState) => {
      const showActionBar =
        (c.model.groupUIActionGroup && group.groupActionGroupState) ||
        batchToolbarModel;
      if (batchKey.value === group.key) {
        return (
          <span
            class={ns.be('group', 'header-right')}
            onClick={(event: MouseEvent) => stopPropagation(event)}
          >
            <el-button text onClick={() => c.closeBatch()}>
              {ibiz.i18n.t('app.complete')}
            </el-button>
          </span>
        );
      }
      return (
        <span
          class={ns.be('group', 'header-right')}
          onClick={(event: MouseEvent) => stopPropagation(event)}
        >
          {c.enableNew && !c.state.readonly && (
            <el-button
              class={ns.be('group', 'header-new')}
              text
              circle
              onClick={(event: MouseEvent) => {
                onClickNew(event, group.key);
              }}
            >
              <ion-icon
                name='add-outline'
                title={ibiz.i18n.t('app.newlyBuild')}
              ></ion-icon>
            </el-button>
          )}
          {showActionBar && (
            <el-dropdown
              class={ns.be('group', 'header-actions')}
              trigger='click'
              teleported={false}
              popper-class={ns.e('popover')}
            >
              {{
                default: (): VNode => (
                  <span title={ibiz.i18n.t('app.more')}>···</span>
                ),
                dropdown: (): VNode => (
                  <div class={ns.be('group', 'actions-dropdown')}>
                    {c.model.groupUIActionGroup &&
                      group.groupActionGroupState && (
                        <iBizActionToolbar
                          actionDetails={
                            c.model.groupUIActionGroup!.uiactionGroupDetails
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
        </span>
      );
    };

    // 绘制分组
    const renderGroup = (group: IKanbanGroupState) => {
      const collapse = collapseMap.value[String(group.key)];
      const isColumn = c.model.groupLayout === 'COLUMN';
      const tempGroupStyle = { ...groupStyle };
      if (collapse) {
        tempGroupStyle.height = '50px';
      }
      if (!collapse || isColumn) {
        return (
          <div
            class={[ns.b('group'), ns.is('collapse', collapse), groupClass]}
            style={tempGroupStyle}
          >
            <div
              class={ns.be('group', 'header')}
              style={{ borderTopColor: group.color || 'transparent' }}
              onClick={(event: MouseEvent) => onCollapse(group, event)}
            >
              <div class={ns.be('group', 'header-left')}>
                <ion-icon name='caret-down-sharp'></ion-icon>
                <span
                  class={[
                    ns.be('group', 'header-caption'),
                    ns.is('badge', !!group.color),
                  ]}
                  style={{ backgroundColor: group.color }}
                >
                  {`${group.caption}${
                    group.children.length ? ` · ${group.children.length}` : ''
                  }`}
                </span>
              </div>
              {renderGroupToolbar(group)}
            </div>
            {renderBatchContainer(group)}
            <div
              class={[
                ns.be('group', 'list'),
                ns.is('empty', !group.children.length),
              ]}
            >
              <draggable
                itemKey='srfkey'
                group={c.model.id}
                modelValue={group.children}
                class={ns.be('group', 'draggable')}
                handle={`.${ns.e('drag-icon')}`}
                disabled={
                  !c.state.draggable || c.state.updating || c.state.readonly
                }
                onChange={(evt: IData) => onDraggableChange(evt, group.key)}
              >
                {{
                  item: ({ element }: { element: IData }) => {
                    return renderCard(element, group);
                  },
                  header: () => {
                    if (group.children.length) {
                      return null;
                    }
                    return (
                      <div class={ns.be('group', 'list')}>{renderNoData()}</div>
                    );
                  },
                }}
              </draggable>
              {renderQuickToolBar(group)}
            </div>
          </div>
        );
      }
      return (
        <div class={[ns.b('group'), ns.is('collapse', collapse), groupClass]}>
          <div
            class={ns.be('group', 'header')}
            style={{ borderTopColor: group.color || 'transparent' }}
            onClick={(event: MouseEvent) => onCollapse(group, event)}
          >
            <span
              class={[
                ns.be('group', 'header-caption'),
                ns.is('badge', !!group.color),
              ]}
              style={{ backgroundColor: group.color }}
            >
              {`${group.caption}${
                group.children.length ? ` · ${group.children.length}` : ''
              }`}
            </span>
            <ion-icon name='caret-forward-sharp'></ion-icon>
          </div>
        </div>
      );
    };

    return {
      c,
      ns,
      isFull,
      kanban,
      renderGroup,
      onFullScreen,
      onPageChange,
      onPageRefresh,
      onPageSizeChange,
    };
  },
  render() {
    const { groups, isCreated } = this.c.state;
    const { swimlaneAppDEFieldId } = this.c.model;
    if (!isCreated) return null;
    return (
      <iBizControlBase
        ref='kanban'
        controller={this.c}
        class={[
          this.ns.m(this.modelData.groupLayout?.toLowerCase()),
          this.ns.is('full', this.isFull),
          this.ns.is('swimlane', !!swimlaneAppDEFieldId),
          this.ns.is('enable-page', this.c.state.enablePagingBar),
        ]}
      >
        <div class={this.ns.e('content')}>
          {swimlaneAppDEFieldId ? (
            <SwimlaneKanban controller={this.c} />
          ) : (
            [
              <div class={this.ns.b('group-container')}>
                {groups.length > 0 &&
                  groups.map(group => {
                    if (group.hidden) return null;
                    return this.renderGroup(group);
                  })}
              </div>,
              groups.length > 0 && (
                <div class={this.ns.b('toolbar')}>
                  {this.c.enableGroupHidden && (
                    <iBizKanbanSetting controller={this.c} />
                  )}
                  {this.c.enableFullScreen && (
                    <el-button
                      type='info'
                      onClick={this.onFullScreen}
                      title={
                        this.isFull
                          ? ibiz.i18n.t('app.cancelFullscreen')
                          : ibiz.i18n.t('app.fullscreen')
                      }
                    >
                      <ion-icon
                        name={
                          this.isFull ? 'contract-outline' : 'expand-outline'
                        }
                      ></ion-icon>
                    </el-button>
                  )}
                </div>
              ),
            ]
          )}
        </div>
        {this.c.state.enablePagingBar && (
          <iBizPagination
            size={this.c.state.size}
            total={this.c.state.total}
            curPage={this.c.state.curPage}
            totalPages={this.c.state.totalPages}
            onChange={this.onPageChange}
            onPageRefresh={this.onPageRefresh}
            onPageSizeChange={this.onPageSizeChange}
          ></iBizPagination>
        )}
      </iBizControlBase>
    );
  },
});
