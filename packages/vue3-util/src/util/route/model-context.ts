import { RuntimeError } from '@ibiz-template/core';

export interface ModelContext {
  psdevslnsys: string;
  pssystemid: string;
}

export interface ModelContextSnapshot {
  appData: IData;
  projection: unknown;
  context: ModelContext;
  token: unknown;
}

export class ModelContextError extends RuntimeError {
  readonly kind: 'unavailable' | 'changed';

  constructor(kind: 'unavailable' | 'changed') {
    super(ibiz.i18n.t(
      kind === 'unavailable'
        ? 'vue3Util.util.modelContextUnavailable'
        : 'vue3Util.util.modelContextChanged',
    ));
    this.kind = kind;
    this.name = 'ModelContextError';
  }
}

function unavailable(): ModelContextError {
  return new ModelContextError('unavailable');
}

function readProjection(value: unknown): ModelContext {
  if (!value || typeof value !== 'object' || Array.isArray(value) ||
      Reflect.ownKeys(value).length !== 2) throw unavailable();
  const context: IParams = {};
  for (const key of ['psdevslnsys', 'pssystemid']) {
    const field = Object.getOwnPropertyDescriptor(value, key);
    if (!field || !('value' in field) || typeof field.value !== 'string' ||
        !field.value || /[\s\u0000-\u001f\u007f]/.test(field.value)) {
      throw unavailable();
    }
    context[key] = field.value;
  }
  return context as ModelContext;
}

export function captureModelContext(): ModelContextSnapshot | undefined {
  const appData = ibiz.appData;
  if (!appData || !Object.prototype.hasOwnProperty.call(appData, 'srfmodelcontext')) {
    return undefined;
  }
  const field = Object.getOwnPropertyDescriptor(appData, 'srfmodelcontext');
  if (!field || !('value' in field)) throw unavailable();
  return {
    appData,
    projection: field.value,
    context: readProjection(field.value),
    token: ibiz.auth.getAuthInfo()?.token,
  };
}

export function bindModelContext(
  snapshot: ModelContextSnapshot | undefined,
  context: IParams,
): void {
  if (!snapshot || !Object.prototype.hasOwnProperty.call(context, 'psdevslnsys')) return;
  const current = ibiz.appData;
  const field = current && Object.getOwnPropertyDescriptor(current, 'srfmodelcontext');
  if (!field || !('value' in field)) throw unavailable();
  const projection = field.value;
  const value = readProjection(projection);
  const token = ibiz.auth.getAuthInfo()?.token;
  if (current !== snapshot.appData || projection !== snapshot.projection ||
      value.psdevslnsys !== snapshot.context.psdevslnsys ||
      value.pssystemid !== snapshot.context.pssystemid || token !== snapshot.token) {
    throw new ModelContextError('changed');
  }
  if (typeof token !== 'string' || !token ||
      context.psdevslnsys !== value.psdevslnsys ||
      ['pssystem', 'pssystemid'].some(key =>
        Object.prototype.hasOwnProperty.call(context, key) && context[key] !== value.pssystemid)) {
    throw unavailable();
  }
  Object.assign(context, { pssystem: value.pssystemid, pssystemid: value.pssystemid });
}
