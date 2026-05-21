/**
 * @description 移动端动态设计接口
 * @export
 * @interface IMobCustomDesign
 */
export interface IMobCustomDesign {
  /**
   * @description 门户部件列表
   * @type {(string[] | undefined)}
   * @memberof IMobCustomDesign
   */
  portlets: string[] | undefined;

  /**
   * @description 更新门户部件状态
   * @memberof IMobCustomDesign
   */
  updatePortletState(): void;

  /**
   * @description 加载门户部件数据
   * @returns {*}  {Promise<void>}
   * @memberof IMobCustomDesign
   */
  load(): Promise<void>;

  /**
   * @description 保存门户部件数据
   * @param {string[]} portlets
   * @returns {*}  {Promise<void>}
   * @memberof IMobCustomDesign
   */
  save(portlets: string[]): Promise<void>;
}
