/* eslint-disable no-plusplus */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-restricted-syntax */
import { ref, Ref, watch, computed, defineComponent } from 'vue';
import { useNamespace, getEditorEmits, getCascaderProps } from '@ibiz-template/vue3-util';
import { ICascader } from '@ibiz/model-core';
import { CascaderEditorController } from '../cascader-editor.controller';
import './ibiz-cascader.scss';

type CascaderOption = {
  /**
   * @description 选项对应的值
   * @type {string}
   */
  value: string;
  /**
   * @description 选项对应的文本
   * @type {string}
   */
  label: string;
  /**
   * @description 原始数据
   * @type {IData}
   */
  data: IData;
  /**
   * @description 是否为叶子节点
   * @type {string}
   */
  leaf?: boolean;
  /**
   * @description 是否禁用选项
   * @type {boolean}
   */
  disabled?: boolean;
  /**
   * @description 子选项列表
   * @type {CascaderOption[]}
   */
  children?: CascaderOption[];
};

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
    const editorModel: ICascader = c.model;
    // 关系表单项集合
    const valueItems = editorModel.editorItems || [];
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
      if (editorModel.editorParams.size) {
        const _size = editorModel.editorParams.size.toLowerCase();
        size = ['large', 'small', 'default'].includes(_size)
          ? _size
          : 'default';
      }
      if (editorModel.editorParams.filterable)
        filterable = c.toBoolean(editorModel.editorParams.filterable);
      if (editorModel.editorParams.multiple)
        multiple = c.toBoolean(editorModel.editorParams.multiple);
      if (editorModel.editorParams.separator)
        separator = editorModel.editorParams.separator;
      if (editorModel.editorParams.leaffield)
        leafField = editorModel.editorParams.leaffield;
    }

    // 树节点数据
    const nodes: Ref<CascaderOption[]> = ref([]);
    // 平铺数据集
    const items: Ref<CascaderOption[]> = ref([]);
    // 选中值
    const selectValue: Ref<string[] | string[][]> = ref([]);
    // 树选中数据
    const treeSelectData: Ref<IData[]> = ref([]);
    // 值项数据
    const valueItemData: Ref<{ name: string; value: string[] }[]> = ref(
      valueItems.map(item => ({ name: item.id!, value: [] })),
    );

    // 是否编辑态
    const isEditable = ref(false);

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

    const valueText = computed(() => {
      let value: string[] | null = null;
      try {
        value = JSON.parse(props.value);
      } catch (error) {
        ibiz.log.error(error);
      }
      return value;
    });

    /**
     * @description 计算默认选中
     * @returns {*}  {void}
     */
    const calcDefaultSelect = (): void => {
      const selectionText = valueText.value || [];
      const pathCount = selectionText.length;
      const levelCount = valueItemData.value.length;

      // 每个层级的读取指针（记录已取到第几个）
      const pointers: number[] = new Array(levelCount).fill(0);

      const result: string[][] = [];

      for (let i = 0; i < pathCount; i++) {
        const depth = selectionText[i].split(separator).length; // 当前路径的层级数
        const path: string[] = [];

        for (let level = 0; level < depth; level++) {
          // 确保该层级存在且还有值可取
          if (
            level < levelCount &&
            pointers[level] < valueItemData.value[level].value.length
          ) {
            path.push(valueItemData.value[level].value[pointers[level]]);
            pointers[level]++; // 消费一个值
          } else {
            // 数据不一致，可抛错或跳过
            console.warn(`路径 ${i} 第 ${level} 层无对应 value`);
            break;
          }
        }

        result.push(path);
      }

      multiple ? (selectValue.value = result) : (selectValue.value = result[0]);
    };

    watch(
      () => props.data,
      newVal => {
        if (newVal) {
          valueItemData.value.forEach(valueItem => {
            valueItem.value = newVal[valueItem.name]?.split(',') || [];
          });
          calcDefaultSelect();
        }
      },
      {
        immediate: true,
        deep: true,
      },
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

    // 处理查询参数
    const handleQueryParams = async (index: number, value?: string) => {
      const context = c.context.clone();
      const params = { ...c.params };
      // 如果上级和下级具有父子关系，则根据关系字段添加查询参数
      if (index > 0) {
        const { appDataEntityId: parentAppDataEntityId } =
          valueItems[index - 1];
        const { appId, appDataEntityId: childAppDataEntityId } =
          valueItems[index];
        const appDataEntity = await ibiz.hub.getAppDataEntity(
          childAppDataEntityId!,
          appId,
        )!;
        const { minorAppDERSs } = appDataEntity;
        if (minorAppDERSs) {
          const appDeRSs = minorAppDERSs.find(
            DERSs => DERSs.majorAppDataEntityId === parentAppDataEntityId,
          );
          if (appDeRSs && appDeRSs.parentAppDEFieldId && value)
            Object.assign(params, {
              [`n_${appDeRSs.parentAppDEFieldId!.toLowerCase()}_eq`]: value,
            });
        }
      }
      return { context, params };
    };

    /**
     * @description 懒加载数据
     * @param {{
     *       level: number;
     *       value: string;
     *     }} node
     * @param {(n: CascaderOption[]) => void} resolve
     * @returns {*}  {Promise<CascaderOption[]>}
     */
    const lazyLoad = async (
      node: {
        level: number;
        value: string;
        data: CascaderOption;
      },
      resolve: (n: CascaderOption[]) => void,
    ): Promise<void> => {
      const { level, value } = node;
      let children: CascaderOption[] = [];
      try {
        const { appDataEntityId, appDEDataSetId } = valueItems[level];
        if (appDataEntityId && appDEDataSetId) {
          const { context, params } = await handleQueryParams(level, value);
          const app = ibiz.hub.getApp(editorModel.appId);
          const response = await app.deService.exec(
            appDataEntityId,
            appDEDataSetId,
            context,
            params,
          );
          if (response.ok && Array.isArray(response.data)) {
            children = response.data.map(data => ({
              data,
              value: data.srfkey,
              label: data.srfmajortext
                ? data.srfmajortext
                : ibiz.i18n.t('editor.cascader.title', {
                    index: level,
                  }),
              leaf:
                level === valueItems.length - 1 ||
                (leafField && data[leafField]),
              nodekey: `${value ? `${value}_${data.srfkey}` : data.srfkey}`,
            }));
          }
        }
      } catch (error) {
        ibiz.log.error(error);
      } finally {
        if (editorStyle === 'default') {
          // 防止加载异常
          if (node.level === 0) {
            resolve([]);
            nodes.value = [...children];
            items.value = [...children];
          } else {
            resolve(children);
            node.data.children = children;
            items.value.push(...children);
          }
        } else {
          resolve([]);
        }
        // 将加载后没有子数据的节点标记为叶子节点
        if (!children.length) node.data.leaf = true;
      }
    };

    /**
     * @description 级联选择器值改变
     * @param {(string[] | string[][])} selections
     */
    const handleValueChange = (selections: string[] | string[][]) => {
      // 清空所有 valueItem 的值
      valueItemData.value.forEach(valueItem => {
        valueItem.value = [];
      });

      const isArray2D =
        Array.isArray(selections) &&
        selections.length > 0 &&
        Array.isArray(selections[0]);
      const normalizedSelections = isArray2D
        ? (selections as string[][])
        : [selections as string[]];

      const selectionText: string[] = [];

      for (const selection of normalizedSelections) {
        // 填充每个 valueItem 对应位置的值
        valueItemData.value.forEach((valueItem, index) => {
          selection[index] && valueItem.value.push(selection[index]);
        });

        // 映射为 label 并拼接
        const text = selection
          .map(select => {
            const item = items.value.find(i => i.value === select);
            if (!item) return '';
            return item.label;
          })
          .join(separator);
        if (text) selectionText.push(text);
      }

      // 触发每个 valueItem 的 change 事件
      valueItemData.value.forEach(valueItem => {
        emit('change', valueItem.value.join(','), valueItem.name);
      });

      // 触发整体 change 事件
      emit(
        'change',
        selectionText.length > 0 ? JSON.stringify(selectionText) : null,
      );
    };

    const onBlur = (e: IData) => {
      emit('blur', e);
      setEditable(false);
    };

    const onFocus = (e: IData) => {
      emit('focus', e);
      setEditable(true);
    };

    // 处理点击键盘
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e && e.code === 'Enter') {
        emit('enter', e);
      }
    };

    return {
      ns,
      c,
      size,
      nodes,
      items,
      multiple,
      valueText,
      separator,
      isEditable,
      valueItems,
      filterable,
      selectValue,
      valueItemData,
      treeSelectData,
      showFormDefaultContent,
      onBlur,
      onFocus,
      lazyLoad,
      setEditable,
      handleKeyUp,
      handleValueChange,
    };
  },
  render() {
    // 编辑态内容
    const editContent = (
      <el-cascader
        clearable
        size={this.size}
        options={this.nodes}
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
          lazyLoad: this.lazyLoad,
        }}
        onBlur={this.onBlur}
        onFocus={this.onFocus}
        onChange={this.handleValueChange}
        {...this.$attrs}
      ></el-cascader>
    );

    // 只读态内容
    const readonlyContent = (
      <div
        class={(this.ns.b(), this.ns.m('readonly'))}
      >
        {this.valueText}
      </div>
    );

    // 表单默认内容
    const formDefaultContent = (
      <div
        class={this.ns.b('form-default-content')}
      >
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
