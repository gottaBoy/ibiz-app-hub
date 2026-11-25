const notificationTranslations: Record<string, string> = {
  把你加入了产品: 'Added you to the product',
  把你移除了产品: 'Removed you from the product',
  归档了产品: 'Archived the product',
  激活了产品: 'Activated the product',
  删除了产品: 'Deleted the product',
  恢复了产品: 'Restored the product',
  产品管理: 'Product Management',
};
const productTemplateEvents: Record<string, string[]> = {
  product_member_create: ['把你加入了产品'],
  product_member_remove: ['把你移除了产品'],
  product_archived_or_activate: ['归档了产品', '激活了产品'],
  product_remove_or_recover: ['删除了产品', '恢复了产品'],
};

function isEnglish(language: string): boolean {
  return /^en(?:[-_]|$)/i.test(language);
}

/** Localize fixed notification phrases without changing stored message content. */
export function localizeInternalMessageHtml(
  content: string,
  language: string,
  messageType: string,
): string {
  const allowedEvents = Object.prototype.hasOwnProperty.call(
    productTemplateEvents,
    messageType,
  )
    ? productTemplateEvents[messageType]
    : undefined;
  if (
    !isEnglish(language) ||
    !allowedEvents ||
    !content ||
    !/[\u3400-\u9fff]/u.test(content) ||
    typeof DOMParser === 'undefined'
  ) {
    return content;
  }
  const document = new DOMParser().parseFromString(content, 'text/html');
  const events = document.querySelectorAll(
    '.notice-card .notice-card__event-desc',
  );
  if (events.length !== 1) return content;
  const event = events[0];
  const original = event.textContent || '';
  if (
    event.children.length ||
    !allowedEvents.includes(original.trim()) ||
    event.closest('script,style,code,pre,textarea')
  ) {
    return content;
  }
  event.textContent = original.replace(
    original.trim(),
    notificationTranslations[original.trim()],
  );
  const pilot = event.closest('.notice-card')?.querySelector('.notice-pilot-info');
  if (pilot && !pilot.children.length) {
    pilot.textContent = (pilot.textContent || '').replace(
      /^(\s*·\s*)产品管理(\s*·)/u,
      `$1${notificationTranslations['产品管理']}$2`,
    );
  }
  return document.body.innerHTML;
}

export const internalMessageNotificationTranslations = notificationTranslations;
