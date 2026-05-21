import { computed, defineComponent, ref, Ref } from 'vue';
import {
  useNamespace,
  getEditorEmits,
  getCascaderProps,
} from '@ibiz-template/vue3-util';
import { clone } from 'ramda';
import { CascaderEditorController } from '../cascader-editor.controller';
import './ibiz-cascader.scss';

/**
 * 级联选择器
 *
 * @description 使用el-cascader组件封装，该组件提供级联数据输入能力，支持逐级查看并选择。支持编辑器类型包含：`级联选择器`
 * @primary
 * @editorparams {"name":"editorstyle","parameterType":"'default' | 'other'","defaultvalue":"'default'","description":"设为'other'时会改变懒加载逻辑，不会将懒加载回的数据填充到树型数据中，'default'为默认逻辑，会将懒加载回的数据填充到树型数据中"}
 * @editorparams {"name":"size","parameterType":"'large' | 'default' | 'small'","defaultvalue":"'default'","description":"el-cascader组件的size属性"}
 * @editorparams {"name":"filterable","parameterType":"boolean","defaultvalue":true,"description":"el-cascader组件的filterable属性"}
 * @editorparams {"name":"multiple","parameterType":"boolean","defaultvalue":false,"description":"el-cascader组件props属性的multiple参数"}
 * @editorparams {"name":"separator","parameterType":"string","defaultvalue":"'/'","description":"el-cascader组件的separator属性"}
 * @editorparams {"name":"readonly","parameterType":"boolean","defaultvalue":false,"description":"设置编辑器是否为只读态"}
 * @editorparams {"name":"leaffield","parameterType":"string","defaultvalue":"undefined","description":"设置数据的叶子节点属性（boolean类型或是否逻辑类型），如果数据为叶子节点则点击数据时不展开子数据，直接选中该数据"}
 * @ignoreprops autoFocus | overflowMode
 * @ignoreemits infoTextChange
 */
export const IBizCascader = defineComponent({
  name: 'IBizCascader',
  props: getCascaderProps<CascaderEditorController>(),
  emits: getEditorEmits(),
  setup(props, { emit }) {
    const ns = useNamespace('cascader');

    const c = props.controller!;

    const editorModel = c.model;

    const treeRef: Ref<IData | null> = ref(null);

    // 关系表单项集合
    const valueItems: Ref<IData[]> = ref([]);
    const editorItems = editorModel.editorItems;
    if (editorItems && editorItems.length > 0) {
      const editorItemNames: IData[] = editorItems.map((item: IData) => {
        return {
          name: item.id,
          appId: item.appId,
          appDataEntityId: item.appDataEntityId,
          appDEDataSetId: item.appDEDataSetId,
        };
      });
      valueItems.value = editorItemNames;
    }

    // 编辑器样式
    let editorStyle = 'default';
    // 大小
    let size = 'default';
    // 是否支持过滤
    let filterable = true;
    // 是否多选
    let multiple = false;
    // 连接符
    let separator = '/';
    // 叶子节点属性
    let leafField: string | undefined;

    if (editorModel.editorParams) {
      if (editorModel.editorParams.editorStyle)
        editorStyle = editorModel.editorParams.editorStyle;
      if (editorModel.editorParams.editorstyle)
        editorStyle = editorModel.editorParams.editorstyle;
      if (editorModel.editorParams.size) size = editorModel.editorParams.size;
      if (editorModel.editorParams.filterable)
        filterable = c.toBoolean(editorModel.editorParams.filterable);
      if (editorModel.editorParams.multiple)
        multiple = c.toBoolean(editorModel.editorParams.multiple);
      if (editorModel.editorParams.separator)
        separator = editorModel.editorParams.separator;
      if (editorModel.editorParams.leaffield)
        leafField = editorModel.editorParams.leaffield;
    }

    // 树数据(用于维护级联选择器默认选中数据)
    const treeData: Ref<IData[]> = ref([]);
    // 数据集
    const items: Ref<IData[]> = ref([]);
    // 选中值
    const selectValue: Ref<string | string[] | string[][] | null> = ref(null);
    // 树选中数据
    const treeSelectData: Ref<IData[]> = ref([]);
    // 值项数据
    const valueItemData: Ref<IData[]> = ref([]);
    // 树默认选中值
    const defaultCheckedKeys: Ref<string[]> = ref([]);
    // 搜索值
    const searchValue = ref('');
    // 是否加载完成
    const isLoaded = ref(false);

    // 获取尺寸
    const getSize = () => {
      switch (size) {
        case 'large':
          return 'large';
        case 'small':
          return 'small';
        default:
          return 'default';
      }
    };

    // 获取是否为子叶
    const getIsLeaf = (data: IData, _node: IData): boolean => {
      return data.leaf;
    };

    // 获取禁用状态
    const getDisabled = (_data: IData, node: IData): boolean => {
      return node.level !== valueItems.value.length;
    };

    // 是否编辑态
    const isEditable = ref(false);

    // 编辑器Ref
    const editorRef = ref();

    // 是否显示表单默认内容
    const showFormDefaultContent = computed(() => {
      if (
        props.controlParams &&
        props.controlParams.editmode === 'hover' &&
        !props.readonly
      ) {
        return true;
      }
      return false;
    });

    const setEditable = (flag: boolean) => {
      if (flag) {
        isEditable.value = flag;
      } else {
        setTimeout(() => {
          isEditable.value = flag;
        }, 100);
      }
    };

    // 处理选中数据
    const handleSelectData = () => {
      if (props.value && valueItems.value) {
        const tempTreeSelectData: IData[] = [];
        const values = JSON.parse(props.value);
        values.forEach((label: string) => {
          tempTreeSelectData.push({
            label,
            value: [],
          });
        });
        valueItemData.value.forEach((valueItem: IData) => {
          const value = props.data[valueItem.name]
            ? props.data[valueItem.name].split(',')
            : [];
          valueItem.value = value;
        });
        treeSelectData.value = [];
        tempTreeSelectData.forEach((select: IData, index: number) => {
          valueItemData.value.forEach((valueItem: IData) => {
            select.value.push(valueItem.value[index]);
          });
          const value = select.value.join(separator);
          treeSelectData.value.push({
            label: select.label,
            value,
          });
        });
        treeSelectData.value.forEach((select: IData) => {
          const _values: string[] = select.value.split(separator);
          const _labels: string[] = select.label.split(separator);
          _values.forEach((value: string, index: number) => {
            const item = items.value.find(
              (_item: IData) => _item.value === value,
            );
            if (!item) {
              items.value.push({ value, label: _labels[index] });
            }
          });
        });
        if (Object.is(editorStyle, 'default')) {
          let tempSelectValue: string[] | string[][] = [];
          if (!multiple) {
            tempSelectValue = treeSelectData.value[0].value.split(separator);
          } else {
            treeSelectData.value.forEach((select: IData) => {
              tempSelectValue.push(select.value.split(separator));
            });
          }
          selectValue.value = tempSelectValue;
        } else {
          if (multiple) {
            selectValue.value = values;
          } else {
            selectValue.value = values.join(separator);
          }
          const tempDefaultCheckedKeys: string[] =
            valueItemData.value[valueItemData.value.length - 1].value;
          if (valueItemData.value.length > 1) {
            const parentKays =
              valueItemData.value[valueItemData.value.length - 2].value;
            if (parentKays && parentKays.length > 0) {
              parentKays.forEach((parent: string, index: number) => {
                tempDefaultCheckedKeys[index] =
                  `${parent}_${tempDefaultCheckedKeys[index]}`;
              });
            }
          }
          defaultCheckedKeys.value = tempDefaultCheckedKeys;
        }
      }
    };

    // created处理
    if (valueItems.value && valueItems.value.length > 0) {
      valueItems.value.forEach((valueItem: IData) => {
        valueItemData.value.push({ name: valueItem.name, value: [] });
      });
    }

    // 处理查询参数
    const handleQueryParams = async (index: number, value: string) => {
      const context = clone(c.context);
      const params = clone(c.params);
      // 如果上级和下级具有父子关系，则根据关系字段添加查询参数
      if (index > 0) {
        const { appDataEntityId: parentAppDataEntityId } =
          valueItems.value[index - 1];
        const { appId, appDataEntityId: childAppDataEntityId } =
          valueItems.value[index];
        const appDataEntity = await ibiz.hub.getAppDataEntity(
          childAppDataEntityId,
          appId,
        )!;
        const { minorAppDERSs } = appDataEntity;
        if (minorAppDERSs) {
          const appDeRSs = minorAppDERSs.find(
            DERSs => DERSs.majorAppDataEntityId === parentAppDataEntityId,
          );
          if (appDeRSs && appDeRSs.parentAppDEFieldId)
            Object.assign(params, {
              [`n_${appDeRSs.parentAppDEFieldId!.toLowerCase()}_eq`]: value,
            });
        }
      }
      return { context, params };
    };

    // 填充树形数据
    const fillTreeData = (node: IData, curNodes: IData[]) => {
      const { level, value } = node;
      isLoaded.value = true;
      let tempNodes: IData[] = [];
      if (level === 0) {
        // 已有回显数据
        handleSelectData();
        if (treeData.value.length > 0) {
          curNodes.forEach((child: IData) => {
            const index = treeData.value.findIndex(
              (_node: IData) => child.value === _node.value,
            );
            if (index > -1) {
              Object.assign(treeData.value[index], child);
            } else {
              treeData.value.push(child);
              tempNodes.push(child);
            }
          });
        } else {
          treeData.value = [...curNodes];
          tempNodes = [...curNodes];
        }
      } else {
        const getTreeData = (nodes: IData[], parentKey: string) => {
          if (nodes && nodes.length > 0) {
            nodes.forEach((_node: IData) => {
              if (_node.value === value) {
                if (_node.children && _node.children.length > 0) {
                  curNodes.forEach((childNode: IData) => {
                    const index = _node.children.findIndex(
                      (child: IData) => child.value === childNode.value,
                    );
                    if (index > -1) {
                      Object.assign(_node.children[index], childNode);
                    } else {
                      _node.children.push(childNode);
                      tempNodes.push(childNode);
                    }
                  });
                } else {
                  _node.children = curNodes;
                  tempNodes = curNodes;
                }
              } else {
                getTreeData(_node.children, parentKey);
              }
            });
          }
        };
        getTreeData(treeData.value, value);
      }
      // 在数据回显中，已有选中数据时，树重新load会导致selectValue被清空
      const tempSelectValue = selectValue.value || [];
      setTimeout(() => {
        selectValue.value = tempSelectValue;
        isLoaded.value = false;
      });
      return tempNodes;
    };

    // 加载数据
    const loadData = async (node: IData, resolve: (_n: IData[]) => void) => {
      const { level } = node;
      // eslint-disable-next-line no-nested-ternary
      const value = Object.is(editorStyle, 'default')
        ? node.value
        : node.data
          ? node.data.value
          : null;
      const valueItem = valueItems.value[level];
      try {
        if (valueItem.appDataEntityId && valueItem.appDEDataSetId) {
          const { context, params } = await handleQueryParams(level, value);
          const app = ibiz.hub.getApp(c.context.srfappid);
          const response = await app.deService.exec(
            valueItem.appDataEntityId,
            valueItem.appDEDataSetId,
            context,
            params,
          );
          if (response && response.status === 200 && response.data.length > 0) {
            const nodes: IData[] = response.data.map(
              (item: IData, index: number) => ({
                ...item,
                value: item.srfkey,
                label: item.srfmajortext
                  ? item.srfmajortext
                  : ibiz.i18n.t('editor.cascader.ibizCascader.title', {
                      index,
                    }),
                leaf:
                  level === valueItems.value.length - 1 ||
                  (leafField && item[leafField]),
                nodekey: `${value ? `${value}_${item.srfkey}` : item.srfkey}`,
              }),
            );
            nodes.forEach((_node: IData) => {
              const index = items.value.findIndex(
                (item: IData) => _node.value === item.value,
              );
              if (index > -1) {
                items.value[index] = _node;
              } else {
                items.value.push(_node);
              }
            });
            // 级联选择器值回显特殊处理--将懒加载回的数据填充到树型数据中
            if (Object.is(editorStyle, 'default')) {
              const tempNodes = fillTreeData(node, nodes);
              resolve(tempNodes);
            } else {
              resolve(nodes);
            }
          } else {
            // 没有子数据则标记为叶子节点
            node.data.leaf = true;
          }
        }
        resolve([]);
      } catch (error) {
        resolve([]);
      }
    };

    // 处理树选择器值改变
    const handleTreeValueChange = () => {
      const tempSelectValue: string[] = [];
      selectValue.value = [];
      treeSelectData.value.forEach((item: IData) => {
        tempSelectValue.push(item.label);
      });
      if (multiple) {
        selectValue.value = tempSelectValue;
      } else {
        selectValue.value =
          tempSelectValue.length > 0 ? tempSelectValue[0] : null;
      }
      valueItemData.value.forEach((valueItem: IData) => {
        emit(
          'change',
          valueItem.value.length > 0 ? valueItem.value.join(',') : null,
          valueItem.name,
        );
      });
      emit(
        'change',
        selectValue.value!.length > 0
          ? JSON.stringify(selectValue.value)
          : null,
      );
    };

    // 处理树选择清空
    const handleTreeClear = () => {
      treeSelectData.value = [];
      valueItemData.value.forEach((valueItem: IData) => {
        valueItem.value = [];
      });
      if (treeRef.value) {
        treeRef.value.setCheckedKeys([]);
      }
      handleTreeValueChange();
    };

    // 处理级联选择器值改变
    const handleCascaderValueChange = () => {
      if (!isLoaded.value) {
        // 计算值项选中数据
        valueItemData.value.forEach((valueItem: IData) => {
          valueItem.value = [];
        });
        if (selectValue.value?.length) {
          (selectValue.value as string[]).forEach(
            (item: string | string[], index: number) => {
              if (typeof item === 'string') {
                valueItemData.value[index].value.push(item);
              } else {
                item.forEach((_item: string, _index: number) => {
                  valueItemData.value[_index].value.push(_item);
                });
              }
            },
          );
        }
        // 计算当前选中数据文本
        const curSelectPath: string | string[][] = [];
        let curSelectText: string[] = [];
        if (selectValue.value?.length) {
          (selectValue.value as string[]).forEach(
            (selected: string[] | string) => {
              if (multiple) {
                const selectItems: string[] = (selected as string[]).map(
                  // eslint-disable-next-line array-callback-return
                  (select: string) => {
                    const selectItem = items.value.find(
                      (item: IData) => item.value === select,
                    );
                    if (selectItem) {
                      return selectItem.label;
                    }
                  },
                );
                curSelectPath.push(selectItems);
              } else {
                const selectItem = items.value.find(
                  (item: IData) => item.value === selected,
                );
                if (selectItem) {
                  curSelectPath.push(selectItem.label);
                }
              }
            },
          );
        }
        valueItemData.value.forEach((valueItem: IData) => {
          emit(
            'change',
            valueItem.value.length > 0 ? valueItem.value.join(',') : null,
            valueItem.name,
          );
        });
        if (curSelectPath.length > 0) {
          if (multiple) {
            curSelectPath.forEach((path: string[]) => {
              curSelectText.push(path.join(separator));
            });
          } else {
            curSelectText = [curSelectPath.join(separator)];
          }
        }
        emit(
          'change',
          curSelectText.length > 0 ? JSON.stringify(curSelectText) : null,
        );
        setEditable(false);
      }
    };

    // 处理删除标签(多选删除)
    const handleRemoveTag = () => {
      setTimeout(() => {
        handleCascaderValueChange();
      });
    };

    const onBlur = (e: IData) => {
      emit('blur', e);
      setEditable(false);
    };

    const onFocus = (e: IData) => {
      emit('focus', e);
      setEditable(true);
    };

    const valueText = computed(() => {
      if (props.value) {
        const values = JSON.parse(props.value);
        return values[0];
      }
      return null;
    });

    // 处理点击键盘
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e && e.code === 'Enter') {
        emit('enter', e);
      }
    };

    return {
      ns,
      c,
      items,
      treeRef,
      treeData,
      isLoaded,
      multiple,
      editorRef,
      valueText,
      separator,
      isEditable,
      valueItems,
      filterable,
      editorStyle,
      selectValue,
      searchValue,
      valueItemData,
      treeSelectData,
      defaultCheckedKeys,
      showFormDefaultContent,
      onBlur,
      onFocus,
      getSize,
      loadData,
      getIsLeaf,
      getDisabled,
      setEditable,
      handleKeyUp,
      handleTreeClear,
      handleRemoveTag,
      handleCascaderValueChange,
    };
  },
  render() {
    // 编辑态内容
    const editContent = (
      <el-cascader
        clearable
        ref='editorRef'
        size={this.getSize()}
        options={this.treeData}
        disabled={this.disabled}
        separator={this.separator}
        v-model={this.selectValue}
        class={this.ns.b('input')}
        filterable={this.filterable}
        popper-class={this.ns.b('popper')}
        teleported={!this.showFormDefaultContent}
        placeholder={this.c.placeHolder ? this.c.placeHolder : ' '}
        props={{
          lazy: true,
          multiple: this.multiple,
          lazyLoad: this.loadData,
        }}
        onBlur={this.onBlur}
        onFocus={this.onFocus}
        onRemoveTag={this.handleRemoveTag}
        onChange={this.handleCascaderValueChange}
        {...this.$attrs}
      ></el-cascader>
    );

    // 只读态内容
    const readonlyContent = (
      <div class={(this.ns.b(), this.ns.m('readonly'))}>{this.valueText}</div>
    );

    // 表单默认内容
    const formDefaultContent = (
      <div class={this.ns.b('form-default-content')}>
        {this.valueText ? (
          this.valueText
        ) : (
          <iBizEditorEmptyText
            showPlaceholder={this.c.emptyShowPlaceholder}
            placeHolder={this.c.placeHolder}
          />
        )}
      </div>
    );

    return (
      <div
        class={[
          this.ns.b(),
          this.disabled ? this.ns.m('disabled') : '',
          this.readonly ? this.ns.m('readonly') : '',
          this.ns.is('editable', this.isEditable),
          this.ns.is('show-default', this.showFormDefaultContent),
        ]}
        onKeyup={this.handleKeyUp}
      >
        {this.showFormDefaultContent && formDefaultContent}
        {this.readonly ? readonlyContent : editContent}
      </div>
    );
  },
});
