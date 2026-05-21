import { IDEEditForm } from '@ibiz/model-core';
import { IApiData } from '@ibiz-template/core';
import { IApiFormController } from './i-api-form.controller';
import { IApiEditFormState } from '../../state';
import { IApiDataAbilityParams } from '../../common/i-api-data-ability-params';

/**
 * @description 表单保存参数接口
 * @export
 * @interface IApiFormSaveParams
 * @extends {IApiDataAbilityParams}
 */
export interface IApiFormSaveParams extends IApiDataAbilityParams {
  /**
   * @description 保存之后是否不合并后台回来的数据
   * @type {boolean}
   * @memberof IApiFormSaveParams
   */
  noFillBack?: boolean;

  /**
   * @description 是否静默校验
   * @type {boolean}
   * @memberof IApiFormSaveParams
   */
  silentVerify?: boolean;
}

/**
 * 编辑表单
 * @primary
 * @description 编辑表单由输入框、单选框、下拉选择、进度条、标签等数据编辑控件及数据预览控件构成，主要功能包括高效收集用户输入数据、实时验证数据合法性、结构化提交至后端，同时支持数据回显与动态交互，保障用户体验与数据准确性。
 * @export
 * @ctrlparams {name:srfcachepos,title:启用缓存,parameterType:boolean,defaultvalue:false,description:当设置为true时，启用缓存激活表单分页标识功能,effectPlatform:web}
 * @ctrlparams {name:srfcachekeytempl,title:缓存标记,parameterType:string,description:当`srfcachepos`配置值为true时，在初始化表单分页数据，若 localStorage 中存在此缓存标记的缓存值，则可根据该值确定激活项,effectPlatform:web}
 * @ctrlparams {name:emptyhiddenunit,title:无值是否隐藏,parameterType:boolean,defaultvalue:false,description:表单项无值时，其对应的值单位（如'天'、'%'等）是否隐藏,effectPlatform:web}
 * @ctrlparams {name:emptyshowmode,title:无值显示模式,parameterType:'DEFAULT' | 'PLACEHOLDER',defaultvalue:'DEFAULT',description:表单项无值时的显示模式，默认为DEFAULT，无值时显示自定义的无值显示文本，值为PLACEHOLDER时显示空白占位符,effectPlatform:web}
 * @ctrlparams {"name":"editmode","title":"编辑模式","parameterType":"'default' | 'hover'","defaultvalue":"'default'","description":"编辑模式。当值为 'hover'时，表单项显示时只显示值，不显示编辑器的外观，如输入框，下拉框等不显示边框，鼠标悬浮时才正常显示；值为 'default' 或者无值时，界面正常显示编辑器外观","effectPlatform":"web"}
 * @ctrlparams {"name":"triggermode","title":"编辑器值变更模式","parameterType":"'blur' | 'input'","defaultvalue":"'blur'","description":"该配置项用于指定编辑器触发 `emit` 事件的模式。若值为 'input'，则在输入框值变更时触发 change 事件；若值为 'blur'，则在输入框失去焦点时触发 change 事件","effectPlatform":"web"}
 * @ctrlparams {"name":ignoreupdateitem,"title":忽略表单项更新响应数据关联处理,"parameterType":boolean,defaultvalue:true,"description":该配置项用于指定是否忽略表单项更新响应数据关联处理(是否忽略dto返回数据)}
 * @ctrlparams {"name":"validatemode","title":"校验模式","parameterType":"'default' | 'notification'","defaultvalue":"'default'","description":"default:默认模式,错误信息显示在表单项下方；notification:通知模式，错误信息显示在页面右上角弹框中","effectPlatform":"web"}
 * @ctrlparams {"name":"enablejsonschema","title":"是否启用jsonschema","parameterType":"boolean","defaultvalue":"false","description":"是否启用jsonschema。参数为true时，会请求服务获取jsonschema对象，并根据该对象的enumOptions属性值计算生成表单项编辑器的代码表数据集合"}
 * @ctrlparams {"name":"jsonschemaparams","title":"请求jsonschema查询参数","parameterType":"string","defaultvalue":"","description":"启用jsonschema才生效，查询实体jsonschema附加额外业务查询参数"}
 * @ctrlparams {"name":"showtipsicon","title":"是否显示属性标签提示图标","parameterType":"boolean","defaultvalue":"","description":"用于设置当前表单所有表单项标签是否显示提示图标，优先级大于全局显示属性提示图标配置","effectPlatform":"web"}
 * @ctrlparams {"name":"mobformitemalignmode","title":"表单编辑器的对齐方向","parameterType":"string","description":"用于指定表单编辑器的对齐方向","effectPlatform":"mob"}
 * @ctrlparams {"name":"mobshowunderline","title":"表单项是否显示下划线","parameterType":"boolean","description":"用于指定表单项是否显示下划线","effectPlatform":"mob"}
 * @ctrlparams {"name":"mobshoweditorborder","title":"表单编辑器是否显示边框","parameterType":"boolean","description":"用于指定表单编辑器是否显示边框","effectPlatform":"mob"}
 * @ctrlparams {"name":"mobhideclear","title":"表单编辑器是否隐藏清除按钮","parameterType":"boolean","description":"用于指定表单编辑器是否隐藏清除按钮","effectPlatform":"mob"}
 * @interface IApiEditFormController
 * @extends {IApiFormController<T, S>}
 * @template T
 * @template S
 */
export interface IApiEditFormController<
  T extends IDEEditForm = IDEEditForm,
  S extends IApiEditFormState = IApiEditFormState,
> extends IApiFormController<T, S> {
  /**
   * @description 加载草稿数据
   * @param {IApiDataAbilityParams} [args] 加载参数
   * @returns {*}  {Promise<IApiData>}
   * @memberof IApiEditFormController
   */
  loadDraft(args?: IApiDataAbilityParams): Promise<IApiData>;

  /**
   * @description 加载数据
   * @param {IApiDataAbilityParams} [args] 加载参数
   * @returns {*}  {Promise<IApiData>}
   * @memberof IApiEditFormController
   */
  load(args?: IApiDataAbilityParams): Promise<IApiData>;

  /**
   * @description 保存表单数据
   * @param {IApiFormSaveParams} [args] 保存参数
   * @returns {*}  {Promise<IApiData>}
   * @memberof IApiEditFormController
   */
  save(args?: IApiFormSaveParams): Promise<IApiData>;

  /**
   * @description 删除表单数据
   * @param {IApiDataAbilityParams} [args] 删除参数
   * @returns {*}  {Promise<boolean>}
   * @memberof IApiEditFormController
   */
  remove(args?: IApiDataAbilityParams): Promise<boolean>;

  /**
   * @description  工作流提交(调用前先确保调用保存)
   * @param {IApiDataAbilityParams} [args] 工作流参数，不走工作流操作视图时使用
   * @returns {*}  {Promise<void>}
   * @memberof IApiEditFormController
   */
  wfSubmit(args?: IApiDataAbilityParams): Promise<void>;

  /**
   * @description 工作流启动(调用前先确保调用保存)
   * @param {IApiDataAbilityParams} [args] 工作流参数，不走工作流启动视图时使用
   * @returns {*}  {Promise<void>}
   * @memberof IApiEditFormController
   */
  wfStart(args?: IApiDataAbilityParams): Promise<void>;

  /**
   * @description 过滤成员，与表单成员标题包含匹配，满足条件则显示，不满足条件则隐藏
   * @param {string} filter 过滤字符
   * @memberof IApiEditFormController
   */
  filterDetail(filter: string): void;

  /**
   * @description 执行更新表单项
   * @param {string} formItemUpdateId 表单项更新标识
   * @returns {*}  {Promise<void>}
   * @memberof IApiEditFormController
   */
  updateFormItem(formItemUpdateId: string): Promise<void>;

  /**
   * @description 取消变更，'UNDO' \| 'REDO'暂未支持
   * @param {('INIT' | 'UNDO' | 'REDO')} [targetState] 目标状态，初始化状态|撤销上一步操作|重做下一步操作
   * @returns {*}  {Promise<void>}
   * @memberof IApiEditFormController
   */
  cancelChanges(targetState?: 'INIT' | 'UNDO' | 'REDO'): Promise<void>;
}
