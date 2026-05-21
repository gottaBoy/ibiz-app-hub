/**
 * @description 语音工具类
 * @export
 * @interface IApiVoiceUtil
 */
export interface IApiVoiceUtil {
  /**
   * @description 文字转语音
   * @param {string} text 文字
   * @param {SpeechSynthesisUtterance} [options] 语音配置
   * @returns {*}  {Promise<boolean>}
   * @memberof IApiVoiceUtil
   */
  textToSpeech(
    text: string,
    options?: SpeechSynthesisUtterance,
  ): Promise<boolean>;
}
