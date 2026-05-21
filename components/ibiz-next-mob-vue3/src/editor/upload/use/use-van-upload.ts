/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-param-reassign */
import { CoreConst, HttpError, getAppCookie } from '@ibiz-template/core';
import { computed, ComputedRef, Ref, ref, watch } from 'vue';
import { UploadEditorController } from '../upload-editor.controller';

/**
 * Vant的Upload适配逻辑
 *
 * @author lxm
 * @date 2022-11-17 16:11:12
 * @export
 * @param {IParams} props
 * @param {(_value: string | null) => {}} valueChange
 * @param {UploadEditorController} c
 * @returns {*}
 */
export function useVanUpload(
  props: IParams,
  valueChange: (_value: string | null) => void,
  c: UploadEditorController,
): {
  uploadUrl: Ref<string>;
  downloadUrl: Ref<string>;
  headers: Ref<IData>;
  files: Ref<
    {
      id: string;
      name: string;
      url?: string | undefined;
    }[]
  >;
  limit: ComputedRef<1 | 9999>;
  loading: Ref<boolean>;
  onDownload: (file: IData) => void;
  onError: (...args: IData[]) => never;
  onRemove: (file: IData) => void;
  onSuccess: (response: IData) => void;
  beforeUpload: () => void;
  afterRead: (file: IData | IData[]) => Promise<void>;
} {
  // 文件列表
  const files: Ref<
    {
      id: string;
      name: string;
      url?: string;
    }[]
  > = ref([]);

  // 请求头
  const headers: Ref<IData> = ref({
    [`${ibiz.env.tokenHeader}Authorization`]: `${
      ibiz.env.tokenPrefix
    }Bearer ${getAppCookie(CoreConst.TOKEN)}`,
  });

  // 上传文件路径
  const uploadUrl: Ref<string> = ref('');

  // 下载文件路径
  const downloadUrl: Ref<string> = ref('');

  // 是否显示加载动画
  const loading = ref(false);

  // 值响应式变更
  watch(
    () => props.value,
    newVal => {
      files.value = !newVal ? [] : JSON.parse(newVal);
    },
    { immediate: true },
  );

  // data响应式变更基础路径
  watch(
    () => props.data,
    newVal => {
      if (newVal) {
        const editorParams: IData = {
          ...c.editorParams,
          enableNoAccess: c.enableNoAccess,
          globalDownloadPrifix: c.globalDownloadPrifix,
        };
        if (editorParams.uploadparams) {
          editorParams.uploadParams = JSON.parse(editorParams.uploadparams);
        }
        if (editorParams.exportparams) {
          editorParams.exportParams = JSON.parse(editorParams.exportparams);
        }
        const urls = ibiz.util.file.calcFileUpDownUrl(
          c.context,
          c.params,
          newVal,
          editorParams,
        );
        uploadUrl.value = urls.uploadUrl;
        downloadUrl.value = urls.downloadUrl;
      }
    },
    { immediate: true, deep: true },
  );

  watch(
    files,
    newVal => {
      // 变更后且下载基础路径存在时解析
      if (newVal?.length && downloadUrl.value) {
        newVal.forEach((file: IData) => {
          file.url = file.url || downloadUrl.value.replace('%fileId%', file.id);
          if (ibiz.config.common.enableDownloadTicket)
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
                if (downloadTicket && downloadTicket.ticket)
                  file.url = downloadUrl.value.replace(
                    '%fileId%',
                    downloadTicket.ticket,
                  );
              });
        });
      }
    },
    { immediate: true },
  );

  watch(
    downloadUrl,
    newVal => {
      // 变更后且下载基础路径存在时解析
      if (newVal && files.value.length) {
        files.value.forEach((file: IData) => {
          file.url = downloadUrl.value.replace('%fileId%', file.id);
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
    const _files = [...files.value];
    const value: string | null =
      _files.length > 0
        ? JSON.stringify(_files.map(file => ({ name: file.name, id: file.id })))
        : null;
    valueChange(value);
  };

  // 上传前回调
  const beforeUpload = () => {
    // 单项的情况直接阻止上传
    if (!c.multiple && files.value.length === 1) {
      return false;
    }
    return true;
  };

  // 上传成功回调
  const onSuccess = (response: IData) => {
    if (!response) return;
    // 启用传入下载凭证
    if (ibiz.config.common.enableDownloadTicket && response.ticket) {
      ibiz.util.file.setDownloadTicket(response.id, response.ticket);
    }
    files.value.push({
      name: response.filename,
      id: response.fileid,
    });

    // 回调都结束后抛出值变更
    emitValue();
  };

  // 上传失败回调
  const onError = (...args: IData[]) => {
    const error = args[0];
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

  const uploadFile = async (file: IData) => {
    const size = file.file.size;
    const sizeKB = size / 1024;
    let curFile = file.file;
    if (
      c.imgCompressQuality &&
      c.imgCompressLimit &&
      sizeKB > c.imgCompressLimit
    ) {
      try {
        curFile = await ibiz.util.file.compressImg(
          curFile,
          c.imgCompressMaxWidth,
          c.imgCompressQuality,
        );
      } catch {
        ibiz.log.error(ibiz.i18n.t('editor.upload.compressError'));
      }
    }
    // 创建一个空对象实例
    const formData = new FormData();
    // 调用append()方法添加数据
    formData.append('file', curFile);
    return new Promise((resolve, reject) => {
      ibiz.net
        .axios({
          url: uploadUrl.value,
          method: 'POST',
          data: formData,
          headers: headers.value,
        })
        .then(res => {
          if (res.status === 200) {
            onSuccess(res.data);
            resolve(true);
          } else {
            onError(res);
            reject();
          }
        })
        .catch(() => {
          reject();
        });
    });
  };

  // 读取成功回调
  const afterRead = async (file: IData | IData[]) => {
    if (c.showLoading) {
      loading.value = true;
    }
    if (file.length && file.length > 0) {
      for (let i = 0; i < file.length; i++) {
        const fi = (file as IData[])[i];
        // eslint-disable-next-line no-await-in-loop
        await uploadFile(fi);
      }
    } else {
      await uploadFile(file);
    }
    if (c.showLoading) {
      loading.value = false;
    }
  };

  // 下载文件
  const onDownload = (file: IData) => {
    const url = file.url || downloadUrl.value.replace('%fileId%', file.id);
    c.fileDownload({ url, name: file.name });
  };

  // 允许上传文件的最大数量
  const limit = computed(() => {
    return c.multiple ? 9999 : 1;
  });

  return {
    uploadUrl,
    downloadUrl,
    headers,
    files,
    limit,
    loading,
    onDownload,
    onError,
    onRemove,
    onSuccess,
    beforeUpload,
    afterRead,
  };
}
