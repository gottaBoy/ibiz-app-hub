import { IDRBar } from '@ibiz/model-core';
import { IApiData } from '@ibiz-template/core';
import { IApiDRBarState } from '../../state';
import { IApiControlController } from './i-api-control.controller';

/**
 * 数据关系栏
 * @description 通过导航菜单的形式构建多个页面，点击菜单项即可实现页面切换。
 * @primary
 * @export
 * @interface IDRBarController
 * @extends {IApiControlController<T, S>}
 * @ctrlparams {name:singleitemgroup,title:单项分组模式,parameterType:boolean,defaultvalue:false,description:当关系界面分组对应的菜单分组只有一个分组项时，该值为true则显示菜单分组，否则不显示菜单分组,effectPlatform:web}
 * @template T
 * @template S
 */
export interface IApiDRBarController<
  T extends IDRBar = IDRBar,
  S extends IApiDRBarState = IApiDRBarState,
> extends IApiControlController<T, S> {
  /**
   * @description 获取数据
   * @returns {*}  {IApiData[]}
   * @memberof IApiDRBarController
   */
  getData(): IApiData[];

  /**
   * @description 设置激活项
   * @param {string} name 项标识
   * @memberof IApiDRBarController
   */
  setActive(name: string): void;
}
