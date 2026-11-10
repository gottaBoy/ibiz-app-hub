import { afterEach, describe, expect, test, vi } from 'vitest';
import { SearchBarService } from '../../../../src/controller/control/search-bar/search-bar.service';

describe('SearchBarService theme persistence API', () => {
  afterEach(() => vi.unstubAllGlobals());

  test('uses the PLM extension endpoint for fetching themes', async () => {
    const post = vi.fn().mockResolvedValue({
      ok: true,
      data: [],
    });
    const service = new SearchBarService(
      {
        appDataEntityId: 'plmweb.work_item',
      } as never,
      'work_items',
    );
    vi.stubGlobal('ibiz', {
      hub: { getApp: () => ({ net: { post } }) },
    });
    await service.init({ srfappid: 'ibizplm__plmweb' } as never);

    await service.fetch();

    expect(post).toHaveBeenCalledWith(
      '/extension/app_view_themes/fetch_cur_user_all',
      {
        searchconds: [
          {
            condop: 'EQ',
            condtype: 'DEFIELD',
            fieldname: 'app_view_tag',
            value: 'work_items',
          },
        ],
        sort: 'create_time,asc',
      },
    );
  });

  test('uses the same PLM extension endpoint for theme details', async () => {
    const get = vi.fn().mockResolvedValue({
      ok: true,
      data: { id: 'theme-id', caption: 'My theme' },
    });
    const service = new SearchBarService(
      { appDataEntityId: 'plmweb.work_item' } as never,
      'work_items',
    );
    vi.stubGlobal('ibiz', {
      hub: { getApp: () => ({ net: { get } }) },
    });
    await service.init({ srfappid: 'ibizplm__plmweb' } as never);

    await service.get('theme-id');

    expect(get).toHaveBeenCalledWith('/extension/app_view_themes/theme-id');
  });

  test('preserves the existing endpoint for other apps', async () => {
    const get = vi.fn().mockResolvedValue({
      ok: true,
      data: { id: 'theme-id' },
    });
    const service = new SearchBarService(
      { appDataEntityId: 'otherapp.work_item' } as never,
      'work_items',
    );
    vi.stubGlobal('ibiz', {
      hub: { getApp: () => ({ net: { get } }) },
    });
    await service.init({ srfappid: 'otherapp' } as never);

    await service.get('theme-id');

    expect(get).toHaveBeenCalledWith('/view_theme_settings/theme-id');
  });
});
