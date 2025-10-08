/* eslint-disable no-unused-vars */
import { registerMap as register, EChartsType, init } from 'echarts';
import { ComputedRef, onMounted, onUnmounted, ref } from 'vue';
import { IMapData, MapController } from '@ibiz-template/runtime';
import { listenJSEvent } from '@ibiz-template/core';
import { toNumber } from 'lodash-es';
import { findData, MapOptions, getJsonUrl } from './map-chart-user.util';

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
) {
  const mapInfos = new Map<string, IData>();

  const currentName = ref<string>('');

  const historyNames = ref<string[]>([]);

  const areaLevelMap = new Map<number, string>();

  const processing = ref(false);

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
      const { adcode, name, level } = item.properties;
      info.cityNames[adcode] = name;
      areaLevelMap.set(adcode, level);
    });
    return info;
  };

  const setOption = async (data: IData) => {
    controller.options = data;
    await controller.evt.emit('onBeforeUpdate', { data });
    chart.setOption(data, true);
  };

  const registerMap = async (name: string) => {
    if (mapInfos.has(name)) {
      return;
    }
    const json = await getJsonUrl(opts.value.jsonBaseUrl, name);
    mapInfos.set(name, parseJson(json));
    register(name, json);
  };

  const getCityInfo = () => {
    return mapInfos.get(currentName.value);
  };

  const refresh = () => {
    if (currentName.value) {
      const options = calcEchartsOpts(currentName.value);
      setOption(options);
      chart.resize();
    }
  };

  const changeMap = async (
    name: string | number,
    areaCode: string | number,
    isInit: boolean = false,
  ) => {
    const strName = `${name}`;
    if (!mapInfos.has(strName)) {
      await registerMap(strName);
    }
    if (!isInit) {
      await controller.onMapChange(areaCode);
    } else {
      // 初次加载设置默认行政等级
      const areaLevel = areaLevelMap.get(toNumber(areaCode)) || '';
      controller.state.areaLevel = areaLevel;
    }
    currentName.value = strName;
    controller.state.mapInfo = getCityInfo()!;
    historyNames.value.push(strName);
    refresh();
  };

  const goBack = async () => {
    // 一个时只有当前的name，不能后退。
    if (historyNames.value.length > 1) {
      historyNames.value.pop(); // 先删除当前地图的name
      const name = historyNames.value.pop(); // 获取上一个地图的name
      const areaCode = opts.value.strAreaCode ? `${name}` : Number(name);
      const areaLevel = areaLevelMap.get(toNumber(areaCode)) || '';
      controller.state.areaCode = areaCode;
      controller.state.areaLevel = areaLevel;
      changeMap(name!, areaCode);
    }
  };

  const cleanup = listenJSEvent(window, 'resize', () => {
    if (chart) {
      chart.resize();
    }
  });

  onMounted(() => {
    chart = init(chartRef.value);
    controller.chart = chart;
    if (chartRef.value && ResizeObserver) {
      resizeObserver = new ResizeObserver(() => {
        chart?.resize();
      });
      resizeObserver.observe(chartRef.value);
    }
    chart.on('click', (params: IData) => {
      if (params.componentType === 'series') {
        // 散点点击事件
        if (params.seriesType === 'scatter') {
          if (!params.data) {
            return;
          }
          processing.value = true;
          const { pointData, areaData } = controller.state;
          const data = findData(params.data._id, 'point', pointData, areaData);
          if (data) {
            controller.onPointClick(data as IMapData);
          }
          processing.value = false;
          return;
        }
        // 区域点击事件
        if (params.seriesType === 'map') {
          processing.value = true;
          const areaCode = opts.value.strAreaCode
            ? `${params.name}`
            : Number(params.name);
          const areaLevel = areaLevelMap.get(toNumber(areaCode)) || '';
          const { pointData, areaData, enabledDrillDown, mdctrlActiveMode } =
            controller.state;
          if (params.data) {
            const data = findData(params.data._id, 'area', pointData, areaData);
            if (data) {
              controller.onAreaClick(data as IMapData, areaCode, areaLevel);
            }
          }
          // 禁止切换同一个地图，到最下级的时候会出现这种情况
          if (
            params.name !== currentName.value &&
            enabledDrillDown &&
            mdctrlActiveMode !== 2
          ) {
            // 行政编码大于当前编码即下钻
            if (toNumber(areaCode) > toNumber(controller.state.areaCode)) {
              controller.evt.emit('onDrillDown', { data: { areaCode } });
            }
            controller.state.areaCode = areaCode;
            controller.state.areaLevel = areaLevel || '';
            changeMap(params.name, areaCode);
          }
          processing.value = false;
        }
      }
    });
    chart.on('dblclick', (params: IData) => {
      // 区域点击事件
      const { enabledDrillDown, mdctrlActiveMode } = controller.state;
      if (
        params.componentType === 'series' &&
        params.seriesType === 'map' &&
        mdctrlActiveMode === 2 &&
        enabledDrillDown
      ) {
        processing.value = true;
        const areaCode = opts.value.strAreaCode
          ? `${params.name}`
          : Number(params.name);
        const areaLevel = areaLevelMap.get(toNumber(areaCode)) || '';
        // 行政编码大于当前编码即下钻
        if (toNumber(areaCode) > toNumber(controller.state.areaCode)) {
          controller.evt.emit('onDrillDown', { data: { areaCode } });
        }
        controller.state.areaCode = areaCode;
        controller.state.areaLevel = areaLevel;

        // 禁止切换同一个地图，到最下级的时候会出现这种情况
        if (params.name !== currentName.value) {
          changeMap(params.name, areaCode);
        }
        processing.value = false;
      }
    });

    // 散点悬浮size变大
    chart.on('mouseover', function (data) {
      controller.evt.emit('onMouseOver', { data });
      if (data.componentType === 'series') {
        if (data.seriesType === 'scatter') {
          const dataIndex = data.dataIndex;
          const options: IData = chart.getOption();
          const seriesData = options.series[data.seriesIndex!].data;
          const originSize = options.series[data.seriesIndex!].symbolSize;
          // 修改悬浮的数据点大小
          seriesData[dataIndex].symbolSize = originSize + 10;

          setOption(options);
        }
      }
    });
    chart.on('mouseout', function (data) {
      controller.evt.emit('onMouseOut', { data });
      if (data.componentType === 'series') {
        if (data.seriesType === 'scatter') {
          const dataIndex = data.dataIndex;
          const options: IData = chart.getOption();
          const seriesData = options.series[data.seriesIndex!].data;

          // 恢复原始的数据点大小
          delete seriesData[dataIndex].symbolSize;

          setOption(options);
        }
      }
    });
  });

  onUnmounted(() => {
    cleanup();
    resizeObserver?.disconnect();
  });

  return {
    chartRef,
    historyNames,
    currentName,
    processing,
    areaLevelMap,
    changeMap,
    getCityInfo,
    goBack,
    refresh,
  };
}
