import { IDRTab } from '@ibiz/model-core';
import { IApiData } from '@ibiz-template/core';
import { IApiDRTabState } from '../../state';
import { IApiControlController } from './i-api-control.controller';

/**
 * 数据关系分页
 * @description 使用标签页的方式绘制多个视图页面，点击标签页即可实现页面切换。
 * @primary
 * @export
 * @interface IDRTabController
 * @extends {IApiControlController<T, S>}
 * @ctrlparams {name:srfcachepos,title:启用缓存,parameterType:boolean,defaultvalue:false,description:当设置为true时启用缓存激活分页标识功能,effectPlatform:web}
 * @ctrlparams {name:srfcachekeytempl,title:缓存标记,parameterType:string,description:当`srfcachepos`值为true且当前视图状态对象中无导航数据时，此功能生效。在初始化关系分页数据时，若 localStorage 中存在此缓存标记的缓存值，则可根据该值确定激活项,effectPlatform:web}
 * @ctrlparams {name:showmore,title:显示更多,parameterType:boolean,defaultvalue:false,description:当该值为true时，若分页栏内容超出父容器范围，将隐藏超出的分页项，点击`更多`标签页后，超出容器的分页项将以下拉的形式展示,effectPlatform:web}
 * @ctrlparams {name:enablenavbar,title:启用导航栏,parameterType:boolean,defaultvalue:false,description:当drtab布局为流布局模式时启用，如果设置了enablenavbar=true，则drtab会根据分页生成一个导航栏，点击导航项，页面会自动滚动到对应分页的位置,effectPlatform:web}
 * @ctrlparams {name:navbarpos,title:导航栏位置,parameterType:string,defaultvalue:'TOPRIGHT',description:当enablenavbar=true时启用，用于决定导航栏的位置，默认位置在drtab整体的右上角，所有可选值为TOPLEFT：左上角，MIDDLELEFT：左侧中间，BOTTOMLEFT：左下角，TOPRIGHT：右上角，MIDDLERIGHT：右侧中间，BOTTOMRIGHT：右下角,effectPlatform:web}
 * @ctrlparams {name:navbarwidth,title:导航栏宽度,parameterType:number,defaultvalue:200,description:当enablenavbar=true时启用，用于设置导航栏的占位宽度，默认是200px,effectPlatform:web}
 * @template T
 * @template S
 */
export interface IApiDRTabController<
  T extends IDRTab = IDRTab,
  S extends IApiDRTabState = IApiDRTabState,
> extends IApiControlController<T, S> {
  /**
   * @description 获取数据
   * @returns {*}  {IApiData[]}
   * @memberof IApiDRTabController
   */
  getData(): IApiData[];

  /**
   * @description 设置激活项
   * @param {string} name 项标识
   * @memberof IApiDRTabController
   */
  setActive(name: string): void;
}
