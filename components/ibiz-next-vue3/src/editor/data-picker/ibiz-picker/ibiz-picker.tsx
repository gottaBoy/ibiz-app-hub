/* eslint-disable no-unused-expressions */
import {
  h,
  ref,
  Ref,
  watch,
  computed,
  onMounted,
  defineComponent,
  resolveComponent,
  onBeforeUnmount,
} from 'vue';
import {
  renderString,
  useNamespace,
  getEditorEmits,
  getDataPickerProps,
} from '@ibiz-template/vue3-util';
import { isEmpty, isNil } from 'ramda';
import { debounce } from 'lodash-es';
import { showTitle } from '@ibiz-template/core';
import { IAppDEUIActionGroupDetail } from '@ibiz/model-core';
import { PickerEditorController } from '../picker-editor.controller';
import './ibiz-picker.scss';

/**
 * 数据选择
 *
 * @description 使用el-input和el-autocomplete组件封装，用于选择单项数据，支持 AC 实时搜索，输入关键词即可从服务器获取数据；通过模态窗口呈现自定义样式的选择界面，解决下拉选择展示、检索及样式的局限，支持打开数据链接视图。支持编辑器类型包含：`数据选择`、`数据选择（无AC）`、`数据选择（无AC、数据链接）`、`数据选择（下拉、数据链接）`、`数据选择（数据链接）`、`数据选择（无按钮）`
 * @primary
 * @editorparams {"name":"overflowmode","parameterType":"'auto' | 'ellipsis'","defaultvalue":"'auto'","description":"用于控制该编辑器下拉区域的宽度显示方式。当参数值为 'auto' 时，下拉区域宽度会根据内容自动展开；当参数值为 'ellipsis' 时，下拉区域宽度将与输入框保持一致，若内容超出宽度则会显示省略号，鼠标悬浮在内容上时会出现 tooltip 提示信息"}
 * @editorparams {"name":"valuetype","parameterType":"string","description":"编辑器的值类型"}
 * @editorparams {"name":"objectidfield","parameterType":"string","description":"值类型为OBJECT时的对象标识属性"}
 * @editorparams {"name":"objectnamefield","parameterType":"string","description":"值类型为OBJECT时的对象名称属性"}
 * @editorparams {"name":"objectvaluefield","parameterType":"string","description":"值类型为OBJECT时的对象值属性"}
 * @editorparams {"name":"readonly","parameterType":"boolean","defaultvalue":false,"description":"设置编辑器是否为只读态"}
 * @editorparams {"name":"actionpostion","parameterType":"'top' | 'bottom'","defaultvalue":"'bottom'","description":"设置AC模式行为组位置，默认在下拉底部"}
 * @ignoreprops overflowMode
 */
export const IBizPicker = defineComponent({
  name: 'IBizPicker',
  props: getDataPickerProps<PickerEditorController>(),
  emits: getEditorEmits(),
  setup(props, { emit }) {
    const ns = useNamespace('picker');

    const c = props.controller!;

    // 当前值
    const curValue: Ref<Array<string> | string | null> = ref('');

    // 实体数据集
    const items: Ref<IData[]> = ref([]);

    // 是否显示所有数据
    const isShowAll = ref(true);

    // 是否编辑态
    const isEditable = ref(false);

    // 编辑器Ref
    const editorRef = ref();

    // 是否已加载过
    const isLoaded = ref(false);

    const isReverse = ref(false);

    // 行为位置
    const actionPostion: 'top' | 'bottom' =
      c.model.editorParams?.actionpostion || 'bottom';

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

    const resetCurValue = () => {
      const { value } = props;
      if (c.model.valueType === 'OBJECT') {
        curValue.value =
          value && c.objectNameField ? (value as IData)[c.objectNameField] : '';
      } else {
        curValue.value = (value as string) || '';
      }
      const valueItem = props.data[c.valueItem];
      const index = items.value.findIndex((item: IData) =>
        Object.is(item[c.keyName], valueItem),
      );
      if (index !== -1) return;
      // items里匹配不到当前值项值时，生成自身的选项
      items.value = [];
      if (value && !isEmpty(valueItem)) {
        items.value.push({ [c.textName]: value, [c.keyName]: valueItem });
      }
    };

    watch(
      () => props.value,
      () => {
        resetCurValue();
      },
      { immediate: true },
    );

    const setEditable = (flag: boolean) => {
      if (flag) {
        isEditable.value = flag;
      } else {
        setTimeout(() => {
          isEditable.value = flag;
        }, 100);
      }
    };

    // 处理选中数据后的处理逻辑
    const handleDataSelect = async (data: IData) => {
      // 处理回填数据
      const dataItems = await c.calcFillDataItems(data);
      if (dataItems.length) {
        dataItems.forEach(dataItem => {
          emit('change', dataItem.value, dataItem.id);
        });
      }

      Object.assign(data, {
        [c.keyName]: data[c.keyName] ? data[c.keyName] : data.srfkey,
        [c.textName]: data[c.textName] ? data[c.textName] : data.srfmajortext,
      });

      if (c.valueItem) {
        emit('change', data[c.keyName], c.valueItem);
      }
      if (c.model.valueType === 'OBJECT') {
        emit('change', c.handleObjectParams(data));
      } else {
        emit('change', data[c.textName]);
      }

      setEditable(false);
    };

    /**
     * @description 计算选中项数据
     * @returns {*}  {IData[]}
     */
    const calcSelectItem = (): IData[] => {
      const selectItems: IData[] = [];
      if (curValue.value) {
        const selectItem = {
          srfkey: props.data[c.valueItem],
          srfmajortext: curValue.value,
          ...(c.model.valueType === 'OBJECT' &&
          props.value &&
          c.objectValueField
            ? (props.value as IData)[c.objectValueField as string]
            : {}),
        };
        if (c.deACMode && c.dataItems.length)
          c.dataItems.forEach((item: IData) =>
            Object.assign(selectItem, {
              [item.appDEFieldId]: props.data[item.id],
            }),
          );
        selectItems.push(selectItem);
      }
      return selectItems;
    };

    // 打开数据选择视图
    const openPickUpView = async (e: MouseEvent) => {
      e.stopPropagation();
      const res = await c.openPickUpView(
        props.data,
        JSON.stringify(calcSelectItem()),
      );
      if (res && res[0]) {
        await handleDataSelect(res[0]);
      }
    };

    // 打开数据链接视图
    const openLinkView = async (e: MouseEvent) => {
      e.stopPropagation();
      const res = await c.openLinkView(props.data);
      if (res && res.ok && res.data && res.data.length > 0) {
        await handleDataSelect(res.data[0]);
      }
    };

    // 更新下拉列表数据回调方法
    let listCallback: (_items: IData[]) => void | void;
    // 搜索值
    let searchQuery = '';

    // 更新下拉列表数据
    const handleCallback = (cb: (_items: IData[]) => void) => {
      const callbackItems: IData[] = items.value.length
        ? [...items.value]
        : [{ srftype: 'empty' }];
      actionPostion === 'top'
        ? callbackItems.unshift(...c.actionDetails)
        : callbackItems.push(...c.actionDetails);

      if (c.isShowLoadMore) {
        callbackItems.push({ srftype: 'loadmore' });
      }
      cb(callbackItems);
    };
    // 搜索
    const onSearch = async (query: string, cb?: (_items: IData[]) => void) => {
      if (c.model.appDataEntityId) {
        let trimQuery = '';
        if (query !== props.value) {
          trimQuery = query.trim();
        }
        const res = await c.getServiceData(trimQuery, props.data);
        if (res) {
          items.value = res.data as IData[];
          isLoaded.value = true;
          if (cb && cb instanceof Function) {
            searchQuery = trimQuery;
            listCallback = cb;
            handleCallback(cb);
          }
        }
      }
    };

    /**
     * 加载更多
     * @return {*}  {Promise<void>}
     */
    const loadMore = async (): Promise<void> => {
      if (c.total > items.value.length && c.model.appDataEntityId) {
        const res = await c.getServiceData(searchQuery, props.data, {
          isLoadMore: true,
        });
        if (res) {
          items.value = [...items.value, ...(res.data as IData[])];
          if (listCallback) {
            handleCallback(listCallback);
          }
        }
      }
    };

    // 往外抛值
    const onACSelect = async (item: IData) => {
      isShowAll.value = true;
      setEditable(false);
      // 回车选中空白
      if (
        item.srftype === 'empty' ||
        item.detailType === 'DEUIACTION' ||
        item.srftype === 'loadmore'
      )
        return resetCurValue();
      await handleDataSelect(item);
    };

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

    const closeCircle = (c.linkView ? 1 : 0) + (c.pickupView ? 1 : 0);

    // 自动聚焦
    watch(editorRef, newVal => {
      if (props.autoFocus && newVal && newVal.focus) {
        newVal.focus();
      }
    });

    const onFocus = (e: IData) => {
      isReverse.value = true;
      // 自动填充时聚焦时手动loading，防止闪烁
      if (!c.noAC) {
        editorRef.value.loading = true;
      }
      emit('focus', e);
      setEditable(true);
    };

    const onBlur = (e: IData) => {
      isReverse.value = false;
      // 失焦时重置当前值对应的label
      resetCurValue();
      emit('blur', e);
      setEditable(false);
    };

    // 处理点击键盘
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e && e.code === 'Enter') {
        emit('enter', e);
      }
    };

    const valueText = computed(() => {
      return renderString(curValue.value);
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

    // 加载更多Ref
    const loadmoreRef = ref();

    // 是否关闭弹窗
    const isClosePopper = ref(false);
    // 处理加载更多的点击事件
    const onLoadMoreClick = async (_event: MouseEvent) => {
      _event.preventDefault();
      _event.stopPropagation();
      loadMore();
      editorRef.value?.popperRef?.onOpen();
      isClosePopper.value = true;
    };

    // 处理弹窗关闭逻辑
    const handlePopperClose = (_event: MouseEvent) => {
      // 点击加载更多
      const isClickInside = loadmoreRef.value?.contains(_event.target);
      // 点击输入框
      const isFocus = editorRef.value?.inputRef?.input.contains(_event.target);
      if (!isClickInside && !isFocus && isClosePopper.value) {
        editorRef.value?.popperRef?.onClose();
        isClosePopper.value = false;
      }
    };

    //  获取弹窗中的滚动容器元素
    const getPopperScroll = (): IParams | void => {
      return editorRef.value?.popperRef?.popperRef.contentRef.querySelector(
        '.el-scrollbar__wrap',
      );
    };

    // 处理滚动加载
    const handleScrollLoad = async () => {
      const infiniteScroll = getPopperScroll();

      // 确保滚动容器存在
      if (!infiniteScroll) return;

      // 获取滚动容器的相关属性
      const { scrollTop, scrollHeight, clientHeight } = infiniteScroll;

      // 计算当前滚动位置与底部的距离（预留20px的缓冲）
      const distanceToBottom = scrollHeight - scrollTop - clientHeight;

      // 当滚动到接近底部（距离小于等于20px）且不在加载中时，触发加载
      if (distanceToBottom <= 20) {
        await loadMore();
      }
    };

    const debScrollLoad = debounce(handleScrollLoad, 300);

    // 初始化懒加载逻辑
    const initLazyLoad = () => {
      switch (c.pagingMode) {
        case 3:
          document.addEventListener('mouseup', handlePopperClose);
          break;
        case 2:
          getPopperScroll()?.addEventListener('scroll', debScrollLoad);
          break;
        default:
          break;
      }
    };

    onMounted(() => {
      watch(
        () => props.data[c.valueItem],
        async (newVal, oldVal) => {
          // 值项发生变化选中值项对应文本值
          if (newVal !== oldVal) {
            // 当只配置值项时，值项有值但文本没值需加载数据回显
            if (!isLoaded.value && isNil(props.value) && !isNil(newVal)) {
              await onSearch('');
            }
            const curItem = items.value.find((item: IData) =>
              Object.is(item[c.keyName], newVal),
            );
            if (curItem) {
              curValue.value = curItem[c.textName];
              if (isNil(props.value) && !isNil(newVal)) {
                emit('change', curValue.value, c.model.id, true);
              }
            }
            // 如果值项被清空了，主文本也需清空
            if (newVal === null) {
              emit('change', null, c.model.id, true);
            }
          }

          initLazyLoad();
        },
        { immediate: true },
      );
    });

    onBeforeUnmount(() => {
      switch (c.pagingMode) {
        case 3:
          document.removeEventListener('mouseup', handlePopperClose);
          break;
        case 2:
          getPopperScroll()?.removeEventListener('scroll', debScrollLoad);
          break;
        default:
          break;
      }
    });

    const renderActionItem = (detail: IAppDEUIActionGroupDetail) => {
      if (!c.groupActionState[detail.id!].visible) return;
      return (
        <div
          title={showTitle(detail.tooltip)}
          class={[
            ns.e('action-item'),
            ns.is('disabled', c.groupActionState[detail.id!].disabled),
          ]}
          onClick={event => {
            if (!c.groupActionState[detail.id!].disabled)
              c.onActionClick(detail, props.data, event);
          }}
        >
          {detail.showIcon && detail.sysImage && (
            <iBizIcon
              class={ns.em('action-item', 'icon')}
              icon={detail.sysImage}
            ></iBizIcon>
          )}
          <span class={ns.em('action-item', 'caption')}>
            {detail.showCaption ? detail.caption : ''}
          </span>
        </div>
      );
    };

    const renderEmpty = () => {
      return (
        <iBizNoData
          class={ns.e('empty')}
          onClick={(event: MouseEvent) => event.stopPropagation()}
        ></iBizNoData>
      );
    };

    const renderLoadMore = () => {
      return (
        <div
          ref={loadmoreRef}
          class={ns.e('loadmore')}
          onClick={_event => onLoadMoreClick(_event)}
        >
          {ibiz.i18n.t('editor.common.loadMore')}
        </div>
      );
    };

    return {
      ns,
      c,
      items,
      curValue,
      valueText,
      editorRef,
      closeCircle,
      isEditable,
      isReverse,
      showFormDefaultContent,
      onBlur,
      onFocus,
      onClear,
      onSearch,
      onACSelect,
      handleKeyUp,
      setEditable,
      renderEmpty,
      renderLoadMore,
      openLinkView,
      openPickUpView,
      renderActionItem,
    };
  },
  render() {
    const overflowMode =
      this.c.editorParams.overflowMode ||
      this.c.editorParams.overflowmode ||
      ibiz.config.pickerEditor.overflowMode;
    const isEllipsis = overflowMode === 'ellipsis';

    // 每一项内容
    const itemContent = (item: IData) => {
      const panel = this.c.deACMode?.itemLayoutPanel;
      const { context, params } = this.c;
      let selected =
        (item[this.c.textName] || item.srfmajortext) === this.curValue;
      if (this.c.valueItem) {
        selected =
          (item[this.c.keyName] || item.srfkey) === this.data[this.c.valueItem];
      }
      const className = [
        this.ns.is('active', selected),
        this.ns.e('transfer-item'),
      ];
      if (this.c.acItemProvider) {
        const component = resolveComponent(this.c.acItemProvider.component);
        return h(component, {
          item,
          controller: this.c,
          class: className,
          onClick: () => {
            this.onACSelect(item);
          },
        });
      }
      return panel ? (
        <iBizControlShell
          data={item}
          class={className}
          modelData={panel}
          context={context}
          params={params}
          onClick={() => {
            this.onACSelect(item);
          }}
        ></iBizControlShell>
      ) : (
        <div
          class={[this.ns.is('ellipsis', isEllipsis), ...className]}
          title={showTitle(isEllipsis ? item[this.c.textName] : '')}
          onClick={() => {
            this.onACSelect(item);
          }}
        >
          {item[this.c.textName]}
        </div>
      );
    };

    // 编辑态内容
    const editContent = this.c.noAC ? (
      <el-input
        ref='editorRef'
        class={[this.ns.b('input')]}
        v-model={this.curValue}
        clearable
        placeholder={this.c.placeHolder}
        onClear={this.onClear}
        disabled={this.disabled}
        onBlur={this.onBlur}
        onFocus={this.onFocus}
        onKeyup={this.handleKeyUp}
        {...this.$attrs}
      >
        {{
          suffix: () => {
            if (this.$slots.append) {
              return this.$slots.append({});
            }
            if (this.c.noButton) {
              return;
            }
            return [
              this.c.model.pickupAppViewId ? (
                <ion-icon
                  onClick={this.openPickUpView}
                  name='search'
                ></ion-icon>
              ) : null,
              this.c.model.linkAppViewId && this.curValue ? (
                <ion-icon
                  onClick={this.openLinkView}
                  name='link-arrow'
                ></ion-icon>
              ) : null,
            ];
          },
        }}
      </el-input>
    ) : (
      <div
        class={[
          this.ns.e('autocomplete'),
          this.ns.m(this.closeCircle.toString()),
        ]}
      >
        <el-autocomplete
          ref='editorRef'
          class={[this.ns.b('input')]}
          v-model={this.curValue}
          value-key={this.c.textName}
          placeholder={this.c.placeHolder}
          clearable
          popper-class={[
            this.ns.e('transfer'),
            this.ns.bm('popper', `${this.c.model.id}`),
            this.ns.is('empty', !this.items.length),
          ]}
          fetch-suggestions={this.onSearch}
          onClear={this.onClear}
          onBlur={this.onBlur}
          onFocus={this.onFocus}
          onKeyup={this.handleKeyUp}
          onSelect={this.onACSelect}
          disabled={this.disabled}
          fit-input-width={isEllipsis}
          {...this.$attrs}
        >
          {{
            default: ({ item }: { item: IData }) => {
              if (this.$slots.append) return this.$slots.append({});
              if (item.srftype === 'empty') return this.renderEmpty();
              if (item.srftype === 'loadmore') return this.renderLoadMore();
              if (item.detailType === 'DEUIACTION')
                return this.renderActionItem(item as IAppDEUIActionGroupDetail);
              return itemContent(item);
            },
            suffix: () => {
              if (this.c.noButton) return;
              return [
                this.c.model.pickupAppViewId ? (
                  <ion-icon
                    onClick={this.openPickUpView}
                    name='search'
                  ></ion-icon>
                ) : null,
                this.c.model.linkAppViewId && this.curValue ? (
                  <ion-icon
                    onClick={this.openLinkView}
                    name='link-arrow'
                  ></ion-icon>
                ) : null,
                this.c.model.showTrigger && !this.c.model.pickupAppViewId ? (
                  <ion-icon
                    name='chevron-down-outline'
                    class={[
                      this.ns.e('suffix'),
                      this.ns.is('reverse', this.isReverse),
                    ]}
                  ></ion-icon>
                ) : null,
              ];
            },
          }}
        </el-autocomplete>
      </div>
    );

    // 只读态内容
    const readonlyContent = (
      <div class={(this.ns.b(), this.ns.m('readonly'))}>{this.valueText}</div>
    );

    // 表单默认内容
    const formDefaultContent = (
      <div class={this.ns.b('form-default-content')}>
        {this.curValue ? (
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
