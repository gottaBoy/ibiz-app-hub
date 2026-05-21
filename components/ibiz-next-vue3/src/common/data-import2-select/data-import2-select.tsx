import { PropType, defineComponent } from 'vue';
import { useNamespace } from '@ibiz-template/vue3-util';
import './data-import2-select.scss';
import { deleteImportSchema, updateImportSchema } from '@ibiz-template/runtime';

export const DataImport2Select = defineComponent({
  name: 'DataImport2Select',
  props: {
    previewinfo: {
      type: Object as PropType<[string[]]>,
      required: true,
    },
    options: {
      type: Object as PropType<
        {
          value: string;
          label: string;
          oldLabel: string;
          edit: boolean;
          checkmark: boolean;
          close: boolean;
        }[]
      >,
      required: true,
    },
    columnMappingListMap: {
      type: Object as PropType<Map<string, IData>>,
      required: true,
    },
    listValue: {
      type: String,
      required: true,
    },
    context: {
      type: Object as PropType<IContext>,
      required: false,
    },
  },
  setup(props, { emit }) {
    const ns = useNamespace('data-import2-select');
    // 点击input,禁止下拉框关闭
    const inputClick = (e: Event) => {
      e.stopPropagation();
    };
    // 开启导入模式编辑
    const editLabel = (e: Event, item: IData) => {
      e.stopPropagation();
      emit('optionsChange', item.label, {
        edit: false,
        checkmark: true,
        close: true,
      });
    };
    // 保存已修改的导入模式名称
    const saveLabel = async (e: Event, item: IData) => {
      e.stopPropagation();
      emit('optionsChange', item.label, {
        edit: true,
        checkmark: false,
        close: false,
        value: item.label,
        label: item.label,
      });
      const data = props.columnMappingListMap.get(item.oldLabel);
      if (data) {
        data.name = item.label;
        const result = await updateImportSchema({
          data,
          context: props.context,
        });
        // 请求更新
        if (result.status === 200 && result.ok) {
          emit('columnMappingListMapChange', item.label, result.data);
        }
      }
      if (props.listValue === item.oldLabel) {
        emit('listValueChange', item.label);
      }
      emit('optionsChange', item.label, {
        oldLabel: item.label,
      });
    };

    // 不保存已修改的导入模式名称
    const notSaveLabel = (e: Event, item: IData) => {
      e.stopPropagation();
      emit('optionsChange', item.label, {
        edit: true,
        checkmark: false,
        close: false,
        label: item.oldLabel,
      });
    };

    // 删除导入模式
    const handleDeleteOption = async (e: Event, str: string) => {
      e.stopPropagation();
      const columnData = props.columnMappingListMap.get(str);
      if (columnData) {
        const res = await deleteImportSchema(columnData.id, props.context);

        // 删除之后把下拉里的也删除
        if (res.status === 200 && res.ok) {
          emit('optionsChange', str);
          emit('columnMappingListMapChange', str);
          if (props.listValue === str) {
            emit('listValueChange', '');
          }
        }
      }
    };
    const valueChange = (data: string) => {
      emit('listValueChange', data);
    };
    return {
      ns,
      inputClick,
      editLabel,
      saveLabel,
      notSaveLabel,
      handleDeleteOption,
      valueChange,
    };
  },
  render() {
    return (
      <div class='ibiz-control-toolbar__item'>
        <el-select
          ref='select'
          model-value={this.listValue}
          onChange={this.valueChange}
          clearable
          placeholder={ibiz.i18n.t('component.dataImport2Select.selectMode')}
          disabled={!(this.previewinfo[0] && this.previewinfo[0].length)}
          popper-class={this.ns.e('dataimport-select')}
        >
          {this.options.map(item => {
            return (
              <el-option
                label={item.label}
                value={item.value}
                class={[this.ns.e('select-option')]}
              >
                {{
                  default: () => (
                    <div class={[this.ns.e('select-option-item')]}>
                      {item.edit ? <span>{item.label}</span> : ''}
                      {item.edit ? (
                        ''
                      ) : (
                        <el-input
                          model-value={item.label}
                          onClick={(e: Event) => this.inputClick(e)}
                          class={[this.ns.e('select-option-item-input')]}
                          onInput={(args: string) => {
                            item.label = args;
                          }}
                        ></el-input>
                      )}
                      {item.edit ? (
                        <el-button
                          text
                          size='small'
                          onClick={(e: Event) => this.editLabel(e, item)}
                        >
                          {ibiz.i18n.t('component.dataImport2Select.edit')}
                        </el-button>
                      ) : (
                        ''
                      )}
                      {item.checkmark ? (
                        <el-button
                          size='small'
                          onClick={(e: Event) => this.saveLabel(e, item)}
                        >
                          <ion-icon name='checkmark-outline'></ion-icon>
                        </el-button>
                      ) : (
                        ''
                      )}
                      {item.close ? (
                        <el-button
                          size='small'
                          onClick={(e: Event) => this.notSaveLabel(e, item)}
                        >
                          <ion-icon name='close-outline'></ion-icon>
                        </el-button>
                      ) : (
                        ''
                      )}
                      <el-button
                        text
                        size='small'
                        onClick={(e: Event) =>
                          this.handleDeleteOption(e, item.value)
                        }
                        class={this.ns.e('select-option-item-button-delete')}
                      >
                        <ion-icon
                          name='trash-outline'
                          class={this.ns.e(
                            'select-option-item-button-delete-icon',
                          )}
                        ></ion-icon>
                      </el-button>
                    </div>
                  ),
                }}
              </el-option>
            );
          })}
        </el-select>
      </div>
    );
  },
});
