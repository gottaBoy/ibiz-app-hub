import {
  IAppDataEntity,
  IAppDEMethod,
  IAppUIAction,
  IAppView,
  IControl,
  IControlItem,
  IEditor,
} from '@ibiz/model-core';

/**
 * 自定义适配器注册参数接口
 */
export interface IRegisterParams {
  /**
   * 部件项模型
   *
   * @author ljx
   * @date 2024-04-15 16:10:54
   * @type {IModel}
   */
  controlItemModel?: IControlItem;

  /**
   * 部件模型
   *
   * @author ljx
   * @date 2024-04-15 16:10:54
   * @type {IPanel}
   */
  controlModel?: IControl;

  /**
   * 视图模型
   *
   * @author ljx
   * @date 2024-04-15 16:10:54
   * @type {IControl}
   */
  viewModel?: IAppView;

  /**
   * @description 界面行为模型
   * @type {IAppUIAction}
   * @memberof IRegisterParams
   */
  uiActionModel?: IAppUIAction;

  /**
   * @description 实体方法模型
   * @type {IDEMethodProvider}
   * @memberof IRegisterParams
   */
  deMethodModel?: IAppDEMethod;

  /**
   * @description 实体模型
   * @type {string}
   * @memberof IRegisterParams
   */
  entityModel?: IAppDataEntity;

  /**
   * @description 编辑器模型
   * @type {IEditor}
   * @memberof IRegisterParams
   */
  editorModel?: IEditor;
}
