import { IHttpResponse, RuntimeModelError } from '@ibiz-template/core';
import {
  IModalData,
  getDeACMode,
  IViewConfig,
  UIActionUtil,
  IAcItemProvider,
  EditorController,
  getAcItemProvider,
  OpenAppViewCommand,
  UIActionButtonState,
  ButtonContainerState,
  IButtonContainerState,
} from '@ibiz-template/runtime';
import {
  IPicker,
  IAppDEACMode,
  IDEACModeDataItem,
  IUIActionGroupDetail,
  IAppDEUIActionGroupDetail,
} from '@ibiz/model-core';
import { isNumber } from 'lodash-es';
import { mergeDeepLeft } from 'ramda';

/**
 * 数据选择编辑器控制器
 * @return {*}
 * @author: zhujiamin
 * @Date: 2022-08-25 10:57:58
 */
export class PickerEditorController extends EditorController<IPicker> {
  /**
   * 是否多选
   */
  public multiple = false;

  /**
   *选择视图相关参数
   */
  public pickupView: IViewConfig | null = null;

  /**
   *链接视图相关参数
   */
  public linkView: IViewConfig | null = null;

  /**
   *值项
   */
  public valueItem = '';

  /**
   * 主键属性名称
   */
  public keyName: string = 'srfkey';

  /**
   * 主文本属性名称
   */
  public textName: string = 'srfmajortext';

  /**
   * 数据集codeName
   */
  public interfaceName: string = '';

  /**
   * 自填模式sort排序
   */
  public sort: string | undefined = '';

  /**
   * 不支持AC（根据编辑器类型得）
   */
  public noAC: boolean = false;

  /**
   * 不支持按钮（根据编辑器类型得）
   */
  public noButton: boolean = false;

  /**
   * 实体自填模式模型
   */
  public deACMode: IAppDEACMode | undefined = undefined;

  /**
   * 自填数据项集合（已排除了value和text)
   */
  public dataItems: IDEACModeDataItem[] = [];

  // 对象标识属性
  public objectIdField: string | undefined = '';

  // 对象名称属性
  public objectNameField: string | undefined = '';

  // 对象值属性
  public objectValueField: string | undefined = '';

  /**
   * 自填列表项适配器
   *
   * @author zhanghengfeng
   * @date 2024-05-21 17:05:50
   * @type {IAcItemProvider}
   */
  acItemProvider?: IAcItemProvider;

  /**
   * 分组行为状态
   */
  public groupActionState: IButtonContainerState = new ButtonContainerState();

  /**
   * @description 自填模式行为行为组
   * @type {IAppDEUIActionGroupDetail[]}
   * @memberof PickerEditorController
   */
  public actionDetails: IAppDEUIActionGroupDetail[] = [];

  /**
   * 当前页
   *
   * @type {number}
   * @default 1
   * @memberof PickerEditorController
   */
  curPage: number = 1;

  /**
   * 总条数
   *
   * @type {number}
   * @default 0
   * @memberof PickerEditorController
   */
  public total: number = 0;

  /**
   * 总页数
   *
   * @type {number}
   * @memberof PickerEditorController
   */
  public totalPages?: number;

  /**
   * 自填模式分页大小
   *
   * @type {number}
   * @memberof PickerEditorController
   */
  public pagingSize?: number;

  /**
   * 自填模式分页模式配置：0：不分页，1：分页栏，2：滚动加载，3：加载更多
   *
   * @type {number}
   * @memberof PickerEditorController
   */
  public pagingMode?: number;

  /**
   * 是否懒加载
   *
   * @readonly
   * @type {boolean}
   * @memberof PickerEditorController
   */
  get isLazyLoad(): boolean {
    return isNumber(this.pagingMode) && this.pagingMode !== 0;
  }

  /**
   * 是否显示加载更多
   *
   * @readonly
   * @type {boolean}
   * @memberof PickerEditorController
   */
  get isShowLoadMore(): boolean {
    return !!(
      this.isLazyLoad &&
      this.pagingMode === 3 &&
      this.totalPages &&
      this.curPage < this.totalPages
    );
  }

  protected async onInit(): Promise<void> {
    super.onInit();
    this.initParams();
    this.valueItem = this.model.valueItemName?.toLowerCase() || '';
    if (this.model.appDataEntityId) {
      if (this.model.appDEDataSetId) {
        this.interfaceName = this.model.appDEDataSetId;
      }
      if (this.model.appDEACModeId) {
        this.deACMode = await getDeACMode(
          this.model.appDEACModeId,
          this.model.appDataEntityId,
          this.context.srfappid,
        );
        if (this.deACMode) {
          // 自填模式相关
          const {
            minorSortAppDEFieldId,
            minorSortDir,
            pagingMode,
            pagingSize,
          } = this.deACMode;
          this.pagingMode = pagingMode;
          this.pagingSize = pagingSize;
          if (minorSortAppDEFieldId && minorSortDir) {
            this.sort = `${minorSortAppDEFieldId.toLowerCase()},${minorSortDir.toLowerCase()}`;
          }
          if (this.deACMode.textAppDEFieldId) {
            this.textName = this.deACMode.textAppDEFieldId;
          }
          if (this.deACMode.valueAppDEFieldId) {
            this.keyName = this.deACMode.valueAppDEFieldId;
          }
          if (this.deACMode.deacmodeDataItems) {
            this.dataItems = [];
            this.deACMode.deacmodeDataItems.forEach(
              (dataItem: IDEACModeDataItem) => {
                if (dataItem.id !== 'value' && dataItem.id !== 'text') {
                  this.dataItems.push(dataItem);
                }
              },
            );
          }
          if (this.deACMode.itemSysPFPluginId) {
            this.acItemProvider = await getAcItemProvider(this.deACMode);
          }
        }
      }
    }
    // 这三种嵌入选择视图的需要预先加载视图模型用于绘制
    const embedViewEditors = [
      'PICKEREX_DROPDOWNVIEW',
      'PICKEREX_DROPDOWNVIEW_LINK',
      'PICKUPVIEW',
      'MOBPICKER_DROPDOWNVIEW',
    ];
    if (
      this.model.editorType &&
      embedViewEditors.includes(this.model.editorType)
    ) {
      this.initPickupViewParams();
    }
    this.objectIdField = this.model.objectIdField?.toLowerCase();
    this.objectNameField = this.model.objectNameField?.toLowerCase();
    this.objectValueField = this.model.objectValueField?.toLowerCase();
    if (this.model.uiactionGroup) {
      this.actionDetails = this.model.uiactionGroup.uiactionGroupDetails || [];
      if (this.actionDetails.length > 0) {
        this.actionDetails.forEach(detail => {
          const actionid = detail.uiactionId;
          if (actionid) {
            const buttonState = new UIActionButtonState(
              detail.id!,
              this.context.srfappid!,
              actionid,
            );
            this.groupActionState.addState(detail.id!, buttonState);
          }
        });
        await this.groupActionState.init();
        // 转换多语言
        this.actionDetails.forEach(detail => {
          if (detail.capLanguageRes && detail.capLanguageRes.lanResTag) {
            detail.caption = ibiz.i18n.t(
              detail.capLanguageRes.lanResTag,
              detail.caption,
            );
          }
          if (
            detail.tooltipLanguageRes &&
            detail.tooltipLanguageRes.lanResTag
          ) {
            detail.tooltip = ibiz.i18n.t(
              detail.tooltipLanguageRes.lanResTag,
              detail.tooltip,
            );
          }
        });
      }
    }
  }

  /**
   * 初始化noAc和noButton
   */
  public initParams(): void {
    switch (this.model.editorType) {
      case 'PICKEREX_NOAC':
      case 'PICKEREX_NOAC_LINK':
        this.noAC = true;
        break;
      case 'PICKEREX_NOBUTTON':
        this.noButton = true;
        break;
      default:
        this.noButton = false;
        this.noAC = false;
    }
  }

  /**
   * 初始化选择视图相关参数
   */
  public async initPickupViewParams(): Promise<void> {
    if (this.model.pickupAppViewId) {
      this.pickupView = await ibiz.hub.config.view.get(
        this.model.pickupAppViewId,
      );
    }
  }

  /**
   * 初始化链接视图相关参数
   */
  public async initLinkViewParams(): Promise<void> {
    if (this.model.linkAppViewId) {
      this.linkView = await ibiz.hub.config.view.get(this.model.linkAppViewId);
    }
  }

  /**
   * 加载实体数据集数据
   *
   * @param {string} query 模糊匹配字符串
   * @param {IData} data 表单数据
   * @returns {*}  {Promise<IHttpResponse<IData[]>>}
   * @memberof PickerEditorController
   */
  public async getServiceData(
    query: string,
    data: IData,
    options?: {
      isLoadMore?: boolean;
    },
  ): Promise<IHttpResponse<IData[]>> {
    const { context, params } = this.handlePublicParams(
      data,
      this.context,
      this.params,
    );
    // 固定参数
    const fixedParams = {};
    if (ibiz.config.pickerdefaultsort) {
      Object.assign(fixedParams, { sort: ibiz.config.pickerdefaultsort });
    }
    if (this.sort && !Object.is(this.sort, '')) {
      Object.assign(fixedParams, { sort: this.sort });
    }
    if (query) {
      Object.assign(fixedParams, { query });
    }
    Object.assign(fixedParams, { size: 1000 });
    if (this.isLazyLoad) {
      // 初始加载需要重置分页
      const isLoadMore = options?.isLoadMore === true;
      if (isLoadMore) {
        this.curPage += 1;
      } else {
        this.curPage = 1;
      }
    }

    // 是懒加载并且有size才给page和size。size默认值给0就不传分页和大小
    if (this.isLazyLoad && this.pagingSize) {
      Object.assign(fixedParams, {
        size: this.pagingSize,
        page: this.curPage - 1,
      });
    }
    // 合并计算出来的参数和固定参数，以计算参数为准
    const tempParams = mergeDeepLeft(params, fixedParams);
    if (this.interfaceName) {
      const app = ibiz.hub.getApp(this.context.srfappid);
      const res = await app.deService.exec(
        this.model.appDataEntityId!,
        this.interfaceName,
        context,
        tempParams,
      );

      if (res.headers) {
        if (res.headers['x-total']) {
          this.total = Number(res.headers['x-total']);
        }
        if (res.headers['x-total-pages']) {
          this.totalPages = Number(res.headers['x-total-pages']);
        }
      }
      return res as IHttpResponse<IData[]>;
    }
    throw new RuntimeModelError(
      this.model,
      ibiz.i18n.t('editor.common.entityConfigErr'),
    );
  }

  /**
   * 打开数据选择视图
   *
   * @param {IData} data 数据对象
   * @param {IData[]} selectedData 选中项集合
   * @returns {*}  {(Promise<IData[] | undefined>)}
   * @memberof PickerEditorController
   */
  public async openPickUpView(
    data: IData,
    selectedData?: string,
  ): Promise<IData[] | undefined> {
    await this.initPickupViewParams();
    const { context, params } = this.handlePublicParams(
      data,
      this.context,
      this.params,
    );
    if (selectedData) {
      params.selecteddata = selectedData;
    }
    if (!this.pickupView) {
      throw new RuntimeModelError(
        this.model,
        ibiz.i18n.t('editor.common.selectViewConfigErr'),
      );
    }
    // 模态打开视图
    const res = await ibiz.commands.execute<IModalData>(
      OpenAppViewCommand.TAG,
      this.pickupView.id,
      context,
      { checkstrictly: true, ...params },
      { openMode: 'POPUPMODAL' },
    );
    if (res && res.ok && res.data) {
      return res.data;
    }
    ibiz.log.debug('模态取消或关闭异常', res);
  }

  /**
   * 打开数据链接视图
   */
  public async openLinkView(data: IData): Promise<IModalData | undefined> {
    const tempContext = this.context.clone();
    if (data[this.valueItem]) {
      tempContext.srfkey = data[this.valueItem];
    }
    const { context, params } = this.handlePublicParams(
      data,
      tempContext,
      this.params,
    );

    const { linkAppViewId } = this.model;
    if (!linkAppViewId) {
      throw new RuntimeModelError(
        this.model,
        ibiz.i18n.t('editor.common.linkViewConfigErr'),
      );
    }
    return ibiz.commands.execute<IModalData>(
      OpenAppViewCommand.TAG,
      linkAppViewId,
      context,
      params,
    );
  }

  /**
   * 计算回填数据
   *
   * @author lxm
   * @date 2022-10-24 16:10:24
   * @param {IData} data 选中数据
   * @returns {*}  {Promise<Array<{ id: string; value: any }>>}
   */
  async calcFillDataItems(
    data: IData,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<Array<{ id: string; value: any }>> {
    if (this.deACMode) {
      if (this.dataItems.length === 0) {
        return [];
      }
      const result = await Promise.all(
        this.dataItems.map(item => {
          const value = data[item.appDEFieldId!];
          if (item.format) {
            // todo 值格式化
          } else if (item.convertToCodeItemText && item.codeListId) {
            // todo 代码表转换为文本值
          } else if (item.customCode) {
            // todo 脚本代码
          }
          return { id: item.id!, value };
        }),
      );
      return result;
    }
    return [];
  }

  /**
   * 处理对象数据类型抛值
   * @param {IData} select
   * @return {*}
   * @author: zhujiamin
   * @Date: 2023-08-22 15:58:56
   */
  handleObjectParams(select: IData): IData {
    const object: IData = {};
    if (this.objectIdField) {
      Object.assign(object, {
        [this.objectIdField]: select[this.keyName],
      });
    }
    if (this.objectNameField) {
      Object.assign(object, {
        [this.objectNameField]: select[this.textName],
      });
    }
    if (this.objectValueField) {
      // 删除值回显时手动填充的前端字段srfkey和srfmajortext
      const data = {
        ...select,
      };
      delete data.srfkey;
      delete data.srfmajortext;
      Object.assign(object, {
        [this.objectValueField]: data,
      });
    }
    if (select.srfnodeid) {
      Object.assign(object, {
        srfnodeid: select.srfnodeid,
      });
    }
    return object;
  }

  /**
   * @description 分组行为项点击
   * @param {IUIActionGroupDetail} detail
   * @param {MouseEvent} event
   * @return {*}  {Promise<void>}
   * @memberof PickerEditorController
   */
  async onActionClick(
    detail: IUIActionGroupDetail,
    data: IData,
    event?: MouseEvent,
  ): Promise<void> {
    const actionId = detail.uiactionId;
    await UIActionUtil.execAndResolved(
      actionId!,
      {
        context: this.context,
        params: this.params,
        data: [data],
        view: this.view,
        event,
      },
      detail.appId,
    );
  }
}
