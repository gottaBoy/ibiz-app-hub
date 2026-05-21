/**
 * @description 序列化对象，存在循环引用时替换对象为[Circular]
 * @export
 * @param {Parameters<JSON['stringify']>[0]} obj 对象
 * @returns {*}  {string}
 */
export function stringifyObj(obj: Parameters<JSON['stringify']>[0]): string {
  const set = new WeakSet();
  return JSON.stringify(obj, (_key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (set.has(value)) {
        return '[Circular]';
      }
      set.add(value);
    }
    return value;
  });
}
