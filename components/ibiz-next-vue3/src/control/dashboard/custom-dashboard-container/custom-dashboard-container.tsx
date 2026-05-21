/* eslint-disable no-await-in-loop */
import {
  CustomDashboardController,
  DashboardController,
} from '@ibiz-template/runtime';
import { useNamespace } from '@ibiz-template/vue3-util';
import { IDashboard, IDBPortletPart } from '@ibiz/model-core';
import {
  CSSProperties,
  defineComponent,
  nextTick,
  onMounted,
  PropType,
  reactive,
  ref,
} from 'vue';
import './custom-dashboard-container.scss';
import { showTitle } from '@ibiz-template/core';

export const CustomDashboardContainer: ReturnType<typeof defineComponent> =
  defineComponent({
    name: 'IBizCustomDashboardContainer',
    props: {
      modelData: {
        type: Object as PropType<IDashboard>,
        required: true,
      },
      dashboard: {
        type: Object as PropType<DashboardController>,
        required: true,
      },
    },
    setup(props, { emit }) {
      const ns = useNamespace(`custom-dashboard-container`);

      // 自定义数据看板部件控制器
      const customDashboard = new CustomDashboardController(
        props.modelData,
        props.dashboard,
      );

      // 注入自定义数据看板部件控制器
      props.dashboard.setCustomDashboard(customDashboard);

      // 界面依赖自定义数据看板部件控制器
      const customC = reactive(customDashboard);

      // 是否初始化完成
      const isInited = ref(false);

      // 是否显示设计面板
      const isShowDesign = ref(false);

      // 工具栏收缩
      const showTypeDir = ref(false);

      // 显示过滤器 TODO
      const showFilter = ref(false);

      // 打开设计面板
      const openDesign = () => {
        isShowDesign.value = true;
      };

      // 点击伸缩
      const clickCollapse = (type: string) => {
        showTypeDir.value = type === 'left';
      };

      // 根据codeName去全局获取portlet模型
      const getPortletModelByCodeName = (
        codeName: string,
      ): IDBPortletPart | undefined => {
        const app = ibiz.hub.getApp(props.dashboard.model.appId);
        if (app.model.appPortlets) {
          const appPortlet = app.model.appPortlets.find(portlet => {
            return portlet.control?.codeName === codeName;
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
          const dynaPortlet = await props.dashboard.loadDynaPortletById(
            data.portletId,
          );
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

      // 处理自定义布局数据改变
      const handleCustomModelChange = async (args: IData) => {
        // 返回model无数据时且当前存在过滤器类型门户部件需重算过滤器类型门户部件(界面呈现和条件都需重算)
        const filterModels = props.dashboard.model.controls?.filter(
          (element: IModel) => {
            return element.portletType === 'FILTER';
          },
        );
        const noFilterModels = props.dashboard.model.controls?.filter(
          (element: IModel) => {
            return element.portletType !== 'FILTER';
          },
        );
        if (args.model && args.model.length > 0) {
          await props.dashboard.initPortlets(args.model);
        } else if (filterModels && filterModels.length > 0) {
          // 未定制看板布局、存在过滤器模型时，先将过滤器初始化完成后再刷新受影响的门户部件
          await props.dashboard.initPortlets(filterModels);
          await props.dashboard.initPortlets(noFilterModels || []);
        }
        await props.dashboard.initPortletsConfig(args.config);
      };

      // 保存完成
      const onSaved = async (args: IData) => {
        isShowDesign.value = false;
        const tempModelDatas: IDBPortletPart[] = await convertData(args.model);
        await handleCustomModelChange({
          model: tempModelDatas,
          config: args.config,
        });
        emit('changed', { model: tempModelDatas });
      };

      // 新建筛选部件
      const openFilterDesign = () => {
        props.dashboard.openFilterDesignPage();
      };

      const onReset = async () => {
        isInited.value = false;
        isShowDesign.value = false;
        await props.dashboard.resetPortlets();
        await nextTick();
        isInited.value = true;
      };

      onMounted(async () => {
        showFilter.value =
          props.dashboard.model?.dashboardStyle === 'BIREPORTDASHBOARD';
        const response = await customC.loadCustomModelData();
        const tempModelDatas: IDBPortletPart[] = await convertData(
          response.model,
        );
        emit('changed', { model: tempModelDatas });
        await handleCustomModelChange({
          model: tempModelDatas,
          config: response.config,
        });
        isInited.value = true;
        props.dashboard.evt.on('onConfigChange', async (eventArgs: IData) => {
          const { name, config } = eventArgs;
          customC.saveCustomModelData(customC.customModelData, {
            [name]: config,
          });
        });
        // 门户部件保存
        props.dashboard.evt.on('onSavePortlet', async (args: IData) => {
          const modelDatas: IDBPortletPart[] = await convertData(args.model);
          await handleCustomModelChange({
            model: modelDatas,
            config: args.config,
          });
          props.dashboard.refresh();
          emit('changed', { model: modelDatas });
        });
      });

      return {
        ns,
        customC,
        isShowDesign,
        isInited,
        showTypeDir,
        showFilter,
        openDesign,
        onSaved,
        onReset,
        clickCollapse,
        openFilterDesign,
      };
    },

    render() {
      return (
        <div class={[this.ns.b()]} v-loading={!this.isInited}>
          {this.customC.showDesignBtn ? (
            <div class={this.ns.b('build-btn')}>
              {this.showTypeDir ? (
                <div>
                  {this.showFilter ? (
                    <el-button
                      class={this.ns.b('deisgn-btn')}
                      title={ibiz.i18n.t(
                        'control.dashboard.customDashboardContainer.newFilter',
                      )}
                      onClick={this.openFilterDesign}
                    >
                      <ion-icon name='filter-outline'></ion-icon>
                    </el-button>
                  ) : null}

                  <el-button
                    class={this.ns.b('deisgn-btn')}
                    title={showTitle(
                      ibiz.i18n.t(
                        'control.dashboard.customDashboardContainer.portalCustomPrompt',
                      ),
                    )}
                    onClick={this.openDesign}
                  >
                    <ion-icon name='build-outline'></ion-icon>
                  </el-button>
                  <el-button
                    class={this.ns.b('forward-btn')}
                    onClick={() => this.clickCollapse('right')}
                  >
                    <ion-icon name='chevron-forward-outline'></ion-icon>
                  </el-button>
                </div>
              ) : (
                <el-button
                  class={this.ns.b('back-btn')}
                  onClick={() => this.clickCollapse('left')}
                >
                  <ion-icon name='chevron-back-outline'></ion-icon>
                </el-button>
              )}
            </div>
          ) : null}
          <el-drawer
            v-model={this.isShowDesign}
            with-header={false}
            size='80%'
            modal-class={'custom-dashboard-drawer'}
          >
            {this.isShowDesign && (
              <iBizDashboardDesign
                dashboard={this.dashboard}
                custom-dashboard={this.customC}
                is-show-design={this.isShowDesign}
                onSaved={this.onSaved}
                onReset={this.onReset}
              />
            )}
          </el-drawer>
          {this.isInited &&
            (this.customC.customModelData.length === 0
              ? this.$slots.default?.()
              : this.customC.customModelData.map(item => {
                  const itemStyle = {
                    position: 'absolute',
                    height: `${item.h * this.customC.layoutRowH}px`,
                    width: `calc(100% / ${this.customC.layoutColNum} * ${item.w})`,
                    top: `${item.y * this.customC.layoutRowH}px`,
                    left: `calc(100% / ${this.customC.layoutColNum} * ${item.x})`,
                  } as CSSProperties;
                  return (
                    <div style={itemStyle}>
                      {this.$slots[item.portletCodeName]?.()}
                    </div>
                  );
                }))}
        </div>
      );
    },
  });
