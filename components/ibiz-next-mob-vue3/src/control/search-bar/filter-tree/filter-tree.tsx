/* eslint-disable array-callback-return */
/* eslint-disable no-template-curly-in-string */
import {
  IFilterNodeGroup,
  IFilterNodeField,
  IFilterNode,
  SearchBarFilterController,
  ValueOP,
  IFilterNodeItems,
  SearchBarFilterSimpleItemsController,
} from '@ibiz-template/runtime';
import { useNamespace } from '@ibiz-template/vue3-util';
import {
  computed,
  defineComponent,
  h,
  PropType,
  Ref,
  ref,
  resolveComponent,
  watch,
} from 'vue';
import { clearAll } from 'qx-util';
import { isNil } from 'ramda';
import './filter-tree.scss';

type FieldInfo = {
  name: string;
  label: string;
  valueOPs: string[];
  fieldName: string;
  simpleFilterC?: SearchBarFilterSimpleItemsController;
};

const FilterModes = [
  { valueOP: ValueOP.EQ, label: '等于(=)' },
  { valueOP: ValueOP.NOT_EQ, label: '不等于(<>)' },
  { valueOP: ValueOP.GT, label: '大于(>)' },
  { valueOP: ValueOP.GT_AND_EQ, label: '大于等于(>=)' },
  { valueOP: ValueOP.LT, label: '小于(<)' },
  { valueOP: ValueOP.LT_AND_EQ, label: '小于等于(<=)' },
  { valueOP: ValueOP.IS_NULL, label: '值为空(Nil)' },
  { valueOP: ValueOP.IS_NOT_NULL, label: '值不为空(NotNil)' },
  { valueOP: ValueOP.IN, label: '值在范围中(In)' },
  { valueOP: ValueOP.NOT_IN, label: '值不在范围中(NotIn)' },
  { valueOP: ValueOP.LIKE, label: '文本包含(%)' },
  { valueOP: ValueOP.LIFT_LIKE, label: '文本左包含(%#)' },
  { valueOP: ValueOP.RIGHT_LIKE, label: '文本右包含(#%)' },
  { valueOP: ValueOP.EXISTS, label: '存在(EXISTS)' },
  { valueOP: ValueOP.NOT_EXISTS, label: '不存在(NOTEXISTS)' },
] as const;

const GroupModes = [
  { value: 'AND', text: '且' },
  { value: 'OR', text: '或' },
];

/** 不需要编辑器的OP */
export const ExcludeOPs: string[] = [
  ValueOP.IS_NULL,
  ValueOP.IS_NOT_NULL,
  ValueOP.EXISTS,
  ValueOP.NOT_EXISTS,
] as const;

export const FilterTreeControl = defineComponent({
  name: 'IBizFilterTreeControl',
  props: {
    /**
     * 过滤项控制器集合
     */
    filterControllers: {
      type: Array as PropType<SearchBarFilterController[]>,
      required: true,
    },
    /**
     * 过滤项树节点数据集合
     */
    filterNodes: {
      type: Array as PropType<IFilterNode[]>,
      required: true,
    },
    /**
     * 父容器
     */
    parent: {
      type: String,
      required: true,
    },
    filterMode: {
      type: String as PropType<'default' | 'pql'>,
      default: 'default',
    },
    customCond: {
      type: String,
      default: '',
    },
    context: {
      type: Object as PropType<IContext>,
    },
    params: {
      type: Object as PropType<IParams>,
    },
    schemaEntityMap: {
      type: Object as PropType<Map<string, string | undefined>>,
      default: () => new Map(),
    },
  },
  emits: ['confirm', 'cancel', 'change', 'customCondChange'],
  setup(props, { emit }) {
    const ns = useNamespace('filter-tree');

    const showPopup = ref(false);

    // 新建节点
    const addNode: Ref<IFilterNodeField | null> = ref(null);

    // 编辑节点
    const editNode: Ref<IFilterNodeField | null> = ref(null);

    // 编辑项index
    let editIndex: number | undefined;

    // 拷贝节点
    const copyNode: Ref<IFilterNodeField | null> = ref(null);

    // UI实际用的FilterNodes
    const UiFilterNodes = computed(() => {
      return props.filterNodes;
    });

    /**
     * 根据节点数据找到对应的控制器
     * @param node 节点数据
     * @returns
     */
    const findFilterController = (
      node: IFilterNodeField | IFilterNodeItems,
    ) => {
      const { field, valueOP } = node;
      return props.filterControllers.find(item => {
        if (item.key === field) {
          // 有配属性搜索模式的匹配才是，没配的都是指向没配的哪个过滤项
          return item.valueOP ? item.valueOP === valueOP : true;
        }
        return false;
      });
    };

    const allFields: Array<FieldInfo> = [];

    // 是否存在过滤数据
    const hasFilter = () => {
      // 无数据
      if (!UiFilterNodes.value.length) {
        return false;
      }
      const group = UiFilterNodes.value[0] as IFilterNodeGroup;
      if (
        group.children.length === 1 &&
        !(group.children[0] as IFilterNodeField).field
      ) {
        return false;
      }
      return true;
    };

    // !初始化所有属性字段信息
    props.filterControllers.forEach(filterC => {
      let find = allFields.find(x => x.name === filterC.key);
      if (filterC.hidden) {
        return;
      }
      // 没有且不是隐藏的添加进去
      if (find === undefined) {
        find = {
          name: filterC.key,
          fieldName: filterC.fieldName,
          label: filterC.label,
          valueOPs: [],
        };
        if (filterC.type === 'SIMPLE_ITEMS') {
          find.simpleFilterC = filterC as SearchBarFilterSimpleItemsController;
        }

        allFields.push(find);
      }

      // 添加操作符号(没有配置的给全部)
      if (!filterC.valueOP) {
        find.valueOPs = FilterModes.map(item => item.valueOP);
      } else {
        find.valueOPs.push(filterC.valueOP);
      }
    });

    // schema字段列表
    const schemaFields = ref<IData[]>([]);

    allFields.forEach(async field => {
      const filterController = props.filterControllers.find(
        item => item.key === field.name,
      );
      if (!filterController) {
        return;
      }
      schemaFields.value.push({
        appDEFieldId: field.fieldName,
        caption: field.label,
        valueOPs: field.valueOPs,
        appDataEntityId: props.schemaEntityMap.get(field.fieldName),
        appDataEntityFullTag: filterController.appDataEntity?.defullTag,
        appCodeListId: (filterController.model.editor as IData)?.appCodeListId,
      });
    });

    // 当前过滤模式
    const mode = ref(props.filterMode || 'default');

    // 当前自定义条件
    const currentCustomCond = ref('');

    watch(
      () => props.customCond,
      () => {
        currentCustomCond.value = props.customCond;
      },
      { immediate: true },
    );

    /** 获取对应属性的操作符号 */
    const getFilterModes = (
      fieldName: string | null,
      fieldInfos: FieldInfo[] = allFields,
    ) => {
      if (!fieldName) {
        return [];
      }
      const field = fieldInfos.find(item => item.name === fieldName);
      if (!field) {
        return [];
      }
      return field.valueOPs;
    };

    /**
     * 全局属性选择变更
     * @author lxm
     * @date 2023-10-16 05:02:07
     * @param {IFilterNodeField} node
     * @param {string} field
     */
    const onFieldSelect = (
      node: IFilterNodeField | IFilterNodeItems,
      key: string,
      fields: FieldInfo[] = allFields,
    ) => {
      const fieldInfo = fields.find(item => item.name === key);
      if (!fieldInfo) {
        ibiz.log.error(`allFields找不到属性标识为${key}的`);
        return;
      }
      // 清空数据
      clearAll(node);

      if (fieldInfo.simpleFilterC) {
        Object.assign(node, {
          nodeType: 'FIELD',
          field: fieldInfo.name,
          valueOP: fieldInfo.simpleFilterC.subValueOP,
          value: null,
        });
        return;
      }

      // 设置过滤属性相关默认值
      node.nodeType = 'FIELD';
      node.field = fieldInfo.fieldName;
      if (fieldInfo.valueOPs.length) {
        Object.assign(node, {
          valueOP: fieldInfo.valueOPs[0],
        });
      }
    };

    /**
     * 值操作模式选择变更
     * @author lxm
     * @date 2023-10-16 05:02:23
     * @param {IFilterNodeField} node
     * @param {string} valueOP
     */
    const onValueOPSelect = (node: IFilterNodeField, valueOP: string) => {
      node.valueOP = valueOP as ValueOP;
      // 修改条件的同时清空后面的值
      node.value = null;
    };

    /**
     * 过滤分组逻辑类型变更
     * @author lxm
     * @date 2023-10-16 05:05:44
     * @param {IFilterNodeGroup} node
     * @param {('AND' | 'OR')} logicType
     */
    const onGroupLogicTypeChange = (
      node: IFilterNodeGroup,
      logicType: 'AND' | 'OR',
    ) => {
      node.logicType = logicType;
    };

    /**
     * 添加项
     * @author lxm
     * @date 2023-10-16 05:02:43
     * @param {IFilterNodeGroup} node
     */
    const addItem = () => {
      addNode.value = {
        nodeType: 'FIELD',
        field: null,
        valueOP: null,
        value: null,
      };
      if (allFields.length) {
        const filed = allFields[0];
        addNode.value.field = filed.name;
        if (filed.valueOPs.length) {
          Object.assign(addNode.value, {
            valueOP: filed.valueOPs[0],
          });
        }
      }
      showPopup.value = true;
    };

    /**
     * 确认
     */
    const onConfirm = () => {
      emit('confirm', mode.value, currentCustomCond.value);
    };

    /**
     * 重置
     */
    const onReset = () => {
      emit('cancel');
    };

    const closePopup = () => {
      addNode.value = null;
      editNode.value = null;
      copyNode.value = null;
      showPopup.value = false;
    };

    const onEditItem = () => {
      if (copyNode.value && !isNil(copyNode.value.value)) {
        Object.assign(editNode.value!, copyNode.value);
      }
      closePopup();
    };

    const onRemove = () => {
      if (!UiFilterNodes.value.length) {
        return;
      }
      const children = (UiFilterNodes.value[0] as IFilterNodeGroup).children;
      children.splice(editIndex as number, 1);
      // 删除根分组时，将第一个过滤节点转为根节点
      if (
        children.length > 0 &&
        children[0].nodeType === 'GROUP' &&
        children[0].children.length
      ) {
        children[0] = children[0].children[0];
      }
      closePopup();
    };

    const onAddItem = () => {
      // 新增条件无value时不添加
      if (
        !UiFilterNodes.value.length ||
        !addNode.value ||
        isNil(addNode.value.value)
      ) {
        return;
      }
      const children = (UiFilterNodes.value[0] as IData as IFilterNodeGroup)
        .children;
      if (children[0] && !(children[0] as IFilterNodeField).field) {
        Object.assign(children[0], addNode.value);
        closePopup();
        return;
      }
      children.push({
        nodeType: 'GROUP',
        logicType: 'AND',
        children: [addNode.value],
      });
      closePopup();
    };

    /**
     * @description 过滤项点击
     * @param {MouseEvent} event
     * @param {IFilterNodeField} item
     */
    const onFilterItemClick = (
      event: MouseEvent,
      item: IFilterNodeField,
      index: number,
      root: boolean,
    ) => {
      event.stopPropagation();
      editNode.value = item;
      copyNode.value = { ...item };
      editIndex = root ? 0 : index + 1;
      showPopup.value = true;
    };

    /**
     * 绘制编辑器
     * @param node
     * @param filterC
     * @returns
     */
    const renderEditor = (
      node: IFilterNodeField,
      filterC: SearchBarFilterController,
      readonly: boolean = false,
    ) => {
      if (
        filterC.noEditor ||
        (node.valueOP && ExcludeOPs.includes(node.valueOP))
      ) {
        return null;
      }
      let editor = null;

      if (filterC.editorProvider) {
        const { data, value } = filterC.calcEditorProps(node);
        const component = resolveComponent(filterC.editorProvider.formEditor);
        editor = h(component, {
          key: filterC.editor!.model.id,
          value,
          controller: filterC.editor,
          disabled: node.disabled,
          readonly,
          data,
          onChange: (val: unknown, name?: string): void => {
            filterC.onEditorChange(node, val, name);
          },
        });
      } else {
        editor = <not-supported-editor modelData={filterC.model.editor} />;
      }
      return editor;
    };

    /**
     * 绘制过滤项
     * @param node
     * @returns
     */
    const renderFilterItem = (
      node: IFilterNodeField,
      index: number,
      root: boolean,
    ) => {
      // 不显示的不绘制
      if (node.hidden) {
        return;
      }
      const fieldInfos = allFields;

      let editor = null;
      if (node.field && node.valueOP) {
        const filterC = findFilterController(node);
        if (filterC && !['EXISTS', 'NOTEXISTS'].includes(filterC.valueOP!)) {
          editor = renderEditor(node, filterC, true);
        }
      }

      const item = fieldInfos.find(x => x.name === node.field);
      if (!item) {
        return;
      }
      const opItem = FilterModes.find(x => x.valueOP === node.valueOP);
      return (
        <div
          class={ns.e('item')}
          onClick={(event: MouseEvent) => {
            onFilterItemClick(event, node, index, root);
          }}
        >
          <div class={ns.e('item-header')}>
            <div class={ns.e('field')}>{item.label}</div>
            <div class={ns.e('condop')}>{opItem?.label}</div>
          </div>
          <div class={ns.e('value')}>{editor}</div>
        </div>
      );
    };

    const renderType = (node: IFilterNodeGroup) => {
      return (
        <van-dropdown-menu overlay={false} close-on-click-outside>
          <van-dropdown-item
            v-model={node.logicType}
            options={GroupModes}
            onChange={(value: 'AND' | 'OR') =>
              onGroupLogicTypeChange(node, value)
            }
          />
        </van-dropdown-menu>
      );
    };

    /**
     * 绘制过滤分组
     * @param node
     * @returns
     */
    const renderFilterGroup = (
      node: IFilterNodeGroup,
      root: boolean = false,
    ) => {
      // 不显示的不绘制
      if (node.hidden) {
        return;
      }
      // 默认数据不绘制
      const bol = hasFilter();
      if (!bol) {
        return;
      }
      return (
        <div class={ns.e('group')}>
          <div class={[ns.e('type'), ns.is('readonly', root)]}>
            {root ? ibiz.i18n.t('control.searchBar.when') : renderType(node)}
          </div>
          {node.children.map((child, index) => {
            if (child.nodeType === 'FIELD') {
              return renderFilterItem(child, index, root);
            }
            // 移动端只支持单层分组
            if (child.nodeType === 'GROUP') {
              return renderFilterGroup(child);
            }
          })}
        </div>
      );
    };

    // 绘制气泡项，新建或编辑时使用
    const renderPopupItem = () => {
      const editing = !!editNode.value;
      const node = editing ? copyNode.value : addNode.value;
      if (!node) {
        return;
      }
      const fieldInfos = allFields;
      const availableModes = getFilterModes(node.field, fieldInfos);

      let editor = null;
      if (node.field && node.valueOP) {
        const filterC = findFilterController(node);
        if (filterC && !['EXISTS', 'NOTEXISTS'].includes(filterC.valueOP!)) {
          editor = renderEditor(node, filterC);
        }
      }
      let footer = (
        <div class={ns.e('item-footer')}>
          <van-button type='primary' onClick={onAddItem}>
            {ibiz.i18n.t('control.searchBar.add')}
          </van-button>
        </div>
      );
      if (editing) {
        footer = (
          <div class={ns.e('item-footer')}>
            <van-button type='danger' onClick={onRemove}>
              {ibiz.i18n.t('control.searchBar.remove')}
            </van-button>
            <van-button type='primary' onClick={onEditItem}>
              {ibiz.i18n.t('control.searchBar.confirm')}
            </van-button>
          </div>
        );
      }
      return (
        <div class={ns.e('popup-content')}>
          <div class={ns.e('popup-caption')}>
            {ibiz.i18n.t('control.searchBar.addCond')}
          </div>
          <iBizFilterFieldSelect
            disabled={node.disabled}
            value={node.field}
            modes={fieldInfos}
            onChange={(field: string) => {
              onFieldSelect(node, field, fieldInfos);
            }}
          ></iBizFilterFieldSelect>
          <iBizFilterModeSelect
            disabled={node.disabled}
            value={node.valueOP}
            modes={availableModes}
            onChange={(valueOP: string) => {
              onValueOPSelect(node, valueOP);
            }}
          ></iBizFilterModeSelect>
          <div class={ns.e('editor')}>
            <div class={ns.e('editor-caption')}>
              {ibiz.i18n.t('control.searchBar.value')}
            </div>
            {editor}
          </div>
          {footer}
        </div>
      );
    };

    return {
      ns,
      showPopup,
      UiFilterNodes,
      renderFilterGroup,
      renderPopupItem,
      onConfirm,
      onReset,
      addItem,
    };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <div class={this.ns.e('header')}>
          <div class={this.ns.e('title')}>
            {ibiz.i18n.t('control.searchBar.filter')}
          </div>
          <div class={this.ns.e('toolbar')}>
            <ion-icon name='add-outline' onClick={this.addItem}></ion-icon>
          </div>
        </div>
        <div class={this.ns.e('content')}>
          {this.UiFilterNodes.length > 0 &&
            this.UiFilterNodes.map(node => {
              return this.renderFilterGroup(node as IFilterNodeGroup, true);
            })}
        </div>
        <div class={this.ns.e('footer')}>
          <van-button onClick={this.onReset}>
            {ibiz.i18n.t('control.searchBar.reset')}
          </van-button>
          <van-button
            type='primary'
            class={this.ns.e('confirm')}
            onClick={this.onConfirm}
          >
            {ibiz.i18n.t('control.searchBar.confirm')}
          </van-button>
        </div>
        <van-popup
          class={this.ns.e('popup')}
          v-model:show={this.showPopup}
          teleport='body'
          position='bottom'
        >
          {this.renderPopupItem()}
        </van-popup>
      </div>
    );
  },
});
