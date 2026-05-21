import {
  IHttpResponse,
  IPortalAsyncAction,
  IPortalMessage,
  RuntimeError,
  SelectFileOpts,
  selectFile,
} from '@ibiz-template/core';
import { IAppDEDataImport, IAppDataEntity } from '@ibiz/model-core';
import { mergeRight } from 'ramda';
import { calcResPath } from '../../../service';
import { OpenAppViewCommand } from '../../../command';
import { IViewConfig } from '../../../interface';

// 异步导入URL
const asyncImportUrl = 'asyncimportdata2';

// 标准导入url
const importUrl = 'importdata2';

// 导入结果类型
export type ImportDataResult = {
  /**
   * 是否是异步导入
   */
  isAsync?: boolean;
  /**
   * 是否取消
   */
  cancel?: boolean;
  // 下面的是同步导入才有的属性
  total?: number;
  success?: number;
  message?: string;
  errorMessage?: string;
};

// 导出结果类型
export type IExportDataResult = {
  // 是否导出成功
  ok: boolean;
  // 导出文件地址 (后期异步导出可能会用到)
  url?: string;
};

/**
 * 监听异步作业
 *
 * @author zk
 * @date 2023-10-31 03:10:31
 * @param {string} id
 * @return {*}  {Promise<ImportDataResult>}
 */
function listenAsyncAction(id: string): Promise<void> {
  return new Promise(resolve => {
    const callBack = (msg: IPortalMessage): void => {
      // 兼容接口返回类型与实际返回类型不一致
      const messageid = msg.messageid || (msg.data as IData).asyncacitonid;
      if (id !== messageid) {
        return;
      }
      const state = (msg.data as IPortalAsyncAction).actionstate;
      if (state === 30 || state === 40) {
        resolve();
        // 异步作业结束 取消订阅
        ibiz.mc.command.asyncAction.off(callBack);
      }
    };
    ibiz.mc.command.asyncAction.on(callBack);
  });
}

/**
 * 异步作业导入方法
 *
 * @author zk
 * @date 2023-10-31 02:10:06
 * @export
 * @param {File} file
 * @param {IAppDataEntity} appDataEntity
 * @return {*}  {Promise<IData>}
 */
export async function asyncImportData(
  file: File,
  appDataEntity: IAppDataEntity,
  dataImport?: IAppDEDataImport,
  context?: IContext,
  params?: IParams,
): Promise<void> {
  // 异步导入开始的提示
  ibiz.notification.info({
    desc: ibiz.i18n.t('runtime.controller.utils.dataFileUtil.startImport'),
  });

  const data = new FormData();
  data.append('file', file);
  let url = `/${appDataEntity.deapicodeName2}/${asyncImportUrl}`;

  const queryParam: IParams = { ...(params || {}) };
  if (dataImport?.codeName) {
    Object.assign(queryParam, {
      srfimporttag: dataImport.codeName,
    });
  }
  if (context?.srfdatatype) {
    Object.assign(queryParam, { srfdatatype: context.srfdatatype });
  }
  if (context) {
    const resPath = calcResPath(context, appDataEntity);
    url = resPath + url;
  }
  const app = ibiz.hub.getApp(context?.srfappid);
  const res = await app.net.request(url, {
    method: 'post',
    data,
    params: queryParam,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  await listenAsyncAction(res.data.asyncacitonid);
  // 模拟表单通知 刷新表格
  ibiz.mc.command.send(
    { srfdecodename: appDataEntity.codeName },
    'OBJECTCREATED',
    'DATAIMPORT',
  );
}

/**
 * 标准导入方法
 *
 * @author zk
 * @date 2023-10-31 02:10:29
 * @export
 * @param {File} file
 * @param {IAppDataEntity} appDataEntity
 * @return {*}  {Promise<IData>}
 */
export async function importData(
  file: File,
  appDataEntity: IAppDataEntity,
  dataImport?: IAppDEDataImport,
  context?: IContext,
  params?: IParams,
): Promise<ImportDataResult> {
  const data = new FormData();
  data.append('file', file);
  let url = `/${appDataEntity.deapicodeName2}/${importUrl}`;

  const queryParam: IParams = { ...(params || {}) };
  if (dataImport?.codeName) {
    Object.assign(queryParam, {
      srfimporttag: dataImport.codeName,
    });
  }
  if (context?.srfdatatype) {
    Object.assign(queryParam, { srfdatatype: context.srfdatatype });
  }

  if (context) {
    const resPath = calcResPath(context, appDataEntity);
    url = resPath + url;
  }

  const result: ImportDataResult = {
    isAsync: false,
  };
  try {
    const app = ibiz.hub.getApp(context?.srfappid);
    const res = await app.net.request(url, {
      method: 'post',
      data,
      params: queryParam,
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    // 模拟表单通知 刷新表格
    ibiz.mc.command.send(
      { srfdecodename: appDataEntity.codeName },
      'OBJECTCREATED',
      'DATAIMPORT',
    );

    Object.assign(result, res.data);
  } catch (error) {
    if (error instanceof Error) {
      result.errorMessage = error.message;
    }
  }

  return result;
}

/**
 * 新的导入，异步导入和同步导入内部判断
 * 异步导入不等待，同步等待结果后返回
 * @author lxm
 * @date 2024-04-16 03:34:56
 * @export
 * @param {{
 *   selectedFile: File;
 *   appDataEntity: IAppDataEntity;
 *   dataImport?: IAppDEDataImport;
 *   context?: IContext;
 * }} opts
 * @return {*}  {Promise<ImportDataResult>}
 */
export async function importData2(opts: {
  selectedFile: File;
  appDataEntity: IAppDataEntity;
  dataImport?: IAppDEDataImport;
  context?: IContext;
  params?: IParams;
}): Promise<ImportDataResult> {
  const result: ImportDataResult = {
    isAsync: ibiz.env.enableMqtt,
  };
  if (ibiz.env.enableMqtt) {
    // 异步导入不需要等待
    asyncImportData(
      opts.selectedFile,
      opts.appDataEntity,
      opts.dataImport,
      opts.context,
      opts.params,
    );
  } else {
    // 默认同步导入，返回结果
    const temp = await importData(
      opts.selectedFile,
      opts.appDataEntity,
      opts.dataImport,
      opts.context,
      opts.params,
    );
    Object.assign(result, temp);
  }

  return result;
}

/**
 * 标准导出方法
 *
 * @author zk
 * @date 2023-10-31 09:10:13
 * @export
 * @param {string[]} header
 * @param {IData[][]} data
 * @param {string} fileName
 * @return {*}  {Promise<IExportDataResult>}
 */
export async function exportData(
  header: string[],
  data: IData[][],
  fileName: string,
): Promise<IExportDataResult> {
  if (!ibiz.util.getExcelUtil) {
    throw new RuntimeError(
      ibiz.i18n.t('runtime.controller.utils.dataFileUtil.noExist'),
    );
  }
  const exportExcel = await ibiz.util.getExcelUtil();
  if (!exportExcel) {
    throw new RuntimeError(
      ibiz.i18n.t('runtime.controller.utils.dataFileUtil.loadError'),
    );
  }
  try {
    exportExcel.exportJsonToExcel({
      header, // 表头内容 数组格式
      data, // 具体数据 这是个二维数组
      filename: fileName, // 文件名称
      autoWidth: true, // 单元格是否自适应
    });
    return { ok: true };
  } catch (error) {
    return { ok: false };
  }
}

/**
 * 获取导入相关模型
 * @author lxm
 * @date 2024-04-15 04:54:29
 * @export
 * @param {{
 *   deDataImportId: string;
 *   appDataEntityId: string;
 *   appId?: string;
 * }} opts
 * @return {*}  {Promise<{ dataImport: IAppDEDataImport; appDataEntity: IAppDataEntity }>}
 */
export async function getDataImportModels(opts: {
  deDataImportId: string;
  appDataEntityId: string;
  appId?: string;
}): Promise<{ deDataImport: IAppDEDataImport; appDataEntity: IAppDataEntity }> {
  const appDataEntity = await ibiz.hub.getAppDataEntity(
    opts.appDataEntityId,
    opts.appId,
  );
  const deDataImport = appDataEntity.appDEDataImports?.find(
    item => item.id === opts.deDataImportId,
  );
  if (!deDataImport) {
    throw new RuntimeError(
      ibiz.i18n.t('runtime.controller.utils.dataFileUtil.importData'),
    );
  }
  return { deDataImport, appDataEntity };
}

/**
 * 打开数据导入界面
 * @author lxm
 * @date 2024-04-15 01:51:20
 * @export
 * @param {{
 *   deDataImportId: string;
 *   appDataEntityId: string;
 *   dataImportViewId?: string;
 *   context: IContext;
 *   params: IParams;
 *   viewOption?: IData;
 * }} opts
 * @return {*}  {Promise<void>}
 */
export async function openDataImport(opts: {
  deDataImportId: string;
  appDataEntityId: string;
  dataImportViewId?: string;
  context: IContext;
  params: IParams;
  event?: MouseEvent;
  viewOption?: IData;
}): Promise<void> {
  const { deDataImportId, appDataEntityId, context, params } = opts;
  const viewId = opts.dataImportViewId || 'AppDataUploadView';
  let view: IViewConfig | null = null;
  // 没有指定视图的时候，可能会拿不到默认视图
  try {
    view = await ibiz.hub.config.view.get(viewId);
  } catch (error) {
    if (opts.dataImportViewId) {
      // 指定了视图id找不到就报错
      throw error;
    }
  }
  if (view) {
    context.srfappdataentityid = appDataEntityId;
    context.srfdedataimportid = deDataImportId;

    // 走导入视图
    return ibiz.commands.execute(
      OpenAppViewCommand.TAG,
      view.id,
      context,
      params,
      { openMode: 'POPUPMODAL', event: opts.event, ...opts.viewOption },
    );
  }
  // 走自定义组件的导入
  const { deDataImport, appDataEntity } = await getDataImportModels({
    deDataImportId,
    appDataEntityId,
    appId: context.srfappid,
  });

  const importComponentName = deDataImport.enableCustomized
    ? 'DataImport2'
    : 'DataImport';
  const modal = ibiz.overlay.createModal(
    importComponentName,
    {
      dismiss: () => modal.dismiss(),
      dataImport: deDataImport,
      appDataEntity,
      context,
      params,
    },
    {
      width: 'auto',
      placement: 'center',
    },
  );
  modal.present();
  await modal.onWillDismiss();
}

/**
 * 下载导入模版文件
 * @author lxm
 * @date 2024-04-15 05:49:53
 * @export
 * @param {IAppDataEntity} appDataEntity
 * @param {IAppDEDataImport} dataImport
 * @return {*}  {Promise<void>}
 */
export async function downloadImportTemplate(
  appDataEntity: IAppDataEntity,
  dataImport?: IAppDEDataImport,
  context?: IContext,
  params?: IParams,
): Promise<void> {
  let templateUrl = `/${appDataEntity.codeName2!.toLowerCase()}/importtemplate`;
  const queryParam: IParams = { ...(params || {}) };
  if (dataImport?.codeName) {
    Object.assign(queryParam, { srfimporttag: dataImport.codeName });
  }
  if (context?.srfdatatype) {
    Object.assign(queryParam, { srfdatatype: context.srfdatatype });
  }
  if (context) {
    const resPath = calcResPath(context, appDataEntity);
    templateUrl = resPath + templateUrl;
  }
  const app = ibiz.hub.getApp(context?.srfappid);
  const res = await app.net.request(templateUrl, {
    responseType: 'blob',
    params: queryParam,
  });
  if (res.status === 200) {
    const fileName = ibiz.util.file.getFileName(res);
    const blob = new Blob([res.data as Blob], {
      type: 'application/vnd.ms-excel',
    });
    const elink = document.createElement('a');
    elink.download = fileName;
    elink.style.display = 'none';
    elink.href = URL.createObjectURL(blob);
    document.body.appendChild(elink);
    elink.click();
    URL.revokeObjectURL(elink.href); // 释放URL 对象
    document.body.removeChild(elink);
  }
}

/**
 * 选择文件并导入
 * @author lxm
 * @date 2024-04-16 02:31:24
 * @export
 * @param {{}} opts
 * @return {*}  {Promise<void>}
 */
export async function selectAndImport(opts: {
  appDataEntity: IAppDataEntity;
  dataImport?: IAppDEDataImport;
  context?: IContext;
  params?: IParams;
  fileOpts?: SelectFileOpts;
}): Promise<ImportDataResult> {
  return new Promise(resolve => {
    selectFile({
      accept: '.xlsx, .xls',
      multiple: false,
      onSelected: async files => {
        const result = await importData2({
          selectedFile: files[0],
          appDataEntity: opts.appDataEntity,
          dataImport: opts.dataImport,
          context: opts.context,
          params: opts.params,
        });
        resolve(result);
      },
      onCancel: () => {
        resolve({ cancel: true });
      },
      ...opts.fileOpts,
    });
  });
}

// 自定义导入相关

/**
 * 自定义导入数据方法
 * @author lxm
 * @date 2024-04-18 03:30:46
 * @export
 * @param {{
 *   appDataEntity: IAppDataEntity;
 *   context?: IContext;
 *   fileId: string; 导入文件id
 *   schemaId: string; 导入模版id
 * }} opts
 */
export async function asyncImportData2(opts: {
  appDataEntity: IAppDataEntity;
  dataImport?: IAppDEDataImport;
  context?: IContext;
  fileId: string;
  schemaId: string;
}): Promise<void> {
  let path = `/${opts.appDataEntity.codeName2!.toLowerCase()}`;
  if (opts.context) {
    const resPath = calcResPath(opts.context, opts.appDataEntity);
    path = resPath + path;
  }
  const url = `${path}/asyncimportdata2`;
  const queryData = {
    srfossfileid: opts.fileId,
    srfimportschemaid: opts.schemaId,
  };

  // 导入模型
  const srfimporttag =
    opts.dataImport?.id || opts.appDataEntity.defaultAppDEDataImportId;
  if (srfimporttag) {
    Object.assign(queryData, { srfimporttag });
  }
  const app = ibiz.hub.getApp(opts.context?.srfappid);
  await app.net.request(url, {
    method: 'get',
    params: queryData,
  });
  ibiz.notification.info({
    desc: ibiz.i18n.t('runtime.controller.utils.dataFileUtil.startImport'),
  });
}

export type ImportSchemaField = {
  name: string;
  index: number;
  caption: string;
};

export type ImportSchemaData = {
  id?: string;
  name: string;
  fields: ImportSchemaField[];
  system_tag: string; // 系统标记
  data_entity_tag: string; // 数据实体标记
  import_tag: string; // 导入标记 导入模型的代码名称
  owner_type: string; // 所有者类型
};

/**
 * 计算导入模型的schema数据
 * @author lxm
 * @date 2024-04-18 04:29:36
 * @export
 * @param {{
 *   appDataEntity?: IAppDataEntity;
 *   dataImport?: IAppDEDataImport;
 *   data: Partial<ImportSchemaData>;
 * }} opts
 * @return {*}  {ImportSchemaData}
 */
export function calcImportSchemaData(opts: {
  appDataEntity?: IAppDataEntity;
  dataImport?: IAppDEDataImport;
  data: Partial<ImportSchemaData>;
}): ImportSchemaData {
  let data = {
    system_tag: ibiz.appData?.context.srfsystemid, // 系统标记
    data_entity_tag: opts.appDataEntity?.codeName, // 数据实体标记
    import_tag:
      opts.dataImport?.id || opts.appDataEntity?.defaultAppDEDataImportId, // 导入标记 导入模型的代码名称
    owner_type: 'PERSONAL', // 所有者类型
  };
  data = mergeRight(data, opts.data);
  return data as ImportSchemaData;
}

/**
 * 创建新的schema
 * @author lxm
 * @date 2024-04-18 04:26:03
 * @export
 * @param {{
 *   appDataEntity?: IAppDataEntity;
 *   dataImport?: IAppDEDataImport;
 *   data: Partial<ImportSchemaData>;
 *   context?: IContext;
 * }} opts
 * @return {*}
 */
export async function createImportSchema(opts: {
  appDataEntity?: IAppDataEntity;
  dataImport?: IAppDEDataImport;
  data: Partial<ImportSchemaData>;
  context?: IContext;
}): Promise<IHttpResponse<IData>> {
  const data = calcImportSchemaData(opts);
  const url = `extension/import_schemas`;
  const app = ibiz.hub.getApp(opts.context?.srfappid);
  const res = await app.net.request(url, {
    method: 'post',
    data,
  });
  return res;
}

/**
 * 更新已有的schema
 * @author lxm
 * @date 2024-04-18 04:26:03
 * @export
 * @param {{
 *   appDataEntity?: IAppDataEntity;
 *   dataImport?: IAppDEDataImport;
 *   data: Partial<ImportSchemaData>;
 *   context?: IContext;
 * }} opts
 * @return {*}
 */
export async function updateImportSchema(opts: {
  appDataEntity?: IAppDataEntity;
  dataImport?: IAppDEDataImport;
  data: Partial<ImportSchemaData>;
  context?: IContext;
}): Promise<IHttpResponse<IData>> {
  const data = calcImportSchemaData(opts);
  const url = `extension/import_schemas/${data.id}`;
  const app = ibiz.hub.getApp(opts.context?.srfappid);
  const res = await app.net.request(url, {
    method: 'put',
    data,
  });
  return res;
}

/**
 * 获取指定id的schema数据
 * @author lxm
 * @date 2024-04-18 04:47:03
 * @export
 * @param {string} id
 * @param {IContext} [context]
 * @return {*}  {Promise<IHttpResponse<IData>>}
 */
export async function getImportSchema(
  id: string,
  context?: IContext,
): Promise<IHttpResponse<IData>> {
  const url = `extension/import_schemas/${id}`;
  const app = ibiz.hub.getApp(context?.srfappid);
  const res = await app.net.request(url, {
    method: 'get',
  });
  return res;
}

/**
 * 删除指定id的schema数据
 * @author lxm
 * @date 2024-04-18 04:47:03
 * @export
 * @param {string} id
 * @param {IContext} [context]
 * @return {*}  {Promise<IHttpResponse<IData>>}
 */
export async function deleteImportSchema(
  id: string,
  context?: IContext,
): Promise<IHttpResponse<IData>> {
  const url = `extension/import_schemas/${id}`;
  const app = ibiz.hub.getApp(context?.srfappid);
  const res = await app.net.request(url, {
    method: 'delete',
  });
  return res;
}

/**
 * 获取当前用户的指定实体和实体导入的schema集合数据
 * @author lxm
 * @date 2024-04-18 04:53:25
 * @export
 * @param {{
 *   appDataEntity: IAppDataEntity;
 *   dataImport?: IAppDEDataImport;
 *   context?: IContext;
 * }} opts
 * @return {*}  {Promise<IHttpResponse<IData[]>>}
 */
export async function fetchImportSchemas(opts: {
  appDataEntity: IAppDataEntity;
  dataImport?: IAppDEDataImport;
  context?: IContext;
}): Promise<IHttpResponse<IData[]>> {
  const params = {
    n_import_tag_eq: opts.appDataEntity.defaultAppDEDataImportId,
    n_system_tag_eq: ibiz.appData?.context.srfsystemid,
    n_data_entity_tag_eq: opts.appDataEntity.codeName,
  };
  const url = `extension/import_schemas/fetch_cur_user`;
  const app = ibiz.hub.getApp(opts.context?.srfappid);
  const res = await app.net.request(url, {
    method: 'post',
    data: params,
  });
  return res as IHttpResponse<IData[]>;
}
