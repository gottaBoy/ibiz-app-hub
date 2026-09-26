/* eslint-disable no-shadow */
import { IControlItem } from '@ibiz/model-core';
import { h, type VNode, resolveComponent } from 'vue';
import { IControlController, ScriptFactory } from '@ibiz-template/runtime';

/**
 * @description 位置
 * @export
 * @enum {string}
 */
export enum TooltipPlacement {
  TOP = 'top',
  TOP_START = 'top-start',
  TOP_END = 'top-end',
  BOTTOM = 'bottom',
  BOTTOM_START = 'bottom-start',
  BOTTOM_END = 'bottom-end',
  LEFT = 'left',
  LEFT_START = 'left-start',
  LEFT_END = 'left-end',
  RIGHT = 'right',
  RIGHT_START = 'right-start',
  RIGHT_END = 'right-end',
}

/**
 * @description 触发方式
 * @export
 * @enum {string}
 */
export enum TooltipTrigger {
  HOVER = 'hover',
  CLICK = 'click',
  FOCUS = 'focus',
  CONTEXTMENU = 'contextmenu',
}

export type TooltipContent = string | VNode | (() => VNode);

/**
 * @description tooltip配置
 * @export
 * @interface TooltipOptions
 */
export interface TooltipOptions {
  /**
   * @description 内容
   * @type {TooltipContent}
   * @memberof TooltipOptions
   */
  content: TooltipContent;
  /**
   * @description 位置
   * @default 'top'
   * @type {TooltipPlacement}
   * @memberof TooltipOptions
   */
  placement?: TooltipPlacement;
  /**
   * @description 触发方式
   * @default 'hover'
   * @type {TooltipTrigger}
   * @memberof TooltipOptions
   */
  trigger?: TooltipTrigger;
  /**
   * @description 出现位置的偏移量
   * @type {number}
   * @memberof TooltipOptions
   */
  offset?: number;
  /**
   * @description 为 Tooltip 的 popper 添加类名
   * @type {string}
   * @memberof TooltipOptions
   */
  popperClass?: string;
  /**
   * @description 为 Tooltip 的 popper 添加自定义样式
   * @type {string}
   * @memberof TooltipOptions
   */
  popperStyle?: string;
  /**
   * @description 是否有箭头
   * @default true
   * @type {boolean}
   * @memberof TooltipOptions
   */
  showArrow?: boolean;
  /**
   * @description 禁用
   * @type {boolean}
   * @memberof TooltipOptions
   */
  disabled?: boolean;
}

/**
 * @description 绘制tooltip
 * @export
 * @param {IData} data 数据
 * @param {IControlItem} model 部件项模型
 * @param {IControlController} ctrl 部件控制器
 * @param {string} [tooltipId = `${model.id?.toLowerCase()}_tooltip`] tooltip标识[默认部件项模型标识]
 * @returns {*}  {TooltipOptions}
 */
export function renderTooltip(
  data: IData,
  model: IControlItem,
  ctrl: IControlController,
  tooltipId = `${model.id?.toLowerCase()}_tooltip`,
): TooltipOptions {
  const options: TooltipOptions = {
    content: '',
    disabled: true,
    placement: TooltipPlacement.TOP,
  };
  const { controlRenders = [], id } = model;
  const defaultTooltip = `${id?.toLowerCase()}_tooltip`;
  let render = controlRenders.find(renderItem => renderItem.id === tooltipId);
  // 如果找不到指定标识的tooltip，则找默认的tooltip
  if (!render && tooltipId !== defaultTooltip)
    render = controlRenders.find(
      renderItem => renderItem.id === defaultTooltip,
    );
  if (render) {
    if (render.renderType === 'LAYOUTPANEL_MODEL' && render.layoutPanelModel) {
      let renderCode = render.layoutPanelModel;
      // 兼容单行脚本
      if (!renderCode.includes('return')) renderCode = `return (${renderCode})`;
      options.content = ScriptFactory.execScriptFn(
        {
          ...ctrl.getEventArgs(),
          data,
          model,
        },
        renderCode,
        { isAsync: false },
      ) as string;
      options.disabled = false;
    } else if (render.renderType === 'LAYOUTPANEL' && render.layoutPanel) {
      options.content = h(resolveComponent('IBizControlShell'), {
        data,
        params: ctrl.params,
        context: ctrl.context,
        modelData: render.layoutPanel,
      });
      options.disabled = false;
    }
  }
  return options;
}
