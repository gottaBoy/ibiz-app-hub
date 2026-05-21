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
   * 上传的文件大小
   *
   * @type {number}
   * @memberof UploadEditorController
   */
  public size: number = 0;

  /**
   * 上传参数
   */
  public uploadParams?: IParams;

  /**
   * 下载参数
   */
  public exportParams?: IParams;

  /**
   * 上传文件信息的映射规则字符串，格式为"源键:目标键;源键2:目标键2"
   */
  public infoMap: string = '';

  /**
   * 自适应预览
   * 只读状态下且配置了编辑器参数autoPreview ，加载完图片后自动调整大小达到预览态，且禁用图片hover工具栏
   *
   * @type {boolean}
   * @memberof UploadEditorController
   */
  public autoPreview: boolean = false;

  /**
   * 是否启用无权限
   *
   * @type {boolean}
   * @memberof UploadEditorController
   */
  public enableNoAccess: boolean = false;

  protected async onInit(): Promise<void> {
    await super.onInit();
    this.infoMap = ibiz.config.uploadEditor.infoMap;

    // 图片类型增加图片类型限制
    if (this.model.editorType?.includes('PICTURE')) {
      this.accept = 'image/*';
    }

    // 单项的编辑器类型的设置单选
    if (
      [
        'FILEUPLOADER_ONE',
        'PICTURE_ONE',
        'PICTURE_ONE_RAW',
        'MOBSINGLEFILEUPLOAD',
        'MOBPICTURE_RAW',
      ].includes(this.model.editorType!)
    ) {
      this.multiple = false;
    }
    if (this.editorParams) {
      const {
        isDrag,
        multiple,
        accept,
        size,
        uploadParams,
        exportParams,
        autoPreview,
        isdrag,
        uploadparams,
        exportparams,
        autopreview,
        infomap,
        enablenoaccess,
      } = this.editorParams;
      if (isDrag) {
        this.isDrag = Boolean(isDrag);
      }
      if (isdrag) {
        this.isDrag = Boolean(isdrag);
      }
      if (autoPreview) {
        this.autoPreview = autoPreview;
      }
      if (autopreview) {
        this.autoPreview = autopreview;
      }
      if (multiple) {
        this.multiple = Boolean(multiple);
      }
      if (accept) {
        this.accept = accept;
      }
      if (size) {
        this.size = Number(size);
      }
      if (infomap) {
        this.infoMap = infomap;
      }
      if (enablenoaccess) {
        this.enableNoAccess = enablenoaccess === 'true';
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
    }
  }

  /**
   * 根据配置的映射关系转换对象属性
   * 将源对象的指定属性，按照映射规则映射到新对象的目标属性
   *
   * @param {IData} [_data={}] - 源数据对象，包含需要被映射的原始属性
   * @param {string} [infoMap=''] - 映射规则字符串，格式为"源键:目标键;源键2:目标键2"
   * @param {boolean} [isEmit=false] - 是否为抛值时处理，抛值时将源键替换为目标键
   * @returns {IData} 转换后的新对象，仅包含映射规则中定义的属性
   *
   * @example
   * // isEmit=false
   * // 源对象：{ filesize:'10000', fileext:'.gif', folder:'file' };
   * // 映射规则：'filesize:size;fileext:ext;folder:folder';
   * // 转换结果: { size:'10000', ext:'.gif', folder:'file' }
   *
   * // isEmit=true
   * // 源对象：{ filesize:'10000', fileext:'.gif', folder:'file' };
   * // 映射规则：'filesize:size;fileext:ext;folder:folder';
   * // 转换结果: { size:undefined, ext:undefined, folder:'file' }
   */
  transformInfoMap = (
    _data: IData = {},
    infoMap = '',
    isEmit = false,
  ): IData => {
    const result = {};
    const mappings = infoMap.split(';');
    mappings.forEach(mapping => {
      // eslint-disable-next-line prefer-const
      let [sourceKey, targetKey] = mapping.split(':');
      if (isEmit) sourceKey = targetKey;
      if (sourceKey && targetKey) {
        Object.assign(result, { [targetKey]: _data[sourceKey] });
      }
    });

    return result;
  };
}
