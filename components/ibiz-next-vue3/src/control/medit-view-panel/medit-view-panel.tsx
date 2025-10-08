import { useControlController, useNamespace } from '@ibiz-template/vue3-util';
import {
  defineComponent,
  PropType,
  resolveComponent,
  h,
  ref,
  onMounted,
  Ref,
  onUnmounted,
} from 'vue';
import { IDEMultiEditViewPanel } from '@ibiz/model-core';
import {
  DataChangeEvent,
  EventBase,
  IPanelUiItem,
  MEditViewPanelController,
} from '@ibiz-template/runtime';
import './medit-view-panel.scss';

export const MEditViewPanelControl = defineComponent({
  name: 'IBizMEditViewPanelControl',
  props: {
    /**
     * @description 多编辑视图面板模型数据
     */
    modelData: {
      type: Object as PropType<IDEMultiEditViewPanel>,
      required: true,
    },
    /**
     * @description 应用上下文对象
     */
    context: { type: Object as PropType<IContext>, required: true },
    /**
     * @description 视图参数对象
     * @default {}
     */
    params: { type: Object as PropType<IParams>, default: () => ({}) },
  },
  setup() {
    const c = useControlController(
      (...args) => new MEditViewPanelController(...args),
    );
    const ns = useNamespace(`control-${c.model.controlType!.toLowerCase()}`);

    const panelContent: Ref<Element | null> = ref(null);

    const lastScrollHeight = ref(0);

    let mutationObserver: null | MutationObserver = null;

    const handleDelete = (item: IPanelUiItem) => {
      c.handleDelete(item);
    };

    /**
     * @description 切换分页
     * @param {string} name
     */
    const onTabChange = (name: string): void => {
      c.state.activeTab = name;
      c.onTabChange(name);
    };

    /**
     * @description 删除分页
     * @param {IPanelUiItem} item
     * @param {number} index
     * @param {MouseEvent} event
     */
    const handleTabDelete = (item: IPanelUiItem, event: MouseEvent) => {
      event.stopPropagation();
      c.handleDelete(item);
    };

    onMounted(() => {
      if (panelContent.value) {
        mutationObserver = new MutationObserver(() => {
          const scrollHeight = panelContent.value!.scrollHeight;
          if (scrollHeight !== lastScrollHeight.value) {
            // 滚动高度变化了
            if (c.state.isNeedScroll) {
              lastScrollHeight.value = scrollHeight;
              panelContent.value!.scrollTop = scrollHeight;
            }
          }
        });
        mutationObserver.observe(panelContent.value!, {
          childList: true, // 子节点的变动（新增、删除或者更改）
          attributes: true, // 属性的变动
          characterData: true, // 节点内容或节点文本的变动
          subtree: true, // 是否将观察器应用于该节点的所有后代节点
        });
      }
    });

    onUnmounted(() => {
      if (mutationObserver) {
        mutationObserver.disconnect();
      }
    });

    return {
      c,
      ns,
      panelContent,
      handleDelete,
      onTabChange,
      handleTabDelete,
    };
  },
  render() {
    const viewShell = resolveComponent('IBizViewShell');

    const renderTabTop = () => {
      return (
        <el-tabs
          class={this.ns.b('tabs')}
          addable={true}
          v-model={this.c.state.activeTab}
          onTabChange={this.onTabChange}
          onTabAdd={() => this.c.handleAdd()}
        >
          {{
            addIcon: () => {
              return (
                <el-button>
                  <ion-icon name='add'></ion-icon>
                  {ibiz.i18n.t('app.add')}
                </el-button>
              );
            },
            default: () => {
              return this.c.state.panelUiItems.map(item => {
                return (
                  <el-tab-pane key={item.id + item.srfmajortext} name={item.id}>
                    {{
                      label: () => {
                        return (
                          <div class={this.ns.b('tab-label')}>
                            <span>{item.srfmajortext}</span>
                            <ion-icon
                              name='close-outline'
                              onClick={(event: MouseEvent) =>
                                this.handleTabDelete(item, event)
                              }
                            ></ion-icon>
                          </div>
                        );
                      },
                      default: () => {
                        return (
                          this.c.state.activeTab === item.id &&
                          h(viewShell, {
                            context: item.context,
                            params: item.params,
                            viewId: this.c.model.embeddedAppViewId,
                            onDataChange: (args: DataChangeEvent) =>
                              this.c.onViewDataChange(args, item.id),
                            onCreated: (event: EventBase) =>
                              this.c.onViewCreated(event, item.id),
                          })
                        );
                      },
                    }}
                  </el-tab-pane>
                );
              });
            },
          }}
        </el-tabs>
      );
    };

    const renderRow = () => {
      return this.c.state.panelUiItems.map(item => {
        return (
          <div class={this.ns.b('item')} key={item.id}>
            {[
              h(viewShell, {
                context: item.context,
                params: item.params,
                viewId: this.c.model.embeddedAppViewId,
                onDataChange: (args: DataChangeEvent) =>
                  this.c.onViewDataChange(args, item.id),
                onCreated: (event: EventBase) =>
                  this.c.onViewCreated(event, item.id),
              }),
              <div class={this.ns.b('close')}>
                <ion-icon
                  name='close-outline'
                  onClick={() => this.handleDelete(item)}
                ></ion-icon>
              </div>,
            ]}
          </div>
        );
      });
    };

    const renderContent = () => {
      if (!this.c.model.embeddedAppViewId) {
        return;
      }
      if (Object.is(this.c.model.panelStyle, 'TAB_TOP')) {
        return renderTabTop();
      }
      return renderRow();
    };

    return (
      <iBizControlBase controller={this.c}>
        <div class={this.ns.b('content')} ref='panelContent'>
          {this.c.state.panelUiItems.length > 0 ? renderContent() : null}
        </div>
      </iBizControlBase>
    );
  },
});
