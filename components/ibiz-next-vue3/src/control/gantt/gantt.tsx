/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable no-restricted-syntax */
import {
  useControlController,
  useNamespace,
  useUIStore,
  IBizControlShell,
  hasEmptyPanelRenderer,
  IBizCustomRender,
} from '@ibiz-template/vue3-util';
import {
  computed,
  defineComponent,
  PropType,
  resolveComponent,
  VNode,
  h,
  watch,
  onMounted,
  getCurrentInstance,
  ref,
  Ref,
  nextTick,
} from 'vue';
import {
  IDEGantt,
  IDETBGroupItem,
  IDETBRawItem,
  IDETBUIActionItem,
  IDEToolbarItem,
  IDETreeColumn,
  IPanel,
} from '@ibiz/model-core';
import {
  IControlProvider,
  GanttController,
  IGanttNodeData,
  IButtonState,
  IButtonContainerState,
  IModal,
  IModalData,
  IColumnState,
  IOverlayPopoverContainer,
} from '@ibiz-template/runtime';
import { showTitle } from '@ibiz-template/core';
import { MenuItem } from '@imengyu/vue3-context-menu';
import dayjs from 'dayjs';
import {
  AllowDropType,
  NodeDropType,
} from 'element-plus/es/components/tree/src/tree.type';
import { findNodeData, formatNodeDropType } from '../tree/el-tree-util';
import './gantt.scss';

export const GanttControl = defineComponent({
  name: 'IBizGanttControl',
  props: {
    /**
     * @description 甘特模型数据
     */
    modelData: { type: Object as PropType<IDEGantt>, required: true },
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
     * @description 是否默认加载数据
     * @default true
     */
    loadDefault: { type: Boolean, default: true },
    /**
     * @description 部件行数据默认激活模式，值为0:不激活，值为1：单击激活，值为2：双击激活
     */
    mdctrlActiveMode: { type: Number, default: undefined },
    /**
     * @description 是否单选
     */
    singleSelect: { type: Boolean, default: undefined },
  },
  setup(props) {
    const c = useControlController<GanttController>(
      (...args) => new GanttController(...args),
    );

    const ganttRef: Ref<IData | undefined> = ref();

    // 是否初始化
    const isInited: Ref<boolean> = ref(false);
    const ns = useNamespace(`control-${c.model.controlType!.toLowerCase()}`);

    // 滑块模态
    let overlay: null | IOverlayPopoverContainer = null;
    // 滑块链接线模态
    let linkOverlay: null | IOverlayPopoverContainer = null;

    // 滑块移动
    const sliderMove = ref(false);

    const iBizRawItem = resolveComponent('IBizRawItem');
    const iBizIcon = resolveComponent('IBizIcon');

    let forbidClick: boolean = false;
    let forbidOperation: boolean = false;

    const selection: IGanttNodeData[] = [];

    // 动态加载gantt组件
    const app = getCurrentInstance()?.appContext.app;
    onMounted(() => {
      const importGantt = () => import('@ibiz-template-plugin/gantt');
      importGantt().then(value => {
        const defaltModule = value.default;
        app?.use(defaltModule);
        isInited.value = true;
      });
      // 甘特行展开、折叠
      c.evt.on('onToggleRowExpansion', (event: IData) => {
        const { row, expand } = event;
        if (ganttRef.value) {
          if (expand) {
            ganttRef.value.setExpand(row);
          } else {
            ganttRef.value.setCollapse(row);
          }
        }
      });
    });

    const getVarValue = (varName: string) => {
      const root = document.documentElement;
      return getComputedStyle(root).getPropertyValue(varName);
    };

    const { UIStore } = useUIStore();
    const ganttStyle = ref<IData>({});

    // 计算甘特样式
    const calcGanttStyle = () => {
      return {
        primaryColor:
          c.state.ganttStyle?.primaryColor ||
          getVarValue('--ibiz-color-primary'),
        textColor:
          c.state.ganttStyle?.textColor || getVarValue('--ibiz-color-text-3'),
        headerBgColor: `rgba(${getVarValue('--ibiz-grey-1')}, 1)`,
        bgColor: getVarValue('--ibiz-color-bg-1'),
        weekendColor: getVarValue('--ibiz-color-fill-2'),
        todayColor: getVarValue('--ibiz-color-primary-light-active'),
        borderColor: getVarValue('--ibiz-color-tertiary-light-active'),
      };
    };

    watch(
      () => UIStore.theme,
      () => {
        ganttStyle.value = calcGanttStyle();
      },
      { immediate: true },
    );

    /**
     * 部件是否在加载状态
     */
    const loading = computed(() => {
      if (c.state.isLoaded) {
        return c.state.isLoading;
      }
      return false;
    });

    /**
     * 实际呈现的数据
     */
    const data = computed(() => {
      if (!c.state.isLoaded) {
        return [];
      }
      return c.model.rootVisible
        ? c.state.rootNodes
        : c.state.rootNodes.reduce<IGanttNodeData[]>((result, nodeData) => {
            if (nodeData._children) {
              return result.concat(nodeData._children as IGanttNodeData[]);
            }
            return result;
          }, []);
    });

    /**
     * 实际绘制的表格列
     */
    const columns = computed(() => {
      const columnsModel: IDETreeColumn[] = [];
      c.state.columnStates.forEach(item => {
        const columnModel = c.columns[item.key]?.model;
        if (!item.hidden && columnModel) {
          columnsModel.push(columnModel);
        }
      });
      return columnsModel;
    });

    const locale = computed(() => {
      return ibiz.i18n.getLang().toLowerCase();
    });

    // 监听选中数据，操作甘特来处理界面回显选中效果。
    watch(
      [() => ganttRef.value, (): IGanttNodeData[] => c.state.selectedData],
      ([table, newVal]) => {
        if (forbidOperation || !table) return;
        nextTick(() => {
          if (c.state.singleSelect) {
            // 单选，选中效果回显。
            if (newVal[0]) {
              ganttRef.value?.setSelected(newVal[0]);
            } else {
              ganttRef.value?.setSelected();
            }
          } else {
            selection.length = 0;
            selection.push(...newVal);
            newVal.forEach(item => ganttRef.value?.setChecked(item, true));
          }
        });
      },
    );

    /**
     * 查找对应节点的布局面板
     *
     * @param {string} id
     * @return {*}  {(IPanel | undefined)}
     */
    const findNodeLayoutPanel = (id: string): IPanel | undefined => {
      let layoutPanel: IPanel | undefined;
      const nodeModel = c.getNodeModel(id);
      nodeModel?.controlRenders?.forEach(renderItem => {
        if (
          renderItem.renderType === 'LAYOUTPANEL' &&
          (renderItem.id || '').split('_')[0] !== 'nodelinkrender'
        ) {
          layoutPanel = renderItem.layoutPanel;
        }
      });
      return layoutPanel;
    };

    /**
     * 查找对应节点链接的布局面板
     *
     * @param {string} id
     * @return {*}  {(IPanel | undefined)}
     */
    const findNodeLinkLayoutPanel = (id: string): IPanel | undefined => {
      let layoutPanel: IPanel | undefined;
      const nodeModel = c.getNodeModel(id);
      nodeModel?.controlRenders?.find(renderItem => {
        if (
          renderItem.renderType === 'LAYOUTPANEL' &&
          (renderItem.id || '').split('_')[0] === 'nodelinkrender'
        ) {
          layoutPanel = renderItem.layoutPanel;
          return true;
        }
        return false;
      });
      return layoutPanel;
    };

    let fullscreen = false;
    const oldAllPopover: HTMLElement[] = [];

    /**
     * 获取所有需要处理的弹窗元素
     *
     * @return {*}  {IData}
     */
    const getAllPopover = (): IData => {
      const allPopover = {};
      // 编辑器气泡父元素
      const elPopover = document.querySelector('.el-popover')?.parentElement;
      if (elPopover) Object.assign(allPopover, { elPopover });

      return allPopover;
    };

    /**
     * 将弹窗元素添加到目标容器中
     *
     * @param {HTMLElement[]} _popover
     * @param {HTMLElement} _target
     * @return {*}
     */
    const popoverAppendTarget = (
      _popover: HTMLElement[],
      _target: HTMLElement,
    ): void => {
      _popover.forEach(
        _element =>
          _element.parentElement !== _target && _target?.append(_element),
      );
    };

    /**
     * 将弹窗元素移动到甘特图容器中
     *
     * @return {*}
     */
    const popoverAppendGantt = (): void => {
      const targetContainer = ganttRef.value?.getElementRefs().rootRef.value;
      const allPopoverNode = Object.values(getAllPopover()).filter(_element => {
        // 父元素必须为body节点才移动，元素内部气泡不应该移动
        return _element && _element.parentElement === document.body;
      });
      oldAllPopover.push(...allPopoverNode);
      popoverAppendTarget(allPopoverNode, targetContainer);
    };

    /**
     * 将弹窗元素移回body中
     *
     * @return {*}
     */
    const popoverAppendBody = (): void => {
      const allPopoverNode = oldAllPopover.filter(_element => !!_element);
      oldAllPopover.length = 0;
      popoverAppendTarget(allPopoverNode, document.body);
    };

    /**
     * 处理全屏状态变化的回调函数
     *
     * @param {boolean} _state
     * @return {*}
     */
    const handleFullscreenChange = (_state: boolean): void => {
      fullscreen = _state;

      if (_state) {
        popoverAppendGantt();
      } else {
        popoverAppendBody();
      }
    };

    /**
     * 多选时选中节点变更
     *
     * @param {boolean} state 当前复选框状态
     * @param {IGanttNodeData} item 当前数据
     */
    const onCheck = (state: boolean, item: IGanttNodeData) => {
      forbidOperation = true;
      if (state) {
        selection.push(item);
      } else {
        const index = selection.findIndex(
          selected => selected._id === item._id,
        );
        if (index > -1) {
          selection.splice(index, 1);
        }
      }
      c.setSelection(selection);
      setTimeout(() => {
        forbidOperation = false;
      }, 200);
    };

    /**
     * 节点单击事件
     *
     * @param {IGanttNodeData} nodeData
     * @return {*}
     */
    const onNodeClick = (nodeData: IGanttNodeData, evt: MouseEvent) => {
      if (forbidClick || sliderMove.value) {
        sliderMove.value = false;
        return;
      }
      forbidOperation = true;

      c.onTreeNodeClick(nodeData, evt);
      forbidClick = true;
      setTimeout(() => {
        forbidClick = false;
        forbidOperation = false;
      }, 200);
    };

    /**
     * 节点双击事件
     *
     * @param {IGanttNodeData} nodeData
     */
    const onNodeDbClick = (nodeData: IGanttNodeData) => {
      c.onDbTreeNodeClick(nodeData);
    };

    /**
     * 处理节点展开
     *
     * @param {IGanttNodeData} nodeData
     */
    const onNodeExpand = (nodeData: IGanttNodeData) => {
      c.onExpandChange(nodeData, true);
      if (nodeData && !nodeData._children) {
        c.refreshNodeChildren(nodeData);
      }
    };

    // 新建行
    c.evt.on('onNewRow', event => {
      const nodeData = event.row.data;
      ganttRef.value?.setExpand(nodeData);
    });

    /**
     * 处理节点折叠
     *
     * @param {IGanttNodeData} nodeData
     */
    const onNodeCollapse = (nodeData: IGanttNodeData) => {
      c.onExpandChange(nodeData, false);
    };

    /**
     * 是否允许拖入
     *
     * @param {IGanttNodeData} draggingNode
     * @param {IGanttNodeData} dropNode
     * @param {AllowDropType} type
     * @return {*}
     */
    const allowDrop = (
      draggingNode: IGanttNodeData,
      dropNode: IGanttNodeData,
      type: AllowDropType,
    ) => {
      const draggingNodeData = findNodeData(draggingNode._uuid, c)!;
      const dropNodeData = findNodeData(dropNode._uuid, c)!;
      const result = c.calcAllowDrop(draggingNodeData, dropNodeData, type);
      return result;
    };

    /**
     * 是否允许拖动
     *
     * @param {IGanttNodeData} draggingNode
     * @return {*}
     */
    const allowDrag = (draggingNode: IGanttNodeData) => {
      const nodeData = findNodeData(draggingNode._uuid, c)!;
      return c.calcAllowDrag(nodeData);
    };

    /**
     * 处理节点拖入事件
     *
     * @param {IGanttNodeData} draggingNode
     * @param {IGanttNodeData} dropNode
     * @param {NodeDropType} dropType
     */
    const handleDrop = (
      draggingNode: IGanttNodeData,
      dropNode: IGanttNodeData,
      dropType: NodeDropType,
    ) => {
      const draggingNodeData = findNodeData(
        draggingNode._uuid,
        c,
      ) as IGanttNodeData;
      const dropNodeData = findNodeData(dropNode._uuid, c) as IGanttNodeData;
      const type = formatNodeDropType(dropType);
      c.onNodeDrop(draggingNodeData, dropNodeData, type);
    };

    /**
     * 滑块移动
     *
     * @param {IData[]} sliders
     */
    const onSliderMove = (sliders: IData[]) => {
      const nodeData: IGanttNodeData = sliders[0]?.row;
      const newValue = {
        begin: nodeData._beginDataItemValue
          ? dayjs(nodeData._beginDataItemValue).format('YYYY-MM-DD HH:mm:ss')
          : undefined,
        end: nodeData._endDataItemValue
          ? dayjs(nodeData._endDataItemValue).format('YYYY-MM-DD HH:mm:ss')
          : undefined,
      };
      sliderMove.value = true;
      c.modifyNodeTime(nodeData, newValue);
    };

    /**
     * 表格列设置点击
     */
    const onSettingClick = async (): Promise<void> => {
      // 最大限制数（除去必须显示列之外的其他列），默认值为0，表示无限制
      let limitsize = 0;
      if (c.controlParams.limitsize) {
        limitsize = Number(c.controlParams.limitsize);
      }
      const res: IModalData = await ibiz.overlay.modal(
        (modal: IModal): VNode => {
          const comp = resolveComponent('IBizGanttSetting') as string;
          const options: IData = {
            modal,
            columnStates: c.state.columnStates,
            limitsize,
          };
          if (c.state.mustShowColumns) {
            options.mustShowColumns = c.state.mustShowColumns;
          }
          return h(comp, options);
        },
        undefined,
        { width: 'auto', height: 'auto' },
      );
      if (res.ok && res.data && res.data.length > 0) {
        c.setColumnVisible(res.data as IColumnState[]);
      }
    };

    /**
     * 计算上下文菜单组件配置项集合
     *
     * @param {IDEToolbarItem[]} toolbarItems
     * @param {IGanttNodeData} nodeData
     * @param {MouseEvent} evt
     * @param {IButtonContainerState} menuState
     * @return {*}  {MenuItem[]}
     */
    const calcContextMenuItems = (
      toolbarItems: IDEToolbarItem[],
      nodeData: IGanttNodeData,
      evt: MouseEvent,
      menuState: IButtonContainerState,
    ): MenuItem[] => {
      const result: MenuItem[] = [];
      toolbarItems.forEach(item => {
        if (item.itemType === 'SEPERATOR') {
          result.push({
            divided: 'self',
          });
          return;
        }

        const buttonState = menuState[item.id!] as IButtonState;
        if (buttonState && !buttonState.visible) {
          return;
        }

        // 除分隔符之外的公共部分
        const menuItem: MenuItem = {};
        if (item.showCaption && item.caption) {
          menuItem.label = item.caption;
        }
        if (item.sysImage && item.showIcon) {
          menuItem.icon = <iBizIcon icon={item.sysImage}></iBizIcon>;
        }

        // 界面行为项
        if (item.itemType === 'DEUIACTION') {
          menuItem.disabled = buttonState.disabled;
          menuItem.clickClose = true;
          const { uiactionId } = item as IDETBUIActionItem;
          if (uiactionId) {
            menuItem.onClick = () => {
              c.doUIAction(uiactionId, nodeData, evt, item.appId);
            };
          }
        } else if (item.itemType === 'RAWITEM') {
          const { rawItem } = item as IDETBRawItem;
          if (rawItem) {
            menuItem.label = (
              <iBizRawItem rawItem={item as IDETBRawItem}></iBizRawItem>
            );
          }
        } else if (item.itemType === 'ITEMS') {
          // 分组项绘制子菜单
          if ((item as IDETBGroupItem).detoolbarItems?.length) {
            menuItem.children = calcContextMenuItems(
              (item as IDETBGroupItem).detoolbarItems!,
              nodeData,
              evt,
              menuState,
            );
          }
        }
        result.push(menuItem);
      });

      return result;
    };

    /**
     * 上下文菜单相关
     */
    let ContextMenu: IData;
    c.evt.on('onMounted', () => {
      // 有上下文菜单时加载组件
      if (Object.values(c.contextMenus).length > 0) {
        const importMenu = () => import('@imengyu/vue3-context-menu');
        importMenu().then(value => {
          ContextMenu = value.default;
          if (ContextMenu.default && !ContextMenu.showContextMenu) {
            ContextMenu = ContextMenu.default;
          }
        });
      }
    });

    /**
     * 节点右键菜单点击事件
     *
     * @param {IGanttNodeData} nodeData
     * @param {MouseEvent} evt
     */
    const onNodeContextmenu = async (
      nodeData: IGanttNodeData,
      evt: MouseEvent,
    ) => {
      evt.stopPropagation();
      evt.preventDefault();
      const nodeModel = c.getNodeModel(nodeData._nodeId);
      if (!nodeModel?.decontextMenu) {
        return;
      }
      const contextMenuC = c.contextMenus[nodeModel.decontextMenu.id!];

      if (!contextMenuC.model.detoolbarItems) {
        return;
      }

      // 更新菜单的权限状态
      await contextMenuC.calcButtonState(
        nodeData._deData || (nodeData.srfkey ? nodeData : undefined),
        nodeModel.appDataEntityId,
        { view: c.view, ctrl: c },
      );
      const menuState = contextMenuC.state.buttonsState;

      const menus: MenuItem[] = calcContextMenuItems(
        contextMenuC.model.detoolbarItems,
        nodeData,
        evt,
        menuState as IButtonContainerState,
      );
      if (!menus.length) {
        return;
      }

      ContextMenu.showContextMenu({
        x: evt.x,
        y: evt.y,
        customClass: ns.b('context-menu'),
        items: menus,
      });
    };

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

    /**
     * 绘制表格列
     * @param model
     * @param index
     * @returns
     */
    const renderColumn = (model: IDETreeColumn, index: number): VNode => {
      const { caption, codeName, width, headerSysCss, align } = model;
      const columnC = c.columns[codeName!];
      const columnState: IColumnState | undefined = c.state.columnStates.find(
        (item: IColumnState) => {
          return item.key === codeName;
        },
      );

      let tempWidth = 30;
      if (columnState && columnState.columnWidth) {
        tempWidth = columnState.columnWidth > 30 ? columnState.columnWidth : 30;
      } else if (width && width > 30) {
        tempWidth = width;
      }

      return (
        <x-gantt-column
          label={caption}
          prop={codeName}
          width={tempWidth}
          center={align?.toLowerCase() === 'center'}
        >
          {{
            title: () => {
              return <div class={headerSysCss?.cssName}>{caption}</div>;
            },
            default: ({ row }: IData): VNode | null => {
              const rowState = c.getRowState(row._id);
              if (rowState) {
                const comp = resolveComponent(c.providers[codeName!].component);
                return h(comp, {
                  controller: columnC,
                  row: rowState,
                  key: rowState.data._uuid + codeName,
                });
              }
              return null;
            },
          }}
        </x-gantt-column>
      );
    };

    /**
     * 绘制节点面板
     *
     * @param {IPanel} modelData
     * @param {IData} item
     * @return {*}
     */
    const renderNodePanel = (modelData: IPanel, item: IData) => {
      return h(IBizControlShell, {
        data: item,
        modelData,
        context: c.context,
        params: c.params,
      });
    };

    /**
     * 绘制节点信息
     *
     * @param {IGanttNodeData} item
     * @return {*}
     */
    const renderNodeInfo = (item: IGanttNodeData) => {
      return (
        <div class={ns.em('slider', 'container')}>
          <div class={ns.em('slider', 'container-title')}>
            <div class='number'>
              {item._icon && (
                <iBizIcon class='icon' icon={item._icon}></iBizIcon>
              )}
              {item._snDataItemValue}
            </div>
            <div class='caption'>{item._text}</div>
          </div>
        </div>
      );
    };

    /**
     * 打开 popover
     *
     * @param {IGanttNodeData} item
     * @param {MouseEvent} evt
     * @return {*}
     */
    const openPopover = (row: IGanttNodeData, evt: MouseEvent): void => {
      if (overlay) {
        return;
      }
      const appendTo =
        fullscreen && ganttRef.value?.getElementRefs().rootRef.value;
      const panel = findNodeLayoutPanel(row._nodeId);
      const component = panel
        ? renderNodePanel(panel, row._deData!)
        : renderNodeInfo(row);
      overlay = ibiz.overlay.createPopover(
        (modal: IModal): VNode => {
          return h(component, { modal });
        },
        undefined,
        {
          width: 'auto',
          height: 'auto',
          noArrow: true,
          placement: 'bottom',
          modalClass: ns.e('slider-popover'),
          appendTo,
        },
      );
      overlay?.present((evt.target as IParams).children[0] as HTMLElement);
    };

    /**
     * 关闭 popover
     *
     * @return {*}
     */
    const closePopover = (): void => {
      overlay?.dismiss();
      overlay = null;
    };

    /**
     * 绘制滑块
     *
     * @return {*}
     */
    const renderSlider = () => {
      return (
        <x-gantt-slider
          allow-link={false}
          resize-mode='dragonly'
          move={c.state.sliderDraggable}
          resize-left={c.state.sliderDraggable}
          resize-right={c.state.sliderDraggable}
        >
          {{
            content: ({
              row,
              left,
            }: {
              row: IGanttNodeData;
              left: number;
            }): JSX.Element => {
              const { sysCss } = c.getNodeModel(row._nodeId)!;
              const sysCssName = sysCss?.cssName || '';
              const marginLeft = left < 0 ? `${-left}px` : '';
              const caption = row?._text;
              return (
                <div
                  class={[ns.e('slider'), sysCssName]}
                  onClick={evt => onNodeClick(row, evt)}
                  onDblclick={() => onNodeDbClick(row)}
                  onContextmenu={evt => onNodeContextmenu(row, evt)}
                  onMouseenter={evt => openPopover(row, evt)}
                  onMouseleave={closePopover}
                >
                  <div
                    class={ns.em('slider', 'caption')}
                    style={{ marginLeft }}
                    title={caption}
                    v-html={caption}
                  ></div>
                </div>
              );
            },
          }}
        </x-gantt-slider>
      );
    };

    /**
     * 绘制内容
     * @returns
     */
    const renderContent = () => {
      const _columns = columns.value.map((model, index) => {
        return renderColumn(model, index);
      });
      const slider = renderSlider();
      return [..._columns, slider];
    };

    /**
     * 绘制设置
     */
    const renderSetting = (): JSX.Element | null => {
      if (
        !c.controlParams.enablecustomized ||
        (c.controlParams.enablecustomized &&
          c.controlParams.enablecustomized === 'false')
      ) {
        return null;
      }
      return (
        <div
          class={ns.e('setting')}
          onClick={() => onSettingClick()}
          title={showTitle(ibiz.i18n.t('control.gantt.hideControl'))}
        >
          <svg
            class={ns.em('setting', 'icon')}
            viewBox='0 0 16 16'
            xmlns='http://www.w3.org/2000/svg'
            height='1em'
            width='1em'
            focusable='false'
          >
            <g stroke-width='1' fill-rule='evenodd'>
              <path d='M11.405 13.975l3.398-5.889L11.405 2.2H4.607L1.208 8.087l3.399 5.889h6.798zm1.023-12.4l3.43 5.938c.205.356.205.793 0 1.149l-3.43 5.938a1.147 1.147 0 0 1-.993.574H4.577c-.41 0-.789-.218-.994-.573L.153 8.66a1.153 1.153 0 0 1 0-1.147l3.43-5.94c.205-.356.584-.575.994-.575h6.858c.409 0 .788.22.993.576zM8.006 9.879c.988 0 1.792-.804 1.792-1.792s-.804-1.792-1.792-1.792-1.792.804-1.792 1.792.804 1.792 1.792 1.792zm0-4.784a2.993 2.993 0 1 1-.002 5.985 2.993 2.993 0 0 1 .002-5.985z'></path>
            </g>
          </svg>
        </div>
      );
    };

    /**
     * 左侧表格列宽度拖动
     *
     * @param {IData} column
     * @param {number} width
     */
    const onHeaderDragend = (index: number, width: number) => {
      // 此处的index是实际绘制列的index的顺序,所以需要先过滤一下才能找到对应的缓存列，参考上方172行
      const columnState = c.state.columnStates.filter((item: IColumnState) => {
        const columnModel = c.columns[item.key]?.model;
        return !item.hidden && columnModel;
      });
      if (columnState && columnState[index]) {
        columnState[index].columnWidth = width;
        c.saveColumnState();
      }
    };

    /**
     * 打开链接 popover
     *
     * @param {IGanttNodeData} item
     * @param {MouseEvent} evt
     * @return {*}
     */
    const openLinkPathPopover = async (
      row: IGanttNodeData,
      panelData: IData,
      evt: MouseEvent,
    ): Promise<void> => {
      const panel = findNodeLinkLayoutPanel(row._nodeId);
      if (linkOverlay || !panel) {
        return;
      }
      const appendTo =
        fullscreen && ganttRef.value?.getElementRefs().rootRef.value;
      const component = renderNodePanel(panel, panelData);
      linkOverlay = ibiz.overlay.createPopover(
        (modal: IModal): VNode => {
          return h(component, { modal });
        },
        undefined,
        {
          width: 'auto',
          height: 'auto',
          noArrow: true,
          autoClose: true,
          modalClass: ns.e('link-path-popover'),
          appendTo,
        },
      );
      linkOverlay?.present(evt.currentTarget as HTMLElement);

      await linkOverlay.onWillDismiss();
      linkOverlay = null;
    };

    /**
     * 处理点击链接线
     *
     * @param {IData} [_link]
     * @param {MouseEvent} [_event]
     */
    const handleClickLink = (_link?: IData, _event?: MouseEvent): void => {
      if (_link && _event) {
        const curLink = c.state.links.find(_item => _item._uuid === _link.id);
        if (curLink) {
          openLinkPathPopover(
            curLink._fromData as IGanttNodeData,
            curLink._deData,
            _event,
          );
        }
      }
    };

    return {
      c,
      ns,
      ganttRef,
      isInited,
      data,
      locale,
      columns,
      onCheck,
      loading,
      ganttStyle,
      onNodeClick,
      onNodeDbClick,
      onNodeExpand,
      onNodeCollapse,
      renderContent,
      renderSetting,
      onSliderMove,
      renderNoData,
      allowDrop,
      allowDrag,
      handleDrop,
      onHeaderDragend,
      handleClickLink,
      handleFullscreenChange,
    };
  },
  render() {
    if (!this.isInited) {
      return null;
    }
    return (
      <iBizControlBase
        controller={this.c}
        class={[this.ns.b(), !this.data?.length ? this.ns.m('empty') : '']}
        v-loading={this.loading}
      >
        <x-gantt
          ref='ganttRef'
          data-id='_id'
          data={this.data}
          links={this.c.state.links}
          row-height={46}
          expand-all={false}
          headerDrag={true}
          start-key='_beginDataItemValue'
          end-key='_endDataItemValue'
          children='_children'
          leaf='_leaf'
          expand-key='_defaultExpand'
          link-props={{
            fromKey: '_from',
            toKey: '_to',
            linkKey: '_uuid',
          }}
          locale={this.locale}
          unit={this.c.state.unit}
          draggable={{
            level: 'all',
            draggable: false,
            draggableStateKey: '_draggable',
          }}
          allow-drop={this.allowDrop}
          allow-drag={this.allowDrag}
          onNodeDrop={this.handleDrop}
          showCheckbox={!this.c.state.singleSelect}
          onNodeExpand={this.onNodeExpand}
          onNodeCollapse={this.onNodeCollapse}
          onRowClick={this.onNodeClick}
          onRowDblClick={this.onNodeDbClick}
          onRowChecked={this.onCheck}
          onHeaderDragend={this.onHeaderDragend}
          onMoveSlider={this.onSliderMove}
          onClickLink={this.handleClickLink}
          onFullscreenChange={this.handleFullscreenChange}
          primaryColor={this.ganttStyle.primaryColor}
          headerStyle={{
            textColor: this.ganttStyle.textColor,
            bgColor: this.ganttStyle.headerBgColor,
          }}
          borderColor={this.ganttStyle.borderColor}
          enableDateCompletion={true}
          bodyStyle={{
            todayColor: this.ganttStyle.todayColor,
            weekendColor: this.ganttStyle.headerBgColor,
            bgColor: this.ganttStyle.bgColor,
            selectColor: this.ganttStyle.headerBgColor,
          }}
        >
          {{
            default: () => {
              return this.renderContent();
            },
            empty: () => {
              return this.renderNoData();
            },
            setting: () => {
              return this.renderSetting();
            },
          }}
        </x-gantt>
      </iBizControlBase>
    );
  },
});
