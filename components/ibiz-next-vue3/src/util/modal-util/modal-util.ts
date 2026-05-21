import { IModalUtil, ModalParams } from '@ibiz-template/runtime';
import { ElMessageBox } from 'element-plus';

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
  async info(params: ModalParams): Promise<void> {
    await ElMessageBox.alert(params.desc, params.title, {
      ...params.options,
      type: 'info',
    });
  }

  async success(params: ModalParams): Promise<void> {
    await ElMessageBox.alert(params.desc, params.title, {
      ...params.options,
      type: 'success',
    });
  }

  async warning(params: ModalParams): Promise<void> {
    await ElMessageBox.alert(params.desc, params.title, {
      ...params.options,
      type: 'warning',
    });
  }

  async error(params: ModalParams): Promise<void> {
    await ElMessageBox.alert(params.desc, params.title, {
      ...params.options,
      type: 'error',
    });
  }

  async confirm(params: ModalParams): Promise<boolean> {
    return new Promise(resolve => {
      ElMessageBox.confirm(params.desc, params.title, params)
        .then(() => resolve(true))
        .catch(() => resolve(false));
    });
  }

  async extendConfirm(params: ModalParams): Promise<'yes' | 'no' | 'cancel'> {
    return new Promise(resolve => {
      ElMessageBox.confirm(params.desc, params.title, {
        ...params,
        ...params.options,
      })
        .then(() => resolve('yes'))
        .catch((action: string) =>
          resolve(action === 'cancel' ? 'no' : 'cancel'),
        );
    });
  }
}
