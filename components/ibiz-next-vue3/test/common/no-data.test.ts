/* eslint-disable import/no-extraneous-dependencies */
import { afterEach, expect, test, vi } from 'vitest';
import { reactive } from 'vue';
import { IBizNoData } from '../../src/common/no-data/no-data';

vi.mock('@ibiz-template/vue3-util', () => ({
  useNamespace: () => ({ b: () => 'ibiz-no-data' }),
}));

afterEach(() => vi.unstubAllGlobals());

test('default empty state resolves the active locale at instance creation time', () => {
  let english = true;
  const translate = vi.fn(() => (english ? 'No data available' : '暂无数据'));
  vi.stubGlobal('ibiz', { i18n: { t: translate } });
  const defaultText = IBizNoData.props.text.default;
  expect(defaultText()).toBe('No data available');
  english = false;
  expect(defaultText()).toBe('暂无数据');
  expect(translate).toHaveBeenCalledWith(
    'control.common.currentNoData',
    '暂无数据',
  );
});

test('explicit text and resource labels update without replacing business-authored messages', () => {
  const translate = vi.fn(
    (_key: string, fallback: string) => `Translated: ${fallback}`,
  );
  vi.stubGlobal('ibiz', { i18n: { t: translate } });
  const props = reactive({
    text: 'Customer supplied text',
    emptyTextLanguageRes: undefined,
    hideNoDataImage: false,
  });
  const state = IBizNoData.setup!(props as never, {} as never) as {
    label: { value: string };
  };
  expect(state.label.value).toBe('Customer supplied text');
  expect(translate).not.toHaveBeenCalled();
  props.text = 'Updated message';
  expect(state.label.value).toBe('Updated message');
  Object.assign(props, { emptyTextLanguageRes: { lanResTag: 'custom.empty' } });
  expect(state.label.value).toBe('Translated: Updated message');
  expect(translate).toHaveBeenCalledWith('custom.empty', 'Updated message');
});
