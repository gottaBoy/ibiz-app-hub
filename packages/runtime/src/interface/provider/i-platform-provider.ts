/**
 * @description 后台导出参数
 * @export
 * @interface IBackendExportParams
 */
export interface IBackendExportParams {
  /**
   * @description 后台导出路径
   * @type {string}
   * @memberof IExportParams
   */
  url: string;

  /**
   * @description 请求方式
   * @type {('post' | 'get')}
   * @memberof IExportParams
   */
  method: 'post' | 'get';

  /**
   * @description 请求参数
   * @type {IParams}
   * @memberof IExportParams
   */
  params: IParams;

  /**
   * @description 请求数据
   * @type {IData}
   * @memberof IExportParams
   */
  data?: IData;

  /**
   * @description 基础路径
   * @type {string}
   * @memberof IExportParams
   */
  baseURL?: string;

  /**
   * @description 是否新窗口预览
   * @type {boolean}
   * @memberof IExportParams
   */
  newWindow?: boolean;
}

/**
 * @description 前台导出参数
 * @export
 * @interface IFrontExportParams
 */
export interface IFrontExportParams {
  /**
   * @description 文件名称
   * @type {string}
   * @memberof IFrontExportParams
   */
  fileName: string;

  /**
   * @description 表头数据
   * @type {string[]}
   * @memberof IFrontExportParams
   */
  header: string[];

  /**
   * @description 表格数据
   * @type {IData[][]}
   * @memberof IFrontExportParams
   */
  data: IData[][];
}

/**
 * 搭载平台适配器接口
 *
 * @author zk
 * @date 2023-11-20 02:11:24
 * @export
 * @interface IPlatformProvider
 */
export interface IPlatformProvider {
  /**
   * 登录
   *
   * @author zk
   * @date 2023-11-20 03:11:10
   * @param {string} loginName 账号!
   * @param {string} passWord 密码!
   * @param {string} [verificationCode] 验证码?
   * @return {*}  {Promise<boolean>}
   * @memberof IPlatformProvider
   */
  login(
    loginName: string,
    passWord: string,
    verificationCode?: string,
  ): Promise<boolean>;

  /**
   * @description 下载
   * @param {string} url 下载地址
   * @param {string} fileName 文件名称
   * @returns {*}  {Promise<boolean>}
   * @memberof IPlatformProvider
   */
  download(url: string, fileName: string): Promise<boolean>;

  /**
   * @description 后台导出
   * @param {IBackendExportParams} args 导出参数
   * @returns {*}  {Promise<boolean>}
   * @memberof IPlatformProvider
   */
  backendExport(args: IBackendExportParams): Promise<boolean>;

  /**
   * @description 前台导出
   * @param {IFrontExportParams} args
   * @returns {*}  {Promise<boolean>}
   * @memberof IPlatformProvider
   */
  frontExport(args: IFrontExportParams): Promise<boolean>;

  /**
   * 初始化
   *
   * @author zk
   * @date 2023-11-21 11:11:57
   * @memberof IPlatformProvider
   */
  init(): Promise<void>;

  /**
   * @description 销毁
   * @memberof IPlatformProvider
   */
  destroyed(): Promise<void>;

  /**
   * 返回
   *
   * @author zk
   * @date 2023-11-21 08:11:36
   * @memberof IPlatformProvider
   */
  back(): void;

  /**
   * @description 设置浏览器标题
   * @param {string} title
   * @memberof IPlatformProvider
   */
  setBrowserTitle(title: string): void;
}
