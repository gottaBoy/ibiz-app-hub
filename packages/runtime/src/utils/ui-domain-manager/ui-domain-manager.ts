import { UIDomain } from '../ui-domain/ui-domain';

/**
 * 界面域管理器
 *
 * @author chitanda
 * @date 2023-12-22 15:12:10
 * @export
 * @class UIDomainManager
 */
export class UIDomainManager {
  /**
   * 界面域实例缓存
   *
   * @author chitanda
   * @date 2023-12-22 15:12:53
   * @protected
   * @type {Map<string, UIDomain>}
   */
  protected domainMap: Map<string, UIDomain> = new Map();

  /**
   * 创建域
   *
   * @author chitanda
   * @date 2023-12-22 16:12:44
   * @param {string} [id] 可选，不传则自动生成
   * @return {*}  {UIDomain}
   */

  /**
   * @description 创建域
   * @param {string} [id] 可选，不传则自动生成
   * @param {string} [appDataEntityId] 可选，应用实体标识
   * @returns {*}  {UIDomain}
   * @memberof UIDomainManager
   */
  create(id?: string, appDataEntityId?: string): UIDomain {
    const domain = new UIDomain(id, appDataEntityId);
    this.domainMap.set(domain.id, domain);
    return domain;
  }

  /**
   * 获取域
   *
   * @author tony001
   * @date 2025-01-02 17:01:52
   * @param {string} id
   * @return {*}  {(UIDomain | undefined)}
   */
  get(id: string): UIDomain | undefined {
    if (this.domainMap.has(id)) {
      return this.domainMap.get(id);
    }
    ibiz.log.warn(
      ibiz.i18n.t('runtime.utils.uiDomainManager.invalidInterfaceDomain', {
        id,
      }),
    );
  }

  /**
   * 判断是否存在指定界面域
   *
   * @param {string} id
   * @return {*}  {boolean}
   * @memberof UIDomainManager
   */
  has(id: string): boolean {
    return this.domainMap.has(id);
  }

  /**
   * 销毁域
   *
   * @author chitanda
   * @date 2023-12-22 15:12:03
   * @param {string} id
   */
  destroy(id: string): void {
    if (this.domainMap.has(id)) {
      this.domainMap.get(id)!.destroy();
      this.domainMap.delete(id);
    }
  }
}
