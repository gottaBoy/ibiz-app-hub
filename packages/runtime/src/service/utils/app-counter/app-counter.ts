import { IBizContext, IPortalMessage, RuntimeError } from '@ibiz-template/core';
import { IAppCounter } from '@ibiz/model-core';
import { notNilEmpty, QXEvent } from 'qx-util';
import { clone } from 'ramda';
import { toNumber } from 'lodash-es';
import { Application } from '../../../application';
import { IDataEntity } from '../../../interface';
import { calcDeCodeNameById } from '../../../model';

/**
 * 应用计数器基类
 *
 * @author chitanda
 * @date 2022-10-26 18:10:51
 * @export
 * @class AppCounter
 */
export class AppCounter {
  protected app!: Application;

  protected intervalTimer: unknown;

  protected destroyed: boolean = false;

  /**
   * 计数器是否已经销毁
   *
   * @author chitanda
   * @date 2022-10-26 20:10:55
   * @protected
   * @type {boolean}
   */
  get isDestroyed(): boolean {
    return this.destroyed;
  }

  protected context: IContext = IBizContext.create();

  protected params: IParams = {};

  protected evt: QXEvent<{ change: (data: IData) => void }> = new QXEvent();

  /**
   * 计数器数据
   *
   * @author chitanda
   * @date 2022-10-26 19:10:08
   * @protected
   * @type {IData}
   */
  protected data: IData = {};

  /**
   * Creates an instance of AppCounter.
   *
   * @author chitanda
   * @date 2022-10-26 20:10:55
   * @param {IAppCounter} model 应用计数器模型
   */
  constructor(public model: IAppCounter) {
    this.countChange = this.countChange.bind(this);
  }

  /**
   * 计数器初始化
   *
   * @author chitanda
   * @date 2022-10-26 19:10:24
   * @param {IContext} [context]
   * @param {IParams} [params]
   */
  async init(context?: IContext, params?: IParams): Promise<void> {
    this.setParams(context, params);
    this.interval();
    await this.load();
    if (this.model.appDataEntityId) {
      ibiz.mc.command.change.on(this.countChange);
    }
  }

  /**
   * 接受计数器实体数据变更，刷新计数器
   *
   * @author chitanda
   * @date 2024-03-07 14:03:00
   * @protected
   * @param {IPortalMessage} msg
   */
  protected countChange(msg: IPortalMessage): void {
    const data = msg.data as IDataEntity;
    if (this.model.appDataEntityId) {
      const codeName = calcDeCodeNameById(this.model.appDataEntityId);
      if (
        data &&
        data.srfdecodename &&
        data.srfdecodename.toLowerCase() === codeName
      ) {
        this.refresh();
      }
    }
  }

  /**
   * 设置上下文以及查询参数
   *
   * @author chitanda
   * @date 2022-10-26 19:10:58
   * @protected
   * @param {IContext} [context]
   * @param {IParams} [params]
   */
  protected setParams(context?: IContext, params?: IParams): void {
    if (context) {
      this.context = clone(context);
    }
    if (params) {
      this.params = clone(params);
    }
  }

  /**
   * 计数器定时刷新
   *
   * @author chitanda
   * @date 2022-10-26 18:10:13
   * @protected
   */
  protected interval(): void {
    this.destroyInterval();
    if (this.model.timer) {
      this.intervalTimer = setInterval(() => {
        // 当无人订阅计数器时，跳过刷新
        if (this.evt.getSize('change') > 0) {
          this.load();
        }
      }, this.model.timer);
    }
  }

  /**
   * 销毁定时器自动刷新
   *
   * @author chitanda
   * @date 2022-10-26 18:10:31
   * @protected
   */
  protected destroyInterval(): void {
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer as number);
      this.intervalTimer = null;
    }
  }

  /**
   * 加载计数器
   *
   * @author chitanda
   * @date 2022-10-26 19:10:38
   * @protected
   * @return {*}  {Promise<IData>}
   */
  protected async load(): Promise<IData> {
    throw new RuntimeError(ibiz.i18n.t('runtime.service.noImplementedCounter'));
  }

  /**
   * 计数器刷新
   *
   * @author chitanda
   * @date 2022-10-26 19:10:46
   * @param {IContext} [context]
   * @param {IParams} [params]
   * @return {*}  {Promise<IData>}
   */
  refresh(context?: IContext, params?: IParams): Promise<IData> {
    this.setParams(context, params);
    return this.load();
  }

  /**
   * 计数器数据变更事件监听
   *
   * @author chitanda
   * @date 2022-10-26 20:10:13
   * @param {(data: IData) => void} fn
   * @param {boolean} [immediate=true] 当有计时器数据时，立即触发一次回调
   */
  onChange(fn: (data: IData) => void, immediate: boolean = true): void {
    this.evt.on('change', fn);
    if (immediate && notNilEmpty(this.data)) {
      fn(this.data);
    }
  }

  /**
   * 取消计数器数据变更监听
   *
   * @author chitanda
   * @date 2022-10-26 20:10:13
   * @param {(data: IData) => void} fn
   */
  offChange(fn: (data: IData) => void): void {
    this.evt.off('change', fn);
  }

  /**
   * 根据计数器标识，获取计数器数值
   *
   * @author chitanda
   * @date 2022-10-26 20:10:08
   * @param {string} tag
   * @return {*}  {number}
   */
  getCounter(tag: string): number {
    const value = this.data[tag.toLowerCase()] || 0;
    return toNumber(value);
  }

  /**
   * 销毁计数器
   *
   * @author chitanda
   * @date 2022-10-26 18:10:31
   */
  destroy(): void {
    this.destroyed = true;
    this.context.destroy();
    this.destroyInterval();
    this.evt.reset();
    ibiz.mc.command.change.off(this.countChange);
  }
}
