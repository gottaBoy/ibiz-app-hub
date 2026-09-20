import { describe, expect, test, vi } from 'vitest';
import { SearchBarService } from '../../../../src/controller/control/search-bar/search-bar.service';

describe('SearchBarService theme persistence API', () => {
  test('uses the PLM view theme setting service endpoint', async () => {
    const post = vi.fn().mockResolvedValue({
      ok: true,
      data: [],
    });
    const service = new SearchBarService(
      {
        appId: 'plmweb',
      } as never,
      'work_items',
    );
    service.app = {
      net: { post },
    } as never;

    await service.fetch();

    expect(post).toHaveBeenCalledWith(
      '/view_theme_settings/fetch_cur_user_all',
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
});
