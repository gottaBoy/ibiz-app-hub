/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-param-reassign */
import { HttpError } from '@ibiz-template/core';
import { UploadRawFile } from 'element-plus';
import { computed, ComputedRef, Ref, ref, watch } from 'vue';
import { UploadEditorController } from '../upload-editor.controller';

/**
 * iview的Upload适配逻辑
 *
 * @author lxm
 * @date 2022-11-17 16:11:12
 * @export
 * @param {IParams} props
 * @param {(_value: string | null) => {}} valueChange
 * @param {UploadEditorController} c
 * @returns {*}
 */
export function useIViewUpload(
  props: IParams,
  valueChange: (_value: string | null) => void,
  c: UploadEditorController,
): {
  uploadUrl: Ref<string>;
  headers: Ref<IData>;
  files: Ref<
    {
      id: string;
      name: string;
      url?: string | undefined;
      base64?: string | undefined;
    }[]
  >;
  limit: ComputedRef<1 | 9999>;
  onDownload: (file: IData) => void;
  onError: (...args: IData[]) => never;
  onRemove: (file: IData) => void;
  onSuccess: (response: IData) => void;
  beforeUpload: (rawFile: UploadRawFile) => boolean;
} {
  // 文件列表
  const files: Ref<
    {
      id: string;
      name: string;
      url?: string;
      base64?: string;
    }[]
  > = ref([]);

  // 请求头
  const uploadHeaders = ibiz.util.file.getUploadHeaders();
  const headers: Ref<IData> = ref({ ...uploadHeaders });

  // 上传文件路径
  const uploadUrl: Ref<string> = ref('');

  // 文件上传缓存对象
  const uploadCache: IData = {
    count: 0,
    cacheFiles: [], // iview上传过程中不能改default-file-list,所以需要缓存
  };

  // svg图片Blob路径存储
  const svgBlob: Map<string, string> = new Map();

  // 值响应式变更
  watch(
    () => props.value,
    newVal => {
      files.value = !newVal ? [] : JSON.parse(newVal);
    },
    { immediate: true },
  );

  /**
   * @description 获取下载路径,若业务数据中存在folder，则以业务数据中folder作为目录
   * @param {IData} data
   * @param {IData} file
   * @returns {*}  {string}
   */
  const getDownloadUrl = (data: IData, file: IData): string => {
    const editorParams: IData = {
      ...c.editorParams,
      enableNoAccess: c.enableNoAccess,
    };
    if (editorParams.exportparams) {
      editorParams.exportParams = JSON.parse(editorParams.exportparams);
    }
    if (editorParams.globaldownloadprifix) {
      editorParams.globalDownloadPrifix =
        editorParams.globaldownloadprifix === 'true';
    } else {
      editorParams.globalDownloadPrifix =
        ibiz.config.common.globalDownloadPrifix;
    }
    if (file && file.folder) {
      editorParams.osscat = file.folder;
    }
    const urls = ibiz.util.file.calcFileUpDownUrl(
      c.context,
      c.params,
      data,
      editorParams,
    );
    return urls.downloadUrl;
  };

  // data响应式变更基础路径
  watch(
    () => props.data,
    newVal => {
      if (newVal) {
        const editorParams: IData = {
          ...c.editorParams,
          enableNoAccess: c.enableNoAccess,
        };
        if (editorParams.uploadparams) {
          editorParams.uploadParams = JSON.parse(editorParams.uploadparams);
        }
        const urls = ibiz.util.file.calcFileUpDownUrl(
          c.context,
          c.params,
          newVal,
          editorParams,
        );
        uploadUrl.value = urls.uploadUrl;
      }
    },
    { immediate: true, deep: true },
  );

  // 获取svg以data:image开头的预览路径
  const fetchSVGAsBase64 = async (url: string) => {
    try {
      // 发起请求获取 SVG 文件
      const response = await fetch(url);

      // 检查响应状态
      if (!response.ok) {
        throw new Error(`Failed to fetch SVG: ${response.status}`);
      }

      // 读取响应体为 Blob
      const blob = await response.blob();

      // 将 Blob 转换为 base-64 编码的字符串
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onloadend = () => {
          const base64String = reader.result as string;
          // 添加正确的 MIME 类型前缀
          if (base64String) {
            const dataURL = base64String.replace(
              'data:application/octet-stream;base64',
              'data:image/svg+xml;base64',
            );
            resolve(dataURL);
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      ibiz.log.error((error as IData)?.message);
      throw error;
    }
  };

  // 计算svg的预览路径
  const calcSvgPreview = (file: IData) => {
    const blob = svgBlob.get(file.id);
    if (blob) {
      file.base64 = blob;
    } else {
      fetchSVGAsBase64(file.url).then(base64String => {
        file.base64 = base64String;
      });
    }
  };

  watch(
    files,
    newVal => {
      // 变更后且下载基础路径存在时解析
      if (newVal?.length) {
        newVal.forEach((file: IData) => {
          const downloadUrl = getDownloadUrl(props.data, file);
          file.url = file.url || downloadUrl.replace('%fileId%', file.id);
          if (ibiz.config.common.enableDownloadTicket && !c.enableNoAccess) {
            ibiz.util.file
              .getDownloadTicket(
                c.context,
                c.params,
                props.data,
                {
                  fileId: file.id,
                },
                c.downloadTicketParams,
              )
              .then(downloadTicket => {
                if (downloadTicket && downloadTicket.ticket) {
                  file.url = downloadUrl.replace(
                    '%fileId%',
                    downloadTicket.ticket,
                  );
                  if (file.name.split('.').pop() === 'svg') {
                    calcSvgPreview(file);
                  }
                }
              });
          } else if (file.name.split('.').pop() === 'svg') {
            calcSvgPreview(file);
          }
        });
      }
    },
    { immediate: true },
  );

  /**
   * 抛出值变更事件，根据files计算value
   *
   * @author lxm
   * @date 2022-11-17 14:11:54
   */
  const emitValue = () => {
    const _files = [...files.value, ...uploadCache.cacheFiles];
    const value: string | null =
      _files.length > 0
        ? JSON.stringify(
            _files.map(file => ({
              name: file.name,
              id: file.id,
              folder: file.folder,
              ...c.transformInfoMap(file, c.infoMap, true),
            })),
          )
        : null;
    uploadCache.cacheFiles = [];
    valueChange(value);
  };

  // 上传前回调
  const beforeUpload = (rawFile: UploadRawFile): boolean => {
    if (rawFile.name.split('.').pop() === 'svg') {
      // 上传的svg文件获取生成 blob 开头的图片路径
      const blobUrl = URL.createObjectURL(rawFile);
      svgBlob.set(rawFile.name, blobUrl);
    }
    const size = rawFile.size / 1024 / 1024;
    if (c.size && size > c.size) {
      ibiz.message.error(
        `${ibiz.i18n.t('editor.upload.fileSizeErr')} ${c.size}MB!`,
      );
      return false;
    }
    uploadCache.count += 1;
    return true;
  };

  // 上传成功回调
  const onSuccess = (response: IData) => {
    if (!response) {
      return;
    }

    // 启用传入下载凭证
    if (
      ibiz.config.common.enableDownloadTicket &&
      !c.enableNoAccess &&
      response.ticket
    ) {
      ibiz.util.file.setDownloadTicket(response.id, response.ticket);
    }

    uploadCache.cacheFiles.push({
      name: response.filename,
      id: response.fileid,
      folder: response.folder,
      ...c.transformInfoMap(response, c.infoMap),
    });
    if (response.name.split('.').pop() === 'svg') {
      const blob = svgBlob.get(response.name);
      if (blob) {
        svgBlob.set(response.fileid, blob);
        svgBlob.delete(response.name);
      }
    }
    uploadCache.count -= 1;

    // 回调都结束后抛出值变更
    if (uploadCache.count === 0) {
      emitValue();
    }
  };

  // 上传失败回调
  const onError = (...args: IData[]) => {
    const error = args[0];
    uploadCache.count -= 1;
    throw new HttpError({
      response: { data: JSON.parse(error.message), status: error.status },
    } as any);
  };

  // 删除回调
  const onRemove = (file: IData) => {
    if (props.disabled) {
      return;
    }
    const index = files.value.findIndex(item => item.id === file.id);
    if (index !== -1) {
      files.value.splice(index, 1);
    }
    emitValue();
  };

  // 下载文件
  const onDownload = (file: IData) => {
    const downloadUrl = getDownloadUrl(props.data, file);
    const url = file.url || downloadUrl.replace('%fileId%', file.id);
    const editorParams: IData = {
      ...c.editorParams,
      enableNoAccess: c.enableNoAccess,
    };
    if (editorParams.exportparams) {
      editorParams.exportParams = JSON.parse(editorParams.exportparams);
    }
    if (editorParams.globaldownloadprifix) {
      editorParams.globalDownloadPrifix =
        editorParams.globaldownloadprifix === 'true';
    } else {
      editorParams.globalDownloadPrifix =
        ibiz.config.common.globalDownloadPrifix;
    }
    ibiz.util.file.fileDownload(
      url,
      file.name,
      {
        context: c.context,
        params: c.params,
        data: props.data,
        file: { fileId: file.id, ...file },
        extraParams: editorParams,
        downloadTicketParams: c.downloadTicketParams,
      },
      undefined,
      c.enableNoAccess,
    );
  };

  // 允许上传文件的最大数量
  const limit = computed(() => {
    return c.multiple ? 9999 : 1;
  });

  return {
    uploadUrl,
    headers,
    files,
    limit,
    onDownload,
    onError,
    onRemove,
    onSuccess,
    beforeUpload,
  };
}
