/**
 * @description 导出参数
 * @export
 * @interface IApiExportParams
 */
export interface IApiExportParams {
  /**
   * @description 导出类型，activatedPage: 导出当前页，selectedRows: 导出当前选中，maxRowCount: 导出全部，customPage: 自定义导出页
   * @type {('activatedPage' | 'selectedRows' | 'maxRowCount' | 'customPage')}
   * @memberof IApiExportParams
   */
  type?: 'activatedPage' | 'selectedRows' | 'maxRowCount' | 'customPage';

  /**
   * @description 自定义导出开始页，type为customPage时必填
   * @type {number}
   * @memberof IApiExportParams
   */
  startPage?: number;

  /**
   * @description 自定义导出结束页，type为customPage时必填
   * @type {number}
   * @memberof IApiExportParams
   */
  endPage?: number;
}
