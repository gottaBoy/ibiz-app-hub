import {
  awaitTimeout,
  IBizContext,
  IHttpResponse,
  IPortalMessage,
  isElementSame,
  mergeInLeft,
  RuntimeError,
} from '@ibiz-template/core';
import {
  IAppDEEditView,
  IDEEditForm,
  IDEFormDetail,
  IDEFormPage,
} from '@ibiz/model-core';
import { debounce } from 'lodash-es';
import { createUUID } from 'qx-util';
import { clone, isNil } from 'ramda';
import {
  IEditFormState,
  IEditFormEvent,
  IEditFormController,
  IViewController,
  IEditViewState,
  IEditViewEvent,
  IDataAbilityParams,
  FormSaveParams,
  IApiChangeTracker,
} from '../../../../interface';
import {
  calcDeCodeNameById,
  findChildFormDetails,
  hasDeCodeName,
} from '../../../../model';
import { Srfuf, ControlVO } from '../../../../service';
import { ChangeTracker, ScriptFactory } from '../../../../utils';
import { FormNotifyState } from '../../../constant';
import { FormController } from '../form';
import { EditFormService } from './edit-form.service';

/**
 * 编辑表单控制器
 *
 * @author chitanda
 * @date 2022-08-03 11:08:20
 * @export
 * @class EditFormController
 * @extends {FormController<EditFormModel>}
 */
export class EditFormController
  extends FormController<IDEEditForm, IEditFormState, IEditFormEvent>
  implements IEditFormController
{
  /**
   * 编辑表单服务
   * @author lxm
   * @date 2023-05-15 11:03:34
   * @type {EditFormService}
   */
  service!: EditFormService;

  get view(): IViewController<IAppDEEditView, IEditViewState, IEditViewEvent> {
    return this.ctx.view as IViewController<
      IAppDEEditView,
      IEditViewState,
      IEditViewEvent
    >;
  }

  /**
   * @description 变更记录器
   * @protected
   * @type {IApiChangeTracker<ControlVO>}
   * @memberof EditFormController
   */
  protected changeTracker: IApiChangeTracker<ControlVO> = new ChangeTracker();

  /**
   * 表单旧数据
   *
   * @author zk
   * @date 2023-12-20 11:12:43
   * @protected
   * @type {IData}
   * @memberof FormController
   */
  protected oldData: IData = new ControlVO();

  /**
   * 锚点数据
   *
   * @type {IData[]}
   * @memberof EditFormController
   */
  public anchorData: IData[] = [];

  /**
   * 是否打开消息弹窗
   *
   * @protected
   * @type {boolean}
   * @memberof EditFormController
   */
  protected hasOpenConfirm: boolean = false;

  /**
   * 初始化方法
   *
   * @author lxm
   * @date 2022-08-22 22:08:16
   * @protected
   * @returns {*}  {Promise<void>}
   */
  protected async onCreated(): Promise<void> {
    await super.onCreated();
    this.initAnchorData();
    // 实例部件服务
    this.service = new EditFormService(this.model);
    await this.service.init(this.context);

    // 自动保存防抖，只有最后一次执行
    this.autoSave = debounce(this.autoSave.bind(this), 500, {
      trailing: true,
    }) as () => Promise<void>;
  }

  /**
   * 初始化锚点栏数据
   *
   * @memberof EditFormController
   */
  public initAnchorData(): void {
    if (this.model.showFormNavBar) {
      this.anchorData = [];
      this.model.deformPages?.forEach((page: IDEFormPage) => {
        if (page.deformDetails) {
          this.parseAnchorModel(page, page.deformDetails);
        }
      });
    }
  }

  /**
   * 解析锚点模型
   *
   * @param {IData[]} [details=[]]
   * @memberof EditFormController
   */
  public parseAnchorModel(page: IDEFormPage, details: IData[] = []): void {
    details.forEach((detail: IData) => {
      if (detail.enableAnchor) {
        this.anchorData.push({
          pageId: page.id,
          id: `${this.view.model.codeName}_${this.model.codeName}_${detail.codeName}`,
          title: detail.caption,
        });
      }
      if (detail.deformDetails) {
        this.parseAnchorModel(page, detail.deformDetails);
      }
    });
  }

  protected async onMounted(): Promise<void> {
    await super.onMounted();

    // 如果外面没有配置默认不加载的话，默认部件自己加载,simple模式不加载
    if (!this.state.isSimple && this.state.loadDefault) {
      this.load();
    }
  }

  /**
   * 加载草稿行为
   * @author lxm
   * @date 2023-08-25 02:45:11
   * @return {*}  {Promise<IData>}
   */
  async loadDraft(args?: IDataAbilityParams): Promise<IData> {
    const { context, params: queryParams } = this.handlerAbilityParams(args);

    let res;
    const silent = this.getSilent(args) === true;
    try {
      if (!silent) {
        await this.startLoading();
      }
      await this.evt.emit('onBeforeLoadDraft', { params: queryParams });
      res = await this.service.getDraft(context, queryParams);
    } catch (error) {
      await this.evt.emit('onLoadDraftError', undefined);
      this.actionNotification('GETDRAFTERROR', {
        error: error as Error,
      });
      throw error;
    } finally {
      if (!silent) {
        await this.endLoading();
      }
    }

    this.state.data = res.data;
    this.changeTracker.reset(this.data.clone());
    this.formStateNotify(FormNotifyState.DRAFT);

    await this.evt.emit('onLoadDraftSuccess', undefined);
    this.actionNotification('GETDRAFTSUCCESS');
    this.state.isLoaded = true;
    return this.data;
  }

  /**
   * 拷贝模式加载数据
   *
   * @author chitanda
   * @date 2023-09-26 19:09:21
   * @return {*}  {Promise<IData>}
   */
  protected async copy(): Promise<IData> {
    const context = clone(this.context);
    const queryParams: IParams = clone(this.params);

    const appDataEntity = await ibiz.hub.getAppDataEntity(
      this.model.appDataEntityId!,
      this.model.appId,
    );
    const key = appDataEntity.keyAppDEFieldId;
    if (key && this.params[key]) {
      const deCodeName = calcDeCodeNameById(this.model.appDataEntityId!);
      context[deCodeName] = this.params[key];
      delete queryParams[key];
      delete this.params[key];
      delete queryParams.srfcopymode;
      delete this.params.srfcopymode;
    }

    let res;
    try {
      await this.startLoading();
      await this.evt.emit('onBeforeLoad', { args: queryParams });
      res = await this.service.get(context, queryParams);
    } catch (error) {
      await this.evt.emit('onLoadError', { args: error as IData });
      this.actionNotification('GETERROR', {
        error: error as Error,
      });
      throw error;
    } finally {
      await this.endLoading();
    }

    // 清空主键，重置临时主键
    res.data.srfkey = undefined;
    res.data.tempsrfkey = createUUID();
    // 主键清空后重置为新建数据
    res.data.srfuf = Srfuf.CREATE;

    this.state.modified = false;
    this.state.data = res.data;
    this.changeTracker.reset(this.data.clone());
    this.formStateNotify(FormNotifyState.LOAD);

    await this.evt.emit('onLoadSuccess', { args: res.data });
    this.actionNotification('GETSUCCESS');
    this.state.isLoaded = true;
    return this.data;
  }

  /**
   * 部件加载数据行为
   *
   * @author lxm
   * @date 2022-08-19 14:08:50
   */
  async load(args?: IDataAbilityParams): Promise<IData> {
    // 复制模式独立处理
    const copyMode = this.params.srfcopymode;
    if (copyMode) {
      return this.copy();
    }
    const isLoadDraft = !hasDeCodeName(
      this.context,
      calcDeCodeNameById(this.model.appDataEntityId!),
    );
    // 加载草稿单独走一个方法
    if (isLoadDraft) {
      return this.loadDraft();
    }

    const { context, params } = this.handlerAbilityParams(args);

    const queryParams = clone(params);
    const silent = this.getSilent(args) === true;
    let res;
    try {
      if (!silent) {
        await this.startLoading();
      }
      await this.evt.emit('onBeforeLoad', { args: queryParams });
      res = await this.service.get(context, queryParams);
    } catch (error) {
      await this.evt.emit('onLoadError', { args: error as IData });
      this.actionNotification('GETERROR', {
        error: error as Error,
      });
      throw error;
    } finally {
      if (!silent) {
        await this.endLoading();
      }
    }

    this.state.modified = false;
    this.state.data = res.data;
    // 缓存旧数据
    this.oldData = this.data.clone();
    this.changeTracker.reset(this.oldData as ControlVO);
    this.formStateNotify(FormNotifyState.LOAD);

    await this.evt.emit('onLoadSuccess', { args: res.data });
    this.actionNotification('GETSUCCESS');
    this.state.isLoaded = true;
    return this.data;
  }

  /**
   * 保存表单数据
   *
   * @author lxm
   * @date 2022-08-31 22:08:40
   */
  async save(args?: FormSaveParams): Promise<IData> {
    // 编辑器默认为blur抛值模式，在销毁弹窗后会触发编辑器blur走值变更和自动保存逻辑
    // 表单保存之前先校验界面域是否存在
    const srfSessionid = this.context.srfsessionid;
    if (!ibiz.uiDomainManager.has(srfSessionid)) {
      return this.data;
    }
    const silent = this.getSilent(args) === true;
    // 如果数据正在处理中，则延迟保存
    if (this.state.processing) {
      const data = await awaitTimeout(500, this.save.bind(this), [args]);
      return data!;
    }

    const isValid =
      args?.silentVerify === true
        ? await this.silentValidate()
        : await this.validate();
    if (!isValid) {
      if (args?.silentVerify === true) {
        return this.data;
      }
      this.handleValidateFail();
    }

    if (!silent) {
      await this.startLoading();
    }

    const { context, data } = this.handlerAbilityParams(args);
    // 表单未修改则阻止触发界面域变更，防止自动保存引发界面域状态异常状态（场景：仅值项填充文本触发表单自动保存）
    if (!this.state.modified) {
      Object.assign(context, {
        srfactiontrusted: false,
      });
    }
    let saveData = data[0];
    saveData = this.checkIgnoreInput(saveData);

    const isCreate = saveData.srfuf === Srfuf.CREATE;
    let res;
    try {
      await this.evt.emit('onBeforeSave', { args: saveData });
      res = isCreate
        ? await this.service.create(context, saveData)
        : await this.service.update(context, saveData);
    } catch (error) {
      await this.evt.emit('onSaveError', { args: error as IData });
      this.actionNotification(`${isCreate ? 'CREATE' : 'UPDATE'}ERROR`, {
        error: error as Error,
      });
      throw error;
    } finally {
      if (!silent) {
        await this.endLoading();
      }
    }

    const noFillBack = args?.noFillBack === true;
    // 保存结束后合并修改临时主键
    if (res.data) {
      // 回填数据的合并后台数据
      if (noFillBack) {
        // 自动保存不回填数据的时候只更新更新时间
        this.data.updatedate = res.data.updatedate;
        this.data.srfkey = res.data.srfkey;
      } else {
        mergeInLeft(this.data, res.data);
      }
      // 保存结束后更新旧数据
      this.oldData = this.data.clone();
      this.changeTracker.reset(this.oldData as ControlVO);
      this.data.tempsrfkey = this.data.srfkey;
    }
    this.state.modified = false;
    await this.evt.emit('onSaveSuccess', { args: res.data });
    if (!this.view.state.isClosing) {
      this.formStateNotify(FormNotifyState.SAVE);
    }
    if (!silent) {
      this.actionNotification(`${isCreate ? 'CREATE' : 'UPDATE'}SUCCESS`, {
        default: ibiz.i18n.t(
          'runtime.controller.control.form.savedSuccessfully',
          { srfmajortext: this.data.srfmajortext || '' },
        ),
      });
    }
    // 发送数据变更事件(忽略数据变化不发送数据变更事件)
    if (!this.context.srfignorechange) {
      this.emitDEDataChange(isCreate ? 'create' : 'update', res.data);
    }
    return this.data;
  }

  /**
   * 删除表单数据
   *
   * @author lxm
   * @date 2022-09-01 09:09:36
   * @returns {*}
   */
  async remove(args?: IDataAbilityParams): Promise<boolean> {
    const { context, params } = this.handlerAbilityParams(args);
    // 新建数据清空数据
    let res: IHttpResponse | undefined;
    let ok: boolean = false;
    await this.evt.emit('onBeforeRemove', { args: this.data });
    // 新建的数据不用进行后台删除
    if (this.data.srfuf === Srfuf.UPDATE) {
      if (args?.silent !== true) {
        const hiddenSsgItem = this.findCtrlMsgByTag('BEFOREREMOVE_HIDDEN');
        if (hiddenSsgItem) {
          ok = true;
        } else {
          ok = await ibiz.modal.confirm({
            title: ibiz.i18n.t('runtime.controller.control.form.prompt'),
            desc: ibiz.i18n.t('runtime.controller.control.form.deletion'),
          });
        }
        if (!ok) {
          // 取消不抛事件
          return false;
        }
      }
      const silent = args?.silent === true;
      if (!silent) {
        await this.startLoading();
      }
      try {
        res = await this.service.remove(context, params);
      } catch (error) {
        await this.evt.emit('onRemoveError', { args: error as IData });
        if (args?.silent !== true) {
          this.actionNotification('REMOVEERROR', {
            error: error as Error,
          });
        }
        throw error;
      } finally {
        if (!silent) {
          await this.endLoading();
        }
      }
      ok = res.ok;
    }
    if (!this.context.srfignorechange) {
      this.emitDEDataChange('remove', this.data);
    }

    // 删除完成后都要置空当前表单数据
    this.state.data = new ControlVO();
    this.state.modified = false;
    this.changeTracker.reset(this.data.clone());
    await this.evt.emit('onRemoveSuccess', { args: this.data });
    this.actionNotification('REMOVESUCCESS');

    return ok;
  }

  /**
   * 执行返回行为
   *
   * @author lxm
   * @date 2022-09-01 09:09:36
   * @returns {*}
   */
  async goBack(): Promise<IData> {
    await this.startLoading();
    let res;
    try {
      res = await this.service.goBack(this.context, this.data);
    } finally {
      await this.endLoading();
    }
    // 合并后台返回数据
    if (res.data) {
      mergeInLeft(this.data, res.data);
    }
    return this.data;
  }

  /**
   * 表单项更新
   *
   * @author lxm
   * @date 2022-09-15 21:09:13
   * @param {string} methodName 更新实体方法
   * @param {string[]} updateItems 更新项名称集合
   */
  async updateFormItem(formItemUpdateId: string): Promise<void> {
    const formItemUpdate = this.model.deformItemUpdates?.find(
      item => item.id === formItemUpdateId,
    );

    if (!formItemUpdate) {
      throw new RuntimeError(
        ibiz.i18n.t('runtime.controller.control.form.itemUpdate', {
          formItemUpdateId,
        }),
      );
    }

    const {
      appDEMethodId,
      defiupdateDetails,
      customCode,
      scriptCode,
      showBusyIndicator,
    } = formItemUpdate;
    const updateItems = defiupdateDetails?.map(item => item.id!);

    try {
      if (showBusyIndicator) {
        await this.startLoading();
      }
      let updateData: IData; // 要修改的数据
      if (customCode && scriptCode) {
        // 脚本模式获取修改数据
        const data = await ScriptFactory.asyncExecScriptFn(
          {
            ...this.getEventArgs(),
            data: this.data,
          },
          scriptCode,
        );
        updateData = data as IData;
      } else {
        // 后台服务获取修改数据
        const params = { ...this.params, ...this.data.getOrigin() };
        const res = await this.service.updateFormItem(
          appDEMethodId!,
          this.context,
          params,
        );
        updateData = res.data;
      }

      // 修改表单项更新的值
      if (updateData && updateItems?.length) {
        await Promise.all(
          updateItems.map(itemName =>
            this.setDataValue(itemName, updateData[itemName]),
          ),
        );
      }
    } finally {
      if (showBusyIndicator) {
        await this.endLoading();
      }
    }
  }

  /**
   * 工作流启动(调用前先确保调用保存)
   *
   * @author lxm
   * @date 2022-10-08 18:10:41
   * @param {IParams} [extraParams={}] 不走工作流启动视图时使用
   * @returns {*}  {Promise<void>}
   */
  async wfStart(args?: IDataAbilityParams): Promise<void> {
    const isValid = await this.validate();
    if (!isValid) {
      this.handleValidateFail();
    }
    const silent = args?.silent === true;
    if (!silent) {
      await this.startLoading();
    }
    const { context, params } = this.handlerAbilityParams(args);
    try {
      await this.service.wfStart(context, params, this.data);
      if (!this.context.srfignorechange) {
        this.emitDEDataChange('update', this.data);
        // 刷新预定义todo实体数据
        this.emitDEDataChange('create', { srfdecodename: 'SysTodo' });
      }
    } catch (error) {
      this.actionNotification('WFSTARTERROR', {
        error: error as Error,
      });
      throw error;
    } finally {
      if (!silent) {
        await this.endLoading();
      }
    }
    this.actionNotification('WFSTARTSUCCESS', {
      default: ibiz.i18n.t('runtime.controller.control.form.processStarted'),
    });
  }

  /**
   * 工作流提交(调用前先确保调用保存)
   *
   * @author lxm
   * @date 2022-10-08 18:10:56
   * @param {IParams} [extraParams={}] 不走工作流操作视图时使用
   * @returns {*}  {Promise<void>}
   */
  async wfSubmit(args?: IDataAbilityParams): Promise<void> {
    const isValid = await this.validate();
    if (!isValid) {
      this.handleValidateFail();
    }
    const silent = args?.silent === true;
    if (!silent) {
      await this.startLoading();
    }
    const { context, params } = this.handlerAbilityParams(args);
    try {
      await this.service.wfSubmit(context, params, this.data);
      if (!this.context.srfignorechange) {
        this.emitDEDataChange('update', this.data);
        // 刷新预定义todo实体数据
        this.emitDEDataChange('create', { srfdecodename: 'SysTodo' });
      }
    } catch (error) {
      this.actionNotification('WFSUBMITERROR', {
        error: error as Error,
      });
      throw error;
    } finally {
      if (!silent) {
        await this.endLoading();
      }
    }
    this.actionNotification('WFSUBMITSUCCESS', {
      default: ibiz.i18n.t('runtime.controller.control.form.processSubmitted'),
    });
  }

  async dataChangeNotify(names: string[]): Promise<void> {
    await super.dataChangeNotify(names);
    this.autoSave();
  }

  /**
   * 自动保存
   * @author lxm
   * @date 2023-08-23 05:44:48
   * @return {*}  {Promise<void>}
   */
  async autoSave(): Promise<void> {
    if (!this.model.enableAutoSave) {
      return;
    }
    // todo 临时模型数据 节流保存
    const { autoSaveMode } = this.model as IData;
    // 自动保存静默，报错直接控制台输出
    const saveParam: FormSaveParams = {
      silent: true,
      noFillBack: false,
      silentVerify: true,
    };
    switch (autoSaveMode) {
      case 3:
        saveParam.data = this.getDiffData();
        saveParam.context = IBizContext.create({ srfsimple: true });
        break;
      default:
    }
    try {
      await this.save(saveParam);
    } catch (error) {
      ibiz.log.error(error);
      throw error;
    }
  }

  /**
   * 立即执行自动保存
   *
   * @return {*}  {Promise<void>}
   * @memberof EditFormController
   */
  async immediateAutoSave(): Promise<void> {
    if (!this.model.enableAutoSave) {
      return;
    }
    // todo 临时模型数据 节流保存
    const { autoSaveMode } = this.model as IData;
    // 自动保存静默，报错直接控制台输出
    const saveParam: FormSaveParams = {
      silent: true,
      noFillBack: false,
      silentVerify: true,
    };
    switch (autoSaveMode) {
      case 3:
        saveParam.data = this.getDiffData();
        saveParam.context = IBizContext.create({ srfsimple: true });
        break;
      default:
    }
    try {
      await this.save(saveParam);
    } catch (error) {
      ibiz.log.error(error);
    }
  }

  /**
   * 比较旧数据跟当前数据的差异返回差异数据
   *
   * @author zk
   * @date 2023-12-20 10:12:06
   * @protected
   * @return {*}  {ControlVO}
   * @memberof EditFormController
   */
  protected getDiffData(): ControlVO {
    const { data } = this.state;
    const diffData: IData = {};
    Object.keys(data).forEach(key => {
      // 值不一致 || 属性为主键
      if (Array.isArray(data[key])) {
        if (!isElementSame(data[key], this.oldData[key])) {
          diffData[key] = data[key];
        }
      } else if (data[key] !== this.oldData[key] || key === data.srfkeyfield) {
        diffData[key] = data[key];
      }
    });
    diffData.srfuf = data.srfuf;
    return new ControlVO(diffData, (this.oldData as ControlVO).$dataUIMap);
  }

  /**
   * 设置simple模式的数据
   * @author lxm
   * @date 2023-11-22 07:11:21
   * @param {IData} data
   */
  setSimpleData(data: IData): void {
    // fix:修复向导面板后退时data变成vo对象导致界面异常（#PLM评审新建向导）
    const newData: IData = {};
    if (Object.keys(data).length > 0) {
      Object.keys(data).forEach(key => {
        newData[key] = data[key];
      });
    }
    // data由外部直接修改，先克隆一份隔离跟外部的对象。补全对应表单项字段不存在的时候设置为null，避免响应式问题。
    const UIData: ControlVO = this.service.toUIData(newData);
    const cloneData = UIData.clone();
    this.oldData = this.state.data.clone();
    this.formItems.forEach(item => {
      if (!Object.prototype.hasOwnProperty.call(cloneData, item.name)) {
        cloneData[item.name] = null;
      }
    });
    this.state.modified = false;
    this.state.data = cloneData;
    this.changeTracker.reset(this.data.clone());
    if (!this.state.isLoaded) {
      // 第一次设置的时候走更新通知，触发更新默认值
      this.formStateNotify(FormNotifyState.LOAD);
      this.state.isLoaded = true;
    } else {
      // 后续的变更都只走值变更触发
      const diffData = this.getDiffData().getOrigin();
      // 只传递变化项名称
      this.dataChangeNotify(Object.keys(diffData));
    }
  }

  /**
   * 刷新确认
   *
   * @protected
   * @return {*}  {Promise<boolean>}
   * @memberof ControlController
   */
  protected async reloadConfirm(): Promise<boolean> {
    // 如果之前已经打开了则直接返回false
    if (this.hasOpenConfirm) return false;
    // 标记已打开消息弹窗
    this.hasOpenConfirm = true;
    const result = await ibiz.confirm.info({
      title: ibiz.i18n.t('runtime.controller.control.form.refreshPrompt'),
      desc: ibiz.i18n.t('runtime.controller.control.form.refreshPagePrompt'),
    });
    // 标记已关闭消息弹窗
    this.hasOpenConfirm = false;
    return result;
  }

  /**
   * 检测实体数据变更
   *
   * @author tony001
   * @date 2024-03-28 18:03:14
   * @protected
   * @param {IPortalMessage} msg
   * @return {*}  {void}
   */
  protected onDEDataChange(msg: IPortalMessage): void {
    const { appDataEntityId } = this.model;
    // 表单只关心更新
    if (msg.subtype !== 'OBJECTUPDATED' || !appDataEntityId) return;

    // msg.triggerKey 不为空，且与当前控制器的triggerKey一致时，则不处理
    if (!isNil(msg.triggerKey) && msg.triggerKey === this.triggerKey) return;

    let data: IData | undefined;
    try {
      data = msg.data || (msg.content ? JSON.parse(msg.content) : undefined);
    } catch (error) {
      ibiz.log.error(error);
    }
    // 没有信息内容不处理
    if (!data) return;
    // 当前实体名称
    const dename = calcDeCodeNameById(appDataEntityId);
    // 是否启用脏检查(后台消息启用脏检查)
    const enableDirtyChecking: boolean = !msg.data;
    // 是否重载(必须同实体同主键才做刷新处理)
    const isReload: boolean =
      (data.srfdecodename?.toLowerCase() === dename ||
        data.srfdename?.toLowerCase() === dename) &&
      data.srfkey === this.data.srfkey;

    if (isReload) {
      this.doNextActive(
        async () => {
          if (!this.ctx.isDestroyed) {
            if (enableDirtyChecking && this.state.modified) {
              const result = await this.reloadConfirm();
              if (!result) return;
            }
            this.load();
          }
        },
        {
          key: 'load',
        },
      );
    }
  }

  /**
   * 过滤成员
   *
   * @param {string} filter 过滤值
   * @return {*}  {void}
   * @memberof EditFormController
   */
  filterDetail(filter: string): void {
    const { deformPages } = this.model;
    if (!deformPages || !deformPages.length) return;

    // 递归计算成员显示状态
    const clacVisible = (detail: IDEFormDetail): boolean => {
      // 默认设置为不可见
      let visible = false;
      // 如果成员标题包含过滤值，设置为可见
      if (detail.caption?.includes(filter)) {
        visible = true;
      }
      // 递归处理子成员
      const childDetails = findChildFormDetails(detail);
      if (childDetails.length) {
        const children = childDetails.map(clacVisible);
        // 如果子成员中有可见的，父成员也必须可见
        if (children.some(_v => _v)) visible = true;
      }
      if (this.details[detail.id!])
        this.details[detail.id!].state.visible = visible;
      return visible;
    };
    deformPages.forEach(clacVisible);
  }

  /**
   * @description 取消变更，'UNDO' | 'REDO'暂未支持
   * @param {('INIT' | 'UNDO' | 'REDO')} [targetState] 目标状态，初始化状态|撤销上一步操作|重做下一步操作
   * @returns {*}  {Promise<void>}
   * @memberof FormController
   */
  async cancelChanges(
    targetState: 'INIT' | 'UNDO' | 'REDO' = 'INIT',
  ): Promise<void> {
    if (targetState !== 'INIT') {
      return;
    }
    // 后续需支持undo和redo后再行调整
    const initSate = this.changeTracker.getState();
    if (initSate) {
      this.state.modified = false;
      this.state.data = initSate;
      this.oldData = this.data.clone();
      this.changeTracker.reset(this.oldData as ControlVO);
      this.formStateNotify(FormNotifyState.LOAD);
      await this.evt.emit('onLoadSuccess', { args: initSate });
      this.state.isLoaded = true;
    }
  }
}
