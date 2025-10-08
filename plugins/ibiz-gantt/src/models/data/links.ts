/* eslint-disable max-classes-per-file */
import { uuid } from '@/utils/common';
import type RowItem from './row';
import { type LinkProps } from '@/typings/link';
import Variables from '@/constants/vars';

// eslint-disable-next-line no-shadow
export enum Relation {
  /**
   * 开始
   */
  START = 'S',
  /**
   * 结束
   */
  END = 'E',
}

// eslint-disable-next-line no-shadow
export enum RelationType {
  /**
   * 开始 → 开始（start to start, SS）
   */
  SS = 'SS',
  /**
   * 开始 → 结束（start to end, SE）
   */
  SE = 'SE',
  /**
   * 结束 → 开始（end to start, ES）
   */
  ES = 'ES',
  /**
   * 结束 → 结束（end to end, EE）
   */
  EE = 'EE',
}

export class LinkItem {
  originLink: LinkProps;

  fromRow: RowItem;

  toRow: RowItem;

  uuid: string;

  color: string;

  relationType: RelationType;

  constructor(link: LinkProps, from: RowItem, to: RowItem) {
    this.uuid = uuid();

    this.originLink = link;
    this.fromRow = from;
    this.toRow = to;
    this.color = link?.color || '';
    this.relationType = link.relationType || RelationType.ES;
  }
}

export default class AllLinks {
  /**
   * 原始数据集合（全部）
   */
  originLinks: LinkProps[] = [];

  /**
   * 内部使用代理数据（只有展示的）
   */
  links: LinkItem[] = [];

  /**
   * 数据配置
   *
   * @type {DataOptions}
   * @memberof AllData
   */
  options: linkOptions = {
    fromField: Variables.default.linkProps.fromKey,
    toField: Variables.default.linkProps.toKey,
    idField: Variables.default.linkProps.linkKey,
    relationTypeField: Variables.default.linkProps.relationTypeKey,
  };

  /**
   * 格式化成连线需要的数据格式
   *
   * @param {any[]} links
   * @return {*}  {LinkProps[]}
   * @memberof AllLinks
   */
  formatData(links: any[]): LinkProps[] {
    const { fromField, toField, idField, relationTypeField } = this.options;
    return links.map(link => {
      return {
        from: link[fromField] || link.from,
        to: link[toField] || link.to,
        id: link[idField] || link.id,
        relationType: link[relationTypeField] || link.relationType,
      } as LinkProps;
    });
  }

  /**
   * 初始化数据
   * @param data 展示的数据集合
   */
  init(data: RowItem[], links: LinkProps[], options?: linkOptions): void {
    if (options) this.options = options;
    const _links = this.formatData(links);
    this.originLinks = _links;
    this.links = this.createLinks(data, _links);
  }

  /**
   * 创建连线数据
   */
  createLinks(data: RowItem[], links: LinkProps[]): LinkItem[] {
    return links
      .map(link => {
        const from = data.find(d => d.id === link.from);
        const to = data.find(d => d.id === link.to);
        // 开始点或结束点没有绘制滑块时不显示链接线
        if (from && to && from.isShowSlider() && to.isShowSlider()) {
          return new LinkItem(link, from, to);
        }
        return null;
      })
      .filter(link => link !== null) as LinkItem[];
  }

  /**
   * 更新连线
   * @param data 展示的数据集合
   * @param links 新数据（原始）。如果不传，则使用原始数据更新当前已有
   */
  update(data: RowItem[], links?: LinkProps[]): void {
    this.init(data, links ?? this.originLinks);
  }

  /**
   * 创建一条连线
   */
  createLink(
    from: RowItem,
    to: RowItem,
    relationType: RelationType,
  ): LinkProps | null | any {
    if (from.uuid === to.uuid) {
      return null;
    }

    const link = {
      from: from.id,
      to: to.id,
      relationType,
    };

    if (this.isDuplicate(from, to)) {
      return { ...link, isDuplicate: true };
    }
    return link;
  }

  /**
   * 添加一条连线
   */
  addLink(link: LinkProps, from: RowItem, to: RowItem): void {
    if (!link.from || !link.to) return;
    if (this.originLinks.some(l => l.from === link.from && l.to === link.to))
      return;

    this.originLinks.push(link);
    this.links.push(new LinkItem(link, from, to));
  }

  /**
   * 更新一条连线
   */
  updateLink(link: LinkProps): void {
    if (!link.from || !link.to) return;

    const index = this.originLinks.findIndex(
      l => l.from === link.from && l.to === link.to,
    );

    if (index > -1) {
      this.originLinks.splice(index, 1, link);

      const linkIndex = this.links.findIndex(
        l => l.fromRow.id === link.from && l.toRow.id === link.to,
      );

      if (linkIndex > -1) {
        this.links.splice(
          linkIndex,
          1,
          new LinkItem(
            link,
            this.links[linkIndex].fromRow,
            this.links[linkIndex].toRow,
          ),
        );
      }
    }
  }

  /**
   * 当前连线是否为重复的
   */
  isDuplicate(from: RowItem, to: RowItem): boolean {
    return this.links.some(
      _link => _link.fromRow.uuid === from.uuid && _link.toRow.uuid === to.uuid,
    );
  }

  /**
   * 关系是否有效
   */
  isRelationValid(_link: LinkItem): boolean {
    const fromStartDate = _link.fromRow.start;
    const fromEndDate = _link.fromRow.end;
    const toStartDate = _link.toRow.start;
    const toEndDate = _link.toRow.end;

    switch (_link.relationType) {
      case RelationType.SS: // 开始后才开始
        return fromStartDate.compareTo(toStartDate) !== 'r';

      case RelationType.SE: // 开始后才结束
        return fromStartDate.compareTo(toEndDate) !== 'r';

      case RelationType.ES: // 结束后才开始
        return fromEndDate.compareTo(toStartDate) !== 'r';

      case RelationType.EE: // 结束后才结束
        return fromEndDate.compareTo(toEndDate) !== 'r';

      default:
        return true;
    }
  }
}
