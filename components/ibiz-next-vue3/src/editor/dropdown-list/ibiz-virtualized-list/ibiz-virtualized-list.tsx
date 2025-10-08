import {
  ref,
  Ref,
  watch,
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  defineComponent,
} from 'vue';
import {
  useNamespace,
  getEditorEmits,
  getDropdownProps,
  useCodeListListen,
} from '@ibiz-template/vue3-util';
import { showTitle } from '@ibiz-template/core';
import { CodeListItem, useCodeListSelection } from '@ibiz-template/runtime';
import { INavigateParamContainer } from '@ibiz/model-core';
import { DropDownListEditorController } from '../dropdown-list-editor.controller';
import './ibiz-virtualized-list.scss';

/**
 * 虚拟化选择器（扩展）
 *
 * @description 使用el-select-v2组件，在下拉数据较多的情况下，避免渲染至 DOM 中时造成性能问题。基于`下拉列表框`、`下拉列表框（多选）`编辑器进行扩展，编辑器样式代码名称为：VIRTUALIZED_LIST
 * @primary
 * @editorparams {name:forceselection,parameterType:boolean,defaultvalue:true,description:是否禁止用户创建选择项。当参数为false时，可在输入框输入内容，使其显示在下拉选项中呈现，并且可选择}
 * @editorparams {name:blankitemname,parameterType:string,description:在单选模式下，用于在下拉展示数据顶部添加一条空白项数据，其文本内容为配置的该参数值}
 * @editorparams {name:alwaysload,parameterType:boolean,defaultvalue:false,description:当值改变、下拉框出现时，是否重新加载代码表数据。设置为 true 时每次相关事件触发都会重新加载数据}
 * @editorparams {name:type,parameterType:'round' | 'other',defaultvalue:'other',description:下拉框的样式类型，可取值为 'round'（圆角类型）或 'other'（其他类型）}
 * @editorparams {name:overflowmode,parameterType:'auto' | 'ellipsis',defaultvalue:'auto',description:用于控制该编辑器下拉区域的宽度显示方式。当参数值为 'auto' 时，下拉区域宽度会根据内容自动展开；当参数值为 'ellipsis' 时，下拉区域宽度将与输入框保持一致，若内容超出宽度则会显示省略号，鼠标悬浮在内容上时会出现提示信息}
 * @editorparams {name:allitems,parameterType:boolean,defaultvalue:false,description:下拉列表框是否启用全部项}
 * @editorparams {name:itemstext,parameterType:string,defaultvalue:'全部',description:下拉列表框全部项文本}
 * @editorparams {"name":"valuetype","parameterType":"string","description":"编辑器的值类型"}
 * @editorparams {"name":"readonly","parameterType":"boolean","defaultvalue":false,"description":"设置编辑器是否为只读态"}
 * @ignoreprops overflowMode
 */
export const IBizVirtualizedList = defineComponent({
  name: 'IBizVirtualizedList',
  props: getDropdownProps<DropDownListEditorController>(),
  emits: getEditorEmits(),
  setup(props, { emit }) {
    const ns = useNamespace('dropdown');
    const c = props.controller;

    const items: Ref<readonly IData[]> = ref([]);

    // 树型数据展开的代码表
    const codeListItems: Ref<IData[]> = ref([]);

    // 是否已加载代码表
    const isLoadedCodeList = ref(false);

    // 是否是树形
    const hasChildren = ref(false);

    // 树数据
    const treeNodes: Ref<IData[]> = ref([]);

    // 编辑器Ref
    const editorRef = ref();

    // 值项
    const editorItems = c.model.editorItems;

    // 是否正在加载
    const isLoading = ref(false);

    // 编辑器状态
    let editorState = '';

    // 代码项值是否为数值
    const codeItemValueNumber = ref(false);

    // 处理树数据
    const handleTreeNodes = (nodes: readonly IData[]): IData[] => {
      if (nodes.length === 0) {
        return [];
      }

      const list: IData[] = [];
      const existingValues = new Set(
        codeListItems.value.map(item => item.value),
      );

      nodes.forEach((codeItem: IData) => {
        if (!existingValues.has(codeItem.value)) {
          codeListItems.value.push(codeItem);
        }

        const tempObj: IData = {
          label: codeItem.text,
          value: codeItem.value?.toString(),
          color: codeItem?.color,
          textCls: codeItem?.textCls,
          sysImage: codeItem.sysImage,
          disabled: codeItem.disableSelect === true,
          children: [],
        };

        if (codeItem.children && codeItem.children.length > 0) {
          tempObj.children = handleTreeNodes(codeItem.children);
        }

        list.push(tempObj);
      });

      return list;
    };

    /**
     * 加载代码表后续处理
     *
     * @param {readonly} codeList
     * @param {*} CodeListItem
     * @param {*} []
     */
    const afterLoadCodeList = (codeList: readonly CodeListItem[]) => {
      items.value = [];
      codeListItems.value = [];
      if (c.multiple && !codeList.some(item => item.children)) {
        codeList = c.handleCodeListAllItems(codeList);
      }
      if (c.blankItemName && !c.multiple) {
        items.value = [
          {
            value: undefined,
            text: c.blankItemName,
          },
          ...codeList,
        ];
      } else {
        items.value = codeList;
      }
      for (let i = 0; i < items.value.length; i++) {
        const _item = items.value[i];
        if (_item.children) {
          hasChildren.value = true;
          treeNodes.value = handleTreeNodes(codeList);
          break;
        }
      }
    };

    // 加载代码表数据与后续操作
    const loadCodeList = async () => {
      if (c.model.appCodeListId) {
        const app = ibiz.hub.getApp(c.context.srfappid);
        const codeListModel = app.codeList.getCodeList(c.model.appCodeListId);
        if (codeListModel) {
          codeItemValueNumber.value =
            codeListModel.codeItemValueNumber || false;
        }
      }
      isLoading.value = true;
      const codeList = await c.loadCodeList(props.data!);
      afterLoadCodeList(codeList);
      isLoadedCodeList.value = true;
      isLoading.value = false;
    };

    watch(
      () => props.value,
      async (newVal, oldVal) => {
        if (newVal || newVal === null || newVal === 0) {
          // 值从无到有、并且没搜索过的情况
          if (!isLoadedCodeList.value && oldVal === undefined) {
            await loadCodeList();
          }
        }
      },
      { immediate: true },
    );

    const useEditorNavParams = (): void => {
      const { navigateContexts = [], navigateParams = [] } =
        c.model as INavigateParamContainer;
      const navParamName: string[] = [];
      [...navigateContexts, ...navigateParams].forEach(nav => {
        if (!nav.rawValue && nav.value) {
          navParamName.push(nav.value);
        }
      });
      // 导航参数发生改变时重新加载数据
      watch(
        () => {
          // 直接监听props.data时 newVal, oldVal 值一样，所以在这直接监听导航参数数据项变化
          const data: IData = {};
          Object.keys(props.data).forEach(key => {
            if (navParamName.includes(key)) {
              data[key] = props.data[key];
            }
          });
          return data;
        },
        () => loadCodeList(),
        { deep: true },
      );
    };

    /**
     * 根据值获取代码表
     *
     * @author zk
     * @date 2024-01-17 03:01:53
     * @param {string} value
     * @return {*}
     */
    const getCodeListItemByValue = (value: string | number) => {
      const list = hasChildren.value ? codeListItems.value : items.value;
      return list.find(item => item.value === value);
    };

    const { getSelection, getSelectionValue } = useCodeListSelection(
      c.allItemsValue,
    );

    // 当前值
    const curValue = computed({
      get() {
        if (!isLoadedCodeList.value) {
          return c.multiple ? [] : '';
        }
        // 单选才考虑值项
        if (editorItems && editorItems.length > 0 && !c.multiple) {
          return props.data[editorItems[0].id!]?.toString();
        }
        if (props.value && typeof props.value === 'string') {
          if (c.allItems && c.multiple && !hasChildren.value) {
            return getSelection(
              [],
              props.value.split(','),
              items.value as readonly CodeListItem[],
              items.value as readonly CodeListItem[],
            ).map(v => `${v}`);
          }
          return c!.multiple
            ? props.value?.toString().split(',')
            : props.value.toString();
        }
        if (props.value && Array.isArray(props.value)) {
          if (c.allItems && c.multiple && !hasChildren.value) {
            return getSelection(
              [],
              props.value,
              items.value as readonly CodeListItem[],
              items.value as readonly CodeListItem[],
            ).map(v => `${v}`);
          }
          return c!.multiple ? props.value : props.value.toString();
        }
        return c.multiple ? [] : props.value?.toString() || '';
      },
      set(_select: string | Array<string> | undefined) {
        let select = _select;
        // 如果配置有空白项，清空时置为undefined
        if (c.blankItemName && !_select) select = undefined;
        if (Array.isArray(select)) {
          if (c.allItems && c.multiple && !hasChildren.value) {
            const selection = getSelection(
              curValue.value as string[],
              select,
              items.value as readonly CodeListItem[],
              items.value as readonly CodeListItem[],
            );
            select = getSelectionValue(selection).map(v => `${v}`);
          }
          let selectArr = null;
          if (select.length === 0) {
            selectArr = null;
          } else if (c.model.valueType === 'SIMPLES') {
            selectArr = select;
          } else {
            selectArr = select.join(',');
          }
          emit('change', selectArr);
        } else if (editorItems && editorItems.length > 0) {
          // 有值项 默认抛标题 值项抛实际value
          let emitVal: number | string | null =
            select === undefined ? null : select;
          if (codeItemValueNumber.value && emitVal !== null)
            emitVal = Number(select);
          emit('change', emitVal, editorItems[0].id!);
          const selectItem = getCodeListItemByValue(
            (codeItemValueNumber.value ? Number(select) : select)!,
          );
          if (selectItem) {
            emit('change', selectItem.text);
          }
        } else {
          let emitVal: number | string | null =
            select === undefined ? null : select;
          if (codeItemValueNumber.value && emitVal !== null)
            emitVal = Number(select);
          emit('change', emitVal);
        }
        if (
          c.editorParams.alwaysLoad === 'true' ||
          c.editorParams.alwaysload === 'true'
        ) {
          loadCodeList();
        }
        if (props.autoFocus) {
          editorState = 'blur';
          emit('blur');
        }
      },
    });

    const valueText = computed(() => {
      const valueArr = Array.isArray(curValue.value)
        ? curValue.value
        : [curValue.value];

      const list = hasChildren.value ? codeListItems.value : items.value;
      const textArr: string[] = [];
      valueArr.forEach(item => {
        list.forEach(codeItem => {
          if (
            codeItemValueNumber.value
              ? codeItem.value === Number(item)
              : codeItem.value === item
          ) {
            textArr.push(codeItem.text);
          }
        });
      });
      return textArr.join(',');
    });

    watch(
      valueText,
      (newVal, oldVal) => {
        if (newVal !== oldVal) {
          emit('infoTextChange', newVal);
        }
      },
      { immediate: true },
    );

    // 自动聚焦
    watch(editorRef, newVal => {
      if (props.autoFocus && newVal && newVal.focus) {
        newVal.focus?.();
      }
    });

    const onFocus = (e?: IData) => {
      editorState = 'focus';
      emit('focus', e);
    };

    const onBlur = (e: IData) => {
      editorState = 'blur';
      emit('blur', e);
    };

    // 处理点击键盘
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e && e.code === 'Enter') {
        emit('enter', e);
      }
    };

    /**
     * 自定义节点样式
     * @param data 数据对象
     * @param _node 节点对象
     * @returns
     */
    const customNodeClass = (data: IData, _node: Node) => {
      return data.children.length ? ns.e('branch-node') : null;
    };

    // 根据text获取对应代码表项
    const getCodeListItem = (text: string) => {
      const list = hasChildren.value ? codeListItems.value : items.value;
      return list.find(item => item.text === text);
    };

    // 下拉框出现/隐藏时触发
    const onVisibleChange = async (visible: boolean) => {
      if (
        visible &&
        (!isLoadedCodeList.value ||
          c.editorParams.alwaysLoad === 'true' ||
          c.editorParams.alwaysload === 'true')
      ) {
        // 下拉框出现时如果没有加载过代码表去加载
        await loadCodeList();
        // 树型的情况下，得自动聚焦, 如果已经失焦就不要focus了
        if (hasChildren.value && editorRef.value && editorState !== 'outside') {
          nextTick(() => {
            editorRef.value.focus?.();
          });
        }
        nextTick(() => {
          window.dispatchEvent(new Event('resize'));
        });
      }
    };

    const fn = (data: CodeListItem[] | undefined) => {
      if (data) afterLoadCodeList(data);
    };

    useCodeListListen(c.model.appCodeListId, c.context.srfappid, fn);

    /**
     * 处理外部点击
     * - 修复element虚拟列表下拉失焦BUG
     * @param {MouseEvent} event
     */
    const handleClickOutside = (event: MouseEvent): void => {
      const target = event.target as HTMLElement;
      if (
        editorState === 'focus' &&
        !editorRef.value.$el.contains(target) &&
        !editorRef.value.$refs.popper.popperRef.contentRef.contains(target)
      ) {
        onBlur(event);
      }
    };

    /**
     * 处理清空
     * - 修复element虚拟列表下拉聚焦BUG
     */
    const handleClear = (): void => {
      onFocus();
    };

    onMounted(() => {
      useEditorNavParams();
      document.addEventListener('click', handleClickOutside, {
        capture: true,
      });
    });

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside, {
        capture: true,
      });
    });

    const prefix: { prefix?: () => JSX.Element[] | undefined } = {};
    if (c.editorParams.type === 'round') {
      Object.assign(prefix, {
        prefix: () => {
          return valueText.value.split(',').map(text => {
            const codeListItem = getCodeListItem(text);
            return (
              <div
                class={[ns.b('select-option-text'), codeListItem?.textCls]}
                style={
                  codeListItem?.color || codeListItem?.bkcolor
                    ? ns.cssVarBlock({
                        'select-option-item-color': `${
                          codeListItem.color || ''
                        }`,
                        'select-option-item-bkcolor': `${
                          codeListItem.bkcolor || ''
                        }`,
                        'select-option-item-padding': `0 var(${ns.cssVarName(
                          'spacing-base',
                        )})`,
                      })
                    : ''
                }
              >
                {codeListItem?.sysImage && (
                  <iBizIcon icon={codeListItem?.sysImage}></iBizIcon>
                )}
                {text || ''}
              </div>
            );
          });
        },
      });
    }

    return {
      c,
      ns,
      items,
      prefix,
      curValue,
      editorRef,
      isLoading,
      treeNodes,
      valueText,
      hasChildren,
      onBlur,
      onFocus,
      handleClear,
      handleKeyUp,
      customNodeClass,
      getCodeListItem,
      onVisibleChange,
    };
  },

  render() {
    const overflowMode =
      this.c.editorParams.overflowMode ||
      this.c.editorParams.overflowmode ||
      ibiz.config.pickerEditor.overflowMode;
    const isEllipsis = overflowMode === 'ellipsis';

    const editContent = (
      <el-select-v2
        ref='editorRef'
        modelValue={this.curValue || undefined}
        onUpdate:modelValue={(value: string | string[] | undefined) => {
          this.curValue = value;
        }}
        clearable
        class={[this.ns.b('select')]}
        filterable={true}
        multiple={this.c.multiple}
        allow-create={!this.c.forceSelection}
        placeholder={this.c.placeHolder ? this.c.placeHolder : ' '}
        disabled={this.disabled}
        loading={this.isLoading}
        fit-input-width={isEllipsis}
        popper-class={`${this.ns.b('popper')} ${
          this.c.editorParams.type === 'round'
            ? this.ns.bm('popper', 'round')
            : ''
        } ${this.ns.bm('popper', `${this.c.model.id}`)} ${this.ns.b(
          'virtualized-list-popper',
        )}`}
        onFocus={this.onFocus}
        onClear={this.handleClear}
        onKeyup={this.handleKeyUp}
        onVisibleChange={this.onVisibleChange}
        options={this.items}
        props={{ key: 'value', label: 'text' }}
        {...this.$attrs}
      >
        {{
          default: (data: IData) => {
            const { item } = data;
            return (
              <div
                style={
                  item.bkcolor
                    ? this.ns.cssVarBlock({
                        'select-option-item-bkcolor': `${item.bkcolor}`,
                      })
                    : ''
                }
                class={[
                  'select-v2-option-item',
                  item.cls ? item.cls : null,
                  item.disableSelect === true ? 'disabled-select-v2' : null,
                ]}
                title={showTitle(isEllipsis ? item.text : '')}
              >
                <div
                  class={[
                    this.ns.b('select-option-content'),
                    item.textCls ? item.textCls : null,
                  ]}
                  style={
                    item.color
                      ? this.ns.cssVarBlock({
                          'select-option-item-color': `${item.color}`,
                        })
                      : ''
                  }
                >
                  {item.sysImage && <iBizIcon icon={item.sysImage}></iBizIcon>}
                  <span
                    class={[
                      isEllipsis && this.ns.be('select-option-content', 'text'),
                    ]}
                  >
                    {item.text}
                  </span>
                </div>
              </div>
            );
          },
          ...this.prefix,
        }}
      </el-select-v2>
    );

    // 只读态内容
    const readonlyContent = this.valueText.split(',').map(text => {
      const codeListItem = this.getCodeListItem(text);
      return (
        <span
          class={[this.ns.b('readonly-text-item'), codeListItem?.textCls]}
          style={
            codeListItem?.color || codeListItem?.bkcolor
              ? this.ns.cssVarBlock({
                  'readonly-text-item-color': `${codeListItem.color || ''}`,
                  'select-option-item-color': `${codeListItem.color || ''}`,
                  'select-option-item-bkcolor': `${
                    (this.c.editorParams.type === 'round'
                      ? codeListItem.bkcolor
                      : '') || ''
                  }`,
                })
              : ''
          }
        >
          {codeListItem?.sysImage && (
            <iBizIcon icon={codeListItem?.sysImage}></iBizIcon>
          )}
          <span class={this.ns.be('readonly-text-item', 'label')}>{text}</span>
        </span>
      );
    });

    return (
      <div
        class={[
          this.ns.b(),
          this.ns.b('virtualized-list'),
          this.disabled ? this.ns.m('disabled') : '',
          this.readonly ? this.ns.m('readonly') : '',
          this.c.editorParams.type === 'round' && this.ns.m('round'),
          this.ns.is('has-value', this.value != null && this.value !== ''),
        ]}
      >
        {this.readonly ? readonlyContent : editContent}
      </div>
    );
  },
});
