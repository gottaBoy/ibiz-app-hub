/* eslint-disable prettier/prettier */
import { IDEMobMDCtrl } from '@ibiz/model-core';
import { IApiMobMdCtrlState } from '../../state';
import { IApiMDControlController } from './i-api-md-control.controller';
import { IApiExportParams } from '../../common';

/**
 * 移动端多数据部件
 * @description 以列表形式展示内容，列表项整合图文、操作按钮等元素，呈现清晰的信息层级与视觉分隔。
 * @ctrlparams {name:showgroupanchor,title:显示分组导航区域,parameterType:boolean,defaultvalue:false,description:当部件以分组形式展示内容时，用于控制是否显示分组锚点导航,effectPlatform:mob}
 * @primary
 * @export
 * @interface IApiMobMDCtrlController
 * @extends {IApiMDControlController<T, S>}
 * @template T
 * @template S
 */
export interface IApiMobMDCtrlController<
  T extends IDEMobMDCtrl = IDEMobMDCtrl,
  S extends IApiMobMdCtrlState = IApiMobMdCtrlState,
> extends IApiMDControlController<T, S> {
  /**
   * @description 导出数据
   * @param {{
   *     event?: MouseEvent;
   *     params?: IApiExportParams;
   *   }} [args] 导出参数
   * @returns {*}  {Promise<void>}
   * @memberof IApiMobMDCtrlController
   */
  exportData(args?: {event?: MouseEvent; params?: IApiExportParams}): Promise<void>;
}
