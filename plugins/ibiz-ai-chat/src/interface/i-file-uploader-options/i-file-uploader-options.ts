/**
 * 文件上传参数接口
 *
 * @author tony001
 * @date 2025-02-28 10:02:19
 * @export
 * @interface FileUploaderOptions
 * @template T
 */
export interface FileUploaderOptions<T> {
  /** 文件上传目录 */
  folder: string;
  /** 是否启用全局下载文件前缀 */
  globalDownloadPrifix: boolean;
  /** 允许的文件类型 */
  accept?: string;
  /** 最大文件大小（字节） */
  maxSize?: number;
  /** 是否多选 */
  multiple?: boolean;
  /** 文件选择回调 */
  onSelect?: (files: File[]) => void;
  /** 上传处理函数 */
  onUpload: (
    file: File,
    reportProgress: (percent: number) => void,
    options?: object,
  ) => Promise<T>;
  /** 文件下载处理函数 */
  onDownLoad: (file: object, options?: object) => Promise<void>;
  /** 上传成功回调 */
  onSuccess?: (result: T, file: File) => void;
  /** 上传失败回调 */
  onError?: (error: Error, file: File) => void;
  /** 进度变化回调 */
  onProgress?: (file: File, percent: number) => void;
}
