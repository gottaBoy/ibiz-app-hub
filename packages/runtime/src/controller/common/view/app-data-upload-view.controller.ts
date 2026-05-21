import { IAppView } from '@ibiz/model-core';
import { SelectFileOpts } from '@ibiz-template/core';
import {
  IAppDataUploadViewState,
  IViewController,
  IViewEvent,
} from '../../../interface';
import { ViewController } from './view.controller';
import {
  ImportDataResult,
  asyncImportData2,
  downloadImportTemplate,
  getDataImportModels,
  selectAndImport,
} from '../../utils';

export class AppDataUploadViewController<
    T extends IAppView = IAppView,
    S extends IAppDataUploadViewState = IAppDataUploadViewState,
    E extends IViewEvent = IViewEvent,
  >
  extends ViewController<T, S, E>
  implements IViewController<T, S, E>
{
  protected initState(): void {
    super.initState();
  }

  protected async onCreated(): Promise<void> {
    await super.onCreated();

    // 加载模型数据
    const { srfappdataentityid, srfdedataimportid, srfappid } = this.context;
    const { appDataEntity, deDataImport } = await getDataImportModels({
      appDataEntityId: srfappdataentityid,
      deDataImportId: srfdedataimportid,
      appId: srfappid,
    });
    this.state.appDataEntity = appDataEntity;
    this.state.deDataImport = deDataImport;
  }

  /**
   * 下载模版文件
   * @author lxm
   * @date 2024-04-16 02:15:29
   */
  downloadTemplate(): void {
    const { appDataEntity, deDataImport } = this.state;
    downloadImportTemplate(
      appDataEntity,
      deDataImport,
      this.context,
      this.params,
    );
  }

  /**
   * 选中导入文件并导入
   * @param {SelectFileOpts} [fileOpts]
   * @author lxm
   * @date 2024-04-16 03:54:19
   * @return {*}
   */
  async selectAndImport(fileOpts?: SelectFileOpts): Promise<ImportDataResult> {
    const result = await selectAndImport({
      appDataEntity: this.state.appDataEntity,
      dataImport: this.state.deDataImport,
      context: this.context,
      params: this.params,
      fileOpts,
    });
    // 异步导入的时候直接关闭视图
    if (result.isAsync === true) {
      this.closeView();
    }
    return result;
  }

  /**
   * 自定义导入数据方法
   * @author lxm
   * @date 2024-04-18 05:17:22
   * @param {{
   *     fileId: string;
   *     schemaId: string;
   *   }} opts
   * @return {*}  {Promise<void>}
   */
  async asyncImportData2(opts: {
    fileId: string;
    schemaId: string;
  }): Promise<void> {
    return asyncImportData2({
      appDataEntity: this.state.appDataEntity,
      dataImport: this.state.deDataImport,
      context: this.context,
      ...opts,
    });
  }
}
