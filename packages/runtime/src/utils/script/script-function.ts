/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-new-func */
/* eslint-disable @typescript-eslint/ban-types */
import { mergeRight } from 'ramda';
import { IScriptFunctionOpts, IViewController } from '../../interface';

/** 默认选项 */
const DefaultOptions: IScriptFunctionOpts = {
  /** 是否是单行脚本，并把表达式结果return */
  singleRowReturn: false,
  isAsync: true,
};

export class ScriptFunction {
  protected scriptFn: Function;

  protected argKeys: string[] = [];

  protected options: IScriptFunctionOpts;

  constructor(
    argKeys: string[],
    scriptCode: string,
    options: IScriptFunctionOpts = DefaultOptions,
  ) {
    this.options = options;
    const code = this.formatCode(scriptCode, options);
    this.calcArgKeys(argKeys, options);
    const fn = new Function(...this.argKeys, code);
    this.scriptFn = function callBack(...args: unknown[]): unknown {
      try {
        return fn.apply({}, args);
      } catch (error) {
        ibiz.log.error(
          ibiz.i18n.t('runtime.utils.script.errorReportingScript'),
          code,
        );
        throw error;
      }
    };
  }

  /**
   * 格式化脚本
   * @author lxm
   * @date 2023-07-25 11:02:33
   * @protected
   * @param {string} scriptCode
   * @param {IScriptFunctionOpts} options
   * @return {*}  {string}
   */
  protected formatCode(
    scriptCode: string,
    options: IScriptFunctionOpts,
  ): string {
    let code = scriptCode;
    if (options.singleRowReturn) {
      code = `return (${code})`;
    }
    if (options.isAsync) {
      code = `return (async function() { ${code}} )();`;
    }
    return code;
  }

  /**
   * 计算参数名称集合
   * @author lxm
   * @date 2023-07-25 11:42:37
   * @protected
   * @param {string[]} argKeys
   * @param {IScriptFunctionOpts} options
   */
  protected calcArgKeys(argKeys: string[], options: IScriptFunctionOpts): void {
    const keys = options.presetParams ? Object.keys(options.presetParams) : [];
    keys.push(...argKeys);
    // 预置提供的参数
    const presetArgsKeys = [
      'document',
      'el',
      'selector',
      'env',
      'appSession',
      'topViewSession',
      'viewSession',
      'context',
      'viewParam',
      'activeData',
      'data',
      'app',
      'topView',
      'parentView',
      'view',
      'parent',
      'util',
      'ctrl',
      // 每个事件特定参数，如：表单值变更前的值等
      'args',
    ];
    keys.push(...presetArgsKeys);
    // 除重
    this.argKeys = Array.from(new Set(keys));
  }

  /**
   * 转换参数，把exec的对象参数转换成数组
   * @author lxm
   * @date 2023-07-25 11:22:03
   * @protected
   * @param {IParams} params
   * @return {*}  {any[]}
   */
  protected convertArgs(params: IParams): any[] {
    const { presetParams } = this.options;
    // 合并执行参数和预置参数
    const _params = presetParams ? mergeRight(presetParams, params) : params;

    // 预置的元素查询参数
    _params.document = document;
    _params.selector = (className: string): HTMLCollectionOf<Element> => {
      return document.getElementsByClassName(className);
    };

    // 对象参数转数组
    const result: any[] = [];
    this.argKeys.forEach(key => {
      if (_params[key] === undefined) {
        this.fillDefaultParams(key, _params);
      }
      result.push(_params[key]);
    });

    return result;
  }

  /**
   * 填充预置参数
   * @author lxm
   * @date 2023-08-21 04:07:50
   * @protected
   * @param {string} key
   * @param {IParams} param
   */
  protected fillDefaultParams(key: string, param: IParams): void {
    switch (key) {
      case 'util': // 工具类
        param.util = {
          message: ibiz.message,
          notification: ibiz.notification,
          modal: ibiz.modal,
          confirm: ibiz.confirm,
          openView: ibiz.openView,
        };
        break;
      case 'viewParam': // 视图参数
        param.viewParam = param.params;
        break;
      case 'env': // 全局环境变量
        param.env = ibiz.env;
        break;
      case 'app': // 应用级的控制器
        param.app = ibiz.hub.controller;
        break;
      case 'appSession': // 全局共享数据对象
        param.appSession = ibiz.hub.controller.session;
        break;
      default:
        break;
    }
    const view = param.view as IViewController | undefined;
    if (view) {
      switch (key) {
        case 'parent': // 父容器控制器
          param.parent = view.parentView;
          break;
        case 'topView': // 顶级视图控制器
          param.topView = view.getTopView();
          break;
        case 'parentView': // 父级视图控制器
          param.parentView = view.parentView;
          break;
        case 'topViewSession': // 顶级视图共享数据对象
          param.topViewSession = view.getTopView().session;
          break;
        case 'viewSession': // 当前视图共享数据对象
          param.viewSession = view.session;
          break;
        default:
          break;
      }
    }
  }

  /**
   * 执行脚本代码
   * @author lxm
   * @date 2023-07-25 11:21:44
   * @param {IParams} params
   * @return {*}
   */
  exec(params: IParams): unknown {
    const scriptArgs = this.convertArgs(params);
    return this.scriptFn(...scriptArgs);
  }
}
