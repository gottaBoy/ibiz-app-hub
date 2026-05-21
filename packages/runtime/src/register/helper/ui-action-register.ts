import { RuntimeError } from '@ibiz-template/core';
import { IAppUIAction } from '@ibiz/model-core';
import { IUIActionProvider } from '../../interface';
import { getPluginRegisterKey } from './common-register';
import { CustomRegister } from '../custom-register';

/** 界面行为适配器前缀 */
export const UIACTION_PROVIDER_PREFIX = 'UIACTION';

/**
 * 注册界面行为适配器
 * @author lxm
 * @date 2023-05-06 09:14:16
 * @export
 * @param {string} key
 * @param {() => IUIActionProvider} callback 生成界面行为适配器的回调
 */
export function registerUIActionProvider(
  key: string,
  callback: () => IUIActionProvider,
): void {
  ibiz.register.register(`${UIACTION_PROVIDER_PREFIX}_${key}`, callback);
}

function getProvider(key: string): IUIActionProvider | undefined {
  return ibiz.register.get(
    `${UIACTION_PROVIDER_PREFIX}_${key}`,
  ) as IUIActionProvider;
}

/**
 * 获取界面行为适配器
 * @author lxm
 * @date 2023-05-06 09:29:23
 * @export
 * @param {IAppView} model
 * @return {*}  {Promise<IUIActionProvider>}
 */
export async function getUIActionProvider(
  model: IAppUIAction,
): Promise<IUIActionProvider> {
  let provider: IUIActionProvider | undefined;
  const { uiactionMode, sysPFPluginId, appId, uiactionTag } =
    model as Required<IAppUIAction>;
  // 找自定义注册的适配器
  const registerKey = CustomRegister.getRegisterKey(UIACTION_PROVIDER_PREFIX, {
    uiActionModel: model,
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
        ibiz.i18n.t('runtime.register.helper.interfaceBehaviorPlugin', {
          pluginKey,
        }),
      );
    } else {
      return provider;
    }
  }

  // 先通过uiactionTag找界面行为适配器
  provider = getProvider(`${uiactionMode}_${uiactionTag}`);
  if (provider) {
    return provider;
  }

  // 找界面行为类型
  provider = getProvider(uiactionMode);
  if (!provider) {
    throw new RuntimeError(
      ibiz.i18n.t('runtime.register.helper.interfaceBehaviorMode', {
        uiactionMode,
      }),
    );
  } else {
    return provider;
  }
}
