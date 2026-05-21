/**
 * @description: 聊天界面行为
 */
export interface IChatUIAction {
  /**
   * 标识
   */
  id: string;

  /**
   * 类型
   */
  type: string;

  /**
   * 数据
   */
  data: object;

  /**
   * 元数据
   */
  metadata: object;
}
