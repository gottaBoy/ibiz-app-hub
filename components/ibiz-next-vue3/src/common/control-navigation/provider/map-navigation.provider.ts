/* eslint-disable @typescript-eslint/prefer-as-const */
import {
  IMapData,
  IMapEvent,
  INavViewMsg,
  MapController,
  getAreaLevelNum,
  calcDeCodeNameById,
  getAreaLevelByCode,
} from '@ibiz-template/runtime';
import { ISysMap } from '@ibiz/model-core';
import { NavgationBaseProvider } from './navigation-base.provider';

/**
 * 地图导航适配器
 *
 * @export
 * @class MapNavigationProvider
 * @extends {NavgationBaseProvider}
 */
export class MapNavigationProvider extends NavgationBaseProvider {
  keyName: '_id' = '_id';

  declare controller: MapController;

  declare model: ISysMap;

  /**
   * @description 导航数据变化
   * @param {IMapEvent['onNavDataChange']['event']} event
   * @memberof MapNavigationProvider
   */
  onNavDataChange(event: IMapEvent['onNavDataChange']['event']): void {
    const { navData } = event;
    // 数据变更才重新导航
    if (this.navViewMsg.value?.key !== navData[this.keyName]) {
      this.navStack.unshift(navData[this.keyName]);
      this.navViewMsg.value = this.getNavViewMsg(navData as IMapData);
    }
  }

  onNavDataByStack(): void {
    const { items } = this.controller.state;
    const navData =
      this.navStack
        .map(key => items.find(item => item[this.keyName] === key))
        .find(item => item !== undefined) || items[0];
    if (navData) {
      // 默认选中区域数据需传行政编码与行政等级
      if (navData._itemStyle.startsWith('REGION')) {
        const data: IData = { ...navData };
        if (navData._areaCode) {
          data.areaCode = this.controller.state.strAreaCode
            ? `${navData._areaCode}`
            : Number(navData._areaCode);
          data.areaLevel = getAreaLevelByCode(navData._areaCode.toString());
        }
        this.setNavData(data);
      } else {
        this.setNavData(navData);
      }
    } else {
      this.clearNavigation();
    }
  }

  getNavViewMsg(item: IData): INavViewMsg {
    const { sysMapItems } = this.model;
    const { areaCode, areaLevel } = item;
    const itemModel = sysMapItems?.find(_item => _item.id === item._mapItemId);
    if (itemModel) {
      const tempContext = this.controller.context.clone();
      const tempParams = { ...this.controller.params };
      // 点数据添加主键
      if (itemModel.itemStyle?.startsWith('POINT')) {
        const deName = calcDeCodeNameById(itemModel.appDataEntityId!);
        tempContext[deName] = item._deData.srfkey;
      }
      // 区域导航视图添加行政编码与行政等级
      if (itemModel.itemStyle?.startsWith('REGION')) {
        tempParams.srfareacode = areaCode;
        tempParams.srfarealevel = areaLevel;
        tempParams.srfarealevelnum = areaLevel ? getAreaLevelNum(areaLevel) : 1;
      }
      const { context, params } = this.prepareParams(
        itemModel,
        { ...item._deData, areaCode, areaLevel },
        tempContext,
        tempParams,
      );
      Object.assign(params, tempParams);
      return {
        params,
        context,
        key: item[this.keyName],
        viewId: itemModel.navAppViewId,
      };
    }
    return {
      key: item[this.keyName],
      context: this.controller.context,
      params: this.controller.params,
    };
  }
}
