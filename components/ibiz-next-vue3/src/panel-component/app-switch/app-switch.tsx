/* eslint-disable array-callback-return */
import { defineComponent, PropType, VNode } from 'vue';
import { useRouter } from 'vue-router';
import { IPanelRawItem } from '@ibiz/model-core';
import { showTitle } from '@ibiz-template/core';
import { useNamespace } from '@ibiz-template/vue3-util';
import { AppSwitchController } from './app-switch.controller';
import './app-switch.scss';

/**
 * 应用切换器
 * @primary
 * @description 应用切换器是前端导航核心组件，通过可视化列表实现多应用快速跳转，当应用存在子应用时，使用该能力需在首页视图配置应用选择模式为`默认`。
 * @panelitemparams {name:sourcetype,parameterType:'UTIL' | 'REFAPP',defaultvalue:'REFAPP',description:应用源类型，其中UTIL表示微应用数据来源于功能组件服务、REFAPP表示微应用数据来源于引用子应用集（主应用和引用子应用的所有首页）}
 * @primary
 */
export const AppSwitch = defineComponent({
  name: 'IBizAppSwitch',
  props: {
    /**
     * @description 应用切换器模型数据
     */
    modelData: {
      type: Object as PropType<IPanelRawItem>,
      required: true,
    },
    /**
     * @description 应用切换器控制器
     */
    controller: {
      type: AppSwitchController,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('app-switch');

    const { state } = props.controller;

    const router = useRouter();
    const handleClick = (id: string): void => {
      props.controller.switchMicroApp(id, router);
    };

    return { ns, state, handleClick };
  },
  render() {
    if (!this.state.visible) {
      return null;
    }
    return (
      <el-dropdown
        class={this.ns.b()}
        trigger={'click'}
        onCommand={(command: string) => this.handleClick(command)}
      >
        {{
          default: (): VNode => (
            <span class={this.ns.e('icon')}>
              <i class='fa fa-th' aria-hidden='true'></i>
            </span>
          ),
          dropdown: (): VNode => (
            <el-dropdown-menu class={[this.ns.e('dropdown')]}>
              {this.state.items.length > 0 ? (
                this.state.items.map(item => {
                  return (
                    <el-dropdown-item
                      class={[
                        this.ns.e('item'),
                        this.ns.is(
                          'active',
                          this.state.activeMicroAppId === item.id,
                        ),
                      ]}
                      title={showTitle(item.caption)}
                      command={item.id}
                    >
                      {item.caption}
                    </el-dropdown-item>
                  );
                })
              ) : (
                <iBizNoData></iBizNoData>
              )}
            </el-dropdown-menu>
          ),
        }}
      </el-dropdown>
    );
  },
});
