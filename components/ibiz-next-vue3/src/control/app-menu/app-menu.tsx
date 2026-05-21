import {
  Namespace,
  showTitle,
  RuntimeError,
  findRecursiveChild,
} from '@ibiz-template/core';
import {
  useNamespace,
  route2routePath,
  useControlController,
} from '@ibiz-template/vue3-util';
import { IAppMenuItem, IAppMenu, IAppMenuRawItem } from '@ibiz/model-core';
import {
  Ref,
  ref,
  VNode,
  watch,
  computed,
  nextTick,
  PropType,
  onMounted,
  defineComponent,
} from 'vue';
import { createUUID } from 'qx-util';
import {
  ViewCallTag,
  formatSeparator,
  IControlProvider,
  AppMenuController,
  ScriptFactory,
} from '@ibiz-template/runtime';
import { useRoute } from 'vue-router';
import { MenuDesign } from './custom-menu-design/custom-menu-design';
import './app-menu.scss';

/**
 * @description 绘制成员的attrs
 * @param {IAppMenu} model
 * @param {IParams} params
 * @returns {*}  {IParams}
 */
function renderAttrs(model: IAppMenu, params: IParams): IParams {
  const attrs: IParams = {};
  model.controlAttributes?.forEach(item => {
    if (item.attrName && item.attrValue) {
      attrs[item.attrName!] = ScriptFactory.execSingleLine(item.attrValue!, {
        ...params,
      });
    }
  });
  return attrs;
}

/**
 * 递归生成菜单数据，递给 element 的 Menu 组件
 *
 * @author chitanda
 * @date 2022-07-25 10:07:28
 * @param {AppMenuItemModel[]} items
 * @return {*}  {any[]}
 */
function getMenus(items: IAppMenuItem[]): IData[] {
  return items.map(item => {
    const data: IData = {
      key: item.id,
      label: item.caption,
      image: item.sysImage,
      counterId: item.counterId,
      disabled: !item.appFuncId,
      tooltip: item.tooltip,
      itemType: item.itemType,
      sysCss: item.sysCss,
    };
    if (item.appMenuItems?.length) {
      data.children = getMenus(item.appMenuItems);
    }
    return data;
  });
}

/**
 * 用适配器绘制菜单项文本
 * @author lxm
 * @date 2023-12-29 03:36:05
 * @param {string} itemId
 * @param {AppMenuController} c
 * @return {*}  {VNode}
 */
function renderByProvider(itemId: string, c: AppMenuController): VNode {
  const itemModel = c.allAppMenuItems.find(item => item.id === itemId);
  if (!itemModel) {
    throw new RuntimeError(
      ibiz.i18n.t('control.menu.noFoundModel', {
        menuKey: itemId,
      }),
    );
  }
  const provider = c.itemProviders[itemId];
  if (!provider.renderText) {
    throw new RuntimeError(
      ibiz.i18n.t('control.menu.noFoundFunction', {
        menuKey: itemId,
      }),
    );
  }
  return provider.renderText(itemModel, c);
}

function findCustomMenu(_key: string, items: IData[]): IData | undefined {
  let temp: IData | undefined;
  if (items) {
    items.some((item: IData): boolean => {
      if (item.key === _key) {
        temp = item;
        return true;
      }
      if (item.children && item.children.length > 0) {
        temp = findCustomMenu(_key, item.children);
        if (!temp) {
          return false;
        }
        return true;
      }
      return false;
    });
  }
  return temp;
}

/**
 * 获取菜单项自定义配置的显隐
 *
 * @param {string} _key
 * @param {IData[]} items
 * @return {*}
 */
function getMenuCustomVisible(
  _key: string,
  items: IData[],
  hideSeparator: string[],
) {
  // 如果当前项为隐藏的分隔符，则不绘制
  const tag = hideSeparator.includes(_key);
  if (tag) {
    return false;
  }
  const target = findCustomMenu(_key, items);
  if (target) {
    return target.visible;
  }
  return true;
}

/**
 * 绘制菜单项
 * @author lxm
 * @date 2022-08-16 14:08:20
 * @param {IData} menu
 * @returns {*}
 */
function renderMenuItem(
  isFirst: boolean,
  menu: IData,
  collapse: boolean,
  ns: Namespace,
  c: AppMenuController,
  counterData: IData,
  saveConfigs: IData[],
  hideSeparator: string[],
): VNode | undefined {
  if (!c.state.menuItemsState[menu.key].visible) {
    return;
  }
  if (!getMenuCustomVisible(menu.key, saveConfigs, hideSeparator)) {
    return;
  }
  if (menu.itemType === 'MENUITEM') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let content: any;
    const provider = c.itemProviders[menu.key];
    if (provider && provider.renderText) {
      content = renderByProvider(menu.key, c);
    } else if (!(isFirst && collapse)) {
      content = [
        menu.image ? (
          <iBizIcon class={ns.e('icon')} icon={menu.image}></iBizIcon>
        ) : null,
        menu.label,
        counterData[menu.counterId] != null ? (
          <iBizBadge
            class={ns.e('counter')}
            value={counterData[menu.counterId]}
          />
        ) : null,
      ];
    } else {
      content = [
        menu.image ? (
          <iBizIcon class={ns.e('icon')} icon={menu.image}></iBizIcon>
        ) : (
          menu.label.slice(0, 1)
        ),
      ];
    }

    return !(isFirst && collapse) ? (
      <el-menu-item
        class={[ns.e('item'), `${menu.sysCss?.cssName || ''}`]}
        index={menu.key}
        disabled={menu.disabled}
        title={showTitle(menu.tooltip)}
      >
        {content}
      </el-menu-item>
    ) : (
      <el-tooltip
        class={ns.b('tooltip')}
        content={menu.label}
        placement={'left'}
        theme='light'
      >
        <el-menu-item
          class={[ns.e('item'), `${menu.sysCss?.cssName || ''}`]}
          index={menu.key}
          disabled={menu.disabled}
        >
          {content}
        </el-menu-item>
      </el-tooltip>
    );
  }
  if (menu.itemType === 'SEPERATOR') {
    const direction =
      c.view.model.mainMenuAlign === 'TOP' && isFirst
        ? 'vertical'
        : 'horizontal';
    return (
      <el-divider
        direction={direction}
        class={ns.em('separator', direction)}
        id={menu.key}
      />
    );
  }
  if (menu.itemType === 'RAWITEM') {
    const menuRawItem = findRecursiveChild(c.model, menu.key, {
      compareField: 'id',
      childrenFields: ['appMenuItems'],
    }) as IAppMenuRawItem;
    return (
      <el-menu-item
        index={menu.key}
        title={showTitle(menu.tooltip)}
        class={[ns.e('rawitem'), `${menu.sysCss?.cssName || ''}`]}
      >
        <iBizRawItem rawItem={menuRawItem}></iBizRawItem>
      </el-menu-item>
    );
  }
}

/**
 * @description 绘制分组菜单（菜单样式为扩展视图1时呈现）
 * @param {IData} subMenu
 * @param {boolean} collapse
 * @param {Namespace} ns
 * @param {AppMenuController} c
 * @param {IData} counterData
 * @param {IData[]} saveConfigs
 * @param {string[]} hideSeparator
 * @returns {*}  {(VNode | undefined)}
 */
function renderGroupmenu(
  subMenu: IData,
  collapse: boolean,
  ns: Namespace,
  c: AppMenuController,
  counterData: IData,
  saveConfigs: IData[],
  hideSeparator: string[],
): VNode | undefined {
  if (
    !c.state.menuItemsState[subMenu.key].visible ||
    !getMenuCustomVisible(subMenu.key, saveConfigs, hideSeparator)
  )
    return;
  return (
    <el-menu-item-group
      title={subMenu.label}
      class={[ns.b('groupmenu'), `${subMenu.sysCss?.cssName || ''}`]}
    >
      {{
        title: () => {
          const provider = c.itemProviders[subMenu.key];
          if (provider && provider.renderText)
            return renderByProvider(subMenu.key, c);
          return [
            <iBizIcon class={ns.e('icon')} icon={subMenu.image}></iBizIcon>,
            subMenu.label,
            counterData[subMenu.counterId] != null ? (
              <iBizBadge
                class={ns.e('counter')}
                value={counterData[subMenu.counterId]}
              />
            ) : null,
          ];
        },
        default: () =>
          subMenu.children.map((item: IData) => {
            if (item.children) {
              return renderGroupmenu(
                item,
                collapse,
                ns,
                c,
                counterData,
                saveConfigs,
                hideSeparator,
              );
            }
            return renderMenuItem(
              false,
              item,
              collapse,
              ns,
              c,
              counterData,
              saveConfigs,
              hideSeparator,
            );
          }),
      }}
    </el-menu-item-group>
  );
}

/**
 * @description 绘制子菜单
 * - 应用菜单样式为 扩展视图1 且从第二层菜单开始子菜单以分组样式呈现
 * @param {boolean} isFirst
 * @param {IData} subMenu
 * @param {boolean} collapse
 * @param {Namespace} ns
 * @param {AppMenuController} c
 * @param {IData} counterData
 * @param {IData[]} saveConfigs
 * @param {string[]} hideSeparator
 * @returns {*}  {(VNode | undefined)}
 */
function renderSubmenu(
  isFirst: boolean,
  subMenu: IData,
  collapse: boolean,
  ns: Namespace,
  c: AppMenuController,
  counterData: IData,
  saveConfigs: IData[],
  hideSeparator: string[],
): VNode | undefined {
  if (
    !c.state.menuItemsState[subMenu.key].visible ||
    !getMenuCustomVisible(subMenu.key, saveConfigs, hideSeparator)
  )
    return;
  if (c.model.appMenuStyle === 'EXTVIEW1' && !isFirst)
    return renderGroupmenu(
      subMenu,
      collapse,
      ns,
      c,
      counterData,
      saveConfigs,
      hideSeparator,
    );
  return (
    <el-sub-menu
      class={[ns.b('submenu'), `${subMenu.sysCss?.cssName || ''}`]}
      index={subMenu.key}
      teleported={true}
      popper-class={[
        ns.b('popup-container'),
        ns.be('popup-container', c.model.appMenuStyle?.toLowerCase()),
        ns.b(`${c.model.codeName!.toLowerCase()}--popper`),
        `${
          c.model.sysCss?.cssName ? `${c.model.sysCss?.cssName}--popper` : ''
        }`,
        `${
          subMenu.sysCss?.cssName ? `${subMenu.sysCss?.cssName}--popper` : ''
        }`,
      ]}
    >
      {{
        default: () =>
          subMenu.children.map((item: IData) => {
            if (item.children) {
              return renderSubmenu(
                false,
                item,
                collapse,
                ns,
                c,
                counterData,
                saveConfigs,
                hideSeparator,
              );
            }
            return renderMenuItem(
              false,
              item,
              collapse,
              ns,
              c,
              counterData,
              saveConfigs,
              hideSeparator,
            );
          }),
        title: () => {
          const provider = c.itemProviders[subMenu.key];
          if (provider && provider.renderText) {
            return renderByProvider(subMenu.key, c);
          }
          if (collapse) {
            if (subMenu.image) {
              return (
                <iBizIcon class={ns.e('icon')} icon={subMenu.image}></iBizIcon>
              );
            }
            return [
              isFirst ? subMenu.label.slice(0, 1) : subMenu.label,
              isFirst ? null : <ion-icon name='chevron-forward-outline' />,
            ];
          }
          return [
            <iBizIcon class={ns.e('icon')} icon={subMenu.image}></iBizIcon>,
            subMenu.label,
            counterData[subMenu.counterId] != null ? (
              <iBizBadge
                class={ns.e('counter')}
                value={counterData[subMenu.counterId]}
              />
            ) : null,
          ];
        },
      }}
    </el-sub-menu>
  );
}

export const AppMenuControl = defineComponent({
  name: 'IBizAppMenuControl',
  props: {
    /**
     * @description 菜单模型数据
     */
    modelData: { type: Object as PropType<IAppMenu>, required: true },
    /**
     * @description 应用上下文对象
     */
    context: { type: Object as PropType<IContext>, required: true },
    /**
     * @description 视图参数对象
     * @default {}
     */
    params: { type: Object as PropType<IParams>, default: () => ({}) },
    /**
     * @description 部件适配器
     */
    provider: { type: Object as PropType<IControlProvider> },
    /**
     * @description 是否折叠
     */
    collapse: { type: Boolean },
    /**
     * @description 当前路径（已弃用）
     */
    currentPath: { type: String },
  },
  setup(props) {
    const c: AppMenuController = useControlController(
      (...args) => new AppMenuController(...args),
    );
    const ns = useNamespace(`control-${c.model.controlType!.toLowerCase()}`);
    const menus = ref<IData[]>(getMenus(c.model.appMenuItems!));

    const saveConfigs = ref<IData[]>([]);

    // 默认激活菜单项
    const defaultActive = ref('');
    // 默认展开菜单项数组
    const defaultOpens: Ref<string[]> = ref([]);
    // 路由对象
    const route = useRoute();

    const key = ref(createUUID());

    const menuRef = ref();

    const hasScroll = ref(false);

    const hideSeparator = ref<string[]>([]);

    // 计算当前路由匹配菜单
    const calcCurMenu = (): IAppMenuItem | undefined => {
      const allItems = c.getAllItems();
      return allItems.find(item => {
        if (item.itemType !== 'MENUITEM' || !item.appFuncId) return false;
        if (ibiz.config.appMenu.echoMode === 'VIEW') {
          const app = ibiz.hub.getApp(item.appId);
          if (!app) return false;
          const func = app.getAppFunc(item.appFuncId!);
          if (func && func.appViewId && route?.params.view2) {
            return func.appViewId.split('.')[1] === route.params.view2;
          }
        } else {
          if (!route) {
            return false;
          }
          const routePath = route2routePath(route);
          if (routePath.pathNodes.length > 1)
            return item.id === routePath.pathNodes[1].params?.srfmenuitem;
        }
        return false;
      });
    };

    const onClick = async (id: string, event?: MouseEvent): Promise<void> => {
      const activeMenu = calcCurMenu();
      // 如果点击的是当前的菜单项，拦截掉
      if (activeMenu && activeMenu.id === id) return;
      defaultActive.value = id;
      const menu = c.getAllItems().find(m => m.id === id);
      if (menu?.itemType === 'RAWITEM' || c.runMode === 'DESIGN') {
        return;
      }
      await c.onClickMenuItem(id, event);
    };

    // 监听二级路由参数，变化时计算当前激活菜单回显
    if (c.runMode !== 'DESIGN') {
      watch(
        () => route?.params.view2,
        (newVal, oldVal) => {
          if (newVal !== oldVal && ibiz.config.appMenu.enableEcho) {
            const activeMenu = calcCurMenu();
            defaultActive.value = activeMenu ? activeMenu.id! : '';
          }
        },
      );
    }

    c.evt.on('onCreated', async () => {
      saveConfigs.value = c.saveConfigs;
      // 默认激活的菜单项
      const defaultActiveMenuItem = c.getDefaultOpenMenuItem();
      if (
        defaultActiveMenuItem &&
        !route?.params.view2 &&
        !route?.fullPath.includes('404')
      ) {
        defaultActive.value = defaultActiveMenuItem.id!;
        onClick(defaultActive.value);
      } else if (ibiz.config.appMenu.enableEcho) {
        const activeMenu = calcCurMenu();
        defaultActive.value = activeMenu ? activeMenu.id! : '';
      }
      // 默认展开的菜单项数组
      const defaultOpensArr = c.getAllItems().filter(item => {
        return item.expanded && !item.hidden;
      });
      if (defaultOpensArr.length > 0) {
        defaultOpensArr.forEach(item => {
          defaultOpens.value.push(item.id!);
        });
      }
      hideSeparator.value = formatSeparator(
        'APPMENU',
        c.model.appMenuItems,
        c.state.menuItemsState,
        saveConfigs.value,
      );
    });

    const menuMode = computed(() => {
      const model = c.view.model.mainMenuAlign;
      switch (model) {
        case 'TOP':
          return 'horizontal';
        default:
          return 'vertical';
      }
    });

    // 计算菜单是否存在滚动条，防止折叠时图标未对齐
    const calcScroll = () => {
      if (menuRef.value && menuRef.value.$el.children) {
        const elMenu = menuRef.value.$el.children[0];
        if (elMenu) {
          hasScroll.value = elMenu.scrollHeight > elMenu.clientHeight;
        }
      }
    };

    onMounted(() => {
      calcScroll();
    });

    watch(
      () => props.collapse,
      () => {
        nextTick(() => {
          calcScroll();
        });
      },
      { immediate: true },
    );

    if (
      c.view.model.mainMenuAlign &&
      c.view.model.mainMenuAlign !== 'LEFT' &&
      c.view.model.mainMenuAlign !== 'TOP'
    ) {
      ibiz.message.warning(
        ibiz.i18n.t('control.menu.noSupportAlign', {
          align: c.view.model.mainMenuAlign,
        }),
      );
    }

    const isShowCollapse = computed(() => {
      if (
        c.view.model.mainMenuAlign === 'LEFT' ||
        c.view.model.mainMenuAlign === undefined
      ) {
        return true;
      }
      return false;
    });

    const enableCustomized = computed(() => {
      return c.model.enableCustomized;
    });

    // 重新计算分隔符显隐
    const computeSeparator = () => {
      c.model.appMenuItems?.forEach((item: IAppMenuItem) => {
        c.initMenuItemState(item);
      });
      hideSeparator.value = formatSeparator(
        'APPMENU',
        c.model.appMenuItems,
        c.state.menuItemsState,
        saveConfigs.value,
      );
    };

    // 保存自定义配置
    const configSaves = (saveConfig: IData[]) => {
      saveConfigs.value = saveConfig;
      computeSeparator();
    };

    // 自定义配置恢复默认
    const configReset = () => {
      saveConfigs.value = [];
      computeSeparator();
    };

    // 省略svg(实心圆)
    const ellipsisSvg = () => {
      return <ion-icon name='ellipsis-horizontal'></ion-icon>;
    };

    return {
      c,
      ns,
      key,
      menus,
      menuRef,
      menuMode,
      hasScroll,
      saveConfigs,
      defaultOpens,
      defaultActive,
      hideSeparator,
      isShowCollapse,
      enableCustomized,
      onClick,
      ellipsisSvg,
      configSaves,
      configReset,
    };
  },
  render() {
    return (
      <iBizControlBase
        ref='menuRef'
        class={[
          this.ns.b(),
          this.ns.m(this.menuMode),
          this.ns.b(`${this.c.model.codeName!.toLowerCase()}`),
          this.ns.b(this.c.model.appMenuStyle?.toLowerCase()),
          this.ns.is('collapse', this.collapse),
          this.ns.is('show-collapse', this.isShowCollapse),
          this.ns.is('show-menu-design', this.enableCustomized),
          this.ns.is('scroll', this.hasScroll),
          `${this.c.model.sysCss?.cssName || ''}`,
        ]}
        controller={this.c}
      >
        {this.c.state.isCreated && (
          <el-menu
            key={this.key}
            popper-class={[
              this.ns.b('popper'),
              this.ns.b(`${this.c.model.codeName!.toLowerCase()}--popper`),
              `${
                this.c.model.sysCss?.cssName
                  ? `${this.c.model.sysCss.cssName}--popper`
                  : ''
              }`,
            ]}
            default-active={this.defaultActive}
            default-openeds={this.defaultOpens}
            collapse={this.collapse}
            collapse-transition={false}
            onSelect={this.onClick}
            theme='light'
            mode={this.menuMode}
            ellipsis-icon={() => this.ellipsisSvg()}
            ellipsis={this.menuMode === 'horizontal'}
            {...this.$attrs}
            {...renderAttrs(this.c.model, {
              ...this.c.getEventArgs(),
            })}
          >
            {{
              default: () => {
                return this.menus.map(item => {
                  if (item.children?.length > 0) {
                    return renderSubmenu(
                      true,
                      item,
                      this.collapse,
                      this.ns,
                      this.c,
                      this.c.state.counterData,
                      this.saveConfigs,
                      this.hideSeparator,
                    );
                  }
                  return renderMenuItem(
                    true,
                    item,
                    this.collapse,
                    this.ns,
                    this.c,
                    this.c.state.counterData,
                    this.saveConfigs,
                    this.hideSeparator,
                  );
                });
              },
            }}
          </el-menu>
        )}
        {this.enableCustomized && (
          <MenuDesign
            class={[
              this.ns.b('menu-set'),
              this.ns.is('collapse', this.collapse),
              this.ns.is(
                'horizontal',
                this.c.view.model.mainMenuAlign === 'TOP',
              ),
            ]}
            controller={this.c}
            menus={this.menus!}
            onSaved={this.configSaves}
            onReset={this.configReset}
          />
        )}
        {this.isShowCollapse && (
          <div
            class={[
              this.ns.b('collapse-icon'),
              this.ns.is('collapse', this.collapse),
            ]}
            onClick={() => {
              this.c.view.call(ViewCallTag.TOGGLE_COLLAPSE);
            }}
          >
            <ion-icon name='menu-collapse' />
          </div>
        )}
      </iBizControlBase>
    );
  },
});
