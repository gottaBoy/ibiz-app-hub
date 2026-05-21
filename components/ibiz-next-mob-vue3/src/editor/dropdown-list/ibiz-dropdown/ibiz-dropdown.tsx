import { ref, Ref, defineComponent, computed, watch } from 'vue';
import {
  getDropdownProps,
  getEditorEmits,
  useNamespace,
} from '@ibiz-template/vue3-util';
import './ibiz-dropdown.scss';
import { DropDownListEditorController } from '../dropdown-list-editor.controller';
import { IBizCommonRightIcon } from '../../common/right-icon/right-icon';
import { usePopstateListener } from '../../../util';

/**
 * 移动端下拉列表（单选）
 * @primary
 * @description  使用van-field组件和van-popup组件，用于在弹出的选择列表中选择单条数据的场景。支持编辑器类型包含：`移动端下拉列表（单选）`
 * @editorparams {name:readonly,parameterType:boolean,defaultvalue:false,description:设置编辑器是否为只读态}
 * @ignoreprops  autoFocus | overflowMode
 * @ignoreemits  blur | focus | infoTextChange | enter
 */
export const IBizDropdown = defineComponent({
  name: 'IBizDropdown',
  props: getDropdownProps<DropDownListEditorController>(),
  emits: getEditorEmits(),
  setup(props, { emit }) {
    const ns = useNamespace('dropdown');
    const c = props.controller;

    const items: Ref<readonly IData[]> = ref([]);

    const showPicker = ref(false);

    // 是否是树形
    const hasChildren = ref(false);

    // 搜索值
    const searchValue = ref('');

    // 树数据
    const treeNodes: Ref<IData[]> = ref([]);

    // 处理树数据
    const handleTreeNodes = (nodes: readonly IData[]) => {
      if (nodes.length === 0) {
        return [];
      }
      const list: IData[] = [];
      nodes.forEach((codeItem: IData) => {
        const tempObj: IData = {
          label: codeItem.text,
          value: codeItem.value,
          children: [],
        };
        if (codeItem.children && codeItem.children.length > 0) {
          tempObj.children = handleTreeNodes(codeItem.children);
        }
        list.push(tempObj);
      });
      return list;
    };

    c.loadCodeList(props.data!).then((codeList: readonly IData[]) => {
      items.value = codeList;
      for (let i = 0; i < items.value.length; i++) {
        const _item = items.value[i];
        if (_item.children) {
          hasChildren.value = true;
          treeNodes.value = handleTreeNodes(codeList);
          break;
        }
      }
    });

    // 当前值
    const curValue: Ref<string | undefined | number> = ref('');

    watch(
      () => props.value,
      newVal => {
        if (newVal !== undefined) {
          curValue.value = newVal;
          if (newVal === null) {
            curValue.value = '';
          }
        } else {
          curValue.value = '';
        }
      },
      { immediate: true },
    );

    const valueText = computed(() => {
      const index = items.value.findIndex(
        // 不匹配类型 兼容数值属性配置字符串代码表
        // eslint-disable-next-line eqeqeq
        (item: IData) => item.value === curValue.value,
      );
      if (index !== -1) {
        return items.value[index].text;
      }
      return '';
    });

    // 自动聚焦
    const editorRef = ref();
    if (props.autoFocus) {
      watch(editorRef, newVal => {
        if (newVal) {
          newVal.focus();
        }
      });
    }
    const onFocus = () => {
      emit('focus');
    };
    const onBlur = () => {
      setTimeout(() => {
        emit('blur');
      }, 100);
    };

    // 根据text获取对应代码表项
    const getCodeListItem = (text: string | undefined) => {
      return items.value.find(item => item.text === text);
    };

    // 清除
    const onClear = (event: MouseEvent) => {
      event.stopPropagation();
      event.preventDefault();
      showPicker.value = false;
      emit('change', null);
    };

    // 选中
    const onSelect = (select?: IData) => {
      showPicker.value = false;
      if (select) {
        curValue.value = select.value;
      }
      emit('change', !select ? null : select.value);
    };

    const onClose = () => {
      showPicker.value = false;
    };

    // 绘制弹出抽屉顶部
    const renderPopHeader = () => {
      return (
        <div class={ns.be('pop', 'header')}>
          <div class={ns.bem('pop', 'header', 'left')}>
            <van-icon name='cross' onClick={onClose} />
            <span class={ns.bem('pop', 'header', 'caption')}>
              {ibiz.i18n.t('editor.dropdown.pleaseSelect')}
            </span>
          </div>
          <div class={ns.bem('pop', 'header', 'right')} onClick={onClear}>
            {ibiz.i18n.t('editor.dropdown.clear')}
          </div>
        </div>
      );
    };

    // 绘制搜索框
    const renderSearchInput = () => {
      return (
        <div class={ns.be('pop', 'search')}>
          <van-field
            v-model={searchValue.value}
            placeholder={ibiz.i18n.t('editor.dropdown.searchPlaceholder')}
          >
            {{
              'left-icon': () => {
                return <ion-icon name='search-outline'></ion-icon>;
              },
            }}
          </van-field>
        </div>
      );
    };

    // 无数据
    const renderNoData = () => {
      return <iBizNoData></iBizNoData>;
    };

    // 绘制选项列表
    const renderSelectList = () => {
      return (
        <div class={ns.be('pop', 'list')}>
          {items.value.length !== 0 &&
            items.value.map((item: IData) => {
              if (item.text?.indexOf(searchValue.value) < 0) return;
              return (
                <div
                  class={ns.bem('pop', 'list', 'item')}
                  onClick={() => onSelect(item)}
                >
                  <div
                    class={[
                      ns.bem('pop', 'list', 'item-text'),
                      ns.is('bkcolor', !!item?.bkcolor),
                    ]}
                    style={
                      item?.color || item?.bkcolor
                        ? ns.cssVarBlock({
                            'pop-color-item': `${item.color || ''}`,
                            'pop-color-item-bg': `${item.bkcolor || ''}`,
                          })
                        : ''
                    }
                  >
                    {item.sysImage && (
                      <iBizIcon icon={item.sysImage}></iBizIcon>
                    )}
                    {item.text}
                  </div>
                  {item.value === curValue.value && (
                    <van-icon
                      class={ns.bem('pop', 'list', 'selected')}
                      name='success'
                    />
                  )}
                </div>
              );
            })}
          {items.value.length === 0 && renderNoData()}
        </div>
      );
    };

    // 绘制弹出抽屉内容
    const renderPopContent = () => {
      return (
        <div class={ns.be('pop', 'content')}>
          {renderSearchInput()}
          {renderSelectList()}
        </div>
      );
    };

    const closeDrawer = () => {
      showPicker.value = false;
    };

    const refreshCodeList = () => {
      c.loadCodeList(props.data!).then((codeList: readonly IData[]) => {
        items.value = codeList;
      });
    };

    const onPopClose = () => {
      searchValue.value = '';
    };

    // 监听popstate事件
    usePopstateListener(closeDrawer);

    return {
      ns,
      c,
      curValue,
      items,
      valueText,
      hasChildren,
      onBlur,
      onFocus,
      editorRef,
      treeNodes,
      showPicker,
      getCodeListItem,
      renderPopHeader,
      renderPopContent,
      refreshCodeList,
      onPopClose,
    };
  },

  render() {
    const readonlyContent = this.valueText.split(',').map((text: string) => {
      const codeListItem = this.getCodeListItem(text);
      return (
        <span
          class={[
            this.ns.b('readonly-text-item'),
            codeListItem?.textCls,
            codeListItem?.bkcolor
              ? this.ns.bm('readonly-text-item', 'has-bg')
              : '',
          ]}
          style={
            codeListItem?.color || codeListItem?.bkcolor
              ? this.ns.cssVarBlock({
                  'color-readonly': `${codeListItem.color || ''}`,
                  'color-item': `${codeListItem.color || ''}`,
                  'color-item-bg': `${codeListItem.bkcolor || ''}`,
                })
              : ''
          }
        >
          <span class={this.ns.be('readonly-text-item', 'label')}>{text}</span>
        </span>
      );
    });

    const optionValue = this.getCodeListItem(this.valueText);
    // 编辑态内容
    const editContent = this.hasChildren
      ? ibiz.i18n.t('editor.dropdownList.noSupportTreePicker')
      : [
          <van-field
            ref='editorRef'
            v-model={this.valueText}
            clearable
            readonly
            class={[this.ns.e('select')]}
            placeholder={this.c.placeHolder}
            onBlur={this.onBlur}
            disabled={this.disabled}
            onFocus={this.onFocus}
            onClick={() => {
              if (!this.disabled) {
                this.showPicker = true;
                this.refreshCodeList();
              }
            }}
            style={
              optionValue?.color || optionValue?.bkcolor
                ? this.ns.cssVarBlock({
                    'color-item': `${optionValue.color || ''}`,
                    'color-item-bg': `${optionValue.bkcolor || ''}`,
                  })
                : ''
            }
          >
            {{
              input: () => {
                if (this.valueText) {
                  return (
                    <span
                      class={[
                        this.ns.e('select-item'),
                        optionValue?.bkcolor
                          ? this.ns.em('select-item', 'has-bg')
                          : '',
                      ]}
                    >
                      {this.valueText}
                    </span>
                  );
                }
                return (
                  <div class={[this.ns.e('placeholder')]}>
                    {this.c.placeHolder}
                  </div>
                );
              },
              'right-icon': <IBizCommonRightIcon></IBizCommonRightIcon>,
            }}
          </van-field>,
          <van-popup
            v-model:show={this.showPicker}
            round
            teleport='body'
            close-on-popstate={true}
            position='bottom'
            style={{ height: '80%' }}
            onClose={this.onPopClose}
          >
            <div class={this.ns.b('pop')}>
              {this.renderPopHeader()}
              {this.renderPopContent()}
            </div>
          </van-popup>,
        ];
    return (
      <div
        class={[
          this.ns.b(),
          this.disabled ? this.ns.m('disabled') : '',
          this.readonly ? this.ns.m('readonly') : '',
        ]}
      >
        {this.readonly ? readonlyContent : editContent}
      </div>
    );
  },
});
