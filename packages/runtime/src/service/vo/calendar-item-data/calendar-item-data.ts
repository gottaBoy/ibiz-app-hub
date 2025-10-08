import { ISysCalendarItem } from '@ibiz/model-core';
import { ICalendarItemData } from '../../../interface';

/**
 * 日历项数据
 *
 * @export
 * @class CalendarItemData
 * @implements {ICalendarItemData}
 */
export class CalendarItemData implements ICalendarItemData {
  constructor(
    private model: ISysCalendarItem,
    private data: IData,
  ) {}

  get deData(): IData {
    return this.data;
  }

  get navId(): string {
    return `${this.itemType}@${this.id}`;
  }

  get itemType(): string {
    return this.model.itemType!;
  }

  private _bkColor?: string;

  get bkColor(): string {
    const fieldName = this.model.bkcolorAppDEFieldId;
    return (
      this._bkColor ||
      (fieldName && this.data[fieldName]
        ? this.data[fieldName]
        : this.model.bkcolor)
    );
  }

  set bkColor(_val: string) {
    this._bkColor = _val;
  }

  get beginTime(): string {
    const fieldName = this.model.beginTimeAppDEFieldId;
    return fieldName ? this.data[fieldName] : undefined;
  }

  private _color?: string;

  get color(): string {
    const fieldName = this.model.colorAppDEFieldId;
    return (
      this._color ||
      (fieldName && this.data[fieldName]
        ? this.data[fieldName]
        : this.model.color)
    );
  }

  set color(_val: string) {
    this._color = _val;
  }

  get content(): string {
    const fieldName = this.model.contentAppDEFieldId;
    return fieldName ? this.data[fieldName] : undefined;
  }

  get endTime(): string {
    const fieldName = this.model.endTimeAppDEFieldId;
    return fieldName ? this.data[fieldName] : undefined;
  }

  get icon(): string {
    const fieldName = this.model.iconAppDEFieldId;
    return fieldName ? this.data[fieldName] : undefined;
  }

  get id(): string {
    const fieldName = this.model.idAppDEFieldId;
    return fieldName && this.data[fieldName]
      ? this.data[fieldName]
      : this.data.srfkey;
  }

  get level(): string {
    const fieldName = this.model.levelAppDEFieldId;
    return fieldName ? this.data[fieldName] : undefined;
  }

  get tag2(): string {
    const fieldName = this.model.tag2AppDEFieldId;
    return fieldName ? this.data[fieldName] : undefined;
  }

  get tag(): string {
    const fieldName = this.model.tagAppDEFieldId;
    return fieldName ? this.data[fieldName] : undefined;
  }

  get text(): string {
    const fieldName = this.model.textAppDEFieldId;
    return fieldName ? this.data[fieldName] : undefined;
  }

  get tips(): string {
    const fieldName = this.model.tipsAppDEFieldId;
    return fieldName ? this.data[fieldName] : undefined;
  }

  get srfkey(): string {
    return this.data.srfkey;
  }
}
