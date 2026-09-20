import { install as installCore } from '@ibiz-template/core';
import { RegisterCenter } from '../src/register/register-center';
import { install as installRuntime } from '../src';

installCore();
globalThis.ibiz = window.ibiz;
globalThis.ibiz.i18n = {
  t: (key: string, params?: IData) =>
    `${key} ${params ? JSON.stringify(params) : ''}`,
} as never;
globalThis.ibiz.register = new RegisterCenter();
installRuntime();
