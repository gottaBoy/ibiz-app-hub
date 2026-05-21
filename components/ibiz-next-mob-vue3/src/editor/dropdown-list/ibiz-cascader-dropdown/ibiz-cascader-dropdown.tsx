import { ref, Ref, defineComponent, watch } from 'vue';
import {
  getDropdownProps,
  getEditorEmits,
  useNamespace,
} from '@ibiz-template/vue3-util';
import { isNil } from 'ramda';
import { DropDownListEditorController } from '../dropdown-list-editor.controller';
import { IBizCommonRightIcon } from '../../common/right-icon/right-icon';
import { usePopstateListener } from '../../../util';
import './ibiz-cascader-dropdown.scss';

/**
 * 移动端级联下拉列表（单选）
 * @primary
 * @description  使用van-cascader组件，用于选择树型代码表数据。基于`移动端下拉列表（单选）`编辑器扩展，编辑器样式代码名称为：CASCADER
 * @editorparams {name:pvaluefield,parameterType:string,description:设置级联下拉列表代码表项的父值属性，将其以树型结构展示}
 * @editorparams {name:readonly,parameterType:boolean,defaultvalue:false,description:设置编辑器是否为只读态}
 * @ignoreprops  autoFocus | overflowMode
 * @ignoreemits  infoTextChange | enter
 */
export const IBizCascaderDropdown = defineComponent({
  name: 'IBizCascaderDropdown',
  props: getDropdownProps<DropDownListEditorController>(),
  emits: getEditorEmits(),
  setup(props, { emit }) {
    const ns = useNamespace('cascader-dropdown');
    const c: DropDownListEditorController = props.controller!;

    // 树数据(用于维护级联选择器默认选中数据)
    const treeData: Ref<IData[]> = ref([]);
    // 代码表map数据
    const codeListMap = new Map<string | number, IData>();
    // 当前值
    const curValue = ref('');
    // 选中值
    const selectValue: Ref<string | string[] | string[][] | null> = ref(null);
    const show = ref(false);
    const onClose = () => {
      show.value = false;
    };

    // 转化为树形结构数据
    const transformTreeData = (list: readonly IData[], pValueField: string) => {
      // 清空map，保证 O(n) 复杂度
      codeListMap.clear();

      // 第一遍：把每一项先包装成 TreeNode
      list.forEach(item => {
        codeListMap.set(item.value, { ...item });
      });

      const rootNodes: IData[] = [];
      if (pValueField) {
        // 第二遍：根据父属性把节点挂到父节点 children 里
        list.forEach(item => {
          const node = codeListMap.get(item.value)!;
          if (isNil(item.data[pValueField])) {
            // 父属性为空 => 根节点
            rootNodes.push(node);
          } else {
            const parent = codeListMap.get(item.data[pValueField]);
            // 如果父节点不存在，直接丢弃
            if (parent) {
              if (!parent.children) {
                parent.children = [];
              }
              parent.children.push(node);
            }
          }
        });
      } else {
        // 没有父值属性时，直接平铺
        rootNodes.push(...list);
      }

      return rootNodes;
    };

    // 加载代码表数据
    const loadCodeList = async () => {
      const codeList = await c.loadCodeList(props.data!);
      // 存在父值属性时转换为树型数据，否则平铺
      const { pvaluefield } = c.editorParams;
      treeData.value = transformTreeData(codeList, pvaluefield);
      if (props.value) {
        const item = codeListMap.get(props.value);
        curValue.value = item?.text || '';
      }
    };

    loadCodeList();

    // 处理级联选择器值改变
    const onFinish = ($event: IData) => {
      const { value } = $event;
      onClose();

      emit('change', value);
    };

    const onChange = ($event: IData) => {
      const { value } = $event;
      emit('change', value);
    };

    watch(
      () => props.value,
      newVal => {
        const item = codeListMap.get(newVal || '');
        curValue.value = item?.text || '';
      },
      { immediate: true },
    );

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
      show.value = !show.value;
    };

    // 监听popstate事件
    usePopstateListener(onClose);

    return {
      ns,
      c,
      show,
      treeData,
      selectValue,
      curValue,
      onBlur,
      onFocus,
      openPopup,
      onClose,
      onChange,
      onFinish,
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
        {this.readonly && this.curValue}
        {!this.readonly && (
          <van-field
            v-model={this.curValue}
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
            title={this.c.placeHolder ? this.c.placeHolder : ' '}
            options={this.treeData}
            onClose={this.onClose}
            onChange={this.onChange}
            onFinish={this.onFinish}
          />
        </van-popup>
      </div>
    );
  },
});
