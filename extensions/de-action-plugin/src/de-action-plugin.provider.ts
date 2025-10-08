import {
  IAppDEService,
  IDEMethodCreateOptions,
  IDEMethodProvider,
  Method,
} from '@ibiz-template/runtime';
import { IAppDataEntity, IAppDEMethod } from '@ibiz/model-core';
import { DeActionPlugin } from './de-action-plugin';
import { FetchPlugin } from './fetch-plugin';

export class DeActionPluginProvider implements IDEMethodProvider {
  create(
    service: IAppDEService,
    entity: IAppDataEntity,
    method: IAppDEMethod,
    opts: IDEMethodCreateOptions,
  ): Method {
    if (method.methodType === 'FETCH') {
      return new FetchPlugin(service, entity, method, opts.localMode);
    }
    return new DeActionPlugin(service, entity, method, opts.localMode);
  }
}
