import { RuntimeError } from '@ibiz-template/core';
import { IAppCodeList, IApplication, ICodeItem } from '@ibiz/model-core';
import { isNumber } from 'lodash-es';
import { CodeListItem, IApiCodeListService } from '../../../interface';
import { ScriptFactory } from '../../../utils';
import { DynamicCodeListCache } from '../../utils';
import { calcThresholdRange } from '../../../controller/utils/code-list/code-list';

/**
 * 全局代码表服务
 *
 * @author chitanda
 * @date 2022-08-25 15:08:32
 * @export
 * @class CodeListService
 */
export class CodeListService implements IApiCodeListService {
  /**
   * 所有代码表缓存
   *
   * @author lxm
   * @date 2022-08-25 20:08:16
   */
  protected allCodeLists = new Map<string, IAppCodeList>();

  /**
   * 代码表项数据缓存
   *
   * @author lxm
   * @date 2022-08-25 21:08:12
   * @protected
   * @type {Map<string, CodeListItem[]>}
   */
  protected cache: Map<string, readonly CodeListItem[] | DynamicCodeListCache> =
    new Map();

  /**
   * 已合并子应用代码表标识缓存
   *
   * @protected
   * @type {Map<string, DynamicCodeListCache>}
   */
  protected mergedSubCodeListCache: Array<string> = [];

  constructor(protected appModel: IApplication) {}

  /**
   * 获取静态代码表
   *
   * @author chitanda
   * @date 2022-08-25 15:08:11
   * @param {string} _tag
   * @return {*}  {CodeListItem[]}
   */
  protected getStatic(codeList: IAppCodeList): CodeListItem[] {
    const codeName = codeList.codeName!;
    if (this.cache.has(codeName)) {
      return this.cache.get(codeName)! as CodeListItem[];
    }
    const items = codeList.codeItems;
    let result: CodeListItem[] = [];
    if (items?.length) {
      result = this.formatStaticItems(items, codeList.codeItemValueNumber!);
    }
    this.cache.set(codeName, Object.freeze(result));
    return result;
  }

  /**
   * 设置代码表模型
   *
   * @author lxm
   * @date 2023-5-23 19:38:51
   * @protected
   * @param {IAppCodeList} codeList
   * @returns {*}
   */
  setCodeList(codeList: IAppCodeList): void {
    const { id, codeName } = codeList;
    this.allCodeLists.set(id!, codeList);
    this.allCodeLists.set(codeName!, codeList);
  }

  /**
   * 获取代码表模型
   *
   * @author lxm
   * @date 2023-5-23 19:38:51
   * @protected
   * @param {string} tag
   * @returns {*}
   */
  getCodeList(tag: string): IAppCodeList | undefined {
    const codelist = this.allCodeLists.get(tag);
    // 仅主应用合并所有子应用同代码表标识代码表
    // mergedSubCodeListCache防止界面请求重复合并问题
    if (
      this.appModel.appId === ibiz.env.appId &&
      codelist &&
      !this.mergedSubCodeListCache.includes(codelist.codeListTag!)
    ) {
      ibiz.hub.mergeSubAppCodeList(codelist);
      this.mergedSubCodeListCache.push(codelist.codeListTag!);
    }
    return codelist;
  }

  /**
   * 格式化代码表
   *
   * @author lxm
   * @date 2022-08-25 21:08:03
   * @protected
   * @param {ICodeItem[]} codeItems
   * @param {boolean} isValueNumber
   * @returns {*}
   */
  protected formatStaticItems(
    codeItems: ICodeItem[],
    isValueNumber: boolean,
  ): Readonly<CodeListItem>[] {
    return codeItems.map(codeItem => {
      let text = codeItem.text!;
      if (codeItem.textLanguageRes) {
        text = ibiz.i18n.t(codeItem.textLanguageRes.lanResTag!, codeItem.text);
      }
      // 提示信息
      let { tooltip } = codeItem;
      if (codeItem.tooltipLanguageRes) {
        tooltip = ibiz.i18n.t(
          codeItem.tooltipLanguageRes.lanResTag!,
          codeItem.tooltip,
        );
      }
      const _codeItem: CodeListItem = {
        text,
        value: isValueNumber ? Number(codeItem.value) : codeItem.value!,
        color: codeItem.color,
        id: codeItem.codeName!,
        textCls: codeItem.textCls,
        disableSelect: codeItem.disableSelect,
        tooltip,
        // 代码项数据
        data: codeItem.data
          ? (ScriptFactory.execSingleLine(codeItem.data) as IData)
          : undefined,
        sysImage: codeItem.sysImage,
        userData: codeItem.userData,
        beginValue: codeItem.beginValue,
        endValue: codeItem.endValue,
        includeBeginValue: codeItem.includeBeginValue,
        includeEndValue: codeItem.includeEndValue,
      };
      if (codeItem.codeItems?.length) {
        _codeItem.children = this.formatStaticItems(
          codeItem.codeItems!,
          isValueNumber,
        );
      }
      return Object.freeze(_codeItem);
    });
  }

  /**
   * 获取动态代码表
   *
   * @author lxm
   * @date 2022-08-25 21:08:06
   * @protected
   * @param {IAppCodeList} codeList
   * @returns {*}  {IData[]}
   */
  protected async getDynamicCodeList(
    codeList: IAppCodeList,
    context: IContext,
    params: IParams = {},
  ): Promise<CodeListItem[]> {
    let dynamicCache: DynamicCodeListCache;
    const codeName = codeList.codeName!;
    if (this.cache.has(codeName)) {
      dynamicCache = this.cache.get(codeName)! as DynamicCodeListCache;
    } else {
      dynamicCache = new DynamicCodeListCache(codeList);
      this.cache.set(codeName, dynamicCache);
      await dynamicCache.init();
    }
    return dynamicCache.get(context, params);
  }

  /**
   * 获取代码表
   *
   * @author chitanda
   * @date 2022-08-25 15:08:45
   * @param {string} tag
   * @param {IContext} [context]
   * @param {IParams} [params]
   * @return {*}  {Promise<CodeListItem[]>}
   */
  async get(
    tag: string,
    context: IContext,
    params?: IParams,
  ): Promise<readonly CodeListItem[]> {
    const codeList = this.allCodeLists.get(tag);
    if (!codeList) {
      throw new RuntimeError(
        ibiz.i18n.t('runtime.service.noFindCodeList', { tag }),
      );
    }
    if (codeList.codeListType === 'STATIC') {
      return this.getStatic(codeList);
    }
    if (codeList.codeListType === 'DYNAMIC') {
      return this.getDynamicCodeList(codeList, context, params);
    }
    // todo 预定义代码表
    return [];
  }

  /**
   * 递归查找代码表项
   *
   * @param {IAppCodeList} codeList 代码表模型
   * @param {readonly CodeListItem[] | undefined} dataItems 代码表数据
   * @param {string | number} value 代码项值
   * @returns 代码表项|CodeListItem | undefined
   */
  findCodeListItem(
    codeList: IAppCodeList,
    dataItems: readonly CodeListItem[] | undefined,
    value: string | number,
  ): CodeListItem | undefined {
    if (dataItems) {
      const { thresholdGroup } = codeList;
      // 阈值模式
      if (thresholdGroup && isNumber(Number(value))) {
        const findItem = calcThresholdRange(dataItems, Number(value));
        if (findItem) {
          return findItem;
        }
      }
      const findItem = dataItems.find(item => item.value === value);
      if (findItem) {
        return findItem;
      }
      for (let i = 0; i < dataItems.length; i++) {
        const childrenItem = this.findCodeListItem(
          codeList,
          dataItems[i].children,
          value,
        ) as CodeListItem;
        if (childrenItem) {
          return childrenItem;
        }
      }
    }
  }

  /**
   * 获取代码表项
   *
   * @param {string} tag 代码表标识
   * @param {string | number} value 代码表值
   * @param {IContext} context 上下文
   * @param {IParams} params 视图参数
   * @returns 代码表项|Promise<CodeListItem | undefined>
   */
  async getItem(
    tag: string,
    value: string | number,
    context: IContext,
    params?: IParams,
  ): Promise<CodeListItem | undefined> {
    const codeList = this.allCodeLists.get(tag);
    if (!codeList) {
      throw new RuntimeError(
        ibiz.i18n.t('runtime.service.noFindCodeList', { tag }),
      );
    }
    const dataItems = await this.get(tag, context, params);
    return this.findCodeListItem(codeList, dataItems, value);
  }

  /**
   * 获取代码表实例对象(动态代码表返回具体实例，静态代码表返回undefined)
   *
   * @param tag 代码表标识
   * @returns 动态代码表实例|undefined
   */
  async getCodeListInstance(
    tag: string,
  ): Promise<DynamicCodeListCache | undefined> {
    let codeListInstance;
    const codeList = this.allCodeLists.get(tag);
    if (!codeList) {
      throw new RuntimeError(
        ibiz.i18n.t('runtime.service.noFindCodeList', { tag }),
      );
    }
    if (codeList.codeListType === 'DYNAMIC') {
      const codeName = codeList.codeName!;
      if (this.cache.has(codeName)) {
        codeListInstance = this.cache.get(codeName)! as DynamicCodeListCache;
      } else {
        codeListInstance = new DynamicCodeListCache(codeList);
        this.cache.set(codeName, codeListInstance);
        await codeListInstance.init();
      }
    }
    return codeListInstance;
  }

  /**
   * 销毁(清除动态代码表监听)
   *
   * @author tony001
   * @return {void}
   */
  destroy(): void {
    const cacheList = Array.from(this.cache.values());
    cacheList.forEach(item => {
      if (item instanceof DynamicCodeListCache) {
        item.destroy();
      }
    });
  }
}
