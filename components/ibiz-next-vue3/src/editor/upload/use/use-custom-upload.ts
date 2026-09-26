/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { RuntimeError } from '@ibiz-template/core';
import { isString, isNil } from 'lodash-es';
import { ref, Ref } from 'vue';
import { UploadProgressEvent } from 'element-plus';
import { UploadEditorController } from '../upload-editor.controller';

/**
 * 上传错误
 */
export class UploadAjaxError extends Error {
  name = 'UploadAjaxError';

  status: number;

  method: string;

  url: string;

  constructor(message: string, status: number, method: string, url: string) {
    super(message);
    this.status = status;
    this.method = method;
    this.url = url;
  }
}

/**
 *  上传文件
 */
export interface UploadRawFile extends File {
  uid: number;

  path: string;
}

/**
 *  上传参数
 */
export interface UploadRequestOptions {
  action: string;

  method: string;

  data: Record<string, string | Blob | [string | Blob, string]>;

  filename: string;

  file: UploadRawFile;

  headers: Headers | Record<string, string | number | null | undefined>;

  onError: (evt: UploadAjaxError) => void;

  onProgress: (evt: UploadProgressEvent) => void;

  onSuccess: (response: any) => void;

  withCredentials: boolean;
}

/**
 * 获取上传错误
 */
export function getError(
  action: string,
  option: UploadRequestOptions,
  xhr: XMLHttpRequest,
): UploadAjaxError {
  let msg: string;
  if (xhr.response) {
    msg = `${xhr.response.error || xhr.response}`;
  } else if (xhr.responseText) {
    msg = `${xhr.responseText}`;
  } else {
    msg = `fail to ${option.method} ${action} ${xhr.status}`;
  }

  return new UploadAjaxError(msg, xhr.status, option.method, action);
}

/**
 * 获取响应体内容
 */
export function getBody(xhr: XMLHttpRequest): XMLHttpRequestResponseType {
  const text = xhr.responseText || xhr.response;
  if (!text) {
    return text;
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    return text;
  }
}

let fileId = 1;

export const genFileId = (): number => Date.now() + 3600000 + fileId++;

/**
 * 自定义上传
 */
export function useCustomUpload(
  c: UploadEditorController,
  options: IData,
): {
  customUpload: (option: any) => XMLHttpRequest;
  folderInputRef: Ref<HTMLInputElement | null>;
  selectFolder: () => void;
  handleFolderSelect: (event: Event) => void;
} {
  // 自定义上传
  const customUpload = (option: any): XMLHttpRequest => {
    if (typeof XMLHttpRequest === 'undefined')
      throw new RuntimeError('XMLHttpRequest is undefined');

    const xhr = new XMLHttpRequest();
    const action = option.action;

    if (xhr.upload && option.onProgress) {
      xhr.upload.addEventListener('progress', evt => {
        const progressEvt = evt as UploadProgressEvent;
        progressEvt.percent =
          evt.total > 0 ? (evt.loaded / evt.total) * 100 : 0;
        option.onProgress(progressEvt);
      });
    }

    const formData = new FormData();
    if (option.data) {
      for (const [key, value] of Object.entries(option.data)) {
        if (Array.isArray(value)) {
          if (
            value.length === 2 &&
            value[0] instanceof Blob &&
            isString(value[1])
          ) {
            formData.append(key, value[0], value[1]);
          } else {
            value.forEach(item => {
              formData.append(key, item);
            });
          }
        } else formData.append(key, value as any);
      }
    }
    formData.append(option.filename, option.file, option.file.name);

    // 开启压缩文件类解压额外送参unzip为true
    if (c.unzip && c.unzipfileext) {
      const fileName = option.file.name;
      const fileExt = fileName.substring(fileName.lastIndexOf('.'));
      if (c.unzipfileext.indexOf(fileExt) !== -1) {
        formData.append('unzip', 'true');
      }
    }

    xhr.addEventListener('error', () => {
      if (option.onError) {
        option.onError(getError(action, option, xhr));
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status < 200 || xhr.status >= 300) {
        return option.onError(getError(action, option, xhr));
      }
      option.onSuccess(getBody(xhr));
    });

    xhr.open(option.method, action, true);

    if (option.withCredentials && 'withCredentials' in xhr) {
      xhr.withCredentials = true;
    }

    const tempheaders: IData = option.headers || {};
    if (tempheaders instanceof Headers) {
      tempheaders.forEach((value, key) => xhr.setRequestHeader(key, value));
    } else {
      for (const [key, value] of Object.entries(tempheaders)) {
        if (isNil(value)) continue;
        xhr.setRequestHeader(key, String(value));
      }
    }
    xhr.send(formData);
    return xhr;
  };

  // 文件输入框的引用
  const folderInputRef = ref<HTMLInputElement | null>(null);

  // 触发文件选择框
  const selectFolder = (): void => {
    folderInputRef.value?.click();
  };

  // 处理文件选择事件
  const handleFolderSelect = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const files = Array.from(target.files);
      for (const file of files) {
        const rawFile = file as UploadRawFile;
        rawFile.uid = genFileId();
        rawFile.path = file.webkitRelativePath;
        const tempOption: IData = {
          file: rawFile,
          filename: 'file',
          method: 'post',
          ...options,
        };
        if (options.addCacheCount) {
          options.addCacheCount();
        }
        customUpload(tempOption);
      }
      target.files = null as unknown as FileList;
    }
  };

  return { customUpload, folderInputRef, selectFolder, handleFolderSelect };
}
