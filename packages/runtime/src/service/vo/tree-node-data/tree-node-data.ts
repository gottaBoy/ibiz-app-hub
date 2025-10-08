import { IDETreeNode } from '@ibiz/model-core';
import { createUUID } from 'qx-util';
import { isBase64Image } from '@ibiz-template/core';
import { IIcon, ITreeNodeData } from '../../../interface';

/**
 * 树节点数据基类
 *
 * @export
 * @abstract
 * @class TreeNodeData
 */
export abstract class TreeNodeData implements ITreeNodeData {
  _uuid: string = createUUID();

  _nodeType: string;

  _id!: string;

  srfnodeid!: string;

  _value?: string | undefined;

  _text!: string;

  _children?: ITreeNodeData[] | undefined;

  _deData?: IData | undefined;

  _oldDeData?: IData | undefined;

  _changedOnly: boolean;

  srfkey?: string | undefined;

  srfmajortext?: string | undefined;

  _nodeId: string;

  _leaf: boolean = false;

  _defaultExpand: boolean = false;

  _draggable: boolean = false;

  _context?: IParams;

  _params?: IParams;

  _parent?: ITreeNodeData;

  _icon?: IIcon;

  _textHtml?: string;

  _disableSelect?: boolean;

  srfcollapsestate: -1 | 0 | 1 = -1;

  constructor(
    model: IDETreeNode,
    parentNodeData: ITreeNodeData | undefined,
    opts: {
      leaf: boolean;
      defaultExpand: boolean;
      navContext?: IParams;
      navParams?: IParams;
    },
  ) {
    this._leaf = opts.leaf === true;
    this._defaultExpand = opts.defaultExpand === true;
    this._parent = parentNodeData;
    this._nodeType = model.treeNodeType!;
    this._disableSelect = model.disableSelect === true;
    this._changedOnly = model.enableRowEditChangedOnly === true;
    // 节点勾选了拖动、拖入、排序时允许拖拽
    this._draggable = !!(
      model?.allowDrag ||
      model?.allowDrop ||
      model?.allowOrder
    );

    // 所有节点都要继承父的上下文，如果父存在则复制父的资源上下文，否则返回空对象。
    if (this._parent) {
      this._context = { ...this._parent._context };
    }

    // 附加导航上下文和视图参数
    if (opts.navContext) {
      this._context = Object.assign(this._context || {}, opts.navContext);
    }

    if (opts.navParams) {
      this._params = { ...opts.navParams };
    }

    this._nodeId = model.id!;

    Object.defineProperty(this, 'srfnodeid', {
      get() {
        return this._id;
      },
      enumerable: true,
      configurable: true,
    });

    let srfcollapsestate = opts.defaultExpand === true ? 1 : 0;

    Object.defineProperty(this, 'srfcollapsestate', {
      get() {
        if (this._leaf) return -1;
        return srfcollapsestate;
      },
      set(state: 0 | 1) {
        if (!this._leaf) srfcollapsestate = state;
      },
      enumerable: true,
      configurable: true,
    });
  }

  /**
   * 计算节点图标
   * @author lxm
   * @date 2023-08-15 02:24:55
   * @protected
   * @param {IDETreeNode} model
   * @return {*}  {(IIcon | undefined)}
   */
  protected calcIcon(model: IDETreeNode): IIcon | undefined {
    const { sysImage } = model;
    const icon: IIcon = {};
    if (sysImage) {
      if (sysImage.cssClass) {
        icon.cssClass = sysImage.cssClass;
      }
      if (sysImage.imagePath) {
        icon.imagePath = sysImage.imagePath;
      }
      if (sysImage.rawContent) {
        if (isBase64Image(sysImage.rawContent)) {
          icon.imagePath = sysImage.rawContent;
        } else {
          icon.htmlStr = sysImage.rawContent;
        }
      }
    }
    return Object.values(icon).length > 0 ? icon : undefined;
  }

  /**
   * 获取改变数据
   * @author zzq
   * @date 2024-03-25 14:24:55
   * @return {*}  {(IData | undefined)}
   * @memberof TreeNodeData
   */
  getDiffData(): IData | undefined {
    if (this._deData && this._oldDeData) {
      const diffData: IData = {};
      Object.keys(this._deData).forEach(key => {
        // 值不一致 || 属性为主键
        if (
          this._deData![key] !== this._oldDeData![key] ||
          key === this._deData!.srfkeyfield
        ) {
          diffData[key] = this._deData![key];
        }
      });
      diffData.srfkey = this._deData.srfkey;
      return diffData;
    }
    return this._deData;
  }
}
