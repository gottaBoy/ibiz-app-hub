/**
 * @description 图片压缩配置
 * @export
 * @interface IApiGlobalImgCompressConfig
 */
export interface IApiGlobalImgCompressConfig {
  /**
   * @description 图片压缩范围（超过该范围进行压缩，单位kb）
   * @type {number}
   * @default 1024
   * @platform mob
   * @memberof IApiGlobalImgCompressConfig
   */
  limit: number;

  /**
   * @description 图片压缩质量（范围0-1，为0时不压缩）
   * @type {number}
   * @default 0
   * @platform mob
   * @memberof IApiGlobalImgCompressConfig
   */
  quality: number;

  /**
   * @description 压缩图片最大宽度，单位px
   * @type {number}
   * @default 1280
   * @platform mob
   * @memberof IApiGlobalImgCompressConfig
   */
  maxWidth: number;
}
