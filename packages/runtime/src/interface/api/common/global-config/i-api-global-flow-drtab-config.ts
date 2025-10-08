/**
 * @description 全局drtab分页流布局配置
 * @export
 * @interface IApiGlobalFlowDrtabConfig
 */
export interface IApiGlobalFlowDrtabConfig {
  /**
   * @description 是否启用导航栏
   * @default false
   * @type {boolean}
   * @memberof IApiGlobalFlowDrtabConfig
   */
  enableNavbar: boolean;

  /**
   * @description 导航栏位置
   * @type {('MIDDLELEFT'
   *     | 'MIDDLERIGHT'
   *     | 'TOPLEFT'
   *     | 'TOPRIGHT'
   *     | 'BOTTOMLEFT'
   *     | 'BOTTOMRIGHT')}
   * @default MIDDLERIGHT
   * @memberof IApiGlobalFlowDrtabConfig
   */
  navbarPos:
    | 'MIDDLELEFT'
    | 'MIDDLERIGHT'
    | 'TOPLEFT'
    | 'TOPRIGHT'
    | 'BOTTOMLEFT'
    | 'BOTTOMRIGHT';

  /**
   * @description 导航栏宽度
   * @type {number}
   * @deafault 200
   * @memberof IApiGlobalFlowDrtabConfig
   */
  navbarWidth: number;
}
