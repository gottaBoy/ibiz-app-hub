import { IModalUtil, ModalParams } from '@ibiz-template/runtime';
import { showConfirmDialog, showDialog } from 'vant';
import { useNamespace } from '@ibiz-template/vue3-util';

/**
 * 简洁确认操作框
 *
 * @author chitanda
 * @date 2022-08-17 16:08:52
 * @export
 * @class ModalUtil
 * @implements {IModalUtil}
 */
export class ModalUtil implements IModalUtil {
  /**
   * 获取根节点样式变量
   *
   * @protected
   * @param {string} name
   * @return {*}  {(string | undefined)}
   * @memberof ModalUtil
   */
  protected getRootCssVar(name: string): string | undefined {
    const root = document.documentElement;
    const styles = window.getComputedStyle(root);
    if (styles) {
      return styles.getPropertyValue(name);
    }
  }

  async info(params: ModalParams): Promise<void> {
    const { confirmButtonText, cancelButtonText } = params;
    await showDialog({
      title: params.title,
      message: params.desc,
      confirmButtonText,
      cancelButtonText,
    });
  }

  async success(params: ModalParams): Promise<void> {
    const { confirmButtonText, cancelButtonText } = params;
    const ns = useNamespace();
    const color = this.getRootCssVar(ns.cssVarName('color-success'));
    await showDialog({
      title: params.title,
      message: params.desc,
      confirmButtonColor: color,
      confirmButtonText,
      cancelButtonText,
    });
  }

  async warning(params: ModalParams): Promise<void> {
    const { confirmButtonText, cancelButtonText } = params;
    const ns = useNamespace();
    const color = this.getRootCssVar(ns.cssVarName('color-warning'));
    await showDialog({
      title: params.title,
      message: params.desc,
      confirmButtonColor: color,
      confirmButtonText,
      cancelButtonText,
    });
  }

  async error(params: ModalParams): Promise<void> {
    const { confirmButtonText, cancelButtonText } = params;
    const ns = useNamespace();
    const color = this.getRootCssVar(ns.cssVarName('color-danger'));
    await showDialog({
      title: params.title,
      message: params.desc,
      confirmButtonColor: color,
      theme: 'round-button',
      confirmButtonText,
      cancelButtonText,
    });
  }

  async confirm(params: ModalParams): Promise<boolean> {
    const { confirmButtonText, cancelButtonText } = params;
    return new Promise(resolve => {
      showConfirmDialog({
        title: params.title,
        message: params.desc,
        confirmButtonText,
        cancelButtonText,
      })
        .then(() => {
          resolve(true);
        })
        .catch(() => {
          resolve(false);
        });
    });
  }

  async extendConfirm(params: ModalParams): Promise<'yes' | 'no' | 'cancel'> {
    return new Promise(resolve => {
      showConfirmDialog({
        message: params.desc,
        beforeClose: action => {
          if (!action) {
            resolve('cancel');
          }
          return true;
        },
        ...params,
        ...params.options,
      })
        .then(() => {
          resolve('yes');
        })
        .catch(() => {
          resolve('no');
        });
    });
  }
}
