import { createUUID } from 'qx-util';
import { IGanttNodeLinkData, IGanttNodeData } from '../../../interface';

export class GanttNodeLinkData implements IGanttNodeLinkData {
  _uuid: string = createUUID();

  declare _from: string;

  declare _to: string;

  declare _fromValue: string;

  declare _toValue: string;

  declare _deData: IData;

  declare _fromData: IGanttNodeData;

  declare _toData: IGanttNodeData;

  constructor(opts: {
    fromDataItemName: string;
    toDataItemName: string;
    fromData: IGanttNodeData;
    toData: IGanttNodeData;
    data: IData;
  }) {
    const { data, fromData, toData, fromDataItemName, toDataItemName } = opts;
    this._deData = data;
    this._fromData = fromData;
    this._toData = toData;

    Object.defineProperty(this, '_from', {
      get() {
        return this._fromData._id;
      },
      enumerable: true,
      configurable: true,
    });

    Object.defineProperty(this, '_to', {
      get() {
        return this._toData._id;
      },
      enumerable: true,
      configurable: true,
    });

    // fromValue值
    Object.defineProperty(this, '_fromValue', {
      get() {
        return this._deData[fromDataItemName];
      },
      set(v) {
        this._deData[fromDataItemName] = v;
      },
      enumerable: true,
      configurable: true,
    });
    // toValue值
    Object.defineProperty(this, '_toValue', {
      get() {
        return this._deData[toDataItemName];
      },
      set(v) {
        this._deData[toDataItemName] = v;
      },
      enumerable: true,
      configurable: true,
    });
  }
}
