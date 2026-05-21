import { AxiosResponse } from 'axios';
import { IApiHttpError, InputError } from '../../interface';

/**
 * @description 请求异常
 * @export
 * @class HttpError
 * @extends {Error}
 */
export class HttpError extends Error implements IApiHttpError {
  name: string = 'HttpError';

  message: string;

  status: number;

  // 错误标识
  tag: string;

  response?: AxiosResponse;

  constructor(err: InputError) {
    super('HttpError');
    const res = err.response;
    this.response = err.response;
    this.tag = '';
    if (res) {
      if (res.data) {
        const data = res.data as IData;
        this.message = data.message;
        if (!this.message && data.status === 404) {
          this.message = ibiz.i18n.t('core.error.serviceResNotExist');
        }
        if (!this.message && data.status === 403) {
          this.message = ibiz.i18n.t('core.error.serviceResNotPermission');
        }
        if (!this.message) {
          this.message = ibiz.i18n.t('core.error.serviceException');
        }
      } else {
        this.message = res.statusText;
      }
      if (!this.message) {
        this.message = ibiz.i18n.t('core.error.networkAbnormality');
      }
      this.status = res.status;
    } else {
      this.message = err.message || '';
      this.status = 500;
    }
  }
}
