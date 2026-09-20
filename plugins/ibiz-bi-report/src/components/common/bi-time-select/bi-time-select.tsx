import {
  PropType,
  defineComponent,
  ref,
  h,
  resolveComponent,
  watch,
  Ref,
} from 'vue';
import {
  IEditorContainerController,
  IModal,
  getEditorProvider,
} from '@ibiz-template/runtime';
import { useNamespace } from '../../../use';
import { AppBIPeriodData } from '../../../interface';
import './bi-time-select.scss';
import { biReportT } from '../../../locale';
export const BITimeSelect = defineComponent({
  name: 'BITimeSelect',
  props: {
    value: {
      type: Object as PropType<AppBIPeriodData>,
      default: () => {},
    },
    modal: { type: Object as PropType<IModal>, required: true },
    context: {
      type: Object as PropType<IContext>,
      required: true,
    },
    params: {
      type: Object as PropType<IParams>,
      required: true,
    },
  },
  emits: ['change'],
  setup(props, { emit }) {
    const ns = useNamespace('bi-time-select');
    // 编辑器模型
    const editorModel = ref();
    // 编辑器provider
    const editorProvider = ref();
    // 编辑器值
    const editor = ref();
    // 当前选择值
    const curValue: Ref<IData> = ref({
      unit: 'DAY',
      type: 'DYNAMIC',
      start: -7,
      end: 0,
    });

    // 值改变
    const onValueChange = (value: IData) => {
      curValue.value = value;
    };

    // 初始化
    const init = async () => {
      editorModel.value = {
        appId: '',
        editorType: 'DATERANGE_SWITCHUNIT',
        dateTimeFormat: 'YYYY-MM-DD',
      };
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

    // 监听值改变
    watch(
      () => props.value,
      newVal => {
        if (newVal) {
          curValue.value = newVal;
        }
      },
      {
        immediate: true,
      },
    );

    init();
    /**
     * 绘制编辑器
     *
     * @return {*}
     */
    const renderEditor = () => {
      if (editor.value) {
        const component = resolveComponent('IBizDateRangeSelect');
        return h(component, {
          value: props.value,
          controller: editor.value,
          onChange: (val: IData): void => {
            onValueChange(val);
          },
        });
      }
    };

    // 抛出事件
    const emitFunc = () => {
      emit('change', curValue.value);
    };

    // 取消
    const onCancel = () => {
      props.modal.dismiss();
    };

    // 确认
    const onOK = () => {
      emitFunc();
      props.modal.dismiss();
    };

    return {
      ns,
      renderEditor,
      onOK,
      onCancel,
    };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <div class={this.ns.e('header')}>
          <span class={this.ns.em('header', 'caption')}>
            {biReportT('configure')}
          </span>
          <svg
            onClick={this.onCancel}
            class={this.ns.em('header', 'close')}
            viewBox='0 0 16 16'
            xmlns='http://www.w3.org/2000/svg'
            height='1em'
            width='1em'
            focusable='false'
            fill='currentColor'
          >
            <g id='agwaction/close' stroke-width='1' fill-rule='evenodd'>
              <path
                d='M7.456 7.456V-.115h1.2v7.571h7.572v1.2H8.656v7.572h-1.2V8.656H-.115v-1.2h7.571z'
                id='agw形状结合'
                transform='rotate(45 8.056 8.056)'
              ></path>
            </g>
          </svg>
        </div>
        <div class={this.ns.e('content')}>{this.renderEditor()}</div>
        <div class={this.ns.e('footer')}>
          <el-button link onClick={this.onCancel}>
            {biReportT('cancel')}
          </el-button>
          <el-button type='primary' onClick={this.onOK}>
            {biReportT('confirm')}
          </el-button>
        </div>
      </div>
    );
  },
});
