import { useNamespace } from '@ibiz-template/vue3-util';
import { IPanelRawItem } from '@ibiz/model-core';
import { computed, defineComponent, PropType, ref, inject } from 'vue';
import {
  AppFuncCommand,
  CTX,
  IAppMenuController,
} from '@ibiz-template/runtime';
import { debounce } from 'lodash-es';
import { PanelIndexViewSearchController } from './panel-index-view-search.controller';
import './panel-index-view-search.scss';

/**
 * 首页搜索
 * @primary
 * @description 用于快速查找应用数据，需在菜单上配置标识与本面板项一样的标识，默认标识为index_view_search，输入搜索词点击搜索后，会执行绑定的菜单项应用功能，打开对应的全局搜索界面。
 * @panelitemparams {name:strictly,parameterType:boolean,defaultvalue:false,description:是否取消与首页菜单的关联，即菜单收缩时不会跟随改变，当首页搜索未配置在首页左侧时应启用}
 * @panelitemparams {name:placeholder,parameterType:string,description:搜索框提示信息}
 */
export const PanelIndexViewSearch = defineComponent({
  name: 'IBizPanelIndexViewSearch',
  props: {
    /**
     * @description 首页搜索模型数据
     */
    modelData: {
      type: Object as PropType<IPanelRawItem>,
      required: true,
    },
    /**
     * @description 首页搜索控件控制器
     */
    controller: {
      type: PanelIndexViewSearchController,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('panel-index-view-search');

    const c = props.controller;

    const query = ref('');

    const debounceSearch = debounce(() => {}, 500);

    const onInput = (value: string): void => {
      query.value = value;
      debounceSearch();
    };

    const ctx = inject<CTX | undefined>('ctx', undefined);

    const menuAlign = computed(() => {
      if (ctx?.view) {
        return ctx.view.model.mainMenuAlign || 'LEFT';
      }
      return 'LEFT';
    });

    const isCollapse = computed(() => {
      const { strictly } = c.rawItemParams;
      if (strictly && strictly === 'true') {
        return false;
      }
      return (c.panel.view.state as IData).isCollapse;
    });

    const curPlaceholder = computed(() => {
      const { placeholder } = c.rawItemParams;
      return placeholder || ibiz.i18n.t('component.indexSearch.placeholder');
    });

    // 类名控制
    const classArr = computed(() => {
      const { id } = props.modelData;
      const result: Array<string | false> = [
        ns.b(),
        ns.m(id),
        ns.is('collapse', isCollapse.value),
      ];
      result.push(...props.controller.containerClass);
      return result;
    });

    // 全局搜索
    const onSearch = async () => {
      const id = props.modelData.id;
      const menuC = c.panel.view.getController('appmenu') as IAppMenuController;
      if (menuC) {
        const targetMenu = menuC.allAppMenuItems.find((item: IData) => {
          return item.id === id;
        });
        if (targetMenu) {
          const tempContext = c.panel.context.clone();
          const tempParam = c.panel.params;
          tempContext.srfappid = targetMenu.appId || ibiz.env.appId;

          await ibiz.commands.execute(
            AppFuncCommand.TAG,
            targetMenu.appFuncId,
            tempContext,
            { ...tempParam, srfquery: query.value },
            {},
          );
        }
      }
    };

    const onEnter = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        onSearch();
      }
    };

    return {
      ns,
      classArr,
      isCollapse,
      curPlaceholder,
      onInput,
      onSearch,
      c,
      query,
      menuAlign,
      onEnter,
    };
  },
  render() {
    // 动态控制显示
    if (!this.controller.state.visible) {
      return null;
    }
    return (
      <div class={this.classArr}>
        {this.menuAlign === 'LEFT' && !this.isCollapse && (
          <el-input
            model-value={this.query}
            class={this.ns.b('search')}
            placeholder={this.curPlaceholder}
            onInput={this.onInput}
            onKeyup={this.onEnter}
          >
            {{
              prefix: () => {
                return (
                  <ion-icon class={this.ns.e('search-icon')} name='search' />
                );
              },
            }}
          </el-input>
        )}
      </div>
    );
  },
});
