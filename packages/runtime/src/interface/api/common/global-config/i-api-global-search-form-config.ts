/**
 * @description 搜索表单全局配置
 * @export
 * @interface IApiGlobalSearchFormConfig
 */
export interface IApiGlobalSearchFormConfig {
  /**
   * @description 是否启用存储过滤条件，为true时可以将过滤条件进行保存
   * @type {boolean}
   * @default true
   * @platform web
   * @memberof IApiGlobalSearchFormConfig
   */
  enableStoredFilters: boolean;

  /**
   * @description 搜索过滤参数转换模式(default：默认模式，过滤参数保持键值对格式（如 {"n_name_like":"名称"}）；searchconds：搜索条件模式，将对象格式的查询参数转换为结构化的搜索条件数组，并将其作为新的过滤参数（如 {"searchconds": [{"condop": "AND","condtype": "GROUP","searchconds": [{"condtype": "DEFIELD","fieldname": "name","value": "名称","condop": "LIKE"}]}]})
   * @type {string}
   * @default default
   * @platform web
   * @platform mob
   * @memberof IApiGlobalFormConfig
   */
  convertParamMode: 'default' | 'searchconds';
}
