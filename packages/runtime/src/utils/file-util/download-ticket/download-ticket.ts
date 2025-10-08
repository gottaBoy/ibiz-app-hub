import { IApiDownloadTicket } from '../../../interface';

export class DownloadTicket implements IApiDownloadTicket {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;

  /**
   * @description 文件标识
   * @type {string}
   * @memberof DownloadTicket
   */
  id: string;

  /**
   * @description 文件名称
   * @type {string}
   * @memberof DownloadTicket
   */
  name: string;

  /**
   * @description 文件分类
   * @type {string}
   * @memberof DownloadTicket
   */
  cat: string;

  /**
   * @description 文件凭证
   * @type {string}
   * @memberof DownloadTicket
   */
  ticket: string;

  /**
   * @description 过期秒数
   * @type {string}
   * @memberof DownloadTicket
   */
  expirein: string;

  /**
   * @description 过期时间（毫秒数）
   * @type {number}
   * @memberof DownloadTicket
   */
  expirationTime: number;

  /**
   * @description 超时时间（毫秒数）
   * @type {number}
   * @memberof DownloadTicket
   */
  timeout: number = 3000;

  /**
   * Creates an instance of DownloadTicket.
   * @param {IData} opts
   * @memberof DownloadTicket
   */
  constructor(opts: IData) {
    this.id = opts.id;
    this.name = opts.name;
    this.cat = opts.cat;
    this.ticket = opts.ticket;
    this.expirein = opts.expirein;
    this.expirationTime = Date.now() + Number(this.expirein) * 1000;
    for (const key in opts) {
      if (!Object.prototype.hasOwnProperty.call(this, key)) {
        this[key] = opts[key];
      }
    }
  }

  /**
   * @description 是否过期
   * @readonly
   * @type {boolean}
   * @memberof DownloadTicket
   */
  get isExpirein(): boolean {
    if (this.expirationTime - Date.now() >= this.timeout) return false;
    return true;
  }
}
