import { PropType, Ref, defineComponent, ref, watch } from 'vue';
import { IModal } from '@ibiz-template/runtime';
import { createUUID } from 'qx-util';
import { useNamespace } from '../../../use';
import BIFontBorderSelect from '../font-border-select/font-border-select';
import './bi-chart-cordon.scss';
import { biReportT } from '../../../locale';

export const BIChartCordon = defineComponent({
  props: {
    value: {
      type: Array<IData>,
      default: [],
    },
    modal: { type: Object as PropType<IModal>, required: true },
  },
  components: {
    'bi-font-border-select': BIFontBorderSelect,
  },
  emit: ['cordonChange'],
  setup(props, { emit }) {
    const ns = useNamespace('bi-chart-cordon');
    const items: Ref<IData[]> = ref([]);
    const cordonType = [
      {
        get name() {
          return biReportT('fixedValue');
        },
        value: 'FIXED',
      },
      {
        get name() {
          return biReportT('maximum');
        },
        value: 'MAX',
      },
      {
        get name() {
          return biReportT('minimum');
        },
        value: 'MIN',
      },
      {
        get name() {
          return biReportT('averageValue');
        },
        value: 'AVERAGE',
      },
    ];

    // 删除项
    const onDelete = (item: IData) => {
      const index = items.value.findIndex((_item: IData) => {
        return _item.id === item.id;
      });
      if (index >= 0) {
        items.value.splice(index, 1);
      }
    };

    // 新增项
    const addItem = () => {
      items.value.push({
        id: createUUID(),
        name: biReportT('thresholdName', { number: items.value.length + 1 }),
        lineStyle: 'dashed',
        lineSize: 1,
        lineColor: 'red',
        cordonType: 'FIXED',
        cordonSize: 0,
      });
    };

    // 加图标
    const addNumber = () => {
      return (
        <svg
          viewBox='0 0 16 16'
          xmlns='http://www.w3.org/2000/svg'
          height='1em'
          width='1em'
          preserveAspectRatio='xMidYMid meet'
          focusable='false'
        >
          <g id='abdnavigation/angle-up' stroke-width='1' fill-rule='evenodd'>
            <path
              d='M7.978 11.498l-.005.005L2.3 5.831 3.13 5l4.848 4.848L12.826 5l.83.831-5.673 5.672-.005-.005z'
              id='abd形状结合'
              transform='rotate(180 7.978 8.252)'
            ></path>
          </g>
        </svg>
      );
    };

    // 减图标
    const minusNumber = () => {
      return (
        <svg
          viewBox='0 0 16 16'
          xmlns='http://www.w3.org/2000/svg'
          height='1em'
          width='1em'
          preserveAspectRatio='xMidYMid meet'
          focusable='false'
        >
          <g id='aaynavigation/angle-down' stroke-width='1' fill-rule='evenodd'>
            <path
              d='M7.978 11.997l-.005.006L2.3 6.33l.83-.831 4.848 4.848L12.826 5.5l.83.83-5.673 5.673-.005-.006z'
              id='aay形状结合'
            ></path>
          </g>
        </svg>
      );
    };

    // 线粗细改变
    const changeNumber = (tag: 'ADD' | 'REDUCE', item: IData) => {
      if (tag === 'ADD') {
        item.cordonSize += 1;
      } else {
        item.cordonSize -= 1;
      }
    };

    const borderChange = (item: IData, data: IData) => {
      const { borderStyle, borderSize, color } = data;
      item.lineStyle = borderStyle;
      item.lineSize = borderSize;
      item.lineColor = color;
    };

    // 绘制警戒线
    const renderContent = () => {
      return items.value.map((item: IData, index: number) => {
        return (
          <div class={ns.em('content', 'item')}>
            <div class={ns.em('content', 'item-header')}>
              <div class={ns.em('content', 'item-index')}>
                {biReportT('thresholdNumber', { number: index + 1 })}
              </div>
              <div
                class={ns.em('content', 'item-delete')}
                onClick={() => onDelete(item)}
              >
                <svg
                  viewBox='0 0 16 16'
                  xmlns='http://www.w3.org/2000/svg'
                  height='1em'
                  width='1em'
                  focusable='false'
                  fill='currentColor'
                >
                  <g id='azkaction/trash' stroke-width='1' fill-rule='evenodd'>
                    <path
                      d='M4.002 3.403V1a1 1 0 0 1 1-1h6.003a1 1 0 0 1 1 1v2.403h3.396a.6.6 0 1 1 0 1.2h-1.395V15a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4.603H.6a.6.6 0 1 1 0-1.2h3.4zm8.804 1.205H3.2V14.8h9.605V4.608zM5.202 1.2v2.155h5.603V1.2H5.202zm.6 6.417a.6.6 0 0 1 1.201 0v4.758a.6.6 0 0 1-1.2 0V7.617zm3.202 0a.6.6 0 0 1 1.2 0v4.758a.6.6 0 0 1-1.2 0V7.617z'
                      id='azk删除'
                    ></path>
                  </g>
                </svg>
              </div>
            </div>
            <div class={ns.em('content', 'item-editor')}>
              <div class={ns.em('content', 'line-set')}>
                <el-input v-model={item.name}></el-input>
                <bi-font-border-select
                  mode='BORDER'
                  borderMax={10}
                  borderMin={1}
                  useDotted={true}
                  value={{
                    borderStyle: item.lineStyle,
                    borderSize: item.lineSize,
                    color: item.lineColor,
                  }}
                  onChange={(data: IData) => borderChange(item, data)}
                ></bi-font-border-select>
              </div>
              <div class={ns.em('content', 'line-type')}>
                <el-select
                  v-model={item.cordonType}
                  class={ns.em('content', 'cordon-type')}
                  size='large'
                >
                  {{
                    default: () => {
                      return cordonType.map((cordon: IData) => {
                        return (
                          <el-option
                            key={cordon.value}
                            label={cordon.name}
                            value={cordon.value}
                          >
                            {cordon.name}
                          </el-option>
                        );
                      });
                    },
                  }}
                </el-select>
                {item.cordonType === 'FIXED' && (
                  <el-input
                    class={ns.e('input-number')}
                    v-model={item.cordonSize}
                    size={'large'}
                  >
                    {{
                      suffix: () => {
                        return (
                          <div class={[ns.e('input-number-suffix')]}>
                            <span
                              class={[
                                ns.e('input-number-suffix-add'),
                                ns.is('readonly', item.cordonSize >= 10),
                              ]}
                              onClick={() => changeNumber('ADD', item)}
                            >
                              {addNumber()}
                            </span>
                            <span
                              class={[
                                ns.e('input-number-suffix-minus'),
                                ns.is('readonly', item.cordonSize <= 1),
                              ]}
                              onClick={() => changeNumber('REDUCE', item)}
                            >
                              {minusNumber()}
                            </span>
                          </div>
                        );
                      },
                    }}
                  </el-input>
                )}
              </div>
            </div>
          </div>
        );
      });
    };

    // 新增警戒线
    const renderAddItem = () => {
      return (
        <div class={ns.em('content', 'add')} onClick={addItem}>
          <svg
            viewBox='0 0 16 16'
            xmlns='http://www.w3.org/2000/svg'
            height='1em'
            width='1em'
            focusable='false'
            fill='currentColor'
          >
            <g
              id='asg1.Base基础/1.icon图标/1.-action/plus'
              stroke-width='1'
              fill-rule='evenodd'
            >
              <path
                d='M8.578 7.383V1.602a.601.601 0 1 0-1.2 0v5.781H1.6a.601.601 0 0 0 0 1.203h5.777v5.812a.601.601 0 1 0 1.2 0V8.586H14.4a.601.601 0 0 0 0-1.203H8.578z'
                id='asgFill-1'
              ></path>
            </g>
          </svg>
          <span>{biReportT('addThreshold')}</span>
        </div>
      );
    };

    // 抛出事件
    const emitFunc = () => {
      emit('cordonChange', items.value);
    };

    watch(
      () => props.value,
      newVal => {
        if (newVal && Array.isArray(newVal) && newVal.length > 0) {
          items.value = newVal;
        } else {
          items.value = [];
        }
      },
      {
        immediate: true,
      },
    );

    // 取消
    const onCancel = () => {
      props.modal.dismiss();
    };

    // 确认
    const onOK = () => {
      emitFunc();
      props.modal.dismiss();
    };
    return { ns, onCancel, onOK, renderContent, renderAddItem };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <div class={this.ns.e('header')}>
          <span class={this.ns.em('header', 'caption')}>
            {biReportT('threshold')}
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
        <div class={this.ns.e('content')}>
          {this.renderContent()}
          {this.renderAddItem()}
        </div>
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
