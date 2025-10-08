import { type Position } from '@vueuse/core';
import type RowItem from '@/models/data/row';
import type { RelationType, Relation } from '@/models/data/links';

declare interface LinkProps {
  from: string | number;
  to: string | number;
  relationType: RelationType;
  color?: string;
  [key: string]: unknown;
}

declare interface LinkingItem {
  startPos: Position;
  endPos: Position;
  isLinking: boolean;
  startRow: RowItem | null;
  endRow: RowItem | null;
  relation: Relation | null;
}
