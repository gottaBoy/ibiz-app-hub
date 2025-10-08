/**
 * @description 历史项
 * @export
 * @interface IApiChangeHistoryItem
 * @template T
 */
export interface IApiChangeHistoryItem<T> {
  /**
   * @description 状态
   * @type {T}
   * @memberof IApiChangeHistoryItem
   */
  state: T;
  /**
   * @description 时间戳
   * @type {number}
   * @memberof IApiChangeHistoryItem
   */
  timestamp: number;
}

/**
 * @description 变更追踪器接口
 * @export
 * @interface IApiChangeTracker
 */
export interface IApiChangeTracker<T> {
  /**
   * @description 添加状态
   * @param {T} state 新状态
   * @memberof IApiChangeTracker
   */
  add(state: T): void;

  /**
   * @description 清空历史状态并重置状态
   * @param {T} state 新状态
   * @memberof IApiChangeTracker
   */
  reset(state: T): void;

  /**
   * @description 撤销上一步操作
   * @returns {*}  {(T | null)} 撤销后的状态或null（如果没有可撤销的操作）
   * @memberof IApiChangeTracker
   */
  undo(): T | null;

  /**
   * @description 重做下一步操作
   * @returns {*}  {(T | null)} 重做后的状态或null（如果没有可重做的操作）
   * @memberof IApiChangeTracker
   */
  redo(): T | null;

  /**
   * @description 获取当前状态
   * @returns {*}  {(T | null)} 当前状态或null（如果未初始化）
   * @memberof IApiChangeTracker
   */
  getState(): T | null;

  /**
   * @description 是否可以撤销
   * @returns {*}  {boolean}
   * @memberof IApiChangeTracker
   */
  canUndo(): boolean;

  /**
   * @description 是否可以重做
   * @returns {*}  {boolean}
   * @memberof IApiChangeTracker
   */
  canRedo(): boolean;

  /**
   * @description 清空历史记录（保留当前状态）
   * @memberof IApiChangeTracker
   */
  clearHistory(): void;

  /**
   * @description 获取历史记录长度信息
   * @returns {*}  {{ past: number; future: number }}
   * @memberof IApiChangeTracker
   */
  getHistorySize(): { past: number; future: number };
}
