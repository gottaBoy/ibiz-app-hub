/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  h,
  ref,
  Ref,
  computed,
  PropType,
  defineComponent,
  resolveComponent,
} from 'vue';
import {
  IEditorContainerController,
  IEditorController,
  IEditorProvider,
  IFilterNodeField,
  IModal,
  ValueOP,
  getEditorProvider,
} from '@ibiz-template/runtime';
import { biReportT } from '../../../locale';
import { IEditor } from '@ibiz/model-core';
import { useNamespace } from '../../../use';
import {
  FilterModes,
  ExcludeOPs,
  getEditor,
  TypeToEditor,
} from '../../../util';
import { ISchemaField } from '../../../interface';
import './filter-item.scss';
import { DateUtil } from '../../../util/date-util';

export const FilterItem = defineComponent({
  name: 'BIFilterItem',
  props: {
    field: {
      type: Object as PropType<ISchemaField>,
      required: true,
    },
    condition: {
      type: Object as PropType<IFilterNodeField>,
    },
    context: {
      type: Object as PropType<IContext>,
      required: true,
    },
    type: {
      type: String as PropType<'DYNAMIC' | 'STATIC'>,
    },
    params: {
      type: Object as PropType<IParams>,
      required: true,
    },
    modal: { type: Object as PropType<IModal>, required: true },
  },
  emits: {
    change: (_filter: IData) => true,
    mateChange: (_type: 'DYNAMIC' | 'STATIC') => true,
  },
  setup(props, { emit }) {
    const ns = useNamespace(`bi-filter-item`);
    const editorModel: Ref<IEditor | undefined> = ref(undefined);
    const editorProvider: Ref<IEditorProvider | undefined> = ref(undefined);
    const editor: Ref<IEditorController | undefined> = ref(undefined);

    const data: Ref<IData> = ref({
      value: null,
      valueOP: null,
      nodeType: 'FIELD',
      // nodeType: 'CUSTOM';
      // customType: 'PQL'
      // customCond: string;
      field: props.field.appDEFieldId,
    });

    // 当前是否是时间范围组件
    const isDateRange = ref(false);

    // 时间解析工具
    const dateUtil = new DateUtil();

    /**
     * 可选操作符
     */
    const valueOPs = computed(() => {
      return FilterModes.filter(mode =>
        props.field.valueOPs.includes(mode.valueOP),
      );
    });

    /**
     * 初始化
     */
    const init = async () => {
      if (props.condition) {
        data.value = { ...props.condition };
      }
      if (props.field.type === 'date' && data.value.customType === 'PQL') {
        isDateRange.value = true;
        // 启用时间范围选择
        editorModel.value = { ...TypeToEditor.daterange };
        // 处理传递值
        data.value.value = dateUtil.handleStringToDate(
          data.value.customCond,
          props.type,
        );
        data.value.valueOP = 'IN';
      } else {
        // 走默认组件
        editorModel.value = getEditor(props.field);
      }
      editorProvider.value = await getEditorProvider(editorModel.value);
      if (editorProvider.value) {
        editor.value = await editorProvider.value.createController(
          editorModel.value,
          {
            context: props.context,
            params: props.params,
          } as IEditorContainerController,
        );
      }
    };

    init();

    /**
     * 关闭
     *
     */
    const onClose = () => {
      props.modal.dismiss();
    };

    /**
     * 确认
     *
     */
    const onConfirm = () => {
      if (isDateRange.value) {
        const str = dateUtil.handleDateToString(
          data.value.value as IData,
          props.field.appDEFieldId,
        );
        const tempValue = {
          nodeType: 'CUSTOM',
          customType: 'PQL',
          customCond: str,
          field: props.field.appDEFieldId,
        };
        emit('mateChange', data.value.value.type);
        emit('change', tempValue);
      } else {
        emit('change', data.value);
      }
      onClose();
    };

    /**
     * 值变更
     *
     * @param {*} value
     */
    const onValueChange = (value: unknown) => {
      data.value.value = value;
    };

    /**
     * 切换为时间范围选择组件
     *
     */
    const switchDateRange = async () => {
      editor.value = undefined;
      editorModel.value = { ...TypeToEditor.daterange };
      editorProvider.value = await getEditorProvider(editorModel.value);
      if (editorProvider.value) {
        editor.value = await editorProvider.value.createController(
          editorModel.value,
          {
            context: props.context,
            params: props.params,
          } as IEditorContainerController,
        );
      }
    };

    /**
     * 切换默认编辑器
     *
     */
    const switchDefaultEditor = async () => {
      editor.value = undefined;
      editorModel.value = getEditor(props.field);
      editorProvider.value = await getEditorProvider(editorModel.value);
      if (editorProvider.value) {
        editor.value = await editorProvider.value.createController(
          editorModel.value,
          {
            context: props.context,
            params: props.params,
          } as IEditorContainerController,
        );
      }
    };

    /**
     * 值操作模式选择变更
     *
     * @param {ValueOP} valueOP
     */
    const onValueOPSelect = async (valueOP: ValueOP) => {
      data.value.valueOP = valueOP;
      onValueChange(null);
      if (!isDateRange.value) {
        if (props.field.type === 'date' && valueOP === 'IN') {
          // 此情况下使用时间范围组件
          isDateRange.value = true;
          switchDateRange();
        }
      } else if (props.field.type !== 'date' || valueOP !== 'IN') {
        isDateRange.value = false;
        switchDefaultEditor();
      }
    };

    /**
     * 绘制编辑器
     *
     * @return {*}
     */
    const renderEditor = () => {
      if (data.value.valueOP && ExcludeOPs.includes(data.value.valueOP)) {
        return null;
      }
      if (editor.value) {
        const component = resolveComponent(editorProvider.value!.formEditor);
        return h(component, {
          value: data.value.value,
          controller: editor.value,
          onChange: (val: unknown, _name?: string): void => {
            onValueChange(val);
          },
        });
      }
    };

    /**
     * 绘制内容
     *
     * @return {*}
     */
    const renderContent = () => {
      return (
        <div class={ns.e('content')}>
          <div class={ns.em('content', 'field')}>
            <el-select model-value={data.value.field}>
              <el-option
                key={props.field.appDEFieldId}
                value={props.field.appDEFieldId}
                label={props.field.caption}
              />
            </el-select>
          </div>
          <div class={ns.em('content', 'option')}>
            <el-select
              model-value={data.value.valueOP}
              onChange={(valueOP: ValueOP) => {
                onValueOPSelect(valueOP);
              }}
            >
              {valueOPs.value.map(mode => {
                return (
                  <el-option
                    key={mode.valueOP}
                    value={mode.valueOP}
                    label={mode.label}
                  />
                );
              })}
            </el-select>
          </div>
          <div class={ns.em('content', 'editor')}>{renderEditor()}</div>
        </div>
      );
    };

    return {
      ns,
      onClose,
      onConfirm,
      renderContent,
    };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <div class={this.ns.e('header')}>
          <span class={this.ns.em('header', 'caption')}>
            {biReportT('filter')}
          </span>
          <span class={this.ns.em('header', 'icon')}>
            <ion-icon name='close-outline' onClick={this.onClose}></ion-icon>
          </span>
        </div>
        {this.renderContent()}
        <div class={this.ns.e('footer')}>
          <el-button text onClick={this.onClose}>
            {biReportT('cancel')}
          </el-button>
          <el-button onClick={this.onConfirm}>{biReportT('confirm')}</el-button>
        </div>
      </div>
    );
  },
});
