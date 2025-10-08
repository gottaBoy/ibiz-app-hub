export interface IApiDownloadTicket {
  /**
   * @description 文件标识
   * @type {string}
   * @memberof IApiDownloadTicket
   */
  id: string;

  /**
   * @description 文件名称
   * @type {string}
   * @memberof IApiDownloadTicket
   */
  name: string;

  /**
   * @description 文件分类
   * @type {string}
   * @memberof IApiDownloadTicket
   */
  cat: string;

  /**
   * @description 文件凭证
   * @type {string}
   * @memberof IApiDownloadTicket
   */
  ticket: string;

  /**
   * @description 过期秒数
   * @type {string}
   * @memberof IApiDownloadTicket
   */
  expirein: string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string | symbol]: any;
}
