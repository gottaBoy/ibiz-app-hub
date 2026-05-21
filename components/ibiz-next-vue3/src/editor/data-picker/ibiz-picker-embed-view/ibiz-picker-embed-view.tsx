/* eslint-disable prefer-object-spread */
import {
  h,
  ref,
  watch,
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
import { EventBase } from '@ibiz-template/runtime';
import { PickerEditorController } from '../picker-editor.controller';
import './ibiz-picker-embed-view.scss';

/**
 * 数据选择（嵌入选择视图）
 *
 * @description 将配置的选择视图直接嵌入到编辑器内，在编辑器中呈现选择数据。支持编辑器类型包含：`数据选择（嵌入选择视图）`
 * @primary
 * @editorparams {"name":"multiple","parameterType":"boolean","defaultvalue":false,"description":"默认为单选模式，当该参数值设为 true 时，启用多选模式，允许同时选择多个数据项"}
 * @editorparams {"name":"checkstrictly","parameterType":"boolean","defaultvalue":true,"description":"在多选的情况下，树节点是否严格的遵循父子不互相关联的做法"}
 * @editorparams {"name":"isshowtext","parameterType":"boolean","defaultvalue":true,"description":"是否显示文本。若设置为 true，会将选中的数组数据用逗号分隔后以文本方式展示在编辑器中，直观呈现选中的数据内容"}
 * @ignoreprops autoFocus | overflowMode
 * @ignoreemits blur | focus | enter | infoTextChange
 */
export const IBizPickerEmbedView = defineComponent({
  name: 'IBizPickerEmbedView',
  props: getDataPickerProps<PickerEditorController>(),
  emits: getEditorEmits(),
  setup(props, { emit }) {
    const ns = useNamespace('picker-embed-view');

    const c = props.controller!;

    // 视图上下文
    const context = ref(c.context.clone());

    // 视图参数
    const params = ref({ ...c.params });

    // 克隆的视图参数
    const cloneParams = computed(() => {
      return { checkstrictly: true, ...params.value };
    });

    // 监听表单数据，发生变化时重写计算视图参数
    watch(
      () => props.data,
      newVal => {
        const { context: tempContext, params: tempParams } =
          c.handlePublicParams(newVal, c.context, c.params);
        const newContext = Object.assign(c.context.clone(), tempContext);
        const newParams = Object.assign({ ...c.params }, tempParams);
        if (JSON.stringify(context.value) !== JSON.stringify(newContext))
          context.value = newContext;
        if (JSON.stringify(params.value) !== JSON.stringify(newParams))
          params.value = newParams;
      },
      {
        deep: true,
        immediate: true,
      },
    );

    // 编辑器参数集合
    const editorParams = c.model.editorParams;

    // 是否单选
    const singleSelect = ref(true);

    // 在多选的情况下，树节点是否严格的遵循父子不互相关联
    const checkStrictly = ref(true);

    // 是否显示文本
    const isShowText = ref(true);

    if (editorParams) {
      if (editorParams.multiple) {
        singleSelect.value = !c.toBoolean(editorParams.multiple);
      }
      if (editorParams.checkStrictly) {
        checkStrictly.value = c.toBoolean(editorParams.checkStrictly);
      }
      if (editorParams.checkstrictly) {
        checkStrictly.value = c.toBoolean(editorParams.checkstrictly);
      }
      if (editorParams.isShowText) {
        isShowText.value = c.toBoolean(editorParams.isShowText);
      }
      if (editorParams.isshowtext) {
        isShowText.value = c.toBoolean(editorParams.isshowtext);
      }
    }

    // 选中数据
    const selectedData = ref<IData[]>([]);

    watch(
      () => props.value,
      newVal => {
        selectedData.value = [];
        if (newVal) {
          if (c.valueItem) {
            const tempValue = props.data?.[c.valueItem]?.split?.(',');
            const tempText = (newVal as string)?.split?.(',');
            if (tempValue && tempText) {
              selectedData.value = tempValue.map(
                (srfkey: string, index: number) => {
                  return {
                    srfkey,
                    srfmajortext: tempText[index],
                  };
                },
              );
            }
          }
        }
      },
      {
        immediate: true,
      },
    );

    // 视图数据改变
    const onViewDataChange = (event: IData[]) => {
      let tempValue: string = '';
      let temText: string = '';
      if (event && Array.isArray(event)) {
        event.forEach((select: IData) => {
          tempValue += `${select.srfkey},`;
          temText += `${select.srfmajortext},`;
        });
        tempValue = tempValue.substring(0, tempValue.length - 1);
        temText = temText.substring(0, temText.length - 1);
        if (c.valueItem) {
          emit('change', tempValue, c.valueItem);
        }
        emit('change', temText);
      }
    };

    // 绑定事件
    const onSelectionChange = (event: EventBase) => {
      onViewDataChange(event.data);
    };

    // 聚焦失焦事件
    const { componentRef: editorRef } = useFocusAndBlur(
      () => emit('focus'),
      () => emit('blur'),
    );

    return {
      ns,
      c,
      context,
      params,
      editorRef,
      isShowText,
      cloneParams,
      singleSelect,
      selectedData,
      checkStrictly,
      onSelectionChange,
    };
  },
  render() {
    const viewShell = resolveComponent('IBizViewShell');
    return (
      <div
        class={[
          this.ns.b(),
          this.disabled ? this.ns.m('disabled') : '',
          this.isShowText ? this.ns.m('show-value') : '',
        ]}
        ref='editorRef'
      >
        {this.c.model.pickupAppViewId
          ? [
              <div class={this.ns.b('view')}>
                {h(viewShell, {
                  context: this.context,
                  params: this.cloneParams,
                  viewId: this.c.model.pickupAppViewId,
                  state: {
                    singleSelect: this.singleSelect,
                    checkStrictly: this.checkStrictly,
                    selectedData: this.selectedData,
                  },
                  onSelectionChange: this.onSelectionChange,
                })}
              </div>,
              this.isShowText && (
                <div class={this.ns.b('value')}>
                  {this.$props.value ? (
                    (this.$props.value as string).split(',').map(item => {
                      return <span>{item}; </span>;
                    })
                  ) : (
                    <span>{this.c.placeHolder}</span>
                  )}
                </div>
              ),
            ]
          : null}
      </div>
    );
  },
});
