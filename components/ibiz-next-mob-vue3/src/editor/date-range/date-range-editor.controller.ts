import { EditorController } from '@ibiz-template/runtime';
import { IDateRange } from '@ibiz/model-core';

/**
 * 时间范围编辑器控制器
 *
 * @export
 * @class DateRangeEditorController
 * @extends {EditorController}
 */
export class DateRangeEditorController extends EditorController<IDateRange> {
  /**
   * 展现模式
   *
   * @type {('DEFAULT' | 'CALENDAR')}
   * @memberof DateRangeEditorController
   */
  public showmode: 'DEFAULT' | 'CALENDAR' = 'DEFAULT';

  /**
   * 初始化
   *
   * @protected
   * @return {*}  {Promise<void>}
   * @memberof DateRangeEditorController
   */
  protected async onInit(): Promise<void> {
    super.onInit();
    if (!this.placeHolder) {
      this.placeHolder = ibiz.i18n.t('editor.dateRangePicker.selectRange');
    }
    if (this.editorParams?.SHOWMODE === 'CALENDAR') {
      this.showmode = 'CALENDAR';
    }
    if (this.editorParams?.showmode === 'CALENDAR') {
      this.showmode = 'CALENDAR';
    }
  }

  /**
   * 根据编辑器类型获取格式化
   *
   * @author lxm
   * @date 2022-11-03 16:11:21
   * @public
   * @returns {*}  {string}
   */
  public getFormatByType(): string {
    switch (this.model.editorType) {
      // 时间范围选择器
      case 'MOBDATERANGE':
      case 'DATERANGE':
        return 'YYYY-MM-DD hh:mm:ss';
      // 时间范围选择器（YYYY-MM-DD）
      case 'MOBDATERANGE_NOTIME':
      case 'DATERANGE_NOTIME':
        return 'YYYY-MM-DD';
      default:
        return 'YYYY-MM-DD hh:mm:ss';
    }
  }

  /**
   * 值格式化
   *
   * @readonly
   * @type {(string | undefined)}
   * @memberof DateRangeEditorController
   */
  get valueFormat(): string | undefined {
    if (this.model.dateTimeFormat) {
      return this.model.dateTimeFormat;
    }
    if (super.valueFormat) {
      return super.valueFormat;
    }
    return this.getFormatByType();
  }
}
