/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  IEditor,
  IEditorItem,
  INavigateParamContainer,
} from '@ibiz/model-core';
import { DataTypes } from '@ibiz-template/core';
import dayjs from 'dayjs';
import { convertNavData } from '../../../utils';
import {
  IViewController,
  IEditorController,
  IControlController,
  IEditorContainerController,
} from '../../../interface/controller';
import { ValueExUtil } from '../../utils';
import { ControlController } from '../control';

/**
 * 编辑器控制器基类
 *
 * @author lxm
 * @date 2022-08-24 20:08:15
 * @export
 * @class EditorController
 */
export class EditorController<T extends IEditor = IEditor>
  implements IEditorController
{
  /**
   * 编辑器模型
   *
   * @author lxm
   * @date 2022-08-24 20:08:12
   * @type {T}
   */
  readonly model: T;

  /**
   * 编辑器样式
   *
   * @author chitanda
   * @date 2023-09-12 16:09:40
   * @type {IData}
   */
  readonly style: IData = {};

  /**
   * 上下文
   *
   * @author lxm
   * @date 2022-08-24 20:08:55
   * @type {IContext}
   */
  readonly context!: IContext;

  /**
   * 视图参数
   *
   * @author lxm
   * @date 2022-08-24 20:08:52
   * @type {IParams}
   */
  readonly params!: IParams;

  /**
   * 父控制器，可以使表单项控制器，也可以是表格编辑项控制器
   *
   * @author lxm
   * @date 2022-08-24 20:08:52
   */
  readonly parent: IEditorContainerController;

  /**
   * 占位
   * @return {*}
   * @author: zhujiamin
   * @Date: 2022-08-25 14:33:14
   */
  public placeHolder = '';

  /**
   * 占位
   * @return {*}
   * @author: zhujiamin
   * @Date: 2022-08-25 14:33:14
   */
  public editorParams: IData = {};

  /**
   * 额外参数
   *
   * @type {IData}
   * @memberof EditorController
   */
  public extraParams: IData = {};

  /**
   * 是否只读
   *
   * @author lxm
   * @date 2022-12-12 21:12:51
   * @readonly
   */
  get readonly(): boolean {
    return !!this.model.readOnly;
  }

  /**
   * 值格式化
   * @author lxm
   * @date 2024-01-11 10:18:33
   * @readonly
   * @type {(string | undefined)}
   */
  get valueFormat(): string | undefined {
    return this.parent.valueFormat;
  }

  /**
   * 数据类型
   * @author lxm
   * @date 2024-01-11 10:18:55
   * @readonly
   * @type {(number  | undefined)}
   */
  get dataType(): number | undefined {
    return this.parent.dataType;
  }

  /**
   * 触发值变更模式
   *
   * @readonly
   * @type {string}
   * @memberof EditorController
   */
  get triggerMode(): string {
    if (this.editorParams.triggerMode) {
      return this.editorParams.triggerMode;
    }
    if (this.editorParams.triggermode) {
      return this.editorParams.triggermode;
    }
    const { form, grid, treeGrid } = this.parent as IData;
    const control: ControlController | undefined = form || grid || treeGrid;
    if (control?.controlParams.triggermode) {
      return control.controlParams.triggermode;
    }
    const app = ibiz.hub.getApp(this.context.srfappid);
    const appUserParam = app.model.userParam || {};
    if (appUserParam.triggerMode) {
      return appUserParam.triggerMode;
    }
    return 'blur';
  }

  /**
   * 无数据时是否显示占位文本
   *
   * @readonly
   * @type {boolean}
   * @memberof EditorController
   */
  get emptyShowPlaceholder(): boolean {
    if (!this.placeHolder) return false;
    // 表单控件参数
    if ((this.parent as IData).form?.controlParams?.emptyshowmode) {
      return (
        (this.parent as IData).form.controlParams.emptyshowmode ===
        'PLACEHOLDER'
      );
    }
    return ibiz.config.common.emptyShowMode === 'PLACEHOLDER';
  }

  /**
   * @description 获取下载凭证参数
   * @readonly
   * @type {{
   *     appEntityTag?: string;
   *     dataFieldTag?: string;
   *   }}
   * @memberof EditorController
   */
  get downloadTicketParams(): {
    appEntityTag?: string;
    dataFieldTag?: string;
  } {
    const downloadTicketParams = {};
    if (!this.model.editorParams) {
      return downloadTicketParams;
    }
    if (this.model.editorParams.appentitytag) {
      Object.assign(downloadTicketParams, {
        appEntityTag: this.model.editorParams.appentitytag,
      });
    }
    if (this.model.editorParams.datafieldtag) {
      Object.assign(downloadTicketParams, {
        dataFieldTag: this.model.editorParams.datafieldtag,
      });
    }
    return downloadTicketParams;
  }

  /**
   * @description 当前视图
   * @readonly
   * @type {IViewController}
   * @memberof EditorController
   */
  get view(): IViewController {
    const ctrl =
      (this.parent as IData).form ||
      (this.parent as IData).grid ||
      (this.parent as IData).treeGrid ||
      (this.parent as IData).panel;
    return ctrl.view;
  }

  /**
   * 当前部件
   *
   * @readonly
   * @type {IControlController}
   * @memberof EditorController
   */
  get ctrl(): IControlController {
    const ctrl =
      (this.parent as IData).form ||
      (this.parent as IData).grid ||
      (this.parent as IData).treeGrid ||
      (this.parent as IData).panel;
    return ctrl;
  }

  /**
   * Creates an instance of EditorController.
   * @author lxm
   * @date 2022-08-24 20:08:19
   * @param {T} model
   */
  constructor(model: T, parent: IEditorContainerController) {
    this.model = model;
    this.parent = parent;
    this.context = parent.context;
    this.params = parent.params;
  }

  /**
   * 子类不可覆盖或重写此方法，在 init 时需要重写的使用 onInit 方法。
   *
   * @author lxm
   * @date 2022-08-18 22:08:30
   * @returns {*}  {Promise<void>}
   */
  async init(): Promise<void> {
    await this.onInit();
  }

  protected async onInit(): Promise<void> {
    // 异步初始化
    if (this.model.placeHolder) {
      this.placeHolder = this.model.placeHolder;
    }
    if (this.model.editorParams) {
      Object.keys(this.model.editorParams).forEach(key => {
        this.editorParams[key] = this.model.editorParams![key];
      });
    }
    if (this.model.editorWidth) {
      const width = this.model.editorWidth;
      if (width > 0 && width <= 1) {
        this.style.width = `${width * 100}%`;
      } else {
        this.style.width = `${width}px`;
      }
    }
    if (this.model.editorHeight) {
      const height = this.model.editorHeight;
      if (height > 0 && height <= 1) {
        this.style.height = `${height * 100}%`;
      } else {
        this.style.height = `${height}px`;
      }
    }
    if (this.model.cssStyle) {
      // 解析字符串形式的cssStyle为对象
      const stylesObject: IData = {};
      const stylesArray = this.model.cssStyle.split(';').filter(Boolean);
      stylesArray.forEach(style => {
        const [key, value] = style.split(':');
        if (key && value) {
          stylesObject[key.trim()] = value.trim();
        }
        Object.assign(this.style, stylesObject);
      });
    }
    // 值项过滤掉自身
    if (this.model.editorItems) {
      this.model.editorItems = this.model.editorItems.filter(
        (item: IEditorItem) => item.id !== this.model.id,
      );
    }
  }

  /**
   * 公共参数处理，计算上下文和视图参数
   *
   * @return {*}
   * @author: zhujiamin
   * @Date: 2022-08-25 15:44:14
   */
  public handlePublicParams(
    data: IData,
    context: IContext,
    params: IParams,
  ): { context: IContext; params: IParams } {
    const { navigateContexts, navigateParams } = this
      .model as INavigateParamContainer;
    let selfContext = {};
    if (navigateContexts && data) {
      selfContext = convertNavData(navigateContexts!, data, params, context);
    }
    const _context = Object.assign(context.clone(), selfContext);

    let selfParams = {};
    if (navigateParams && data) {
      selfParams = convertNavData(navigateParams!, data, params, context);
    }
    return { context: _context, params: selfParams };
  }

  /**
   * 字符串转对象、数组对象
   *
   * @author chitanda
   * @date 2023-08-02 17:08:03
   * @param {string} value
   * @return {*}  {(IData | IData[] | undefined)}
   */
  toObj(value: string): IData | IData[] | undefined {
    if (!value) {
      return undefined;
    }
    // eslint-disable-next-line no-new-func
    const func = new Function(`return (${value});`);
    return func() as IData;
  }

  /**
   * 字符串布尔转布尔类型
   *
   * @author chitanda
   * @date 2023-08-02 17:08:34
   * @param {string} value
   * @return {*}  {boolean}
   */
  toBoolean(value: string): boolean {
    return Object.is('true', value);
  }

  /**
   * 值格式化
   * @author lxm
   * @date 2023-08-25 05:18:11
   * @param {unknown} value
   * @return {*}  {string}
   */
  formatValue(value: unknown = ''): string {
    // 根据数据类型增强转换显示文本
    if (this.model.valueType !== 'SIMPLE') {
      return ValueExUtil.toText(this.model, value);
    }

    // 根据格式化配置格式化显示
    const strVal = `${value}`;
    if (!this.valueFormat) {
      return strVal;
    }
    const isDate = DataTypes.isDate(this.dataType!);
    if (isDate) {
      const formatVal = dayjs(strVal).format(this.valueFormat);
      if (formatVal !== 'Invalid Date') {
        return formatVal;
      }
      return strVal;
    }
    return ibiz.util.text.format(strVal, this.valueFormat);
  }
}
