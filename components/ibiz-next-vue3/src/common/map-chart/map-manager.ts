/* eslint-disable no-unused-vars */
import { registerMap as register, EChartsType, init } from 'echarts';
import { ComputedRef, onMounted, onUnmounted, ref } from 'vue';
import { MapController } from '@ibiz-template/runtime';
import { MapOptions } from './map-chart.util';
import { getJsonUrl } from './map-json';

/**
 * 使用echarts地图
 * @author lxm
 * @date 2023-04-06 12:00:07
 * @export
 * @param {(name: string) => IData} calcEchartsOpts 计算echarts的Options
 * @param {(name: string, e: IData) => void} emit 事件回调
 * @return {*}
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function useMapManager(
  controller: MapController,
  opts: ComputedRef<MapOptions>,
  calcEchartsOpts: (name: string) => IData,
  emit: (name: string, e: IData) => void,
) {
  const mapInfos = new Map<string, IData>();

  const currentName = ref<string>('');

  const historyNames = ref<string[]>([]);

  let chart: EChartsType;
  const chartRef = ref();

  // 容器大小变化监听器
  let resizeObserver: ResizeObserver;

  const parseJson = (json: IData) => {
    const info: IData = {
      cityNames: {},
      noChild: json.features.length === 1,
    };
    json.features.forEach((item: IData) => {
      const { adcode, name } = item.properties;
      info.cityNames[adcode] = name;
    });
    return info;
  };

  const registerMap = async (name: string) => {
    if (mapInfos.has(name)) {
      return;
    }
    const json = await getJsonUrl(opts.value.jsonBaseUrl, name);
    mapInfos.set(name, parseJson(json));
    register(name, json);
  };

  const getCityName = (mapName: string | number) => {
    const info = mapInfos.get(currentName.value);
    if (info) {
      return info.cityNames[mapName];
    }
  };

  const refresh = () => {
    if (currentName.value) {
      const options = calcEchartsOpts(currentName.value);
      chart.setOption(options);
      chart.resize();
    }
  };

  const changeMap = async (name: string | number, isInit: boolean = false) => {
    if (!isInit) {
      const areaCode = opts.value.strAreaCode ? `${name}` : Number(name);
      await controller.onMapChange(areaCode);
    }
    const strName = `${name}`;

    if (!mapInfos.has(strName)) {
      await registerMap(strName);
    }
    currentName.value = strName;
    historyNames.value.push(strName);
    refresh();
  };

  const goBack = () => {
    // 一个时只有当前的name，不能后退。
    if (historyNames.value.length > 1) {
      historyNames.value.pop(); // 先删除当前地图的name
      const name = historyNames.value.pop(); // 获取上一个地图的name
      changeMap(name!);
    }
  };

  // 重置地图大小
  const resize = () => {
    chart?.resize();
  };

  onMounted(() => {
    chart = init(chartRef.value);

    window.addEventListener('resize', resize);

    if (chartRef.value && ResizeObserver) {
      resizeObserver = new ResizeObserver(() => {
        resize();
      });
      resizeObserver.observe(chartRef.value);
    }

    chart.on('click', params => {
      // 散点点击事件
      if (params.componentType === 'series') {
        if (params.seriesType === 'scatter') {
          emit('pointClick', params.data as IData);
          return;
        }
        if (params.seriesType === 'map') {
          if (params.data) {
            emit('areaClick', params.data as IData);
          }
          // 禁止切换同一个地图，到最下级的时候会出现这种情况
          if (params.name !== currentName.value) {
            changeMap(params.name);
          }
        }
      }
    });

    // 散点悬浮size变大
    chart.on('mouseover', function (params) {
      if (params.componentType === 'series') {
        if (params.seriesType === 'scatter') {
          const dataIndex = params.dataIndex;
          const option: IData = chart.getOption();
          const seriesData = option.series[params.seriesIndex!].data;
          const originSize = option.series[params.seriesIndex!].symbolSize;
          // 修改悬浮的数据点大小
          seriesData[dataIndex].symbolSize = originSize + 10;

          // 刷新图表
          chart.setOption(option);
        }
      }
    });
    chart.on('mouseout', function (params) {
      if (params.componentType === 'series') {
        if (params.seriesType === 'scatter') {
          const dataIndex = params.dataIndex;
          const option: IData = chart.getOption();
          const seriesData = option.series[params.seriesIndex!].data;

          // 恢复原始的数据点大小
          delete seriesData[dataIndex].symbolSize;

          // 刷新图表
          chart.setOption(option);
        }
      }
    });
  });

  onUnmounted(() => {
    window.removeEventListener('resize', resize);
    resizeObserver?.disconnect();
  });

  return {
    chartRef,
    historyNames,
    currentName,
    changeMap,
    getCityName,
    goBack,
    refresh,
  };
}
