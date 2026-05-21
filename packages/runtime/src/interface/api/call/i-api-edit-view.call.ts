import { IApiViewCall } from './i-api-view.call';

/**
 * @description 实体编辑视图能力
 * @export
 * @interface IApiEditViewCall
 * @extends {IApiViewCall}
 */
export interface IApiEditViewCall extends IApiViewCall {
  /**
   * @description 保存
   * @type {{
   *     args: undefined;
   *   }}
   * @memberof IApiEditViewCall
   */
  Save: {
    args: undefined;
  };
  /**
   * @description 保存并关闭
   * @type {{
   *     args: undefined;
   *   }}
   * @memberof IApiEditViewCall
   */
  SaveAndExit: {
    args: undefined;
  };
  /**
   * @description 删除并关闭
   * @type {{
   *     args: undefined;
   *   }}
   * @memberof IApiEditViewCall
   */
  RemoveAndExit: {
    args: undefined;
  };
  /**
   * @description 保存并新建
   * @type {{
   *     args: undefined;
   *   }}
   * @memberof IApiEditViewCall
   */
  SaveAndNew: {
    args: undefined;
  };
  /**
   * @description 刷新视图
   * @type {{
   *     args: undefined;
   *   }}
   * @memberof IApiEditViewCall
   */
  Refresh: {
    args: undefined;
  };
  /**
   * @description 工作流启动
   * @type {{
   *     args: undefined;
   *   }}
   * @memberof IApiEditViewCall
   */
  SaveAndStart: {
    args: undefined;
  };
  /**
   * @description 第一个记录
   * @type {{
   *     args: undefined;
   *   }}
   * @memberof IApiEditViewCall
   */
  FirstRecord: {
    args: undefined;
  };
  /**
   * @description 最后一个记录
   * @type {{
   *     args: undefined;
   *   }}
   * @memberof IApiEditViewCall
   */
  LastRecord: {
    args: undefined;
  };
  /**
   * @description 上一个记录
   * @type {{
   *     args: undefined;
   *   }}
   * @memberof IApiEditViewCall
   */
  PrevRecord: {
    args: undefined;
  };
  /**
   * @description 下一个记录
   * @type {{
   *     args: undefined;
   *   }}
   * @memberof IApiEditViewCall
   */
  NextRecord: {
    args: undefined;
  };
  /**
   * @description 工作流提交
   * @type {{
   *     args: undefined;
   *   }}
   * @memberof IApiEditViewCall
   */
  ViewWFStep: {
    args: undefined;
  };
  /**
   * @description 视图加载（特指初始化加载）
   * @type {{
   *     args: undefined;
   *   }}
   * @memberof IApiEditViewCall
   */
  Load: {
    args: undefined;
  };
  /**
   * @description 校验数据（编辑视图才用）
   * @type {{
   *     args: undefined;
   *   }}
   * @memberof IApiEditViewCall
   */
  Validate: {
    args: undefined;
  };
  /**
   * @description 流程撤回
   * @type {{
   *     args: undefined;
   *   }}
   * @memberof IApiEditViewCall
   */
  WFWithdraw: {
    args: undefined;
  };
  /**
   * @description 展开表单分组，srfcollapsetag: 表单分组标识，srfgroupid: 表单分组标识，优先取srfcollapsetag参数
   * @type {{
   *     args: { params: { srfcollapsetag?: string; srfgroupid?: string } };
   *   }}
   * @memberof IApiEditViewCall
   */
  Expand: {
    args: { params: { srfcollapsetag?: string; srfgroupid?: string } };
  };
  /**
   * @description 收缩表单分组，srfcollapsetag: 表单分组标识，srfgroupid: 表单分组标识，优先取srfcollapsetag参数
   * @type {{
   *     args: { params: { srfcollapsetag?: string; srfgroupid?: string } };
   *   }}
   * @memberof IApiEditViewCall
   */
  Collapse: {
    args: { params: { srfcollapsetag?: string; srfgroupid?: string } };
  };
  /**
   * @description 全部展开
   * @type {{
   *     args: undefined;
   *   }}
   * @memberof IApiEditViewCall
   */
  ExpandAll: {
    args: undefined;
  };
  /**
   * @description 全部收缩
   * @type {{
   *     args: undefined;
   *   }}
   * @memberof IApiEditViewCall
   */
  CollapseAll: {
    args: undefined;
  };
}
