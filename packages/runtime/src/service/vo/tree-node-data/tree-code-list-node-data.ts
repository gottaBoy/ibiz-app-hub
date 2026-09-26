/* eslint-disable no-constructor-return */
import { IDETreeDataSetNode } from '@ibiz/model-core';
import { isNil } from 'ramda';
import { updateKeyDefine } from '@ibiz-template/core';
import { CodeListItem, ITreeNodeData } from '../../../interface';
import { calcDeCodeNameById } from '../../../model';
import { TreeNodeData } from './tree-node-data';

/**
 * 实体动态代码表树节点数据
 *
 * @export
 * @class TreeCodeListNodeData
 * @extends {TreeNodeData}
 * @implements {ITreeNodeData}
 */
export class TreeCodeListNodeData
  extends TreeNodeData
  implements ITreeNodeData
{
  _text: string;

  _id!: string;

  _value: string;

  declare _deData: IData;

  constructor(
    model: IDETreeDataSetNode,
    parentNodeData: ITreeNodeData | undefined,
    opts: {
      data: CodeListItem;
      leaf: boolean;
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
    this._text = data.text;
    this._value = data.value as string;

    // id小写
    const selfId = `${model.id}@${this._value}`.toLowerCase();
    Object.defineProperty(this, '_id', {
      get() {
        return this._parent ? `${this._parent._id}:${selfId}` : selfId;
      },
      enumerable: true,
      configurable: true,
    });

    // 实体节点额外添加上自己的实体上下文
    if (model.appDataEntityId) {
      const deName = calcDeCodeNameById(model.appDataEntityId);
      this._context = Object.assign(this._context || {}, {
        [deName]: this._value,
      });
    }

    this.srfkey = this._value;
    this.srfmajortext = this._text;
    this._icon = this.calcIcon(model, data.sysImage);

    const getDeKey = (key: string | symbol): string | symbol | undefined => {
      // deData属性上可枚举的属性，返回该属性名称
      if (Object.prototype.hasOwnProperty.call(this._deData, key)) {
        return key;
      }
    };

    return new Proxy<TreeCodeListNodeData>(this, {
      get(target, p, _receiver): unknown {
        const deKey = getDeKey(p);
        if (!isNil(deKey)) {
          return target._deData[deKey];
        }
        return (target as IData)[p];
      },
      // 修改操作
      set(target, p, value, _receiver): boolean {
        const deKey = getDeKey(p);
        if (!isNil(deKey)) {
          target._deData[deKey] = value;
        } else {
          (target as IData)[p] = value;
        }
        return true;
      },
      ownKeys(target): ArrayLike<string | symbol> {
        // 整合所有并排除重复
        const allKeys = [
          ...new Set([...Object.keys(target), ...Object.keys(target._deData)]),
        ];
        updateKeyDefine(target, allKeys);
        return allKeys;
      },
    });
  }

  /**
   * 获取原始数据
   */
  getOrigin(): IData {
    return this._deData;
  }
}
