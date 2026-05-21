import { IDESearchForm } from '@ibiz/model-core';
import { IApiData, IApiParams } from '@ibiz-template/core';
import { IApiFormController } from './i-api-form.controller';
import { IApiSearchFormState } from '../../state';

/**
 * 搜索表单
 * @primary
 * @description 搜索表单包含输入框、单选框、下拉选择、多选框等用户输入组件，用于收集数据并执行过滤搜索。
 * @export
 * @interface IApiSearchFormController
 * @extends {IApiFormController<T, S>}
 * @ctrlparams {name:emptyhiddenunit,title:无值是否隐藏,parameterType:boolean,defaultvalue:false,description:表单项无值时，其对应的值单位（如'天'、'%'等）是否隐藏,effectPlatform:web}
 * @ctrlparams {name:enablestoredfilters,title:启用存储过滤条件,parameterType:boolean,defaultvalue:true,description:设置为true的时候初始化时就会去加载保存的过滤条件，并将过滤条件附加在后续搜索行为的查询参数中,effectPlatform:web}
 * @ctrlparams {"name":"validatemode","title":"校验模式","parameterType":"'default' | 'notification'","defaultvalue":"'default'","description":"default:默认模式,错误信息显示在表单项下方；notification:通知模式，错误信息显示在页面右上角弹框中","effectPlatform":"web"}
 * @ctrlparams {"name":"convertparammode","title":"搜索过滤参数转换模式","parameterType":"'default' | 'searchconds'","defaultvalue":"'default'","description":"default：默认模式，过滤参数保持键值对格式（如 \\{\"n_name_like\":\"名称\"\\}）；searchconds：搜索条件模式，将对象格式的查询参数转换为结构化的搜索条件数组，并将其作为新的过滤参数（如 \\{\"searchconds\": [{\"condop\": \"AND\",\"condtype\": \"GROUP\",\"searchconds\": [{\"condtype\": \"DEFIELD\",\"fieldname\": \"name\",\"value\": \"名称\",\"condop\": \"LIKE\"}]}]\\}"}
 * @ctrlparams {"name":"enablejsonschema","title":"是否启用jsonschema","parameterType":"boolean","defaultvalue":"false","description":"是否启用jsonschema。参数为true时，会请求服务获取jsonschema对象，并根据该对象的enumOptions属性值计算生成表单项编辑器的代码表数据集合"}
 * @ctrlparams {"name":"jsonschemaparams","title":"请求jsonschema查询参数","parameterType":"string","defaultvalue":"","description":"启用jsonschema才生效，查询实体jsonschema附加额外业务查询参数"}
 * @ctrlparams {"name":"showtipsicon","title":"是否显示属性标签提示图标","parameterType":"boolean","defaultvalue":"","description":"用于设置当前表单所有表单项标签是否显示提示图标，优先级大于全局显示属性提示图标配置","effectPlatform":"web"}
 * @template T
 * @template S
 */
export interface IApiSearchFormController<
  T extends IDESearchForm = IDESearchForm,
  S extends IApiSearchFormState = IApiSearchFormState,
> extends IApiFormController<T, S> {
  /**
   * @description 加载数据
   * @returns {*}  {Promise<IApiData>}
   * @memberof IApiSearchFormController
   */
  load(): Promise<IApiData>;

  /**
   * @description 获取搜索表单的过滤参数
   * @returns {*}  {IApiParams}
   * @memberof IApiSearchFormController
   */
  getFilterParams(): IApiParams;

  /**
   * @description 执行搜索行为
   * @returns {*}  {Promise<void>}
   * @memberof IApiSearchFormController
   */
  search(): Promise<void>;

  /**
   * @description 重置
   * @returns {*}  {Promise<void>}
   * @memberof IApiSearchFormController
   */
  reset(): Promise<void>;

  /**
   * @description 存储搜索条件
   * @param {string} name 存储的名称
   * @returns {*}  {Promise<void>}
   * @memberof IApiSearchFormController
   */
  storeFilter(name: string): Promise<void>;

  /**
   * @description 应用保存的过滤条件
   * @param {number} index 存储的过滤条件集合索引下标
   * @memberof IApiSearchFormController
   */
  applyStoredFilter(index: number): void;

  /**
   * @description 删除保存的过滤条件
   * @param {number} index 存储的过滤条件集合索引下标
   * @returns {*}  {Promise<void>}
   * @memberof IApiSearchFormController
   */
  removeStoredFilter(index: number): Promise<void>;
}
