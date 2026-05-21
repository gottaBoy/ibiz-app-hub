import { ISearchBar } from '@ibiz/model-core';
import { IApiParams } from '@ibiz-template/core';
import { IApiControlController } from './i-api-control.controller';
import { IApiSearchBarState } from '../../state';

/**
 * 搜索栏
 * @description 默认提供输入框搜索功能，同时支持过滤项搜索、后台分组搜索及快速搜索。
 * @primary
 * @export
 * @interface IApiSearchBarController
 * @extends {IApiControlController<T, S>}
 * @ctrlparams {name:enablejsonschema,title:是否启用JSONSchema,parameterType:boolean,defaultvalue:false,description:是否启用基于实体的 jsonschema 生成过滤项功能}
 * @ctrlparams {"name":"jsonschemaparams","title":"jsonschema参数数据","parameterType":"string","defaultvalue":"'{}'","description":"当`enablejsonschema`值为true时生效。支持配置 JSON 字符串并转化为导航参数，该参数将被附加到获取实体的 jsonschema 数据的请求参数中，获取的数据用于生成搜索栏过滤项，示例格式：\\{\"test\":\"%test%\"\\}"}
 * @ctrlparams {name:storage,title:是否启用缓存,parameterType:boolean,defaultvalue:false,description:该值true时，会将点击的搜索栏后台分组项名称缓存到 localStorage 中，用于组件初始化时默认选中后台分组项,effectPlatform:web}
 * @ctrlparams {name:searchphseparator,title:快速搜索提示分隔符,parameterType:string,defaultvalue:'、',description:搜索栏输入框根据该值将所有输入项提示文本进行拼接展示}
 * @ctrlparams {name:enablestoredquery,title:是否启用历史录,parameterType:boolean,defaultvalue:false,description:启用后每次的搜索记录都将存储到 localStorage 中，下次打开该页面并搜索时将显示所有历史记录,effectPlatform:mob}
 * @template T
 * @template S
 */
export interface IApiSearchBarController<
  T extends ISearchBar = ISearchBar,
  S extends IApiSearchBarState = IApiSearchBarState,
> extends IApiControlController<T, S> {
  /**
   * @description 获取搜索栏的过滤参数
   * @returns {*}  {IApiParams}
   * @memberof IApiSearchBarController
   */
  getFilterParams(): IApiParams;

  /**
   * @description 搜索
   * @memberof IApiSearchBarController
   */
  onSearch(): void;

  /**
   * @description 重置
   * @memberof IApiSearchBarController
   */
  resetFilter(): void;

  /**
   * @description 切换分组
   * @param {string} tabId 分组标识
   * @memberof IApiSearchBarController
   */
  selectTab(tabId: string): void;
}
