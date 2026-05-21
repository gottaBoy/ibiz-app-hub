/**
 * @description: 聊天步骤
 */
export interface IChatStep {
  /**
   * @description: 步骤标题
   */
  title: string;
  /**
   * @description: 步骤内容
   */
  content: string;
  /**
   * @description: 步骤状态
   */
  status: 'pending' | 'success' | 'failed';
}
