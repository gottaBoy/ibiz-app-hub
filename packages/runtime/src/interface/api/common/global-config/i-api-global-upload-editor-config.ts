/**
 * @description 全局上传类编辑器配置
 * @export
 * @interface IApiGlobalUploadEditorConfig
 */
export interface IApiGlobalUploadEditorConfig {
  /**
   * @description 上传文件信息的映射规则字符串，用于将上传成功后返回的文件数据转换为保存数据所需格式。格式为'源键:目标键;源键2:目标键2'。示例：映射规则（'filesize:size;fileext:ext'），源对象（{filesize:'10000', fileext:'.gif'}），转换结果（{size:'10000', ext:'.gif'}）
   * @type {string}
   * @memberof IApiGlobalUploadEditorConfig
   */
  infoMap: string;
}
