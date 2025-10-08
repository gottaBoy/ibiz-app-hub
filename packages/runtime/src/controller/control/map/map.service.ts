import { HttpResponse, IHttpResponse } from '@ibiz-template/core';
import { ISysMap } from '@ibiz/model-core';
import { IMapData } from '../../../interface';
import { parseUserParams } from '../../../model';
import { MapData, MDControlService } from '../../../service';
import { convertNavData, ScriptFactory } from '../../../utils';

/**
 * 地图部件服务
 * @author lxm
 * @date 2023-05-15 09:53:35
 * @export
 * @class GridService
 * @extends {MDControlService<ISysMap>}
 */
export class MapService extends MDControlService<ISysMap> {
  async init(context?: IContext | undefined): Promise<void> {
    await super.init(context);
  }

  /**
   * 加载所有地图项的数据
   * @author lxm
   * @date 2023-10-30 06:27:32
   * @param {IContext} context
   * @param {IParams} [params={}]
   * @return {*}  {Promise<IHttpResponse<IMapData[]>>}
   */
  async fetchAll(
    context: IContext,
    params: IParams = {},
  ): Promise<IHttpResponse<IMapData[]>> {
    const allData: IMapData[] = [];
    // 没有面板项返回空数组
    if (this.model.sysMapItems?.length) {
      const app = ibiz.hub.getApp(context.srfappid);
      await Promise.all(
        this.model.sysMapItems.map(async mapItem => {
          const { appDataEntityId, appDEDataSetId, customCond } = mapItem;
          const _context = context.clone();
          const _params = { ...params };

          if (customCond) {
            const customParams = ScriptFactory.execSingleLine(customCond, {
              context,
              params,
            }) as IData;
            if (customParams) {
              const { navigateContexts, navigateParams } =
                parseUserParams(customParams);
              if (navigateContexts) {
                Object.assign(
                  _context,
                  convertNavData(navigateContexts, params, context),
                );
              }
              if (navigateParams) {
                Object.assign(
                  _params,
                  convertNavData(navigateParams, params, context),
                );
              }
            }
          }

          const res = (await app.deService.exec(
            appDataEntityId!,
            appDEDataSetId!,
            _context,
            _params,
          )) as IHttpResponse<IData[]>;
          if (res.data) {
            allData.push(...res.data.map(item => new MapData(item, mapItem)));
          }
        }),
      );
    }
    return new HttpResponse<IMapData[]>(allData, 200);
  }
}
