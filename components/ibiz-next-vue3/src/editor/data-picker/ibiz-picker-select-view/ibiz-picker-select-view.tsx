/* eslint-disable no-nested-ternary */
import {
  h,
  ref,
  Ref,
  watch,
  onMounted,
  computed,
  defineComponent,
  resolveComponent,
} from 'vue';
import {
  useNamespace,
  getEditorEmits,
  useFocusAndBlur,
  getDataPickerProps,
} from '@ibiz-template/vue3-util';
import { clone } from 'ramda';
import { EventBase, IModalData, Modal, ViewMode } from '@ibiz-template/runtime';
import { PickerEditorController } from '../picker-editor.controller';
import './ibiz-picker-select-view.scss';

/**
 * 数据选择（下拉视图）
 *
 * @description 使用el-dropdown，el-input，el-select组件封装，用于以可展开的下拉形式呈现配置的选择界面视图，并且该组件支持打开数据链接视图。支持编辑器类型包含：`数据选择（下拉视图）`、`数据选择（下拉视图、数据链接）`
 * @primary
 * @editorparams {"name":"multiple","parameterType":"boolean","defaultvalue":false,"description":"当该参数值设置为 true 时，启用多选模式，允许同时选择多个数据项"}
 * @editorparams {"name":"pickupviewheight","parameterType":"number","defaultvalue":500,"description":"下拉选择视图的高度"}
 * @editorparams {"name":"valuetype","parameterType":"string","description":"编辑器的值类型"}
 * @editorparams {"name":"objectidfield","parameterType":"string","description":"值类型为OBJECT或者OBJECTS时的对象标识属性"}
 * @editorparams {"name":"objectnamefield","parameterType":"string","description":"值类型为OBJECT或者OBJECTS时的对象名称属性"}
 * @editorparams {"name":"objectvaluefield","parameterType":"string","description":"值类型为OBJECT或者OBJECTS时的对象值属性"}
 * @editorparams {"name":"readonly","parameterType":"boolean","defaultvalue":false,"description":"设置编辑器是否为只读态"}
 * @ignoreprops overflowMode
 * @ignoreemits infoTextChange
 */
export const IBizPickerSelectView = defineComponent({
  name: 'IBizPickerSelectView',
  props: getDataPickerProps<PickerEditorController>(),
  emits: getEditorEmits(),
  setup(props, { emit }) {
    const ns = useNamespace('picker-select-view');

    const c = props.controller!;

    const editorModel = c.model;

    // 是否单选
    const singleSelect = ref(true);
    if (editorModel.editorParams) {
      if (editorModel.editorParams.multiple) {
        singleSelect.value = !c.toBoolean(editorModel.editorParams.multiple);
      }
    }

    // 当前多选框选中值的key集合
    const keySet: Ref<string[]> = ref([]);

    // 所有操作过的下拉选项对象集合
    const items: Ref<IData[]> = ref([]);

    // 选中数据
    const selectedData: Ref<IData[]> = ref([]);

    // 输入框值(搜索值)
    const queryValue: Ref<string> = ref('');

    // 下拉显示控制变量
    const visible = ref(false);

    // 选择视图宽度
    const pickViewWidth = ref('auto');

    // 视图上下文
    const context: Ref<IContext> = ref(c.context.clone());

    // 视图参数
    const params: Ref<IData> = ref({ ...c.params });

    // 克隆的视图参数
    const cloneParams = computed(() => {
      return { ...params.value };
    });

    watch(
      () => props.data,
      newVal => {
        // 转换视图上下文、视图参数
        const { context: tempContext, params: tempParams } =
          c.handlePublicParams(newVal, c.context, c.params);
        const newContext = Object.assign(c.context.clone(), tempContext);
        const newParams = { ...c.params, ...tempParams };
        if (JSON.stringify(context.value) !== JSON.stringify(newContext))
          context.value = newContext;
        if (JSON.stringify(params.value) !== JSON.stringify(newParams))
          params.value = newParams;
      },
      { immediate: true, deep: true },
    );

    // 是否编辑态
    const isEditable = ref(false);

    // 多选时临时储存值与值项，等blur再抛出去
    const multipleTempValue: Ref<string | null> = ref(null);

    const multipleTempText: Ref<string | null> = ref(null);

    const multipleObjs: Ref<IData[] | null> = ref(null);

    // 是否显示视图
    const showView = ref(false);

    // 是否处于设计预览状态
    const isDesignPreview = c.context?.srfrunmode === 'DESIGN';

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

    // 改变显示事件
    const triggerMenu = (show?: boolean) => {
      if (props.disabled) {
        return;
      }
      if (!show) {
        visible.value = !visible.value;
      } else {
        visible.value = show;
      }
    };

    // 聚焦失焦事件
    const { componentRef: editorRef } = useFocusAndBlur(
      () => emit('focus'),
      () => emit('blur'),
    );

    watch(
      () => props.value,
      newVal => {
        if (singleSelect.value) {
          if (c.model.valueType === 'OBJECT') {
            queryValue.value = newVal
              ? (newVal as IData)[c.objectNameField as string]
              : null;
          } else {
            queryValue.value = (newVal as string) || '';
          }
          if (!c.valueItem && !isDesignPreview) {
            ibiz.log.error('值项异常');
          } else {
            selectedData.value = [
              { srfkey: props.data[c.valueItem], srfmajortext: props.value },
            ];
          }
        } else {
          const selectItems: IData[] = [];
          keySet.value = [];
          items.value = [];
          if (newVal) {
            if (c.model.valueType === 'OBJECTS') {
              (newVal as Array<IData>).forEach((item: IData) => {
                const _item = clone(item);
                Object.assign(_item, {
                  [c.keyName]: item[c.objectIdField as string],
                  [c.textName]: item[c.objectNameField as string],
                });
                if (c.objectValueField) {
                  Object.assign(_item, {
                    ...item[c.objectValueField],
                  });
                  delete _item[c.objectValueField];
                }
                if (_item[c.keyName]) {
                  items.value.push(_item);
                  keySet.value.push(_item[c.keyName]);
                }
              });
              selectItems.push(...(newVal as IData[]));
            } else if (!c.valueItem) {
              ibiz.log.error('值项异常');
            } else {
              const tempValue = props.data[c.valueItem].split(',');
              const tempText = (newVal as string).split(',');
              tempValue.forEach((srfkey: string, index: number) => {
                selectItems.push({
                  srfmajortext: tempText[index],
                  srfkey,
                });
              });
              selectItems.forEach((item: IData) => {
                keySet.value.push(item.srfkey);
                const index = items.value.findIndex(i =>
                  Object.is(i.srfkey, item.srfkey),
                );
                if (index < 0) {
                  items.value.push({
                    srfmajortext: item.srfmajortext,
                    srfkey: item.srfkey,
                  });
                }
              });
            }
          }
          selectedData.value = selectItems;
          multipleObjs.value = selectItems;
        }
      },
      {
        immediate: true,
        deep: true,
      },
    );

    // 自动聚焦
    watch(editorRef, newVal => {
      if (props.autoFocus && newVal && newVal.focus) {
        newVal.focus();
      }
    });

    onMounted(() => {
      if (editorRef.value) {
        pickViewWidth.value = `${editorRef.value.$parent.$el.offsetWidth}px`;
      }
    });

    // 清除
    const onClear = () => {
      // 清空回填数据
      const dataItems = c.dataItems;
      if (dataItems?.length) {
        dataItems.forEach(dataItem => {
          emit('change', null, dataItem.id);
        });
      }
      if (c.valueItem) {
        emit('change', null, c.valueItem);
      }
      emit('change', null);
    };

    // 输入框change事件
    const onInputChange = (e: IData) => {
      if (!e) {
        onClear();
      }
    };

    // 视图数据改变
    const onViewDataChange = (event: IData[]) => {
      if (event.length === 0) {
        if (singleSelect.value) {
          onClear();
        } else {
          items.value = [];
          if (c.model.valueType === 'OBJECTS') {
            multipleObjs.value = null;
          } else {
            if (c.valueItem) {
              multipleTempValue.value = null;
            }
            multipleTempText.value = null;
          }

          // input输入框数据实时变更
          keySet.value = [];
        }
        return;
      }
      if (singleSelect.value) {
        visible.value = false;
        if (c.valueItem) {
          const tempValue = event[0][c.keyName]
            ? event[0][c.keyName]
            : event[0].srfkey;
          emit('change', tempValue, c.valueItem);
        }
        const tempText = event[0][c.textName]
          ? event[0][c.textName]
          : event[0].srfmajortext;
        if (c.model.valueType === 'OBJECT') {
          emit('change', c.handleObjectParams(event[0]));
        } else {
          emit('change', tempText);
        }
      } else if (c.model.valueType === 'OBJECTS') {
        if (event && Array.isArray(event)) {
          const objs: IData[] = [];
          event.forEach(item => {
            const obj = c.handleObjectParams(item);
            objs.push(obj);
          });
          multipleObjs.value = objs;
        }
      } else {
        let tempValue: string = '';
        let tempText: string = '';
        if (event && Array.isArray(event)) {
          items.value = [];
          event.forEach((select: IData) => {
            const srfkey = select[c.keyName]
              ? select[c.keyName]
              : select.srfkey;
            tempValue += `${srfkey},`;
            const srfmajortext = select[c.textName]
              ? select[c.textName]
              : select.srfmajortext;
            tempText += `${srfmajortext},`;
            const index = items.value.findIndex(item =>
              Object.is(item.srfkey, srfkey),
            );
            if (index < 0) {
              items.value.push({ srfmajortext, srfkey });
            }
          });
        }
        tempValue = tempValue.substring(0, tempValue.length - 1);
        tempText = tempText.substring(0, tempText.length - 1);
        // 临时存储值项和本身的值
        if (c.valueItem) {
          multipleTempValue.value = tempValue;
        }
        multipleTempText.value = tempText;
      }

      // 多选时视图数据变更就更新select的数据
      if (!singleSelect.value) {
        if (event.length === 0) {
          items.value = [];
          keySet.value = [];
        } else if (Array.isArray(event)) {
          items.value = event.map(item => {
            return {
              srfkey: item[c.keyName] || item.srfkey,
              srfmajortext: item[c.textName] || item.srfmajortext,
            };
          });
          keySet.value = items.value.map(item => item.srfkey);
        }
      }

      // 多选抛值
      if (!singleSelect.value) {
        if (c.model.valueType === 'OBJECTS') {
          emit('change', multipleObjs.value);
        } else {
          if (c.valueItem) {
            emit('change', multipleTempValue.value, c.valueItem);
          }
          emit('change', multipleTempText.value);
        }
      }
    };

    // 打开数据链接视图
    const openLinkView = async (e: MouseEvent) => {
      e.stopPropagation();
      const res = await c.openLinkView(props.data);
      if (res && res.ok && res.data) {
        onViewDataChange(res.data);
      }
    };

    // 下拉选中回调
    const onSelectChange = (selects: string[]) => {
      const val: IData[] = [];
      if (selects.length > 0) {
        selects.forEach((select: string) => {
          const index = items.value.findIndex(item =>
            Object.is(item.srfkey, select),
          );
          if (index >= 0) {
            val.push(items.value[index]);
          }
        });
      }
      if (c.model.valueType === 'OBJECTS') {
        const objs: IData[] = [];
        val.forEach(item => {
          const obj = c.handleObjectParams(item);
          objs.push(obj);
        });
        emit('change', objs);
      } else {
        let tempValue: string = '';
        let tempText: string = '';
        val.forEach((select: IData) => {
          const srfkey = select[c.keyName] ? select[c.keyName] : select.srfkey;
          tempValue += `${srfkey},`;
          const srfmajortext = select[c.textName]
            ? select[c.textName]
            : select.srfmajortext;
          tempText += `${srfmajortext},`;
        });
        tempValue = tempValue.substring(0, tempValue.length - 1);
        tempText = tempText.substring(0, tempText.length - 1);
        // 处理值项和本身的值
        if (c.valueItem) {
          multipleTempValue.value = tempValue;
          emit('change', tempValue, c.valueItem);
        }
        multipleTempText.value = tempText;
        emit('change', tempText);
      }
    };

    // 远程搜索
    const remoteMethod = (e: string) => {
      queryValue.value = e;
    };

    // 绑定事件
    const onSelectionChange = (
      event: EventBase | IModalData,
      isClose: boolean = false,
    ) => {
      if (event.data) {
        onViewDataChange(event.data);
        if (isClose && editorRef.value) {
          editorRef.value.handleClose();
        }
      }
    };

    const modal = new Modal({
      mode: ViewMode.DRAWER,
      viewUsage: 2,
      dismiss: (_data: IModalData) => {
        onSelectionChange(_data, true);
      },
    });

    const onFocus = (e: IData) => {
      emit('focus', e);
      setEditable(true);
    };

    const onBlur = (e: IData) => {
      emit('blur', e);
      setEditable(false);
    };

    // 处理点击键盘
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e && e.code === 'Enter') {
        emit('enter', e);
      } else if (e.code === 'Escape') {
        e.stopPropagation();
        if (editorRef.value) {
          editorRef.value.handleClose();
        }
      }
    };

    const valueText = computed(() => {
      if (singleSelect.value) {
        return queryValue.value;
      }
      return selectedData.value.map(item => item[c.textName]).join(',');
    });

    // dropdown内容显示隐藏
    const onVisibleChange = (e: boolean) => {
      showView.value = e;
      // 下拉隐藏的时候触发编辑器的blur事件
      if (e === false) {
        onBlur({});
      } else if (editorRef.value) {
        pickViewWidth.value = `${editorRef.value.$parent.$el.offsetWidth}px`;
      }
    };

    const handleDropDownKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        e.stopPropagation();
        if (editorRef.value) {
          editorRef.value.handleClose();
        }
      }
    };

    const arrow = () => {
      return (
        <svg viewBox='0 0 1024 1024' xmlns='http://www.w3.org/2000/svg'>
          <path
            fill='currentColor'
            d='M831.872 340.864 512 652.672 192.128 340.864a30.592 30.592 0 0 0-42.752 0 29.12 29.12 0 0 0 0 41.6L489.664 714.24a32 32 0 0 0 44.672 0l340.288-331.712a29.12 29.12 0 0 0 0-41.728 30.592 30.592 0 0 0-42.752 0z'
          ></path>
        </svg>
      );
    };

    return {
      c,
      ns,
      items,
      modal,
      keySet,
      params,
      visible,
      context,
      showView,
      editorRef,
      valueText,
      isEditable,
      queryValue,
      cloneParams,
      selectedData,
      singleSelect,
      pickViewWidth,
      showFormDefaultContent,
      arrow,
      onBlur,
      onClear,
      onFocus,
      triggerMenu,
      setEditable,
      handleKeyUp,
      openLinkView,
      remoteMethod,
      onInputChange,
      onSelectChange,
      onVisibleChange,
      onViewDataChange,
      onSelectionChange,
      handleDropDownKeyDown,
    };
  },
  render() {
    // 编辑态内容
    const editContent = (
      <el-dropdown
        ref='editorRef'
        trigger='click'
        disabled={this.disabled || this.readonly}
        class={this.ns.b('select')}
        popper-class={this.ns.b('popper')}
        onVisibleChange={this.onVisibleChange}
        onKeydown={this.handleDropDownKeyDown}
      >
        {{
          default: () => {
            return this.singleSelect ? (
              <el-input
                v-model={this.queryValue}
                placeholder={this.c.placeHolder}
                disabled={this.disabled}
                readonly={this.readonly}
                onChange={this.onInputChange}
                clearable
                onFocus={(e: IData) => {
                  this.onFocus(e);
                }}
                onKeyup={this.handleKeyUp}
              >
                {{
                  suffix: () => {
                    return [
                      this.queryValue && !this.disabled && !this.readonly && (
                        <ion-icon
                          onClick={this.onClear}
                          name='clear'
                        ></ion-icon>
                      ),
                      this.c.model.linkAppViewId && (
                        <ion-icon
                          onClick={this.openLinkView}
                          name='link-arrow'
                        ></ion-icon>
                      ),
                      this.c.model.showTrigger && (
                        <div
                          class={[
                            this.ns.e('arrow'),
                            this.showView ? 'overturn' : '',
                          ]}
                        >
                          {this.arrow()}
                        </div>
                      ),
                    ];
                  },
                }}
              </el-input>
            ) : (
              <el-select
                popper-class={this.ns.b('select-popover')}
                model-value={this.keySet}
                placeholder={this.c.placeHolder ? this.c.placeHolder : ' '}
                multiple
                filterable
                remote
                remote-method={this.remoteMethod}
                onChange={this.onSelectChange}
                onFocus={(e: IData) => {
                  this.onFocus(e);
                }}
                onKeyup={this.handleKeyUp}
                disabled={this.disabled || this.readonly}
                remote-show-suffix={this.c.model.showTrigger}
              >
                {this.items.map((item: IData, index: number) => {
                  return (
                    <el-option
                      key={item.srfkey + index}
                      label={item.srfmajortext}
                      value={item.srfkey}
                    ></el-option>
                  );
                })}
              </el-select>
            );
          },
          dropdown: () => {
            if (!this.showView) return;
            const viewShell = resolveComponent('IBizViewShell');
            return (
              this.c.pickupView &&
              h(viewShell, {
                modal: this.modal,
                context: this.context,
                params: this.cloneParams,
                viewId: this.c.pickupView.id,
                style: {
                  height: `${
                    this.c.editorParams?.pickupViewHeight ||
                    this.c.editorParams?.pickupviewheight ||
                    500
                  }px`,
                  width: this.pickViewWidth,
                },
                state: {
                  singleSelect: this.singleSelect,
                  selectedData: this.selectedData,
                },
                onSelectionChange: (event: EventBase) =>
                  this.onSelectionChange(event, this.singleSelect),
              })
            );
          },
        }}
      </el-dropdown>
    );

    // 只读态内容
    const readonlyContent = (
      <div class={(this.ns.b(), this.ns.m('readonly'))}>{this.valueText}</div>
    );

    // 表单默认内容
    const formDefaultContent = (
      <div class={this.ns.b('form-default-content')}>
        {this.valueText ? (
          this.singleSelect ? (
            <span class={this.ns.b('content-item')}>{this.valueText}</span>
          ) : (
            this.valueText
              .split(',')
              .map((item: string) => (
                <span class={this.ns.b('content-item')}>{item}</span>
              ))
          )
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
      >
        {this.showFormDefaultContent && formDefaultContent}
        {this.readonly ? readonlyContent : editContent}
      </div>
    );
  },
});
