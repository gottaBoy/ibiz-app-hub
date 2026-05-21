import { PlatformType } from '../constant';

export const ua = window.navigator.userAgent.toLowerCase();

// android平台
export function isAndroid(): boolean {
  return /Android|Adr/i.test(ua);
}

// ios平台
export function isIos(): boolean {
  return /iPhone|iPod|iPad/i.test(ua);
}
// 微信生态
export function isWeChat(): boolean {
  return /MicroMessenger/i.test(ua);
}

// 钉钉环境
export function isDingDing(): boolean {
  return /DingTalk/i.test(ua);
}
// 微信小程序
export function isWxMp(): boolean {
  return (
    /miniProgram/i.test(ua) ||
    (window as IData).__wxjs_environment === 'miniprogram'
  );
}

/**
 * 获取搭载平台名称
 *
 * @author zk
 * @date 2023-11-21 02:11:28
 * @export
 * @return {*}  {PlatformType}
 */
export function getPlatformType(): PlatformType {
  if (isDingDing()) {
    return PlatformType.DINGTALK;
  }
  if (isWeChat()) {
    return PlatformType.WECHAT;
  }
  if (isAndroid()) {
    return PlatformType.ANDROID;
  }
  if (isIos()) {
    return PlatformType.IOS;
  }
  if (isWxMp()) {
    return PlatformType.WCMP;
  }
  // 默认为浏览器
  return PlatformType.BROWSER;
}
