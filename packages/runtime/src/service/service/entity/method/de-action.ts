/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  HttpError,
  HttpResponse,
  IHttpResponse,
  RuntimeError,
  RuntimeModelError,
} from '@ibiz-template/core';
import { IAppDEAction, IAppDEMethod } from '@ibiz/model-core';
import { isArray, isNil, isUndefined } from 'lodash-es';
import { ascSort } from 'qx-util';
import { clone } from 'ramda';
import { Method } from './method';
import { IDataEntity } from '../../../../interface';
import { calcDeCodeNameById, findDELogic } from '../../../../model';
import { execDELogicAction, execFieldLogics } from '../../../../de-logic';
import { ScriptFactory } from '../../../../utils';

/**
 * 实体行为方法
 *
 * @author chitanda
 * @date 2022-10-10 12:10:37
 * @export
 * @class DEActionMethod
 * @extends {Method}
 */
export class DEActionMethod extends Method {
  declare method: IAppDEAction;

  /**
   * 处理请求发送参数
   * @author lxm
   * @date 2023-10-19 02:50:36
   * @param {IContext} context 上下文
   * @param {(IData | IData[])} data 数据对象
   * @return {*}  {(Promise<IData | IData[]>)}
   */
  async inputHandle(
    context: IContext,
    data: IData | IData[],
  ): Promise<IData | IData[]> {
    if (isArray(data)) {
      // 多项数据不做dto转换
      return data;
    }
    return this.input.handle(context, data);
  }

  /**
   * 格式化输入参数
   *
   * @author tony001
   * @date 2024-05-21 23:05:26
   * @param {IContext} context
   * @param {(IData | IData[])} data
   * @return {*}  {(Promise<IData | IData[]>)}
   */
  async inputFormat(
    context: IContext,
    data: IData | IData[],
  ): Promise<IData | IData[]> {
    const handleListMap = async (arg: IData): Promise<IData> => {
      return this.input.format(context, arg);
    };
    if (Array.isArray(data)) {
      const result = [];
      for (let i = 0; i < data.length; i++) {
        result.push(await handleListMap(data[i]));
      }
      return result;
    }
    return handleListMap(data);
  }

  async exec(
    context: IContext,
    data?: IData | IData[],
    params?: IParams,
    header?: IData,
  ): Promise<HttpResponse<IData>> {
    let result: IHttpResponse<IData>;

    // 若无srfappid，表示上下文已经销毁，则不执行后续逻辑直接返回
    if (!context.srfappid) {
      return new HttpResponse({});
    }

    // 前端临时模式
    if (this.isLocalMode) {
      // 操作类型为移动位置
      if (this.method.actionMode === 'MOVEORDER') {
        result = await this.moveOrder(context, data!);
        return result;
      }
    }

    // 执行变更属性逻辑
    if (data && !['READ', 'GETDRAFT'].includes(this.method.actionMode!)) {
      await execFieldLogics(this.entity, 'change', context, data, params);
    }

    // 实体逻辑处理
    if (this.method.actionType === 'DELOGIC') {
      const deLogic = findDELogic(this.method.appDELogicId!, this.entity);
      if (!deLogic) {
        throw new RuntimeModelError(
          this.method,
          ibiz.i18n.t('runtime.service.lackEntityLogic'),
        );
      }
      result = await execDELogicAction(deLogic, context, data, params);
    } else {
      if (data) {
        if (!this.isLocalMode) {
          data = await this.inputHandle(context, data);
        } else {
          data = await this.inputFormat(context, data);
        }
      }
      const methodTag = this.method.actionTag
        ? this.method.actionTag!.toUpperCase()
        : this.method.codeName!.toUpperCase();
      if (this.method.beforeCode) {
        await ScriptFactory.asyncExecScriptFn(
          {
            context,
            data,
            viewParam: params,
            activeData: header,
          },
          this.method.beforeCode,
        );
      }
      switch (methodTag) {
        case 'CREATE':
          result = await this.create(context, data!, params || {}, header);
          break;
        case 'GET':
          result = await this.get(context, params, header);
          break;
        case 'GETDRAFT':
          result = await this.getDraft(context, params, header);
          break;
        case 'REMOVE':
          result = await this.remove(context, params);
          break;
        case 'UPDATE':
          result = await this.update(context, data!, params, header);
          break;
        case 'CREATETEMP':
          result = await this.createTemp(context, data!);
          break;
        case 'GETTEMP':
          result = await this.getTemp(context, data);
          break;
        case 'GETDRAFTTEMP':
          result = await this.getDraftTemp(context, params);
          break;
        case 'REMOVETEMP':
          result = await this.removeTemp(context, data);
          break;
        case 'UPDATETEMP':
          result = await this.updateTemp(context, data!);
          break;
        default: {
          let path = this.calcPath(context);
          if (this.method.needResourceKey) {
            let srfkey = context[this.entity.codeName!.toLowerCase()];
            if (isNil(srfkey)) {
              srfkey = isArray(data)
                ? null
                : data?.[this.entity.keyAppDEFieldId!];
            }
            path = `${path}/${srfkey}`;
          }
          const res = await this.request(path, context, data, params, header);
          if (isNil(res.data) || isUndefined(res.data)) {
            ibiz.log.error(
              ibiz.i18n.t('runtime.deAction.responseDataError'),
              res,
            );
          }
          if (!(params && params.srfupdateitem)) {
            res.data = await this.result.handle(context, res.data);
          }
          result = res;
        }
      }
    }

    // 非临时操作需重置缓存变更记录
    if (this.isLocalMode === false) {
      const app = ibiz.hub.getApp(context.srfappid);
      app.deService.recordUIDomainChanges(context.srfsessionid, 'RESET');
    }

    if (this.method.afterCode) {
      await ScriptFactory.asyncExecScriptFn(
        {
          context,
          data: result.data,
          viewParam: params,
          activeData: header,
        },
        this.method.afterCode,
      );
    }
    // 计算属性逻辑
    if (result.data) {
      await execFieldLogics(
        this.entity,
        'compute',
        context,
        result.data,
        params,
      );
    }

    return result;
  }

  /**
   * 执行本地方法
   *
   * @author tony001
   * @date 2024-08-16 08:08:32
   * @param {string} methodTag
   * @param {IContext} context
   * @param {(IData | IData[])} [data]
   * @return {*}  {Promise<IHttpResponse<IDataEntity>>}
   */
  async executeLocalMethod(
    methodTag: string,
    context: IContext,
    data?: IData | IData[],
  ): Promise<IHttpResponse<IDataEntity>> {
    const self: any = this;
    const find = this.entity.appDEMethods?.find((appDEMethod: IAppDEMethod) => {
      return appDEMethod.codeName === methodTag;
    });
    if (find) {
      const res = await this.service.exec(methodTag, context, data);
      return res as IHttpResponse<IDataEntity>;
    }
    const localMethodTag =
      methodTag.charAt(0).toLowerCase() + methodTag.slice(1);
    return self[localMethodTag](context, data);
  }

  /**
   * 创建数据
   *
   * @author chitanda
   * @date 2022-08-24 20:08:01
   * @param {IContext} context
   * @param {IData} data
   * @return {*}  {Promise<IHttpResponse<IData>>}
   */
  async create(
    context: IContext,
    data?: IData | IData[],
    params?: IParams,
    header?: IData,
  ): Promise<IHttpResponse<IDataEntity>> {
    if (!data) {
      throw new RuntimeError(ibiz.i18n.t('runtime.service.createBehavior'));
    }
    if (this.isLocalMode) {
      const res = await this.executeLocalMethod(
        'CreateTemp',
        context,
        this.createEntity(data),
      );
      return res as IHttpResponse<IDataEntity>;
    }
    const path = this.calcPath(context);
    const res = await this.app.net.post(path, data, params, header);
    res.data = await this.result.handle(context, res.data);
    return res as IHttpResponse<IDataEntity>;
  }

  /**
   * 删除数据
   *
   * @author chitanda
   * @date 2022-08-24 20:08:56
   * @param {IContext} context
   * @param {IParams} [params]
   * @return {*}  {Promise<IHttpResponse<IDataEntity>>}
   */
  async remove(
    context: IContext,
    params?: IParams,
    header?: IData,
  ): Promise<IHttpResponse<IDataEntity | IDataEntity[]>> {
    if (this.isLocalMode) {
      const srfKeys = this.calcMultiData(context, params);
      if (srfKeys.length > 1) {
        return this.removeBatchTemp(context, srfKeys);
      }
      const res = await this.executeLocalMethod('RemoveTemp', context, params);
      return res as IHttpResponse<IDataEntity>;
    }
    const path = this.calcPath(context);
    const res = await this.app.net.delete(
      `${path}/${context[this.entity.codeName!.toLowerCase()]}`,
      params,
      header,
    );
    return res as IHttpResponse<IDataEntity>;
  }

  /**
   * 更新数据
   *
   * @author chitanda
   * @date 2022-09-13 19:09:39
   * @param {IContext} context
   * @param {(IData | IDataEntity)} data
   * @param {IParams} [params={}]
   * @return {*}  {Promise<IHttpResponse<IDataEntity>>}
   */
  async update(
    context: IContext,
    data?: IData | IData[],
    params?: IParams,
    header?: IData,
  ): Promise<IHttpResponse<IDataEntity>> {
    if (!data) {
      throw new RuntimeError(ibiz.i18n.t('runtime.service.updateBehavior'));
    }
    if (this.isLocalMode) {
      const res = await this.executeLocalMethod(
        'UpdateTemp',
        context,
        this.createEntity(data),
      );
      return res as IHttpResponse<IDataEntity>;
    }
    const path = this.calcPath(context);
    const res = await this.app.net.put(
      `${path}/${context[this.entity.codeName!.toLowerCase()]}`,
      data,
      params,
      header,
    );
    res.data = await this.result.handle(context, res.data);
    return res as IHttpResponse<IDataEntity>;
  }

  /**
   * 获取数据
   *
   * @author chitanda
   * @date 2022-08-24 20:08:07
   * @param {IContext} context
   * @param {IParams} [params]
   * @return {*}  {Promise<IHttpResponse<IDataEntity>>}
   */
  async get(
    context: IContext,
    params: IParams = {},
    header: IData = {},
  ): Promise<IHttpResponse<IDataEntity>> {
    if (this.isLocalMode) {
      const res = await this.executeLocalMethod('GetTemp', context, params);
      return res as IHttpResponse<IDataEntity>;
    }
    const path = this.calcPath(context);
    const res = await this.app.net.get(
      `${path}/${context[this.entity.codeName!.toLowerCase()]}`,
      params,
      header,
    );
    res.data = await this.result.handle(context, res.data);
    return res as IHttpResponse<IDataEntity>;
  }

  /**
   * 获取默认数据
   *
   * @author chitanda
   * @date 2022-08-24 20:08:26
   * @param {IContext} context
   * @param {IParams} [params]
   * @return {*}  {Promise<IHttpResponse<IData>>}
   */
  async getDraft(
    context: IContext,
    params?: IParams,
    header?: IData,
  ): Promise<IHttpResponse<IData>> {
    if (this.isLocalMode) {
      const res = await this.executeLocalMethod(
        'GetDraftTemp',
        context,
        params,
      );
      return res as IHttpResponse<IDataEntity>;
    }
    const path = this.calcPath(context);
    // const res = await this.app.net.get(`${path}/getdraft`, params, header);
    // 讲固定请求方法调整为指定的请求路径
    const res = await this.app.net.get(
      this.mergeRequestPath(path, this.method.requestPath),
      params,
      header,
    );
    res.data = await this.result.handle(context, res.data);
    return res;
  }

  /**
   * 新建临时数据
   *
   * @author chitanda
   * @date 2022-08-21 17:08:45
   * @param {IContext} context
   * @param {IData} entity
   * @return {*}  {Promise<IHttpResponse<IDataEntity>>}
   */
  async createTemp(
    context: IContext,
    entity: IData | IData[],
  ): Promise<IHttpResponse<IDataEntity>> {
    try {
      const addData = this.createEntity(entity);
      let resultData: IDataEntity | IDataEntity[];
      if (isArray(addData)) {
        const result = await Promise.all(
          addData.map(item =>
            this.service.local.add(context, this.attach(context, item)),
          ),
        );
        resultData = result.filter(item => item !== null) as IDataEntity[];
      } else {
        resultData = await this.service.local.add(
          context,
          this.attach(context, addData),
        )!;
      }
      // 当前执行界面域
      const uiDomain = ibiz.uiDomainManager.get(context.srfsessionid);
      if (uiDomain) {
        const isTrusted = Object.prototype.hasOwnProperty.call(
          context,
          'srfactiontrusted',
        )
          ? context.srfactiontrusted
          : true;
        uiDomain.dataChange(isTrusted);
      }
      return new HttpResponse(resultData);
    } catch (err) {
      throw new HttpError(err as Error);
    }
  }

  /**
   * 获取临时数据默认值
   *
   * @author chitanda
   * @date 2022-08-21 17:08:56
   * @param {IContext} context
   * @param {IParams} [params]
   * @return {*}  {Promise<IHttpResponse<IDataEntity>>}
   */
  async getDraftTemp(
    _context: IParams,
    _params?: IParams,
  ): Promise<IHttpResponse<IDataEntity>> {
    try {
      const data = this.createEntity({});
      // await this.executeDEFelidLogic(context, data);
      if (data) {
        return new HttpResponse(data);
      }
      return new HttpResponse(data, 500);
    } catch (err) {
      return new HttpResponse(err, 500);
    }
  }

  /**
   * 删除临时数据
   *
   * @author chitanda
   * @date 2022-08-21 17:08:11
   * @param {IContext} context
   * @param {IParams} [params]
   * @return {*}  {Promise<IHttpResponse<IDataEntity>>}
   */
  async removeTemp(
    context: IContext,
    params?: IParams,
  ): Promise<IHttpResponse<IDataEntity>> {
    try {
      let key = null;
      if (params) {
        key = params[this.entity.keyAppDEFieldId!.toLowerCase()];
      }
      if (!key && context) {
        key = context[this.entity.codeName!.toLowerCase()];
      }
      try {
        await this.associationDeletion(key, context, params);
      } catch (error) {
        throw new HttpError({
          response: new HttpResponse(null, 500, (error as IData).message),
        } as unknown as Error);
      }
      const data = this.service.local.delete(context, key)!;
      if (data) {
        // 当前执行界面域
        const uiDomain = ibiz.uiDomainManager.get(context.srfsessionid);
        if (uiDomain) {
          const isTrusted = Object.prototype.hasOwnProperty.call(
            context,
            'srfactiontrusted',
          )
            ? context.srfactiontrusted
            : true;
          uiDomain.dataChange(isTrusted);
        }
        return new HttpResponse(data);
      }
      return new HttpResponse(data, 500);
    } catch (err) {
      throw new HttpError(err as Error);
    }
  }

  /**
   * 关联删除
   *
   * @author chitanda
   * @date 2024-01-17 16:01:47
   * @protected
   * @param {string} key
   * @param {IContext} context
   * @param {IParams} [params]
   * @return {*}  {Promise<void>}
   */
  protected async associationDeletion(
    key: string,
    context: IContext,
    _params?: IParams,
  ): Promise<void> {
    // 当前执行界面域
    const uiDomain = ibiz.uiDomainManager.get(context.srfsessionid);

    // 当前事务
    const t = uiDomain?.transaction;
    let selfOpenTransaction = false;
    // 由第一层触发关联删除的位置来打开事务，后续子的关联删除不需要再次打开事务
    if (t && t.state.isOpen === false) {
      t.open();
      selfOpenTransaction = true;
    }

    try {
      let configs = uiDomain?.getDERConfigByMajor(this.entity.id!) || [];
      if (configs.length > 0) {
        // 当前主数据
        const data = this.service.local.get(context, key)!;

        // 根据删除顺序排序
        configs = ascSort(configs, 'removeOrder');

        // 根据关系进行关联删除
        for (const config of configs) {
          if (config.rstype !== 'DER1N') {
            throw new RuntimeModelError(
              config,
              ibiz.i18n.t('runtime.service.deletionDeletion'),
            );
          }
          const {
            removeActionType,
            removeRejectMsg,
            minorAppDataEntityId,
            parentAppDEFieldId,
            nestedAppDEDataSetId = 'FetchDefault',
          } = config;
          // 获取当前应用域下的子实体服务
          const app = ibiz.hub.getApp(this.entity.appId!);
          const minorService = await app.deService.getService(
            context,
            minorAppDataEntityId!,
          );
          // 克隆上下文，防止污染。并设置当前实体的主键上下文
          const _context = clone(context);
          _context[this.entity.codeName!.toLowerCase()] = key;
          // 传入默认条件
          const _tempParams: IParams = {};
          _tempParams.srfdefaultcond = {
            [parentAppDEFieldId as string]: key,
          };
          // 查询出关联的子实体数据
          const res = await minorService.exec(
            nestedAppDEDataSetId,
            _context,
            _tempParams,
          );
          const items = (res.data || []) as IDataEntity[];
          switch (removeActionType) {
            // 同时删除
            case 1: {
              for (let i = 0; i < items.length; i++) {
                const item = items[i];
                _context[minorService.model.codeName!.toLowerCase()] =
                  item.srfkey;
                const res2 = await minorService.remove(_context, item);
                if (res2.ok === false) {
                  throw new Error(res2.statusText);
                }
              }
              break;
            }
            // 置空
            case 2:
              for (let i = 0; i < items.length; i++) {
                const item = items[i];
                _context[minorService.model.codeName!.toLowerCase()] =
                  item.srfkey;
                item[config.parentAppDEFieldId!.toLowerCase()] = undefined;
                const res2 = await minorService.updateTemp(_context, item);
                if (res2.ok === false) {
                  throw new Error(res2.statusText);
                }
              }
              break;
            // 限制删除
            case 3:
              if (items.length > 0) {
                const msg = items.map(item => item.srfmajortext).join('、');
                const message = ibiz.i18n.t('runtime.service.unableDelete', {
                  logicName: this.entity.logicName,
                  srfmajortext: data.srfmajortext,
                  modelLogicName: minorService.model.logicName,
                  msg,
                });
                throw new Error(removeRejectMsg || message);
              }
              break;
            default:
          }
        }
      }
      // 谁打开的事务，由谁来提交和关闭
      if (selfOpenTransaction && t && t.state.isOpen) {
        t.commit();
      }
    } catch (error) {
      if (selfOpenTransaction && t && t.state.isOpen) {
        t.rollback();
      }
      throw error;
    } finally {
      if (selfOpenTransaction && t && t.state.isOpen) {
        t.close();
      }
    }
  }

  /**
   * 更新临时数据
   *
   * @author chitanda
   * @date 2022-08-21 17:08:17
   * @param {IContext} context
   * @param {IData} entity
   * @return {*}  {Promise<IHttpResponse<IDataEntity>>}
   */
  async updateTemp(
    context: IContext,
    entity: IData | IData[],
  ): Promise<IHttpResponse<IDataEntity>> {
    try {
      const updateData = this.createEntity(entity);
      let resultData: IDataEntity | IDataEntity[];
      if (isArray(updateData)) {
        const result = await Promise.all(
          updateData.map(
            item =>
              this.service.local.update(context, this.attach(context, item))!,
          ),
        );
        resultData = result.filter(item => item !== null) as IDataEntity[];
      } else {
        resultData = await this.service.local.update(
          context,
          this.attach(context, updateData),
        )!;
      }
      if (resultData) {
        // 当前执行界面域
        const uiDomain = ibiz.uiDomainManager.get(context.srfsessionid);
        if (uiDomain) {
          const isTrusted = Object.prototype.hasOwnProperty.call(
            context,
            'srfactiontrusted',
          )
            ? context.srfactiontrusted
            : true;
          uiDomain.dataChange(isTrusted);
        }
        return new HttpResponse(resultData);
      }
      return new HttpResponse(resultData, 500);
    } catch (err) {
      throw new HttpError(err as Error);
    }
  }

  /**
   * 获取临时数据
   *
   * @author chitanda
   * @date 2022-08-21 17:08:23
   * @param {IContext} context
   * @param {IParams} [params]
   * @return {*}  {Promise<IHttpResponse<IDataEntity>>}
   */
  async getTemp(
    context: IContext,
    params?: IParams,
  ): Promise<IHttpResponse<IDataEntity>> {
    try {
      let key = null;
      if (params) {
        key = params[this.entity.keyAppDEFieldId!.toLowerCase()];
      }
      if (!key && context) {
        key = context[this.entity.codeName!.toLowerCase()];
      }
      const data = this.service.local.get(context, key);
      if (data) {
        return new HttpResponse(data);
      }
      return new HttpResponse(data, 500);
    } catch (err) {
      throw new HttpError(err as Error);
    }
  }

  /**
   * 批量删除本地数据
   *
   * @param {IContext} context
   * @param {IParams} [params]
   * @return {*}  {Promise<IHttpResponse>}
   */
  async removeBatchTemp(
    context: IContext,
    srfKeys: string[],
  ): Promise<IHttpResponse<IDataEntity[]>> {
    try {
      const items = this.service.local.deleteBatch(context, srfKeys);
      if (items) {
        return new HttpResponse(items);
      }
      return new HttpResponse(items, 500);
    } catch (err) {
      throw new HttpError(err as Error);
    }
  }

  /**
   * 在新建、更新时，根据界面域下的关系，自动填充相关父属性
   *
   * @author chitanda
   * @date 2024-01-02 15:01:30
   * @protected
   * @param {IContext} context
   * @param {IDataEntity} data
   * @return {*}  {IDataEntity}
   */
  protected attach(context: IContext, data: IDataEntity): IDataEntity {
    const sandboxId = context.srfsessionid;
    const uiDomain = ibiz.uiDomainManager.get(sandboxId);
    const configs = uiDomain?.getDERConfig(this.entity.id!) || [];
    if (configs.length > 0) {
      configs.forEach(config => {
        if (config.parentAppDEFieldId) {
          const { majorAppDataEntityId, parentAppDEFieldId } = config;
          const majorDECodeName = calcDeCodeNameById(majorAppDataEntityId!);
          const majorLowerCodeName = majorDECodeName;
          const pickupLowerDEFName = parentAppDEFieldId.toLowerCase();
          const majorkey = context[majorLowerCodeName];
          // 父主键不能是自身，否则自关系的时候就改错了
          if (majorkey && majorkey !== data.srfkey) {
            data[pickupLowerDEFName] = majorkey;
          }
        }
      });
    }
    return data;
  }

  /**
   * @description 移动位置
   * @param {IContext} context
   * @param {IParams} params
   * @returns {*}  {Promise<IHttpResponse<IDataEntity>>}
   * @memberof DEActionMethod
   */
  async moveOrder(
    context: IContext,
    params: IParams,
  ): Promise<IHttpResponse<IDataEntity[]>> {
    let result: IDataEntity[] = [];
    // 校验数据合法性
    const orderField = this.entity.appDEFields?.find(appDEField => {
      return appDEField.predefinedType === 'ORDERVALUE';
    });
    if (!orderField) {
      throw new Error(ibiz.i18n.t('runtime.service.noSortField'));
    }
    const orderFieldCodeName = orderField.codeName!.toLowerCase();

    const srfdraggingkey = context[this.entity.codeName!.toLowerCase()];
    if (!srfdraggingkey) {
      throw new Error(ibiz.i18n.t('runtime.service.noDragElementId'));
    }
    const { srftargetkey, srfmovetype } = params;
    if (!srftargetkey) {
      throw new Error(ibiz.i18n.t('runtime.service.noTargetElementId'));
    }
    if (!srfmovetype) {
      throw new Error(ibiz.i18n.t('runtime.service.noMoveTypeField'));
    }
    // 获取原始数据
    const res = await this.service.fetchDefault(context, {
      sort: `${orderFieldCodeName},ASC`,
    });
    const sourceItems = res.ok ? res.data : [];
    if (sourceItems.length === 0) {
      return new HttpResponse(result);
    }
    // 排序
    const cloneMap: Map<string, IDataEntity> = new Map();
    const cloneItems = sourceItems.map((item: IDataEntity) => {
      cloneMap.set(item[this.entity.keyAppDEFieldId!], item);
      return item.clone();
    });
    const draggingEleIndex = cloneItems.findIndex((item: IDataEntity) => {
      return item[this.entity.keyAppDEFieldId!] === srfdraggingkey;
    });
    const targetEleIndex = cloneItems.findIndex((item: IDataEntity) => {
      return item[this.entity.keyAppDEFieldId!] === srftargetkey;
    });

    const [draggingEle] = cloneItems.splice(draggingEleIndex, 1);
    if (srfmovetype === 'MOVEBEFORE') {
      // 拖拽元素拖动至目标元素之前
      cloneItems.splice(targetEleIndex, 0, draggingEle);
    } else {
      // 拖拽元素拖动至目标元素之后
      cloneItems.splice(targetEleIndex + 1, 0, draggingEle);
    }
    const updateItems: IDataEntity[] = [];
    cloneItems.forEach((item: IDataEntity, index: number) => {
      item[orderFieldCodeName] = index + 1;
      const sourceItem = cloneMap.get(item[this.entity.keyAppDEFieldId!]);
      if (
        sourceItem &&
        item[orderFieldCodeName] !== sourceItem[orderFieldCodeName]
      ) {
        updateItems.push(item);
      }
    });
    if (updateItems.length > 0) {
      const updateRes = await this.updateTemp(context, updateItems);
      result = updateRes.ok ? (updateRes.data as unknown as IDataEntity[]) : [];
    }
    return new HttpResponse(result);
  }
}
