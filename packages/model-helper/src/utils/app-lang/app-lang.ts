/**
 * 将界面语言标识解析为应用多语言模型里的语言键。
 *
 * 浏览器语言带地区后缀（en-US -> EN_US），而模型里的语言键只到语言本身
 * （EN、ZH_CN），两者不直接相等。先精确匹配，因此 ZH_CN 这类本身带下划线的
 * 键原样命中；只有当裸语言码本身就是模型声明的键时才回退，所以 EN_US 命中
 * EN，而 zh-TW 不会被误配到简体，仍然按未支持上报。
 *
 * @param {string} language 界面语言标识，如 en-US、zh-CN
 * @param {string[]} available 应用模型声明的语言键集合
 * @return {*}  {(string | undefined)} 命中的模型语言键，未命中时为 undefined
 */
export function resolveAppLangKey(
  language: string,
  available: string[],
): string | undefined {
  const requested = language.replace('-', '_').toUpperCase();
  if (available.includes(requested)) {
    return requested;
  }
  const bare = requested.split('_')[0];
  return available.includes(bare) ? bare : undefined;
}
