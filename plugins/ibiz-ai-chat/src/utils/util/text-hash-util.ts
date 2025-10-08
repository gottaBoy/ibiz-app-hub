/* eslint-disable no-bitwise */

/**
 * @description 简单哈希函数 - 返回大写字母和数字
 * @param {string} str
 * @returns {*}
 */
function simpleHash(str: string) {
  let hash: number = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // 转换为32位整数
  }
  // 转换为36进制字符串并转换为大写
  return Math.abs(hash).toString(36).toUpperCase();
}

/**
 * @description FNV-1a哈希算法 - 返回大写字母和数字
 * @param {string} str
 * @returns {*}
 */
function fnv1aHash(str: string) {
  let hash = 2166136261; // FNV偏移基础值
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash +=
      (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  // 转换为36进制字符串并转换为大写
  return Math.abs(hash).toString(36).toUpperCase();
}

/**
 * @description DJB2哈希算法 - 返回大写字母和数字
 * @param {string} str
 * @returns {*}
 */
function djb2Hash(str: string) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) + hash + str.charCodeAt(i);
  }
  // 转换为36进制字符串并转换为大写
  return Math.abs(hash).toString(36).toUpperCase();
}

/**
 * @description 组合多种哈希算法 - 返回大写字母和数字
 * @param {string} str
 * @returns {*}
 */
function combinedHash(str: string) {
  const h1 = simpleHash(str);
  const h2 = fnv1aHash(str);
  const h3 = djb2Hash(str);

  // 组合并提取部分字符
  const combined = h1 + h2 + h3;
  let result = '';

  // 从组合字符串中选择字符
  for (let i = 0; i < (str.length % 10) + 10; i++) {
    const index = (i * 7) % combined.length;
    result += combined.charAt(index);
  }

  return result.toUpperCase();
}

/**
 * @description 过滤函数，只保留大写字母和数字
 * @param {string} hash
 * @returns {*}
 */
function filterToUpperCaseAndDigits(hash: string) {
  return hash.replace(/[^A-Z0-9]/g, '');
}

/**
 * @description 根据选择的算法生成哈希
 * @param {string} str
 * @param {('fnv1a' | 'djb2' | 'combined' | 'simple')} algorithm
 * @returns {*}
 */
function generateHash(
  str: string,
  algorithm: 'fnv1a' | 'djb2' | 'combined' | 'simple',
) {
  switch (algorithm) {
    case 'fnv1a':
      return fnv1aHash(str);
    case 'djb2':
      return djb2Hash(str);
    case 'combined':
      return combinedHash(str);
    case 'simple':
    default:
      return simpleHash(str);
  }
}

/**
 * @description 截断或扩展哈希到指定长度
 * @param {string} hash
 * @param {number} [length=36]
 * @returns {*}
 */
function formatHash(hash: string, length: number = 36) {
  // 先过滤，只保留大写字母和数字
  const filteredHash = filterToUpperCaseAndDigits(hash);

  if (filteredHash.length >= length) {
    return filteredHash.substring(0, length);
  }

  // 如果哈希太短，扩展它
  let extendedHash = filteredHash;
  while (extendedHash.length < length) {
    extendedHash += filterToUpperCaseAndDigits(
      generateHash(extendedHash, 'combined'),
    );
  }
  return extendedHash.substring(0, length);
}

/**
 * @description 获取指定字符串hash
 * @export
 * @param {string} text
 * @param {number} [length=36]
 * @returns {*}
 */
export function generateHashWithText(text: string, length: number = 36) {
  const hash = generateHash(text, 'combined');
  return formatHash(hash, length);
}
