/* eslint-disable no-fallthrough */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { PropType, Ref, computed, defineComponent, ref, watch } from 'vue';
import { useNamespace } from '../../use';
import './bi-report-property.scss';
import { biReportT, localizeBiReportConfig } from '../../locale';
import BIChartTypes from './chart-types/chart-types';
import BICollapseItem from '../common/collapse-item/collapse-item';
import BIColorScheme from '../common/color-scheme/color-scheme';
import BIFontBorderSelect from '../common/font-border-select/font-border-select';
import BIPositionSelect from '../common/position-select/position-select';
import BIDragElement from '../common/bi-drag-element/bi-drag-element';
import BIChartPQLEditor from '../common/chart-pql-editor/chart-pql-editor';
import { BIReportDesignController } from '../../controller';
import { extendData } from '../../config';
/** BI报表属性组件 */
export default defineComponent({
  name: 'BIReportProperty',
  components: {
    'bi-chart-types': BIChartTypes,
    'bi-drag-element': BIDragElement,
    'bi-collapse-item': BICollapseItem,
    'bi-color-scheme': BIColorScheme,
    'bi-font-border-select': BIFontBorderSelect,
    'bi-position-select': BIPositionSelect,
    'bi-chart-pql-editor': BIChartPQLEditor,
  },
  props: {
    controller: {
      type: Object as PropType<BIReportDesignController>,
      required: true,
    },
  },
  emits: ['reportChartTypeChange'],
  setup(props, { emit }) {
    const ns = useNamespace(`property`);
    const c = props.controller;
    const groupConfig: Ref<IData> = ref({
      // 分组伸缩配置
      data: [],
      style: '',
      // 显示数据条数配置
      paginationVisible: false,
    });
    // 图表类型
    const chartType = computed(() => {
      return c.state.selectChartType;
    });
    // 报表图表控制器
    const reportChart = computed(() => {
      return c.state.reportChart;
    });
    // 选择tab值
    const selectTabValue = ref('data');

    // 切换图表类型
    const onReportChartTypeChange = (item: IData) => {
      emit('reportChartTypeChange', item.type);
    };

    // 属性数据
    const propertyData = computed(() => {
      return c.state.propertyData;
    });

    const errorData = computed(() => {
      return c.state.error;
    });

    // 属性配置
    const propertyConfig = computed(() => {
      return localizeBiReportConfig(
        reportChart.value?.state?.propertyConfig || {},
      );
    });

    // 切换报表时，重新设置伸缩配置
    watch(
      () => propertyConfig.value,
      newVal => {
        if (newVal && newVal.data) {
          groupConfig.value.data = [];
          newVal.data.details.forEach((_item: IData) => {
            if (_item.type === 'GROUP') {
              groupConfig.value.data.push(_item.id);
            }
          });
        }
        if (newVal && newVal.style) {
          groupConfig.value.style = '';
          if (newVal.style.details.length > 0) {
            groupConfig.value.style = newVal.style.details[0].id;
          }
        }
      },
      {
        immediate: true,
        deep: true,
      },
    );

    // 值变更
    const onChange = (name: string, value: any) => {
      c.setData(name, value);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e && e.code === 'Escape') {
        e.stopPropagation();
      }
    };

    // 分组内图标点击
    const onSvgClick = (
      type: string,
      id: string,
      mode: 'editMode' | 'remove' | 'showEmptyData',
      _value: any,
    ) => {
      switch (mode) {
        case 'editMode':
          // todo 切换编辑模式
          onChange(extendData.FILTERMODE, _value);
          break;
        case 'remove':
          if (
            id === 'filter' &&
            propertyData.value?.extend?.filterMode === 'pql'
          ) {
            onChange(extendData.PQLVALUE, '');
            return;
          }
          onChange(`${type}.${id}`, null);
          break;
        case 'showEmptyData':
          // todo 显示空数据
          break;
        default:
      }
    };

    // 绘制编辑器内容
    const renderEditorContent = (
      type: string,
      items: IData[] = [],
      groupId: string = '',
    ) => {
      return items.map((item: IData) => {
        switch (item.editorType) {
          case 'DRAG':
            return (
              <div
                class={[
                  ns.em('chart-setting', 'item'),
                  ns.em('chart-setting', 'drag'),
                ]}
              >
                {item.showCaption ? (
                  <div class={ns.em('chart-setting', 'label')}>
                    {item.caption}
                  </div>
                ) : null}
                {groupId === 'filter' &&
                propertyData.value?.extend?.filterMode === 'pql' ? (
                  <bi-chart-pql-editor
                    value={propertyData.value?.extend?.pqlValue}
                    controller={c}
                    onChange={(value: string) => {
                      onChange(extendData.PQLVALUE, value);
                    }}
                  ></bi-chart-pql-editor>
                ) : (
                  <bi-drag-element
                    value={propertyData.value?.[type][groupId]}
                    controller={c}
                    caption={item.caption}
                    subCaption={item.subCaption}
                    multiple={item.multiple}
                    type={item.id}
                    actions={item.actions}
                    expandActions={item.expandActions}
                    error={errorData.value?.[groupId]}
                    onChange={(value: IData[]) => {
                      onChange(`${type}.${groupId}`, value);
                    }}
                    onExtendChange={(name: string, value: unknown) => {
                      onChange(name, value);
                    }}
                  ></bi-drag-element>
                )}
              </div>
            );
          case 'COLOR':
            return (
              <div
                class={[
                  ns.em('chart-setting', 'item'),
                  ns.em('chart-setting', 'color'),
                ]}
              >
                {item.showCaption ? (
                  <div class={ns.em('chart-setting', 'label')}>
                    {item.caption}
                  </div>
                ) : null}
                <bi-color-scheme
                  editorStyle={item.editorStyle}
                  value={propertyData.value?.[type][groupId]}
                  onChange={(value: IData) =>
                    onChange(`${type}.${groupId}`, value)
                  }
                ></bi-color-scheme>
              </div>
            );
          case 'FONT':
            return (
              <div
                class={[
                  ns.em('chart-setting', 'item'),
                  ns.em('chart-setting', 'font'),
                ]}
              >
                {item.showCaption ? (
                  <div class={ns.em('chart-setting', 'label')}>
                    {item.caption}
                  </div>
                ) : null}
                <bi-font-border-select
                  value={propertyData.value?.[type][groupId]?.[item.id]}
                  mode={item.mode}
                  disabled={!propertyData.value?.[type][groupId]?.show}
                  fontMax={item.fontMax}
                  onChange={(value: any) =>
                    onChange(`${type}.${groupId}.${item.id}`, value)
                  }
                ></bi-font-border-select>
              </div>
            );
          case 'CHECKBOX':
            return (
              <div
                class={[
                  ns.em('chart-setting', 'item'),
                  ns.em('chart-setting', 'checkbox'),
                ]}
              >
                {item.showCaption ? (
                  <div class={ns.em('chart-setting', 'label')}>
                    {item.caption}
                  </div>
                ) : null}
                <el-checkbox
                  model-value={propertyData.value?.[type][groupId]?.[item.id]}
                  disabled={!propertyData.value?.[type][groupId]?.show}
                  label={item.caption}
                  size='large'
                  onChange={(value: string) =>
                    onChange(`${type}.${groupId}.${item.id}`, value)
                  }
                />
              </div>
            );
          case 'CHECKBOXS':
            return (
              <div
                class={[
                  ns.em('chart-setting', 'item'),
                  ns.em('chart-setting', 'checkboxs'),
                ]}
              >
                {item.showCaption ? (
                  <div class={ns.em('chart-setting', 'label')}>
                    {item.caption}
                  </div>
                ) : null}
                <el-checkbox-group
                  model-value={propertyData.value?.[type][groupId]?.[item.id]}
                  disabled={!propertyData.value?.[type][groupId]?.show}
                  onChange={(value: string) =>
                    onChange(`${type}.${groupId}.${item.id}`, value)
                  }
                >
                  {item.items.map((_item: IData) => {
                    return (
                      <el-checkbox
                        value={_item.id}
                        label={_item.id}
                        size='default'
                      >
                        {_item.label}
                      </el-checkbox>
                    );
                  })}
                </el-checkbox-group>
              </div>
            );
          case 'RADIO':
            return (
              <div
                class={[
                  ns.em('chart-setting', 'item'),
                  ns.em('chart-setting', 'radio'),
                ]}
              >
                {item.showCaption ? (
                  <div class={ns.em('chart-setting', 'label')}>
                    {item.caption}
                  </div>
                ) : null}
                <el-radio-group
                  model-value={propertyData.value?.[type][groupId]?.[item.id]}
                  disabled={!propertyData.value?.[type][groupId]?.show}
                  onChange={(value: string) =>
                    onChange(`${type}.${groupId}.${item.id}`, value)
                  }
                >
                  {item.items.map((_item: IData) => {
                    return (
                      <el-radio
                        value={_item.id}
                        label={_item.id}
                        size='default'
                      >
                        {_item.label}
                      </el-radio>
                    );
                  })}
                </el-radio-group>
              </div>
            );
          case 'POSITION': // 图例位置
            return (
              <div
                class={[
                  ns.em('chart-setting', 'item'),
                  ns.em('chart-setting', 'pos'),
                ]}
              >
                {item.showCaption ? (
                  <div class={ns.em('chart-setting', 'label')}>
                    {item.caption}
                  </div>
                ) : null}
                <bi-position-select
                  value={propertyData.value?.[type][groupId]?.[item.id]}
                  disabled={!propertyData.value?.[type][groupId]?.show}
                  editorStyle={item.editorStyle}
                  showCenter={item.showCenter}
                  onChange={(value: string) =>
                    onChange(`${type}.${groupId}.${item.id}`, value)
                  }
                ></bi-position-select>
              </div>
            );
          case 'ENDPOINT':
            return (
              <div
                class={[
                  ns.em('chart-setting', 'item'),
                  ns.em('chart-setting', 'endpoint'),
                ]}
              >
                {item.showCaption ? (
                  <div class={ns.em('chart-setting', 'label')}>
                    {item.caption}
                  </div>
                ) : null}
                <el-input-number
                  modelValue={propertyData.value?.[type][groupId]?.[item.id]}
                  min={1}
                  controls-position='right'
                  onkeydown={handleKeyDown}
                  onChange={(value: string) =>
                    onChange(`${type}.${groupId}.${item.id}`, value)
                  }
                />
              </div>
            );
          case 'NUMBER':
            return (
              <div
                class={[
                  ns.em('chart-setting', 'item'),
                  ns.em('chart-setting', 'label-interval'),
                ]}
              >
                {item.showCaption ? (
                  <div class={ns.em('chart-setting', 'label')}>
                    {item.caption}
                  </div>
                ) : null}
                <el-input-number
                  modelValue={propertyData.value?.[type][groupId]?.[item.id]}
                  min={0}
                  step={1}
                  precision={0}
                  controls-position='right'
                  onkeydown={handleKeyDown}
                  onChange={(value: string) =>
                    onChange(`${type}.${groupId}.${item.id}`, value)
                  }
                />
              </div>
            );
          default:
            return (
              <div class={ns.e('no-support')}>
                {biReportT('notImplemented', { name: item.caption || groupId })}
              </div>
            );
        }
      });
    };

    // 绘制明细
    const renderDetails = (type: string, items: IData[] = []) => {
      return items.map((item: IData) => {
        if (item.type === 'GROUP') {
          return (
            <bi-collapse-item
              label={item.caption}
              required={item.required}
              name={item.id}
              enableSwitch={item.enableSwitch || false}
              switchValue={propertyData.value?.[type][item.id]?.show} // 当前配置项是否显示
              enableShowEmptyData={item.showEmptyData || false} // 显示空数据
              enableRemove={item.enableRemove || false} // 显示清空按钮
              enableEditMode={item.switchEditMode || false} // 转换编辑模式按钮
              onSwitchChange={(value: boolean) =>
                onChange(`${type}.${item.id}.show`, value)
              }
              editMode={propertyData.value?.extend?.filterMode}
              onSvgClick={(data: {
                event: MouseEvent;
                mode: 'editMode' | 'remove' | 'showEmptyData';
                value: string;
              }) => {
                onSvgClick(type, item.id, data.mode, data.value);
              }}
            >
              {renderEditorContent(type, item.details, item.id)}
            </bi-collapse-item>
          );
        }
        return null;
      });
    };

    // 选择分页大小
    const selectPagination = (size: number) => {
      groupConfig.value.paginationVisible = false;
      onChange('data.size', size);
    };

    // 绘制分页设置选择
    const renderPagination = () => {
      return (
        <div class={ns.e('chart-pagination')}>
          <span class={ns.em('chart-pagination', 'caption')}>
            {biReportT('itemsPerPage')}
          </span>
          <el-popover
            v-model:visible={groupConfig.value.paginationVisible}
            trigger='click'
            placement='top-start'
            width={240}
            popper-class={ns.em('chart-pagination', 'list')}
          >
            {{
              reference: () => {
                return (
                  <span class={ns.em('chart-pagination', 'size')}>
                    <span
                      class={ns.em('chart-pagination', 'pagination-number')}
                    >
                      {propertyData.value?.data.size || 100}
                    </span>
                    <span class={ns.em('chart-pagination', 'icon')}>
                      <span>{biReportT('unitItem')}</span>
                      <svg
                        viewBox='0 0 16 16'
                        xmlns='http://www.w3.org/2000/svg'
                        height='1em'
                        width='1em'
                        fill='currentColor'
                      >
                        <g
                          id='aaynavigation/angle-down'
                          stroke-width='1'
                          fill-rule='evenodd'
                        >
                          <path
                            d='M7.978 11.997l-.005.006L2.3 6.33l.83-.831 4.848 4.848L12.826 5.5l.83.83-5.673 5.673-.005-.006z'
                            id='aay形状结合'
                          ></path>
                        </g>
                      </svg>
                    </span>
                  </span>
                );
              },
              default: () => {
                return [10, 50, 100, 1000, 5000].map((item: number) => {
                  return (
                    <div
                      class={[
                        ns.em('chart-pagination', 'pagination-item'),
                        ns.is(
                          'selected',
                          item === propertyData.value?.data.size,
                        ),
                      ]}
                      onClick={() => {
                        selectPagination(item);
                      }}
                    >
                      {item}
                    </div>
                  );
                });
              },
            }}
          </el-popover>
        </div>
      );
    };

    return {
      ns,
      onReportChartTypeChange,
      chartType,
      propertyConfig,
      selectTabValue,
      groupConfig,
      renderDetails,
      renderPagination,
    };
  },
  render() {
    return (
      <div class={this.ns.b('container')}>
        <div class={this.ns.e('caption')}>{biReportT('chartType')}</div>
        <div class={this.ns.e('chart-types')}>
          <bi-chart-types
            onSelect={this.onReportChartTypeChange}
            chartType={this.chartType}
          ></bi-chart-types>
        </div>
        <div
          class={[
            this.ns.e('style-select'),
            this.ns.is('style', this.selectTabValue === 'style'),
          ]}
        >
          <el-tabs v-model={this.selectTabValue} type='card'>
            <el-tab-pane name='data'>
              {{
                default: () => {
                  return (
                    <div class={this.ns.e('chart-setting')}>
                      <el-collapse
                        class={this.ns.b('editor-collapse')}
                        accordion={false}
                        v-model={this.groupConfig.data}
                      >
                        {this.renderDetails(
                          'data',
                          this.propertyConfig?.data?.details,
                        )}
                      </el-collapse>
                    </div>
                  );
                },
                label: () => {
                  return (
                    <div class={this.ns.e('data')}>{biReportT('data')}</div>
                  );
                },
              }}
            </el-tab-pane>
            <el-tab-pane name='style'>
              {{
                default: () => {
                  return (
                    <div class={this.ns.e('chart-setting')}>
                      <el-collapse
                        class={this.ns.b('editor-collapse')}
                        accordion={true}
                        v-model={this.groupConfig.style}
                      >
                        {this.renderDetails(
                          'style',
                          this.propertyConfig?.style?.details,
                        )}
                      </el-collapse>
                    </div>
                  );
                },
                label: () => {
                  return (
                    <div class={this.ns.e('style')}>{biReportT('style')}</div>
                  );
                },
              }}
            </el-tab-pane>
          </el-tabs>
        </div>
        {/* {this.propertyConfig?.data.pagination &&
          this.selectTabValue === 'data' &&
          this.renderPagination()} */}
      </div>
    );
  },
});
