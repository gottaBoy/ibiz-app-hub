import { IApiData } from '@ibiz-template/core';

/**
 * @description 视图能力
 * @export
 * @interface IApiViewCall
 */
export interface IApiViewCall {
  /**
   * @description 获取数据（多数据指选中数据）
   * @type {{
   *     args: undefined;
   *   }}
   * @memberof IApiViewCall
   */
  GetData: {
    args: undefined;
  };
  /**
   * @description 拷贝路径
   * @type {{
   *     args: undefined;
   *   }}
   * @memberof IApiViewCall
   */
  CopyPath: {
    args: undefined;
  };
  /**
   * @description 快捷方式(最小化)
   * @type {{
   *     args: { data: IApiData[] };
   *   }}
   * @memberof IApiViewCall
   */
  ShortCut: {
    args: { data: IApiData[] };
  };
  /**
   * @description 切换搜索表单显示
   * @type {{
   *     args: undefined;
   *   }}
   * @memberof IApiViewCall
   */
  ToggleFilter: {
    args: undefined;
  };
  /**
   * @description 搜索
   * @type {{
   *     args: undefined;
   *   }}
   * @memberof IApiViewCall
   */
  Search: {
    args: undefined;
  };
  /**
   * @description 重置
   * @type {{
   *     args: undefined;
   *   }}
   * @memberof IApiViewCall
   */
  Reset: {
    args: undefined;
  };

  /**
   * @description 取消变更，'UNDO' | 'REDO' 暂未支持
   * @type {({
   *     args: { targetState:  'INIT' | 'UNDO' | 'REDO' };
   *   })} 目标状态，初始化状态|撤销上一步操作|重做下一步操作
   * @memberof IApiViewCall
   */
  CancelChanges: {
    args: { targetState: 'INIT' | 'UNDO' | 'REDO' };
  };
}
