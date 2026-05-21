import {
  IHttpResponse,
  recursiveIterate,
  RuntimeModelError,
} from '@ibiz-template/core';
import {
  IDEEditForm,
  IWFEditForm,
  IDEFormDetail,
  IDEEditFormItem,
  IDEWizardEditForm,
} from '@ibiz/model-core';
import { ControlVO, UIMapField } from '../../../../service';
import { FormService } from '../form/form.service';

export class EditFormService<
  T extends IDEEditForm = IDEEditForm,
> extends FormService<T> {
  /**
   * 执行获取单条数据方法
   *
   * @author lxm
   * @date 2022-08-31 17:08:41
   * @param {IContext} context 上下文
   * @param {IParams} [params={}] 视图参数
   * @returns {*}  {Promise<IHttpResponse>}
   */
  async get(
    context: IContext,
    params: IParams = {},
  ): Promise<IHttpResponse<ControlVO>> {
    const { args } = this.getLoadParams(params);
    let res = await this.exec(
      this.model.getControlAction?.appDEMethodId || 'get',
      context,
      undefined,
      args,
    );
    res = this.handleResponse(res);
    // 设置默认值
    if (res.ok && res.data) {
      this.setDefault(res.data, context, params, 'update');
    }
    return res as IHttpResponse<ControlVO>;
  }

  /**
   * 执行获取草稿方法
   *
   * @author lxm
   * @date 2022-08-31 17:08:41
   * @param {IContext} context 上下文
   * @param {IParams} [params={}] 视图参数
   * @returns {*}  {Promise<IHttpResponse>}
   */
  async getDraft(
    context: IContext,
    params: IParams = {},
  ): Promise<IHttpResponse<ControlVO>> {
    // srfdefdata存在，则视图重绘，跳过当前界面域临时数据
    if (params && params.srfdefdata) {
      context.srfskipcleartmpres = true;
    }
    const { args } = this.getLoadParams(params);
    let res = await this.exec(
      this.model.getDraftControlAction?.appDEMethodId || 'getdraft',
      context,
      undefined,
      args,
    );
    res = this.handleResponse(res);
    // 设置默认值
    if (res.ok && res.data) {
      this.setDefault(res.data, context, params, 'create');
    }
    return res as IHttpResponse<ControlVO>;
  }

  /**
   * 删除单条数据
   *
   * @author lxm
   * @date 2022-09-07 19:09:48
   * @param {IContext} context 上下文
   * @param {IParams} [params={}] 视图参数
   * @returns {*}
   */
  async remove(
    context: IContext,
    params: IParams = {},
  ): Promise<IHttpResponse> {
    const res = await this.exec(
      this.model.removeControlAction?.appDEMethodId || 'remove',
      context,
      undefined,
      params,
    );
    return res;
  }

  /**
   * 新建数据
   *
   * @author lxm
   * @date 2022-09-07 19:09:11
   * @param {IContext} context 上下文
   * @param {IData} data 数据
   * @returns {*}
   */
  async create(
    context: IContext,
    data: IData,
  ): Promise<IHttpResponse<ControlVO>> {
    const tempData = this.getFilteredData(data);
    let res = await this.exec(
      this.model.createControlAction?.appDEMethodId || 'create',
      context,
      tempData,
    );
    res = this.handleResponse(res);
    return res as IHttpResponse<ControlVO>;
  }

  /**
   * 更新数据
   *
   * @author lxm
   * @date 2022-09-07 19:09:11
   * @param {IContext} context 上下文
   * @param {IData} data 数据
   * @returns {*}
   */
  async update(
    context: IContext,
    data: IData,
  ): Promise<IHttpResponse<ControlVO>> {
    const tempData = this.getFilteredData(data);
    let res = await this.exec(
      this.model.updateControlAction?.appDEMethodId || 'update',
      context,
      tempData,
    );
    res = this.handleResponse(res);
    return res as IHttpResponse<ControlVO>;
  }

  /**
   * 返回操作
   *
   * @author lxm
   * @date 2022-09-07 19:09:11
   * @param {IContext} context 上下文
   * @param {IData} data 数据
   * @returns {*}
   */
  async goBack(
    context: IContext,
    data: IData,
  ): Promise<IHttpResponse<ControlVO>> {
    const wizardForm = this.model as IDEWizardEditForm;
    const methodName = wizardForm.goBackControlAction?.appDEMethodId;
    if (!methodName) {
      throw new RuntimeModelError(
        this.model,
        ibiz.i18n.t('runtime.controller.control.form.lackBehavior'),
      );
    }
    let res = await this.exec(
      methodName,
      context,
      data instanceof ControlVO ? data.getOrigin() : data,
    );
    res = this.handleResponse(res);
    return res as IHttpResponse<ControlVO>;
  }

  /**
   * 表单项更新
   *
   * @author lxm
   * @date 2022-09-15 21:09:34
   * @param {string} methodName
   * @param {IContext} context
   * @param {IParams} [params={}]
   * @returns {*}  {Promise<IHttpResponse<ControlVO>>}
   */
  async updateFormItem(
    methodName: string,
    context: IContext,
    data: IData = {},
    params: IParams = {},
  ): Promise<IHttpResponse<ControlVO>> {
    const { controlParam } = this.model;
    // 识别控件动态参数ignoreupdateitem
    const srfupdateitem =
      controlParam?.ctrlParams?.IGNOREUPDATEITEM !== 'false';
    Object.assign(params, { srfupdateitem });
    let res = await this.exec(methodName, context, data, params);
    res = this.handleResponse(res);
    return res as IHttpResponse<ControlVO>;
  }

  /**
   * 工作流启动
   *
   * @author lxm
   * @date 2022-09-07 19:09:11
   * @param {IContext} context 上下文
   * @param {IData} data 数据
   * @param {IParams} [params={}] 视图参数
   * @returns {*}
   */
  async wfStart(
    context: IContext,
    params: IParams,
    data: IData,
  ): Promise<IHttpResponse<IData>> {
    const wfForm = this.model as IWFEditForm;
    const methodName = wfForm.wfstartControlAction?.appDEMethodId || 'wfstart';
    const entityService = await this.app.deService.getService(
      context,
      this.model.appDataEntityId!,
    );
    return entityService.wf.exec(
      methodName,
      context,
      params,
      data instanceof ControlVO ? data.getOrigin() : data,
    );
  }

  /**
   * 工作流提交
   *
   * @author lxm
   * @date 2022-09-07 19:09:11
   * @param {IContext} context 上下文
   * @param {IData} data 数据
   * @param {IParams} [params={}] 视图参数
   * @returns {*}
   */
  async wfSubmit(
    context: IContext,
    params: IParams,
    data: IData,
  ): Promise<IHttpResponse<IData>> {
    const wfForm = this.model as IWFEditForm;

    // 有type的操作方法传type。
    let methodName = '';
    if (params.type) {
      methodName = params.type;
    } else {
      methodName = wfForm.wfsubmitControlAction?.appDEMethodId || 'wfsubmit';
    }

    const entityService = await this.app.deService.getService(
      context,
      this.model.appDataEntityId!,
    );
    return entityService.wf.exec(
      methodName,
      context,
      params,
      data instanceof ControlVO ? data.getOrigin() : data,
    );
  }

  /**
   * 初始化属性映射
   *
   * @author lxm
   * @date 2022-08-31 18:08:37
   */
  protected initUIDataMap(): void {
    super.initUIDataMap();
    // 预置属性映射
    const presetFields = [
      // 工作流预置
      'srfwfmemo',
      'srfwftransferor',
      // 逻辑预置操作数据
      'srfactionparam',
      // 前端新增修改标识，新增为"0",修改为"1"或未设值
      'srffrontuf',
      // 向导预置
      'srfnextform',
    ];

    // *初始化表单的属性映射
    recursiveIterate(
      this.model,
      (item: IDEFormDetail, parent: IDEFormDetail) => {
        // 重复器中的子表单属性项不应挂在主表单中
        if (parent.detailType === 'MDCTRL') {
          return true;
        }
        if (item.detailType === 'FORMITEM' || item.detailType === 'MDCTRL') {
          const formItem = item as IDEEditFormItem;
          // 复合表单项
          if (formItem.compositeItem) {
            const { editorItems = [] } = formItem.editor || {};
            editorItems.forEach((editorItem: IData) => {
              const mapField = new UIMapField(editorItem.id, editorItem.id, {
                isOriginField: presetFields.includes(editorItem.id),
              });
              this.dataUIMap.set(editorItem.id, mapField);
            });
          } else {
            const uiKey = formItem.id!.toLowerCase();
            const deField =
              formItem.fieldName || (item as IDEEditFormItem).appDEFieldId!;
            let mapField: UIMapField;
            if (deField) {
              const uiKeys = this.fieldToUIMap.get(deField);
              mapField = new UIMapField(uiKey, deField, {
                isOriginField: true,
                dataType: formItem.dataType,
                isOneToMultiField: uiKeys && uiKeys.length > 1,
              });
            } else if (
              this.model.controlParam &&
              this.model.controlParam.ctrlParams &&
              this.model.controlParam.ctrlParams.enablerepeatedform === 'true'
            ) {
              // 重复器表单项没有属性绑定也存到origin里面
              mapField = new UIMapField(uiKey, uiKey, {
                isOriginField: true,
              });
            } else {
              // 前台属性和没属性的表单项，或预置属性
              mapField = new UIMapField(uiKey, uiKey, {
                isOriginField: presetFields.includes(uiKey), // 工作流相关需要存到origin上
              });
            }
            this.dataUIMap.set(uiKey, mapField);
          }
        }
      },
      {
        childrenFields: ['deformPages', 'deformTabPages', 'deformDetails'],
        isBreak: true,
      },
    );
  }

  /**
   * 处理响应
   *
   * @author lxm
   * @date 2022-08-31 17:08:13
   * @param {IHttpResponse} res
   * @returns {*}  {IHttpResponse}
   */
  handleResponse(response: IHttpResponse): IHttpResponse<ControlVO> {
    const res = super.handleResponse(response);
    if (res.ok && res.data) {
      res.data = this.toUIData(res.data);
    }
    return res as IHttpResponse<ControlVO>;
  }
}
