/* eslint-disable no-shadow */
/**
 * 视图调用call的标识
 * @author lxm
 * @date 2023-09-08 11:08:44
 * @export
 * @enum {number}
 */
export enum ViewCallTag {
  /**
   * 视图加载（特指初始化加载）
   */
  'LOAD' = 'Load',
  /**
   * 获取数据（多数据指选中数据）
   */
  'GET_DATA' = 'GetData',
  /**
   * 获取所有数据（多数据专用，获取全部数据）
   */
  'GET_ALL_DATA' = 'GetAllData',
  /**
   * 设置选中数据（多数据专用）
   */
  'SET_SELECTED_DATA' = 'SetSelectedData',
  /**
   * 校验数据（编辑视图才用）
   */
  'VALIDATE' = 'Validate',
  /**
   * 切换折叠（首页视图才用）
   */
  'TOGGLE_COLLAPSE' = 'ToggleCollapse',
  /**
   * 流程撤回
   */
  'WF_WITHDRAW' = 'WFWithdraw',
  /**
   * 拷贝路径
   */
  'COPY_PATH' = 'CopyPath',
}
