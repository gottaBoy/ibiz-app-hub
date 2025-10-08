import { StringUtil } from '@ibiz-template/core';
import { isArray } from 'lodash-es';
import { IApiGlobalWaterMarkConfig, IApiWaterMarkUtil } from '../../interface';
import { WaterMarkManager } from './water-mark-manager/water-mark-manager';

/**
 * @description 水印工具类
 * @export
 * @class WaterMarkUtil
 * @implements {IApiWaterMarkUtil}
 */
export class WaterMarkUtil implements IApiWaterMarkUtil {
  mount(
    option: Partial<IApiGlobalWaterMarkConfig>,
    container?: HTMLElement,
    context?: IContext,
    params?: IParams,
    data?: IData,
  ): null | (() => void) {
    // 水印未启用时不执行挂载
    if (!option?.enable) return null;

    const _opts = { ...option };
    if (_opts.text) {
      // 动态文本解析
      _opts.text = isArray(_opts.text)
        ? _opts.text.map(_textItem =>
            StringUtil.fill(_textItem, context, params, data),
          )
        : StringUtil.fill(_opts.text, context, params, data);
    }
    const waterMarkManager = new WaterMarkManager(
      _opts as IApiGlobalWaterMarkConfig,
      container,
    );
    return () => waterMarkManager.destroy();
  }
}
