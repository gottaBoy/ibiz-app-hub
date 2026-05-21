/**
 * @description 全局选择类编辑器配置
 * @export
 * @interface IApiGlobalPickerEditorConfig
 */
export interface IApiGlobalPickerEditorConfig {
  /**
   * @description 宽度模式,auto 宽度自动延长；ellipsis 内容超出时出省略号，鼠标悬浮出现tooltip提示
   * @type {('auto' | 'ellipsis')}
   * @default auto
   * @platform web
   * @memberof IApiGlobalPickerEditorConfig
   */
  overflowMode: 'auto' | 'ellipsis';
}
