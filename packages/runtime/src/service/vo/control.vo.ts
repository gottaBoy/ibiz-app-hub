import { createUUID } from 'qx-util';
import { clone, isNil } from 'ramda';
import { Srfuf } from '../constant';
import { UIMapField } from './ui-map-field';

const BuildInKeys = [
  'srfkey',
  'srfmajortext',
  'srfmajorfield',
  'srfkeyfield',
  'tempsrfkey',
  'srfuf',
  'srfdeid',
  'srfdecodename',
  'srfexdata',
];

/**
 * 部件UI显示层数据转换
 *
 * @author lxm
 * @date 2022-09-05 15:09:31
 * @export
 * @class ControlVO
 */
export class ControlVO {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string | symbol]: any;

  /**
   * 原始后台数据
   *
   * @author lxm
   * @date 2022-10-18 15:10:19
   * @private
   * @type {IData}
   */
  declare $origin: IData;

  /**
   * 属性映射集合
   *
   * @author lxm
   * @date 2022-10-18 15:10:33
   * @private
   * @type {Map<string, UIMapField>}
   */
  declare $dataUIMap: Map<string, UIMapField>;

  /**
   * 是否是新建数据，0为新建
   *
   * @author lxm
   * @date 2022-09-06 22:09:24
   * @type {Srfuf}
   */
  declare srfuf: Srfuf;

  /**
   * 主键
   *
   * @author lxm
   * @date 2022-09-07 19:09:42
   * @type {string}
   */
  declare srfkey?: string;

  /**
   * 临时主键
   *
   * @author lxm
   * @date 2022-09-07 19:09:42
   * @type {string}
   */
  declare tempsrfkey: string;

  /**
   * 主信息
   *
   * @author lxm
   * @date 2022-09-07 19:09:42
   * @type {string}
   */
  declare srfmajortext?: string;

  /**
   * 实体模型标识
   *
   * @author lxm
   * @date 2022-09-07 19:09:42
   * @type {string}
   */
  declare srfdeid: string;

  /**
   * 实体模型代码名称
   *
   * @author lxm
   * @date 2022-09-07 19:09:42
   * @type {string}
   */
  declare srfdecodename: string;

  /**
   * 实体主键属性
   *
   * @author lxm
   * @date 2022-09-07 19:09:42
   * @type {string}
   */
  declare srfkeyfield: string;

  /**
   * 实体主信息属性
   *
   * @author lxm
   * @date 2022-09-07 19:09:42
   * @type {string}
   */
  declare srfmajorfield: string;

  /**
   * @description 数据的状态（新建与否）
   * @protected
   * @type {(Srfuf | undefined)}
   * @memberof ControlVO
   */
  protected $srfuf: Srfuf | undefined;

  /**
   * Creates an instance of ControlVO.
   * @author lxm
   * @date 2022-09-05 15:09:10
   * @param {IData} origin 后台原始数据
   * @param {Map<string, string>} dataUIMap 转换映射map，key为转换后的属性，value为映射字段描述信息
   */
  constructor(
    $origin: IData = {},
    $dataUIMap: Map<string, UIMapField> = new Map(),
  ) {
    // 自身的属性
    Object.defineProperty(this, '$origin', {
      enumerable: false,
      configurable: true,
      value: $origin || {},
    });

    Object.defineProperty(this, '$dataUIMap', {
      enumerable: false,
      configurable: true,
      value: $dataUIMap || new Map(),
    });

    // srfactionparam属性改到源对象上去
    Object.defineProperty(this, 'srfactionparam', {
      get() {
        return this.$origin.srfactionparam;
      },
      set(val: unknown) {
        this.$origin.srfactionparam = val;
      },
      enumerable: true,
      configurable: true,
    });

    // 可读写的预置属性,主键属性和主文本属性
    ['srfkey', 'srfmajortext'].forEach(key => {
      if (Object.prototype.hasOwnProperty.call(this.$origin, key)) {
        Object.defineProperty(this, key, {
          get() {
            return this.$origin[key];
          },
          set(val: unknown) {
            this.$origin[key] = val;
          },
          enumerable: false,
          configurable: true,
        });
      } else if (this.$dataUIMap.has(key)) {
        const { dataKey } = this.$dataUIMap.get(key)!;
        Object.defineProperty(this, key, {
          get() {
            return this.$origin[dataKey];
          },
          set(val: unknown) {
            this.$origin[dataKey] = val;
          },
          enumerable: false,
          configurable: true,
        });
      } else {
        Object.defineProperty(this, key, {
          enumerable: false,
          configurable: true,
          writable: true,
          value: null,
        });
      }
    });

    // tempsrfkey临时主键
    if (Object.prototype.hasOwnProperty.call(this.$origin, 'tempsrfkey')) {
      // $origin有的操作$origin的属性
      Object.defineProperty(this, 'tempsrfkey', {
        get() {
          return this.$origin.tempsrfkey;
        },
        set(val: unknown) {
          this.$origin.tempsrfkey = val;
        },
        enumerable: false,
        configurable: true,
      });
    } else {
      // $$origin没有的自己赋值
      Object.defineProperty(this, 'tempsrfkey', {
        enumerable: false,
        configurable: true,
        writable: true,
        value: isNil(this.srfkey) ? createUUID() : this.srfkey,
      });
    }

    // 设置数据状态（新建与否）
    if (Object.prototype.hasOwnProperty.call(this.$origin, 'srfuf')) {
      this.$srfuf = this.$origin.srfuf;
    } else {
      this.$srfuf =
        this.srfkey === this.tempsrfkey ? Srfuf.UPDATE : Srfuf.CREATE;
    }
    Object.defineProperty(this, 'srfuf', {
      get() {
        return this.$srfuf;
      },
      set(val) {
        this.$srfuf = val;
      },
      enumerable: false,
      configurable: true,
    });

    // 只读的预置属性
    ['srfdeid', 'srfdecodename', 'srfkeyfield', 'srfmajorfield'].forEach(
      key => {
        Object.defineProperty(this, key, {
          get() {
            return this.$origin[key];
          },
          enumerable: false,
          configurable: true,
        });
      },
    );
    // 扩展数据
    Object.defineProperty(this, 'srfexdata', {
      enumerable: false,
      configurable: true,
      writable: true,
      value: {},
    });

    // 先转换映射的属性
    this.$dataUIMap.forEach((mapField, key) => {
      const value = mapField.dataKey;
      // 关联映射属性
      this.linkProperty(key, value, mapField);
    });

    // 映射属性里没有涉及到的建立直接关联，用于使用实体属性也要取到值的场景。
    Object.keys($origin).forEach(value => {
      if (!Object.prototype.hasOwnProperty.call(this, value)) {
        // 原始属性的键也能直接使用
        this.linkProperty(value, value);
      }
    });
  }

  /**
   * 关联实体属性
   *
   * @author lxm
   * @date 2022-10-18 15:10:48
   * @private
   * @param {string} uiKey 界面字段
   * @param {string} dataKey 数据字段
   * @param {boolean} [isOriginField=true] 是否是后台存储字段，是的话存取都在$origin里
   * @param {boolean} [forceNumber=false] 是否强制转换成数值，是的话set的时候转成数值
   * @returns {*}
   */
  private linkProperty(
    uiKey: string,
    dataKey: string,
    mapField?: UIMapField,
  ): void {
    const isOriginField = mapField ? mapField.isOriginField : true;
    const isOneToMultiField = mapField ? mapField.isOneToMultiField : false;
    //  预置的属性不做处理
    if (BuildInKeys.includes(uiKey)) {
      return;
    }

    // 如果是界面上多个字段对应一个属性字段时，解除界面字段和属性字段关联，由逻辑计算
    if (isOneToMultiField) {
      Object.defineProperty(this, uiKey, {
        enumerable: true,
        configurable: true,
        writable: true,
        value: this.$origin[dataKey],
      });
    } else if (
      isOriginField ||
      Object.prototype.hasOwnProperty.call(this.$origin, uiKey)
    ) {
      // 后台数据存在$origin里，其他存在ControlVo上
      Object.defineProperty(this, uiKey, {
        enumerable: true,
        configurable: true,
        get() {
          return this.$origin[dataKey];
        },
        set(val) {
          // 有mapField的走它的转换
          this.$origin[dataKey] = val;
        },
      });
    } else {
      Object.defineProperty(this, uiKey, {
        enumerable: true,
        configurable: true,
        writable: true,
        value: null,
      });
    }
  }

  /**
   * 获取原始数据
   *
   * @author lxm
   * @date 2022-09-05 15:09:52
   * @returns {*}
   */
  getOrigin(): IData {
    return this.$origin;
  }

  /**
   * 设置原始数据
   *
   * @author lxm
   * @date 2022-10-17 20:10:39
   * @param {IData} data
   */
  setOrigin(data: IData | ControlVO): void {
    this.$origin = data instanceof ControlVO ? data.getOrigin() : data;
  }

  /**
   * 克隆新的vo数据
   *
   * @author lxm
   * @date 2023-08-16 11:08:29
   * @return {*}  {ControlVO}
   */
  clone(): ControlVO {
    const cloneOrigin = clone(this.$origin);
    const newVal = new ControlVO(cloneOrigin, new Map([...this.$dataUIMap]));
    newVal.srfuf = this.srfuf;
    Object.keys(this).forEach(key => {
      newVal[key] = this[key];
    });
    return newVal;
  }
}
