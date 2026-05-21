import { defineComponent, PropType } from 'vue';
import { IAppMenu, IAppMenuItem } from '@ibiz/model-core';
import { AppMenuController, IControlProvider } from '@ibiz-template/runtime';
import { useControlController, useNamespace } from '@ibiz-template/vue3-util';
import { isNil } from 'ramda';
import { isArray } from 'lodash-es';
import { useMenuRender } from '../app-menu/menu-render-util';
import './app-menu-list-view.scss';

export const AppMenuListViewControl = defineComponent({
  name: 'IBizAppMenuListViewControl',
  props: {
    modelData: { type: Object as PropType<IAppMenu>, required: true },
    context: { type: Object as PropType<IContext>, required: true },
    params: { type: Object as PropType<IParams>, default: () => ({}) },
    provider: { type: Object as PropType<IControlProvider> },
  },
  setup() {
    const c = useControlController((...args) => new AppMenuController(...args));
    const ns = useNamespace(
      `control-${c.model.controlType!.toLowerCase()}-${c.model.controlStyle?.toLowerCase()}`,
    );

    const { onCustomizedClick } = useMenuRender(c);

    const renderMenuItem = (item: IAppMenuItem) => {
      if (item.hidden === true) {
        return null;
      }
      const counterNum = item.counterId
        ? c.state.counterData[item.counterId]
        : null;
      let renderItem = null;
      switch (item.itemType) {
        case 'MENUITEM':
          if (isArray(item.appMenuItems)) {
            renderItem = (
              <van-cell-group class={ns.e('group')} title={item.caption}>
                {{
                  default: () => {
                    if (!item.appMenuItems?.length) {
                      return (
                        <div class={[ns.b('no-data')]}>
                          {ibiz.i18n.t('control.appmenu.noData')}
                        </div>
                      );
                    }
                    return item.appMenuItems?.map(child => {
                      return renderMenuItem(child);
                    });
                  },
                  title: () => {
                    return (
                      <div class={ns.e('group-title')}>
                        {item.sysImage ? (
                          <iBizIcon icon={item.sysImage}></iBizIcon>
                        ) : null}
                        <span class={ns.em('group-title', 'caption')}>
                          {item.caption}
                        </span>
                        {!isNil(counterNum) && (
                          <iBizBadge
                            class={ns.em('group-title', 'counter')}
                            value={counterNum}
                          />
                        )}
                      </div>
                    );
                  },
                }}
              </van-cell-group>
            );
          } else {
            renderItem = (
              <van-cell
                class={[ns.e('item')]}
                is-link
                center
                clickable
                title={item.caption}
                onClick={async (event: MouseEvent) => {
                  await c.onClickMenuItem(item.id!, event, false);
                }}
              >
                {{
                  icon: () => {
                    return (
                      item.sysImage && (
                        <div class={ns.em('item', 'icon')}>
                          <iBizIcon icon={item.sysImage}></iBizIcon>
                        </div>
                      )
                    );
                  },
                  value: () => {
                    return (
                      <div class={ns.em('item', 'value')}>
                        {!isNil(counterNum) && (
                          <iBizBadge
                            class={ns.em('item', 'counter')}
                            value={counterNum}
                          />
                        )}
                      </div>
                    );
                  },
                }}
              </van-cell>
            );
          }
          break;
        case 'SEPERATOR':
          renderItem = <van-divider />;
          break;
        default:
          break;
      }
      return renderItem;
    };

    return {
      c,
      ns,
      renderMenuItem,
      onCustomizedClick,
    };
  },

  render() {
    const { model, state } = this.c;
    if (!state.isCreated) return;

    return (
      <div
        class={[this.ns.b(), this.ns.m(this.modelData.id?.toLocaleLowerCase())]}
      >
        <van-list>
          {state.mobMenuItems.map(item => this.renderMenuItem(item))}
        </van-list>
        {model.enableCustomized && (
          <iBizFloatButton
            class={this.ns.e('icon-container')}
            align={this.c.customizedAlign}
            onClick={this.onCustomizedClick}
          />
        )}
      </div>
    );
  },
});
