/* eslint-disable @typescript-eslint/no-unused-vars */
import { IApiChangeHistoryItem, IApiChangeTracker } from '../../interface';
import { ChangeHistoryItem } from './change-history-item';

/**
 * @description 变更追踪器
 * @export
 * @class ChangeTracker
 * @implements {IApiChangeTracker<T>}
 * @template T
 */
export class ChangeTracker<T> implements IApiChangeTracker<T> {
  /**
   * @description 当前值前序清单
   * @private
   * @type {ChangeHistoryItem<T>[]}
   * @memberof ChangeTracker
   */
  private past: ChangeHistoryItem<T>[] = [];

  /**
   * @description 当前值
   * @private
   * @type {(ChangeHistoryItem<T> | null)}
   * @memberof ChangeTracker
   */
  private present: ChangeHistoryItem<T> | null = null;

  /**
   * @description 当前值后序清单
   * @private
   * @type {ChangeHistoryItem<T>[]}
   * @memberof ChangeTracker
   */
  private future: ChangeHistoryItem<T>[] = [];

  /**
   * @description 历史记录限制条数，默认历史记录限制100条
   * @private
   * @type {number}
   * @memberof ChangeTracker
   */
  private readonly limit: number;

  /**
   * Creates an instance of ChangeTracker.
   * @param {{ limit?: number }} [options={}]
   * @memberof ChangeTracker
   */
  constructor(options: { limit?: number } = {}) {
    this.limit = options.limit || 100;
  }

  /**
   * @description 添加状态
   * @param {T} state
   * @memberof ChangeTracker
   */
  add(state: T): void {
    if (this.present) {
      this.past.push(this.present);
      this.trimHistory(this.past);
    }
    this.present = new ChangeHistoryItem(state);
    this.future = [];
  }

  /**
   * @description 重置状态
   * @param {T} state
   * @memberof ChangeTracker
   */
  reset(state: T): void {
    this.clearHistory();
    this.add(state);
  }

  /**
   * @description 撤销上一步操作
   * @returns {*}  {(T | null)}
   * @memberof ChangeTracker
   */
  undo(): T | null {
    if (this.past.length === 0 || !this.present) {
      return null;
    }
    const previous = this.past.pop()!;
    this.future.unshift(this.present);
    this.present = previous;
    return this.getState();
  }

  /**
   * @description 重做下一步操作
   * @returns {*}  {(T | null)}
   * @memberof ChangeTracker
   */
  redo(): T | null {
    if (this.future.length === 0 || !this.present) {
      return null;
    }
    const next = this.future.shift()!;
    this.past.push(this.present);
    this.present = next;
    return this.getState();
  }

  /**
   * @description 获取当前状态
   * @returns {*}  {(T | null)}
   * @memberof ChangeTracker
   */
  getState(): T | null {
    return this.present?.state ?? null;
  }

  /**
   * @description 是否可以撤销
   * @returns {*}  {boolean}
   * @memberof ChangeTracker
   */
  canUndo(): boolean {
    return this.past.length > 0;
  }

  /**
   * @description 是否可以重做
   * @returns {*}  {boolean}
   * @memberof ChangeTracker
   */
  canRedo(): boolean {
    return this.future.length > 0;
  }

  /**
   * @description 清空历史记录
   * @memberof ChangeTracker
   */
  clearHistory(): void {
    this.past = [];
    this.future = [];
    this.present = null;
  }

  /**
   * @description 获取历史记录长度信息
   * @returns {*}  {{ past: number; future: number }}
   * @memberof ChangeTracker
   */
  getHistorySize(): { past: number; future: number } {
    return {
      past: this.past.length,
      future: this.future.length,
    };
  }

  /**
   * @description 限制历史记录长度
   * @private
   * @param {IApiChangeHistoryItem<T>[]} history 历史记录数组
   * @memberof ChangeTracker
   */
  private trimHistory(history: IApiChangeHistoryItem<T>[]): void {
    if (history.length > this.limit) {
      const excess = history.length - this.limit;
      history.splice(0, excess);
    }
  }
}
