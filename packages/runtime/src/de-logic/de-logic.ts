/* eslint-disable no-await-in-loop */
import { ModelError, RuntimeModelError } from '@ibiz-template/core';
import { IAppDELogic } from '@ibiz/model-core';
import { ScriptFactory, ScriptFunction } from '../utils';
import { DELogicContext } from './de-logic-context';
import {
  AppendParamNode,
  BindParamNode,
  CopyParamNode,
  DataSetNode,
  DEActionNode,
  DebugParamNode,
  DELogicNode,
  EndNode,
  PrepareParamNode,
  RenewParamNode,
  ResetParamNode,
  SortParamNode,
  StartNode,
} from './de-logic-node';
import { ThrowExceptionNode } from './de-logic-node/throw-exception-node/throw-exception-node';
import { DELogicParam } from './de-logic-param/de-logic-param';

/**
 * 界面逻辑
 *
 * @author lxm
 * @date 2023-02-07 16:02:48
 * @export
 * @class DELogic
 */
export class DELogic {
  /**
   * 所有节点实例
   *
   * @author lxm
   * @date 2023-02-08 21:02:38
   * @protected
   * @type {Map<string, DELogicNode>}
   */
  protected nodes: Map<string, DELogicNode> = new Map();

  /**
   * 所有参数实例
   *
   * @author lxm
   * @date 2023-02-08 21:02:25
   * @protected
   * @type {Map<string, DELogicParam>}
   */
  protected params: Map<string, DELogicParam> = new Map();

  /**
   * 脚本函数
   * @author lxm
   * @date 2023-09-13 04:25:27
   * @protected
   * @type {ScriptFunction}
   */
  protected scriptFn?: ScriptFunction;

  /**
   * Creates an instance of DELogic.
   * @author lxm
   * @date 2023-02-08 17:02:26
   * @param {IAppDELogic} model
   */
  constructor(protected model: IAppDELogic) {
    // 脚本代码模式
    if (model.customCode) {
      if (!model.scriptCode) {
        throw new RuntimeModelError(
          model,
          ibiz.i18n.t('runtime.deLogic.deLogicNode.noScriptCode'),
        );
      }
      this.scriptFn = ScriptFactory.createScriptFn([], model.scriptCode, {
        isAsync: true,
      });
      return;
    }

    if (!model.delogicNodes?.length) {
      throw new RuntimeModelError(
        model,
        ibiz.i18n.t('runtime.deLogic.deLogicNode.noConfigurationLogicNode'),
      );
    }
    model.delogicNodes.forEach(node => {
      const { logicNodeType } = node;
      let logicNode;
      switch (logicNodeType) {
        case 'BEGIN': // 开始
          logicNode = new StartNode(node);
          break;
        case 'END': // 结束
          logicNode = new EndNode(node);
          break;
        case 'DEACTION': // 实体行为
          logicNode = new DEActionNode(node);
          break;
        case 'PREPAREPARAM': // 准备参数
          logicNode = new PrepareParamNode(node);
          break;
        case 'DEDATASET': // 实体数据集
          logicNode = new DataSetNode(node);
          break;
        case 'THROWEXCEPTION': // 抛出异常
          logicNode = new ThrowExceptionNode(node);
          break;
        case 'BINDPARAM': // 绑定参数
          logicNode = new BindParamNode(node);
          break;
        case 'RESETPARAM': // 重置参数
          logicNode = new ResetParamNode(node);
          break;
        case 'COPYPARAM': // 拷贝参数
          logicNode = new CopyParamNode(node);
          break;
        case 'RENEWPARAM': // 重新建立参数
          logicNode = new RenewParamNode(node);
          break;
        case 'APPENDPARAM': // 附加到数组参数
          logicNode = new AppendParamNode(node);
          break;
        case 'SORTPARAM': // 排序数组参数
          logicNode = new SortParamNode(node);
          break;
        case 'DEBUGPARAM': // 调试逻辑参数
          logicNode = new DebugParamNode(node);
          break;
        default:
          throw new ModelError(
            node,
            ibiz.i18n.t('runtime.deLogic.deLogicNode.unsupportedLogical', {
              logicNodeType,
            }),
          );
      }
      this.nodes.set(node.id!, logicNode);
    });
    model.delogicParams?.forEach(param => {
      this.params.set(param.id!, new DELogicParam(param));
    });
    // 将已经实例化的逻辑节点挂载到逻辑连接上
    this.nodes.forEach(node => {
      node.links.forEach(link => {
        link.srcNode = node;
        if (this.nodes.has(link.model.thenId!)) {
          link.dstNode = this.nodes.get(link.model.thenId!)!;
        }
      });
    });
  }

  /**
   * 初始化当前环境的逻辑参数的实例
   *
   * @author lxm
   * @date 2023-02-08 21:02:58
   * @protected
   * @param {DELogicContext} ctx
   * @param {IContext} context
   * @param {IData} data
   * @param {IParams} [opt]
   */
  protected initLogicParams(ctx: DELogicContext): void {
    this.params.forEach(param => {
      if (param.model.default) {
        ctx.defaultParamName = param.model.id!;
      }
      param.calc(ctx);
    });
  }

  /**
   * 执行逻辑
   *
   * @author lxm
   * @date 2023-02-08 21:02:09
   * @param {IContext} context
   * @param {IData} data
   * @param {IParams} [opt]
   * @return {*}  {Promise<IData>}
   */
  async exec(
    context: IContext,
    data: IData | IData[],
    params: IParams,
  ): Promise<unknown> {
    if (this.scriptFn) {
      return this.scriptFn.exec({ context, data, params });
    }
    const ctx = new DELogicContext(this.params, context, data, params);
    this.initLogicParams(ctx);
    const { startDELogicNodeId } = this.model;
    if (startDELogicNodeId && this.nodes.has(startDELogicNodeId)) {
      const start = this.nodes.get(startDELogicNodeId)!;
      await this.deepExec(start, ctx);
    } else {
      throw new RuntimeModelError(
        this.model,
        ibiz.i18n.t('runtime.deLogic.deLogicNode.noSetStartNode'),
      );
    }
    if (ctx.isEndNode) {
      return ctx.result;
    }
    if (ctx.params[ctx.defaultParamName]) {
      return ctx.params[ctx.defaultParamName];
    }
    return null;
  }

  /**
   * 开始根据连线递归执行逻辑
   *
   * @author lxm
   * @date 2023-06-13 08:29:36
   * @protected
   * @param {DELogicNode} node 逻辑节点
   * @param {DELogicContext} ctx 逻辑上下文
   * @return {*}  {Promise<void>}
   */
  protected async deepExec(
    node: DELogicNode,
    ctx: DELogicContext,
  ): Promise<void> {
    // 执行逻辑节点
    await node.exec(ctx);
    const { links } = node;
    // 遍历所有节点连接，递归执行下级连接节点
    for (let index = 0; index < links.length; index++) {
      const link = links[index];
      const bol = await link.exec(ctx);
      if (bol && link.dstNode) {
        await this.deepExec(link.dstNode, ctx);
        // 平行输出: 在满足连接条件并逻辑执行完毕后若是非平行输出则执行完成
        if (node.model.parallelOutput !== true) {
          break;
        }
      }
    }
  }
}
