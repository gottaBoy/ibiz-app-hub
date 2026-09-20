/* eslint-disable no-param-reassign */
import {
  PropType,
  defineComponent,
  h,
  ref,
  resolveComponent,
  watch,
} from 'vue';
import { createUUID } from 'qx-util';
import {
  IEditorContainerController,
  IFilterNodeField,
  IFilterNodeGroup,
  ValueOP,
  getEditorProvider,
} from '@ibiz-template/runtime';
import { IFilterCondition, ISchemaField } from '../../../interface';
import { ExcludeOPs, FilterModes, getEditor } from '../../../util';
import { useNamespace } from '../../../use';
import './filter-condition.scss';
import { biReportT } from '../../../locale';

export default defineComponent({
  name: 'BIFilterCondition',
  props: {
    value: {
      type: Object as PropType<IFilterNodeGroup>,
    },
    schemaFields: {
      type: Array as PropType<ISchemaField[]>,
      default: () => [],
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    context: {
      type: Object as PropType<IContext>,
      required: true,
    },
    params: {
      type: Object as PropType<IParams>,
      required: true,
    },
    borderMode: {
      type: String as PropType<'DEFAULT' | 'BORDER'>,
      default: 'DEFAULT',
    },
  },
  emits: {
    change: (_value: IFilterNodeGroup | null) => true,
  },
  setup(props, { emit }) {
    const ns = useNamespace('bi-filter-condition');

    // 条件项
    const items = ref<IFilterCondition[]>([]);

    // 逻辑连接符项
    const connectionItems = ref<{ text: string; value: string }[]>([
      {
        get text() {
          return biReportT('and');
        },
        value: 'AND',
      },
      {
        get text() {
          return biReportT('or');
        },
        value: 'OR',
      },
    ]);

    // 过滤操作模式映射
    const filterModeMap = new Map<string, { readonly label: string }>();

    FilterModes.forEach(mode => filterModeMap.set(mode.valueOP, mode));

    // jsonSchema属性字段映射
    const schemaFieldMap = ref<Map<string, ISchemaField>>(new Map());

    watch(
      () => props.schemaFields,
      () => {
        schemaFieldMap.value = new Map();
        props.schemaFields.forEach(item => {
          schemaFieldMap.value.set(item.appDEFieldId, item);
        });
      },
      {
        immediate: true,
      },
    );

    // 初始化项编辑器
    const initItemEditor = async (item: IFilterCondition) => {
      item.editorProvider = undefined;
      item.editor = undefined;
      const field = schemaFieldMap.value.get(item.field);
      if (!field) {
        return;
      }
      const editorModel = getEditor(field);
      const editorProvider = await getEditorProvider(editorModel);
      if (editorProvider) {
        item.editorProvider = editorProvider;
        const editor = await editorProvider.createController(editorModel, {
          context: props.context,
          params: props.params,
        } as IEditorContainerController);
        item.editor = editor;
      }
    };

    watch(
      () => props.value,
      async () => {
        if (!props.value) {
          items.value = [];
          return;
        }
        const children = props.value.children as IFilterNodeField[];
        if (Array.isArray(children) && children.length) {
          const connection = props.value.logicType || '';
          items.value = await Promise.all(
            children.map(async condition => {
              const field = condition.field || '';
              const valueOP = condition.valueOP || '';
              const value = condition.value;
              const item: IFilterCondition = {
                key: createUUID(),
                connection,
                field,
                valueOP,
                value,
              };
              await initItemEditor(item);
              return item;
            }),
          );
          return;
        }
        items.value = [];
      },
      {
        immediate: true,
      },
    );

    // 处理值变更
    const handleValueChange = () => {
      if (!items.value.length) {
        emit('change', null);
        return;
      }
      const children: IFilterNodeField[] = [];
      items.value.forEach(item => {
        children.push({
          nodeType: 'FIELD',
          field: item.field,
          valueOP: item.valueOP as ValueOP,
          value: item.value,
        });
      });
      const value: IFilterNodeGroup = {
        nodeType: 'GROUP',
        logicType: (items.value[0]?.connection || 'AND') as 'AND' | 'OR',
        children,
      };
      emit('change', value);
    };

    // 处理项添加
    const handleAdd = async () => {
      if (props.disabled) {
        return;
      }
      const group = items.value[0];
      const field = props.schemaFields[0]?.appDEFieldId || '';
      const valueOP = schemaFieldMap.value.get(field)?.valueOPs?.[0] || '';
      const item: IFilterCondition = {
        key: createUUID(),
        connection: group?.connection || 'AND',
        field,
        valueOP,
      };
      await initItemEditor(item);
      items.value.push(item);
      handleValueChange();
    };

    // 处理项删除
    const handleRemove = (index: number) => {
      if (props.disabled) {
        return;
      }
      items.value.splice(index, 1);
      handleValueChange();
    };

    // 渲染编辑器
    const renderEditor = (item: IFilterCondition) => {
      if (!item.valueOP || ExcludeOPs.includes(item.valueOP)) {
        return null;
      }
      if (item.editorProvider && item.editor) {
        const component = resolveComponent(item.editorProvider.formEditor);
        return h(component, {
          value: item.value,
          controller: item.editor,
          disabled: props.disabled,
          onChange: (val: unknown) => {
            item.value = val;
            handleValueChange();
          },
        });
      }
    };

    // 处理逻辑连接符变更
    const handleConnectionChange = (item: IFilterCondition) => {
      items.value.forEach(item2 => {
        item2.connection = item.connection;
      });
      handleValueChange();
    };

    // 处理属性字段变更
    const handleFieldChange = async (item: IFilterCondition) => {
      const field = schemaFieldMap.value.get(item.field);
      item.valueOP = field?.valueOPs?.[0] || '';
      item.value = undefined;
      await initItemEditor(item);
      handleValueChange();
    };

    // 处理操作符变更
    const handleValueOPChange = (item: IFilterCondition) => {
      item.value = undefined;
      handleValueChange();
    };

    return {
      ns,
      items,
      connectionItems,
      filterModeMap,
      schemaFieldMap,
      handleAdd,
      handleRemove,
      renderEditor,
      handleConnectionChange,
      handleFieldChange,
      handleValueOPChange,
    };
  },
  render() {
    return (
      <div class={[this.ns.b(), this.disabled && this.ns.m('disabled')]}>
        {this.borderMode === 'BORDER' && (
          <div class={this.ns.e('filter-number')}>
            {biReportT('conditionCount', { count: this.items.length })}
          </div>
        )}
        <div
          class={[
            this.ns.b('content'),
            this.ns.is('border-mode', this.borderMode === 'BORDER'),
          ]}
        >
          {this.items.map((item, i) => {
            return (
              <div class={this.ns.b('item')}>
                <div
                  class={[
                    this.ns.be('item', 'connection'),
                    i === 0 && this.ns.bem('item', 'connection', 'init'),
                  ]}
                >
                  {i === 0 ? (
                    <div>{biReportT('conditionWhen')}</div>
                  ) : (
                    <el-select
                      v-model={item.connection}
                      disabled={i > 1 || this.disabled}
                      onChange={() => {
                        this.handleConnectionChange(item);
                      }}
                    >
                      {this.connectionItems.map(connectionItem => {
                        return (
                          <el-option
                            key={connectionItem.value}
                            value={connectionItem.value}
                            label={connectionItem.text}
                          />
                        );
                      })}
                    </el-select>
                  )}
                </div>
                <div class={this.ns.b('item-content')}>
                  <div class={this.ns.be('item', 'field')}>
                    <el-select
                      v-model={item.field}
                      disabled={this.disabled}
                      onChange={() => {
                        this.handleFieldChange(item);
                      }}
                    >
                      {this.schemaFields.map(field => {
                        return (
                          <el-option
                            key={field.appDEFieldId}
                            value={field.appDEFieldId}
                            label={field.caption}
                          />
                        );
                      })}
                    </el-select>
                  </div>
                  <div class={this.ns.be('item', 'valueOP')}>
                    <el-select
                      v-model={item.valueOP}
                      disabled={this.disabled}
                      onChange={() => {
                        this.handleValueOPChange(item);
                      }}
                    >
                      {this.schemaFieldMap
                        .get(item.field)
                        ?.valueOPs?.map(op => {
                          return (
                            <el-option
                              key={op}
                              value={op}
                              label={this.filterModeMap.get(op)?.label || op}
                            />
                          );
                        })}
                    </el-select>
                  </div>
                  <div class={this.ns.be('item', 'editor')}>
                    {this.renderEditor(item)}
                  </div>
                </div>
                <div
                  class={this.ns.be('item', 'btn')}
                  title={biReportT('delete')}
                  onClick={e => {
                    e.stopPropagation();
                    this.handleRemove(i);
                  }}
                >
                  <svg
                    viewBox='0 0 16 16'
                    xmlns='http://www.w3.org/2000/svg'
                    height='1em'
                    width='1em'
                    preserveAspectRatio='xMidYMid meet'
                    focusable='false'
                  >
                    <g stroke-width='1' fill-rule='evenodd'>
                      <path d='M4.002 3.403V1a1 1 0 0 1 1-1h6.003a1 1 0 0 1 1 1v2.403h3.396a.6.6 0 1 1 0 1.2h-1.395V15a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4.603H.6a.6.6 0 1 1 0-1.2h3.4zm8.804 1.205H3.2V14.8h9.605V4.608zM5.202 1.2v2.155h5.603V1.2H5.202zm.6 6.417a.6.6 0 0 1 1.201 0v4.758a.6.6 0 0 1-1.2 0V7.617zm3.202 0a.6.6 0 0 1 1.2 0v4.758a.6.6 0 0 1-1.2 0V7.617z'></path>
                    </g>
                  </svg>
                </div>
              </div>
            );
          })}
        </div>

        <div
          class={[
            this.ns.b('footer'),
            this.ns.is('border-mode', this.borderMode === 'BORDER'),
          ]}
        >
          <div class={this.ns.b('footer-btn')} onClick={this.handleAdd}>
            <svg
              class={this.ns.be('footer-btn', 'icon')}
              viewBox='0 0 16 16'
              xmlns='http://www.w3.org/2000/svg'
              height='1em'
              width='1em'
              preserveAspectRatio='xMidYMid meet'
              focusable='false'
            >
              <g stroke-width='1' fill-rule='evenodd'>
                <path d='M8.578 7.383V1.602a.601.601 0 1 0-1.2 0v5.781H1.6a.601.601 0 0 0 0 1.203h5.777v5.812a.601.601 0 1 0 1.2 0V8.586H14.4a.601.601 0 0 0 0-1.203H8.578z'></path>
              </g>
            </svg>
            <div class={this.ns.be('footer-btn', 'text')}>
              {biReportT('addFilter')}
            </div>
          </div>
        </div>
      </div>
    );
  },
});
