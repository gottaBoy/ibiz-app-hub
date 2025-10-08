import { where, equals, clone, isNil, isEmpty } from 'ramda';
import { createUUID } from 'qx-util';
import { IAppDataEntity } from '@ibiz/model-core';
import { RuntimeError } from '@ibiz-template/core';
import {
  isExistSessionId,
  isExistSrfKey,
} from '../service-exist-util/service-exist-util';
import {
  IApiChangeTracker,
  IDataEntity,
  ITransaction,
} from '../../../interface';
import { findModelChild } from '../../../model';
import { ChangeTracker } from '../../../utils';

/**
 * 实体缓存工具类
 *
 * @author chitanda
 * @date 2022-08-17 23:08:56
 * @export
 * @class DECache
 */
export class DECache {
  /**
   * 是否是联合主键
   * @author lxm
   * @date 2023-12-12 02:47:18
   * @readonly
   * @protected
   * @type {boolean}
   */
  protected get isUnionKey(): boolean {
    return !!this.entity.unionKeyValueAppDEFieldIds?.length;
  }

  /**
   * Creates an instance of DECache.
   *
   * @author chitanda
   * @date 2023-12-22 13:12:40
   * @param {IAppDataEntity} entity 应用实体模型
   */
  constructor(protected entity: IAppDataEntity) {}

  /**
   * 数据缓存
   *
   * @author chitanda
   * @date 2022-08-17 23:08:08
   * @type {Map<string, IDataEntity>}
   */
  readonly cacheMap: Map<string, IDataEntity> = new Map();

  /**
   * @description 变更记录器
   * @type {IApiChangeTracker< Map<string, IDataEntity>>}
   * @memberof DECache
   */
  public changeTracker: IApiChangeTracker<Map<string, IDataEntity>> =
    new ChangeTracker();

  /**
   * 强制设置数据，忽略其他逻辑
   *
   * @author chitanda
   * @date 2022-05-10 17:05:45
   * @param {IContext} context
   * @param {IDataEntity} entity
   */
  forceAdd(_context: IContext, entity: IDataEntity): void {
    const data = this.cacheMap.get(entity.srfkey!);
    if (data) {
      data.assign!(entity);
      ibiz.log.warn('forceAdd', entity.srfkey, entity);
    }
  }

  /**
   * 强制更新数据，非合并，忽略其他逻辑
   *
   * @author chitanda
   * @date 2022-05-10 17:05:27
   * @param {IContext} context
   * @param {IDataEntity} entity
   */
  forceUpdate(_context: IContext, entity: IDataEntity): void {
    this.cacheMap.set(entity.srfkey!, clone(entity));
    ibiz.log.warn('forceUpdate', entity.srfkey, entity);
  }

  /**
   * 强制删除数据，忽略其他逻辑
   *
   * @author chitanda
   * @date 2022-05-10 17:05:08
   * @param {IContext} context
   * @param {string} srfKey
   */
  forceDelete(_context: IContext, srfKey: string): void {
    this.cacheMap.delete(srfKey);
    ibiz.log.warn('forceDelete', srfKey);
  }

  /**
   * 新增数据
   *
   * @param {*} context
   * @param {IDataEntity} entity
   * @return {*}  {boolean}
   * @memberof EntityCache
   */
  add(context: IContext, entity: IDataEntity): IDataEntity | null {
    // 联合主键相关数据处理
    if (this.isUnionKey) {
      this.calcUnionKey(entity);
      if (this.checkData(context, entity.srfunionkey)) {
        ibiz.log.error(
          new RuntimeError(
            ibiz.i18n.t('runtime.service.createPrimaryKeyData', {
              srfkey: entity.srfunionkey,
            }),
          ),
        );
        return null;
      }
    }
    try {
      isExistSessionId('add', context);
      if (isNil(entity.srfkey) || isEmpty(entity.srfkey)) {
        entity.srfkey = createUUID();
      }
      entity.srftempdate = new Date().getTime();
      // 提交回调
      const commit = (): void => {
        this.cacheMap.set(entity.srfkey!, clone(entity));
        ibiz.log.warn('add', entity.srfkey, entity);
      };
      const t = this.getTransaction(context);
      if (t) {
        t.change(entity.srfkey, () => {
          commit();
        });
      } else {
        commit();
      }
      return entity;
    } catch (err) {
      ibiz.log.error(err);
      return null;
    }
  }

  /**
   * 查找数据
   *
   * @param {*} context
   * @param {string} srfKey
   * @return {*}  {IDataEntity}
   * @memberof EntityCache
   */
  get(context: IContext, srfKey: string): IDataEntity | null {
    try {
      isExistSessionId('get', context);
      const data = this.cacheMap.get(srfKey);
      ibiz.log.warn('get', srfKey, data);
      return clone(data)!;
    } catch (err) {
      ibiz.log.error(err);
      return null;
    }
  }

  /**
   * 更新数据
   *
   * @param {IContext} context
   * @param {IDataEntity} entity
   * @return {*}  {IDataEntity}
   * @memberof EntityCache
   */
  update(context: IContext, entity: IDataEntity): IDataEntity | null {
    const oldKey = entity.srfkey!;
    try {
      isExistSessionId('update', context);
      isExistSrfKey('update', entity);
      const data = this.cacheMap.get(oldKey);
      if (data) {
        // 联合主键相关数据处理
        if (this.isUnionKey) {
          const oldUnionKey = data.srfunionkey;
          this.calcUnionKey(entity);
          // 只在临时数据的新建更新时，主键改变的时候，检测变更之后的主键是否已经存在
          if (
            oldUnionKey !== entity.srfunionkey &&
            this.checkData(context, entity.srfunionkey)
          ) {
            ibiz.log.error(
              new RuntimeError(
                ibiz.i18n.t('runtime.service.updatePrimaryKeyData', {
                  srfkey: entity.srfunionkey,
                }),
              ),
            );
            return null;
          }
        }

        entity.srftempdate = new Date().getTime();
        const _data = clone(data);
        _data.assign!(entity);
        // 提交回调
        const commit = (): void => {
          data.assign!(entity);
          if (oldKey !== entity.srfkey) {
            this.cacheMap.delete(oldKey);
          }
          this.cacheMap.set(entity.srfkey, data);
          ibiz.log.warn('update', entity.srfkey, entity);
        };
        const t = this.getTransaction(context);
        if (t) {
          t.change(entity.srfkey, () => {
            commit();
          });
        } else {
          commit();
        }
        return _data;
      }
      throw new Error(ibiz.i18n.t('runtime.service.noExistNoUpdated'));
    } catch (err) {
      ibiz.log.error(err);
      return null;
    }
  }

  /**
   * 删除数据
   *
   * @param {IContext} context
   * @param {string} srfKey
   * @return {*}  {(IDataEntity | null)}
   * @memberof EntityCache
   */
  delete(context: IContext, srfKey: string): IDataEntity | null {
    try {
      isExistSessionId('delete', context);
      const key = srfKey;
      if (this.cacheMap.has(key)) {
        const data = this.cacheMap.get(key)!;
        const commit = (): void => {
          this.cacheMap.delete(key);
          ibiz.log.warn('delete', key);
        };
        const t = this.getTransaction(context);
        if (t) {
          t.change(key, () => {
            commit();
          });
        } else {
          commit();
        }
        return data;
      }
      return null;
    } catch (err) {
      ibiz.log.error(err);
      return null;
    }
  }

  /**
   * 批量创建临时数据
   *
   * @author chitanda
   * @date 2022-03-23 11:03:52
   * @param {IContext} context
   * @param {IDataEntity[]} entities
   * @return {*}  {IDataEntity[]}
   */
  createBatch(context: IContext, entities: IDataEntity[]): IDataEntity[] {
    try {
      isExistSessionId('add', context);
      const commit = (entity: IDataEntity): void => {
        this.cacheMap.set(entity.srfkey, entity);
        ibiz.log.warn('add', entity.srfkey, entity);
      };
      const t = this.getTransaction(context);
      for (let i = 0; i < entities.length; i++) {
        const entity = entities[i];
        if (isNil(entity.srfkey) || isEmpty(entity.srfkey)) {
          entity.srfkey = createUUID();
        }
        entity.srftempdate = new Date().getTime();
        const data = clone(entity);
        if (t) {
          t.change(data.srfkey, () => {
            commit(data);
          });
        } else {
          commit(data);
        }
      }
      return entities;
    } catch (err) {
      ibiz.log.error(err);
    }
    return [];
  }

  /**
   * 批量更新数据
   *
   * @author chitanda
   * @date 2022-03-23 10:03:17
   * @param {IContext} context
   * @param {IDataEntity[]} entities
   * @return {*}  {IDataEntity[]}
   */
  updateBatch(context: IContext, entities: IDataEntity[]): IDataEntity[] {
    try {
      isExistSessionId('update', context);
      const commit = (entity: IDataEntity, oldKey: string): void => {
        // 如果主键改变，删除旧的数据再设置新数据
        if (oldKey !== entity.srfkey) {
          this.cacheMap.delete(oldKey);
        }
        this.cacheMap.set(entity.srfkey!, entity);
        ibiz.log.warn('update', entity.srfkey, entity);
      };

      const t = this.getTransaction(context);

      for (let i = 0; i < entities.length; i++) {
        const entity = entities[i];
        isExistSrfKey('update', entity);
        const oldKey = entity.srfkey!;
        const data = this.cacheMap.get(entity.srfkey!);
        if (data) {
          // 联合主键相关数据处理
          if (this.isUnionKey) {
            const oldUnionKey = data.srfunionkey;
            this.calcUnionKey(entity);
            // 主键改变的时候，检测变更之后的主键是否已经存在
            if (
              oldUnionKey !== entity.srfunionkey &&
              this.checkData(context, entity.srfunionkey)
            ) {
              ibiz.log.error(
                new RuntimeError(
                  ibiz.i18n.t('runtime.service.updatePrimaryKeyData', {
                    srfkey: entity.srfunionkey,
                  }),
                ),
              );
              continue;
            }
          }
          entity.srftempdate = new Date().getTime();
          const _data = clone(data);
          _data.assign!(entity);
          entities[i] = _data;
          if (t) {
            t.change(entity.srfkey!, () => {
              data.assign!(entity);
              commit(data, oldKey);
            });
          } else {
            data.assign!(entity);
            commit(data, oldKey);
          }
        } else {
          ibiz.log.error(
            new Error(
              ibiz.i18n.t('runtime.service.dataNoExistNoUpdated', {
                srfdename: entity.srfdename,
                srfmajortext: entity.srfmajortext,
                srfkey: entity.srfkey,
              }),
            ),
          );
        }
      }
      return entities;
    } catch (err) {
      ibiz.log.error(err);
      return null!;
    }
  }

  /**
   * 批量删除数据
   *
   * @author chitanda
   * @date 2022-03-23 10:03:40
   * @param {IContext} context 上下文
   * @param {string[]} srfKeys 需要删除的数据主键
   * @return {*}  {IDataEntity[]} 未能删除的数据主键
   */
  deleteBatch(context: IContext, srfKeys: string[]): IDataEntity[] {
    try {
      const entities: IDataEntity[] = [];
      for (let i = 0; i < srfKeys.length; i++) {
        const srfKey = srfKeys[i];
        const removeData = this.delete(context, srfKey);
        if (removeData) {
          entities.push(removeData);
        }
      }
      return entities;
    } catch (err) {
      ibiz.log.error(err);
      return null!;
    }
  }

  /**
   * 检查数据是否已经存在
   *
   * @author chitanda
   * @date 2022-08-17 23:08:06
   * @param {IContext} context
   * @param {string} srfkey
   * @return {*}  {boolean}
   */
  checkData(_context: IContext, srfkey: string): boolean {
    if (this.isUnionKey) {
      const items = this.getList();
      const targetIndex = items.findIndex(item => {
        return item.srfunionkey === srfkey;
      });
      return targetIndex !== -1;
    }
    return !!this.cacheMap.get(srfkey);
  }

  /**
   * 获取当前已经缓存的数据
   *
   * @author chitanda
   * @date 2023-12-22 14:12:57
   * @return {*}  {IDataEntity[]}
   */
  getList(): IDataEntity[] {
    const values = this.cacheMap.values();
    return Array.from(values);
  }

  /**
   * 根据条件生成查询
   *
   * @author chitanda
   * @date 2022-08-17 23:08:33
   * @param {IParams} [params={}]
   * @return {*}  {<U>(testObj: U) => boolean}
   */
  generatePred(params: IParams = {}): <U>(testObj: U) => boolean {
    // 查询数据条件集
    const data: IData = {};
    if (params.srfkey) {
      data.srfkey = equals(params.srfkey);
    }
    delete params.srfkey;
    for (const key in params) {
      if (Object.prototype.hasOwnProperty.call(params, key)) {
        const val = params[key];
        data[key] = equals(val);
      }
    }
    return where(data);
  }

  /**
   * 清空缓存
   *
   * @author chitanda
   * @date 2023-12-22 13:12:17
   */
  clear(): void {
    // this.cacheMap.forEach(item => {
    //   item.destroy();
    // });
    this.cacheMap.clear();
  }

  /**
   * 根据联合键值计算主键并赋值
   * @author lxm
   * @date 2023-12-12 03:06:30
   * @param {(IDataEntity | IDataEntity[])} data 需要计算的数据或数据集合
   */
  protected calcUnionKey(data: IDataEntity): void {
    const unionKeys: string[] = this.entity.unionKeyValueAppDEFieldIds!.map(
      id => {
        const appField = findModelChild(this.entity.appDEFields || [], id);
        return appField!.codeName!.toLowerCase();
      },
    );
    const unionValues = unionKeys.map(key => {
      if (isNil(data[key])) {
        return `__empty__`;
      }
      return data[key];
    });
    data.srfunionkey = unionValues.join('||');
  }

  /**
   * 根据上下文，获取已经开启的事务
   *
   * @author chitanda
   * @date 2024-01-17 15:01:28
   * @protected
   * @param {IContext} context
   * @return {*}  {(ITransaction | null)}
   */
  protected getTransaction(context: IContext): ITransaction | null {
    const uiDomain = ibiz.uiDomainManager.get(context.srfsessionid);
    if (uiDomain && uiDomain.transaction.state.isOpen === true) {
      return uiDomain.transaction;
    }
    return null;
  }

  /**
   * @description 记录变更
   * @param {('ADD' | 'RESET' | 'UNDO' | 'REDO')} actionType 操作类型，添加数据 | 重置数据
   * @returns {*}  {void}
   * @memberof DECache
   */
  recordChanges(actionType: 'ADD' | 'RESET'): void {
    const trackMap = new Map();
    if (this.cacheMap.size > 0) {
      this.cacheMap.forEach((value, key) => {
        trackMap.set(key, value.clone());
      });
    }
    if (actionType === 'ADD') {
      this.changeTracker.add(new Map(trackMap));
    }
    if (actionType === 'RESET') {
      this.changeTracker.reset(new Map(trackMap));
    }
  }

  /**
   * @description 取消变更，'UNDO' | 'REDO'暂未支持
   * @param {('INIT' | 'UNDO' | 'REDO')} [targetState='INIT'] 目标状态，初始化状态|撤销上一步操作|重做下一步操作
   * @returns {*}  {void}
   * @memberof DECache
   */
  cancelChanges(targetState: 'INIT' | 'UNDO' | 'REDO' = 'INIT'): void {
    if (targetState !== 'INIT') {
      return;
    }
    // 后续需支持undo和redo后再行调整
    const initSate = this.changeTracker.getState();
    if (initSate) {
      this.clear();
      initSate.forEach((value, key) => {
        this.cacheMap.set(key, value.clone());
      });
    }
  }
}
