import { IModal, IPrintPreviewUtil } from '@ibiz-template/runtime';
import { h } from 'vue';
import { PrintPreviewMarkdown } from './print-preview-markdown/print-preview-markdown';
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
}
