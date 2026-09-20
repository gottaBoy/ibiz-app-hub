import { defineComponent, PropType, VNode, watch } from 'vue';
import { useNamespace } from '@ibiz-template/vue3-util';
import './nav-tabs.scss';
import { TabsPaneContext } from 'element-plus';
import { IPanelRawItem } from '@ibiz/model-core';
import { showTitle } from '@ibiz-template/core';
import { NavTabsController } from './nav-tabs.controller';

export interface dropdownAction {
  text: string;
  value?: string;
}

/**
 * 分页导航
 * @primary
 * @description 首页下的分页导航标签，使用el-tabs组件将所有打开的视图进行tab分页展示，点击可快速切换。
 */
export const NavTabs = defineComponent({
  name: 'IBizNavTabs',
  props: {
    /**
     * @description 分页导航模型数据
     */
    modelData: {
      type: Object as PropType<IPanelRawItem>,
      required: true,
    },
    /**
     * @description 分页导航控制器
     */
    controller: {
      type: NavTabsController,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('nav-tabs');
    const c = props.controller;
    const { state } = props.controller;

    // 下拉菜单项
    const actions: dropdownAction[] = [
      {
        text: ibiz.i18n.t('panelComponent.navTabs.closeAll'),
        value: 'closeAll',
      },
      {
        text: ibiz.i18n.t('panelComponent.navTabs.closeOther'),
        value: 'closeOther',
      },
    ];

    // 切换tab
    const changePage = (pane: TabsPaneContext): void => {
      if (state.currentKey !== pane.paneName) {
        c.onTabClick(pane.paneName as string);
      }
    };

    // 删除tab
    const onTabRemove = (key: string): void => {
      c.onTabRemove(key);
    };

    // 处理下拉点击
    const handleCommand = (command: dropdownAction): void => {
      if (command.value === 'closeAll') {
        c.removeAll();
      } else if (command.value === 'closeOther') {
        c.removeOther();
      }
    };

    watch(
      () => c.state.currentKey,
      (newVal, oldVal) => {
        if (newVal !== oldVal) {
          const findItem = c.findTabItem(newVal);
          // 如果tabItems里有说明是路由切换
          if (findItem) {
            state.activeTab = newVal;
          }
        }
      },
    );

    return { ns, actions, changePage, onTabRemove, handleCommand };
  },
  render() {
    const { state } = this.controller;
    if (ibiz.config.view.disableHomeTabs) return null;
    return (
      <div class={[this.ns.b(), ...this.controller.containerClass]}>
        <div class={this.ns.e('left')}>
          <el-tabs
            type='card'
            v-model={state.activeTab}
            closable
            onTabClick={this.changePage}
            onTabRemove={this.onTabRemove}
          >
            {state.tabItems.map(msg => {
              let label = msg.caption;
              if (msg.dataInfo) {
                label += ` - ${msg.dataInfo}`;
              }
              return (
                <el-tab-pane name={msg.key} key={msg.key} label={label}>
                  {{
                    label: (): VNode => {
                      return (
                        <div class={this.ns.em('left', 'content')}>
                          <iBizIcon
                            class={this.ns.em('left', 'icon')}
                            icon={msg.sysImage}
                          />
                          <div
                            class={this.ns.em('left', 'caption')}
                            title={showTitle(label)}
                          >
                            {label}
                          </div>
                        </div>
                      );
                    },
                  }}
                </el-tab-pane>
              );
            })}
          </el-tabs>
        </div>
        <div class={this.ns.e('right')}>
          <el-dropdown onCommand={this.handleCommand}>
            {{
              default: (): VNode => {
                return (
                  <el-button size='small' type='primary'>
                    {ibiz.i18n.t('app.more')}
                    <ion-icon name='arrow-down'></ion-icon>
                  </el-button>
                );
              },
              dropdown: (): VNode => {
                return (
                  <el-dropdown-menu>
                    {this.actions.map((action: dropdownAction) => {
                      return (
                        <el-dropdown-item command={action}>
                          {action.text}
                        </el-dropdown-item>
                      );
                    })}
                  </el-dropdown-menu>
                );
              },
            }}
          </el-dropdown>
        </div>
      </div>
    );
  },
});
