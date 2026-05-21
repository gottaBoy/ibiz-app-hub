import { defineComponent, ref, Ref } from 'vue';
import {
  getCascaderProps,
  getEditorEmits,
  useNamespace,
} from '@ibiz-template/vue3-util';
import './ibiz-cascader.scss';
import { clone } from 'ramda';
import { createUUID } from 'qx-util';
import { CascaderEditorController } from '../cascader-editor.controller';
import { IBizCommonRightIcon } from '../../common/right-icon/right-icon';
import { usePopstateListener } from '../../../util';

/**
 * 移动端级联选择器
 * @primary
 * @description 使用van-cascader组件，用于选择具有级联关系的数据。支持编辑器类型包含：`移动端级联选择器`
 * @editorparams {name:editorstyle,parameterType:string,defaultvalue:'default',description:值为default时，加载下级数据时，从节点的value属性获取值，否则从节点的data属性里的value上获取值}
 * @editorparams {name:separator,parameterType:string,defaultvalue:'/',description:分隔符，用于拼接选择的值}
 * @editorparams {name:readonly,parameterType:boolean,defaultvalue:false,description:设置编辑器是否为只读态}
 * @ignoreprops  autoFocus | overflowMode
 * @ignoreemits  blur | focus | infoTextChange | enter
 */
export const IBizCascader = defineComponent({
  name: 'IBizCascader',
  props: getCascaderProps<CascaderEditorController>(),
  emits: getEditorEmits(),
  setup(props, { emit }) {
    const ns = useNamespace('cascader');

    const c = props.controller!;

    const editorModel = c.model;

    const cascaderKey = createUUID();

    // 关系表单项集合
    const valueItems: Ref<IData[]> = ref([]);
    const editorItems = editorModel.editorItems;
    if (editorItems && editorItems.length > 0) {
      const editorItemNames: IData[] = editorItems.map((item: IData) => {
        return {
          name: item.id,
          appDataEntityId: item.appDataEntityId,
          appDEDataSetId: item.appDEDataSetId,
        };
      });
      valueItems.value = editorItemNames;
    }

    // 编辑器样式
    let editorStyle = 'default';
    // 连接符
    let separator = '/';

    if (editorModel.editorParams) {
      if (editorModel.editorParams.editorStyle) {
        editorStyle = editorModel.editorParams.editorStyle;
      }
      if (editorModel.editorParams.editorstyle) {
        editorStyle = editorModel.editorParams.editorstyle;
      }
      if (editorModel.editorParams.separator) {
        separator = editorModel.editorParams.separator;
      }
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
    const show = ref(false);
    const isLoading = ref(false);
    const onClose = () => {
      show.value = false;
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
      const { tabIndex, value } = node;
      let tempNodes: IData[] = [];
      if (tabIndex === 0) {
        // 已有回显数据
        // handleSelectData();
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
      });
      return tempNodes;
    };

    // 加载数据
    const loadData = async (node: IData) => {
      const { tabIndex } = node;
      // eslint-disable-next-line no-nested-ternary
      const value = Object.is(editorStyle, 'default')
        ? node.value
        : node.data
          ? node.data.value
          : null;
      const valueItem = valueItems.value[tabIndex];
      isLoading.value = true;
      try {
        if (valueItem.appDataEntityId && valueItem.appDEDataSetId) {
          const { context, params } = await handleQueryParams(tabIndex, value);
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
                text: item.srfmajortext
                  ? item.srfmajortext
                  : ibiz.i18n.t('editor.cascader.ibizCascader.title', {
                      index,
                    }),
                nodekey: `${value ? `${value}_${item.srfkey}` : item.srfkey}`,
                children:
                  tabIndex === valueItems.value.length - 1 ? undefined : [],
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
              fillTreeData(node, nodes);
            }
          } else {
            fillTreeData(node, [
              {
                value: `empty_${cascaderKey}`,
                text: ibiz.i18n.t('editor.cascader.noData'),
                disabled: true,
                className: ns.e('empty'),
              },
            ]);
          }
        }
      } catch (error) {
        console.log(valueItem, '查询数据集失败');
      }
      isLoading.value = false;
    };

    // 处理级联选择器值改变
    const handleCascaderValueChange = ($event: IData) => {
      const { selectedOptions } = $event;
      onClose();
      // 计算值项选中数据
      valueItemData.value.forEach((valueItem: IData) => {
        valueItem.value = [];
      });
      if (selectedOptions?.length) {
        (selectedOptions as IData[]).forEach((item: IData, index: number) => {
          valueItemData.value[index].value.push(item.value);
        });
      }
      // 计算当前选中数据文本
      const curSelectText: string[] = selectedOptions.map(
        (item: IData) => item.text,
      );
      valueItemData.value.forEach((valueItem: IData) => {
        emit(
          'change',
          valueItem.value.length > 0 ? valueItem.value.join(',') : null,
          valueItem.name,
        );
      });

      emit(
        'change',
        curSelectText.length > 0 ? curSelectText.join(separator) : null,
      );
    };

    const onBlur = () => {
      emit('blur');
    };

    const onFocus = () => {
      emit('focus');
    };

    const openPopup = () => {
      if (props.disabled || props.readonly) {
        return;
      }
      // 首次加载
      if (treeData.value.length === 0) {
        loadData({ tabIndex: 0 });
      }
      show.value = !show.value;
    };

    const onChange = ($event: IData) => {
      const tabIndex = $event.tabIndex + 1;
      // 下标和值项数量一致 表示已经选择完成
      if (tabIndex === valueItems.value.length) {
        handleCascaderValueChange($event);
        return;
      }
      loadData({ ...$event, tabIndex });
    };

    // 监听popstate事件
    usePopstateListener(onClose);

    return {
      ns,
      c,
      valueItems,
      editorStyle,
      separator,
      show,
      treeData,
      items,
      treeSelectData,
      valueItemData,
      defaultCheckedKeys,
      searchValue,
      selectValue,
      isLoading,
      onChange,
      onBlur,
      onFocus,
      openPopup,
      onClose,
      loadData,
      handleCascaderValueChange,
    };
  },
  render() {
    return (
      <div
        class={[
          this.ns.b(),
          this.disabled ? this.ns.m('disabled') : '',
          this.readonly ? this.ns.m('readonly') : '',
        ]}
      >
        {this.readonly && this.value}
        {!this.readonly && (
          <van-field
            modelValue={this.value}
            readonly
            disabled={this.disabled}
            placeholder={this.c.placeHolder}
            onBlur={this.onBlur}
            onFocus={this.onFocus}
            onClick={this.openPopup}
          >
            {{
              'right-icon': !this.readonly && (
                <IBizCommonRightIcon></IBizCommonRightIcon>
              ),
            }}
          </van-field>
        )}
        <van-popup
          v-model:show={this.show}
          round
          position='bottom'
          teleport='body'
          close-on-popstate={true}
        >
          <van-cascader
            v-model={this.selectValue}
            class={[this.ns.e('content')]}
            title={this.c.placeHolder ? this.c.placeHolder : ' '}
            options={this.treeData}
            onClose={this.onClose}
            onChange={this.onChange}
            onFinish={this.handleCascaderValueChange}
          />
        </van-popup>
      </div>
    );
  },
});
