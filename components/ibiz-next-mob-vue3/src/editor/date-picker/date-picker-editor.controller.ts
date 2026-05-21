import { EditorController } from '@ibiz-template/runtime';
import { IDatePicker } from '@ibiz/model-core';

/**
 * 选项框列表编辑器控制器
 * @return {*}
 * @author: zhujiamin
 * @Date: 2022-08-25 10:57:58
 */
export class DatePickerEditorController extends EditorController<IDatePicker> {
  /**
   * 占位
   * @return {*}
   * @author: zhujiamin
   * @Date: 2022-08-25 14:33:14
   */
  public placeHolder = '请选择日期';

  /**
   * 根据编辑器类型获取格式化
   *
   * @author lxm
   * @date 2022-11-03 16:11:21
   * @protected
   * @returns {*}  {string}
   */
  getFormatByType(editorType: string | undefined): string {
    switch (editorType) {
      // 时间选择器
      case 'MOBDATE':
      case 'DATEPICKER':
        return 'YYYY-MM-DD hh:mm:ss';
      // 时间选择控件
      case 'MOBDATE_SECOND':
      case 'DATEPICKEREX_SECOND':
        return 'YYYY-MM-DD hh:mm:ss';
      // 时间选择控件_无小时
      case 'MOBDATE_NOTIME':
      case 'DATEPICKEREX_NOTIME':
        return 'YYYY-MM-DD';
      // 时间选择控件_小时
      case 'MOBDATE_HOUR':
      case 'DATEPICKEREX_HOUR':
        return 'YYYY-MM-DD hh';
      // 时间选择控件_分钟
      case 'MOBDATE_MINUTE':
      case 'DATEPICKEREX_MINUTE':
        return 'YYYY-MM-DD hh:mm';
      // 时间选择控件_无日期
      case 'MOBDATE_NODAY':
      case 'DATEPICKEREX_NODAY':
        return 'hh:mm:ss';
      // 时间选择控件_无日期无秒钟
      case 'MOBDATE_NODAY_NOSECOND':
      case 'DATEPICKEREX_NODAY_NOSECOND':
        return 'hh:mm';
      default:
        return 'YYYY-MM-DD hh:mm:ss';
    }
  }

  /**
   * 值格式化
   *
   * @readonly
   * @type {(string | undefined)}
   * @memberof DatePickerEditorController
   */
  get valueFormat(): string | undefined {
    if (super.valueFormat) {
      return super.valueFormat;
    }
    if (this.model.dateTimeFormat) {
      return this.model.dateTimeFormat;
    }
    return this.getFormatByType(this.model.editorType);
  }
}
