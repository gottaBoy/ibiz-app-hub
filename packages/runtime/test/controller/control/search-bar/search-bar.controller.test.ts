import { describe, expect, test } from 'vitest';
import { mergeBackendSearchGroup } from '../../../../src/controller/control/search-bar/search-bar-group.util';

describe('SearchBarController backend group merge', () => {
  test('preserves a localized model caption for SYSTEM groups', () => {
    const target = {
      name: 'idea_all_grid_view',
      caption: 'All ideas',
      ownerType: 'SYSTEM',
      saved: false,
      show: true,
      order: 100,
      searchGroupData: {},
    } as never;

    mergeBackendSearchGroup(target, {
      ownerType: 'SYSTEM',
      caption: '全部需求',
      searchGroupData: { sort: 'update_time,desc' },
      show: false,
    });

    expect(target.caption).toBe('All ideas');
    expect(target.searchGroupData).toEqual({ sort: 'update_time,desc' });
    expect(target.show).toBe(false);
  });

  test('keeps persisted PERSONAL captions verbatim', () => {
    const target = {
      name: 'idea_all_grid_view___My group',
      caption: 'My group',
      ownerType: 'PERSONAL',
      saved: true,
      show: true,
      order: 100,
      searchGroupData: {},
    } as never;

    mergeBackendSearchGroup(target, {
      ownerType: 'PERSONAL',
      caption: '我的分组',
      searchGroupData: { sort: 'create_time,asc' },
    });

    expect(target.caption).toBe('我的分组');
    expect(target.searchGroupData).toEqual({ sort: 'create_time,asc' });
  });
});
