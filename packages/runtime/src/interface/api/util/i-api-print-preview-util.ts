import { IApiContext, IApiParams } from '@ibiz-template/core';

/**
 * 打印预览功能类接口
 */
export interface IApiPrintPreviewUtil {
  /**
   * 执行打印
   * @param context
   * @param params
   * @param data
   * @returns 是否执行成功
   */
  execPrint(
    context: IApiContext,
    params: IApiParams,
    data: Blob,
  ): Promise<boolean>;
}
