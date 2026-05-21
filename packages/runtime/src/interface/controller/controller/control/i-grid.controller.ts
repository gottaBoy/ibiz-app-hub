import { IDEGrid, IAppCodeList, IDEDataExportItem } from '@ibiz/model-core';
import { ControlVO } from '../../../../service';
import { IGridEvent } from '../../event';
import { IGridRowState, IGridState } from '../../state';
import { IMDControlController } from './i-md-control.controller';
import {
  CodeListItem,
  IApiGridController,
  IApiExportParams,
} from '../../../api';
import { IViewController } from '../view';

/**
 * @description 表格控制器
 * @export
 * @interface IGridController
 * @extends {IMDControlController<T, S, E>}
 * @extends {IApiGridController<T, S>}
 * @template T
 * @template S
 * @template E
 */
export interface IGridController<
  T extends IDEGrid = IDEGrid,
  S extends IGridState = IGridState,
  E extends IGridEvent = IGridEvent,
> extends IMDControlController<T, S, E>,
    IApiGridController<T, S> {
  /**
   * @description 当前上下文环境的视图控制器
   * @type {IViewController}
   * @memberof IMDControlController
   */
  view: IViewController;

  /**
   * @description 保存单条数据
   * @param {ControlVO} data
   * @returns {*}  {Promise<void>}
   * @memberof IGridController
   */
  save(data: ControlVO): Promise<void>;

  /**
   * @description 校验单条数据
   * @param {IGridRowState} row
   * @returns {*}  {Promise<boolean>}
   * @memberof IGridController
   */
  validate(row: IGridRowState): Promise<boolean>;

  /**
   * @description 设置点击分组后回显相关参数
   * @param {IData} data
   * @memberof IGridController
   */
  setGroupParams(data: IData): void;

  /**
   * @description 导出数据
   * @param {{ event: MouseEvent; params: IApiExportParams }} args
   * @returns {*}  {Promise<void>}
   * @memberof IGridController
   */
  exportData(args: {
    event: MouseEvent;
    params: IApiExportParams;
  }): Promise<void>;
}

interface AdditionalProperties {
  /**
   * @description 代码表模型
   * @type {IAppCodeList}
   * @memberof AdditionalProperties
   */
  codeList?: IAppCodeList;

  /**
   * @description 代码表项
   * @type {readonly}
   * @memberof AdditionalProperties
   */
  codeListItems?: readonly CodeListItem[];
}

/**
 * @description 封装的导出列模型
 * @export
 * @interface IExportColumn
 * @extends {IDEDataExportItem}
 * @extends {AdditionalProperties}
 */
export interface IExportColumn
  extends IDEDataExportItem,
    AdditionalProperties {}
