import { RuntimeModelError } from '@ibiz-template/core';
import { IDEUIActionLogic } from '@ibiz/model-core';
import { UIActionUtil } from '../../../ui-action';
import { UILogicContext } from '../../ui-logic-context';
import { UILogicNode } from '../ui-logic-node';

/**
 * 实体界面行为
 *
 * @author chitanda
 * @date 2023-02-09 19:02:09
 * @export
 * @class DEUIActionNode
 * @extends {UILogicNode}
 */
export class DEUIActionNode extends UILogicNode {
  declare model: IDEUIActionLogic;

  async exec(ctx: UILogicContext): Promise<void> {
    const {
      dstAppDEUIActionId,
      dstDEUILogicParamId,
      dstAppDataEntityId,
      retDEUILogicParamId,
    } = this.model;

    const { data, parameters } = ctx;
    if (!dstAppDEUIActionId) {
      throw new RuntimeModelError(
        this.model,
        ibiz.i18n.t('runtime.uiLogic.noConfiguredInterfaceBehavior'),
      );
    }
    let actionData = [data];
    if (dstDEUILogicParamId) {
      const param = ctx.params[dstDEUILogicParamId];
      if (param instanceof Array) {
        actionData = param;
      } else {
        actionData = [param];
      }
    }

    const res = await UIActionUtil.exec(
      dstAppDEUIActionId,
      {
        ...parameters,
        context: ctx.context,
        params: ctx.viewParam,
        data: actionData,
      },
      this.model.appId,
    );

    if (!res.cancel) {
      ctx.params[retDEUILogicParamId!] = res.data;
      ctx.setLastReturn(ctx.params[retDEUILogicParamId!]);
    }

    ibiz.log.debug(
      ibiz.i18n.t('runtime.uiLogic.interfaceLogicNodeEntityInterfaceAction', {
        id: this.model.id,
        dstAppDEUIActionId,
        dstAppDataEntityId,
        dstDEUILogicParamId,
      }),
      ctx.params[retDEUILogicParamId!],
    );
  }
}
