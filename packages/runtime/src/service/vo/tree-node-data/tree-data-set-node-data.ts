/* eslint-disable no-constructor-return */
import { IDETreeDataSetNode, IDETreeNodeDataItem } from '@ibiz/model-core';
import { updateKeyDefine } from '@ibiz-template/core';
import { clone, isNil } from 'ramda';
import { IIcon, ITreeNodeData } from '../../../interface';
import { calcDeCodeNameById } from '../../../model';
import { ScriptFactory } from '../../../utils';
import { TreeNodeData } from './tree-node-data';
import { fieldValueToBoolean } from '../../utils';

/** 克隆时赋值排除的字段 */
const CloneExcludeKeys = [
  '_id',
  'srfnodeid',
  '_value',
  '_text',
  '_deData',
  'clone',
];

/**
 * 实体数据集树节点数据
 *
 * @export
 * @class TreeDataSetNodeData
 * @extends {TreeNodeData}
 * @implements {ITreeNodeData}
 */
export class TreeDataSetNodeData extends TreeNodeData implements ITreeNodeData {
  declare _text: string;

  declare _id: string;

  declare _value: string;

  declare _deData: IData;

  declare _oldDeData: IData;

  /**
   * 克隆方法
   * @author lxm
   * @date 2024-01-12 02:37:46
   */
  declare clone: () => TreeDataSetNodeData;

  constructor(
    model: IDETreeDataSetNode,
    parentNodeData: ITreeNodeData | undefined,
    opts: {
      data: IData;
      leaf: boolean; // 是否有子节点关系
      defaultExpand: boolean;
      context?: IContext;
      params?: IParams;
      navContext?: IParams;
      navParams?: IParams;
    },
  ) {
    super(model, parentNodeData, opts);

    const { data } = opts;
    this._deData = data;
    this._oldDeData = data.clone();
    const { idAppDEFieldId } = model;
    // id小写
    const selfId =
      `${model.id}@${data.srfkey || data[idAppDEFieldId!]}`.toLowerCase();
    Object.defineProperty(this, '_id', {
      get() {
        return this._parent ? `${this._parent._id}:${selfId}` : selfId;
      },
      enumerable: true,
      configurable: true,
    });

    // 文本值
    Object.defineProperty(this, '_text', {
      get() {
        return model.textAppDEFieldId
          ? this._deData[model.textAppDEFieldId]
          : this._deData.srfmajortext;
      },
      set(v) {
        if (model.textAppDEFieldId) {
          this._deData[model.textAppDEFieldId] = v;
        } else {
          this._deData.srfmajortext = v;
        }
      },
      enumerable: true,
      configurable: true,
    });

    // value值
    Object.defineProperty(this, '_value', {
      get() {
        return model.idAppDEFieldId
          ? this._deData[model.idAppDEFieldId]
          : this._deData.srfkey;
      },
      set(v) {
        if (model.idAppDEFieldId) {
          this._deData[model.idAppDEFieldId] = v;
        } else {
          this._deData.srfkey = v;
        }
      },
      enumerable: true,
      configurable: true,
    });

    // 实体节点额外添加上自己的实体上下文
    if (model.appDataEntityId) {
      const deName = calcDeCodeNameById(model.appDataEntityId);
      this._context = Object.assign(this._context || {}, {
        [deName]: data.srfkey,
      });
    }

    // 识别叶子节点标识属性，根据后台数据赋值leaf
    if (model.leafFlagAppDEFieldId) {
      this._leaf = fieldValueToBoolean(data[model.leafFlagAppDEFieldId]);
    } else if (model.childCntAppDEFieldId) {
      this._leaf = !fieldValueToBoolean(data[model.childCntAppDEFieldId]);
    }

    /** 数据项和实体属性映射 */
    const dataItemKeyMap = new Map<string | symbol, string | symbol>();
    const dataItemDefaultMap = new Map<string | symbol, unknown>();
    model.detreeNodeDataItems?.forEach(dataItem => {
      // 没有实体的数据项不处理，如操作列的数据项
      if (!dataItem.appDEFieldId) {
        return;
      }
      const dataItemKey = dataItem.id!.toLowerCase();

      // *后台实体属性
      const deFieldKey = dataItem.appDEFieldId!.toLowerCase();
      dataItemKeyMap.set(dataItemKey, deFieldKey);

      // *设置默认值
      if (dataItem.defaultValue) {
        dataItemDefaultMap.set(dataItemKey, dataItem.defaultValue);
      }
    });

    /** 表格列和数据项的映射 */
    const nodeColumnKeyMap = new Map<string | symbol, string | symbol>();
    model.detreeNodeColumns?.forEach(column => {
      // 只映射属性列
      if (column.columnType !== 'DEFGRIDCOLUMN') {
        return;
      }
      const columnKey = column.detreeColumnId!; // 不配树表格列不会有这个模型
      const dataItemKey = column.dataItemName; // 配了就一定有数据项名称
      if (!columnKey || !dataItemKey) {
        ibiz.log.error(
          ibiz.i18n.t('runtime.service.missingDetreeColumnId'),
          column,
        );
      } else {
        nodeColumnKeyMap.set(columnKey, dataItemKey);
      }
    });

    /** 预置属性映射 */
    const presetItemMap = new Map<string | symbol, string | symbol>();
    presetItemMap.set('srfuf', 'srfuf');

    /**
     * 获取对应key最终映射的实体属性字段，undefined就是没有映射实体属性
     * @author lxm
     * @date 2024-01-12 01:48:09
     * @param {(string | symbol)} key
     * @return {*}  {(string | symbol | undefined)}
     */
    const getDeKey = (key: string | symbol): string | symbol | undefined => {
      // 表格列映射的实体数据属性名称
      if (nodeColumnKeyMap.has(key)) {
        return dataItemKeyMap.get(nodeColumnKeyMap.get(key)!);
      }
      // 数据项映射的实体数据属性名称
      if (dataItemKeyMap.has(key)) {
        return dataItemKeyMap.get(key);
      }
      // 实体属性上可枚举的属性，返回该属性名称
      if (Object.prototype.hasOwnProperty.call(this._deData, key)) {
        return key;
      }
      // 预置属性映射，用于返回srfuf等get属性
      if (presetItemMap.has(key)) {
        return presetItemMap.get(key);
      }
    };

    /**
     * 获取对应属性的默认值，纯显示用的
     * @author lxm
     * @date 2024-01-12 02:36:53
     * @param {(string | symbol)} key
     * @return {*}  {unknown}
     */
    const getKeyDefault = (key: string | symbol): unknown => {
      // 表格列映射的数据项的默认值
      if (nodeColumnKeyMap.has(key)) {
        return dataItemDefaultMap.get(nodeColumnKeyMap.get(key)!);
      }
      // 数据项映射的默认值
      if (dataItemDefaultMap.has(key)) {
        return dataItemDefaultMap.get(key);
      }
    };

    this.clone = (): TreeDataSetNodeData => {
      const cloneData = clone(this._deData);
      const cloneNodeData = new TreeDataSetNodeData(model, this._parent, {
        data: cloneData,
        leaf: this._leaf,
        navContext: this._context,
        navParams: this._params,
        defaultExpand: this._defaultExpand,
      });
      Object.keys(this).forEach(key => {
        const deKey = getDeKey(key);
        // 非实体的映射属性，且不是排除的属性时，从原来那边赋值过来
        if (isNil(deKey) && !CloneExcludeKeys.includes(key)) {
          (cloneNodeData as IData)[key] = (this as IData)[key];
        }
      });
      return cloneNodeData;
    };

    return new Proxy<TreeDataSetNodeData>(this, {
      set(target, p, value): boolean {
        const deKey = getDeKey(p);
        if (!isNil(deKey)) {
          target._deData[deKey] = value;
        } else {
          (target as IData)[p] = value;
        }
        return true;
      },
      get(target, p, _receiver): unknown {
        const deKey = getDeKey(p);
        if (!isNil(deKey)) {
          return isNil(target._deData[deKey])
            ? getKeyDefault(p)
            : target._deData[deKey];
        }
        return (target as IData)[p];
      },
      ownKeys(target): ArrayLike<string | symbol> {
        // 整合所有并排除重复
        const allKeys = [
          ...new Set([
            ...Object.keys(target),
            ...dataItemKeyMap.keys(),
            ...Object.keys(target._deData),
          ]),
        ];
        updateKeyDefine(target, allKeys);
        return allKeys;
      },
    });
  }

  /**
   * 初始化异步数据
   * @param model 节点模型
   */
  public async initAsyncData(model: IDETreeDataSetNode): Promise<void> {
    await this.initIcon(model);
    await this.initTextHtml(model);
  }

  /**
   * 初始化节点图标
   * @author ljx
   * @date 2024-01-16 18:41:31
   * @protected
   * @param {IDETreeDataSetNode} model
   * @return {*}  {(Promise<undefined>)}
   */
  protected async initIcon(model: IDETreeDataSetNode): Promise<undefined> {
    const icon = this.calcIcon(model);
    if (!icon) return;
    const { detreeNodeDataItems } = model;
    const iconDataItem = detreeNodeDataItems?.find(item => item.id === 'icon');
    if (iconDataItem) {
      icon.htmlStr = await this.calcDataItemScript(iconDataItem);
    }
    this._icon = icon;
  }

  /**
   * 初始化节点文本html内容
   * @author ljx
   * @date 2024-01-16 18:41:31
   * @protected
   * @param {IDETreeDataSetNode} model
   * @return {*}  {(Promise<undefined>)}
   */
  protected async initTextHtml(model: IDETreeDataSetNode): Promise<undefined> {
    this._textHtml = await this.calcTextHtml(model);
  }

  protected calcIcon(model: IDETreeDataSetNode): IIcon | undefined {
    let icon = super.calcIcon(model) || {};
    const { iconAppDEFieldId } = model;
    if (iconAppDEFieldId && this._deData[iconAppDEFieldId]) {
      const value = this._deData[iconAppDEFieldId];
      icon = {};
      if (value.indexOf('fa-') !== -1) {
        icon.cssClass = value;
      } else {
        icon.imagePath = value;
      }
    }

    if (icon) {
      this._icon = icon;
    }
    return Object.values(icon).length > 0 ? icon : undefined;
  }

  /**
   * 计算节点数据项的自定义脚本内容
   * @author lxm
   * @date 2023-08-15 02:37:29
   * @protected
   * @param {IDETreeNodeDataItem} dataItem
   * @return {*}  {(string | undefined)}
   */
  protected async calcDataItemScript(
    dataItem: IDETreeNodeDataItem,
  ): Promise<string | undefined> {
    if (dataItem.customCode && dataItem.scriptCode) {
      const tempContext = Object.assign(
        this._fullContext || {},
        this._context || {},
      );
      const tempParams = Object.assign(
        this._fullParams || {},
        this._params || {},
      );
      return ScriptFactory.execScriptFn(
        { data: this._deData, context: tempContext, viewParam: tempParams },
        dataItem.scriptCode,
        {
          isAsync: true,
        },
      ) as string;
    }
  }

  /**
   * 计算节点文本html内容
   * @author lxm
   * @date 2023-08-15 02:41:31
   * @protected
   * @param {IDETreeDataSetNode} model
   * @return {*}  {(string | undefined)}
   */
  protected async calcTextHtml(
    model: IDETreeDataSetNode,
  ): Promise<string | undefined> {
    let html: string | undefined;
    const { detreeNodeDataItems } = model;
    const textDataItem = detreeNodeDataItems?.find(item => item.id === 'text');
    if (textDataItem) {
      html = await this.calcDataItemScript(textDataItem);
    }
    return html;
  }

  /**
   * 获取原始数据
   */
  getOrigin(): IData {
    return this._deData;
  }
}
