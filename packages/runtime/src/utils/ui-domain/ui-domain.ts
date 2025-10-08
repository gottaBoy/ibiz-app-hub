import { IAppDERS } from '@ibiz/model-core';
import { QXEvent, createUUID } from 'qx-util';
import { Transaction } from './transaction';

/**
 * 界面域
 *
 * @author chitanda
 * @date 2023-12-22 15:12:07
 * @export
 * @class UIDomain
 */
export class UIDomain {
  /**
   * 唯一域标识
   *
   * @author chitanda
   * @date 2023-12-22 15:12:12
   * @type {string}
   */
  readonly id: string;

  /**
   * @description 界面域对应的应用实体标识
   * @type {(string | undefined)}
   * @memberof UIDomain
   */
  readonly appDataEntityId: string | undefined;

  /**
   * 状态
   *
   * @author chitanda
   * @date 2024-01-15 19:01:51
   * @type {{ rsInit: boolean }} 关系是否已经初始化
   */
  readonly state: { rsInit: boolean } = { rsInit: false };

  /**
   * 事件对象
   *
   * @author tony001
   * @param state：界面域是否发生数据变更，isTrusted：是否可信任（用户脚本执行不可信任，预置逻辑可信任）
   * @param data：更新数据，isTrusted：是否可信任（用户脚本执行不可信任，预置逻辑可信任）
   * @date 2025-03-27 11:03:31
   */
  readonly evt = new QXEvent<{
    stateChange: (params: { state: boolean; isTrusted: boolean }) => void;
    dataUpdate: (params: { data?: IData; isTrusted: boolean }) => void;
  }>();

  /**
   * DTO 子父关系映射
   *
   * @author chitanda
   * @date 2023-12-26 15:12:13
   * @protected
   * @type {Map<string, IAppDERS[]>} Map<子实体, 当前实体的父关系>
   */
  protected rsMap: Map<string, IAppDERS[]> = new Map();

  /**
   * DTO 父子关系映射
   *
   * @author chitanda
   * @date 2024-01-15 17:01:42
   * @protected
   * @type {Map<string, IAppDERS[]>}
   */
  protected rs2Map: Map<string, IAppDERS[]> = new Map();

  /**
   * 当前界面域下唯一事务
   *
   * @author chitanda
   * @date 2024-01-17 15:01:07
   * @type {Transaction}
   */
  readonly transaction: Transaction = new Transaction();

  /**
   * 界面域是否发生数据变更，在域下数据修改后改为 true ，在数据提交后改为 false
   *
   * @author chitanda
   * @date 2024-03-04 13:03:08
   */
  dataModification = false;

  /**
   * Creates an instance of UIDomain.
   * @param {string} [id]
   * @param {string} [appDataEntityId]
   * @memberof UIDomain
   */
  constructor(id?: string, appDataEntityId?: string) {
    if (id) {
      this.id = id;
    } else {
      this.id = createUUID();
    }
    this.appDataEntityId = appDataEntityId;
  }

  /**
   * 界面域数据发生变更
   *
   * @author tony001
   * @date 2025-03-27 11:03:09
   * @param {boolean} [isTrusted=true] 是否可信任（用户脚本执行不可信任，预置逻辑可信任）
   */
  dataChange(isTrusted: boolean = true): void {
    this.dataModification = true;
    this.evt.emit('stateChange', { state: this.dataModification, isTrusted });
  }

  /**
   * 界面域数据变更已提交
   *
   * @author tony001
   * @date 2025-03-27 11:03:54
   * @param {boolean} [isTrusted=true]
   */
  dataChangeCompleted(isTrusted: boolean = true): void {
    this.dataModification = false;
    this.evt.emit('stateChange', { state: this.dataModification, isTrusted });
  }

  /**
   * 设置当前界面域下，指定实体的相关父关系以及属性。在 DTO 包解析时设置此参数，销毁时清空
   *
   * @author chitanda
   * @date 2023-12-26 15:12:31
   * @param {string} appDataEntityId
   * @param {IAppDERS} configs
   */
  setDERConfig(appDataEntityId: string, configs: IAppDERS[]): void {
    this.rsMap.set(appDataEntityId, configs);
  }

  /**
   * 获取当前界面域下，具体实体的关系(在数据加载完成之后才有值)
   *
   * @author chitanda
   * @date 2023-12-26 16:12:07
   * @param {string} appDataEntityId
   * @return {*}  {IAppDERS[]}
   */
  getDERConfig(appDataEntityId: string): IAppDERS[] {
    if (this.rsMap.has(appDataEntityId)) {
      return this.rsMap.get(appDataEntityId)!;
    }
    return [];
  }

  /**
   * 查询指定主实体下的所有子实体关系
   *
   * @author chitanda
   * @date 2024-01-17 16:01:21
   * @param {string} appDataEntityId
   * @return {*}  {IAppDERS[]}
   */
  getDERConfigByMajor(appDataEntityId: string): IAppDERS[] {
    if (this.rs2Map.has(appDataEntityId)) {
      return this.rs2Map.get(appDataEntityId)!;
    }
    return [];
  }

  /**
   * 根据模型给的子实体中的父关系模型，计算每个实体的子关系模型
   *
   * @author chitanda
   * @date 2024-01-15 19:01:49
   */
  calcParentRs(): void {
    this.rs2Map.clear();
    this.rsMap.forEach((configs, appDataEntityId) => {
      configs.forEach(config => {
        config.minorAppDataEntityId = appDataEntityId;
        const major = config.majorAppDataEntityId!;
        if (!this.rs2Map.has(major)) {
          this.rs2Map.set(major, []);
        }
        this.rs2Map.get(major)!.push(config);
      });
    });
  }

  /**
   * 界面域销毁
   *
   * @author chitanda
   * @date 2023-12-22 15:12:49
   */
  destroy(): void {
    // 清空当前域下的父子关系映射
    this.rsMap.clear();
    const apps = ibiz.hub.getAllApps();
    apps.forEach(app => {
      app.deService.reset({
        srfappid: app.appId,
        srfsessionid: this.id,
      });
    });
    this.evt.reset();
  }
}
