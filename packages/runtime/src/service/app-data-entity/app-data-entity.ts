/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-constructor-return */
/* eslint-disable max-classes-per-file */
import { IAppDataEntity } from '@ibiz/model-core';
import { clone, isNil } from 'ramda';
import { DataTypes } from '@ibiz-template/core';
import { createUUID } from 'qx-util';
import { Srfuf } from '../constant';
import { findModelChild } from '../../model';
import { IDataEntity } from '../../interface';

/**
 * 实体
 *
 * @author chitanda
 * @date 2022-08-17 22:08:49
 * @export
 * @class AppDataEntity
 */
export class AppDataEntity implements IDataEntity {
  [key: string | symbol]: any;

  protected declare _data: IData;

  protected declare _entity: IAppDataEntity;

  declare srfdeid: string;

  declare srfdecodename: string;

  declare srfkeyfield: string;

  declare srfmajorfield: string;

  declare srfkey: string;

  declare srfmajortext: string;

  declare tempsrfkey: string;

  declare srfordervalue: number;

  declare srfunionkey: string;

  get srfuf(): Srfuf {
    return this.srfkey === this.tempsrfkey ? Srfuf.UPDATE : Srfuf.CREATE;
  }

  /**
   * Creates an instance of AppDataEntity.
   *
   * @author chitanda
   * @date 2023-11-16 15:11:08
   * @param {IAppDataEntity} entity
   * @param {(IData | AppDataEntity)} [data={}]
   */
  constructor(entity: IAppDataEntity, data: IData | AppDataEntity = {}) {
    Object.defineProperty(this, '_entity', {
      enumerable: false,
      configurable: true,
      value: entity,
    });
    Object.defineProperty(this, '_data', {
      enumerable: false,
      configurable: true,
      value: data instanceof AppDataEntity ? clone(data._data) : clone(data),
    });
    Object.defineProperty(this, 'srfdeid', {
      get() {
        return entity.id;
      },
    });
    Object.defineProperty(this, 'srfdecodename', {
      get() {
        return entity.codeName;
      },
    });

    // 主键属性相关
    const keyAppField = findModelChild(
      entity.appDEFields || [],
      entity.keyAppDEFieldId!,
    );
    if (keyAppField) {
      const key = keyAppField.codeName!.toLowerCase();
      Object.defineProperty(this, 'srfkeyfield', {
        get() {
          return key;
        },
      });
      Object.defineProperty(this, 'srfkey', {
        set(val: unknown) {
          this._data[key] = val;
        },
        get() {
          return this._data[key];
        },
      });
    } else {
      ibiz.log.warn(
        ibiz.i18n.t('runtime.service.noConfiguredPrimary', {
          codeName: entity.codeName,
        }),
      );
    }
    const majorAppField = findModelChild(
      entity.appDEFields || [],
      entity.majorAppDEFieldId!,
    );

    // 主文本属性相关
    if (majorAppField) {
      const major = majorAppField.codeName!.toLowerCase();
      Object.defineProperty(this, 'srfmajorfield', {
        get() {
          return major;
        },
      });
      Object.defineProperty(this, 'srfmajortext', {
        set(val: unknown) {
          this._data[major] = val;
        },
        get() {
          return this._data[major];
        },
      });
    } else {
      ibiz.log.warn(
        ibiz.i18n.t('runtime.service.noConfiguredField', {
          codeName: entity.codeName,
        }),
      );
    }

    // 设置临时主键
    Object.defineProperty(this, 'tempsrfkey', {
      enumerable: false,
      configurable: true,
      writable: true,
      value: isNil(this.srfkey) ? createUUID() : this.srfkey,
    });

    // 设置联合主键（存在联合主键属性集合才有值）
    Object.defineProperty(this, 'srfunionkey', {
      enumerable: false,
      configurable: true,
      writable: true,
      value: '',
    });

    this.defineProperties();
  }

  /**
   * 代理实际数据
   *
   * @author chitanda
   * @date 2022-10-11 22:10:55
   * @protected
   */
  protected defineProperties(): void {
    const { _data, convertVal } = this;
    const properties: { [key: string]: PropertyDescriptor } = {};
    // fix：odoo#0059
    const excludeKeys = [
      '_entity',
      '_data',
      'srfdeid',
      'srfdecodename',
      'srfkeyfield',
      'srfkey',
      'srfmajorfield',
      'srfmajortext',
      'tempsrfkey',
      'srfunionkey',
    ];
    const keys = Object.keys(_data);
    keys.forEach(key => {
      if (excludeKeys.indexOf(key) === -1) {
        properties[key] = {
          enumerable: true,
          set(val: unknown): void {
            _data[key] = val;
          },
          get(): any {
            return _data[key];
          },
        };
      }
    });
    this._entity.appDEFields?.forEach(field => {
      const key = field.codeName!.toLowerCase();
      properties[key] = {
        enumerable: true,
        set(val: unknown): void {
          _data[key] = convertVal(val, field.stdDataType);
        },
        get(): any {
          return _data[key];
        },
      };
      // 初始值转换
      _data[key] = convertVal(_data[key], field.stdDataType);
    });
    Object.defineProperties(this, properties);
  }

  /**
   * 克隆数据
   *
   * @author chitanda
   * @date 2022-10-11 00:10:15
   * @return {*}  {AppDataEntity}
   */
  clone(): AppDataEntity {
    const entity = new AppDataEntity(this._entity, this._data);
    entity.srfkey = this.srfkey;
    entity.srfordervalue = this.srfordervalue;
    entity.srfunionkey = this.srfunionkey;
    return entity;
  }

  /**
   * 合并参数
   *
   * @author chitanda
   * @date 2022-10-19 11:10:25
   * @param {(IData | AppDataEntity)} data
   * @return {*}  {AppDataEntity}
   */
  assign(data: IData | AppDataEntity): AppDataEntity {
    let _data: IData = {};
    if (data instanceof AppDataEntity) {
      _data = data._data;
      this.srfordervalue = data.srfordervalue;
    } else {
      _data = data;
    }
    Object.keys(_data).forEach(key => {
      if (_data[key] === undefined) {
        delete _data[key];
      }
    });
    Object.assign(this._data, _data);
    return this;
  }

  /**
   * 根据属性的数据类型转换值
   * @author lxm
   * @date 2023-09-25 03:37:28
   * @protected
   * @param {unknown} value
   * @param {(number | undefined)} dataType
   * @return {*}  {unknown}
   */
  protected convertVal(value: unknown, dataType: number | undefined): unknown {
    // 空值不转换
    if (value == null) {
      return value;
    }

    // 没有数据类型的给原值
    if (isNil(dataType)) {
      return value;
    }

    // 数值转换
    if (DataTypes.isNumber(dataType)) {
      const numVal = !isNil(value) && value !== '' ? Number(value) : value;

      if (Number.isNaN(numVal)) {
        // 不能转换的给原值
        ibiz.log.debug(
          ibiz.i18n.t('runtime.service.convertedNumber', {
            value,
          }),
        );
        return value;
      }
      return numVal;
    }

    return value;
  }
}
