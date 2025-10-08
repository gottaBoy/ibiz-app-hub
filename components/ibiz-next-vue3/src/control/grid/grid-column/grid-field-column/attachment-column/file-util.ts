/* eslint-disable @typescript-eslint/no-explicit-any */
import { Ref, ref, watch } from 'vue';
import { isString } from 'lodash-es';
import { GridFieldColumnController } from '@ibiz-template/runtime';

/** 文件总类型定义 */
type FileType = 'image' | 'pdf' | 'other';

/**
 * 获取文件类型
 */
export const getFileType = (extension: string): FileType => {
  switch (extension) {
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'bmp':
    case 'svg':
    case 'webp':
    case 'jfif':
      // 图片类型
      return 'image';
    case 'pdf':
      // pdf 类型
      return 'pdf';
    default:
      // 其它文件类型
      return 'other';
  }
};

/**
 * 文件内容解析的适配逻辑
 *
 * @export
 * @param {IParams} props
 * @param {UploadEditorController} c
 * @returns {*}
 */
export function useFilesParse(
  props: IParams,
  c: GridFieldColumnController,
): {
  uploadUrl: Ref<string>;
  files: Ref<
    {
      id: string;
      name: string;
      url?: string | undefined;
      base64?: string | undefined;
    }[]
  >;
  onDownload: (file: IData) => void;
  getDownloadUrl: (data: IData, file: IData) => string;
  getDownloadTicketParams: () => {
    appEntityTag?: string;
    dataFieldTag?: string;
  };
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

  // 上传文件路径
  const uploadUrl: Ref<string> = ref('');

  // svg图片Blob路径存储
  const svgBlob: Map<string, string> = new Map();

  // 获取下载凭证参数
  const getDownloadTicketParams = (): {
    appEntityTag?: string;
    dataFieldTag?: string;
  } => {
    const downloadTicketParams = {};
    if (!c.model.userParam) {
      return downloadTicketParams;
    }
    if (c.model.userParam.appentitytag) {
      Object.assign(downloadTicketParams, {
        appEntityTag: c.model.userParam.appentitytag,
      });
    }
    if (c.model.userParam.datafieldtag) {
      Object.assign(downloadTicketParams, {
        dataFieldTag: c.model.userParam.datafieldtag,
      });
    }
    return downloadTicketParams;
  };

  // 获取svg以data:image开头的预览路径
  const fetchSVGAsBase64 = async (url: string): Promise<void | string> => {
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
        reader.onloadend = (): void => {
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
  const calcSvgPreview = (file: IData): void => {
    const blob = svgBlob.get(file.id);
    if (blob) {
      Object.assign(file, { base64: blob });
    } else {
      fetchSVGAsBase64(file.url).then(base64String => {
        Object.assign(file, { base64: base64String });
      });
    }
  };

  /**
   * @description 获取下载路径,若业务数据中存在folder，则以业务数据中folder作为目录
   * @param {IData} data
   * @param {IData} file
   * @returns {*}  {string}
   */
  const getDownloadUrl = (data: IData, file: IData): string => {
    const editorParams: IData = {};
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

  // 下载文件
  const onDownload = (file: IData): void => {
    const downloadUrl = getDownloadUrl(props.data, file);
    const url = file.url || downloadUrl.replace('%fileId%', file.id);
    ibiz.util.file.fileDownload(url, file.name, {
      context: c.context,
      params: c.params,
      data: props.data,
      file: { fileId: file.id, ...file },
      extraParams: {},
      downloadTicketParams: getDownloadTicketParams(),
    });
  };

  // 值响应式变更
  watch(
    () => props.value,
    newVal => {
      // eslint-disable-next-line no-nested-ternary
      files.value = !newVal
        ? []
        : isString(newVal)
          ? JSON.parse(newVal)
          : newVal;
    },
    { immediate: true },
  );

  // data响应式变更基础路径
  watch(
    () => props.data,
    newVal => {
      if (newVal) {
        const urls = ibiz.util.file.calcFileUpDownUrl(
          c.context,
          c.params,
          newVal,
          {},
        );
        uploadUrl.value = urls.uploadUrl;
      }
    },
    { immediate: true, deep: true },
  );

  watch(
    files,
    newVal => {
      // 变更后且下载基础路径存在时解析
      if (newVal?.length) {
        newVal.forEach((file: IData) => {
          const downloadUrl = getDownloadUrl(props.data, file);
          Object.assign(file, {
            url: file.url || downloadUrl.replace('%fileId%', file.id),
          });
          if (ibiz.config.common.enableDownloadTicket) {
            ibiz.util.file
              .getDownloadTicket(
                c.context,
                c.params,
                props.data,
                {
                  fileId: file.id,
                },
                getDownloadTicketParams(),
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

  return {
    files,
    uploadUrl,
    onDownload,
    getDownloadUrl,
    getDownloadTicketParams,
  };
}
