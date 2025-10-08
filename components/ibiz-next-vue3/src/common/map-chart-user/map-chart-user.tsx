/* eslint-disable eqeqeq */
import {
  defineComponent,
  onMounted,
  PropType,
  computed,
  ref,
  onBeforeUnmount,
} from 'vue';
import { isNil, mergeDeepLeft, mergeDeepWithKey } from 'ramda';
import { useNamespace } from '@ibiz-template/vue3-util';
import {
  getAreaLevelByCode,
  IMapData,
  MapController,
} from '@ibiz-template/runtime';
import { listenJSEvent, NOOP } from '@ibiz-template/core';
import { toNumber } from 'lodash-es';
import {
  defaultOpts,
  getAreaOption,
  getAreaStaticOption,
  getPointOption,
  getPointStaticOption,
  getTooltip,
  getVisualMap,
  MapOptions,
} from './map-chart-user.util';
import { useMapManager } from './map-user-manager';
import './map-chart-user.scss';

export const IBizMapChartUser = defineComponent({
  name: 'IBizMapChartUser',
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
  setup(props) {
    const ns = useNamespace('map-chart-user');
    const c = props.controller;
    let option: IData = defaultOpts;
    const mapRef = ref();
    const isFull = ref(false);
    if (c.controlParams.defaultopts) {
      const data = JSON.parse(c.controlParams.defaultopts);
      option = mergeDeepLeft(data, option);
    }
    const options = computed<MapOptions>(() => {
      // 后一个的undefined不覆盖
      return mergeDeepWithKey(
        (_key, x, z) => {
          return isNil(z) ? x : z;
        },
        option,
        props.options,
      );
    });

    let cleanup = NOOP;

    const {
      chartRef,
      historyNames,
      processing,
      areaLevelMap,
      changeMap,
      getCityInfo,
      goBack,
    } = useMapManager(props.controller, options, mapName => {
      const areaData = props.areaData || [];
      const pointData = props.pointData || [];

      const tooltip = getTooltip();
      const visualMap = getVisualMap(options.value);
      const cityInfo = getCityInfo();
      const pointOption = {
        ...getPointStaticOption(options.value),
        ...getPointOption(pointData, areaData),
      };
      const { top, bottom } = options.value;
      const areaOption = {
        top,
        bottom,
        ...getAreaStaticOption(options.value),
        ...getAreaOption(mapName, pointData, areaData, cityInfo),
      };

      const result: IData = {
        geo: {
          map: mapName,
          top,
          bottom,
        },
        tooltip,
        visualMap,
        series: [
          // 地图区块序列
          areaOption,
          // 地图散点序列
          pointOption,
        ],
      };
      return result;
    });

    onMounted(() => {
      const name = options.value.defaultAreaCode;
      const areaCode = c.state.strAreaCode ? `${name}` : Number(name);
      c.state.areaCode = areaCode;
      c.state.areaLevel = getAreaLevelByCode(areaCode.toString());
      changeMap(name, areaCode, true);

      c.evt.on('onDrillDown', async (args: IData) => {
        if (!processing.value) {
          const { data } = args;
          const code = data.areaCode;
          const curAreaCode = c.state.strAreaCode ? `${code}` : Number(code);
          const areaLevel = areaLevelMap.get(toNumber(curAreaCode)) || '';
          c.state.areaCode = curAreaCode;
          c.state.areaLevel = areaLevel;
          await changeMap(code, code);
        }
      });
      c.evt.on('onBackClick', () => {
        if (!processing.value) {
          goBack();
        }
      });

      cleanup = listenJSEvent(window, 'resize', () => {
        if (isFull.value) {
          isFull.value = ibiz.fullscreenUtil.isFullScreen;
        }
      });
    });

    // 组件销毁前销毁监听
    onBeforeUnmount(() => {
      if (cleanup !== NOOP) {
        cleanup();
      }
    });

    const onBack = async () => {
      processing.value = true;
      await c.evt.emit('onBackClick', undefined);
      goBack();
      processing.value = false;
    };

    /**
     * @description 切换全屏
     */
    const toggleFullScreen = () => {
      if (mapRef.value) {
        if (isFull.value) {
          ibiz.fullscreenUtil.closeElementFullscreen();
        } else {
          ibiz.fullscreenUtil.openElementFullscreen(mapRef.value);
        }
        isFull.value = !isFull.value;
      }
    };

    return {
      ns,
      c,
      mapRef,
      chartRef,
      historyNames,
      isFull,
      onBack,
      toggleFullScreen,
    };
  },
  render() {
    const { enabledFullScreen } = this.c.state;
    return (
      <div class={this.ns.b()} ref='mapRef'>
        {enabledFullScreen ? (
          <el-button
            type='info'
            class={this.ns.e('fullscreen')}
            onClick={this.toggleFullScreen}
            title={
              this.isFull
                ? ibiz.i18n.t('app.cancelFullscreen')
                : ibiz.i18n.t('app.fullscreen')
            }
          >
            <ion-icon
              name={this.isFull ? 'contract-outline' : 'expand-outline'}
            ></ion-icon>
          </el-button>
        ) : null}
        <div class={this.ns.e('chart')} ref='chartRef'></div>
        {this.historyNames.length > 1 && (
          <div
            class={this.ns.e('goback')}
            onClick={() => {
              this.onBack();
            }}
          >
            {ibiz.i18n.t('app.return')}
          </div>
        )}
      </div>
    );
  },
});

export default IBizMapChartUser;
