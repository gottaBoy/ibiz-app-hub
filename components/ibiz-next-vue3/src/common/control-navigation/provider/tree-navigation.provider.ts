/* eslint-disable @typescript-eslint/prefer-as-const */
import {
  INavViewMsg,
  ITreeNodeData,
  TreeController,
  MDControlController,
} from '@ibiz-template/runtime';
import { IDETree } from '@ibiz/model-core';
import { NavgationBaseProvider } from './navigation-base.provider';

/**
 * 树导航适配器
 *
 * @export
 * @class TreeNavigationProvider
 * @extends {NavgationBaseProvider}
 */
export class TreeNavigationProvider extends NavgationBaseProvider {
  keyName: '_id' = '_id';

  declare controller: TreeController;

  declare model: IDETree;

  /**
   * 有导航视图的节点标识
   *
   * @type {string[]}
   * @memberof TreeNavigationProvider
   */
  navNodeModelIds: string[] = [];

  /**
   * Creates an instance of TreeNavigationProvider.
   * @param {MDControlController} controller
   * @memberof TreeNavigationProvider
   */
  constructor(controller: MDControlController) {
    super(controller);
    const { detreeNodes } = this.model;
    detreeNodes?.forEach(node => {
      if (node.navAppViewId) {
        this.navNodeModelIds.push(node.id!);
      }
    });
  }

  onNavDataByStack(): void {
    const { items, rootNodes } = this.controller.state;
    const defaultNav = items.find(node => {
      // 根节点不显示的时候排除根节点
      if (!this.model.rootVisible && rootNodes.includes(node)) {
        return false;
      }
      // 需要导航视图的时候，返回第一个配置了导航视图的节点数据
      return this.navNodeModelIds.includes(node._nodeId);
    });
    const navData =
      this.navStack
        .map(key => items.find(item => item[this.keyName] === key))
        .find(item => item !== undefined) || defaultNav;
    if (navData) {
      this.setNavData(navData);
    } else {
      this.clearNavigation();
    }
  }

  getNavViewMsg(item: ITreeNodeData): INavViewMsg {
    const { detreeNodes } = this.model;
    const nodeModel = detreeNodes?.find(node => node.id === item._nodeId);
    const _context = Object.assign(
      this.controller.context.clone(),
      item._context || {},
    );
    const _params = { ...this.controller.params, ...(item._params || {}) };
    if (nodeModel) {
      const { context, params } = this.prepareParams(
        nodeModel,
        item._deData ? item._deData : item,
        _context,
        _params,
      );
      return {
        key: item[this.keyName],
        context,
        params,
        viewId: nodeModel.navAppViewId,
      };
    }
    return {
      key: item[this.keyName],
      context: _context,
      params: _params,
    };
  }
}
