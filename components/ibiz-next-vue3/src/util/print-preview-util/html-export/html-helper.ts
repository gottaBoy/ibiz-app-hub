/* eslint-disable no-restricted-syntax */

/**
 * @description 生成html内容
 * @export
 * @param {string} content
 * @param {IData} [style={}]
 * @returns {*}  {string}
 */
export function generateHTML(content: string, style: IData = {}): string {
  let css = '';
  for (const key in style) {
    if (Object.prototype.hasOwnProperty.call(style, key)) {
      const val = style[key];
      css += `.${key}{${val}}`;
    }
  }
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
    <meta charset="utf-8">
    <style>${css}</style>
    </head>
    <body>
    ${content}
    </body>
    </html>
    `;

  return html;
}

/**
 * @description 下载html文件
 * @export
 * @param {string} filename
 * @param {string} content
 */
export function downloadHtmlFile(filename: string, content: string): void {
  const blob = new Blob([`${content}`], {
    type: 'text/html;charset=utf-8',
  });

  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';

  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
