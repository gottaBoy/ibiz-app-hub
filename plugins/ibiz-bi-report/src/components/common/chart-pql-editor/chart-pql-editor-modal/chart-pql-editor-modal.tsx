import { PropType, defineComponent, ref } from 'vue';
import { RuntimeError } from '@ibiz-template/core';
import { useNamespace } from '../../../../use';
import { ISchemaField } from '../../../../interface';
import './chart-pql-editor-modal.scss';
import { biReportT } from '../../../../locale';

export default defineComponent({
  name: 'BIChartPqlEditorModal',
  props: {
    fields: {
      type: Array as PropType<ISchemaField[]>,
      default: () => [],
    },
    fieldIconMap: {
      type: Object as PropType<Map<string, string>>,
      default: () => new Map(),
    },
    value: {
      type: String,
      default: '',
    },
    context: {
      type: Object as PropType<IContext>,
      required: true,
    },
    params: {
      type: Object as PropType<IParams>,
    },
  },
  emits: {
    cancel: () => true,
    confirm: (_value: string) => true,
  },
  setup(props, { emit }) {
    const ns = useNamespace('chart-pql-editor-modal');

    // 编辑器值
    const currentValue = ref<string>(props.value);

    // pql编辑器
    const pqlEditor = ref();

    // 处理编辑器值改变
    const handleChange = (value: string) => {
      currentValue.value = value;
    };

    // 处理取消按钮点击
    const handleCancel = (e: MouseEvent) => {
      e.stopPropagation();
      emit('cancel');
    };

    // 处理确认按钮点击
    const handleConfirm = (e: MouseEvent) => {
      e.stopPropagation();
      try {
        if (pqlEditor.value) {
          const result = pqlEditor.value.verify?.();
          if (!result) {
            return;
          }
        }
        emit('confirm', currentValue.value);
      } catch (err) {
        ibiz.log.error((err as RuntimeError)?.message);
      }
    };

    // 绘制建议项
    const renderItem = (item: IData) => {
      return [
        <div class={ns.be('item', 'icon')}>
          {props.fieldIconMap.get(item.value) === 'measure' ? (
            <svg
              viewBox='0 0 16 16'
              xmlns='http://www.w3.org/2000/svg'
              height='1em'
              width='1em'
              focusable='false'
              fill='currentColor'
            >
              <g stroke-width='1' fill-rule='evenodd'>
                <path d='M4.236 9.9l.422-3.8H2.6a.6.6 0 1 1 0-1.2h2.19l.372-3.347a.6.6 0 1 1 1.192.133L5.998 4.9h4.793l.37-3.347a.6.6 0 0 1 1.193.133L11.998 4.9h2.459a.6.6 0 0 1 0 1.2h-2.592l-.421 3.8h2.013a.6.6 0 0 1 0 1.2H11.31l-.374 3.368a.6.6 0 0 1-1.192-.132l.358-3.236H5.311l-.374 3.368a.6.6 0 0 1-1.192-.132l.358-3.236H1.6a.6.6 0 0 1 0-1.2h2.636zm1.208 0h4.792l.422-3.8H5.865l-.421 3.8z'></path>
              </g>
            </svg>
          ) : (
            <svg
              viewBox='0 0 16 16'
              xmlns='http://www.w3.org/2000/svg'
              height='1em'
              width='1em'
              focusable='false'
              fill='currentColor'
            >
              <g stroke-width='1' fill-rule='evenodd'>
                <path d='M9 1.2v4.974h1V3.2h2v2.974h1.5a1.5 1.5 0 0 1 1.5 1.5v5.784a1.5 1.5 0 0 1-1.5 1.5h-11a1.5 1.5 0 0 1-1.5-1.5V7.674a1.5 1.5 0 0 1 1.5-1.5H4V3.2h2v2.974h1V1.2h2zM6 6.636H4v4.038h2V6.636zm1 4.038h2V6.636H7v4.038zm5-4.053h-2v4.053h2V6.621z'></path>
              </g>
            </svg>
          )}
        </div>,
        <div class={ns.be('item', 'text')}>{item.label || ''}</div>,
      ];
    };

    return {
      ns,
      currentValue,
      pqlEditor,
      handleChange,
      handleCancel,
      handleConfirm,
      renderItem,
    };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <div class={this.ns.b('header')}>{biReportT('pqlEditor')}</div>
        <div class={this.ns.b('content')}>
          <iBizPqlEditor
            ref='pqlEditor'
            class={this.ns.e('pql-editor')}
            placeholder={biReportT('filterPlaceholder')}
            value={this.currentValue}
            fields={this.fields}
            context={this.context}
            params={this.params}
            renderItem={this.renderItem}
            onChange={this.handleChange}
          ></iBizPqlEditor>
        </div>
        <div class={this.ns.b('footer')}>
          <el-button text onClick={this.handleCancel}>
            {biReportT('cancel')}
          </el-button>
          <el-button onClick={this.handleConfirm}>
            {biReportT('confirm')}
          </el-button>
        </div>
      </div>
    );
  },
});
