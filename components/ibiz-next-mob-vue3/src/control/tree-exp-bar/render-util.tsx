import { Namespace } from '@ibiz-template/core';
import { IExpBarControlController } from '@ibiz-template/runtime';
import { debounce } from 'lodash-es';
import { VNode, h, resolveComponent } from 'vue';
import { useRoute } from 'vue-router';
import {
  onRouteChange,
  route2routePath,
  useNamespace,
} from '@ibiz-template/vue3-util';
// import './render-util.scss';

/**
 * 导航栏绘制工具（标题，快速搜索）
 * @author lxm
 * @date 2023-08-02 08:06:38
 * @export
 * @param {ExpBarControlController} c
 * @param {Namespace} ns
 * @return {*}  {({ renderTitle: () => VNode | null; renderSearchBar: () => VNode | null })}
 */
export function useExpBarRender(
  c: IExpBarControlController,
  ns: Namespace,
): { renderTitle: () => VNode | null; renderSearchBar: () => VNode | null } {
  const expBarNs = useNamespace('exp-bar');

  const debounceSearch = debounce(() => {
    c.load();
  }, 500);

  const onInput = (event: InputEvent): void => {
    c.state.query = (event.target as IData)?.value;
    debounceSearch();
  };

  const renderTitle = (): VNode | null => {
    const { model } = c;
    if (!model.showTitleBar) {
      return null;
    }
    let title = model.title;
    if (model.titleLanguageRes) {
      title = ibiz.i18n.t(model.titleLanguageRes.lanResTag!, model.title);
    }
    return (
      <div class={[ns.b('caption'), expBarNs.b('caption')]}>
        {model.sysImage && (
          <iBizIcon
            class={[expBarNs.be('caption', 'icon')]}
            icon={model.sysImage}
          ></iBizIcon>
        )}
        {title && <span class={[ns.be('caption', 'text')]}>{title}</span>}
      </div>
    );
  };

  const renderSearchBar = (): VNode | null => {
    const { model } = c;
    if (!model.enableSearch) {
      return null;
    }

    const modelData = c.view.model.viewLayoutPanel?.controls?.find(
      item => item.id === 'searchbar',
    );
    if (modelData) {
      const ctrlProps = {
        context: c.context,
        params: c.params,
      };
      const comp = resolveComponent('IBizControlShell');
      return h(comp, {
        modelData,
        ...ctrlProps,
      });
    }

    return (
      <van-field
        model-value={c.state.query}
        class={[ns.b('quick-search'), expBarNs.b('quick-search')]}
        placeholder={c.state.placeHolder}
        onInput={onInput}
      >
        {{
          prefix: (): VNode => {
            return <ion-icon class={ns.e('search-icon')} name='search' />;
          },
        }}
      </van-field>
    );
  };

  return { renderTitle, renderSearchBar };
}

/**
 * 监听路由变更，当自身所处的路由变更时触发导航栏控制器onRouterChange
 * @author lxm
 * @date 2023-09-14 10:02:41
 * @export
 * @param {IExpBarControlController} c
 */
export function useWatchRouteChange(c: IExpBarControlController): void {
  const depth = c.view.modal.routeDepth;
  if (depth) {
    const route = useRoute();
    let selfKey: string | undefined;
    onRouteChange(({ currentKey, fullPath }) => {
      if (!selfKey) {
        selfKey = currentKey;
      } else if (selfKey === currentKey) {
        const routePath = route2routePath(route);
        const { srfnav } = routePath.pathNodes[depth! - 1];
        c.onRouterChange({ srfnav: srfnav || '', path: fullPath });
      }
    }, depth);
  }
}
