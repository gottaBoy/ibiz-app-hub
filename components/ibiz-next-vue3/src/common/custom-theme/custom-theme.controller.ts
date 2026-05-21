import { clone } from 'ramda';
import { reactive } from 'vue';
import { useNamespace } from '@ibiz-template/vue3-util';
import { predefineThemeVars } from './custom-theme-model';

/**
 * 自定义主题控制器
 * @author zzq
 * @date 2024-05-09 14:18:14
 * @export
 * @class CustomThemeController
 */
export class CustomThemeController {
  /**
   * 自定义主题状态
   *
   * @type {IData}
   * @memberof CustomThemeController
   */
  public state: IData = {};

  /**
   * 自定义配置模型
   *
   * @type {IData[]}
   * @memberof CustomThemeController
   */
  public model: IData[] = [];

  /**
   * 模型映射对象，key为value，value值为var对象
   *
   * @author tony001
   * @date 2024-12-27 10:12:57
   * @private
   * @type {IData}
   */
  private modelMapping: IData = {};

  /**
   * 预定义类型
   *
   * @type {IData}
   * @memberof CustomThemeController
   */
  public predefineType: IData[] = [
    {
      codeName: 'light',
      label: '亮色',
      labelLang: 'light',
      color: '#557da5',
      isCustom: false,
    },
    {
      codeName: 'dark',
      label: '暗色',
      labelLang: 'dark',
      color: '#1c1c1c',
      isCustom: false,
    },
    {
      codeName: 'blue',
      label: '蓝色',
      labelLang: 'blue',
      color: 'rgba(0, 132, 255, 1)',
      isCustom: false,
    },
    {
      codeName: 'user1',
      label: '自定义1',
      labelLang: 'user1',
      color: '#999',
      isCustom: true,
    },
    {
      codeName: 'user2',
      label: '自定义2',
      labelLang: 'user2',
      color: '#888',
      isCustom: true,
    },
    {
      codeName: 'user3',
      label: '自定义3',
      labelLang: 'user3',
      color: '#777',
      isCustom: true,
    },
  ];

  /**
   * Creates an instance of CustomThemeController.
   * @author tony001
   * @date 2024-12-26 18:12:28
   */
  constructor() {
    this.model = predefineThemeVars;
    const customTheme = ibiz.util.theme.getCustomTheme();
    this.state = clone(customTheme);
    this.state = reactive(this.state);
    this.model.forEach((item: IData) => {
      this.initModelMapping(item);
    });
    const pluginTheme = ibiz.util.theme.pluginTheme;
    pluginTheme.forEach(item => {
      const ns = useNamespace('custom-theme');
      const color = this.getRootCssVar(
        ns.cssVarName('color-primary'),
        item.themeTag!,
      );
      this.predefineType.push({
        codeName: item.themeTag,
        label: item.themeTag,
        color,
        isCustom: true,
      });
    });
  }

  /**
   * @description 获取根节点样式变量
   * @protected
   * @param {string} name
   * @param {string} themeTag
   * @returns {*}  {(string | number)}
   * @memberof CustomThemeController
   */
  protected getRootCssVar(name: string, themeTag: string): string | number {
    const root = document.documentElement;
    if (root.classList.contains(themeTag)) {
      return this.getCssVar(name);
    }
    const className = root.className;
    // 先改变根节点样式名获取变量后再还原
    root.className = themeTag;
    const color = this.getCssVar(name);
    // 还原
    root.className = className;
    return color;
  }

  /**
   * 初始化模型映射
   *
   * @author tony001
   * @date 2024-12-27 13:12:53
   * @private
   * @param {IData} item
   */
  private initModelMapping(item: IData): void {
    if (item.children && item.children.length > 0) {
      item.children.forEach((child: IData) => {
        this.initModelMapping(child);
      });
    }
    if (item.vars && item.vars.length > 0) {
      item.vars.forEach((varItem: IData) => {
        this.modelMapping[varItem.value] = varItem;
      });
    }
  }

  /**
   * 获取模型编辑数据
   *
   * @author tony001
   * @date 2024-12-27 13:12:48
   * @public
   * @return {*}  {IData}
   */
  public getModelEditData(): IData {
    const result: IData = {};
    this.model.forEach((item: IData) => {
      const tempData: IData = {};
      this.getSingleGroupModelData(item, tempData);
      result[item.labelLang] = tempData;
    });
    return result;
  }

  /**
   * 获取单个分组的模型数据
   *
   * @author tony001
   * @date 2024-12-27 13:12:05
   * @private
   * @param {IData} item
   * @param {IData} result
   */
  private getSingleGroupModelData(item: IData, result: IData): void {
    if (item.children && item.children.length > 0) {
      item.children.forEach((child: IData) => {
        this.getSingleGroupModelData(child, result);
      });
    }
    if (item.vars && item.vars.length > 0) {
      item.vars.forEach((varItem: IData) => {
        this.modelMapping[varItem.value] = varItem;
        if (varItem.type === 'size') {
          result[varItem.value] = this.getCssVar(varItem.value);
        } else {
          let name = varItem.value;
          if (varItem.className) {
            name = `${varItem.className}:${name}`;
          }
          result[varItem.value] = this.getCssVar(name, varItem.defaultValue);
        }
      });
    }
  }

  /**
   * 获取css变量
   *
   * @param {string} name
   * @return {*}  {string}
   * @memberof CustomThemeController
   */
  public getCssVar(name: string, defaultVar?: string): string | number {
    let result: string | number = defaultVar || name;
    if (this.state.themeVars && this.state.themeVars[name]) {
      result = this.state.themeVars[name];
    } else {
      let elt: Element = document.documentElement;
      let varName = defaultVar || name;
      // 有className时，需从className指定的元素上获取变量
      if (name.split(':').length === 2) {
        const className = name.split(':')[0];
        const element = document.getElementsByClassName(className)?.[0];
        if (element) {
          elt = element;
          varName = name.split(':')[1];
        }
      }
      const styles = window.getComputedStyle(elt);
      if (styles) {
        result = styles.getPropertyValue(varName) || result;
      }
    }
    if (result.toString().endsWith('px')) {
      result = Number(result.toString().slice(0, -2));
    }
    if (
      result.toString().includes(',') &&
      !result.toString().startsWith('rgb')
    ) {
      result = `rgba(${result}, 1)`;
    }
    return result;
  }

  /**
   * 处理主题变更
   *
   * @author tony001
   * @date 2024-12-26 15:12:57
   * @param {string} tag
   * @return {*}  {Promise<void>}
   */
  public async handleThemeChange(tag: string): Promise<void> {
    await ibiz.util.theme.clearCustomThemeParams(this.state.themeTag);
    this.state.themeTag = tag;
    this.state.themeVars = {};
    await this.handleThemePreview(true);
  }

  /**
   * 计算变更主题变量
   *
   * @author tony001
   * @date 2024-12-27 17:12:21
   * @param {IData} newData
   * @return {*}  {Promise<void>}
   */
  public async computeChangeThemeVars(newData: IData): Promise<void> {
    const changeVars: IData[] = [];
    const oldData = this.getModelEditData();
    Object.keys(newData).forEach((type: string) => {
      const newThemeVar = newData[type];
      Object.keys(newThemeVar).forEach((varName: string) => {
        const oldValue = oldData[type][varName];
        if (oldValue !== newThemeVar[varName]) {
          changeVars.push({ key: varName, value: newThemeVar[varName] });
        }
      });
    });
    if (changeVars.length > 0) {
      changeVars.forEach((item: IData) => {
        const targetItem = this.modelMapping[item.key];
        if (targetItem) {
          if (targetItem.type === 'size') {
            this.calcSizeChange(item.key, Number(item.value), targetItem);
          } else {
            let name = item.key;
            if (targetItem.className) {
              name = `${targetItem.className}:${item.key}`;
            }
            this.state.themeVars[name] = item.value;
          }
        }
      });
    }
  }

  /**
   * 处理主题预览
   *
   * @author tony001
   * @date 2024-12-26 17:12:59
   * @return {*}  {Promise<void>}
   */
  public async handleThemePreview(isLoad: boolean): Promise<void> {
    const { themeTag, themeVars } = await ibiz.util.theme.previewCustomTheme(
      this.state.themeTag,
      this.state.themeVars,
      isLoad,
    );
    this.state.themeTag = themeTag;
    this.state.themeVars = themeVars;
  }

  /**
   * 处理主题保存
   *
   * @author tony001
   * @date 2024-12-26 18:12:44
   * @param {boolean} isShare
   * @return {*}  {Promise<void>}
   */
  public async handleThemeSave(isShare: boolean): Promise<void> {
    await this.handleThemePreview(false);
    await ibiz.util.theme.saveCustomTheme(
      this.state.themeTag,
      this.state.themeVars,
      isShare,
    );
  }

  /**
   * 处理主题重置
   *
   * @author tony001
   * @date 2024-12-27 20:12:03
   * @param {boolean} isShare
   * @return {*}  {Promise<void>}
   */
  public async handleThemeReset(isShare: boolean): Promise<void> {
    const res = await ibiz.confirm.info({
      title: ibiz.i18n.t(`control.common.customTheme.resetConfirmation`),
      desc: isShare
        ? ibiz.i18n.t(`control.common.customTheme.resetConfirmationGlobalDesc`)
        : ibiz.i18n.t(`control.common.customTheme.resetConfirmationDesc`),
    });
    if (!res) return;
    const { themeVars } = await ibiz.util.theme.resetCustomTheme(
      this.state.themeTag,
      isShare,
    );
    this.state.themeVars = themeVars;
  }

  /**
   * 计算尺寸改变，同类size批量更改
   *
   * @param {string} varName
   * @param {number} size
   * @memberof CustomThemeController
   */
  public calcSizeChange(varName: string, size: number, item: IData): void {
    this.state.themeVars[varName] = `${size}${item.unit || ''}`;
    if (item.kindVars) {
      Object.keys(item.kindVars).forEach((key: string) => {
        const value = item.kindVars[key];
        this.state.themeVars[key] = `${size + value}${item.unit || ''}`;
      });
    }
  }
}
