/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { ExtractPropTypes } from 'vue';
import { isBoolean } from 'lodash';
import type RowItem from '@/models/data/row';
import { useStore } from '@/store';
import rootProps from '@/components/root/rootProps';
import { Relation } from '@/models/data/links';

export default () => {
  const { linking, $links, $data, showLink } = useStore();

  function initLinks(links: any[], props: ExtractPropTypes<typeof rootProps>) {
    const options: linkOptions = {
      fromField: props.linkProps.fromKey,
      toField: props.linkProps.toKey,
      idField: props.linkProps.linkKey,
      relationTypeField: props.linkProps.relationTypeKey,
    };
    $links.init($data.flatData, links, options);
  }

  function updateLinks(links: any[]) {
    $links.update($data.flatData, links);
  }

  function setLinking(params: {
    isLinking?: boolean;
    startPos?: { x: number; y: number };
    endPos?: { x: number; y: number };
    startRow?: RowItem | null;
    endRow?: RowItem | null;
    relation?: Relation | null;
  }) {
    if (isBoolean(params.isLinking)) linking.isLinking = params.isLinking;
    if (params.startPos) linking.startPos = params.startPos;
    if (params.endPos) linking.endPos = params.endPos;
    if (params.startRow !== undefined) linking.startRow = params.startRow;
    if (params.endRow !== undefined) linking.endRow = params.endRow;
    if (params.relation !== undefined) linking.relation = params.relation;
  }

  function setShowLink(_type: boolean) {
    showLink.value = _type;
  }

  return {
    $links,
    initLinks,
    linking,
    setLinking,
    updateLinks,
    showLink,
    setShowLink,
  };
};
