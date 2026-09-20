import { aiChatT } from '..';
import { FileUploaderOptions } from '../../interface';

/**
 * 文件上传器
 *
 * @author tony001
 * @date 2025-02-28 10:02:14
 * @export
 * @class FileUploader
 * @template T
 */
export class FileUploader<T> {
  private options: FileUploaderOptions<T>;

  /**
   * Creates an instance of FileUploader.
   * @author tony001
   * @date 2025-02-28 15:02:15
   * @param {FileUploaderOptions<T>} options
   */
  constructor(options: FileUploaderOptions<T>) {
    this.options = {
      multiple: true,
      accept: '*/*',
      maxSize: 5 * 1024 * 1024,
      ...options,
    };
  }

  /**
   * 打开文件选择对话框
   */
  public openFilePicker(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = this.options.multiple!;
    input.accept = this.options.accept || '';

    input.onchange = e => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      this.handleFiles(files);
    };

    input.click();
  }

  /**
   * 处理选择的文件
   */
  private async handleFiles(files: File[]): Promise<void> {
    if (files.length === 0) return;

    // 执行基础验证
    const validFiles = files.filter(file => {
      if (this.options.maxSize && file.size > this.options.maxSize) {
        this.options.onError?.(
          new Error(
            aiChatT('fileTooLarge', {
              size: `${this.formatSize(file.size)} > ${this.formatSize(this.options.maxSize)}`,
            }),
          ),
          file,
        );
        return false;
      }
      return true;
    });

    this.options.onSelect?.(validFiles);

    // 并行处理所有文件上传
    await Promise.all(validFiles.map(file => this.processFile(file)));
  }

  /**
   * 处理单个文件上传
   */
  private async processFile(file: File): Promise<void> {
    try {
      // 创建进度报告函数
      const reportProgress = (percent: number) => {
        this.options.onProgress?.(file, percent);
      };

      // 调用外部上传处理
      const result = await this.options.onUpload(file, reportProgress);

      // 最终进度设为100%
      this.options.onProgress?.(file, 100);
      this.options.onSuccess?.(result, file);
    } catch (error) {
      this.options.onError?.(
        error instanceof Error ? error : new Error(aiChatT('uploadFailed')),
        file,
      );
    }
  }

  /**
   * 格式化文件大小
   */
  private formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const exp = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / 1024 ** exp).toFixed(2)} ${units[exp]}`;
  }
}
