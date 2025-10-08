import { notNilEmpty } from 'qx-util';

/**
 * @description 字符串工具类
 * @export
 * @class StringUtil
 */
export class StringUtil {
  /**
   * @description 上下文替换正则
   * @static
   * @memberof StringUtil
   */
  static contextReg = /\$\{context.[a-zA-Z_$][a-zA-Z0-9_$]{1,}\}/g;

  /**
   * @description 数据替换正则
   * @static
   * @memberof StringUtil
   */
  static dataReg = /\$\{data.[a-zA-Z_$][a-zA-Z0-9_$]{1,}\}/g;

  /**
   * @description 参数替换正则
   * @static
   * @memberof StringUtil
   */
  static paramsReg = /\$\{params.[a-zA-Z_$][a-zA-Z0-9_$]{1,}\}/g;

  /**
   * @description 填充字符串中的数据 用法：传入需要替换的字符串和对象 返回值是string类型
   * @example
   * ```
   * StringUtil.fill('姓名:${context.name},年龄:${data.age}', { name: '张三', age: 10 }, {name: '王二', age: 19}, { name: '李四', age: 25 }); // => '姓名:张三,年龄:25'
   * StringUtil.fill('', { name: '张三', age: 10 }, {name: '王二', age: 19}, { name: '李四', age: 25 }); // => ''
   * ```
   * @static
   * @param {string} str 需填充字符串
   * @param {IContext} [context] 上下文
   * @param {IParams} [params] 参数
   * @param {IData} [data] 数据
   * @return {*}  {string}
   * @memberof StringUtil
   */
  static fill(
    str: string,
    context?: IContext,
    params?: IParams,
    data?: IData,
  ): string {
    if (notNilEmpty(str)) {
      if (notNilEmpty(context)) {
        const strArr = str.match(this.contextReg);
        strArr?.forEach(_key => {
          const key = _key.slice(10, _key.length - 1);
          str = str.replace(`\${context.${key}}`, context![key] || '');
        });
      }
      if (notNilEmpty(params)) {
        const strArr = str.match(this.paramsReg);
        strArr?.forEach(_key => {
          const key = _key.slice(9, _key.length - 1);
          str = str.replace(`\${params.${key}}`, params![key] || '');
        });
      }
      if (notNilEmpty(data)) {
        const strArr = str.match(this.dataReg);
        strArr?.forEach(_key => {
          const key = _key.slice(7, _key.length - 1);
          str = str.replace(`\${data.${key}}`, data![key] || '');
        });
      }
    }
    return str;
  }
}
