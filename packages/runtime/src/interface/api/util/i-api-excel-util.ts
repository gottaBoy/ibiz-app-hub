import { IApiData } from '@ibiz-template/core';

/**
 * @description Excel工具类
 * @export
 * @interface IApiExcelUtil
 */
export interface IApiExcelUtil {
  /**
   * @description 导出成Excel文件
   * @param {{
   *     header: string[]; // 表头内容
   *     data: IApiData[]; // 数据内容
   *     filename: string; // 文件名称
   *     autoWidth: boolean; // 单元格是否自适应
   *   }} args 导出配置
   * @memberof IApiExcelUtil
   */
  exportJsonToExcel(args: {
    header: string[];
    data: IApiData[];
    filename: string;
    autoWidth: boolean;
  }): void;
}
