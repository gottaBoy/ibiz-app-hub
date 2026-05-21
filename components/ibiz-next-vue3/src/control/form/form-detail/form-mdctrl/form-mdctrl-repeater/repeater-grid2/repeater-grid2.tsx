import {
  h,
  ref,
  toRaw,
  watch,
  reactive,
  onUnmounted,
  defineComponent,
  resolveComponent,
  VNodeArrayChildren,
} from 'vue';
import Sortable from 'sortablejs';
import {
  EventBase,
  ControlVO,
  EditFormController,
  IEditFormController,
  FormMDCtrlRepeaterController,
} from '@ibiz-template/runtime';
import { createUUID } from 'qx-util';
import { useCtx, useNamespace } from '@ibiz-template/vue3-util';
import { recursiveIterate } from '@ibiz-template/core';
import { IDEFormDetail, IDEFormItem } from '@ibiz/model-core';
import { useLoadMore } from '../form-mdctrl-repeater.util';
import './repeater-grid2.scss';

export const RepeaterGrid2: ReturnType<typeof defineComponent> =
  defineComponent({
    name: 'IBizRepeaterGrid2',
    props: {
      controller: {
        type: FormMDCtrlRepeaterController,
        required: true,
      },
    },
    emits: {
      change: (_value: IData[]) => true,
    },
    setup(props, { emit }) {
      const ns = useNamespace('repeater-grid2');
      const formItems: IDEFormItem[] = [];
      const tableRef = ref();
      const tableKey = ref(createUUID());
      const chunkSize = props.controller.model.ctrlParams?.chunkSize
        ? Number(props.controller.model.ctrlParams?.chunkSize)
        : 100;
      const { renderItems, loadMore, updateTotalItems } = useLoadMore(
        props.controller.value as IData[],
        chunkSize,
      );
      // 遍历所有的项，如果有逻辑的话加入
      recursiveIterate(
        props.controller.repeatedForm,
        (item: IDEFormDetail) => {
          if (item.detailType === 'FORMITEM') {
            // 隐藏表单项不绘制
            if ((item as IDEFormItem).editor?.editorType !== 'HIDDEN') {
              formItems.push(item);
            }
          }
        },
        {
          childrenFields: ['deformPages', 'deformTabPages', 'deformDetails'],
        },
      );

      const onSingleValueChange = (value: IData, index: number) => {
        const arrData = [...((props.controller.value || []) as IData[])];
        arrData[index] = value;
        emit('change', arrData);
      };

      const ctx = useCtx();
      const formControllers = reactive<IEditFormController[]>([]);
      const addFormController = async (data: IData = {}) => {
        const formC = new EditFormController(
          props.controller.repeatedForm,
          props.controller.context,
          props.controller.params,
          ctx,
        );
        formC.state.isSimple = true;
        await formC.created();
        formC.setSimpleData(data);
        formControllers.push(formC);
        props.controller.setRepeaterController(
          `${formControllers.length - 1}`,
          formC,
        );
        formC.evt.on('onFormDataChange', (event: EventBase) => {
          // 隔离抛出不一样的对象
          const item = event.data[0];
          const formData =
            item instanceof ControlVO ? item.clone() : { ...item };
          const index = formControllers.indexOf(formC);
          onSingleValueChange(formData, index);
        });
      };

      watch(
        () => props.controller.value as IData[] | null,
        newVal => {
          if (newVal && newVal.length > 0) {
            newVal.forEach((item, index) => {
              const formC = formControllers[index] as EditFormController;
              if (formC) {
                const changeVal = item || {};
                // 找有没有不一致的属性
                const find = Object.keys(formC.data).find(key => {
                  return changeVal[key] !== formC.data[key];
                });
                // 内外部数据不一致时，只能是外部修改了，这是更新数据并重走load
                if (find) {
                  formC.setSimpleData(changeVal);
                }
              } else {
                addFormController(item);
              }
            });
          }
          updateTotalItems(newVal || []);
        },
        { immediate: true, deep: true },
      );

      let sortable: Sortable | undefined;

      const rowDrop = () => {
        const wrapper = tableRef.value?.$el?.querySelector(
          '.el-table__body-wrapper tbody',
        );
        if (!wrapper || !props.controller.enableSort) return;
        sortable = Sortable.create(wrapper, {
          animation: 150,
          handle: `.${ns.e('drag-icon')}`,
          ghostClass: `${ns.e('sortable-ghost')}`,
          onEnd({ newIndex, oldIndex }) {
            props.controller.dragChange(oldIndex!, newIndex!);
            tableKey.value = createUUID();
          },
        });
      };

      watch(
        () => tableRef.value,
        () => {
          if (!props.controller.enableSort) return;
          // eslint-disable-next-line no-unused-expressions
          tableRef.value ? rowDrop() : sortable?.destroy();
        },
      );

      onUnmounted(() => sortable?.destroy());

      const renderRemoveBtn = (index: number) => {
        if (ibiz.config.form.mdCtrlConfirmBeforeRemove) {
          return (
            <el-popconfirm
              title={ibiz.i18n.t('control.form.repeaterGrid.promptInformation')}
              confirm-button-text={ibiz.i18n.t('app.confirm')}
              cancel-button-text={ibiz.i18n.t('app.cancel')}
              onConfirm={() => {
                props.controller.remove(index);
                formControllers.splice(index, 1);
              }}
            >
              {{
                reference: () => {
                  return (
                    <ion-icon
                      name='remove-outline'
                      title={ibiz.i18n.t('app.delete')}
                      class={ns.b('remove-btn')}
                    ></ion-icon>
                  );
                },
              }}
            </el-popconfirm>
          );
        }
        return (
          <ion-icon
            name='remove-outline'
            title={ibiz.i18n.t('app.delete')}
            class={ns.b('remove-btn')}
            onClick={() => {
              props.controller.remove(index);
              formControllers.splice(index, 1);
            }}
          ></ion-icon>
        );
      };

      return {
        ns,
        tableRef,
        tableKey,
        formItems,
        renderItems,
        formControllers,
        renderRemoveBtn,
        loadMore,
      };
    },
    render() {
      const tableHeight = this.controller.model.layoutPos?.height;
      const heightObject = tableHeight ? { height: tableHeight } : {};
      const isEmpty = this.renderItems.length === 0;
      return (
        <div class={this.ns.b()}>
          <el-table
            ref='tableRef'
            key={this.tableKey}
            show-header={true}
            class={this.ns.e('table')}
            data={
              isEmpty && this.controller.enableCreate ? [{}] : this.renderItems
            }
            cell-class-name={({ columnIndex }: IData) => {
              const shouldShowIndex = this.controller.enableSort
                ? columnIndex === 1
                : columnIndex === 0;
              return shouldShowIndex ? this.ns.b('index') : '';
            }}
            {...heightObject}
          >
            {{
              default: (): VNodeArrayChildren => {
                return [
                  this.controller.enableSort && (
                    <el-table-column width={26} type='default'>
                      {{
                        default: () => {
                          if (isEmpty) {
                            return '';
                          }
                          return (
                            <svg
                              viewBox='0 0 16 16'
                              xmlns='http://www.w3.org/2000/svg'
                              height='1em'
                              width='1em'
                              class={this.ns.e('drag-icon')}
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
                          );
                        },
                      }}
                    </el-table-column>
                  ),
                  <el-table-column type='index' width={66} align='center'>
                    {{
                      default: (opts: IData) => {
                        if (isEmpty) {
                          return '';
                        }
                        const { $index } = opts;
                        return <span>{$index + 1}</span>;
                      },
                    }}
                  </el-table-column>,
                  this.formItems.length > 0 &&
                    this.formItems.map(item => {
                      // 重复器表格列自适应（表单项label宽度配置为1）
                      const width = item.labelWidth;
                      let widthName = 'width';
                      let columnWidth = '';
                      if (typeof width === 'number') {
                        if (width === 1) {
                          widthName = 'min-width';
                        }
                        columnWidth = `${width}px`;
                      }
                      return (
                        <el-table-column
                          label={item.caption}
                          prop={item.id}
                          {...{ [widthName]: columnWidth }}
                          align='center'
                        >
                          {{
                            default: (opts: IData) => {
                              if (isEmpty) {
                                return '';
                              }
                              const { $index } = opts;
                              const formC = toRaw(
                                this.formControllers[$index],
                              ) as EditFormController;
                              if (!formC || !formC.state.isLoaded) {
                                return (
                                  <div>
                                    {ibiz.i18n.t(
                                      'control.form.repeaterGrid.absentOrLoad',
                                    )}
                                  </div>
                                );
                              }
                              const formItemC = formC.formItems.find(
                                x => x.name === item.id,
                              )!;

                              let editor = null;
                              if (!formItemC.editorProvider) {
                                editor = (
                                  <not-supported-editor
                                    modelData={item.editor}
                                  />
                                );
                              } else {
                                const component = resolveComponent(
                                  formItemC.editorProvider.formEditor,
                                );
                                editor = h(component, {
                                  value: formItemC.value,
                                  data: formItemC.data,
                                  controller: formItemC.editor,
                                  disabled: formItemC.state.disabled,
                                  readonly: formItemC.state.readonly,
                                  onChange: (
                                    val: unknown,
                                    name?: string,
                                  ): void => {
                                    formItemC.setDataValue(val, name);
                                  },
                                });
                              }

                              return (
                                <iBizGridEditItem
                                  error={formItemC.state.error}
                                  required={formItemC.state.required}
                                >
                                  {editor}
                                </iBizGridEditItem>
                              );
                            },
                          }}
                        </el-table-column>
                      );
                    }),
                  (this.controller.enableCreate ||
                    this.controller.enableDelete) && (
                    <el-table-column width={80} align='center'>
                      {{
                        default: (opts: IData) => {
                          const { $index } = opts;
                          return (
                            <div class={this.ns.b('action-group')}>
                              {this.controller.enableCreate && (
                                <ion-icon
                                  name='add-outline'
                                  title={ibiz.i18n.t('app.add')}
                                  class={this.ns.b('add-btn')}
                                  onClick={() => {
                                    this.controller.create(
                                      isEmpty ? 0 : $index + 1,
                                    );
                                  }}
                                ></ion-icon>
                              )}
                              {this.controller.enableDelete &&
                                !isEmpty &&
                                this.renderRemoveBtn($index)}
                            </div>
                          );
                        },
                      }}
                    </el-table-column>
                  ),
                ];
              },
              append: () => {
                return [
                  tableHeight && (
                    <div
                      v-infinite-scroll={() => this.loadMore()}
                      infinite-scroll-distance={20}
                    ></div>
                  ),
                ];
              },
            }}
          </el-table>
        </div>
      );
    },
  });
