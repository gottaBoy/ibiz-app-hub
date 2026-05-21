import {
  ref,
  reactive,
  PropType,
  defineComponent,
  getCurrentInstance,
  onMounted,
  onUnmounted,
} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { IPanelRawItem } from '@ibiz/model-core';
import {
  IShortCutData,
  OpenAppViewCommand,
  PanelItemController,
} from '@ibiz-template/runtime';
import {
  IRoutePathNode,
  route2routePath,
  useNamespace,
} from '@ibiz-template/vue3-util';
import draggable from 'vuedraggable';
import { IBizContext, showTitle } from '@ibiz-template/core';
import './short-cut.scss';

/**
 * 快捷操作
 * @primary
 * @description 用于显示视图最小化后的视图信息，点击后可快速打开，需配置预定义类型为SHORTCUT。
 */
export const ShortCut = defineComponent({
  name: 'IBizShortCut',
  components: {
    draggable,
  },
  props: {
    /**
     * @description 快捷操作组件模型数据
     */
    modelData: {
      type: Object as PropType<IPanelRawItem>,
      required: true,
    },
    /**
     * @description 快捷操作组件控制器
     */
    controller: {
      type: PanelItemController,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('short-cut');
    const vue = getCurrentInstance()!.proxy!;
    const router = useRouter();

    const route = useRoute();

    const shortCutUtil = ibiz.util.shortCut;

    /**
     * 是否显示快捷操作栏
     */
    const isShowToolbar = ref(true);

    /**
     * 显示更多
     */
    const isShowMore = ref(false);

    /**
     * 快捷操作数据
     */
    const data = reactive(shortCutUtil.data);

    /**
     * 拖拽缓存（用于垂直区和水平区之间的拖拽）
     */
    const dragCache: { newIndex: number; oldIndex: number } = {
      newIndex: 0,
      oldIndex: 0,
    };

    /**
     * 打开方式映射
     */
    const openModeMap: Map<string, string> = new Map([
      ['ROUTE_MODAL', 'INDEXVIEWTAB_POPUPMODAL'],
      ['MODAL', 'POPUPMODAL'],
      ['DRAWER', 'DRAWER_RIGHT'],
    ]);

    /**
     * 监听快捷方式数据改变
     *
     * @param {IShortCut[]} items
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    const onShortCutChange = (items: IShortCutData[]) => {
      if (data.length === 0 && isShowMore.value) {
        isShowMore.value = false;
      }
      vue.$forceUpdate();
    };

    onMounted(() => {
      isShowToolbar.value = shortCutUtil.mode !== 'vertical';
      ibiz.util.shortCut.onChange(onShortCutChange);
    });

    onUnmounted(() => {
      ibiz.util.shortCut.offChange(onShortCutChange);
    });

    /**
     * 快捷操作栏显示改变
     */
    const onShowChange = () => {
      isShowToolbar.value = !isShowToolbar.value;
      if (isShowToolbar.value) {
        isShowMore.value = false;
        shortCutUtil.setShortCutMode('horizontal');
      } else {
        shortCutUtil.setShortCutMode('vertical');
      }
    };

    /**
     * 处理路由上下文，当前路由中存在但快捷方式中不存在的上下文键设置为null,用于排除当前路由参数对快捷打开界面影响
     *
     * @param {IShortCutData} item - 快捷方式数据项
     * @returns {IBizContext} 处理后的上下文对象
     */
    const processRouteContext = (item: IShortCutData): IBizContext => {
      const tempContext = IBizContext.create(item.context);
      const { pathNodes } = route2routePath(route);
      if (pathNodes && pathNodes.length > 0) {
        let srfKeepNull: boolean = false;
        pathNodes.forEach((pathNode: IRoutePathNode) => {
          if (pathNode.context && Object.keys(pathNode.context).length > 0) {
            Object.keys(pathNode.context).forEach(key => {
              // 当前路由上下文中有，但快捷方式存储的上下文中没有的，需设置为null，排除前面路由参数对当前快捷打开界面的影响
              if (!tempContext[key]) {
                tempContext[key] = null;
                srfKeepNull = true;
              }
            });
          }
        });
        if (srfKeepNull) {
          tempContext.srfkeepnull = true;
        }
      }
      return tempContext;
    };

    /**
     * 快捷方式点击
     * @param item
     */
    const onClick = (item: IShortCutData) => {
      isShowMore.value = false;
      if (item.openMode === 'ROUTE') {
        const fullPath = item.fullPath.substring(1);
        // 当前路径和目标路径不一样时push
        if (router.currentRoute.value.fullPath !== fullPath) {
          router.push({ path: item.fullPath.substring(1) });
        }
      } else {
        const tempContext = processRouteContext(item);
        ibiz.commands.execute(
          OpenAppViewCommand.TAG,
          item.appViewId,
          tempContext,
          item.params,
          { openMode: openModeMap.get(item.openMode) },
        );
      }
    };

    /**
     * 拖拽改变
     * @param evt
     */
    const onChange = (evt: IData) => {
      if (evt.moved) {
        ibiz.util.shortCut.changeIndex(evt.moved.newIndex, evt.moved.oldIndex);
      } else if (evt.added) {
        // 两个区域拖拽时先发生 added -> removed
        dragCache.newIndex = evt.added.newIndex;
      } else if (evt.removed) {
        dragCache.oldIndex = evt.removed.oldIndex;
        ibiz.util.shortCut.changeIndex(dragCache.newIndex, dragCache.oldIndex);
      }
    };

    /**
     * 删除
     * @param event
     * @param key
     */
    const onDelete = (event: MouseEvent, key: string) => {
      event.stopPropagation();
      ibiz.util.shortCut.removeShortCut(key);
    };

    /**
     * 绘制拖拽区
     * @param isVertical 是否为垂直
     * @returns
     */
    const renderDraggable = (isVertical: boolean) => {
      return (
        <draggable
          itemKey='key'
          class={[
            ns.e('draggable'),
            ns.is('horizontal', !isVertical),
            ns.is('vertical', isVertical),
          ]}
          modelValue={data}
          group={props.controller.model.id}
          onChange={(evt: IData) => onChange(evt)}
        >
          {{
            item: ({
              element,
              index,
            }: {
              element: IShortCutData;
              index: number;
            }) => {
              if (
                (isVertical && !isShowToolbar.value) ||
                (isVertical && isShowToolbar.value && index > 5) ||
                (!isVertical && index < 6)
              ) {
                return (
                  <div
                    class={[ns.e('item'), ns.e('draggable-item')]}
                    title={showTitle(element.caption)}
                    onClick={() => onClick(element)}
                  >
                    <svg
                      viewBox='0 0 16 16'
                      class={['drag-icon', 'icon']}
                      xmlns='http://www.w3.org/2000/svg'
                      height='16px'
                      width='16px'
                      focusable='false'
                    >
                      <g
                        id='drag-icon/drag--'
                        stroke-width='1'
                        fill-rule='evenodd'
                      >
                        <g
                          id='drag-icon'
                          transform='translate(5 1)'
                          fill-rule='nonzero'
                        >
                          <path
                            d='M1 2a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2zM1 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm-4 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm-4 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2z'
                            id='drag-icon-air'
                          ></path>
                        </g>
                      </g>
                    </svg>
                    {element.icon ? (
                      <iBizIcon
                        class={['caption-icon', 'icon']}
                        icon={element.icon}
                      />
                    ) : (
                      <ion-icon
                        class={['caption-icon', 'icon']}
                        name='ellipsis-horizontal-circle-outline'
                      />
                    )}
                    <div class={ns.em('item', 'caption')}>
                      {element.caption}
                    </div>
                    <ion-icon
                      name='close-outline'
                      class={['close-icon', 'icon']}
                      onClick={(event: MouseEvent) =>
                        onDelete(event, element.key)
                      }
                    />
                  </div>
                );
              }
            },
          }}
        </draggable>
      );
    };

    /**
     * 绘制行为项
     *
     * @return {*}
     */
    const renderAction = () => {
      return (
        <div
          class={[
            ns.e('item'),
            ns.e('action-item'),
            ns.is('hidden', isShowToolbar.value),
          ]}
          onClick={onShowChange}
        >
          <ion-icon
            class={['expand-icon', 'icon']}
            name='chevron-back-outline'
          />
          <div class={ns.em('item', 'caption')}>
            {ibiz.i18n.t('panelComponent.shortCut.expandToolbar')}
          </div>
        </div>
      );
    };

    /**
     * 绘制更多工具栏
     * @returns
     */
    const renderMore = () => {
      return (
        <el-popover
          v-model:visible={isShowMore.value}
          placement='top-start'
          trigger='click'
          width='auto'
          popper-class={ns.e('popover')}
        >
          {{
            reference: () => {
              return (
                <div class={[ns.e('more'), ns.e('operate')]}>
                  <el-tooltip content={ibiz.i18n.t('app.more')} placement='top'>
                    <div>
                      <span class={ns.em('more', 'caption')}>
                        {isShowToolbar.value ? `6/${data.length}` : data.length}
                      </span>
                      <i
                        class={[
                          'fa',
                          'icon',
                          'more-icon',
                          isShowMore.value
                            ? 'fa-angle-double-down'
                            : 'fa-angle-double-up',
                        ]}
                        aria-hidden='true'
                      />
                    </div>
                  </el-tooltip>
                </div>
              );
            },
            default: () => {
              return [renderDraggable(true), renderAction()];
            },
          }}
        </el-popover>
      );
    };

    /**
     * 绘制收起
     *
     */
    const renderRecover = () => {
      return (
        <div class={[ns.e('recover'), ns.e('operate')]} onClick={onShowChange}>
          <el-tooltip
            effect='dark'
            content={ibiz.i18n.t('app.retract')}
            placement='top'
          >
            <ion-icon
              class={['recover-icon', 'icon']}
              name='chevron-forward-outline'
            />
          </el-tooltip>
        </div>
      );
    };

    return {
      ns,
      data,
      isShowToolbar,
      onChange,
      renderDraggable,
      renderMore,
      renderRecover,
    };
  },

  render() {
    return (
      <div
        class={[
          this.ns.b(),
          ...this.controller.containerClass,
          this.ns.is('conceal', this.data.length === 0),
        ]}
      >
        {this.isShowToolbar && this.renderDraggable(false)}
        {(!this.isShowToolbar || this.data.length > 6) && this.renderMore()}
        {this.isShowToolbar && this.renderRecover()}
      </div>
    );
  },
});
