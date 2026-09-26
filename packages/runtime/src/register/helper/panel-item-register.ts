import {
  IAppView,
  IPanel,
  IPanelContainer,
  IPanelField,
  IPanelItem,
  IPanelRawItem,
} from '@ibiz/model-core';
import { IPanelItemProvider } from '../../interface';
import { getPluginRegisterKey } from './common-register';
import { CustomRegister } from '../custom-register';

/** 面板成员适配器前缀 */
export const PANELITEM_PROVIDER_PREFIX = 'PANELITEM';

/**
 * 注册面板成员适配器
 * @author lxm
 * @date 2023-05-06 09:14:16
 * @export
 * @param {string} key 忽略大小写
 * @param {() => IPanelItemProvider} callback 生成面板成员适配器的回调
 */
export function registerPanelItemProvider(
  key: string,
  callback: () => IPanelItemProvider,
): void {
  ibiz.register.register(
    `${PANELITEM_PROVIDER_PREFIX}_${key.toUpperCase()}`,
    callback,
  );
}

function getProvider(key: string): IPanelItemProvider | undefined {
  return ibiz.register.get(
    `${PANELITEM_PROVIDER_PREFIX}_${key.toUpperCase()}`,
  ) as IPanelItemProvider;
}

/**
 * 获取面板成员适配器
 * @author lxm
 * @date 2023-05-06 09:29:23
 * @export
 * @param {IAppView} model
 * @return {*}  {Promise<IPanelItemProvider>}
 */
export async function getPanelItemProvider(
  model: IPanelItem,
  panelModel: IPanel,
  viewModel: IAppView,
): Promise<IPanelItemProvider | undefined> {
  let provider: IPanelItemProvider | undefined;
  const { itemType, sysPFPluginId, appId, controlRenders, id } =
    model as Required<IPanelItem>;

  // 找自定义注册的适配器
  const registerKey = CustomRegister.getRegisterKey(PANELITEM_PROVIDER_PREFIX, {
    controlItemModel: model,
    controlModel: panelModel,
    viewModel,
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
        ibiz.i18n.t('runtime.register.helper.panelMemberPlugin', {
          pluginKey,
        }),
      );
    } else {
      return provider;
    }
  }
  const renders = controlRenders?.filter(render => render.id !== `${id?.toLowerCase()}_tooltip`) || [];
  if (renders.length > 0) {
    // 默认预定义 绘制器
    provider = getProvider('PREDEFINE_RENDER');
  } else {
    // 特殊容器类型
    if (itemType === 'CONTAINER') {
      const predefinedType =
        (model as IPanelContainer).predefinedType || 'DEFAULT';
      const key = `CONTAINER_${predefinedType}`;
      provider = getProvider(key);
      if (!provider) {
        ibiz.log.warn(
          ibiz.i18n.t('runtime.register.helper.panelContainerPredefined', {
            predefinedType,
            key,
          }),
        );
      } else {
        return provider;
      }
    }

    // 特殊直接内容类型
    if (itemType === 'RAWITEM') {
      const predefinedType =
        (model as IPanelRawItem).rawItem?.predefinedType || 'DEFAULT';
      const key = `RAWITEM_${predefinedType}`;
      provider = getProvider(key);
      if (!provider) {
        ibiz.log.warn(
          ibiz.i18n.t('runtime.register.helper.panelMemberDirectContent', {
            predefinedType,
            key,
          }),
        );
      } else {
        return provider;
      }
    }

    if (itemType === 'FIELD') {
      const { editor } = model as IPanelField;
      if (editor && editor.predefinedType) {
        const key = `FIELD_${editor.predefinedType.toUpperCase()}`;
        provider = getProvider(key);
        if (provider) {
          return provider;
        }
      }
    }

    // 特殊部件占位
    if (itemType === 'CTRLPOS') {
      const key = `CTRLPOS_${id?.toUpperCase()}`;
      provider = getProvider(key);
      if (provider) {
        return provider;
      }
    }
    // 找面板成员类型
    provider = getProvider(itemType);
  }

  if (!provider) {
    ibiz.log.warn(
      ibiz.i18n.t('runtime.register.helper.panelMemberType', {
        itemType,
      }),
    );
  } else {
    return provider;
  }
}
