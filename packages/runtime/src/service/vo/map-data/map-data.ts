/* eslint-disable no-constructor-return */
import { ISysMapItem } from '@ibiz/model-core';
import { IMapData } from '../../../interface';

// 更新属性，缺的补充定义
function updateKeyDefine(target: IParams, keys: string[]): void {
  keys.forEach(key => {
    if (!Object.prototype.hasOwnProperty.call(target, key)) {
      Object.defineProperty(target, key, {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined,
      });
    }
  });
}

const AreaItemStyles: string[] = ['REGION', 'REGION2', 'REGION3', 'REGION4'];

export class MapData implements IMapData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string | symbol]: any;

  _id: string;

  _itemStyle: string;

  _mapItemId: string;

  _deData: IData;

  _longitude?: string = undefined;

  _latitude?: string = undefined;

  _areaCode?: string = undefined;

  _tooltip?: string = undefined;

  _value?: number = undefined;

  _text?: string = undefined;

  _symbol?: string = undefined;

  _bgcolor?: string = undefined;

  _color?: string = undefined;

  _borderColor?: string = undefined;

  _borderWidth?: number = undefined;

  _className?: string = undefined;

  constructor(deData: IData, mapItem: ISysMapItem) {
    const {
      id,
      itemStyle,
      sysCss,
      longitudeAppDEFieldId,
      latitudeAppDEFieldId,
      textAppDEFieldId,
      dataAppDEFieldId,
      data2AppDEFieldId,
      tipsAppDEFieldId,
      sysImage,
      altitudeAppDEFieldId,
      bkcolor,
      bkcolorAppDEFieldId,
      clsAppDEFieldId,
      color,
      colorAppDEFieldId,
      borderColor,
      borderWidth,
      contentAppDEFieldId,
      iconAppDEFieldId,
      idAppDEFieldId,
      tagAppDEFieldId,
      tag2AppDEFieldId,
    } = mapItem;

    const keyMap = new Map<string | symbol, string | symbol>();

    this._id = id + deData.srfkey;
    this._deData = deData;
    this._itemStyle = itemStyle!;

    this._mapItemId = id!;

    if (sysImage) {
      this._symbol = sysImage.rawContent || sysImage.imagePath;
    }
    if (sysCss) {
      this._className = sysCss.cssName;
    }
    if (bkcolor) {
      this._bgcolor = bkcolor;
    }
    if (color) {
      this._color = color;
    }
    if (borderColor) {
      this._borderColor = borderColor;
    }
    if (borderWidth) {
      this._borderWidth = borderWidth;
    }
    if (AreaItemStyles.includes(this._itemStyle)) {
      if (longitudeAppDEFieldId) {
        keyMap.set('_areaCode', longitudeAppDEFieldId);
      }
    } else {
      if (longitudeAppDEFieldId) {
        keyMap.set('_longitude', longitudeAppDEFieldId);
      }
      if (latitudeAppDEFieldId) {
        keyMap.set('_latitude', latitudeAppDEFieldId);
      }
    }
    if (tipsAppDEFieldId) {
      keyMap.set('_tooltip', tipsAppDEFieldId);
    }
    if (textAppDEFieldId) {
      keyMap.set('_text', textAppDEFieldId);
    }
    if (dataAppDEFieldId) {
      keyMap.set('_value', dataAppDEFieldId);
    }
    if (data2AppDEFieldId) {
      keyMap.set('_value2', data2AppDEFieldId);
    }
    if (altitudeAppDEFieldId) {
      keyMap.set('_height', altitudeAppDEFieldId);
    }
    if (bkcolorAppDEFieldId) {
      keyMap.set('_bgcolor', bkcolorAppDEFieldId);
    }
    if (clsAppDEFieldId) {
      keyMap.set('_className', clsAppDEFieldId);
    }
    if (colorAppDEFieldId) {
      keyMap.set('_color', colorAppDEFieldId);
    }
    if (contentAppDEFieldId) {
      keyMap.set('_content', contentAppDEFieldId);
    }
    if (iconAppDEFieldId) {
      keyMap.set('_icon', iconAppDEFieldId);
    }
    if (idAppDEFieldId) {
      keyMap.set('_id', idAppDEFieldId);
    }
    if (tagAppDEFieldId) {
      keyMap.set('_tag', tagAppDEFieldId);
    }
    if (tag2AppDEFieldId) {
      keyMap.set('_tag2', tag2AppDEFieldId);
    }

    return new Proxy<MapData>(this, {
      set(target, p, value): boolean {
        if (Object.prototype.hasOwnProperty.call(deData, p)) {
          deData[p] = value;
        } else if (keyMap.has(p)) {
          deData[keyMap.get(p)!] = value;
        } else {
          target[p] = value;
        }
        return true;
      },

      get(target, p, _receiver): unknown {
        if (target[p] !== undefined) {
          return target[p];
        }
        if (keyMap.has(p)) {
          return deData[keyMap.get(p)!];
        }
        if (deData[p] !== undefined) {
          return deData[p];
        }
      },

      ownKeys(target): ArrayLike<string | symbol> {
        // 整合所有并排除重复
        const allKeys = [
          ...new Set([...Object.keys(target), ...Object.keys(deData)]),
        ];
        updateKeyDefine(target, allKeys);
        return allKeys;
      },
    });
  }
}
