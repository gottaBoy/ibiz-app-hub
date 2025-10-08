import { computed, defineComponent, PropType, watch } from 'vue';
import { useNamespace } from '@ibiz-template/vue3-util';
import { IPanelRawItem } from '@ibiz/model-core';
import { useRoute, useRouter } from 'vue-router';
import { NavBreadcrumbController } from './nav-breadcrumb.controller';
import { BreadcrumbMsg } from './nav-breadcrumb.state';
import { getAppIndexViewName } from './nav-breadcrumb.util';
import './nav-breadcrumb.scss';

export interface dropdownAction {
  text: string;
  value?: string;
}

/**
 * 面包屑导航
 * @primary
 * @description 首页下的面包屑组件，使用el-breadcrumb绘制，根据打开视图层级绘制面包屑。
 * @panelitemparams {name:navmode,parameterType:'router' | 'menu' | 'store',defaultvalue:'router',description:导航模式}
 * @panelitemparams {name:separator,parameterType:string,defaultvalue:'/',description:面包屑分隔符}
 * @panelitemparams {name:showhome,parameterType:boolean,defaultvalue:true,description:是否显示应用标题}
 */
export const NavBreadcrumb = defineComponent({
  name: 'IBizNavBreadcrumb',
  props: {
    /**
     * @description 面包屑导航数据
     */
    modelData: {
      type: Object as PropType<IPanelRawItem>,
      required: true,
    },
    /**
     * @description 面包屑导航控制器
     */
    controller: {
      type: NavBreadcrumbController,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('nav-breadcrumb');
    const c = props.controller;

    const route = useRoute();
    const router = useRouter();
    c.onCreated(router);

    watch(
      () => route.fullPath,
      () => {
        c.onRouteChange(router);
      },
      { immediate: true },
    );

    const items = computed(() => {
      const { breadcrumbItems } = c.state;
      let result = breadcrumbItems.filter(x => x.caption);
      const indexViewName = getAppIndexViewName(c.panel.context);
      if (!c.showHome) {
        result = result.filter(x => x.viewName !== indexViewName);
      }
      return result;
    });

    const onClick = (event: MouseEvent, item: BreadcrumbMsg) => {
      if (item.type === 'menuItem') {
        event.stopPropagation();
        c.openMenuItemView(item, event);
      }
    };

    return { ns, c, items, onClick };
  },
  render() {
    return (
      <div
        class={[
          this.ns.b(),
          ...this.controller.containerClass,
          this.ns.m(this.c.navMode),
        ]}
      >
        <el-breadcrumb separator={this.c.separator}>
          {this.items.map(item => {
            let label = item.caption;
            if (item.dataInfo) {
              label += ` - ${item.dataInfo}`;
            }
            return (
              <el-breadcrumb-item
                class={this.ns.is('link', item.type === 'menuItem')}
                to={item.fullPath}
                onClick={(event: MouseEvent) => this.onClick(event, item)}
              >
                {label}
              </el-breadcrumb-item>
            );
          })}
        </el-breadcrumb>
      </div>
    );
  },
});
