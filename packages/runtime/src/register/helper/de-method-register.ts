import { RuntimeError } from '@ibiz-template/core';
import { IAppDataEntity, IAppDEMethod } from '@ibiz/model-core';
import { getPluginRegisterKey } from './common-register';
import { IDEMethodProvider } from '../../interface';
import { CustomRegister } from '../custom-register';

/** 实体行为适配器前缀 */
export const DEMETHOD_PROVIDER_PREFIX = 'DEMETHOD';

/**
 * 注册实体行为适配器
 * @author lxm
 * @date 2023-05-06 09:14:16
 * @export
 * @param {string} key
 * @param {() => IDEMethodProvider} callback 生成实体行为适配器的回调
 */
export function registerDEMethodProvider(
  key: string,
  callback: () => IDEMethodProvider,
): void {
  ibiz.register.register(`${DEMETHOD_PROVIDER_PREFIX}_${key}`, callback);
}

function getProvider(key: string): IDEMethodProvider | undefined {
  return ibiz.register.get(
    `${DEMETHOD_PROVIDER_PREFIX}_${key}`,
  ) as IDEMethodProvider;
}

/**
 * 获取实体行为适配器
 * @author lxm
 * @date 2023-05-06 09:29:23
 * @export
 * @param {IAppView} model
 * @return {*}  {Promise<IDEMethodProvider>}
 */
export async function getDEMethodProvider(
  model: IAppDEMethod,
  entityModel?: IAppDataEntity,
): Promise<IDEMethodProvider> {
  let provider: IDEMethodProvider | undefined;
  const { methodType, sysPFPluginId, appId } = model as Required<IAppDEMethod>;
  const registerKey = CustomRegister.getRegisterKey(DEMETHOD_PROVIDER_PREFIX, {
    deMethodModel: model,
    entityModel,
  });
  provider = getProvider(registerKey);
  if (!provider) {
    ibiz.log.debug(
      ibiz.i18n.t('runtime.register.helper.customRegistration', {
        registerKey,
      }),
    );
  } else {
    return provider;
  }

  // 找插件适配器
  if (sysPFPluginId) {
    const pluginKey = await getPluginRegisterKey(sysPFPluginId, appId);
    if (pluginKey) {
      provider = getProvider(pluginKey);
    }
    if (!provider) {
      ibiz.log.warn(
        ibiz.i18n.t('runtime.register.helper.entityBehaviorPlugin', {
          pluginKey,
        }),
      );
    } else {
      return provider;
    }
  }

  // 找实体行为类型
  provider = getProvider(methodType);
  if (!provider) {
    throw new RuntimeError(
      ibiz.i18n.t('runtime.register.helper.entityBehaviorMethod', {
        methodType,
      }),
    );
  } else {
    return provider;
  }
}
