import { ISysMap, ISysMapItem } from '@ibiz/model-core';
import { EChartsOption, EChartsType } from 'echarts';
import { MapService } from './map.service';
import {
  IMapData,
  IMapEvent,
  IMapState,
  IMapController,
  MDCtrlLoadParams,
} from '../../../interface';
import { MDControlController } from '../../common';
import { getAreaLevelByCode, getAreaLevelNum } from '../../../utils';

export class MapController
  extends MDControlController<ISysMap, IMapState, IMapEvent>
  implements IMapController
{
  declare service: MapService;

  /**
   * echarts对象
   * @author lxm
   * @date 2023-06-07 09:36:58
   * @type {EChartsType}
   */
  chart?: EChartsType;

  /**
   * @description 最终使用的echarts配置
   * @type {EChartsOption}
   * @memberof MapController
   */
  options?: EChartsOption;

  protected initState(): void {
    super.initState();
    this.state.size = 1000;
    this.state.pointData = [];
    this.state.areaData = [];
    this.state.areaLevel = '';
    this.state.mapInfo = {};
    this.state.enabledDrillDown = true;
    this.state.enabledFullScreen = false;
  }

  protected async onCreated(): Promise<void> {
    this.calcDefaultOptions();
    await super.onCreated();
    this.service = new MapService(this.model);
    await this.service.init(this.context);
  }

  /**
   * 部件加载数据行为
   *
   * @author lxm
   * @date 2022-08-19 14:08:50
   */
  async load(args: MDCtrlLoadParams = {}): Promise<IData[]> {
    if (this.state.isSimple) {
      this.state.isLoaded = true;
      return [];
    }
    await this.startLoading();
    try {
      // *初始加载需要重置分页
      const isInitialLoad = args.isInitialLoad === true;
      const { context } = this.handlerAbilityParams(args);
      const params = await this.getFetchParams(args?.viewParam);
      // 将当前区域编码与行政等级添加到上下文中，可在地图项中配置自定义条件转换为视图参数
      context.srfareacode = this.state.areaCode;
      context.srfarealevel = this.state.areaLevel;
      // 地图为100000时无行政等级
      if (context.srfarealevel) {
        context.srfarealevelnum = getAreaLevelNum(this.state.areaLevel);
      } else {
        context.srfarealevelnum = 1;
      }

      const res = await this.service.fetchAll(context, params);

      this.state.items = res.data;

      await this.afterLoad(args, res.data);

      this.state.isLoaded = true;
      await this._evt.emit('onLoadSuccess', {
        isInitialLoad,
      });
    } catch (error) {
      await this._evt.emit('onLoadError', undefined);
      this.actionNotification('FETCHERROR', {
        error: error as Error,
      });
      throw error;
    } finally {
      await this.endLoading();
    }

    this.actionNotification('FETCHSUCCESS');
    return this.state.items;
  }

  async afterLoad(args: MDCtrlLoadParams, items: IData[]): Promise<IData[]> {
    const result = (await super.afterLoad(args, items)) as IMapData[];

    const tempareaData: IMapData[] = [];
    const temppointData: IMapData[] = [];
    result.forEach(item => {
      if (item._itemStyle === 'REGION') {
        tempareaData.push(item);
      } else if (item._itemStyle === 'POINT') {
        temppointData.push(item);
      }
    });
    this.state.pointData = temppointData;
    this.state.areaData = tempareaData;
    return result;
  }

  /**
   * 计算默认选项
   * @author lxm
   * @date 2023-11-01 03:23:33
   */
  calcDefaultOptions(): void {
    this.state.strAreaCode = false;
    this.state.defaultAreaCode = 100000;

    // 存在导航视图时激活模式改为双击
    const { sysMapItems = [] } = this.model;
    const index = sysMapItems.findIndex(
      (item: ISysMapItem) => item.navAppViewId,
    );
    if (index !== -1) {
      this.state.mdctrlActiveMode = 2;
    }

    Object.keys(this.controlParams).forEach(key => {
      const value = this.controlParams[key];
      switch (key.toLowerCase()) {
        case 'defaultareacode':
          this.state.defaultAreaCode = value;
          break;
        case 'strareacode':
          this.state.strAreaCode = value === 'true';
          break;
        case 'jsonbaseurl':
          this.state.jsonBaseUrl = value;
          break;
        case 'enableddrilldown':
          this.state.enabledDrillDown = value === 'true';
          break;
        case 'enabledfullscreen':
          this.state.enabledFullScreen = value === 'true';
          break;
        default:
          break;
      }
    });

    // 根据strAreaCode格式化默认区域代码的数值还是字符串
    this.state.defaultAreaCode = this.state.strAreaCode
      ? `${this.state.defaultAreaCode}`
      : Number(this.state.defaultAreaCode);

    this.state.areaCode = this.state.defaultAreaCode;
    this.state.areaLevel = getAreaLevelByCode(this.state.areaCode.toString());
  }

  /**
   * 地图变更事件处理
   * @author lxm
   * @date 2023-10-31 05:28:36
   * @param {(string | number)} areaCode
   */
  async onMapChange(areaCode: string | number): Promise<void> {
    await this.evt.emit('onMapChange', { data: { areaCode } });
    // 修改预置视图参数，然后加载
    this.state.areaCode = areaCode;
    await this.load({});
  }

  /**
   * 地图区域点击事件处理
   * @author lxm
   * @date 2023-10-31 05:30:54
   * @param {IMapData} mapData
   */
  onAreaClick(
    mapData: IMapData,
    areaCode: string | number,
    areaLevel: string,
  ): void {
    this.evt.emit('onNavDataChange', {
      navData: { ...mapData, areaCode, areaLevel },
    });
    this.evt.emit('onAreaClick', { data: [mapData] });
  }

  /**
   * 地图散点点击事件处理
   * @author lxm
   * @date 2023-10-31 05:30:58
   * @param {IMapData} mapData
   */
  onPointClick(mapData: IMapData): void {
    this.setNavData(mapData);
    this.evt.emit('onPointClick', { data: [mapData] });
  }

  /**
   * @description 下钻
   * @param {string | number} areaCode
   * @memberof MapController
   */
  drillDown(areaCode: string | number): void {
    this.evt.emit('onDrillDown', { data: { areaCode } });
  }

  /**
   * @description 返回
   * @memberof MapController
   */
  back(): void {
    this.evt.emit('onBackClick', undefined);
  }
}
