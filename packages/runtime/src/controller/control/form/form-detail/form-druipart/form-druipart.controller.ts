import { isOverlap } from '@ibiz-template/core';
import { IAppDEMultiDataView, IDEFormDRUIPart } from '@ibiz/model-core';
import { createUUID, notNilEmpty } from 'qx-util';
import { SysUIActionTag, ViewCallTag } from '../../../../../constant';
import {
  IAppDEService,
  IViewController,
  IMDControlController,
  IFormDruipartController,
} from '../../../../../interface';
import { convertNavData } from '../../../../../utils';
import { FormNotifyState } from '../../../../constant';
import { EditFormController } from '../../edit-form';
import { FormDetailController } from '../form-detail';
import { FormDruipartState } from './form-druipart.state';

/**
 * @description 表单关系界面控制器
 * @export
 * @class FormDRUIPartController
 * @extends {FormDetailController<IDEFormDRUIPart>}
 */
export class FormDRUIPartController
  extends FormDetailController<IDEFormDRUIPart>
  implements IFormDruipartController
{
  declare state: FormDruipartState;

  protected createState(): FormDruipartState {
    return new FormDruipartState(this.parent?.state);
  }

  /**
   * @description 关系界面的上下文
   * @type {IContext}
   * @memberof FormDRUIPartController
   */
  navContext?: IContext;

  /**
   * @description 关系界面的视图参数
   * @type {IParams}
   * @memberof FormDRUIPartController
   */
  navParams?: IParams;

  /**
   * @description 关联刷新项
   * @type {string[]}
   * @memberof FormDRUIPartController
   */
  refreshItems: string[] = ['srfkey'];

  /**
   * @description 参数项名称（这个模型暂不使用，相关场景可以通过配置导航参数实现）
   * @type {string}
   * @memberof FormDRUIPartController
   */
  paramItem: string = 'srfkey';

  /**
   * @description 嵌入视图控制器
   * @type {(IViewController | undefined)}
   * @memberof FormDRUIPartController
   */
  embedView: IViewController | undefined;

  /**
   * @description  是否是新建数据（即无主键）
   * @type {boolean}
   * @memberof FormDRUIPartController
   */
  isNewData: boolean = false;

  /**
   * @description 是否同步子界面数据服务（处理子应用同实体表单合并关系界面）
   * @type {boolean}
   * @memberof FormDRUIPartController
   */
  isNeedSyncEmbed: boolean = false;

  /**
   * @description 子界面数据服务
   * @type {(IAppDEService | undefined)}
   * @memberof FormDRUIPartController
   */
  embedDataService: IAppDEService | undefined;

  /**
   * @description 初始化
   * @protected
   * @returns {*}  {Promise<void>}
   * @memberof FormDRUIPartController
   */
  protected async onInit(): Promise<void> {
    await super.onInit();
    Object.assign(this.state.layout.extraStyle, {
      overflow: 'auto',
    });
    const { appViewId, refreshItems, paramItem, appId, needSave } = this.model;
    // 初始化关联刷新项
    if (refreshItems) {
      let strArr = refreshItems.split(';');
      strArr = strArr.filter(item => !!item); // 去除空字符串
      this.refreshItems.push(...strArr);
    }

    // 初始化参数项名称
    if (paramItem) this.paramItem = paramItem;

    // 是否同步子界面数据服务(1.要求模型源于子应用、2.当前关系界面设置同时保存)
    this.isNeedSyncEmbed = appId !== ibiz.env.appId && !!needSave;

    // 初始化子界面数据服务
    if (appViewId) {
      const embedView = await ibiz.hub.getAppView(appViewId);
      const app = ibiz.hub.getApp(embedView.appId);
      const tempContext = this.context.clone();
      tempContext.srfappid = embedView.appId;
      if (embedView.appDataEntityId) {
        this.embedDataService = await app.deService.getService(
          tempContext,
          embedView.appDataEntityId,
        );
      }
      // 主表单保存之前
      (this.form as EditFormController).evt.on('onBeforeSave', async () => {
        // 处理子应用同实体表单合并关系界面（手动触发子数据保存、再将子数据同步到主表单）
        if (this.isNeedSyncEmbed && this.embedView && this.embedDataService) {
          await this.saveEmbedViewData();
          await this.SyncEmbedDataToForm();
        }
      });
    }
  }

  /**
   * @description 表单数据变更通知(由表单控制器调用)
   * @param {string[]} names
   * @returns {*}  {Promise<void>}
   * @memberof FormDRUIPartController
   */
  async dataChangeNotify(names: string[]): Promise<void> {
    await super.dataChangeNotify(names);

    // 关联刷新项发生变更时触发刷新
    if (isOverlap(this.refreshItems, names)) {
      // 同步子界面数据服务
      await this.SyncDataToEmbedService();
      // 表单数据加载变更后，计算关系界面参数
      this.calcViewParams();
    }
  }

  /**
   * @description 表单状态变更通知
   * @param {FormNotifyState} state
   * @returns {*}  {Promise<void>}
   * @memberof FormDRUIPartController
   */
  async formStateNotify(state: FormNotifyState): Promise<void> {
    await super.formStateNotify(state);

    this.isNewData = state === FormNotifyState.DRAFT;
    if (this.model.maskMode !== 0) {
      this.state.showMask = this.isNewData;
    }
    if (
      state === FormNotifyState.LOAD ||
      state === FormNotifyState.DRAFT ||
      state === FormNotifyState.SAVE
    ) {
      // 同步子界面数据服务
      await this.SyncDataToEmbedService();
      // 表单数据加载变更后，计算关系界面参数
      this.calcViewParams();
    }
  }

  /**
   * @description 计算视图上下文和视图参数, 调用该方法一定会刷新视图
   * @returns {*}  {void}
   * @memberof FormDRUIPartController
   */
  calcViewParams(): void {
    // 计算导航上下文
    let newContext = this.form.context.clone();

    // 子应用表单合并场景
    if (this.isNeedSyncEmbed) {
      // 忽略数据变化
      newContext.srfignorechange = true;
      // 静默保存
      newContext.srfsilent = true;
    }

    const navContexts = this.model.navigateContexts;
    if (notNilEmpty(navContexts)) {
      newContext = Object.assign(
        newContext,
        convertNavData(
          navContexts!,
          this.data,
          this.form.params,
          this.form.context,
        ),
      );
    }

    // 处理导航视图参数
    const newParams = convertNavData(
      this.model.navigateParams!,
      this.data,
      this.form.params,
      this.form.context,
    );

    if (!this.state.viewComponentKey) {
      // 第一次直接修改然后render
      this.state.viewComponentKey = createUUID();
      this.navContext = newContext;
      this.navParams = newParams;
    } else if (
      JSON.stringify(this.navContext) !== JSON.stringify(newContext) ||
      JSON.stringify(this.navParams) !== JSON.stringify(newParams)
    ) {
      // 后续算出来不一致的情况下，修改，force走render，下层视图自己刷新
      this.navContext = newContext;
      this.navParams = newParams;
      // 强制刷新
      this.force();
    } else if (this.embedView) {
      // 无主键时不刷新
      if (this.isNewData) {
        return;
      }
      // 其他情况下没变，调视图控制器触发刷新
      this.embedView.callUIAction(SysUIActionTag.REFRESH);
    }
  }

  /**
   * @description 设置嵌入视图的神经元
   * @param {IViewController} view
   * @memberof FormDRUIPartController
   */
  setEmbedView(view: IViewController): void {
    this.embedView = view;
    this.embedView.evt.on('onMounted', () => {
      if (!this.isNewData) {
        this.embedView!.call(ViewCallTag.LOAD);
      }
    });
    this.embedView.evt.on('onDataChange', async event => {
      if (['LOAD', 'LOADDRAFT'].includes(event.actionType)) {
        return;
      }
      ibiz.log.debug(
        ibiz.i18n.t('runtime.controller.control.form.relationshipInterface'),
        event,
      );
      // 有表单项更新，且是自身变更时，触发表单项更新
      if (this.model.deformItemUpdateId) {
        (this.form as EditFormController).updateFormItem(
          this.model.deformItemUpdateId,
        );
      }
      // 同步子界面数据
      await this.SyncEmbedDataToForm();
    });
  }

  /**
   * @description 关系界面校验
   * @returns {*}  {Promise<boolean>}
   * @memberof FormDRUIPartController
   */
  async validate(): Promise<boolean> {
    if (this.embedView) {
      const { xdataControlName } = this.embedView.model as IAppDEMultiDataView;
      if (xdataControlName) {
        const xdataControl = this.embedView.getController(
          xdataControlName,
        ) as IMDControlController;
        // 目前只有表格
        if (xdataControl && (xdataControl as IData).validateAll) {
          return (xdataControl as IData).validateAll();
        }
      }
    }
    return true;
  }

  /**
   * @description  静默校验
   * @returns {*}  {Promise<boolean>}
   * @memberof FormDRUIPartController
   */
  async silentValidate(): Promise<boolean> {
    if (this.embedView) {
      const { xdataControlName } = this.embedView.model as IAppDEMultiDataView;
      if (xdataControlName) {
        const xdataControl = this.embedView.getController(
          xdataControlName,
        ) as IMDControlController;
        // 目前只有表格
        if (xdataControl && (xdataControl as IData).validateAll) {
          return (xdataControl as IData).validateAll();
        }
      }
    }
    return true;
  }

  /**
   * @description 同步当前表单数据至子界面数据服务
   * @returns {*}  {Promise<void>}
   * @memberof FormDRUIPartController
   */
  async SyncDataToEmbedService(): Promise<void> {
    if (this.isNeedSyncEmbed && this.embedDataService) {
      const tempContext = this.context.clone();
      tempContext.srfappid = this.model.appId;
      const originData = this.form.state.data.$origin;
      const res = await this.embedDataService.getTemp(tempContext);
      const syncAction = res.data ? 'updateTemp' : 'createTemp';
      await this.embedDataService[syncAction](tempContext, originData);
    }
  }

  /**
   * @description 同步子界面数据至表单
   * @returns {*}  {Promise<void>}
   * @memberof FormDRUIPartController
   */
  async SyncEmbedDataToForm(): Promise<void> {
    if (this.isNeedSyncEmbed && this.embedDataService) {
      const tempContext = this.context.clone();
      tempContext.srfappid = this.model.appId;
      const res = await this.embedDataService.getTemp(tempContext);
      const childData = res.data || {};
      const exData = this.form.state.data.srfexdata || {};
      this.form.state.data.srfexdata = Object.assign(exData, childData);
    }
  }

  /**
   * @description 保存嵌入视图数据
   * @returns {*}  {Promise<void>}
   * @memberof FormDRUIPartController
   */
  async saveEmbedViewData(): Promise<void> {
    if (this.isNeedSyncEmbed && this.embedView) {
      await this.embedView?.call(SysUIActionTag.SAVE);
    }
  }
}
