/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @description 工具调用
 * @export
 * @interface IChatToolCall
 */
export interface IChatToolCall {
  /**
   * @description 工具名称
   * @type {string}
   * @memberof IChatToolCall
   */
  name: string;

  /**
   * @description 工具类型
   * @type {string}
   * @memberof IChatToolCall
   */
  type: string;

  /**
   * @description 参数
   * @type {{
   *     type: string;
   *     id: string;
   *     desc: string;
   *   }}
   * @memberof IChatToolCall
   */
  parameters: {
    type: string;
    id: string;
    desc: string;
  };

  /**
   * @description 是否错误
   * @type {boolean}
   * @memberof IChatToolCall
   */
  error: boolean;

  /**
   * @description 结果
   * @type {any}
   * @memberof IChatToolCall
   */
  result?: any;
}
