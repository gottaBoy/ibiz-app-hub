/**
 * @description 根据文件名称计算Mime类型
 * @export
 * @param {string} fileName
 * @returns {*}  {string}
 */
export function calcMimeByFileName(fileName: string): string {
  const ext = fileName.includes('.') ? fileName.split('.').pop() : '';
  let mime = '';
  switch (ext) {
    case 'wps':
      mime = 'application/kswps';
      break;
    case 'doc':
      mime = 'application/msword';
      break;
    case 'docx':
      mime =
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      break;
    case 'txt':
      mime = 'text/plain';
      break;
    case 'zip':
      mime = 'application/zip';
      break;
    case 'png':
      mime = 'image/png';
      break;
    case 'gif':
      mime = 'image/gif';
      break;
    case 'jpeg':
      mime = 'image/jpeg';
      break;
    case 'jpg':
      mime = 'image/jpeg';
      break;
    case 'rtf':
      mime = 'application/rtf';
      break;
    case 'avi':
      mime = 'video/x-msvideo';
      break;
    case 'gz':
      mime = 'application/x-gzip';
      break;
    case 'tar':
      mime = 'application/x-tar';
      break;
    case 'xls':
      mime = 'application/vnd.ms-excel';
      break;
    case 'xlsx':
      mime =
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      break;
    case 'pdf':
      mime = 'application/pdf';
      break;
    case 'html':
      mime = 'text/html';
      break;
    default:
      mime = '';
  }
  return mime;
}

/**
 * @description 判断是否是图片格式
 * @export
 * @param {string} fileName
 * @returns {*}  {boolean}
 */
export function isImage(fileName: string): boolean {
  const ext = fileName.includes('.') ? fileName.split('.').pop() : '';
  if (!ext) {
    return false;
  }
  const imageTypes = ['jpeg', 'jpg', 'gif', 'png', 'bmp', 'svg'];
  return imageTypes.includes(ext);
}

/**
 * @description 纯JS触发下载文件
 * @export
 * @param {Blob} file
 * @param {string} fileName
 */
export function downloadFileFromBlob(file: Blob, fileName: string): void {
  // 获取文件名
  const filetype = calcMimeByFileName(fileName);
  // 用blob对象获取文件流
  const blob = new Blob([file], { type: filetype });
  // 通过文件流创建下载链接
  const href = URL.createObjectURL(blob);
  // 创建一个a元素并设置相关属性
  const a = document.createElement('a');
  a.href = href;
  a.download = fileName;
  // 添加a元素到当前网页
  document.body.appendChild(a);
  // 触发a元素的点击事件，实现下载
  a.click();
  // 从当前网页移除a元素
  document.body.removeChild(a);
  // 释放blob对象
  URL.revokeObjectURL(href);
}
