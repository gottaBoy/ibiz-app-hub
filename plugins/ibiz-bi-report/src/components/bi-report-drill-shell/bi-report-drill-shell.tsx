import { PropType, defineComponent, h, ref, resolveComponent } from 'vue';
import { IAppBIReport, IAppBIReportDimension } from '@ibiz/model-core';
import { IModal } from '@ibiz-template/runtime';
import { useNamespace } from '../../use';
import { IAppBIDrillDetailData } from '../../interface';
import {
  getReportDimensionParam,
  getReportMeasureParam,
  getReportSortParam,
  getSearchconds,
} from '../../util';
import './bi-report-drill-shell.scss';

export default defineComponent({
  name: 'BIReportDrillShell',
  props: {
    appViewId: {
      type: String,
      required: true,
    },
    context: {
      type: Object as PropType<IContext>,
      required: true,
    },
    data: {
      type: Object as PropType<IAppBIDrillDetailData>,
      required: true,
    },
    reportModel: {
      type: Object as PropType<IAppBIReport>,
      required: true,
    },
    config: {
      type: Object as PropType<IAppBIReport>,
      required: true,
    },
    dynamicDataDic: {
      type: Object as PropType<IData>,
      required: true,
    },
    /**
     * @description 视图模态操作对象，在模态等形式打开视图时，需给视图注入此对象
     */
    modal: { type: Object as PropType<IModal> },
  },
  setup(props) {
    const ns = useNamespace('bi-report-drill-shell');

    // 标题
    const caption = ref('');

    // 维度项
    const items = ref<
      {
        text?: string;
        name: string;
        value?: unknown;
        valueText?: string;
      }[]
    >([]);

    // 激活维度项
    const activeItems = ref<string[]>([]);

    // 激活维度项文本
    const activeText = ref<string>('');

    // 自定义参数
    const customParams = ref<IParams>({});

    // 是否已加载代码表
    const isLoaded = ref(false);

    // 获取代码表项
    const getCodeListItems = async (appCodeListId: string) => {
      if (!props.context) {
        return [];
      }
      const app = ibiz.hub.getApp(props.context.srfappid);
      const items = await app.codeList.get(appCodeListId, props.context);
      return items;
    };

    // 更新自定义参数
    const updateCustomParams = () => {
      const { appBISchemeId, appBICubeId } = props.config as IData;
      const measure = props.data.measure;
      const dimension = props.data.dimension?.filter(item =>
        activeItems.value.includes(item.name),
      );
      let customCond: string = '';
      const result: IData = {
        bicubetag: appBICubeId,
      };
      // 处理指标
      const targetMeasure = props.reportModel.appBIReportMeasures?.find(
        item => {
          return item.measureTag === measure.name;
        },
      );
      if (!targetMeasure) {
        ibiz.log.error('执行数据反查未找到指标数据中断');
        return;
      }
      Object.assign(result, {
        bimeasures: getReportMeasureParam(props.reportModel, [targetMeasure]),
      });
      customCond += `${appBISchemeId}.${appBICubeId}.${targetMeasure.measureTag}`;
      // 处理维度
      let targetDimensions: IAppBIReportDimension[] | undefined = [];
      Object.assign(result, {
        bidimensions: [],
      });
      if (dimension && dimension.length > 0) {
        customCond += `$`;
        const dimensionMap: Map<string, unknown> = new Map();
        dimension.forEach((item, index) => {
          dimensionMap.set(item.name, item.value);
          customCond += `${item.name}=${item.value}`;
          if (index !== dimension.length - 1) {
            customCond += '&';
          }
        });
        targetDimensions = props.reportModel.appBIReportDimensions?.filter(
          element => {
            return dimensionMap.has(element.dimensionTag!);
          },
        );
        if (targetDimensions && targetDimensions.length > 0) {
          Object.assign(result, {
            bidimensions: getReportDimensionParam(
              props.reportModel,
              targetDimensions,
            ),
          });
        }
      }
      // 处理排序
      Object.assign(result, {
        bisort: getReportSortParam(
          props.reportModel,
          [targetMeasure],
          targetDimensions,
        ),
      });
      // 处理过滤
      const searchConds: IData[] = [
        {
          condtype: 'CUSTOM',
          customtype: 'BIDRILLDETAIL',
          customcond: customCond,
        },
      ];
      const filterConds = getSearchconds(props.reportModel);
      if (filterConds) {
        searchConds.push(filterConds[0]);
      }
      Object.assign(result, {
        searchconds: searchConds,
      });
      // 处理明细视图标题
      Object.assign(result, {
        reportcaption: caption.value,
      });
      customParams.value = result;
      activeText.value = items.value
        .filter(item => activeItems.value.some(name => name === item.name))
        .map(item => item.text)
        .join(',');
    };

    // 初始化数据
    const init = async () => {
      try {
        isLoaded.value = false;
        const { measure, dimension } = props.data;

        if (measure) {
          const reportMeasure = props.reportModel.appBIReportMeasures?.find(
            item => {
              return item.measureTag === measure.name;
            },
          );
          if (reportMeasure) {
            caption.value = reportMeasure.measureName || '';
          }
        }

        if (Array.isArray(dimension)) {
          const reportDimensions =
            props.reportModel.appBIReportDimensions?.filter(item => {
              return dimension.some(
                _dimension => _dimension.name === item.dimensionTag,
              );
            });
          if (reportDimensions && reportDimensions.length) {
            const dimensions = await Promise.all(
              reportDimensions.map(async item => {
                const value = dimension.find(
                  _dimension => _dimension.name === item.dimensionTag,
                )?.value;
                let valueText = value;
                if (item.appCodeListId) {
                  const codeListItems = await getCodeListItems(
                    item.appCodeListId,
                  );
                  const codeListItem = codeListItems?.find(
                    _item => _item.value === value,
                  );
                  if (codeListItem) {
                    valueText = codeListItem.text;
                  }
                }
                if (!item.appCodeListId && item.textAppDEFieldId) {
                  if (props.dynamicDataDic) {
                    valueText =
                      props.dynamicDataDic[item.dimensionTag!]?.[`${value}`];
                  }
                }
                return {
                  text: item.dimensionName,
                  name: item.dimensionTag,
                  value,
                  valueText,
                };
              }),
            );
            items.value = dimensions as typeof items.value;
            activeItems.value = items.value.map(item => item.name);
          }
        }
        updateCustomParams();
      } finally {
        isLoaded.value = true;
      }
    };

    init();

    // 处理项点击
    const handleClick = (item: (typeof items.value)[0]) => {
      const index = activeItems.value.findIndex(name => name === item.name);
      if (index !== -1) {
        activeItems.value.splice(index, 1);
      } else {
        activeItems.value.push(item.name);
      }
      updateCustomParams();
    };

    return {
      ns,
      caption,
      items,
      activeItems,
      activeText,
      customParams,
      isLoaded,
      handleClick,
    };
  },
  render() {
    if (!this.isLoaded) {
      return;
    }
    return (
      <div class={this.ns.b()}>
        {/* <div class={this.ns.b('header')}>{this.caption}</div> */}
        <div class={this.ns.b('content')}>
          {this.items.length > 0 && (
            <div class={this.ns.b('content-left')}>
              <div class={this.ns.b('content-left-list')}>
                {this.items.map(item => {
                  return (
                    <div
                      class={[
                        this.ns.b('item'),
                        this.ns.is(
                          'active',
                          this.activeItems.includes(item.name),
                        ),
                      ]}
                      onClick={() => {
                        this.handleClick(item);
                      }}
                    >
                      <div class={this.ns.be('item', 'name')}>
                        {item.text || ''}
                      </div>
                      <div class={this.ns.be('item', 'value')}>
                        {item.valueText || ''}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div
                class={this.ns.b('content-left-active-items')}
                title={`已过滤的纬度：${this.activeText}`}
              >
                <span class={this.ns.be('content-left-active-items', 'text')}>
                  已过滤的纬度：{this.activeText}
                </span>
              </div>
            </div>
          )}

          <div class={this.ns.b('content-right')}>
            {h(resolveComponent('IBizViewShell'), {
              context: this.context,
              params: this.customParams,
              viewId: this.appViewId,
              modal: this.modal,
            })}
          </div>
        </div>
      </div>
    );
  },
});
