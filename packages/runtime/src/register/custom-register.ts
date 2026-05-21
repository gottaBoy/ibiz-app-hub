import { calcDeCodeNameById } from '../model';
import { IRegisterParams } from '../interface';
import {
  CONTROL_PROVIDER_PREFIX,
  DEMETHOD_PROVIDER_PREFIX,
  EDITOR_PROVIDER_PREFIX,
  FORMDETAIL_PROVIDER_PREFIX,
  GRIDCOLUMN_PROVIDER_PREFIX,
  PANELITEM_PROVIDER_PREFIX,
  UIACTION_PROVIDER_PREFIX,
} from './helper';

/**
 * 自定义注册
 */
export class CustomRegister {
  /**
   * 获取适配器注册key
   *
   * @author ljx
   * @date 2024-04-16 23:08:08
   * @param {string} registerType
   * @param {IRegisterParams} opts
   * @return {string}
   */
  static getRegisterKey(registerType: string, opts: IRegisterParams): string {
    switch (registerType) {
      case PANELITEM_PROVIDER_PREFIX:
        return this.calcKeyByView(opts);
      case FORMDETAIL_PROVIDER_PREFIX:
      case GRIDCOLUMN_PROVIDER_PREFIX:
      case CONTROL_PROVIDER_PREFIX:
        return this.calcKeyByCtrl(opts);
      case UIACTION_PROVIDER_PREFIX:
        return this.calcKeyByAction(opts);
      case DEMETHOD_PROVIDER_PREFIX:
        return this.calcKeyByMethod(opts);
      case EDITOR_PROVIDER_PREFIX:
        return this.calcKeyByEditor(opts);
      default:
        return '';
    }
  }

  /**
   * 通过视图计算key
   * 目前适用于计算面板项的key
   * @author ljx
   * @date 2024-04-16 23:08:08
   * @param {IRegisterParams} opts
   * @return {string}
   */
  static calcKeyByView(opts: IRegisterParams): string {
    const { controlItemModel, controlModel, viewModel } = opts;
    let key = '';

    if (viewModel?.codeName) {
      key += `${viewModel.codeName.toUpperCase()}`;
    }

    if (controlModel?.codeName) {
      key += `@${controlModel.codeName.toUpperCase()}`;
    }
    // TODO 面板项模型中没有codeName暂用id
    if (controlItemModel?.id) {
      key += `@${controlItemModel.id.toUpperCase()}`;
    }
    return key;
  }

  /**
   * 通过部件计算key
   * 没有实体的部件默认为APP
   * @date 2024-04-16 23:08:08
   * @param {IRegisterParams} opts
   * @return {string}
   */
  static calcKeyByCtrl(opts: IRegisterParams): string {
    const { controlModel, controlItemModel } = opts;
    let key = '';
    let prefix: string = 'APP';
    if (controlModel) {
      const { appDataEntityId, controlType, codeName } = controlModel;
      if (appDataEntityId) {
        prefix = calcDeCodeNameById(appDataEntityId).toUpperCase();
      }
      if (controlType) {
        key += `@${controlType.toUpperCase()}`;
      }
      if (codeName) {
        key += `@${codeName.toUpperCase()}`;
      }
    }

    if (controlItemModel?.codeName) {
      key += `@${controlItemModel.codeName.toUpperCase()}`;
    }
    key = prefix + key;
    return key;
  }

  /**
   * @description 通过界面行为模型计算key，其中实体部分无实体的话默认为APP
   * @static
   * @param {IRegisterParams} opts
   * @returns {*}  {string}
   * @memberof CustomRegister
   */
  static calcKeyByAction(opts: IRegisterParams): string {
    const { uiActionModel } = opts;
    let prefix: string = 'APP';
    let key = '';
    if (uiActionModel) {
      const { appDataEntityId, uiactionTag } = uiActionModel as IData;
      if (appDataEntityId) {
        prefix = calcDeCodeNameById(appDataEntityId).toUpperCase();
      }
      key += `${prefix}`;
      if (uiactionTag) {
        key += `@${uiactionTag.toUpperCase()}`;
      }
    }
    return key;
  }

  /**
   * @description 通过实体方法模型计算key
   * @static
   * @param {IRegisterParams} opts
   * @returns {*}  {string}
   * @memberof CustomRegister
   */
  static calcKeyByMethod(opts: IRegisterParams): string {
    const { deMethodModel, entityModel } = opts;
    let key: string = '';
    if (deMethodModel) {
      const { methodType, codeName } = deMethodModel;
      if (entityModel?.id) {
        key += calcDeCodeNameById(entityModel.id).toUpperCase();
      }
      if (methodType && codeName) {
        key += `@${methodType.toUpperCase()}@${codeName.toUpperCase()}`;
      }
    }
    return key;
  }

  /**
   * @description 通过编辑器模型计算key
   * @static
   * @param {IRegisterParams} opts
   * @returns {*}  {string}
   * @memberof CustomRegister
   */
  static calcKeyByEditor(opts: IRegisterParams): string {
    const { editorModel, controlItemModel, controlModel } = opts;
    let key = '';
    let prefix: string = 'APP';
    if (controlModel) {
      const { appDataEntityId, controlType, codeName } = controlModel;
      if (appDataEntityId) {
        prefix = calcDeCodeNameById(appDataEntityId).toUpperCase();
      }
      if (controlType) {
        key += `@${controlType.toUpperCase()}`;
      }
      if (codeName) {
        key += `@${codeName.toUpperCase()}`;
      }
    }

    if (controlItemModel?.codeName) {
      key += `@${controlItemModel.codeName.toUpperCase()}`;
    }
    if (editorModel) {
      key += `_EDITOR`;
    }
    key = prefix + key;
    return key;
  }
}
