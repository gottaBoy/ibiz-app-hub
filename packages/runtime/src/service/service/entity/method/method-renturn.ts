import { IAppDataEntity, IAppDEMethod } from '@ibiz/model-core';
import { isNilOrEmpty } from 'qx-util';
import { MethodDto } from '../../../dto/method.dto';
import { AppDataEntity } from '../../../app-data-entity/app-data-entity';
import { findModelChild } from '../../../../model';
import { IAppDEService, IDataEntity } from '../../../../interface';

/**
 * 应用实体方法输出转换
 *
 * @author chitanda
 * @date 2022-10-10 11:10:58
 * @export
 * @class MethodReturn
 */
export class MethodReturn {
  protected dto?: MethodDto;

  /**
   * Creates an instance of MethodReturn.
   *
   * @author chitanda
   * @date 2023-12-22 13:12:24
   * @param {IAppDEService} service
   * @param {IAppDataEntity} entity
   * @param {IAppDEMethod} method
   * @param {boolean} [isLocalMode=false]
   */
  constructor(
    protected service: IAppDEService,
    protected entity: IAppDataEntity,
    protected method: IAppDEMethod,
    protected isLocalMode: boolean = false,
  ) {
    const output = method.appDEMethodReturn;
    if (output) {
      const methodDto = findModelChild(
        entity.appDEMethodDTOs || [],
        output.appDEMethodDTOId!,
      );
      if (methodDto) {
        this.dto = service.createMethodDto(methodDto, {
          isLocalMode: this.isLocalMode,
        });
      }
    }
  }

  /**
   * 处理请求返回参数
   *
   * @author chitanda
   * @date 2022-10-19 21:10:06
   * @param {IContext} context
   * @param {IData} data
   * @return {*}  {Promise<IDataEntity>}
   */
  async handle(context: IContext, data: IData): Promise<IDataEntity> {
    if (this.dto) {
      const app = ibiz.hub.getApp(this.entity.appId);
      const uiDomain = ibiz.uiDomainManager.get(context.srfsessionid);
      if (uiDomain && uiDomain.state.rsInit !== true) {
        await this.dto.calcRs(context);
        uiDomain.calcParentRs();
        uiDomain.state.rsInit = true;
      }
      uiDomain?.dataChangeCompleted();
      // 设置之前，根据关系清理掉当前界面域下的数据缓存
      app.deService.clearTempCacheByRs(
        {
          srfappid: app.appId,
          srfsessionid: context.srfsessionid,
          srfskipcleartmpres: context.srfskipcleartmpres,
        },
        this.entity.id!,
      );
      const items = await this.dto.sets(context, [data]);
      return items[0];
    }
    // 返回类型为简单类型时，返回数据key为srfresult，值为响应数据
    const output = this.method.appDEMethodReturn;
    if (output && output.type === 'SIMPLE') {
      data = { srfresult: data };
    } else if (isNilOrEmpty(data)) {
      data = {};
    }

    return new AppDataEntity(this.entity, data);
  }

  /**
   * 格式化
   *
   * @author tony001
   * @date 2024-05-23 18:05:35
   * @param {IContext} context
   * @param {IData} data
   * @return {*}  {Promise<IData>}
   */
  async format(context: IContext, data: IData): Promise<IData> {
    if (this.dto) {
      return this.dto.format(context, data);
    }
    return data;
  }
}
