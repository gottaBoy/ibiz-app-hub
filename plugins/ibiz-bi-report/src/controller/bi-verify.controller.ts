import { ISchemaField } from '../interface';
import { biReportT, biReportDefaultText } from '../locale';

/**
 * 校验控制器
 *
 * @export
 * @class BIVerifyController
 */
export class BIVerifyController {
  /**
   * 校验规则Map
   *
   * @private
   * @memberof BIVerifyController
   */
  private verifyMap: Map<string, Function> = new Map();

  /**
   * 当前图表类型属性配置
   *
   * @private
   * @type {IData}
   * @memberof BIVerifyController
   */
  private config: IData = {};

  /**
   * 当前Schema数据集
   *
   * @private
   * @type {Array<ISchemaField>}
   * @memberof BIVerifyController
   */
  private schemaFields: Array<ISchemaField> = [];

  /**
   * Creates an instance of BIVerifyController.
   * @param {ISchemaField[]} schemaFields
   * @param {IData[]} config 传递的是配置里的data.details
   * @memberof BIVerifyController
   */
  constructor() {
    this.initVerifyMap();
  }

  /**
   * 初始化校验规则
   *
   * @private
   * @memberof BIVerifyController
   */
  private initVerifyMap() {
    this.verifyMap.set('ENABLECALC', this.checkEnableDragCalcField);
    this.verifyMap.set('MAXLIMIT', this.checkLimit);
    this.verifyMap.set('TYPELIMIT', this.checkTypeLimit);
    this.verifyMap.set('REQUIRE', this.checkRequire);
  }

  /**
   * 初始化schemaFields属性和图表配置
   *
   * @param {Array<ISchemaField>} schemaFields
   * @param {IData} [config={}]
   * @memberof BIVerifyController
   */
  public init(schemaFields: Array<ISchemaField>, config: IData = {}) {
    this.schemaFields = schemaFields;
    this.config = config;
  }

  /**
   * 根据传递的标识校验错误
   *
   * @param {string} name
   * @param {unknown} value
   * @param {string[]} tags
   * @return {*}
   * @memberof BIVerifyController
   */
  public verifyState(
    name: string,
    value: unknown,
    tags: string[],
    opts?: IData,
  ): IData {
    // 校验所有规则
    let keys = ['ENABLECALC', 'MAXLIMIT', 'TYPELIMIT', 'REQUIRE'];
    let result: IData = {
      ok: true,
      msg: '',
    };
    if (tags && tags.length !== 0) {
      keys = tags;
    }
    keys.some((key: string) => {
      const func = this.verifyMap.get(key);
      if (func) {
        const res = func(name, value, this.schemaFields, this.config, {
          ...opts,
          that: this,
        });
        if (res && !res.ok) {
          result = res;
          return true;
        }
      }
      return false;
    });
    return result;
  }

  /**
   * 检查是否符合必填要求
   *
   * @private
   * @param {string} _name
   * @param {unknown} _value
   * @return {*}
   * @memberof BIVerifyController
   */
  private checkRequire(
    _name: string,
    _value: unknown,
    _schemaFields: ISchemaField[],
    _config: IData,
    _opts: IData,
  ) {
    const tempConfig = _config.details.find((item: IData) => {
      return item.id === _name;
    });
    if (tempConfig && tempConfig.required) {
      if (!_value || (_value && Array.isArray(_value) && _value.length === 0)) {
        return {
          ok: false,
          get msg() {
            return biReportT('required', {
              caption: biReportDefaultText(tempConfig.caption)
                .split('/')[0]
                .trim(),
            });
          },
        };
      }
    }
    return {
      ok: true,
      msg: '',
    };
  }

  /**
   * 检查是否达到最大选择数量
   *
   * @private
   * @param {string} _name
   * @param {unknown} _value
   * @return {*}  {{
   *     ok: boolean;
   *     msg: string;
   *   }}
   * @memberof BIVerifyController
   */
  private checkLimit(
    _name: string,
    _value: unknown,
    _schemaFields: ISchemaField[],
    _config: IData,
    _opts: IData,
  ): {
    ok: boolean;
    msg: string;
  } {
    const tempConfig = _config.details.find((item: IData) => {
      return item.id === _name;
    });
    const successResult = {
      ok: true,
      msg: '',
    };
    if (!tempConfig) {
      return successResult;
    }
    const targetConfig = tempConfig.details[0];
    if (!targetConfig || !targetConfig.multiple) {
      return successResult;
    }

    if (_value && Array.isArray(_value)) {
      if (_value.length >= targetConfig.max) {
        return {
          ok: false,
          get msg() {
            return biReportT('maxItems', {
              caption: biReportDefaultText(targetConfig.caption)
                .split('/')[0]
                .trim(),
              max: targetConfig.max,
            });
          },
        };
      }
    }
    return successResult;
  }

  /**
   * 校验拖入类型是否符合配置要求
   *
   * @private
   * @param {IData} args
   * @return {*}  {{
   *     ok: boolean;
   *     msg: string;
   *   }}
   * @memberof BIVerifyController
   */
  private checkTypeLimit(
    _name: string,
    _value: unknown,
    _schemaFields: ISchemaField[],
    _config: IData,
    _opts: IData,
  ): {
    ok: boolean;
    msg: string;
  } {
    const { targetItem, that } = _opts;
    const tempConfig = _config.details.find((item: IData) => {
      return item.id === _name;
    });
    const successResult = {
      ok: true,
      msg: '',
    };
    if (!tempConfig || !targetItem) {
      return successResult;
    }
    const targetConfig = tempConfig.details[0];
    if (!targetConfig.typeLimit) {
      return successResult;
    }
    const failResult = {
      ok: false,
      get msg() {
        return biReportT('unsupportedDimension', {
          caption: biReportDefaultText(
            targetConfig.subCaption || targetConfig.caption,
          ),
        });
      },
    };

    const fid = targetItem?.psdefid?.split('.').at(-1);
    const { tag, types } = targetConfig.typeLimit;
    if (types.includes('DATE')) {
      const isDate = that.checkIsDate(targetItem);
      if (tag === 'IN' && isDate) {
        return successResult;
      }
      if (tag === 'NOTIN' && isDate) {
        return failResult;
      }
    }
    const target = _schemaFields.find((item: IData) => {
      return item.appDEFieldId === fid;
    });
    if (!target) {
      return failResult;
    }

    let ok = types.includes(target.type.toUpperCase());
    if (tag === 'NOTIN') {
      ok = !ok;
    }
    if (ok) {
      return successResult;
    }
    return failResult;
  }

  /**
   * 判断的当前项是否为日期项
   *
   * @private
   * @param {IData} item
   * @return {*}
   * @memberof BIVerifyController
   */
  private checkIsDate(item: IData) {
    if (item && (item.stddatatype === 27 || item.stddatatype === 5)) {
      return true;
    }
    return false;
  }

  /**
   * 检查是否允许拖入计算属性
   *
   * @private
   * @param {string} name
   * @param {unknown} _value
   * @param {ISchemaField[]} _schemaFields
   * @param {IData} _config
   * @param {IData} _opts
   * @memberof BIVerifyController
   */
  private checkEnableDragCalcField(
    _name: string,
    _value: unknown,
    _schemaFields: ISchemaField[],
    _config: IData,
    _opts: IData,
  ): {
    ok: boolean;
    msg: string;
  } {
    const tempConfig = _config.details.find((item: IData) => {
      return item.id === _name;
    });
    const successResult = {
      ok: true,
      msg: '',
    };
    if (!tempConfig) {
      return successResult;
    }
    const targetConfig = tempConfig.details[0];
    if (!targetConfig.disableCalcField) {
      return successResult;
    }
    const failResult = {
      ok: false,
      get msg() {
        return biReportT('unsupportedDimension', {
          caption: biReportDefaultText(
            targetConfig.subCaption || targetConfig.caption,
          ),
        });
      },
    };
    const { targetItem } = _opts;
    if (targetItem) {
      if (
        targetItem.bidimensiontype &&
        targetItem.bidimensiontype !== 'COMMON' &&
        targetConfig.disableCalcField
      ) {
        return failResult;
      }
    }
    return successResult;
  }
}
