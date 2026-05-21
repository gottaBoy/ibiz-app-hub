/* eslint-disable no-await-in-loop */
import {
  CustomDashboardController,
  DashboardController,
  getPortletProvider,
  IPortletController,
  IPortletProvider,
} from '@ibiz-template/runtime';
import { useNamespace } from '@ibiz-template/vue3-util';
import { showTitle } from '@ibiz-template/core';
import { IDBPortletPart, ISysImage } from '@ibiz/model-core';
import { clone } from 'ramda';
import {
  computed,
  ConcreteComponent,
  defineComponent,
  h,
  onUnmounted,
  PropType,
  Ref,
  ref,
  resolveComponent,
  watch,
} from 'vue';
import { loadDefaultLayoutModel } from './dashboard-design.util';
import './dashboard-design.scss';

interface IPortletList {
  type: string;
  portletId?: string;
  portletCodeName: string;
  portletName: string;
  portletImage?: ISysImage;
  groupCodeName: string;
  groupName: string;
  appCodeName: string;
  appName: string;
  dynamodelFlag?: number;
}

interface IList {
  type: string;
  name: string;
  children: IData[];
}

export const DashboardDesign = defineComponent({
  name: 'IBizDashboardDesign',
  props: {
    dashboard: {
      type: Object as PropType<DashboardController>,
      required: true,
    },
    customDashboard: {
      type: Object as PropType<CustomDashboardController>,
      required: true,
    },
    isShowDesign: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['saved', 'reset'],
  setup(props, { emit }) {
    const ns = useNamespace(`dashboard-design`);
    const c = props.dashboard;
    const customC = props.customDashboard;

    // 门户项目列表
    const portlets: Ref<IPortletList[]> = ref([]);
    // 列表
    const list: Ref<IList[]> = ref([]);
    // 分组
    const groups: Ref<IData[]> = ref([]);

    // 分组过滤值
    const filterVal = ref('');

    // 自定义模型对象
    const layoutModel: Ref<IData[]> = ref(clone(customC.customModelData));
    // 自定义配置对象
    const layoutConfig: Ref<IData> = ref(clone(customC.portletConfig));

    // 门户provider
    const providers: Ref<{ [key: string]: IPortletProvider }> = ref({});

    // 门户部件控制器
    const portletControllers: Ref<{ [key: string]: IPortletController }> = ref(
      {},
    );

    // 滚动区域
    const designPanel: Ref<Element | null> = ref(null);

    // 是否在加载状态
    const isLoading = ref(false);

    // 过滤数据
    const filterData = (list1: IPortletList[]) => {
      const items: IPortletList[] = [];
      list1.forEach(data => {
        if (Object.is(data.type, 'app')) {
          items.push(data);
        }
        const dataType = customC.model?.appDataEntityId || 'app';
        if (Object.is(data.appCodeName, dataType)) {
          items.push(data);
        }
      });
      return items;
    };

    // 准备list项集合
    const prepareListChildren = (children: IData[], data: IPortletList) => {
      let item = children.find(child =>
        Object.is(data.groupCodeName, child.type),
      );
      if (!item) {
        item = {};
        Object.assign(item, {
          type: data.groupCodeName,
          name: data.groupName,
          children: [],
        });
        children.push(item);
      }
      const _item = item.children.find((child: IPortletList) =>
        Object.is(child.portletCodeName, data.portletCodeName),
      );
      if (!_item) {
        item.children.push(data);
      }
    };

    // 准备list集合
    const prepareList = (datas: IPortletList[]) => {
      const list2: IList[] = [];
      datas.forEach(data => {
        let item = list2.find(_item => Object.is(data.type, _item.type));
        if (!item) {
          item = {} as IList;
          Object.assign(item, {
            type: data.type,
            name: Object.is(data.type, 'app')
              ? ibiz.i18n.t('control.dashboard.dashboardDesign.global')
              : data.appName,
            children: [],
          });
          list2.push(item);
        }
        prepareListChildren(item.children!, data);
      });
      return list2;
    };

    // 分组集合
    const prepareGroup = (datas: IPortletList[]) => {
      const items: IData[] = [];
      datas.forEach((data: IPortletList) => {
        const item = items.find((_item: IData) =>
          Object.is(_item.value, data.groupCodeName),
        );
        if (item) {
          const _item = item.children.find((a: IData) =>
            Object.is(a.portletCodeName, data.portletCodeName),
          );
          if (!_item) {
            item.children.push(data);
          }
        } else {
          items.push({
            name: data.groupName,
            value: data.groupCodeName,
            children: [data],
          });
        }
      });
      return items;
    };

    // 准备UI需要的数据
    const prepareData = async () => {
      const list3: IPortletList[] = [];
      const app = ibiz.hub.getApp(c.model.appId);
      if (c.model.customizeMode === 2) {
        const dynamicPortlets = await c.loadAllDynaPortlet();
        dynamicPortlets?.forEach((portlet: IData) => {
          const temp: IPortletList = {
            type: 'app',
            dynamodelFlag: 1,
            portletId: portlet.psappportletid,
            portletCodeName: portlet.codename,
            portletName: portlet.psappportletname,
            groupCodeName: portlet.groupcodename || 'Ungroup',
            groupName:
              portlet.groupname ||
              ibiz.i18n.t('control.dashboard.dashboardDesign.unGroup'),
            appCodeName: app.model.pkgcodeName!,
            appName: app.model.name!,
          };
          list3.push(temp);
        });
      } else if (app.model.appPortletCats && app.model.appPortlets) {
        // 是否是实体级视图
        const isDEView = customC.model.appDataEntityId;
        // 部件分类过滤标识
        const categoryTag = props.dashboard.controlParams.categorytag;
        // 部件名称过滤标识
        const portletNameTag = props.dashboard.controlParams.portletnametag;
        app.model.appPortlets.forEach(portlet => {
          if (!isDEView && !portlet.enableAppDashboard) {
            return;
          }
          if (isDEView && !portlet.enableDEDashboard) {
            return;
          }
          const portletCat = app.model.appPortletCats?.find(
            cat => cat.codeName === portlet.appPortletCat?.codeName,
          );
          // 部件分类过滤
          if (categoryTag) {
            const categoryRegex = new RegExp(categoryTag);
            if (
              !portletCat ||
              (portletCat &&
                portletCat.codeName &&
                !categoryRegex.test(portletCat.codeName))
            ) {
              return;
            }
          }
          // 部件名称过滤
          if (portletNameTag) {
            const portletNameRegex = new RegExp(portletNameTag);
            if (portlet.codeName && !portletNameRegex.test(portlet.codeName)) {
              return;
            }
          }
          const temp: IPortletList = {
            type: 'app',
            portletCodeName: portlet.codeName!,
            portletName: portlet.name!,
            portletImage: (portlet.control as IDBPortletPart).sysImage,
            groupCodeName: portletCat?.codeName || '',
            groupName: portletCat?.name || '',
            appCodeName: portlet.appDataEntityId || app.model.pkgcodeName!,
            appName: app.model.name!,
          };
          list3.push(temp);
        });
      }
      const datas = filterData(list3);
      portlets.value = datas;
      list.value = prepareList(datas).reverse();
      groups.value = prepareGroup(datas);
    };

    // 默认展开
    const defaultOpens = computed(() => {
      let tempOpens: string[] = [];
      if (filterVal.value) {
        tempOpens = [filterVal.value];
      } else {
        groups.value.forEach((item, index) => {
          tempOpens.push(item.value + index);
        });
      }
      return tempOpens;
    });

    // 初始化providers
    const initPortlets = async (portletModels: IDBPortletPart[]) => {
      if (!portletModels?.length) {
        return;
      }
      await Promise.all(
        portletModels.map(async portlet => {
          const provider = await getPortletProvider(portlet);
          if (provider) {
            providers.value[portlet.id!] = provider;
            const controller = await provider.createController(
              portlet,
              props.dashboard,
            );
            portletControllers.value[portlet.id!] = controller;
          }
        }),
      );
    };

    // 初始化门户配置
    const initPortletsConfig = async (): Promise<void> => {
      const config = layoutConfig.value || {};
      Object.keys(config).forEach((key: string) => {
        const portlet = portletControllers.value[key];
        if (portlet) {
          portlet.config = config[key];
          portlet.state.title = portlet.config.srftitle;
          Object.assign(portlet.params, portlet.config);
        }
      });
    };

    // 通过codeName获取门户部件模型，非动态类型可使用
    const getPortletModelByCodeName = (
      tag: string,
    ): IDBPortletPart | undefined => {
      const app = ibiz.hub.getApp(c.model.appId);
      if (app.model.appPortlets) {
        const appPortlet = app.model.appPortlets.find(portlet => {
          return portlet.control?.codeName === tag;
        });
        if (appPortlet) {
          return appPortlet.control as IDBPortletPart;
        }
      }
    };

    // 获取门户部件模型
    const getPortletModel = async (
      data: IData,
    ): Promise<IDBPortletPart | undefined> => {
      if (data.dynamodelFlag) {
        if (data.portletModel) {
          return data.portletModel;
        }
        const dynaPortlet = await c.loadDynaPortletById(data.portletId);
        return dynaPortlet;
      }
      return getPortletModelByCodeName(data.portletCodeName);
    };

    // 根据自定义数据获取模型数组
    const convertData = async (models: IData[]) => {
      const tempModelDatas: IDBPortletPart[] = [];
      if (models.length > 0) {
        for (let i = 0; i < models.length; i++) {
          const temModelData = await getPortletModel(models[i]);
          if (temModelData) {
            tempModelDatas.push(temModelData);
          }
        }
      }
      return tempModelDatas;
    };

    // 准备porlet绘制相关数据
    const preparePortlet = async (data: IData[]): Promise<IDBPortletPart[]> => {
      const tempModelDatas: IDBPortletPart[] = await convertData(data);
      await initPortlets(tempModelDatas);
      await initPortletsConfig();
      return tempModelDatas;
    };

    watch(
      () => props.isShowDesign,
      async newVal => {
        if (newVal) {
          try {
            isLoading.value = true;
            await prepareData();
            const res = await customC.loadCustomModelData();
            let model: IData[] = clone(res.model);
            if (!model.length) {
              model = loadDefaultLayoutModel(c, customC);
            }
            const tempModelDatas: IDBPortletPart[] =
              await preparePortlet(model);
            layoutModel.value = model;
            layoutModel.value.forEach((item, index) => {
              if (item.dynamodelFlag) {
                item.portletModel = tempModelDatas[index];
              }
            });
            layoutConfig.value = clone(res.config);
          } catch (error) {
            ibiz.log.error(error);
          } finally {
            isLoading.value = false;
          }
        }
      },
      { immediate: true },
    );

    // 菜单项是否禁用
    const isDisabled = (child: IPortletList) => {
      const model = layoutModel.value.find(
        item => item.i === child.portletCodeName,
      );
      return !!model;
    };

    // 重置
    const onReset = async () => {
      const res = await customC.resetCustomModelData();
      layoutModel.value = res.model;
      layoutConfig.value = res.config;
      emit('reset');
    };

    // 保存
    const onSave = async () => {
      const res = await customC.saveCustomModelData(layoutModel.value);
      emit('saved', { model: res.model, config: res.config });
    };

    // 删除项
    const removeItem = async (child: IData) => {
      const index = layoutModel.value.indexOf(child);
      if (index !== -1) {
        layoutModel.value.splice(index, 1);
        // 删除的时候销毁controller
        const temModelData = await getPortletModel(child);
        if (temModelData) {
          const controller = portletControllers.value[temModelData.id!];
          await controller.destroyed();
        }
      }
    };

    // 上次滚动区域高度
    const lastScrollHeight = ref(0);

    // 新增项
    const addLayoutItem = async (child: IPortletList) => {
      const tempModelDatas = await preparePortlet([child]);
      const element = designPanel.value;
      if (element) {
        lastScrollHeight.value = element.scrollHeight + 3 * customC.layoutRowH;
      }
      let maxY = 0;
      // eslint-disable-next-line no-restricted-syntax
      for (const obj of layoutModel.value) {
        if (obj.y > maxY) {
          maxY = obj.y;
        }
      }
      const tempItemModel = {
        w: 4,
        h: 3,
        x: 0,
        y: maxY + 3,
        i: child.portletCodeName,
        ...child,
      };
      if (child.dynamodelFlag) {
        const orignData = c.dynaPortletMap.get(child.portletId!);
        if (orignData) {
          Object.assign(tempItemModel, {
            controlmodeldigest: orignData.controlmodeldigest,
          });
        }
        Object.assign(tempItemModel, { portletModel: tempModelDatas[0] });
      }
      layoutModel.value.push(tempItemModel);

      // 滚动区域高度发生变化后滚动到最底部
      if (element) {
        const intervalId = setInterval(() => {
          // 轮询操作
          if (element.scrollHeight >= lastScrollHeight.value) {
            element.scrollTo({
              top: element.scrollHeight,
              behavior: 'smooth',
            });
            clearInterval(intervalId);
          }
        }, 50);
      }
    };

    // 改变列数
    const handleColNumberChange = (colNumber: number) => {
      customC.layoutColNum = colNumber;
    };

    // 改变单元格高度
    const handleRolHChange = (rowH: number) => {
      customC.layoutRowH = rowH;
    };

    // 栅格背景size
    const maskSize = computed(() => {
      return `calc((100% - 10px) / ${customC.layoutColNum}) ${
        customC.layoutRowH + 10
      }px`;
    });

    onUnmounted(async () => {
      const controllers = Object.values(portletControllers.value);
      await Promise.all(
        controllers.map(async portlet => {
          await portlet.destroyed();
        }),
      );
    });

    return {
      ns,
      customC,
      portlets,
      list,
      groups,
      filterVal,
      defaultOpens,
      layoutModel,
      isLoading,
      onReset,
      onSave,
      removeItem,
      addLayoutItem,
      handleColNumberChange,
      handleRolHChange,
      isDisabled,
      providers,
      portletControllers,
      maskSize,
      designPanel,
      getPortletModelByCodeName,
    };
  },

  render() {
    const renderElMenuItem = (child: IPortletList) => {
      return (
        <el-menu-item
          key={child.portletCodeName}
          index={child.portletCodeName}
          tag={child.portletCodeName}
          disabled={this.isDisabled(child)}
        >
          <span>
            <ion-icon icon={child.portletImage} />
            {child.portletName}
          </span>
          <ion-icon
            title={showTitle(
              ibiz.i18n.t('control.dashboard.dashboardDesign.add'),
            )}
            name='arrow-forward-outline'
            onClick={() => this.addLayoutItem(child)}
          ></ion-icon>
        </el-menu-item>
      );
    };

    const renderTree = () => {
      return this.filterVal ? (
        <el-menu
          default-openeds={this.defaultOpens}
          class={this.ns.is('filter', true)}
          key={this.filterVal}
        >
          {this.groups.map(group => {
            if (group.value === this.filterVal) {
              return (
                <el-sub-menu key={group.value} index={group.value}>
                  {{
                    title: () => {
                      return group.name;
                    },
                    default: () => {
                      return group.children.map((child: IPortletList) => {
                        return renderElMenuItem(child);
                      });
                    },
                  }}
                </el-sub-menu>
              );
            }
            return null;
          })}
        </el-menu>
      ) : (
        <el-menu
          class={this.ns.is('no-filter', true)}
          default-openeds={this.defaultOpens}
          key='default'
        >
          {this.groups.map((group, index) => {
            return (
              <el-sub-menu
                key={group.value + index}
                index={group.value + index}
              >
                {{
                  title: () => {
                    return group.name;
                  },
                  default: () => {
                    return group.children.map((child: IPortletList) => {
                      return renderElMenuItem(child);
                    });
                  },
                }}
              </el-sub-menu>
            );
          })}
        </el-menu>
      );
    };

    // 绘制门户部件自身
    const renderPortlet = (item: IData) => {
      const portletModel = item.dynamodelFlag
        ? item.portletModel
        : this.getPortletModelByCodeName(item.portletCodeName);
      if (!portletModel) {
        return null;
      }
      const provider = this.providers[portletModel.id!];
      const controller = this.portletControllers[portletModel.id!];

      const commonProps = {
        modelData: portletModel,
        controller,
      };

      if (!provider || !controller) {
        return (
          <div>
            {portletModel.portletType}
            {ibiz.i18n.t('app.noSupport')}
          </div>
        );
      }

      const providerComp = resolveComponent(
        provider.component,
      ) as ConcreteComponent;

      // 绘制门户部件
      return h(providerComp, {
        ...commonProps,
        key: portletModel.id,
      });
    };

    return (
      <div class={this.ns.b()}>
        <div class={this.ns.b('header')}>
          <span>
            {ibiz.i18n.t('control.dashboard.dashboardDesign.customPortal')}
          </span>
          <span class={this.ns.b('header-utils')}>
            <div class={this.ns.be('header-utils', 'col-num')}>
              {ibiz.i18n.t('control.dashboard.dashboardDesign.colNum')}：
              <el-input-number
                v-model={this.customC.layoutColNum}
                onChange={this.handleColNumberChange}
              />
            </div>
            <div class={this.ns.be('header-utils', 'row-h')}>
              {ibiz.i18n.t('control.dashboard.dashboardDesign.cellHeight')}：
              <el-input-number
                v-model={this.customC.layoutRowH}
                onChange={this.handleRolHChange}
              />
            </div>
            <el-button
              class={this.ns.be('header-utils', 'reset')}
              style={{
                display: this.customC.multiMode ? 'none' : 'inline-flex',
              }}
              onClick={this.onReset}
            >
              {ibiz.i18n.t('control.dashboard.dashboardDesign.restoreDefault')}
            </el-button>
            <el-button
              class={this.ns.be('header-utils', 'save')}
              onClick={this.onSave}
            >
              {ibiz.i18n.t('control.dashboard.dashboardDesign.save')}
            </el-button>
          </span>
        </div>
        <div class={this.ns.b('content')}>
          <div class={this.ns.b('tree')}>
            <el-select
              v-model={this.filterVal}
              clearable
              class={this.ns.b('tree-filter')}
            >
              {this.groups.map(group => {
                return (
                  <el-option
                    key={group.value}
                    value={group.value}
                    label={group.name}
                  ></el-option>
                );
              })}
            </el-select>
            <div class={this.ns.b('tree-content')}>{renderTree()}</div>
          </div>
          <div
            ref='designPanel'
            class={this.ns.b('scroll-box')}
            v-loading={this.isLoading}
          >
            <div class={this.ns.b('panel')}>
              <div
                class={this.ns.b('grid-layout-mask')}
                style={{
                  backgroundSize: this.maskSize,
                }}
              ></div>
              <grid-layout
                class={this.ns.b('grid-layout')}
                layout={this.layoutModel}
                col-num={this.customC.layoutColNum}
                row-height={this.customC.layoutRowH}
                is-draggable={true}
                is-resizable={true}
                is-mirrored={false}
                vertical-compact={true}
                margin={[10, 10]}
                use-css-transforms={true}
                style={{
                  maxHeight: '100%',
                }}
              >
                {this.layoutModel.map(item => {
                  return (
                    <grid-item
                      x={item.x}
                      y={item.y}
                      w={item.w}
                      h={item.h}
                      i={item.i}
                      key={item.i}
                    >
                      <el-card class={this.ns.b('grid-layout-item')}>
                        <ion-icon
                          name='close-outline'
                          title={ibiz.i18n.t('app.delete')}
                          onClick={() => this.removeItem(item)}
                          class={this.ns.b('grid-layout-item-icon')}
                        ></ion-icon>
                        <div class={this.ns.b('grid-layout-item-content')}>
                          {renderPortlet(item)}
                        </div>
                      </el-card>
                    </grid-item>
                  );
                })}
              </grid-layout>
            </div>
          </div>
        </div>
      </div>
    );
  },
});
