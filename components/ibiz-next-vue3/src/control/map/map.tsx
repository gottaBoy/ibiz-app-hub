/* eslint-disable no-nested-ternary */
import { useControlController, useNamespace } from '@ibiz-template/vue3-util';
import { computed, defineComponent, PropType, ref } from 'vue';
import { ISysMap } from '@ibiz/model-core';
import './map.scss';
import {
  MapController,
  IControlProvider,
  IMapData,
} from '@ibiz-template/runtime';
import { MapOptions } from '../../common';

const MapControl = defineComponent({
  name: 'IBizMapControl',
  props: {
    /**
     * @description 地图模型数据
     */
    modelData: { type: Object as PropType<ISysMap>, required: true },
    /**
     * @description 应用上下文对象
     */
    context: { type: Object as PropType<IContext>, required: true },
    /**
     * @description 视图参数对象
     * @default {}
     */
    params: { type: Object as PropType<IParams>, default: () => ({}) },
    /**
     * @description 部件适配器
     */
    provider: { type: Object as PropType<IControlProvider> },
    /**
     * @description 部件行数据默认激活模式，值为0:不激活，值为1：单击激活，值为2：双击激活
     */
    mdctrlActiveMode: { type: Number, default: undefined },
    /**
     * @description 是否是简单模式，即直接传入数据，不加载数据
     */
    isSimple: { type: Boolean, required: false },
    /**
     * @description 是否默认加载数据
     * @default true
     */
    loadDefault: { type: Boolean, default: true },
  },
  setup() {
    const c = useControlController((...args) => new MapController(...args));
    const ns = useNamespace(`control-${c.model.controlType!.toLowerCase()}`);
    const mapRef = ref();

    const mapStyle = c.model.mapStyle;

    const mapOpts = computed<Partial<MapOptions>>(() => {
      return {
        strAreaCode: c.state.strAreaCode,
        defaultAreaCode: c.state.defaultAreaCode,
        jsonBaseUrl: c.state.jsonBaseUrl,
      };
    });

    return {
      c,
      ns,
      mapRef,
      mapOpts,
      mapStyle,
    };
  },
  render() {
    const { state } = this.c;
    if (!state.isCreated) return null;
    let content;
    if (state.isLoaded) {
      content =
        this.mapStyle === 'USER' ? (
          <iBizMapChartUser
            areaData={state.areaData}
            pointData={state.pointData}
            options={this.mapOpts}
            class={this.ns.e('map')}
            controller={this.c}
          ></iBizMapChartUser>
        ) : (
          <iBizMapChart
            controller={this.c}
            areaData={state.areaData}
            pointData={state.pointData}
            options={this.mapOpts}
            class={this.ns.e('map')}
            onPointClick={(e: IMapData) => {
              this.c.onPointClick(e);
            }}
            onAreaClick={(e: IMapData) => {
              this.c.onAreaClick(e, '', '');
            }}
          ></iBizMapChart>
        );
    }
    return (
      <iBizControlNavigation controller={this.c}>
        <iBizControlBase controller={this.c}>
          {content}
          {this.c.state.enableNavView && this.c.state.showNavIcon ? (
            !this.c.state.showNavView ? (
              <ion-icon
                class={this.ns.e('nav-icon')}
                title={ibiz.i18n.t('component.controlNavigation.showNav')}
                name='eye-outline'
                onClick={() => this.c.onShowNavViewChange()}
              ></ion-icon>
            ) : (
              <ion-icon
                class={this.ns.e('nav-icon')}
                title={ibiz.i18n.t('component.controlNavigation.hiddenNav')}
                name='eye-off-outline'
                onClick={() => this.c.onShowNavViewChange()}
              ></ion-icon>
            )
          ) : null}
        </iBizControlBase>
      </iBizControlNavigation>
    );
  },
});

export default MapControl;
