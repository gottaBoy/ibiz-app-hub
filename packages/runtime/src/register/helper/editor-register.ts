import { IControl, IControlItem, IEditor } from '@ibiz/model-core';
import { IEditorProvider } from '../../interface';
import { getPluginRegisterKey } from './common-register';
import { CustomRegister } from '../custom-register';

/** 编辑器适配器前缀 */
export const EDITOR_PROVIDER_PREFIX = 'EDITOR';

/**
 * 注册编辑器适配器
 * @author lxm
 * @date 2023-05-06 09:14:16
 * @export
 * @param {string} key
 * @param {() => IEditorProvider} callback 生成编辑器适配器的回调
 */
export function registerEditorProvider(
  key: string,
  callback: () => IEditorProvider,
): void {
  ibiz.register.register(`${EDITOR_PROVIDER_PREFIX}_${key}`, callback);
}

function getProvider(key: string): IEditorProvider | undefined {
  return ibiz.register.get(
    `${EDITOR_PROVIDER_PREFIX}_${key}`,
  ) as IEditorProvider;
}

/**
 * @description 获取编辑器适配器
 * @export
 * @param {IEditor} model 编辑器模型
 * @param {IControlItem} [ctrlItem] 控件项模型
 * @param {IControl} [ctrl] 部件模型
 * @returns {*}  {(Promise<IEditorProvider | undefined>)}
 */
export async function getEditorProvider(
  model: IEditor,
  ctrlItem?: IControlItem,
  ctrl?: IControl,
): Promise<IEditorProvider | undefined> {
  let provider: IEditorProvider | undefined;
  const { editorType, editorStyle, predefinedType, sysPFPluginId, appId } =
    model as Required<IEditor>;

  // 找自定义的编辑器适配器
  const registerKey = CustomRegister.getRegisterKey(EDITOR_PROVIDER_PREFIX, {
    controlItemModel: ctrlItem,
    controlModel: ctrl,
    editorModel: model,
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
        ibiz.i18n.t('runtime.register.helper.editorPlugin', {
          pluginKey,
        }),
      );
    } else {
      return provider;
    }
  }

  // 再找编辑器类型和编辑器样式
  if (editorStyle && editorStyle !== 'DEFAULT') {
    const key = `${editorType}_${editorStyle}`;
    provider = getProvider(key);
    if (!provider) {
      ibiz.log.warn(
        ibiz.i18n.t('runtime.register.helper.editorStyleType', {
          editorType,
          editorStyle,
        }),
        model,
      );
    } else {
      return provider;
    }
  }

  // 编辑器预置类型
  if (predefinedType) {
    let key = `${predefinedType}_${editorType}`;
    if (editorStyle && editorStyle !== 'DEFAULT') {
      key += `_${editorStyle}`;
    }
    provider = getProvider(key);
    if (!provider) {
      ibiz.log.warn(
        ibiz.i18n.t('runtime.register.helper.editorTypePredefinedType', {
          editorType,
          predefinedType,
        }),
        model,
      );
    } else {
      return provider;
    }
  }

  // 找编辑器类型
  provider = getProvider(editorType);
  if (!provider) {
    ibiz.log.warn(
      ibiz.i18n.t('runtime.register.helper.editorType', {
        editorType,
      }),
    );
  } else {
    return provider;
  }
}
