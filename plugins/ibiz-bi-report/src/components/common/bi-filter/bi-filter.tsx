import { PropType, computed, defineComponent, ref, watch } from 'vue';
import { useNamespace } from '../../../use';
import BIFilterCondition from '../filter-condition/filter-condition';
import { ISchemaField } from '../../../interface';
import './bi-filter.scss';
import { IFilterNodeGroup, IModal } from '@ibiz-template/runtime';
import { RuntimeError } from '@ibiz-template/core';
import { biReportT } from '../../../locale';

export interface IFilterState {
  /**
   * 是否已加载schema
   *
   * @author zhanghengfeng
   * @date 2024-07-16 17:07:25
   * @type {boolean}
   */
  isLoadedSchema: boolean;

  /**
   * 条件字段
   *
   * @author zhanghengfeng
   * @date 2024-07-16 17:07:44
   * @type {ISchemaField[]}
   */
  conditionFields: ISchemaField[];

  /**
   * 字段
   *
   * @author zhanghengfeng
   * @date 2024-07-16 17:07:55
   * @type {ISchemaField[]}
   */
  fields: ISchemaField[];

  /**
   * 字段图标映射
   *
   * @author zhanghengfeng
   * @date 2024-07-16 17:07:06
   * @type {Map<string, string>}
   */
  fieldIconMap: Map<string, string>;

  /**
   * 条件
   *
   * @author zhanghengfeng
   * @date 2024-07-16 17:07:17
   * @type {IFilterNodeGroup}
   */
  cond?: IFilterNodeGroup;

  /**
   * 过滤模式
   *
   * @author zhanghengfeng
   * @date 2024-07-16 21:07:47
   * @type {string}
   */
  filterMode?: string;

  /**
   * 自定义条件
   *
   * @author zhanghengfeng
   * @date 2024-07-16 21:07:58
   * @type {string}
   */
  customCond?: string;
}

export default defineComponent({
  name: 'BIFilter',
  components: {
    'bi-filter-condition': BIFilterCondition,
  },
  props: {
    modal: {
      type: Object as PropType<IModal>,
      required: true,
    },
    state: {
      type: Object as PropType<IFilterState>,
      required: true,
    },
    context: {
      type: Object as PropType<IContext>,
      required: true,
    },
    params: {
      type: Object as PropType<IParams>,
      required: true,
    },
    borderMode: {
      type: String as PropType<'DEFAULT' | 'BORDER'>,
      default: 'DEFAULT',
    },
  },
  emit: ['confirm'],
  setup(props, { emit }) {
    const ns = useNamespace('bi-filter');

    // 激活tab
    const activeTab = ref(props.state.filterMode || 'default');

    // 是否已加载
    const isLoaded = computed(() => {
      return props.state.isLoadedSchema;
    });

    // 条件
    const cond = ref<IFilterNodeGroup | null>();

    watch(
      () => props.state.cond,
      () => {
        cond.value = props.state.cond;
      },
      {
        immediate: true,
      },
    );

    // 条件字段
    const schemaFields = computed(() => {
      return props.state.conditionFields;
    });

    // 处理条件变化
    const handleCondChange = (value: IFilterNodeGroup | null) => {
      cond.value = value;
    };

    // 字段
    const fields = computed(() => {
      return props.state.fields;
    });

    // 字段图标映射
    const fieldIconMap = computed(() => {
      return props.state.fieldIconMap;
    });

    // 当前自定义条件
    const customCond = ref('');

    // pql编辑器
    const pqlEditor = ref();

    watch(
      () => props.state.customCond,
      () => {
        customCond.value = props.state.customCond || '';
      },
      {
        immediate: true,
      },
    );

    // 处理自定义条件变化
    const handleCustomCondChange = (value: string) => {
      customCond.value = value;
    };

    // 处理重置按钮点击
    const handleReset = (e: MouseEvent) => {
      e.stopPropagation();
      props.modal.dismiss();
      emit('reset');
    };

    // 处理取消按钮点击
    const handleCancel = (e: MouseEvent) => {
      e.stopPropagation();
      props.modal.dismiss();
    };

    // 处理确认按钮点击
    const handleConfirm = (e: MouseEvent) => {
      e.stopPropagation();
      try {
        if (activeTab.value === 'pql') {
          if (pqlEditor.value) {
            const result = pqlEditor.value.verify?.();
            if (!result) {
              return;
            }
          }
          emit('confirm', {
            type: activeTab.value,
            customCond: customCond.value,
          });
        } else {
          emit('confirm', {
            type: activeTab.value,
            cond: cond.value,
          });
        }
        props.modal.dismiss();
      } catch (err) {
        ibiz.log.error((err as RuntimeError)?.message);
      }
    };

    // 绘制建议项
    const renderItem = (item: IData) => {
      return [
        <div class={ns.be('item', 'icon')}>
          {fieldIconMap.value.get(item.value) === 'measure' ? (
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
      activeTab,
      isLoaded,
      cond,
      schemaFields,
      handleCondChange,
      customCond,
      pqlEditor,
      fields,
      fieldIconMap,
      handleCustomCondChange,
      handleReset,
      handleCancel,
      handleConfirm,
      renderItem,
    };
  },
  render() {
    return (
      <div class={this.ns.b()} v-loading={!this.isLoaded}>
        {this.isLoaded
          ? [
              <div class={this.ns.b('header')}>
                <div class={this.ns.b('header-text')}>
                  {biReportT('filter')}
                </div>
                <div
                  class={[
                    this.ns.b('header-tab'),
                    this.ns.bm('header-tab', this.activeTab),
                  ]}
                >
                  <el-tabs type='card' v-model={this.activeTab}>
                    <el-tab-pane
                      name='default'
                      label={biReportT('basic')}
                    ></el-tab-pane>
                    <el-tab-pane name='pql' label='PQL'></el-tab-pane>
                  </el-tabs>
                </div>
                <div
                  class={this.ns.b('header-btn')}
                  onClick={this.handleCancel}
                >
                  <svg
                    viewBox='0 0 16 16'
                    xmlns='http://www.w3.org/2000/svg'
                    height='1em'
                    width='1em'
                    preserveAspectRatio='xMidYMid meet'
                    focusable='false'
                  >
                    <g stroke-width='1' fill-rule='evenodd'>
                      <path
                        d='M7.456 7.456V-.115h1.2v7.571h7.572v1.2H8.656v7.572h-1.2V8.656H-.115v-1.2h7.571z'
                        transform='rotate(45 8.056 8.056)'
                      ></path>
                    </g>
                  </svg>
                </div>
              </div>,
              <div class={this.ns.b('content')}>
                {this.activeTab === 'pql' ? (
                  <iBizPqlEditor
                    ref='pqlEditor'
                    class={this.ns.e('pql-editor')}
                    placeholder={biReportT('filterPlaceholder')}
                    value={this.customCond}
                    fields={this.fields}
                    context={this.context}
                    params={this.params}
                    renderItem={this.renderItem}
                    onChange={this.handleCustomCondChange}
                  ></iBizPqlEditor>
                ) : (
                  <bi-filter-condition
                    class={this.ns.e('filter-condition')}
                    value={this.cond}
                    schemaFields={this.schemaFields}
                    context={this.context}
                    params={this.params}
                    onChange={this.handleCondChange}
                    borderMode={this.borderMode}
                  ></bi-filter-condition>
                )}
              </div>,
              <div class={this.ns.b('footer')}>
                <div
                  class={this.ns.be('footer', 'reset-btn')}
                  onClick={this.handleReset}
                >
                  {biReportT('reset')}
                </div>
                <el-button
                  class={this.ns.be('footer', 'cancel-btn')}
                  text
                  onClick={this.handleCancel}
                >
                  {biReportT('cancel')}
                </el-button>
                <el-button
                  class={this.ns.be('footer', 'confirm-btn')}
                  onClick={this.handleConfirm}
                >
                  {biReportT('confirm')}
                </el-button>
              </div>,
            ]
          : null}
      </div>
    );
  },
});
