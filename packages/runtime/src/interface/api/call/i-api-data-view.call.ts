import { IApiMDViewCall } from './i-api-md-view.call';

/**
 * @description 实体数据视图能力
 * @export
 * @interface IApiDataViewCall
 * @extends {IApiMDViewCall}
 */
export interface IApiDataViewCall extends IApiMDViewCall {
  /**
   * @description 展开卡片分组，srfcollapsetag: 卡片分组标识，srfgroup: 卡片分组标识，优先取srfcollapsetag参数
   * @type {{
   *     args: { params: { srfcollapsetag?: string; srfgroup?: string } };
   *   }}
   * @memberof IApiDataViewCall
   */
  Expand: {
    args: { params: { srfcollapsetag?: string; srfgroup?: string } };
  };
  /**
   * @description 收缩卡片分组，srfcollapsetag: 卡片分组标识，srfgroup: 卡片分组标识，优先取srfcollapsetag参数
   * @type {{
   *     args: { params: { srfcollapsetag?: string; srfgroup?: string } };
   *   }}
   * @memberof IApiDataViewCall
   */
  Collapse: {
    args: { params: { srfcollapsetag?: string; srfgroup?: string } };
  };
  /**
   * @description 全部展开
   * @type {{
   *     args: undefined;
   *   }}
   * @memberof IApiDataViewCall
   */
  ExpandAll: {
    args: undefined;
  };
  /**
   * @description 全部收缩
   * @type {{
   *     args: undefined;
   *   }}
   * @memberof IApiDataViewCall
   */
  CollapseAll: {
    args: undefined;
  };
}
