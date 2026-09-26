/* eslint-disable no-plusplus */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable new-cap */
import {
  IApiPdfExportOptions,
  IModal,
  IPrintPreviewUtil,
} from '@ibiz-template/runtime';
import { h } from 'vue';
import jsPDF from 'jspdf';
import dayjs from 'dayjs';
import { PrintPreviewMarkdown } from './print-preview-markdown/print-preview-markdown';
import {
  checkBrowserCompatibility,
  cleanupTempElements,
  createTempContainer,
  DEFAULT_OPTIONS,
  exportPdf,
  getCanvas,
  getCanvasImages,
  getPageSizeInPixels,
  asyncPrintNotice,
  validateOptions,
} from './pdf-export/pdf-helper';
import { downloadHtmlFile, generateHTML } from './html-export/html-helper';
/**
 * 打印预览工具类
 */
export class PrintPreviewUtil implements IPrintPreviewUtil {
  /**
   * 执行打印
   * @param context
   * @param params
   * @param data
   * @returns boolean 是否成功执行打印
   */
  async execPrint(
    context: IContext,
    params: IParams,
    data: Blob,
  ): Promise<boolean> {
    const srfcontenttype = params.srfcontenttype;
    if (srfcontenttype === 'MARKDOWN') {
      return this.printMarkDown(data, params);
    }
    if (srfcontenttype === 'HTML') {
      return this.printHtml(data);
    }
    return false;
  }

  /**
   * 打印MarkDown（窗口可以由视图参数srfprintheight和srfprintwidth指定，默认居中50%，绘制时为md预览模式绘制，提供全屏按钮，和关闭按钮。）
   * @param data
   * @returns
   */
  async printMarkDown(data: Blob, params: IParams): Promise<boolean> {
    const text = await data.text();
    const overlay = ibiz.overlay.createModal(
      (modal: IModal) =>
        h(PrintPreviewMarkdown, {
          value: text,
          modal,
        }),
      undefined,
      {
        width: params.srfprintwidth || '50%',
        height: params.srfprintheight || '50%',
      },
    );
    overlay.present();
    await overlay.onWillDismiss();
    return true;
  }

  /**
   * 打印HTML(原生浏览器预览)
   * @param data
   * @returns
   */
  async printHtml(data: Blob): Promise<boolean> {
    const link = window.URL.createObjectURL(data);
    window.open(link, '_blank');
    return true;
  }

  /**
   * @description 导出HTML文件
   * @param {string} filename 导出html文件名，需以.html结尾
   * @param {string} content 导出html内容，为body标签中的html字符串
   * @param {IData} [style={}] 导出html样式，会添加到style标签中
   * @returns {*}  {Promise<boolean>}
   * @memberof PrintPreviewUtil
   */
  async printHtml2(
    filename: string,
    content: string,
    style: IData = {},
  ): Promise<boolean> {
    try {
      const html = generateHTML(content, style);
      downloadHtmlFile(filename, html);
      return true;
    } catch {
      ibiz.message.error(ibiz.i18n.t('util.printPreviewUtil.exportHtmlFailed'));
      return false;
    }
  }

  /**
   * @description 导出pdf
   * @param {string} filename 导出文件名，必须以.pdf结尾
   * @param {string} content 导出内容
   * @param {IApiPdfExportOptions} [options={}]
   * @returns {*}  {Promise<boolean>}
   * @memberof PrintPreviewUtil
   */
  async printPdf(
    filename: string,
    content: string,
    options: IApiPdfExportOptions = {},
  ): Promise<boolean> {
    const data = {
      content,
      filename,
      ...options,
    };
    const validation = validateOptions(data);
    if (!validation) {
      return false;
    }

    checkBrowserCompatibility();
    let container: HTMLDivElement | null = null;
    // 是否异步导出
    let isAsync = false;

    const noticeHandle: IData = {
      begintime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    };

    try {
      const mergedOptions: IData = {
        ...DEFAULT_OPTIONS,
        ...data,
        margins: {
          ...DEFAULT_OPTIONS.margins,
          ...(data.margins || {}),
        },
      };

      container = createTempContainer(data.content, mergedOptions);

      const pageSizePixels = getPageSizeInPixels(
        mergedOptions.pageSize,
        mergedOptions.orientation,
      );

      const orientation = mergedOptions.orientation === 'portrait' ? 'p' : 'l';
      const pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format: mergedOptions.pageSize,
      });

      const width =
        pageSizePixels.width -
        (mergedOptions.margins.left + mergedOptions.margins.right) *
          3.7795275591;

      // pdf a4分页宽高
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const innerWidth =
        pdfWidth - mergedOptions.margins.left - mergedOptions.margins.right;

      const innerHeight =
        pdfHeight - mergedOptions.margins.top - mergedOptions.margins.bottom;

      const containerHeight = container.scrollHeight;
      if (containerHeight > mergedOptions.segmentHeight) {
        isAsync = true;
        asyncPrintNotice({ type: 'start' }, noticeHandle);
        const windowWidth = pageSizePixels.width;
        const segmentHeight = mergedOptions.segmentHeight!;
        Object.assign(mergedOptions, {
          width,
          windowWidth,
          segmentHeight,
          noticeHandle,
          innerWidth,
          innerHeight,
        });
        getCanvas(container, mergedOptions)
          .then((images: IData[]) => {
            exportPdf(pdf, images, {
              innerWidth,
              innerHeight,
              mergedOptions,
              isAsync,
              noticeHandle,
            });
          })
          .finally(() => {
            cleanupTempElements(container);
          });
      } else {
        const canvas = await ibiz.util.html2canvas.getCanvas(container, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: mergedOptions.backgroundColor,
          width,
          windowWidth: pageSizePixels.width,
          scrollY: 0,
          scrollX: 0,
        });
        // 每一页图片高度
        const pageHeight = (innerHeight / innerWidth) * width * 2;
        const images = getCanvasImages([canvas], {
          pageHeight,
          pageWidth: width * 2,
          innerHeight,
          innerWidth,
          backgroundColor: mergedOptions.backgroundColor,
        });
        exportPdf(pdf, images, { innerWidth, innerHeight, mergedOptions });
      }

      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : ibiz.i18n.t('util.printPreviewUtil.exportPdfFailed');
      if (isAsync) {
        asyncPrintNotice({ type: 'fail' }, noticeHandle);
      } else {
        ibiz.message.error(errorMessage);
      }
      return false;
    } finally {
      if (!isAsync) {
        cleanupTempElements(container);
      }
    }
  }
}
