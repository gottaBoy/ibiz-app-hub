import { RuntimeModelError } from '@ibiz-template/core';
import { EditorController } from '@ibiz-template/runtime';
import { IFileUploader } from '@ibiz/model-core';

/**
 * 文件上传编辑器控制器
 * @return {*}
 * @author: zhujiamin
 * @Date: 2022-08-25 10:57:58
 */
export class UploadEditorController extends EditorController<IFileUploader> {
  /**
   * 是否支持拖拽
   */
  public isDrag: boolean = false;

  /**
   * 是否多选
   */
  public multiple: boolean = true;

  /**
   * 接受上传的文件类型
   */
  public accept: string = '';

  /**
   * 上传参数
   */
  public uploadParams?: IParams;

  /**
   * 下载参数
   */
  public exportParams?: IParams;

  /**
   * @description 是否启用无权限
   * @type {boolean}
   * @memberof UploadEditorController
   */
  public enableNoAccess: boolean = false;

  /**
   * @description 是否使用全局文件下载前缀
   * @memberof UploadEditorController
   */
  public globalDownloadPrifix = false;

  /**
   * @description 是否显示加载动画
   * @readonly
   * @type {boolean}
   * @memberof UploadEditorController
   */
  get showLoading(): boolean {
    if (this.editorParams.showloading) {
      return Boolean(this.editorParams.showloading);
    }
    return ibiz.config.mob.showUploadLoading;
  }

  /**
   * @description 图片压缩范围（超过该范围进行压缩，单位kb）
   * @readonly
   * @memberof UploadEditorController
   */
  get imgCompressLimit(): number {
    if (this.editorParams.imgcompresslimit) {
      return Number(this.editorParams.imgcompresslimit);
    }
    return ibiz.config.imgCompressConfig.limit;
  }

  /**
   * @description 图片压缩质量（0-1，为0时不压缩，默认为0）
   * @readonly
   * @memberof UploadEditorController
   */
  get imgCompressQuality(): number {
    if (this.editorParams.imgcompressquality) {
      return Number(this.editorParams.imgcompressquality);
    }
    return ibiz.config.imgCompressConfig.quality;
  }

  /**
   * @description 压缩图片最大宽度，默认为1280px
   * @readonly
   * @memberof UploadEditorController
   */
  get imgCompressMaxWidth(): number {
    if (this.editorParams.imgcompressmaxwidth) {
      return Number(this.editorParams.imgcompressmaxwidth);
    }
    return ibiz.config.imgCompressConfig.maxWidth;
  }

  /**
   * 文件类型
   *
   * @author zk
   * @date 2023-12-07 03:12:25
   * @memberof UploadEditorController
   */
  public fileTypeMap = new Map([
    // word文档
    ['docx', 'docx'],
    ['doc', 'docx'],
    ['dotx', 'docx'],
    ['dot', 'docx'],
    // pdf
    ['pdf', 'pdf'],
    // text
    ['txt', 'text'],
    //
    ['xlsx', 'excel'],
    ['xls', 'excel'],
    ['xlsm', 'excel'],
    ['xlsb', 'excel'],
    ['csv', 'excel'],
    // ppt
    ['pptx', 'ppt'],
    // 图片
    ['jpg', 'img'],
    ['png', 'img'],
    ['gif', 'img'],
    ['bmp', 'img'],
    ['svg', 'img'],
    // 音频
    ['mp3', 'audio'],
    ['wav', 'audio'],
    ['aac', 'audio'],
    ['flac', 'audio'],
    ['wma', 'audio'],
    // 视频
    ['mp4', 'video'],
    ['avi', 'video'],
    ['mov', 'video'],
    ['mkv', 'video'],
    ['wmv', 'video'],
    // 压缩
    ['zip', 'zip'],
    ['rar', 'zip'],
    ['7z', 'zip'],
    ['gz', 'zip'],
    ['tar', 'zip'],
  ]);

  protected async onInit(): Promise<void> {
    await super.onInit();
    // 图片类型增加图片类型限制
    if (this.model.editorType?.includes('PICTURE')) {
      this.accept = 'image/*';
    }

    // 单项的编辑器类型的设置单选
    if (
      [
        'MOBSINGLEFILEUPLOAD',
        'MOBPICTURE',
        'MOBPICTURE_RAW',
        'FILEUPLOADER_ONE',
        'PICTURE_ONE',
        'PICTURE_ONE_RAW',
      ].includes(this.model.editorType!)
    ) {
      this.multiple = false;
    }
    if (this.editorParams) {
      const {
        isDrag,
        multiple,
        accept,
        uploadParams,
        exportParams,
        uploadparams,
        exportparams,
        enablenoaccess,
        globaldownloadprifix,
      } = this.editorParams;
      if (isDrag) {
        this.isDrag = Boolean(isDrag);
      }
      if (multiple) {
        this.multiple = Boolean(multiple);
      }
      if (accept) {
        this.accept = accept;
      }
      if (uploadParams) {
        try {
          this.uploadParams = JSON.parse(uploadParams);
        } catch (error) {
          throw new RuntimeModelError(
            uploadParams,
            ibiz.i18n.t('editor.upload.uploadJsonFormatErr'),
          );
        }
      }
      if (uploadparams) {
        try {
          this.uploadParams = JSON.parse(uploadparams);
        } catch (error) {
          throw new RuntimeModelError(
            uploadparams,
            ibiz.i18n.t('editor.upload.uploadJsonFormatErr'),
          );
        }
      }
      if (exportParams) {
        try {
          this.exportParams = JSON.parse(exportParams);
        } catch (error) {
          throw new RuntimeModelError(
            exportParams,
            ibiz.i18n.t('editor.upload.exportJsonFormatErr'),
          );
        }
      }
      if (exportparams) {
        try {
          this.exportParams = JSON.parse(exportparams);
        } catch (error) {
          throw new RuntimeModelError(
            exportparams,
            ibiz.i18n.t('editor.upload.exportJsonFormatErr'),
          );
        }
      }
      if (enablenoaccess) {
        this.enableNoAccess = enablenoaccess === 'true';
      }
      this.globalDownloadPrifix =
        globaldownloadprifix === 'true' ||
        ibiz.config.common.globalDownloadPrifix;
    }
  }

  /**
   * 请求url获取文件流，并用JS触发文件下载
   *
   * @author lxm
   * @date 2022-11-17 14:11:09
   * @param {string} url
   * @param {IData} file
   */
  fileDownload(file: { url: string; name: string }): void {
    ibiz.platform.download(file.url, file.name);
  }
}
