/* eslint-disable no-nested-ternary */
import { PropType, computed, defineComponent } from 'vue';
import { useNamespace } from '@ibiz-template/vue3-util';
import { GridController, IColumnState } from '@ibiz-template/runtime';
import draggable from 'vuedraggable';
import { showTitle } from '@ibiz-template/core';
import './grid-setting.scss';

export const IBizGridSetting: ReturnType<typeof defineComponent> =
  defineComponent({
    name: 'IBizGridSetting',
    components: {
      draggable,
    },
    props: {
      columnStates: {
        type: Array as PropType<IColumnState[]>,
        required: true,
      },
      controller: {
        type: Object as PropType<GridController>,
        required: true,
      },
    },
    setup(props) {
      const ns = useNamespace('grid-setting');

      const c = props.controller;

      const dragColumnStates = computed(() => {
        const result: IColumnState[] = [];
        props.columnStates.forEach(item => {
          if (!item.uaColumn) {
            result.push({
              ...item,
            });
          }
        });
        return result;
      });

      // 是否允许拖动
      const isDraggable = computed(() => {
        return false;
      });

      // 点击后控制显隐
      const handleClick = (dragColumnState: IColumnState) => {
        const columnState = c.state.columnStates.find(state => {
          return state.key === dragColumnState.key;
        });
        if (columnState) {
          c.setColumnVisible(columnState);
        }
      };

      // 拖拽变化后
      const onDragChange = async (evt: IData) => {
        if (evt.moved) {
          const newIndex = evt.moved.newIndex;
          const oldIndex = evt.moved.oldIndex;
          const movedDragColumnState = evt.moved.element;
          c.changeColumnStateSort(movedDragColumnState.key, newIndex, oldIndex);
        }
      };

      return {
        ns,
        c,
        dragColumnStates,
        isDraggable,
        handleClick,
        onDragChange,
      };
    },
    render() {
      return (
        <div class={this.ns.b()}>
          <el-popover placement='right-start' trigger='click' width='auto'>
            {{
              reference: () => {
                return (
                  <ion-icon
                    name='options-outline'
                    class={this.ns.b('set-icon')}
                    title={showTitle(
                      ibiz.i18n.t('component.gridSetting.hideControl'),
                    )}
                  ></ion-icon>
                );
              },
              default: () => {
                return (
                  <draggable
                    class={this.ns.b('column-states')}
                    v-model={this.dragColumnStates}
                    group={this.c.model.id}
                    itemKey='key'
                    sort={this.isDraggable}
                    force-fallback={true}
                    delay={100}
                    animation={500}
                    ghost-class={this.ns.b('column-state-ghost')}
                    filter='.unmover'
                    onChange={(evt: IData) => this.onDragChange(evt)}
                  >
                    {{
                      item: ({ element: state }: { element: IColumnState }) => {
                        return (
                          <div
                            class={[
                              this.ns.b('column-state'),
                              this.ns.is('disabled', state.hidden),
                              this.ns.is('fixed', !!state.fixed),
                              !!state.fixed && 'unmover',
                            ]}
                            onClick={() => this.handleClick(state)}
                          >
                            {this.isDraggable && !state.fixed && (
                              <iBizIcon
                                class={this.ns.b('drag-icon')}
                                icon={{
                                  imagePath: 'svg/drag.svg',
                                }}
                                baseDir='iconfont'
                              />
                            )}
                            <iBizIcon
                              class={this.ns.b('disable-icon')}
                              icon={{
                                imagePath: 'svg/disable.svg',
                              }}
                              baseDir='iconfont'
                            />
                            <iBizIcon
                              class={this.ns.b('enable-icon')}
                              icon={{
                                imagePath: 'svg/enable.svg',
                              }}
                              baseDir='iconfont'
                            />
                            <div class={this.ns.b('state-caption')}>
                              {state.caption}
                            </div>
                          </div>
                        );
                      },
                    }}
                  </draggable>
                );
              },
            }}
          </el-popover>
          {this.c.state.enableNavView && this.c.state.showNavIcon ? (
            !this.c.state.showNavView ? (
              <ion-icon
                class={this.ns.e('nav-icon')}
                title={ibiz.i18n.t('component.controlNavigation.showNav')}
                name='eye-outline'
                onClick={() => this.c.onShowNavViewChange()}
              ></ion-icon>
            ) : (
              <ion-icon
                class={this.ns.e('nav-icon')}
                title={ibiz.i18n.t('component.controlNavigation.hiddenNav')}
                name='eye-off-outline'
                onClick={() => this.c.onShowNavViewChange()}
              ></ion-icon>
            )
          ) : null}
        </div>
      );
    },
  });
