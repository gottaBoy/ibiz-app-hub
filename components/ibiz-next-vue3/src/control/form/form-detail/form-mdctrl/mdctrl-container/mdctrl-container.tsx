import { PropType, computed, defineComponent } from 'vue';
import draggable from 'vuedraggable';
import { useNamespace } from '@ibiz-template/vue3-util';
import './mdctrl-container.scss';
import { showTitle } from '@ibiz-template/core';

export const MDCtrlContainer = defineComponent({
  name: 'IBizMDCtrlContainer',
  components: {
    draggable,
  },
  props: {
    enableCreate: {
      type: Boolean,
      required: true,
    },
    enableDelete: {
      type: Boolean,
      required: true,
    },
    items: {
      type: Object as PropType<IData[]>,
      required: true,
    },
    userStyle: {
      type: String,
    },
    enableSort: {
      type: Boolean,
      required: false,
    },
  },
  emits: {
    addClick: () => true,
    removeClick: (_data: IData, _index: number) => true,
    dragChange: (_draggedIndex: number, _targetIndex: number) => true,
  },
  setup(props, { emit, slots }) {
    const ns = useNamespace('mdctrl-container');

    // 拖拽按钮类名
    const dragClssName = ns.be('item', 'icon-drag');

    /** 是否显示操作按钮 */
    const showActions = computed(() => {
      return props.enableCreate || props.enableDelete;
    });

    /** 拖拽数据集 */
    const dragItems = computed(() => [...props.items]);

    // 拖拽结束
    const handleDragChange = (_params: IParams) => {
      const { moved } = _params;
      const draggedIndex = moved.oldIndex;
      const targetIndex = moved.newIndex;
      emit('dragChange', draggedIndex, targetIndex);
    };

    // 排序拖拽按钮
    const renderDragBtn = (): JSX.Element => {
      return (
        <div class={[dragClssName]}>
          {
            <svg
              viewBox='0 0 16 16'
              xmlns='http://www.w3.org/2000/svg'
              height='1em'
              width='1em'
              preserveAspectRatio='xMidYMid meet'
              focusable='false'
            >
              <g stroke-width='1' fill-rule='evenodd'>
                <g transform='translate(5 1)' fill-rule='nonzero'>
                  <path d='M1 2a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2zM1 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm-4 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm-4 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2z'></path>
                </g>
              </g>
            </svg>
          }
        </div>
      );
    };

    const renderAddBtn = (): JSX.Element => {
      return (
        <el-button
          class={[
            ns.be('item-actions', 'create'),
            ns.be('item-actions', 'btn'),
          ]}
          onClick={(): void => emit('addClick')}
        >
          {ibiz.i18n.t('app.add')}
        </el-button>
      );
    };

    const renderRemoveBtn = (item: IData, index: number) => {
      if (!props.enableDelete) return null;
      if (ibiz.config.form.mdCtrlConfirmBeforeRemove) {
        return (
          <el-popconfirm
            title={showTitle(
              ibiz.i18n.t('control.form.mdCtrlContainer.promptInformation'),
            )}
            confirm-button-text={ibiz.i18n.t('app.confirm')}
            cancel-button-text={ibiz.i18n.t('app.cancel')}
            onConfirm={() => emit('removeClick', item, index)}
          >
            {{
              reference: () => {
                return (
                  <el-button
                    type='danger'
                    class={[
                      ns.be('item-actions', 'remove'),
                      ns.be('item-actions', 'btn'),
                    ]}
                  >
                    {ibiz.i18n.t('app.delete')}
                  </el-button>
                );
              },
            }}
          </el-popconfirm>
        );
      }
      return (
        <el-button
          type='danger'
          class={[
            ns.be('item-actions', 'remove'),
            ns.be('item-actions', 'btn'),
          ]}
          onClick={() => emit('removeClick', item, index)}
        >
          {ibiz.i18n.t('app.delete')}
        </el-button>
      );
    };

    // 样式2添加按钮
    const renderStyle2AddBtn = () => {
      return (
        <el-button
          class={[
            ns.be('style2-item-actions', 'create'),
            ns.be('style2-item-actions', 'btn'),
          ]}
          title={ibiz.i18n.t('app.add')}
          onClick={(): void => emit('addClick')}
        >
          <ion-icon name='add-outline'></ion-icon>
          {ibiz.i18n.t('app.add')}
        </el-button>
      );
    };

    // 样式2删除按钮
    const renderStyle2RemoveBtn = (item: IData, index: number) => {
      if (!props.enableDelete) return null;
      if (ibiz.config.form.mdCtrlConfirmBeforeRemove) {
        return (
          <el-popconfirm
            title={showTitle(
              ibiz.i18n.t('control.form.mdCtrlContainer.promptInformation'),
            )}
            confirm-button-text={ibiz.i18n.t('app.confirm')}
            cancel-button-text={ibiz.i18n.t('app.cancel')}
            onConfirm={() => emit('removeClick', item, index)}
          >
            {{
              reference: () => {
                return (
                  <el-button
                    type='danger'
                    class={[
                      ns.be('style2-item-actions', 'remove'),
                      ns.be('style2-item-actions', 'btn'),
                    ]}
                    title={ibiz.i18n.t('app.delete')}
                  >
                    <ion-icon name='trash-outline'></ion-icon>
                  </el-button>
                );
              },
            }}
          </el-popconfirm>
        );
      }
      return (
        <el-button
          type='danger'
          class={[
            ns.be('item-actions', 'remove'),
            ns.be('item-actions', 'btn'),
          ]}
          onClick={() => emit('removeClick', item, index)}
        >
          {ibiz.i18n.t('app.delete')}
        </el-button>
      );
    };

    // 绘制默认项
    const renderDefaultItem = (item: IData, index: number) => {
      const formComponent = slots.item ? (
        slots.item({ data: item, index })
      ) : (
        <div>{ibiz.i18n.t('control.form.mdCtrlContainer.noSlot')}</div>
      );

      return (
        <div class={ns.b('item')}>
          <div class={ns.be('item', 'left')}>
            {props.enableSort && renderDragBtn()}
          </div>
          {formComponent}
          {renderRemoveBtn(item, index)}
          {props.enableCreate && (
            <div class={ns.be('item', 'right')}>
              {index === 0 && renderAddBtn()}
            </div>
          )}
        </div>
      );
    };

    return {
      ns,
      showActions,
      dragClssName,
      dragItems,
      renderDragBtn,
      renderAddBtn,
      renderDefaultItem,
      renderRemoveBtn,
      renderStyle2AddBtn,
      renderStyle2RemoveBtn,
      handleDragChange,
    };
  },
  render() {
    if (this.userStyle === 'STYLE2') {
      return (
        <div class={[this.ns.b(), this.ns.b('style2')]}>
          {this.items?.length ? (
            <div class={this.ns.e('item-container')}>
              {this.showActions &&
                this.enableCreate &&
                this.renderStyle2AddBtn()}
              {this.items.map((item, index) => {
                const formComponent = this.$slots.item ? (
                  this.$slots.item({ data: item, index })
                ) : (
                  <div>
                    {ibiz.i18n.t('control.form.mdCtrlContainer.noSlot')}
                  </div>
                );

                return (
                  <div class={this.ns.b('item')}>
                    {formComponent}
                    {this.showActions && (
                      <div class={this.ns.b('style2-item-actions')}>
                        {this.renderStyle2RemoveBtn(item, index)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div class={this.ns.b('no-data')}>
              {this.enableCreate && (
                <div class={this.ns.b('style2-item-actions')}>
                  {this.renderStyle2AddBtn()}
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    let defaultContent;
    if (this.items?.length) {
      defaultContent = this.enableSort ? (
        <draggable
          itemKey='id'
          ref='container'
          list={this.dragItems}
          class={[this.ns.e('drag')]}
          handle={`.${this.dragClssName}`}
          onChange={this.handleDragChange}
          chosenClass={this.ns.is('drag-chosen', true)}
        >
          {{
            item: ({ element, index }: { element: IData; index: number }) =>
              this.renderDefaultItem(element, index),
          }}
        </draggable>
      ) : (
        this.items.map((item, index) => this.renderDefaultItem(item, index))
      );
    }
    return (
      <div class={this.ns.b()}>
        {defaultContent || (
          <div class={this.ns.b('no-data')}>
            {this.enableCreate && (
              <div class={this.ns.b('item-actions')}>{this.renderAddBtn()}</div>
            )}
          </div>
        )}
      </div>
    );
  },
});
