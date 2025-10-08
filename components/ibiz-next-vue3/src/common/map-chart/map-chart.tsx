/* eslint-disable eqeqeq */
import { defineComponent, onMounted, PropType, computed } from 'vue';
import { isNil, mergeDeepWithKey } from 'ramda';
import { useNamespace } from '@ibiz-template/vue3-util';
import { IMapData, MapController } from '@ibiz-template/runtime';
import { defaultOpts, MapOptions } from './map-chart.util';
import { useMapManager } from './map-manager';
import './map-chart.scss';

export const IBizMapChart = defineComponent({
  name: 'IBizMapChart',
  props: {
    areaData: {
      type: Array<IMapData>,
    },
    pointData: {
      type: Array<IMapData>,
    },
    options: {
      type: Object as PropType<Partial<MapOptions>>,
      default: () => ({}),
    },
    controller: {
      type: MapController,
      required: true,
    },
  },
  setup(props, { emit }) {
    const ns = useNamespace('map-chart');
    const options = computed<MapOptions>(() => {
      // 后一个的undefined不覆盖
      return mergeDeepWithKey(
        (_key, x, z) => {
          return isNil(z) ? x : z;
        },
        defaultOpts,
        props.options,
      );
    });

    const findData = (id: string, type: 'area' | 'point') => {
      if (type === 'area' && props.areaData) {
        return props.areaData.find(item => item._id === id);
      }
      if (type === 'point' && props.pointData) {
        return props.pointData.find(item => item._id === id);
      }
    };

    const { chartRef, historyNames, changeMap, getCityName, goBack } =
      useMapManager(
        props.controller,
        options,
        mapName => {
          const {
            visualMap,
            pointSymbol,
            areaColor,
            hoverAreaColor,
            areaBorderColor,
          } = options.value;
          const areaData = props.areaData || [];
          const pointData = props.pointData || [];

          const result: IData = {
            geo: {
              map: mapName,
            },
            tooltip: {
              trigger: 'item',
              // 全局的tooltip样式
              textStyle: {
                color: '#fff',
                fontSize: 12,
              },
              backgroundColor: 'rgba(0, 0, 0, 0.47)',
              borderWidth: 0,
              extraCssText: 'backdrop-filter: blur(3px);',
            },
            visualMap: {
              min: visualMap.min,
              max: visualMap.max,
              text: visualMap.text,
              realtime: false,
              hoverLink: false,
              inRange: {
                color: visualMap.rangeColor,
              },
            },
            series: [
              // 地图区块序列
              {
                type: 'map',
                map: mapName,
                // 地图JSON里和name匹配的属性名称
                nameProperty: 'adcodeStr',
                itemStyle: {
                  // 默认区域颜色
                  areaColor,
                  borderColor: areaBorderColor,
                  borderWidth: 2,
                },
                // 悬浮样式
                emphasis: {
                  itemStyle: {
                    areaColor: hoverAreaColor,
                  },
                },
                tooltip: {
                  formatter: (params: IData) => {
                    if (!params.data) {
                      // 没有数据的时候不显示tooltip
                      return;
                    }
                    const find = findData(params.data._id, 'area')!;
                    if (!find) {
                      return;
                    }
                    return find._tooltip;
                  },
                },
                label: {
                  // 区块文字固定显示
                  show: true,
                  // 字体样式
                  color: '#000000',
                  fontSize: 14,
                  formatter: (params: IData) => {
                    return getCityName(params.name);
                  },
                },
                select: {
                  disabled: true,
                },
                data: areaData.map(item => ({
                  name: `${item._areaCode}`,
                  value: item._value,
                  _id: item._id,
                })),
              },
              // 地图散点序列
              {
                type: 'scatter',
                coordinateSystem: 'geo',
                symbol: pointSymbol,
                symbolSize: 20,
                visualMap: false,
                itemStyle: {
                  color: '#FF1D00',
                },
                label: {
                  show: true,
                  // 字体样式
                  color: '#000000',
                  fontSize: 14,
                  textShadowBlur: 0,
                  formatter: (params: IData) => {
                    const find = findData(params.data._id, 'point')!;
                    return find?._text;
                  },
                  // 偏移
                  position: 'left',
                  offset: [10, -15],
                },
                tooltip: {
                  formatter: (params: IData) => {
                    const find = findData(params.data._id, 'point')!;
                    return find?._tooltip;
                  },
                },
                data: pointData.map(item => {
                  return {
                    _id: item._id,
                    symbol: item._symbol
                      ? `image://${item._symbol}`
                      : undefined,
                    value: [Number(item._longitude), Number(item._latitude)],
                    // 每个点逃离visualMap
                    visualMap: false,
                  };
                }),
              },
            ],
          };
          return result;
        },
        (name, e) => {
          switch (name) {
            case 'pointClick':
              emit('pointClick', findData(e._id, 'point'));
              break;
            case 'areaClick':
              emit('areaClick', findData(e._id, 'area'));
              break;
            default:
              break;
          }
        },
      );

    onMounted(() => {
      changeMap(options.value.defaultAreaCode, true);
    });

    return { ns, chartRef, historyNames, goBack };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <div class={this.ns.e('chart')} ref='chartRef'></div>
        {this.historyNames.length > 1 && (
          <div
            class={this.ns.e('goback')}
            onClick={() => {
              this.goBack();
            }}
          >
            {ibiz.i18n.t('app.return')}
          </div>
        )}
      </div>
    );
  },
});

export default IBizMapChart;
