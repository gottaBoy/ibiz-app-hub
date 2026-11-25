import { describe, expect, it } from 'vitest';
import {
  internalMessageNotificationTranslations,
  localizeInternalMessageHtml,
} from '../../src/util/user-message-util/internal-message-locale';

describe('internal message display localization', () => {
  it('translates fixed notification phrases only for English display', () => {
    const content =
      '<div class="notice-card"><span class="notice-card__event-desc">把你加入了产品</span>' +
      '<span class="notice-pilot-info"> · 产品管理 · 产品管理</span>' +
      '<span class="notice-card__object-name">产品🙂</span></div>';
    const localized = localizeInternalMessageHtml(content, 'en-US', 'product_member_create');
    expect(localized).toContain('Added you to the product');
    expect(localized).toContain('Product Management');
    expect(localized).toContain('Product Management · 产品管理');
    expect(localized).toContain('产品🙂');
    expect(localizeInternalMessageHtml(content, 'zh-CN', 'product_member_create')).toBe(content);
  });

  it('keeps unknown templates and stored content untouched', () => {
    const content = '<div><span>自定义通知：把你加入了产品</span></div>';
    expect(localizeInternalMessageHtml(content, 'en', 'custom')).toBe(content);
    expect(localizeInternalMessageHtml('', 'en', 'custom')).toBe('');
    expect(Object.keys(internalMessageNotificationTranslations)).toEqual([
      '把你加入了产品',
      '把你移除了产品',
      '归档了产品',
      '激活了产品',
      '删除了产品',
      '恢复了产品',
      '产品管理',
    ]);
  });
});
